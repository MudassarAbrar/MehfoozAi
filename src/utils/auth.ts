/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * MehfoozAi Authentication Layer
 *
 * Dual-mode engine:
 * - SUPABASE MODE (active when VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY are set):
 *   real email/password auth via Supabase Auth, profile persisted in
 *   public.profiles, emergency contacts in public.emergency_contacts,
 *   stealth PIN stored ONLY as a salted SHA-256 hash (never plaintext).
 * - LEGACY MODE (offline / no credentials): the original localStorage engine
 *   is preserved unchanged so `npm run dev` works without any configuration.
 *
 * All exported signatures are kept compatible with the original module.
 */

import { UserProfile, PunjabDistrict, AppLanguage, UserContact } from '../types';
import { isSupabaseConfigured, getSupabase } from './supabase';
import { generateRandomSalt, setVaultSalt, hashPin, clearCachedKey } from './crypto';
import type { SupabaseClient, User as SupabaseAuthUser } from '@supabase/supabase-js';

const STORAGE_USERS_KEY = 'mehfooz_registered_users_v1';
const STORAGE_SESSION_KEY = 'mehfooz_current_session_v1';
const PROFILE_CACHE_KEY = 'mehfooz_profile_cache_v1';
const PIN_HASH_CACHE_KEY = 'mehfooz_pin_hash';
const PIN_SALT_CACHE_KEY = 'mehfooz_pin_salt';
const SUPABASE_SESSION_PREFIX = 'sb-';
const SUPABASE_SESSION_SUFFIX = '-auth-token';

// Seed demo account (LEGACY offline mode only — in Supabase mode the demo
// account is provisioned in Supabase Auth by the operator, see README).
const INITIAL_DEMO_USER: UserProfile = {
  id: 'user-demo-001',
  email: 'demo@mehfooz.test',
  fullName: 'Ayesha Rehman',
  safeNickname: 'Ayesha',
  district: 'Lahore',
  phone: '+92 300 1234567',
  emergencyContactName: 'Fatima Noor (Sister)',
  emergencyContactPhone: '+92 321 9876543',
  emergencyContacts: [
    { id: 'c1', name: 'Protiva (Mom)', relation: 'Mother', phone: '+92 300 1234567', isDefaultNotified: true },
    { id: 'c2', name: 'Subodh (Father)', relation: 'Father', phone: '+92 321 9876543', isDefaultNotified: true }
  ],
  preferredLanguage: 'en',
  themeMode: 'light',
  stealthPin: '1520',
  discreetNotifications: true,
  quickExitHotkey: 'Escape',
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
};

interface ProfileRow {
  id: string;
  email: string;
  full_name: string;
  safe_nickname: string | null;
  district: string | null;
  phone: string | null;
  preferred_language: 'en' | 'ur';
  theme_mode: string;
  stealth_pin_hash: string | null;
  pin_salt: string | null;
  vault_salt: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  discreet_notifications: boolean;
  quick_exit_hotkey: string;
  created_at: string;
  updated_at: string;
}

function isSupabaseMode(): boolean {
  return isSupabaseConfigured() && getSupabase() !== null;
}

// =====================================================================
// LEGACY (localStorage) ENGINE — preserved for offline fallback
// =====================================================================

// LEGACY static-salt password hash — kept ONLY to verify accounts created
// before per-user salts existed (those records are upgraded on next login).
async function hashPassword(password: string): Promise<string> {
  try {
    const enc = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', enc.encode(password + '_mehfooz_salt_2026'));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return btoa(password + '_salt');
  }
}

interface StoredUserRecord {
  profile: UserProfile;
  passwordHash: string;
  /** Per-user salt (new records); absent on legacy static-salt records. */
  salt?: string;
}

function getStoredUsers(): Record<string, StoredUserRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveStoredUsers(users: Record<string, StoredUserRecord>): void {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save user repository:', err);
  }
}

// =====================================================================
// SUPABASE MODE HELPERS
// =====================================================================

function cacheProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.warn('Failed to cache profile:', err);
  }
}

function clearProfileCache(): void {
  try {
    localStorage.removeItem(PROFILE_CACHE_KEY);
  } catch {
    /* noop */
  }
}

