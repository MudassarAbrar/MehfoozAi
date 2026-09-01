/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile, PunjabDistrict, AppLanguage } from '../types';

const STORAGE_USERS_KEY = 'mehfooz_registered_users_v1';
const STORAGE_SESSION_KEY = 'mehfooz_current_session_v1';

// Seed demo account
const INITIAL_DEMO_USER: UserProfile = {
  id: 'user-demo-001',
  email: 'ayesha.rehman@gmail.com',
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

// Simple cryptographic hash helper for passwords
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

export function getStoredSessionToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_SESSION_KEY);
  } catch {
    return null;
  }
}

export function getStoredProfile(): UserProfile | null {
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

export async function initializeAuth(): Promise<UserProfile | null> {
  // Ensure default demo user exists in storage
  const users = getStoredUsers();
  if (!users[INITIAL_DEMO_USER.email.toLowerCase()]) {
    const demoHash = await hashPassword('Mehfooz2026!');
    users[INITIAL_DEMO_USER.email.toLowerCase()] = {
      profile: INITIAL_DEMO_USER,
      passwordHash: demoHash,
    };
    saveStoredUsers(users);
  }

  // Check active session
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
  const users = getStoredUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const userRecord = users[normalizedEmail];

  if (!userRecord) {
    return { success: false, error: 'No account found with this email address.' };
  }

  const inputHash = await hashPassword(password);
  if (userRecord.passwordHash !== inputHash) {
    return { success: false, error: 'Invalid password. Please try again.' };
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
  const users = getStoredUsers();
  const normalizedEmail = params.email.trim().toLowerCase();

  if (users[normalizedEmail]) {
    return { success: false, error: 'An account with this email already exists. Please log in.' };
  }

  if (params.password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
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

  const passwordHash = await hashPassword(params.password);
  users[normalizedEmail] = {
    profile: newProfile,
    passwordHash,
  };

  saveStoredUsers(users);
  localStorage.setItem(STORAGE_SESSION_KEY, normalizedEmail);

  return { success: true, user: newProfile };
}

export function logoutUser(): void {
  try {
    localStorage.removeItem(STORAGE_SESSION_KEY);
  } catch (err) {
    console.error('Logout error:', err);
  }
}

export function updateStoredProfile(updated: UserProfile): UserProfile {
  const users = getStoredUsers();
  const normalizedEmail = updated.email.toLowerCase();
  if (users[normalizedEmail]) {
    users[normalizedEmail].profile = updated;
    saveStoredUsers(users);
  }
  return updated;
}

export async function changeUserPassword(email: string, oldPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  const users = getStoredUsers();
  const normalizedEmail = email.toLowerCase();
  const userRecord = users[normalizedEmail];

  if (!userRecord) {
    return { success: false, error: 'User record not found.' };
  }

  const oldHash = await hashPassword(oldPassword);
  if (userRecord.passwordHash !== oldHash) {
    return { success: false, error: 'Current password is incorrect.' };
  }

  if (newPassword.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters.' };
  }

  userRecord.passwordHash = await hashPassword(newPassword);
  users[normalizedEmail] = userRecord;
  saveStoredUsers(users);

  return { success: true };
}

export function purgeAllUserData(): void {
  try {
    localStorage.removeItem(STORAGE_SESSION_KEY);
    localStorage.removeItem('mehfooz_encrypted_vault_v1');
    localStorage.removeItem('mehfooz_complaint_drafts_v1');
    localStorage.removeItem('mehfooz_custom_pin');
  } catch (e) {
    console.error('Purge error:', e);
  }
}
