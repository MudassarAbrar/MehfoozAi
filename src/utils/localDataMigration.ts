/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * One-time legacy data migration: pushes pre-Supabase localStorage records
 * (vault records, complaint drafts, emergency contacts) into the user's
 * Supabase tables on their first authenticated session, then offers a purge
 * of the local plaintext copies.
 */

import { VaultRecord, ComplaintDraft, UserContact } from '../types';
import { isSupabaseConfigured, getSupabase } from './supabase';
import { persistVaultRecords, persistComplaintDrafts, persistContacts } from './dataService';

const MIGRATION_FLAG_KEY = 'mehfooz_local_migration_done_v1';

export interface MigrationResult {
  migrated: boolean;
  counts: { vault: number; drafts: number; contacts: number };
  skippedReason?: string;
}

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

async function hasRemoteData(userId: string): Promise<boolean> {
  const supabase = getSupabase()!;
  const [{ count: incidents }, { count: complaints }] = await Promise.all([
    supabase.from('incidents').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('complaints').select('id', { count: 'exact', head: true }).eq('user_id', userId)
  ]);
  return (incidents ?? 0) > 0 || (complaints ?? 0) > 0;
}

/**
 * Runs the one-time localStorage → Supabase migration for the signed-in
 * user. Safe to call on every boot: it no-ops when Supabase is not
 * configured, nobody is signed in, the migration already ran, or the remote
 * already holds data (remote wins — no duplicates are ever created).
 */
export async function migrateLocalDataToSupabase(): Promise<MigrationResult> {
  const counts = { vault: 0, drafts: 0, contacts: 0 };

  if (!isSupabaseConfigured()) {
    return { migrated: false, counts, skippedReason: 'supabase_not_configured' };
  }

  try {
    if (localStorage.getItem(MIGRATION_FLAG_KEY) === 'true') {
      return { migrated: false, counts, skippedReason: 'already_migrated' };
    }

    const supabase = getSupabase()!;
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user?.id;
    if (!userId) {
      return { migrated: false, counts, skippedReason: 'not_authenticated' };
    }

    const vault = readLocalList<VaultRecord>('mehfooz_vault_records_v1');
    const drafts = readLocalList<ComplaintDraft>('mehfooz_complaint_drafts_v1');
    const contacts = readLocalList<UserContact>('mehfooz_user_contacts_v1');

    if (vault.length === 0 && drafts.length === 0 && contacts.length === 0) {
      localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
      return { migrated: false, counts, skippedReason: 'no_local_data' };
    }

    // Remote data wins: never overwrite an existing Supabase history.
    if (await hasRemoteData(userId)) {
      localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
      return { migrated: false, counts, skippedReason: 'remote_already_populated' };
    }

    if (vault.length > 0) {
      const synced = await persistVaultRecords(vault);
      counts.vault = synced.filter(r => r.remoteId).length;
    }
    if (drafts.length > 0) {
      const synced = await persistComplaintDrafts(drafts);
      counts.drafts = synced.filter(d => d.remoteId).length;
    }
    if (contacts.length > 0) {
      await persistContacts(contacts);
      counts.contacts = contacts.length;
    }

    localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
    return { migrated: true, counts };
  } catch (err) {
    console.warn('Local data migration failed (will retry next boot):', err);
    return { migrated: false, counts, skippedReason: 'error' };
  }
}

/** Counts legacy plaintext records still sitting in localStorage. */
export function countLocalLegacyData(): { vault: number; drafts: number; contacts: number } {
  return {
    vault: readLocalList<VaultRecord>('mehfooz_vault_records_v1').length,
    drafts: readLocalList<ComplaintDraft>('mehfooz_complaint_drafts_v1').length,
    contacts: readLocalList<UserContact>('mehfooz_user_contacts_v1').length
  };
}

/** Removes the plaintext localStorage mirrors (offered after migration). */
export function purgeLocalLegacyData(): void {
  try {
    localStorage.removeItem('mehfooz_vault_records_v1');
    localStorage.removeItem('mehfooz_complaint_drafts_v1');
    localStorage.removeItem('mehfooz_user_contacts_v1');
    localStorage.removeItem('mehfooz_encrypted_vault_v1');
  } catch (err) {
    console.warn('Local legacy purge failed:', err);
  }
}