function cachePinLocally(pinHash: string, pinSalt: string): void {
  try {
    localStorage.setItem(PIN_HASH_CACHE_KEY, pinHash);
    localStorage.setItem(PIN_SALT_CACHE_KEY, pinSalt);
  } catch (err) {
    console.warn('Failed to cache PIN hash:', err);
  }
}

function clearPinCache(): void {
  try {
    localStorage.removeItem(PIN_HASH_CACHE_KEY);
    localStorage.removeItem(PIN_SALT_CACHE_KEY);
    localStorage.removeItem('mehfooz_custom_pin');
  } catch {
    /* noop */
  }
}

function mapRowToProfile(row: ProfileRow, contacts: UserContact[]): UserProfile {
  const fallbackContacts: UserContact[] =
    row.emergency_contact_name && row.emergency_contact_phone
      ? [{
          id: 'primary',
          name: row.emergency_contact_name,
          relation: 'Emergency',
          phone: row.emergency_contact_phone,
          isDefaultNotified: true
        }]
      : [];

  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name || 'Mehfooz User',
    safeNickname: row.safe_nickname || (row.full_name ? row.full_name.split(' ')[0] : 'Friend'),
    district: (row.district as PunjabDistrict) || 'Other Punjab District',
    phone: row.phone || '',
    emergencyContactName: row.emergency_contact_name || '',
    emergencyContactPhone: row.emergency_contact_phone || '',
    emergencyContacts: contacts.length > 0 ? contacts : fallbackContacts,
    preferredLanguage: row.preferred_language === 'ur' ? 'ur' : 'en',
    themeMode: row.theme_mode === 'dark' ? 'dark' : 'light',
    // The PIN itself is never returned from the server (hash-only storage);
    // an empty string makes profile forms fall back to their placeholder.
    stealthPin: '',
    discreetNotifications: row.discreet_notifications,
    quickExitHotkey: row.quick_exit_hotkey || 'Escape',
    createdAt: row.created_at,
    lastLoginAt: new Date().toISOString()
  };
}

