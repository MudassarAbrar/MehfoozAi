/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * MehfoozAi Unified Data Layer
 *
 * Dual-mode persistence (same pattern as auth.ts):
 * - SUPABASE MODE: vault incidents and complaint drafts are stored as
 *   AES-GCM-256 CIPHERTEXT ONLY (zero-knowledge — the server never sees
 *   plaintext notes), with a decrypted localStorage mirror for instant
 *   offline reload. Emergency contacts sync to the emergency_contacts table.
 * - LEGACY MODE: everything stays in localStorage exactly as before.
 *
 * Vault passcode policy: each device generates a random vault key on first
 * use (`mehfooz_device_vault_key_v1`). There is no hardcoded passcode.
 * Limitation (documented honestly): records encrypted on one device cannot
 * be decrypted on another — the same effective boundary as the original
 * local-only app, while the server-side copy is now ciphertext-only.
 */

import { VaultRecord, ComplaintDraft, UserContact } from '../types';
import { isSupabaseConfigured, getSupabase } from './supabase';
import { generateRandomSalt, encryptLocalData, decryptLocalData } from './crypto';

const VAULT_LOCAL_KEY = 'mehfooz_vault_records_v1';
const DRAFTS_LOCAL_KEY = 'mehfooz_complaint_drafts_v1';
const CONTACTS_LOCAL_KEY = 'mehfooz_user_contacts_v1';
const DEVICE_VAULT_KEY = 'mehfooz_device_vault_key_v1';

/** Per-device random vault passcode (replaces the old hardcoded constant). */
export function getDeviceVaultPasscode(): string {
  try {
    const existing = localStorage.getItem(DEVICE_VAULT_KEY);
    if (existing && existing.length >= 32) return existing;
    const fresh = generateRandomSalt();
    localStorage.setItem(DEVICE_VAULT_KEY, fresh);
    return fresh;
  } catch {
    // Non-persistent fallback: random per session (still never a constant).
    return generateRandomSalt();
  }
}

async function getAuthenticatedUserId(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabase()!;
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.id || null;
  } catch {
    return null;
  }
}

// =====================================================================
// VAULT RECORDS (incidents)
// =====================================================================

/** Payload that gets encrypted before leaving the device. */
interface VaultCipherPayload {
  title: string;
  note: string;
  location?: string;
  witnesses?: string;
  incidentTime: string;
  hasPhoto: boolean;
  photoUrl?: string;
  audioDuration?: number;
  isLinkedToComplaint?: boolean;
  attachments?: string[];
}

function recordToCipherPayload(record: VaultRecord): VaultCipherPayload {
  return {
    title: record.title,
    note: record.note,
    location: record.location,
    witnesses: record.witnesses,
    incidentTime: record.incidentTime,
    hasPhoto: record.hasPhoto,
    photoUrl: record.photoUrl,
    audioDuration: record.audioDuration,
    isLinkedToComplaint: record.isLinkedToComplaint,
    attachments: record.attachments
  };
}

/**
 * Loads vault records: Supabase ciphertext (decrypted on-device) when
 * configured, otherwise the localStorage mirror.
 */
export async function loadVaultRecords(): Promise<VaultRecord[]> {
  const mirror = readLocalList<VaultRecord>(VAULT_LOCAL_KEY);

  const userId = await getAuthenticatedUserId();
  if (!userId) return mirror;

  const supabase = getSupabase()!;
  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.warn('Vault remote load failed, using local mirror:', error?.message);
    return mirror;
  }

  const passcode = getDeviceVaultPasscode();
  const records: VaultRecord[] = [];
  for (const row of data as Record<string, unknown>[]) {
    const base: VaultRecord = {
      id: `rec-${String(row.id)}`,
      remoteId: String(row.id),
      createdAt: String(row.created_at),
      updatedAt: String(row.created_at),
      incidentDate: row.occurred_at ? String(row.occurred_at).slice(0, 10) : String(row.created_at).slice(0, 10),
      incidentTime: '12:00',
      category: (row.incident_type as VaultRecord['category']) || 'domestic_violence',
      title: 'Encrypted Record',
      note: '',
      encrypted: true,
      hasPhoto: false
    };
    try {
      const plain = await decryptLocalData(String(row.cipher_text), String(row.iv), passcode);
      const payload = JSON.parse(plain) as VaultCipherPayload;
      records.push({
        ...base,
        title: payload.title,
        note: payload.note,
        location: payload.location,
        witnesses: payload.witnesses,
        incidentTime: payload.incidentTime || '12:00',
        hasPhoto: payload.hasPhoto ?? false,
        photoUrl: payload.photoUrl,
        audioDuration: payload.audioDuration,
        isLinkedToComplaint: payload.isLinkedToComplaint,
        attachments: payload.attachments,
        locked: false
      });
    } catch {
      // Encrypted on another device / wrong key — keep a locked stub.
      records.push({ ...base, locked: true, note: '[Locked — encrypted on another device]' });
    }
  }

  if (records.length > 0) {
    writeLocalList(VAULT_LOCAL_KEY, records);
    return records;
  }
  // Remote empty: keep whatever local mirror exists (may include demo seeds).
  return mirror;
}

