/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';
import { AppLanguage, AuditLogEntry, ComplaintDraft, VaultRecord, UserProfile, ActiveTab } from './types';
import { getStoredProfile, getStoredSessionToken, initializeAuth, needsOnboardingAfterAuth } from './utils/auth';
import { getSupabase } from './utils/supabase';

// Stealth & Crisis
import { WeatherCover } from './components/WeatherCover';
import { CrisisModal } from './components/CrisisModal';
import { Navigation } from './components/Navigation';
import { AuthModal } from './components/AuthModal';
import { OnboardingModal } from './components/OnboardingModal';
import { HackathonInspector } from './components/HackathonInspector';

// Primary Design Views (Matching Uploaded Screenshots)
import { HomeDashboard } from './components/HomeDashboard';
import { SafeNavigation } from './components/SafeNavigation';
import { CommunityUpdates } from './components/CommunityUpdates';
import { SilentCheckIn } from './components/SilentCheckIn';
import { ActiveAlerts } from './components/ActiveAlerts';
import { UserProfileView } from './components/UserProfile';
import { ImportantContacts } from './components/ImportantContacts';

// Specialized Legal Suite Views
import { LegalAssistant } from './components/LegalAssistant';
import { IncidentVault } from './components/IncidentVault';
import { ComplaintBuilder } from './components/ComplaintBuilder';
import { TrackingDashboard } from './components/TrackingDashboard';
import { SupportDirectory } from './components/SupportDirectory';
import { LandingPage } from './components/LandingPage';
import { ApiActivityDashboard } from './components/ApiActivityDashboard';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { OfflineLegalCorpusModal } from './components/common/OfflineLegalCorpusModal';
import { initializeOfflineEmergencyCache } from './utils/offlineEmergencyCache';
import { migrateLocalDataToSupabase } from './utils/localDataMigration';
import { ChatStateProvider } from './utils/chatState';

export default function App() {
  return (
    <ChatStateProvider>
      <AppInner />
    </ChatStateProvider>
  );
}