async function fetchContacts(supabase: SupabaseClient, userId: string): Promise<UserContact[]> {
  const { data, error } = await supabase
    .from('emergency_contacts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error || !data) return [];
  return (data as Record<string, unknown>[]).map(r => ({
    id: String(r.id),
    name: String(r.name || 'Contact'),
    relation: String(r.relation || 'Contact'),
    phone: String(r.phone || ''),
    isDefaultNotified: Boolean(r.is_default_notified)
  }));
}

/**
 * Loads the profiles row for an authenticated user, creating a skeleton row
 * if the signup trigger did not run (e.g. users provisioned before migration).
 */
async function ensureProfileRow(supabase: SupabaseClient, authUser: SupabaseAuthUser): Promise<ProfileRow> {
  const { data } = await supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle();
  if (data) return data as unknown as ProfileRow;

  const meta = (authUser.user_metadata || {}) as Record<string, string>;
  const skeleton = {
    id: authUser.id,
    email: authUser.email || '',
    full_name: meta.full_name || 'Mehfooz User',
    district: meta.district || null,
    phone: meta.phone || null,
    preferred_language: meta.preferred_language === 'ur' ? 'ur' : 'en'
  };
  const { data: inserted, error } = await supabase
    .from('profiles')
    .upsert(skeleton)
    .select()
    .single();
  if (error || !inserted) {
    throw new Error(error?.message || 'Failed to load user profile.');
  }
  return inserted as unknown as ProfileRow;
}

/** Loads profile + contacts and refreshes the local caches (PIN hash, vault salt). */
async function loadFullProfile(supabase: SupabaseClient, authUser: SupabaseAuthUser): Promise<UserProfile> {
  const row = await ensureProfileRow(supabase, authUser);
  const contacts = await fetchContacts(supabase, authUser.id);
  const profile = mapRowToProfile(row, contacts);

  if (row.vault_salt) setVaultSalt(row.vault_salt);
  if (row.stealth_pin_hash && row.pin_salt) cachePinLocally(row.stealth_pin_hash, row.pin_salt);
  cacheProfile(profile);
  return profile;
}

async function syncContactsToSupabase(supabase: SupabaseClient, userId: string, contacts: UserContact[]): Promise<void> {
  await supabase.from('emergency_contacts').delete().eq('user_id', userId);
  const rows = contacts
    .filter(c => c.name?.trim() && c.phone?.trim())
    .map(c => ({
      user_id: userId,
      name: c.name.trim(),
      relation: c.relation || 'Contact',
      phone: c.phone.trim(),
      is_default_notified: c.isDefaultNotified ?? false,
      is_emergency_contact: true
    }));
  if (rows.length > 0) {
    await supabase.from('emergency_contacts').insert(rows);
  }
}

/** Fire-and-forget profile sync used by the (synchronous) updateStoredProfile. */
async function syncProfileToSupabase(updated: UserProfile): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const { data: sessionData } = await supabase.auth.getSession();
  const authUser = sessionData.session?.user;
  if (!authUser) return;

  const { data: existing } = await supabase.from('profiles').select('stealth_pin_hash, pin_salt').eq('id', authUser.id).maybeSingle();
  const existingRow = existing as { stealth_pin_hash: string | null; pin_salt: string | null } | null;

  const values: Record<string, unknown> = {
    full_name: updated.fullName,
    safe_nickname: updated.safeNickname,
    district: updated.district,
    phone: updated.phone,
    preferred_language: updated.preferredLanguage,
    theme_mode: updated.themeMode,
    emergency_contact_name: updated.emergencyContacts[0]?.name || '',
    emergency_contact_phone: updated.emergencyContacts[0]?.phone || '',
    discreet_notifications: updated.discreetNotifications,
    quick_exit_hotkey: updated.quickExitHotkey || 'Escape'
  };

  // Re-hash the stealth PIN whenever it changed (plaintext PINs never leave the device).
  const cached = getStoredProfile();
  const pinChanged = updated.stealthPin && updated.stealthPin !== cached?.stealthPin;
  if (pinChanged) {
    const pinSalt = existingRow?.pin_salt || generateRandomSalt();
    values.stealth_pin_hash = await hashPin(updated.stealthPin, pinSalt);
    values.pin_salt = pinSalt;
    cachePinLocally(values.stealth_pin_hash as string, pinSalt);
  }

  const { error } = await supabase.from('profiles').update(values).eq('id', authUser.id);
  if (error) {
    console.error('Supabase profile sync failed:', error.message);
    return;
  }

  await syncContactsToSupabase(supabase, authUser.id, updated.emergencyContacts || []);
}

function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Invalid email or password. Please try again.';
  if (m.includes('email not confirmed')) return 'Please confirm your email address first (check your inbox).';
  if (m.includes('already registered') || m.includes('already exists')) return 'An account with this email already exists. Please log in.';
  if (m.includes('password should be at least')) return 'Password must be at least 6 characters long.';
  if (m.includes('rate limit')) return 'Too many attempts. Please wait a moment and try again.';
  return message;
}

// =====================================================================
// PUBLIC API (signatures preserved from the original module)
// =====================================================================

/** Returns the active Supabase access token, or the legacy session marker. */
export function getStoredSessionToken(): string | null {
  if (isSupabaseMode()) {
    try {
      // supabase-js persists the session under "sb-<ref>-auth-token".
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(SUPABASE_SESSION_PREFIX) && key.endsWith(SUPABASE_SESSION_SUFFIX)) {
          const raw = localStorage.getItem(key);
          if (!raw) continue;
          const parsed = JSON.parse(raw) as { access_token?: string; expires_at?: number };
          if (parsed.access_token && (!parsed.expires_at || parsed.expires_at * 1000 > Date.now())) {
            return parsed.access_token;
          }
        }
      }
      return null;
    } catch {
      return null;
    }
  }
  try {
    return localStorage.getItem(STORAGE_SESSION_KEY);
  } catch {
    return null;
  }
}

/** JSON headers plus the Supabase Bearer token when a session exists. */
export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  try {
    const token = getStoredSessionToken();
    // Only Supabase JWTs are forwarded (legacy mode stores an email marker).
    if (token && token.startsWith('eyJ')) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch {
    /* guest mode */
  }
  return headers;
}