/**
 * Persists the full vault record list: upserts changed/new records to
 * Supabase (encrypted), deletes removed rows, and mirrors locally.
 * Returns the list with remoteId fields populated.
 */
export async function persistVaultRecords(records: VaultRecord[]): Promise<VaultRecord[]> {
  writeLocalList(VAULT_LOCAL_KEY, records);

  const userId = await getAuthenticatedUserId();
  if (!userId) return records;

  const supabase = getSupabase()!;
  const passcode = getDeviceVaultPasscode();
  const synced: VaultRecord[] = [];

  for (const record of records) {
    if (record.locked && record.remoteId) {
      // Cannot re-encrypt a locked stub — keep it as-is remotely.
      synced.push(record);
      continue;
    }
    try {
      const { cipherText, iv, salt } = await encryptLocalData(
        JSON.stringify(recordToCipherPayload(record)),
        passcode
      );
      const row = {
        user_id: userId,
        incident_type: record.category,
        title: 'Encrypted Record',
        cipher_text: cipherText,
        iv,
        salt,
        occurred_at: record.incidentDate ? new Date(`${record.incidentDate}T00:00:00`).toISOString() : null
      };
      if (record.remoteId) {
        const { error } = await supabase.from('incidents').update(row).eq('id', record.remoteId);
        if (error) console.warn('Vault record update failed:', error.message);
        synced.push(record);
      } else {
        const { data, error } = await supabase.from('incidents').insert(row).select('id').single();
        if (error) {
          console.warn('Vault record insert failed:', error.message);
          synced.push(record);
        } else {
          synced.push({ ...record, remoteId: String((data as Record<string, unknown>).id) });
        }
      }
    } catch (err) {
      console.warn('Vault encryption failed, keeping record local-only:', err);
      synced.push(record);
    }
  }

  // Delete remote rows that are no longer in the list.
  const keepIds = synced.filter(r => r.remoteId).map(r => r.remoteId);
  if (keepIds.length > 0) {
    const { error } = await supabase.from('incidents').delete().eq('user_id', userId).not('id', 'in', `(${keepIds.join(',')})`);
    if (error) console.warn('Vault remote cleanup failed:', error.message);
  } else {
    const { error } = await supabase.from('incidents').delete().eq('user_id', userId);
    if (error) console.warn('Vault remote cleanup failed:', error.message);
  }

  writeLocalList(VAULT_LOCAL_KEY, synced);
  return synced;
}

// =====================================================================
// COMPLAINT DRAFTS (complaints)
// =====================================================================

/** Maps a ComplaintDraft stage to a complaints.status value. */
function stageToStatus(stage: ComplaintDraft['stage']): 'draft' | 'submitted' | 'under_review' | 'resolved' {
  if (['submitted_by_user', 'reference_saved', 'officially_received'].includes(stage)) return 'submitted';
  if (stage === 'under_review') return 'under_review';
  if (stage === 'closed') return 'resolved';
  return 'draft';
}

/**
 * Loads complaint drafts: Supabase ciphertext (decrypted on-device) when
 * configured, otherwise the localStorage mirror.
 */
export async function loadComplaintDrafts(): Promise<ComplaintDraft[]> {
  const mirror = readLocalList<ComplaintDraft>(DRAFTS_LOCAL_KEY);

  const userId = await getAuthenticatedUserId();
  if (!userId) return mirror;

  const supabase = getSupabase()!;
  const { data, error } = await supabase
    .from('complaints')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.warn('Complaints remote load failed, using local mirror:', error?.message);
    return mirror;
  }

  const passcode = getDeviceVaultPasscode();
  const drafts: ComplaintDraft[] = [];
  for (const row of data as Record<string, unknown>[]) {
    if (!row.cipher_text || !row.iv) continue;
    try {
      const plain = await decryptLocalData(String(row.cipher_text), String(row.iv), passcode);
      const draft = JSON.parse(plain) as ComplaintDraft;
      drafts.push({ ...draft, remoteId: String(row.id) });
    } catch {
      console.warn('Complaint draft could not be decrypted on this device, skipping.');
    }
  }

  if (drafts.length > 0) {
    writeLocalList(DRAFTS_LOCAL_KEY, drafts);
    return drafts;
  }
  return mirror;
}

/**
 * Persists the full complaint draft list (same diff strategy as the vault):
 * new drafts are inserted encrypted, existing remoteIds are updated, and
 * removed rows are deleted. The full list is mirrored to localStorage.
 */