function AppInner() {
  // Disguise & App State
  const [isUnlocked, setIsUnlocked] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('landing'); // Start at landing page
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean>(false); // Post-signup onboarding
  const [language, setLanguage] = useState<AppLanguage>('en');
  const [isOfflineCorpusOpen, setIsOfflineCorpusOpen] = useState<boolean>(false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('safepath_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Modals
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [passwordChangeTarget, setPasswordChangeTarget] = useState<'app' | 'vault' | null>(null);
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);

  // User Profile State — start with null (loading), populate via initializeAuth()
  const [user, setUser] = useState<UserProfile | null>(() => {
    // Synchronously check for a cached profile (fast path for instant UI render)
    return getStoredProfile();
  });
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [authVerificationError, setAuthVerificationError] = useState<string | null>(null);

  // Cross-component legal handoff state
  const [vaultDraftNote, setVaultDraftNote] = useState<{ title: string; note: string } | null>(null);
  const [builderImportedRecords, setBuilderImportedRecords] = useState<VaultRecord[]>([]);
  const [builderInitialSummary, setBuilderInitialSummary] = useState<string>('');
  const [builderInitialCategory, setBuilderInitialCategory] = useState<string>('domestic_violence');
  const [builderInitialPhotos, setBuilderInitialPhotos] = useState<string[]>([]);

  // Audit Logs for Telemetry
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'log-init',
      timestamp: new Date().toISOString(),
      eventType: 'app_boot',
      detail: 'SafePath • Mehfooz loaded. Real-time safety corridors and zero-knowledge encryption active.',
      confidence: 1.0
    }
  ]);

  const addAuditLog = useCallback((eventType: string, detail: string, confidence?: number) => {
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      eventType,
      detail,
      confidence
    };
    setAuditLogs(prev => [newLog, ...prev]);
  }, []);

  // Theme effect
  useEffect(() => {
    localStorage.setItem('safepath_theme', themeMode);
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  // Restore authentication session on mount (Supabase or legacy localStorage).
  // The Supabase client (detectSessionInUrl: true) has already consumed the
  // #access_token=... hash and established the session BEFORE React mounts,
  // so we cannot parse the hash here. Instead, we detect new signups by
  // checking whether the user has completed onboarding (PIN hash cache).
  useEffect(() => {
    let cancelled = false;

    void initializeAuth().then(authUser => {
      if (cancelled) return;
      if (authUser) {
        setUser(authUser);
        // Detect new signup: user has a Supabase session but no PIN hash yet
        // (PIN is only written during onboarding step 6). This correctly
        // identifies email-verification users and users who signed up but
        // closed before finishing onboarding.
        if (needsOnboardingAfterAuth()) {
          setNeedsOnboarding(true);
          setActiveTab('home');
          setIsUnlocked(true); // Unlock so the onboarding modal renders
        }
      } else {
        setUser(null);
        // If no session was established but a signup was recently attempted,
        // show a helpful message so the user knows what happened.
        const pendingSignup = sessionStorage.getItem('mehfooz_pending_email_verify');
        if (pendingSignup) {
          sessionStorage.removeItem('mehfooz_pending_email_verify');
          setAuthVerificationError(
            'Email verification could not be completed. The link may have expired or is invalid. Please sign up again or log in.'
          );
        }
      }
      setIsAuthLoading(false);
    }).catch(() => {
      if (cancelled) return;
      setIsAuthLoading(false);
    });

    // Supabase auth state listener — catches SIGNED_IN events that fire
    // when the SDK processes an email verification callback. This acts as
    // a safety net if the session was established after React mounted.
    const supabase = getSupabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let authSubscription: any = null;
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_IN' && !cancelled) {
          // Re-check: if user now has a session but hasn't onboarded, trigger onboarding
          void initializeAuth().then(u => {
            if (cancelled || !u) return;
            setUser(u);
            if (needsOnboardingAfterAuth()) {
              setNeedsOnboarding(true);
              setActiveTab('home');
              setIsUnlocked(true);
            }
            setIsAuthLoading(false);
          });
        }
      });
      authSubscription = data.subscription;
    }

    return () => {
      cancelled = true;
      authSubscription?.unsubscribe();
    };
  }, []);

  // Pre-cache Punjab Support Directory & Legal Corpus for zero-network incidents
  useEffect(() => {
    const meta = initializeOfflineEmergencyCache();
    addAuditLog('offline_cache_initialized', `Pre-cached ${meta.totalDirectoryEntries} directory entries & ${meta.totalLegalArticles} legal articles for zero-network incidents`, 1.0);
  }, [addAuditLog]);

  // One-time legacy localStorage → Supabase migration (no-op when Supabase
  // is not configured or the user is not signed in).
  useEffect(() => {
    let cancelled = false;
    void migrateLocalDataToSupabase().then(result => {
      if (cancelled) return;
      if (result.migrated) {
        addAuditLog(
          'local_data_migrated',
          `Migrated ${result.counts.vault} vault record(s), ${result.counts.drafts} complaint draft(s) and ${result.counts.contacts} contact(s) into your encrypted Supabase account`,
          1.0
        );
      }
    });
    return () => { cancelled = true; };
  }, [user?.id, addAuditLog]);

  // Quick Exit to Weather handler
  const handleQuickExit = useCallback(() => {
    setIsUnlocked(false);
    setIsCrisisModalOpen(false);
    setIsInspectorOpen(false);
    addAuditLog('quick_exit', 'Triggered stealth safety return to Weather cover screen');
  }, [addAuditLog]);

  // Global escape key for safety
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isUnlocked) {
        handleQuickExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isUnlocked, handleQuickExit]);

  // Flow handlers
  const handleOpenVaultWithDraft = (title: string, note: string) => {
    setVaultDraftNote({ title, note });
    setActiveTab('vault');
    addAuditLog('vault_draft_transferred', `Transferred advisory text to private vault: ${title}`);
  };

  const handleOpenComplaintWithData = (summary: string, category: string, photos?: string[]) => {
    setBuilderInitialSummary(summary);
    setBuilderInitialCategory(category);
    setBuilderInitialPhotos(photos || []);
    setBuilderImportedRecords([]);
    setActiveTab('builder');
    addAuditLog('complaint_prepopulated', `Prepopulated complaint builder for ${category} with ${(photos || []).length} photo(s)`);
  };

  const handleExportVaultToComplaint = (records: VaultRecord[]) => {
    setBuilderImportedRecords(records);
    setBuilderInitialSummary('');
    const photos = records.filter(r => r.photoUrl).map(r => r.photoUrl!);
    setBuilderInitialPhotos(photos);
    setActiveTab('builder');
    addAuditLog('vault_exported_to_complaint', `Exported ${records.length} vault record(s)`);
  };

  const handleDraftCreated = (draft: ComplaintDraft) => {
    setActiveTab('tracking');
    addAuditLog('complaint_stage_updated', `Draft ${draft.id} stage: ${draft.stage}`);
  };

  const isUrdu = language === 'ur';

  // Demo mode handler — bypasses real onboarding (MUST be before early returns — Rules of Hooks)
  const handleDemoMode = useCallback(() => {
    const demoUser: UserProfile = {
      id: 'demo-user-1',
      fullName: 'Fatima Noor',
      safeNickname: 'Fatima',
      email: 'fatima.noor@example.pk',
      phone: '+92 300 1234567',
      district: 'Lahore',
      emergencyContactName: 'Tulsi (Mom)',
      emergencyContactPhone: '+92 300 9876543',
      emergencyContacts: [
        { id: 'c1', name: 'Tulsi (Mom)', relation: 'Mother', phone: '+92 300 9876543', isDefaultNotified: true },
        { id: 'c2', name: 'Gopal (Brother)', relation: 'Brother', phone: '+92 321 4567890', isDefaultNotified: true }
      ],
      preferredLanguage: 'en',
      themeMode: 'light',
      stealthPin: '1520',
      discreetNotifications: true,
      quickExitHotkey: 'Escape',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };
    setUser(demoUser);
    setActiveTab('home');
    setNeedsOnboarding(false);
    addAuditLog('demo_mode_activated', 'User entered demo mode — bypassed real onboarding');
  }, [addAuditLog]);

  // Auth success handler — triggers onboarding for new real users
  const handleAuthSuccess = useCallback((authedUser: UserProfile) => {
    setUser(authedUser);
    setNeedsOnboarding(true);
    setIsUnlocked(true); // Unlock so the onboarding modal renders
    setActiveTab('home'); // Navigate to home where onboarding modal lives
  }, []);

  // Onboarding complete — enter the weather cover (stealth layer)
  const handleOnboardingComplete = useCallback(() => {
    setNeedsOnboarding(false);
    setIsUnlocked(false);
  }, []);

  // Render Weather Cover if stealth locked
  if (!isUnlocked) {
    return (
      <WeatherCover
        onUnlock={() => {
          setIsUnlocked(true);
          addAuditLog('stealth_unlocked', 'PIN verified to reveal SafePath / Mehfooz');
        }}
        onDirectSos={() => {
          setIsCrisisModalOpen(true);
          addAuditLog('stealth_direct_sos', 'Direct SOS triggered from weather cover');
        }}
      />
    );
  }

  // Render Landing Page when no authenticated user or explicitly navigating to landing
  if (activeTab === 'landing' && !user) {
    return (
      <>
        {authVerificationError && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-rose-50 border-b border-rose-200 px-4 py-3 flex items-center justify-between text-sm text-rose-700 font-medium shadow-sm">
            <div className="flex items-center space-x-2 max-w-2xl">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{authVerificationError}</span>
            </div>
            <button
              onClick={() => setAuthVerificationError(null)}
              className="ml-4 px-2 py-1 rounded-lg hover:bg-rose-100 text-rose-500 font-bold text-xs cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}
        <LandingPage
          onLaunchApp={() => {
            setIsAuthModalOpen(true);
            // Clear verification error when user opens the auth modal
            if (authVerificationError) setAuthVerificationError(null);
          }}
          onOpenWeather={() => {
            setIsUnlocked(false);
            setActiveTab('home');
          }}
          language={language}
          onLanguageChange={setLanguage}
          themeMode={themeMode}
          onThemeChange={setThemeMode}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          language={language}
          onSuccess={(authedUser) => setUser(authedUser)}
          onAuthSuccess={handleAuthSuccess}
          onDemoMode={handleDemoMode}
        />
      </>
    );
  }

  // Also show landing if explicitly navigated back (e.g. logo click) — user already authenticated
  if (activeTab === 'landing' && user) {
    return (
      <LandingPage
        onLaunchApp={() => setActiveTab('home')}
        onOpenWeather={() => {
          setIsUnlocked(false);
          setActiveTab('home');
        }}
        language={language}
        onLanguageChange={setLanguage}
        themeMode={themeMode}
        onThemeChange={setThemeMode}
      />
    );
  }

  return (
    <div className={`min-h-screen bg-[#FCFCFC] dark:bg-[#121A1E] text-[#1C2C34] dark:text-[#F4F4FC] flex flex-col font-sans selection:bg-[#FC7454] selection:text-white transition-colors duration-200 max-w-full ${isUrdu ? 'font-urdu' : ''}`}>
      {/* 1. Header & Ergonomic Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        language={language}
        onLanguageChange={setLanguage}
        themeMode={themeMode}
        onThemeChange={setThemeMode}
        user={user}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenCrisis={() => setIsCrisisModalOpen(true)}
        onQuickExit={handleQuickExit}
        onToggleInspector={() => setIsInspectorOpen(!isInspectorOpen)}
        inspectorOpen={isInspectorOpen}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenOfflineCorpus={() => setIsOfflineCorpusOpen(true)}
        onChangePassword={(target) => {
          if (target === 'email') {
            setIsAuthModalOpen(true);
          } else {
            setPasswordChangeTarget(target);
            setPwNew(''); setPwConfirm(''); setPwError(null); setPwSuccess(false);
          }
        }}
      />

      {/* 2. Main View Router */}
      <main className="flex-1 pb-20 md:pb-12 pt-2">
        {/* TAB 1: HOME DASHBOARD (Matching Design Image 7) */}
        {activeTab === 'home' && (
          <HomeDashboard
            language={language}
            user={user}
            onStartNavigation={() => setActiveTab('navigate')}
            onStartCheckIn={() => setActiveTab('checkin')}
            onOpenCommunity={() => setActiveTab('community')}
            onOpenAlerts={() => setActiveTab('alerts')}
            onOpenCrisis={() => setIsCrisisModalOpen(true)}
            onOpenLegalChat={() => setActiveTab('assistant')}
          />
        )}

        {/* TAB 2: SAFE NAVIGATION (Matching Design Image 8 & 6) */}
        {activeTab === 'navigate' && (
          <SafeNavigation
            language={language}
            user={user}
            onOpenCrisis={() => setIsCrisisModalOpen(true)}
          />
        )}

        {/* TAB 3: COMMUNITY UPDATES (Matching Design Image 10) */}
        {activeTab === 'community' && (
          <CommunityUpdates
            language={language}
            user={user}
          />
        )}

        {/* TAB 4: SILENT CHECK-IN (Matching Design Image 1 & 9) */}
        {activeTab === 'checkin' && (
          <SilentCheckIn
            language={language}
            user={user}
            onOpenCrisis={() => setIsCrisisModalOpen(true)}
          />
        )}

        {/* TAB 5: ACTIVE ALERTS (Matching Design Image 3) */}
        {activeTab === 'alerts' && (
          <ActiveAlerts
            language={language}
            user={user}
            onStartNavigation={() => setActiveTab('navigate')}
            onOpenReportModal={() => setActiveTab('community')}
          />
        )}

        {/* TAB 6: USER PROFILE & SETTINGS (Matching Design Image 5 & 11) */}
        {activeTab === 'profile' && (
          <UserProfileView
            user={user}
            language={language}
            onLanguageChange={setLanguage}
            themeMode={themeMode}
            onThemeChange={setThemeMode}
            onUpdateProfile={(updated) => setUser(updated)}
            onLogout={() => setUser(null)}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onQuickExit={handleQuickExit}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
          />
        )}

        {/* TAB 7: IMPORTANT CONTACTS */}
        {activeTab === 'contacts' && (
          <ImportantContacts
            language={language}
            user={user}
            onUpdateUser={(updated) => setUser(updated)}
            onOpenCrisis={() => setIsCrisisModalOpen(true)}
            onStartCheckInWithContact={() => setActiveTab('checkin')}
          />
        )}

        {/* SPECIALIZED LEGAL SUITE TABS */}
        {activeTab === 'assistant' && (
          <LegalAssistant
            language={language}
            userContacts={user?.emergencyContacts}
            onLanguageChange={setLanguage}
            onOpenVaultWithDraft={handleOpenVaultWithDraft}
            onOpenComplaintWithData={handleOpenComplaintWithData}
            onOpenDirectory={() => setActiveTab('directory')}
            onOpenCrisis={() => setIsCrisisModalOpen(true)}
            onLogAudit={addAuditLog}
          />
        )}

        {activeTab === 'vault' && (
          <IncidentVault
            language={language}
            onExportToComplaint={handleExportVaultToComplaint}
            onLogAudit={addAuditLog}
            initialDraftNote={vaultDraftNote}
            onClearInitialDraft={() => setVaultDraftNote(null)}
          />
        )}

        {activeTab === 'builder' && (
          <ComplaintBuilder
            language={language}
            importedRecords={builderImportedRecords}
            initialSummary={builderInitialSummary}
            initialCategory={builderInitialCategory}
            initialPhotos={builderInitialPhotos}
            onDraftCreated={handleDraftCreated}
            onOpenCrisis={() => setIsCrisisModalOpen(true)}
            onLogAudit={addAuditLog}
          />
        )}

        {activeTab === 'tracking' && (
          <TrackingDashboard
            language={language}
            onNavigateToBuilder={() => setActiveTab('builder')}
            onLogAudit={addAuditLog}
          />
        )}

        {activeTab === 'directory' && (
          <SupportDirectory
            language={language}
            onOpenCrisis={() => setIsCrisisModalOpen(true)}
          />
        )}

        {/* LIVE API INTEGRATION MONITOR (Prompt #2) */}
        {activeTab === 'api_monitor' && (
          <ApiActivityDashboard language={language} />
        )}
      </main>

      {/* 3. Onboarding Walkthrough */}
      <OnboardingModal
        isOpen={isOnboardingOpen || needsOnboarding}
        onClose={() => {
          setIsOnboardingOpen(false);
          if (needsOnboarding) handleOnboardingComplete();
        }}
        language={language}
        user={user}
        isNewUser={needsOnboarding}
        onComplete={handleOnboardingComplete}
      />

      {/* 4. Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        language={language}
        onSuccess={(authedUser) => setUser(authedUser)}
        onAuthSuccess={handleAuthSuccess}
        onDemoMode={handleDemoMode}
      />

      {/* Password Change Modal (Settings → App/Vault Password) */}
      {passwordChangeTarget && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPasswordChangeTarget(null)}>
          <div className="w-full max-w-sm bg-white dark:bg-[#18242A] rounded-2xl shadow-2xl p-5 border border-slate-200 dark:border-slate-700" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-[#1C2C34] dark:text-white mb-1">
              {passwordChangeTarget === 'app' ? 'Change App Password' : 'Change Vault Password'}
            </h3>
            <p className="text-xs text-[#5A6E78] dark:text-slate-400 mb-4">
              {passwordChangeTarget === 'app'
                ? 'This password unlocks the protected app through the weather cover interface.'
                : 'This password protects your encrypted Private Vault.'}
            </p>
            {pwError && <div className="p-2 mb-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-400 font-medium">{pwError}</div>}
            {pwSuccess && <div className="p-2 mb-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-400 font-medium">Password updated successfully!</div>}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#1C2C34] dark:text-slate-300 mb-1">New Password</label>
                <input type="password" value={pwNew} onChange={e => { setPwNew(e.target.value); setPwError(null); setPwSuccess(false); }} placeholder="Minimum 6 characters" className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-[#1C2C34] dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#FC7454]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1C2C34] dark:text-slate-300 mb-1">Confirm Password</label>
                <input type="password" value={pwConfirm} onChange={e => { setPwConfirm(e.target.value); setPwError(null); setPwSuccess(false); }} placeholder="Re-enter password" className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-[#1C2C34] dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#FC7454]" />
              </div>
            </div>
            <div className="flex space-x-2 mt-4">
              <button onClick={() => setPasswordChangeTarget(null)} className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-[#1C2C34] dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition cursor-pointer">Cancel</button>
              <button
                onClick={() => {
                  if (pwNew.length < 6) { setPwError('Password must be at least 6 characters'); return; }
                  if (pwNew !== pwConfirm) { setPwError('Passwords do not match'); return; }
                  if (passwordChangeTarget === 'app') {
                    // Save as stealth PIN
                    try {
                      const updated = user ? { ...user, stealthPin: pwNew } : null;
                      if (updated) {
                        setUser(updated);
                        localStorage.setItem('mehfooz_profile_cache_v1', JSON.stringify(updated));
                      }
                    } catch {}
                  } else {
                    // Save vault password
                    try { localStorage.setItem('mehfooz_vault_pw_hash', pwNew); } catch {}
                  }
                  setPwSuccess(true);
                  setPwError(null);
                  setTimeout(() => setPasswordChangeTarget(null), 1500);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#1C2C34] hover:bg-[#263842] text-white text-xs font-bold transition cursor-pointer"
              >Save</button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Immediate Safety Crisis Modal */}
      <CrisisModal
        isOpen={isCrisisModalOpen}
        onClose={() => setIsCrisisModalOpen(false)}
        onQuickExit={handleQuickExit}
        language={language}
        contacts={user?.emergencyContacts || []}
      />

      {/* 6. Telemetry Inspector Drawer */}
      <HackathonInspector
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        auditLogs={auditLogs}
      />

      {/* 7. Offline Safety Network Monitor Banner */}
      <OfflineIndicator
        language={language}
        onOpenDirectory={() => setActiveTab('directory')}
        onOpenCrisis={() => setIsCrisisModalOpen(true)}
      />

      {/* 8. Dedicated Offline Legal Corpus Reference Modal */}
      <OfflineLegalCorpusModal
        isOpen={isOfflineCorpusOpen}
        onClose={() => setIsOfflineCorpusOpen(false)}
        language={language}
      />
    </div>
  );
}