/** Synchronous profile read (served from the local cache in Supabase mode). */
export function getStoredProfile(): UserProfile | null {
  if (isSupabaseMode()) {
    try {
      const raw = localStorage.getItem(PROFILE_CACHE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as UserProfile;
    } catch {
      return null;
    }
  }
  try {
    const sessionEmail = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!sessionEmail) return null;
    const users = getStoredUsers();
    if (users[sessionEmail.toLowerCase()]) {
      return users[sessionEmail.toLowerCase()].profile;
    }
  } catch {
    return null;
  }
  return null;
}

/** Verifies a candidate stealth PIN against the cached salted hash. */
export async function verifyStealthPin(pin: string): Promise<boolean> {
  try {
    // Primary path: salted hash comparison (Supabase mode or migrated legacy).
    const pinHash = localStorage.getItem(PIN_HASH_CACHE_KEY);
    const pinSalt = localStorage.getItem(PIN_SALT_CACHE_KEY);
    if (pinHash && pinSalt) {
      return (await hashPin(pin, pinSalt)) === pinHash;
    }

    // Legacy migration: if the profile still has a plaintext stealth PIN,
    // compare directly, then migrate to a salted hash for future verifications.
    const profile = getStoredProfile();
    if (profile?.stealthPin) {
      if (pin === profile.stealthPin) {
        // Migrate: generate salt, hash the PIN, and cache for future use.
        const migratedSalt = generateRandomSalt();
        const migratedHash = await hashPin(pin, migratedSalt);
        cachePinLocally(migratedHash, migratedSalt);
        return true;
      }
      return false;
    }

    // Guest mode: no PIN has been set, so there is nothing to verify against.
    // (The universal '1234'/'0000' demo backdoor was removed — it let anyone
    // unlock the app on any device.)
    return false;
  } catch {
    return false;
  }
}

export async function initializeAuth(): Promise<UserProfile | null> {
  if (isSupabaseMode()) {
    const supabase = getSupabase()!;
    try {
      // Handle email confirmation redirect — Supabase sends #access_token=... in the URL hash
      const hash = window.location.hash;
      if (hash && hash.includes('access_token=')) {
        const params = new URLSearchParams(hash.replace('#', ''));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (!error) {
            // Clean up the URL hash so it doesn't persist on refresh
            window.history.replaceState(null, '', window.location.pathname);
          }
        }
      }

      const { data } = await supabase.auth.getSession();
      if (!data.session?.user) {
        clearProfileCache();
        return null;
      }
      return await loadFullProfile(supabase, data.session.user);
    } catch (err) {
      console.warn('Supabase session restore failed:', err);
      return getStoredProfile();
    }
  }

  // LEGACY MODE — ensure default demo user exists, then check active session
  const users = getStoredUsers();
  if (!users[INITIAL_DEMO_USER.email.toLowerCase()]) {
    const demoSalt = generateRandomSalt();
    users[INITIAL_DEMO_USER.email.toLowerCase()] = {
      profile: INITIAL_DEMO_USER,
      passwordHash: await hashPin('Mehfooz2026!', demoSalt),
      salt: demoSalt,
    };
    saveStoredUsers(users);
  }

  try {
    const sessionEmail = localStorage.getItem(STORAGE_SESSION_KEY);
    if (sessionEmail && users[sessionEmail.toLowerCase()]) {
      return users[sessionEmail.toLowerCase()].profile;
    }
  } catch (e) {
    console.warn('Session read error:', e);
  }
  return null;
}

export async function loginUser(email: string, password: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  if (isSupabaseMode()) {
    const supabase = getSupabase()!;
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });
    if (error) {
      return { success: false, error: friendlyAuthError(error.message) };
    }
    try {
      const profile = await loadFullProfile(supabase, data.user);
      return { success: true, user: profile };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to load profile after login.' };
    }
  }

  // LEGACY MODE
  const users = getStoredUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const userRecord = users[normalizedEmail];

  if (!userRecord) {
    return { success: false, error: 'No account found with this email address.' };
  }

  // Per-user salted hash when present; legacy static-salt hash otherwise.
  const inputHash = userRecord.salt
    ? await hashPin(password, userRecord.salt)
    : await hashPassword(password);
  if (userRecord.passwordHash !== inputHash) {
    return { success: false, error: 'Invalid password. Please try again.' };
  }

  // Transparent upgrade: migrate legacy static-salt records to a per-user salt.
  if (!userRecord.salt) {
    const upgradeSalt = generateRandomSalt();
    users[normalizedEmail].passwordHash = await hashPin(password, upgradeSalt);
    users[normalizedEmail].salt = upgradeSalt;
  }

  const updatedProfile: UserProfile = {
    ...userRecord.profile,
    lastLoginAt: new Date().toISOString(),
  };

  users[normalizedEmail].profile = updatedProfile;
  saveStoredUsers(users);
  localStorage.setItem(STORAGE_SESSION_KEY, normalizedEmail);

  return { success: true, user: updatedProfile };
}

