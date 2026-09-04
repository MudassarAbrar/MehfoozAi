/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AppLanguage = 'en' | 'ur';

export type ScreenMode = 
  | 'weather' 
  | 'dashboard' 
  | 'chat' 
  | 'vault' 
  | 'complaint_builder' 
  | 'tracking' 
  | 'directory' 
  | 'settings';

export type OrchestratorIntent = 
  | 'legal_information'
  | 'incident_documentation'
  | 'complaint_preparation'
  | 'support_directory'
  | 'immediate_danger'
  | 'status_tracking'
  | 'out_of_scope';

export type RiskLevel = 'immediate_danger' | 'high_risk' | 'standard' | 'informational';

export interface LegalSourceCitation {
  document: string;
  documentUrdu?: string;
  section: string;
  sectionTitle: string;
  sectionTitleUrdu?: string;
  excerpt: string;
  excerptUrdu?: string;
  relevanceScore: number;
  chunkId: string;
  jurisdiction: string;
  url?: string;
}

export interface ChatActionConfirmation {
  id: string;
  type: 'send_complaint' | 'call_contact' | 'share_location' | 'add_contact' | 'start_checkin' | 'emergency_sos';
  /** Legacy alias for `type` — some templates read actionType. */
  actionType?: string;
  targetContact?: UserContact;
  /** Human-readable prompt text shown to the user. */
  prompt?: string;
  /** Label shown on the action button. */
  buttonLabel?: string;
  /** Phone number for call actions. */
  targetPhone?: string;
  /** Display name of the target (person, department, etc.). */
  targetName?: string;
  summary: string;
  details?: string;
  payload?: any;
}

export interface LegalQueryResponse {
  intent: OrchestratorIntent;
  riskLevel: RiskLevel;
  language: AppLanguage;
  answerSummary: string;
  answerSummaryUrdu?: string;
  legalConcepts: string[];
  legalConceptsUrdu?: string[];
  supportOptions: string[];
  sourceReferences: LegalSourceCitation[];
  confidence: number;
  disclaimerRequired: boolean;
  modelUsed?: string;
  isAiGenerated?: boolean;
  actionConfirmation?: ChatActionConfirmation;
  suggestedActions: {
    label: string;
    labelUrdu: string;
    action: 'open_vault' | 'open_complaint' | 'open_directory' | 'open_crisis' | 'ask_followup' | 'open_contacts' | 'open_checkin';
  }[];
}

export type IncidentCategory = 
  | 'domestic_violence'
  | 'coercive_control'
  | 'threats_intimidation'
  | 'physical_assault'
  | 'stalking_harassment'
  | 'workplace_harassment'
  | 'financial_abuse'
  | 'cyber_blackmail'
  | 'other';

export interface VaultRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  incidentDate: string;
  incidentTime: string;
  category: IncidentCategory;
  title: string;
  note: string;
  location?: string;
  witnesses?: string;
  encrypted: boolean;
  hasPhoto: boolean;
  photoUrl?: string;
  audioDuration?: number;
  isLinkedToComplaint?: boolean;
  /** Supabase incidents row id (set once synced). */
  remoteId?: string;
  /** True when the ciphertext could not be decrypted on this device. */
  locked?: boolean;
  attachments?: string[];
}

export type ComplaintStage = 
  | 'draft_started'
  | 'draft_saved_privately'
  | 'ready_for_review'
  | 'awaiting_consent'
  | 'handoff_initiated'
  | 'official_channel_opened'
  | 'submitted_by_user'
  | 'reference_saved'
  | 'officially_received'
  | 'under_review'
  | 'closed';

export type PunjabDistrict = 
  | 'Lahore'
  | 'Rawalpindi'
  | 'Faisalabad'
  | 'Multan'
  | 'Gujranwala'
  | 'Sialkot'
  | 'Bahawalpur'
  | 'Sargodha'
  | 'Sheikhupura'
  | 'Gujrat'
  | 'Kasur'
  | 'Sahiwal'
  | 'Other Punjab District';

export interface RoutingDepartmentInfo {
  id: string;
  name: string;
  nameUrdu?: string;
  authorityType: 'police' | 'ombudsperson' | 'fia_cyber' | 'women_protection' | 'municipal' | 'legal_aid';
  email: string;
  phone: string;
  helpline: string;
  portalUrl?: string;
  acceptsDirectApi: boolean;
  guidelines: string;
}

export type SupportChannelType = 
  | 'police_support'
  | 'workplace_ombudsperson'
  | 'fia_cybercrime'
  | 'protection_committee'
  | 'pcsw_helpline'
  | 'legal_aid'
  | 'shelter'
  | 'fospah'
  | 'social_welfare'
  | 'counselling'
  | 'other';