export async function persistComplaintDrafts(drafts: ComplaintDraft[]): Promise<ComplaintDraft[]> {
  writeLocalList(DRAFTS_LOCAL_KEY, drafts);

  const userId = await getAuthenticatedUserId();
  if (!userId) return drafts;

  const supabase = getSupabase()!;
  const passcode = getDeviceVaultPasscode();
  const synced: ComplaintDraft[] = [];

  for (const draft of drafts) {
    try {
      const { cipherText, iv } = await encryptLocalData(JSON.stringify(draft), passcode);
      const row = {
        user_id: userId,
        tracking_number: draft.officialReferenceNumber || null,
        status: stageToStatus(draft.stage),
        stage: draft.stage,
        category: draft.category,
        district: draft.district,
        // Non-sensitive routing metadata ONLY (never the complaint body).
        summary_plain: `${draft.category} | ${draft.district} | ${draft.stage}`,
        cipher_text: cipherText,
        iv,
        is_mock_handoff: draft.isMockHandoff ?? false,
        delivery_status: draft.officialReferenceNumber ? 'dispatched' : 'local_only'
      };
      if (draft.remoteId) {
        const { error } = await supabase.from('complaints').update(row).eq('id', draft.remoteId);
        if (error) console.warn('Complaint update failed:', error.message);
        synced.push(draft);
      } else {
        const { data, error } = await supabase.from('complaints').insert(row).select('id').single();
        if (error) {
          console.warn('Complaint insert failed:', error.message);
          synced.push(draft);
        } else {
          synced.push({ ...draft, remoteId: String((data as Record<string, unknown>).id) });
        }
      }
    } catch (err) {
      console.warn('Complaint encryption failed, keeping draft local-only:', err);
      synced.push(draft);
    }
  }

  const keepIds = synced.filter(d => d.remoteId).map(d => d.remoteId);
  if (keepIds.length > 0) {
    const { error } = await supabase.from('complaints').delete().eq('user_id', userId).not('id', 'in', `(${keepIds.join(',')})`);
    if (error) console.warn('Complaints remote cleanup failed:', error.message);
  } else {
    const { error } = await supabase.from('complaints').delete().eq('user_id', userId);
    if (error) console.warn('Complaints remote cleanup failed:', error.message);
  }

  writeLocalList(DRAFTS_LOCAL_KEY, synced);
  return synced;
}

// =====================================================================
// EMERGENCY CONTACTS
// =====================================================================

/** Loads contacts from Supabase (when configured) or the local mirror. */
export async function loadContacts(): Promise<UserContact[]> {
  const mirror = readLocalList<UserContact>(CONTACTS_LOCAL_KEY);
  const userId = await getAuthenticatedUserId();
  if (!userId) return mirror;

  const supabase = getSupabase()!;
  const { data, error } = await supabase
    .from('emergency_contacts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error || !data) return mirror;
  if (data.length === 0) return mirror;

  const contacts: UserContact[] = (data as Record<string, unknown>[]).map(r => ({
    id: String(r.id),
    name: String(r.name || ''),
    relation: String(r.relation || 'Contact'),
    phone: String(r.phone || ''),
    email: r.email ? String(r.email) : undefined,
    isEmergencyContact: Boolean(r.is_emergency_contact),
    isDefaultNotified: Boolean(r.is_default_notified)
  }));
  writeLocalList(CONTACTS_LOCAL_KEY, contacts);
  return contacts;
}

/** Mirrors contacts locally and replaces the Supabase rows when configured. */
export async function persistContacts(contacts: UserContact[]): Promise<void> {
  writeLocalList(CONTACTS_LOCAL_KEY, contacts);

  const userId = await getAuthenticatedUserId();
  if (!userId) return;

  const supabase = getSupabase()!;
  const { error: delError } = await supabase.from('emergency_contacts').delete().eq('user_id', userId);
  if (delError) {
    console.warn('Contacts remote replace failed:', delError.message);
    return;
  }
  const rows = contacts
    .filter(c => c.name?.trim() && c.phone?.trim())
    .map(c => ({
      user_id: userId,
      name: c.name.trim(),
      relation: c.relation || 'Contact',
      phone: c.phone.trim(),
      email: c.email || null,
      is_default_notified: c.isDefaultNotified ?? false,
      is_emergency_contact: c.isEmergencyContact ?? true
    }));
  if (rows.length > 0) {
    const { error } = await supabase.from('emergency_contacts').insert(rows);
    if (error) console.warn('Contacts remote insert failed:', error.message);
  }
}

// =====================================================================
// LOCAL STORAGE HELPERS
// =====================================================================

function readLocalList<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function writeLocalList<T>(key: string, list: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch (err) {
    console.warn(`Failed to mirror list to ${key}:`, err);
  }
}