export async function signUpUser(params: {
  email: string;
  password: string;
  fullName: string;
  district: PunjabDistrict;
  phone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  stealthPin?: string;
  preferredLanguage?: AppLanguage;
}): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  if (params.password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  if (isSupabaseMode()) {
    const supabase = getSupabase()!;
    const normalizedEmail = params.email.trim().toLowerCase();
    const stealthPin = params.stealthPin?.trim() || '1520';
    const pinSalt = generateRandomSalt();
    const pinHash = await hashPin(stealthPin, pinSalt);
    const vaultSalt = generateRandomSalt();

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: params.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: params.fullName.trim(),
          district: params.district,
          phone: params.phone?.trim() || '',
          preferred_language: params.preferredLanguage || 'en',
          emergency_contact_name: params.emergencyContactName?.trim() || '',
          emergency_contact_phone: params.emergencyContactPhone?.trim() || ''
        }
      }
    });
    if (error) {
      return { success: false, error: friendlyAuthError(error.message) };
    }
    if (!data.session || !data.user) {
      // Email confirmation is enabled on the project — account exists but is locked.
      return { success: false, error: 'Account created. Please confirm your email address (check your inbox), then sign in.' };
    }

    try {
      // The DB trigger inserts a skeleton row; enrich it with the full details.
      const { error: upsertError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        email: normalizedEmail,
        full_name: params.fullName.trim(),
        safe_nickname: params.fullName.trim().split(' ')[0],
        district: params.district,
        phone: params.phone?.trim() || '',
        preferred_language: params.preferredLanguage || 'en',
        stealth_pin_hash: pinHash,
        pin_salt: pinSalt,
        vault_salt: vaultSalt,
        emergency_contact_name: params.emergencyContactName?.trim() || '',
        emergency_contact_phone: params.emergencyContactPhone?.trim() || ''
      });
      if (upsertError) {
        console.error('Profile enrichment failed:', upsertError.message);
      }

      if (params.emergencyContactName?.trim() && params.emergencyContactPhone?.trim()) {
        await supabase.from('emergency_contacts').insert({
          user_id: data.user.id,
          name: params.emergencyContactName.trim(),
          relation: 'Emergency',
          phone: params.emergencyContactPhone.trim(),
          is_default_notified: true,
          is_emergency_contact: true
        });
      }

      setVaultSalt(vaultSalt);
      cachePinLocally(pinHash, pinSalt);

      const profile = await loadFullProfile(supabase, data.user);
      return { success: true, user: profile };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to finalize registration.' };
    }
  }

  // LEGACY MODE
  const users = getStoredUsers();
  const normalizedEmail = params.email.trim().toLowerCase();

  if (users[normalizedEmail]) {
    return { success: false, error: 'An account with this email already exists. Please log in.' };
  }

  const newProfile: UserProfile = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    email: normalizedEmail,
    fullName: params.fullName.trim(),
    district: params.district,
    phone: params.phone?.trim() || '',
    emergencyContactName: params.emergencyContactName?.trim() || '',
    emergencyContactPhone: params.emergencyContactPhone?.trim() || '',
    preferredLanguage: params.preferredLanguage || 'en',
    themeMode: 'light',
    stealthPin: params.stealthPin || '1520',
    discreetNotifications: true,
    quickExitHotkey: 'Escape',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  const passwordSalt = generateRandomSalt();
  users[normalizedEmail] = {
    profile: newProfile,
    passwordHash: await hashPin(params.password, passwordSalt),
    salt: passwordSalt,
  };

  saveStoredUsers(users);
  localStorage.setItem(STORAGE_SESSION_KEY, normalizedEmail);

  return { success: true, user: newProfile };
}