export interface ComplaintDraft {
  id: string;
  createdAt: string;
  updatedAt: string;
  stage: ComplaintStage;
  category: IncidentCategory;
  customCategoryName?: string;
  incidentSummary: string;
  originalUserWords: string;
  incidentDate?: string;
  incidentTime?: string;
  district: PunjabDistrict;
  locationDetails?: string;
  isSituationOngoing: boolean;
  requestedSupport: SupportChannelType | string;
  customChannelName?: string;
  customChannelContact?: string;
  aiRecommendationDetails?: {
    recommendedChannel: string;
    recommendedChannelTitle: string;
    recommendedChannelTitleUrdu?: string;
    urgencyLevel: 'immediate' | 'high' | 'standard';
    rationale: string;
    rationaleUrdu?: string;
    applicableLaw: string;
    authorityPowers: string;
    suggestedNextStep?: string;
    recommendedAt: string;
  };
  safeContactMethod?: string;
  safeContactNotes?: string;
  attachedVaultRecordIds: string[];
  attachedPhotos?: string[];
  userApprovalForPhotos?: boolean;
  hasEvidence: boolean;
  noEvidenceReason?: string;
  evidencePrivacyAcknowledged: boolean;
  routingDepartment?: RoutingDepartmentInfo;
  submissionChannel?: 'api' | 'email' | 'portal' | 'manual_package';
  userConsentGiven: boolean;
  userConsentTimestamp?: string;
  officialChannelUsed?: string;
  officialReferenceNumber?: string;
  userFollowupNotes?: string;
  isMockHandoff?: boolean;
  statusHistory?: { stage: ComplaintStage; timestamp: string; note: string }[];
  /** Supabase complaints row id (set once synced). */
  remoteId?: string;
}

export type ActiveTab = 
  | 'landing'
  | 'home' 
  | 'navigate' 
  | 'community' 
  | 'checkin' 
  | 'contacts'
  | 'alerts' 
  | 'assistant' 
  | 'vault' 
  | 'builder' 
  | 'tracking' 
  | 'directory' 
  | 'profile'
  | 'api_monitor';

/** Row of the api_activity_logs table (Prompt #2 live integration monitor). */
export interface ApiActivityLog {
  id: string;
  endpoint: string;
  method: string;
  targetService: string;
  status: 'pending' | 'success' | 'failed' | 'timeout' | string;
  statusCode: number | null;
  requestPreview: string | null;
  responsePreview: string | null;
  durationMs: number | null;
  errorMessage: string | null;
  createdAt: string;
}

export type ContactRelationship = 
  | 'family' 
  | 'friend' 
  | 'guardian' 
  | 'emergency' 
  | 'lawyer' 
  | 'doctor' 
  | 'organization_rep' 
  | 'colleague' 
  | 'other';

export interface UserContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  email?: string;
  contactType?: ContactRelationship;
  organization?: string;
  preferredMethod?: 'call' | 'sms' | 'whatsapp' | 'email';
  isEmergencyContact?: boolean;
  isDefaultNotified: boolean;
  avatarColor?: string;
}

export interface SafeRouteFeature {
  wellLitPercent: number;
  activeWomenCount: number;
  policePostNearby: boolean;
  cctvCoveragePercent?: number;
  safeZonesCount: number;
}

export interface SafeRoute {
  id: string;
  title: string;
  from: string;
  to: string;
  routeType: 'safest' | 'balanced' | 'fastest';
  durationMinutes: number;
  distanceKm: number;
  safetyScore: number; // 0 - 100
  safetyGrade: 'A+' | 'A' | 'B+' | 'B';
  verifiedCount: number;
  verifiedAgo: string;
  features: SafeRouteFeature;
  nextTurnInstruction: string;
  addedTimeMinutes?: number;
}

export type CheckInStatus = 'idle' | 'active' | 'deviation_detected' | 'paused' | 'escalation_warning' | 'contacts_alerted' | 'completed' | 'cancelled';

export interface SilentCheckInSession {
  id: string;
  destination: string;
  origin?: string;
  expectedMinutes: number;
  remainingMinutes: number;
  expectedTimeStr: string;
  selectedContactIds: string[];
  selectedContactNames: string[];
  isRunning: boolean;
  isCompleted: boolean;
  startTime: string;
  status: CheckInStatus;
  isDeviated?: boolean;
  isStationary?: boolean;
  lastConfirmedSafeTime?: string;
  escalationGraceSeconds?: number;
  locationSharingActive: boolean;
  lastKnownCoordinates?: { lat: number; lng: number; address: string };
  escalationHistory?: { timestamp: string; event: string; targetContacts: string[] }[];
}

export type AlertConfidenceLevel = 'low' | 'medium' | 'high';

export interface CommunityUpdate {
  id: string;
  authorName: string;
  authorRole: string;
  isVerified: boolean;
  starRating: number;
  timestamp: string;
  timeAgo: string;
  locationName: string;
  district: string;
  category?: IncidentCategory | 'unsafe_area' | 'harassment' | 'lighting' | 'suspicious' | 'street_crime';
  text: string;
  textUrdu?: string;
  sentiment: 'very_unsafe' | 'uncomfortable' | 'neutral' | 'safe' | 'very_safe';
  tags: string[];
  hasEvidence?: boolean;
  isAnonymous?: boolean;
  isFlagged?: boolean;
  viewsCount: number;
  helpfulCount: number;
  isHelpfulByUser?: boolean;
  reporterFingerprint?: string;
}