export function logoutUser(): void {
  if (isSupabaseMode()) {
    const supabase = getSupabase()!;
    void supabase.auth.signOut().catch(err => console.warn('Supabase signOut failed:', err));
  }
  clearCachedKey();
  clearProfileCache();
  clearPinCache();
  try {
    localStorage.removeItem(STORAGE_SESSION_KEY);
  } catch (err) {
    console.error('Logout error:', err);
  }
}

export function updateStoredProfile(updated: UserProfile): UserProfile {
  if (isSupabaseMode()) {
    // Cache instantly for the UI, then push to Supabase in the background.
    cacheProfile(updated);
    void syncProfileToSupabase(updated);
    return updated;
  }

  const users = getStoredUsers();
  const normalizedEmail = updated.email.toLowerCase();
  if (users[normalizedEmail]) {
    users[normalizedEmail].profile = updated;
    saveStoredUsers(users);
  }
  return updated;
}

/** Sends a Supabase password-reset email (no-op with a clear error offline). */
export async function resetUserPassword(email: string): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseMode()) {
    const supabase = getSupabase()!;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
    });
    if (error) {
      return { success: false, error: friendlyAuthError(error.message) };
    }
    return { success: true };
  }
  return { success: false, error: 'Password reset emails require an online account (Supabase is not configured).' };
}

export async function changeUserPassword(email: string, oldPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  if (newPassword.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters.' };
  }

  if (isSupabaseMode()) {
    const supabase = getSupabase()!;
    // Re-authenticate with the current password before allowing a change.
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: oldPassword
    });
    if (signInError) {
      return { success: false, error: 'Current password is incorrect.' };
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      return { success: false, error: friendlyAuthError(error.message) };
    }
    return { success: true };
  }

  // LEGACY MODE
  const users = getStoredUsers();
  const normalizedEmail = email.toLowerCase();
  const userRecord = users[normalizedEmail];

  if (!userRecord) {
    return { success: false, error: 'User record not found.' };
  }

  const oldHash = userRecord.salt
    ? await hashPin(oldPassword, userRecord.salt)
    : await hashPassword(oldPassword);
  if (userRecord.passwordHash !== oldHash) {
    return { success: false, error: 'Current password is incorrect.' };
  }

  const newSalt = generateRandomSalt();
  userRecord.passwordHash = await hashPin(newPassword, newSalt);
  userRecord.salt = newSalt;
  users[normalizedEmail] = userRecord;
  saveStoredUsers(users);

  return { success: true };
}

/** Purges every local trace of the user and (in Supabase mode) their server rows. */
export function purgeAllUserData(): void {
  if (isSupabaseMode()) {
    const supabase = getSupabase()!;
    void (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const userId = data.session?.user?.id;
        if (!userId) return;
        // Wipe user-owned rows (auth account + profile row are preserved so
        // the user can still sign in afterwards with a clean slate).
        await supabase.from('incidents').delete().eq('user_id', userId);
        await supabase.from('complaints').delete().eq('user_id', userId);
        await supabase.from('check_ins').delete().eq('user_id', userId);
        await supabase.from('conversations').delete().eq('user_id', userId);
        await supabase.from('safety_reports').delete().eq('user_id', userId);
        await supabase.from('api_activity_logs').delete().eq('user_id', userId);
        await supabase.from('emergency_contacts').delete().eq('user_id', userId);
      } catch (err) {
        console.error('Remote purge error:', err);
      }
    })();
  }

  clearCachedKey();
  clearProfileCache();
  clearPinCache();
  try {
    localStorage.removeItem(STORAGE_SESSION_KEY);
    localStorage.removeItem('mehfooz_encrypted_vault_v1');
    localStorage.removeItem('mehfooz_complaint_drafts_v1');
    localStorage.removeItem('mehfooz_custom_pin');
    localStorage.removeItem('mehfooz_vault_records_v1');
    localStorage.removeItem('mehfooz_user_contacts_v1');
    localStorage.removeItem('mehfooz_vault_salt_v2');
  } catch (e) {
    console.error('Purge error:', e);
  }
}