export interface IncidentCluster {
  id: string;
  locationName: string;
  district: string;
  category: string;
  categoryLabel: string;
  categoryLabelUrdu?: string;
  reportCount: number;
  independentReportersCount: number;
  timeWindowDays: number;
  confidenceScore: number; // 0 - 100
  confidenceLevel: AlertConfidenceLevel;
  lastReportedAgo: string;
  summaryExplanation: string;
  summaryExplanationUrdu?: string;
  safetyAdvice: string[];
  safetyAdviceUrdu?: string[];
  verifiedEvidenceCount: number;
  isSpamFiltered: boolean;
}

export interface ActiveAlertItem {
  id: string;
  type: 'harassment' | 'suspicious' | 'lighting' | 'construction' | 'police_advisory';
  title: string;
  titleUrdu?: string;
  severity: 'critical' | 'high' | 'medium';
  confidenceLevel?: AlertConfidenceLevel;
  confidenceScore?: number;
  clusterOrigin?: {
    independentReports: number;
    timeframe: string;
    area: string;
    signals: string[];
  };
  timeAgo: string;
  distanceKm: number;
  locationName: string;
  district: string;
  description: string;
  descriptionUrdu?: string;
  affectedWomenCount: number;
  verifiedCount: number;
  isResolved?: boolean;
  reporterName?: string;
  safetyGuidance?: string;
  tag?: string;
  tagUrdu?: string;
  tagline?: string;
  taglineUrdu?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  safeNickname?: string;
  district: PunjabDistrict;
  phone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContacts?: UserContact[];
  preferredLanguage: AppLanguage;
  themeMode: 'light' | 'dark';
  stealthPin: string;
  discreetNotifications: boolean;
  quickExitHotkey: string;
  createdAt: string;
  lastLoginAt: string;
  preferences?: {
    wellLitStreets: boolean;
    busyAreas: boolean;
    familiarRoutes: boolean;
    policePresence: boolean;
    womenFriendlyBusinesses: boolean;
    shortWalkingDistances: boolean;
  };
  privacySettings?: {
    shareWithEmergencyContacts: boolean;
    contributeToCommunity: boolean;
    allowLocalSafetyNotifications: boolean;
  };
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface SupportResource {
  id: string;
  name: string;
  nameUrdu: string;
  category: 'legal_aid' | 'emergency' | 'police' | 'counselling' | 'shelter' | 'workplace_ombudsperson' | 'cyber_safety';
  district: string; // 'All Punjab' or specific district
  phone?: string;
  helpline?: string;
  whatsapp?: string;
  website?: string;
  address?: string;
  addressUrdu?: string;
  description: string;
  descriptionUrdu: string;
  is24x7: boolean;
  freeOfCost: boolean;
  verified: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventType: string;
  detail: string;
  confidence?: number;
}

export interface AuditTelemetryEvent {
  id: string;
  timestamp: string;
  type: 'orchestrator_query' | 'danger_triggered' | 'vault_encrypted' | 'complaint_drafted' | 'consent_granted' | 'handoff_executed' | 'quick_exit';
  detail: string;
  confidenceScore?: number;
  metadata?: Record<string, any>;
}

// =====================================================================
// Agent response types (server-side function-calling loop)
// =====================================================================

export type AgentResponseType = 'final' | 'confirmation_required' | 'ui_action' | 'error';

export type AgentToolSafety = 'read_only' | 'ui_only' | 'requires_confirmation';

export type AgentToolStatus =
  | 'proposed'
  | 'pending_confirmation'
  | 'confirmed'
  | 'executing'
  | 'executed'
  | 'failed'
  | 'cancelled'
  | 'expired';

export interface AgentToolProposal {
  id: string;
  toolName: string;
  safety: AgentToolSafety;
  status: AgentToolStatus;
  title: string;
  description: string;
  displayData: {
    recipient?: string;
    recipientPhone?: string;
    messagePreview?: string;
    destination?: string;
    durationMinutes?: number;
    contactNames?: string;
    complaintCategory?: string;
    incidentType?: string;
    incidentTitle?: string;
    complaintId?: string;
    recipientEmail?: string;
    includeGps?: boolean;
  };
  expiresAt?: string;
}

export interface AgentStep {
  id: string;
  toolName?: string;
  label: string;
  status: 'active' | 'completed' | 'waiting' | 'failed';
  startedAt?: string;
  completedAt?: string;
}

export interface AgentCitation {
  sourceId: string;
  title: string;
  statute?: string;
  section?: string;
  summary: string;
}

export interface AgentResponse {
  type: AgentResponseType;
  conversationId: string;
  runId: string;
  text?: string;
  citations?: AgentCitation[];
  pendingActions?: AgentToolProposal[];
  uiActions?: Array<{
    action: string;
    payload?: Record<string, unknown>;
  }>;
  steps?: AgentStep[];
  error?: {
    code: string;
    message: string;
  };
  modelUsed?: string;
  isAiGenerated?: boolean;
}
