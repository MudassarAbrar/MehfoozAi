/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  BookOpen, 
  ShieldCheck, 
  FileText, 
  ArrowRight, 
  Volume2, 
  VolumeX, 
  ChevronDown, 
  ChevronUp, 
  Bookmark, 
  HelpCircle,
  Scale,
  Building,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  PhoneCall,
  MapPin,
  Mic,
  MicOff,
  Paperclip,
  Image as ImageIcon,
  X,
  Languages,
  Radio,
  Lock,
  Globe,
  ExternalLink,
  ShieldAlert,
  Clock,
  Plus,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppLanguage, LegalQueryResponse, LegalSourceCitation, PunjabDistrict, VaultRecord, UserContact, AgentResponse, AgentToolProposal } from '../types';
import { processSafetyOrchestration, checkImmediateDanger } from '../utils/orchestrator';
import { sendAgentMessage, loadConversations, loadConversationMessages, ConversationSummary, StoredMessage } from '../utils/agentClient';
import { loadVaultRecords, persistVaultRecords } from '../utils/dataService';
import { AgentActionCard } from './AgentActionCard';
import { AgentStepsPanel } from './AgentStepsPanel';
import { useChatState, ChatMessage } from '../utils/chatState';

interface LegalAssistantProps {
  language: AppLanguage;
  userContacts?: UserContact[];
  onLanguageChange?: (lang: AppLanguage) => void;
  onOpenVaultWithDraft?: (title: string, note: string) => void;
  onOpenComplaintWithData?: (summary: string, category: string, photos?: string[]) => void;
  onOpenDirectory?: () => void;
  onOpenCrisis?: () => void;
  onLogAudit?: (event: string, detail: string, confidence?: number) => void;
}

// Re-export ChatMessage so the rest of this file can use it via the local alias
type Message = ChatMessage;

const QUICK_PROMPTS = [
  {
    id: 'coercive',
    labelEn: 'Domestic abuse',
    labelUrdu: 'گھریلو تشدد',
    query: 'What legal protections exist under Punjab law for domestic abuse and confinement?'
  },
  {
    id: 'workplace',
    labelEn: 'Workplace harassment',
    labelUrdu: 'دفتر میں ہراسانی',
    query: 'How do I file a workplace harassment complaint with the Punjab Ombudsperson?'
  },
  {
    id: 'cyber',
    labelEn: 'Online blackmail (PECA)',
    labelUrdu: 'آن لائن بلیک میلنگ',
    query: 'Someone is blackmailing me on WhatsApp. Which laws apply and what steps should I take?'
  },
  {
    id: 'protection',
    labelEn: 'Protection orders',
    labelUrdu: 'حفاظتی آرڈرز',
    query: 'What is the procedure to obtain a Protection Order under PPWVA 2016 in Punjab?'
  }
];

const POPULAR_PUNJAB_LOCATIONS = [
  'Gulberg, Lahore',
  'DHA Phase 5, Lahore',
  'Model Town, Lahore',
  'Mall Road, Lahore',
  'Saddar, Rawalpindi',
  'Faisalabad City',
  'Multan Cantt',
  'Gujranwala Center',
  'Sialkot Cantt'
];

export const LegalAssistant: React.FC<LegalAssistantProps> = ({
  language,
  userContacts,
  onLanguageChange,
  onOpenVaultWithDraft,
  onOpenComplaintWithData,
  onOpenDirectory,
  onOpenCrisis,
  onLogAudit
}) => {
  // ── M.3–M.9: Lift conversation state to App-level context ────────────────
  const {
    messages, setMessages,
    currentConversationId, setCurrentConversationId,
    conversationList, setConversationList,
    resetConversation
  } = useChatState();

  // Track whether we've done the initial load from server (prevents re-loading on remount)
  const hasInitializedRef = useRef(false);

  // Synchronized language state (allows local & global toggling)
  const [currentLang, setCurrentLang] = useState<AppLanguage>(language);

  useEffect(() => {
    setCurrentLang(language);
  }, [language]);

  const isUrdu = currentLang === 'ur';

  // Build the welcome message for the current language
  const buildWelcomeMessage = (lang: AppLanguage): ChatMessage => ({
    id: 'welcome-msg',
    sender: 'assistant',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text: lang === 'ur'
      ? 'خوش آمدید۔ آپ پنجاب کے قوانین، گھریلو تشدد، ہراسانی اور قانونی حقوق بارے کوئی بھی سوال پوچھ سکتی ہیں۔ آپ کا ڈیٹا مکمل پرائیویٹ ہے۔'
      : 'Welcome to Mehfooz Legal Navigator. You can describe any situation in your own words (English, Urdu, or Roman Urdu) to understand your legal rights under Punjab law, protection orders, and safe next steps.'
  });

  // Initialize messages with welcome on very first mount (when context is empty)
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([buildWelcomeMessage(currentLang)]);
    }
    // Only run on the first render where messages are empty
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedCitation, setExpandedCitation] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [autoVoiceReadout, setAutoVoiceReadout] = useState(false);
  
  // 1. Menu and input attachment state
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const attachMenuRef = useRef<HTMLDivElement>(null);

  // 2. Location feature state
  const [activeLocation, setActiveLocation] = useState<string | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [customLocationInput, setCustomLocationInput] = useState('');
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  // 3. Voice Mode state
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const shouldKeepListeningRef = useRef(false);
  const restartCountRef = useRef(0);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accumulatedFinalRef = useRef('');
  const MAX_RESTARTS = 5;
  const RESTART_DELAY_MS = 300;

  // 4. Photo Evidence state
  const [attachedPhotos, setAttachedPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── M.6–M.8: Voice cleanup on unmount ──────────────────────────────────────
  useEffect(() => {
    return () => {
      shouldKeepListeningRef.current = false;
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
        restartTimerRef.current = null;
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
        recognitionRef.current = null;
      }
      // Stop any active speech synthesis
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // History panel UI state (local — not persisted across unmounts)
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, attachedPhotos]);

  // Load conversation history on FIRST mount only (not on every remount)
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    let cancelled = false;
    void loadConversations().then(convs => {
      if (cancelled) return;
      setConversationList(prev => prev.length > 0 ? prev : convs);
    });
    return () => { cancelled = true; };
  }, []);

  // Switch to an existing conversation and load its messages
  const handleSwitchConversation = async (convId: string) => {
    if (convId === currentConversationId || loading) return;
    setCurrentConversationId(convId);
    setIsHistoryPanelOpen(false);
    setLoading(true);
    try {
      const stored = await loadConversationMessages(convId);
      const mapped: Message[] = stored
        .filter((m: StoredMessage) => m.role === 'user' || m.role === 'model')
        .map((m: StoredMessage) => ({
          id: `hist-${m.id}`,
          sender: m.role === 'user' ? 'user' as const : 'assistant' as const,
          timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: m.content || ''
        }));
      if (mapped.length > 0) setMessages(mapped);
    } catch {
      // Keep current messages on failure
    } finally {
      setLoading(false);
    }
  };

  // Start a fresh conversation — M.4: ONLY explicit user action creates a new chat
  const handleNewConversation = () => {
    resetConversation(buildWelcomeMessage(currentLang));
    setIsHistoryPanelOpen(false);
  };

  const formatConvDate = (iso: string) => {
    try { return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' }); }
    catch { return ''; }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(event.target as Node)) {
        setIsAttachMenuOpen(false);
      }
    };
    if (isAttachMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAttachMenuOpen]);

  // Handle Speech Recognition
  const handleToggleVoiceRecording = () => {
    if (isVoiceRecording) {
      shouldKeepListeningRef.current = false;
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
        restartTimerRef.current = null;
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      setIsVoiceRecording(false);
      setVoiceError(null);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError(isUrdu ? 'براؤزر میں وائس ریکگنیشن سپورٹ دستیاب نہیں ہے۔' : 'Speech recognition not supported. Use Chrome or Edge.');
      return;
    }

    try {
      accumulatedFinalRef.current = '';
      restartCountRef.current = 0;
      setVoiceError(null);
      setSpeechTranscript('');
      shouldKeepListeningRef.current = true;

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = isUrdu ? 'ur-PK' : 'en-US';

      recognition.onstart = () => {
        setIsVoiceRecording(true);
        setVoiceError(null);
        restartCountRef.current = 0;
        onLogAudit?.('voice_input_started', `Started voice recording (${recognition.lang})`);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            accumulatedFinalRef.current += (accumulatedFinalRef.current ? ' ' : '') + event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        setInputText(accumulatedFinalRef.current + (interim ? ' ' + interim : ''));
        setSpeechTranscript(interim || accumulatedFinalRef.current.split(' ').slice(-6).join(' ') || '');
      };

      recognition.onerror = (event: any) => {
        const err: string = event.error;
        const fatalErrors = ['not-allowed', 'service-not-allowed', 'audio-capture'];
        if (fatalErrors.includes(err)) {
          shouldKeepListeningRef.current = false;
          setIsVoiceRecording(false);
          const msgs: Record<string, string> = {
            'not-allowed': isUrdu
              ? 'مائیکروفون کی اجازت نہیں ملی۔ براہ کرم براؤزر سیٹنگز میں مائیکروفون آن کریں۔'
              : 'Microphone access denied. Please allow microphone in browser settings.',
            'service-not-allowed': isUrdu
              ? 'وائس سروس دستیاب نہیں ہے۔'
              : 'Speech service not allowed in browser settings.',
            'audio-capture': isUrdu
              ? 'کوئی مائیکروفون نہیں ملا۔ براہ کرم مائیکروفون کنیکٹ کریں۔'
              : 'No microphone found. Please connect a microphone.',
          };
          setVoiceError(msgs[err] || `Voice error: ${err}`);
          onLogAudit?.('voice_fatal_error', err);
          return;
        }
        if (err === 'network') {
          setVoiceError(isUrdu ? 'نیٹ ورک خراب — دوبارہ کوشش کریں' : 'Network error — speech API unreachable. Check connection.');
          onLogAudit?.('voice_network_error', 'Network error during speech recognition');
        }
      };

      recognition.onend = () => {
        if (!shouldKeepListeningRef.current) {
          setIsVoiceRecording(false);
          return;
        }
        if (restartCountRef.current >= MAX_RESTARTS) {
          shouldKeepListeningRef.current = false;
          setIsVoiceRecording(false);
          setVoiceError(isUrdu
            ? 'وائس ریکگنیشن بار بار ناکام ہوئی۔ دوبارہ کوشش کریں۔'
            : 'Voice recognition failed repeatedly. Please try again.');
          onLogAudit?.('voice_restart_limit', `Hit ${MAX_RESTARTS} restarts`);
          return;
        }
        restartCountRef.current += 1;
        restartTimerRef.current = setTimeout(() => {
          if (!shouldKeepListeningRef.current) return;
          try {
            recognition.start();
          } catch (e: any) {
            console.warn('Restart failed:', e?.message || e);
            shouldKeepListeningRef.current = false;
            setIsVoiceRecording(false);
          }
        }, RESTART_DELAY_MS);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      shouldKeepListeningRef.current = false;
      setIsVoiceRecording(false);
      setVoiceError(isUrdu ? 'وائس ریکگنیشن شروع نہیں ہو سکی' : 'Could not start voice recognition.');
    }
  };

  // Handle Photo Attachment
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    (Array.from(files) as File[]).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          const base64 = uploadEvent.target.result as string;
          setAttachedPhotos(prev => [...prev, base64]);
          onLogAudit?.('photo_attached_to_chat', `Attached photo evidence (${Math.round(file.size / 1024)} KB)`);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachedPhoto = (index: number) => {
    setAttachedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Handle GPS Location Detection
  const handleDetectGPS = () => {
    setIsDetectingGps(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = `Lat ${pos.coords.latitude.toFixed(3)}, Lng ${pos.coords.longitude.toFixed(3)} (Lahore, Punjab)`;
          setActiveLocation(coords);
          setIsDetectingGps(false);
          setIsLocationModalOpen(false);
          onLogAudit?.('location_tagged_gps', coords);
        },
        (err) => {
          console.warn('GPS location error:', err);
          setActiveLocation('Lahore City, Punjab');
          setIsDetectingGps(false);
          setIsLocationModalOpen(false);
        },
        { timeout: 6000 }
      );
    } else {
      setActiveLocation('Lahore, Punjab');
      setIsDetectingGps(false);
      setIsLocationModalOpen(false);
    }
  };

  // Language switch handler
  const handleLanguageToggle = (newLang: AppLanguage) => {
    setCurrentLang(newLang);
    onLanguageChange?.(newLang);
    onLogAudit?.('language_switched', `Switched chat language to ${newLang}`);
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if ((!query.trim() && attachedPhotos.length === 0) || loading) return;

    const userMessageId = `user-${Date.now()}`;
    const photosToAttach = [...attachedPhotos];
    const currentLoc = activeLocation;

    const newMessages: Message[] = [
      ...messages,
      {
        id: userMessageId,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: query || (isUrdu ? '[تصویر بطور ثبوت شامل کی گئی]' : '[Photo attached as evidence]'),
        location: currentLoc || undefined,
        photos: photosToAttach.length > 0 ? photosToAttach : undefined
      }
    ];

    setMessages(newMessages);
    setInputText('');
    setAttachedPhotos([]);
    setLoading(true);

    // Save photos to local encrypted safety vault if attached
    if (photosToAttach.length > 0) {
      try {
        const existingVault = await loadVaultRecords();
        const newRecord: VaultRecord = {
          id: `vault-photo-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          incidentDate: new Date().toISOString().split('T')[0],
          incidentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category: 'domestic_violence',
          title: `Evidence Photo Tagged via Legal Assistant`,
          note: `Query: ${query.substring(0, 100)}... Location: ${currentLoc || 'Unspecified'}`,
          location: currentLoc || undefined,
          encrypted: true,
          hasPhoto: true,
          photoUrl: photosToAttach[0],
          isLinkedToComplaint: true
        };
        await persistVaultRecords([newRecord, ...existingVault]);
        onLogAudit?.('vault_photo_saved', 'Saved attached evidence photo into encrypted client vault');
      } catch (e) {
        console.error('Failed to save vault photo', e);
      }
    }

    onLogAudit?.('orchestrator_query', `Legal query with ${photosToAttach.length} photos: ${query.substring(0, 40)}...`);

    try {
      const promptQuery = currentLoc ? `[Location: ${currentLoc}] ${query}` : query;
      const assistantMessageId = `assistant-${Date.now()}`;

      // Try the server-side agent first (function-calling loop)
      try {
        const agentResp = await sendAgentMessage(
          promptQuery,
          currentLang,
          currentConversationId || undefined,
          currentLoc ? {
            currentLocation: { lat: 0, lng: 0, permissionGranted: true }
          } : undefined
        );

        if (agentResp && agentResp.text && agentResp.type !== 'error') {
          // Update conversation tracking after agent response
          if (agentResp.conversationId && agentResp.conversationId !== currentConversationId) {
            setCurrentConversationId(agentResp.conversationId);
            // Refresh conversation list to include the new conversation
            void loadConversations().then(convs => setConversationList(convs));
          }

          setMessages([
            ...newMessages,
            {
              id: assistantMessageId,
              sender: 'assistant',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              text: agentResp.text,
              agentResponse: agentResp
            }
          ]);

          onLogAudit?.('agent_response', `Agent responded (${agentResp.type}) with ${agentResp.citations?.length || 0} citations`);

          if (autoVoiceReadout) {
            handleSpeak(assistantMessageId, agentResp.text);
          }

          // Handle UI actions from the agent
          if (agentResp.uiActions) {
            for (const uiAction of agentResp.uiActions) {
              if (uiAction.action === 'open_crisis_modal' && onOpenCrisis) {
                onOpenCrisis();
              }
              if (uiAction.action === 'open_complaint_builder' && onOpenComplaintWithData) {
                const category = (uiAction.payload?.category as string) || 'domestic_violence';
                onOpenComplaintWithData(agentResp.text || '', category);
              }
            }
          }

          setLoading(false);
          return;
        }
      } catch (agentErr: any) {
        console.info('Agent unavailable, using legacy orchestrator:', agentErr?.message);
      }

      // Fallback: legacy deterministic orchestrator
      const response = await processSafetyOrchestration(promptQuery, currentLang, userContacts);
      const answerText = isUrdu && response.answerSummaryUrdu ? response.answerSummaryUrdu : response.answerSummary;

      setMessages([
        ...newMessages,
        {
          id: assistantMessageId,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: answerText,
          responsePayload: response
        }
      ]);

      onLogAudit?.('orchestrator_response', `Synthesized grounded response with ${response.sourceReferences.length} citations`, response.confidence);

      if (autoVoiceReadout) {
        handleSpeak(assistantMessageId, answerText);
      }

      // If crisis was detected, trigger modal suggestion
      if (response.riskLevel === 'immediate_danger' && onOpenCrisis) {
        onLogAudit?.('danger_triggered', 'Immediate danger trigger phrase detected');
      }
    } catch (err: any) {
      setMessages([
        ...newMessages,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: isUrdu 
            ? 'معذرت، اس وقت سرور سے رابطہ نہیں ہو سکا۔ آپ کا ڈیٹا محفوظ ہے۔ براہ کرم دوبارہ کوشش کریں یا سپورٹ ڈائریکٹری دیکھیں۔'
            : 'We encountered a momentary connection issue. You can still browse the local legal directory and Punjab statutes offline.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = (msgId: string, text: string) => {
    if (speakingId === msgId) {
      window.speechSynthesis?.cancel();
      setSpeakingId(null);
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = isUrdu ? 'ur-PK' : 'en-GB';
      utterance.rate = 0.95;
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      setSpeakingId(msgId);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] max-w-4xl mx-auto px-4 py-3 text-[#1C2C34] bg-white/90 backdrop-blur-xs rounded-[28px] border border-[#BCD4D4]/50 shadow-sm">
      {/* 1. Header Toolbar with English / Urdu Toggle and Voice Mode */}
      <div className="flex flex-wrap items-center justify-between py-2 border-b border-slate-200 gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-[#ECF4F4] text-[#FC7454] flex items-center justify-center shadow-xs border border-[#BCD4D4]">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-sm text-[#1C2C34]">
              {isUrdu ? 'قانونی AI' : 'Legal AI'}
            </span>
          </div>
        </div>

        {/* Action Controls: History, English/Urdu Pill & Voice Mode */}
        <div className="flex items-center space-x-2">
          {/* Conversation History Toggle */}
          <button
            onClick={() => setIsHistoryPanelOpen(!isHistoryPanelOpen)}
            className={`p-1.5 px-2 rounded-xl text-xs font-bold border transition flex items-center space-x-1.5 cursor-pointer ${
              isHistoryPanelOpen
                ? 'bg-[#ECF4F4] border-[#BCD4D4] text-[#FC7454]'
                : 'bg-white border-slate-200 text-[#5A6E78] hover:bg-slate-50'
            }`}
            title={isUrdu ? 'چیٹ ہسٹری' : 'Chat History'}
          >
            <Clock className={`w-3.5 h-3.5 ${isHistoryPanelOpen ? 'text-[#FC7454]' : ''}`} />
            <span className="hidden sm:inline">{isUrdu ? 'ہسٹری' : 'History'}</span>
          </button>

          {/* English / Urdu Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => handleLanguageToggle('en')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                !isUrdu 
                  ? 'bg-white text-[#1C2C34] shadow-xs' 
                  : 'text-[#5A6E78] hover:text-[#1C2C34]'
              }`}
            >
              <span>🇬🇧</span>
              <span>English</span>
            </button>
            <button
              onClick={() => handleLanguageToggle('ur')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold font-urdu transition flex items-center space-x-1 cursor-pointer ${
                isUrdu 
                  ? 'bg-[#1C2C34] text-white shadow-xs' 
                  : 'text-[#5A6E78] hover:text-[#1C2C34]'
              }`}
            >
              <span>🇵🇰</span>
              <span>اردو</span>
            </button>
          </div>

          {/* Voice Auto-Readout Toggle */}
          <button
            onClick={() => setAutoVoiceReadout(!autoVoiceReadout)}
            className={`p-1.5 px-2 rounded-xl text-xs font-bold border transition flex items-center space-x-1.5 cursor-pointer ${
              autoVoiceReadout
                ? 'bg-[#ECF4F4] border-[#BCD4D4] text-[#FC7454]'
                : 'bg-white border-slate-200 text-[#5A6E78] hover:bg-slate-50'
            }`}
            title="Auto voice readout for answers"
          >
            <Volume2 className={`w-3.5 h-3.5 ${autoVoiceReadout ? 'text-[#FC7454]' : ''}`} />
            <span className="hidden sm:inline">{isUrdu ? 'آواز موڈ' : 'Voice Mode'}</span>
          </button>
        </div>
      </div>

      {/* Conversation History Panel */}
      <AnimatePresence>
        {isHistoryPanelOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-slate-200 overflow-hidden"
          >
            <div className="py-2.5 space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-[#5A6E78]">
                  {isUrdu ? 'پچھلی بات چیت' : 'Previous Conversations'}
                </span>
                <button
                  onClick={handleNewConversation}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#1C2C34] text-white hover:bg-[#263842] transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'نئی بات چیت' : 'New Chat'}</span>
                </button>
              </div>
              {conversationList.length === 0 ? (
                <p className="text-[11px] text-[#5A6E78] px-1 py-2">
                  {isUrdu ? 'ابھی کوئی پرانی بات چیت نہیں ہے۔' : 'No previous conversations yet.'}
                </p>
              ) : (
                <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                  {conversationList.map(conv => (
                    <button
                      key={conv.id}
                      onClick={() => handleSwitchConversation(conv.id)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-between gap-2 ${
                        conv.id === currentConversationId
                          ? 'bg-[#ECF4F4] border border-[#BCD4D4] text-[#1C2C34] font-bold'
                          : 'bg-slate-50 hover:bg-[#ECF4F4] border border-transparent text-[#1C2C34]'
                      }`}
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <MessageSquare className="w-3.5 h-3.5 text-[#FC7454] flex-shrink-0" />
                        <span className="truncate font-medium">{conv.title || (isUrdu ? 'بغیر عنوان' : 'Untitled')}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-[10px] text-[#5A6E78] flex-shrink-0">
                        <span>{conv.message_count} msgs</span>
                        <span>{formatConvDate(conv.last_message_at || conv.created_at)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-3.5 space-y-4 pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center space-x-2 text-[11px] text-[#5A6E78] mb-1 px-1">
              <span>{msg.sender === 'user' ? (isUrdu ? 'آپ' : 'You') : (isUrdu ? 'محفوظ لیگل اسسٹنٹ' : 'Mehfooz Legal Assistant')}</span>
              <span>•</span>
              <span>{msg.timestamp}</span>
              {msg.location && (
                <span className="flex items-center space-x-0.5 text-[#1C2C34] font-semibold bg-[#ECF4F4] px-1.5 py-0.2 rounded-md border border-[#BCD4D4]">
                  <MapPin className="w-3 h-3 text-[#FC7454]" />
                  <span>{msg.location}</span>
                </span>
              )}
            </div>

            <div
              className={`max-w-2xl rounded-3xl p-4 sm:p-5 shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-[#1C2C34] text-white rounded-br-xs'
                  : 'bg-white border border-[#BCD4D4]/60 text-[#1C2C34] rounded-bl-xs'
              }`}
            >
              {/* If user attached photos */}
              {msg.photos && msg.photos.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center space-x-1.5 text-xs text-[#1C2C34] mb-1.5 font-bold">
                    <Lock className="w-3.5 h-3.5 text-[#FC7454]" />
                    <span>{isUrdu ? 'محفوظ فوٹو ثبوت (پرائیویٹ والٹ میں محفوظ)' : 'Encrypted Evidence Photo (Saved in Safety Vault)'}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {msg.photos.map((photo, pIdx) => (
                      <img
                        key={pIdx}
                        src={photo}
                        alt="Attached evidence"
                        className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-2xl border-2 border-white/60 shadow-xs"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Message text */}
              <p className={`text-sm sm:text-base leading-relaxed whitespace-pre-wrap ${isUrdu ? 'font-urdu' : 'font-medium'}`}>
                {msg.text}
              </p>

              {/* Agent Steps Panel (when agent response has steps) */}
              {msg.agentResponse?.steps && msg.agentResponse.steps.length > 0 && (
                <AgentStepsPanel steps={msg.agentResponse.steps} isUrdu={isUrdu} />
              )}

              {/* Agent Action Cards (pending confirmations) */}
              {msg.agentResponse?.pendingActions && msg.agentResponse.pendingActions.length > 0 && (
                <div className="mt-3 space-y-2">
                  {msg.agentResponse.pendingActions.map((action) => (
                    <AgentActionCard
                      key={action.id}
                      action={action}
                      isUrdu={isUrdu}
                      onConfirmed={(result) => {
                        onLogAudit?.('agent_action_confirmed', `Confirmed: ${action.toolName}`);
                        // If the action has a UI action (e.g. vault save), handle it
                        if (result?.uiActions) {
                          for (const ua of result.uiActions) {
                            if (ua.action === 'save_incident_to_vault') {
                              onOpenVaultWithDraft?.(
                                (ua.payload?.title as string) || 'Incident Record',
                                (ua.payload?.message as string) || ''
                              );
                            }
                          }
                        }
                      }}
                      onCancelled={() => {
                        onLogAudit?.('agent_action_cancelled', `Cancelled: ${action.toolName}`);
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Agent Citations */}
              {msg.agentResponse?.citations && msg.agentResponse.citations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setExpandedCitation(expandedCitation === msg.id ? null : msg.id)}
                    className="flex items-center space-x-1.5 text-xs font-bold text-[#5A6E78] hover:text-[#1C2C34] transition-colors py-1 group cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#FC7454]" />
                    <span>{isUrdu ? `حوالہ جات (${msg.agentResponse.citations.length}) ▾` : `References (${msg.agentResponse.citations.length}) ▾`}</span>
                    {expandedCitation === msg.id ? (
                      <ChevronUp className="w-3.5 h-3.5 text-[#5A6E78]" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-[#5A6E78]" />
                    )}
                  </button>
                  <AnimatePresence>
                    {expandedCitation === msg.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 space-y-1.5 pl-5 border-l-2 border-[#BCD4D4] overflow-hidden"
                      >
                        {msg.agentResponse.citations.map((citation, cIdx) => (
                          <div key={cIdx} className="py-1">
                            <div className="text-xs font-bold text-[#1C2C34]">
                              {citation.statute && <span>{citation.statute}: </span>}
                              {citation.title}
                            </div>
                            <p className="text-[11px] text-[#5A6E78] mt-0.5">{citation.summary}</p>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Assistant Grounded Payload */}
              {msg.responsePayload && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3.5">
                  {/* Confidence and readout badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="flex items-center space-x-1.5 text-[#1C2C34] font-bold bg-[#ECF4F4] px-3 py-1.5 rounded-xl border border-[#BCD4D4]">
                        <ShieldCheck className="w-4 h-4 text-[#FC7454]" />
                        <span>{Math.round(msg.responsePayload.confidence * 100)}% Grounded in Punjab Statutes</span>
                      </span>

                      {msg.responsePayload.modelUsed && (
                        <span className="flex items-center space-x-1 text-teal-800 font-semibold bg-teal-50 px-2.5 py-1.5 rounded-xl border border-teal-200">
                          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                          <span>{msg.responsePayload.modelUsed}</span>
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleSpeak(msg.id, msg.text)}
                      className="p-1.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#1C2C34] border border-slate-200 transition text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
                      title="Audio readout"
                    >
                      {speakingId === msg.id ? (
                        <VolumeX className="w-4 h-4 text-[#FC7454]" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-[#1C2C34]" />
                      )}
                      <span>{speakingId === msg.id ? (isUrdu ? 'روکیں' : 'Stop') : (isUrdu ? 'سنیں' : 'Read Aloud')}</span>
                    </button>
                  </div>

                  {/* Key Legal Concepts */}
                  {msg.responsePayload.legalConcepts?.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-extrabold text-[#5A6E78] uppercase tracking-wider">
                        {isUrdu ? 'متعلقہ قانونی شقیں و حقوق:' : 'Identified Legal Remedies & Rights:'}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.responsePayload.legalConcepts.map((concept, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-xl bg-[#ECF4F4] text-[#1C2C34] text-xs border border-[#BCD4D4] font-bold"
                          >
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interactive Action Confirmation (if triggered by intent, e.g. Call Contact, Send Complaint) */}
                  {msg.responsePayload.actionConfirmation && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 rounded-2xl bg-[#F4F4FC] border border-[#C4D4DC] text-xs space-y-2.5 shadow-xs"
                    >
                      <div className="flex items-center space-x-2 text-[#1C2C34] font-bold">
                        <Sparkles className="w-4 h-4 text-[#FC7454]" />
                        <span>{isUrdu ? 'کارروائی کی توثیق (Confirmation Required)' : 'Action Confirmation'}</span>
                      </div>
                      <p className="text-[#5A6E78] font-medium">
                        {msg.responsePayload.actionConfirmation.prompt}
                      </p>

                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        {msg.responsePayload.actionConfirmation.actionType === 'call' && (
                          <a
                            href={`tel:${msg.responsePayload.actionConfirmation.targetPhone || ''}`}
                            onClick={() => onLogAudit?.('chat_action_executed', `Initiated call to ${msg.responsePayload?.actionConfirmation?.targetName}`)}
                            className="px-4 py-2 rounded-xl bg-[#ECF4F4] hover:bg-[#BCD4D4]/30 text-[#1C2C34] font-bold flex items-center space-x-1.5 shadow-xs transition border border-[#BCD4D4] cursor-pointer"
                          >
                            <PhoneCall className="w-3.5 h-3.5 text-[#FC7454]" />
                            <span>{msg.responsePayload.actionConfirmation.buttonLabel}</span>
                          </a>
                        )}

                        {msg.responsePayload.actionConfirmation.actionType === 'send_complaint' && (
                          <button
                            onClick={() => {
                              // #31: Aggregate user messages for complaint
                              const allUserMsgs = messages
                                .filter(m => m.sender === 'user' && m.text && !m.text.startsWith('['))
                                .map(m => m.text);
                              const aggregated = allUserMsgs.join('\n\n');
                              const summary = aggregated || msg.responsePayload?.answerSummary || 'Complaint Summary';
                              const category = (msg.responsePayload?.legalConcepts?.[0]) || 'domestic_violence';
                              onOpenComplaintWithData?.(summary, category);
                              onLogAudit?.('chat_action_executed', `Routed to complaint builder for ${msg.responsePayload?.actionConfirmation?.targetName}`);
                            }}
                            className="px-4 py-2 rounded-xl bg-[#1C2C34] hover:bg-[#263842] text-white font-bold flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#BCD4D4]" />
                            <span>{msg.responsePayload.actionConfirmation.buttonLabel}</span>
                          </button>
                        )}

                        {msg.responsePayload.actionConfirmation.actionType === 'share_location' && (
                          <button
                            onClick={() => {
                              alert(isUrdu ? 'آپ کی موجودہ محفوظ لوکیشن ہنگامی رابطوں کو بھیج دی گئی ہے۔' : `Live location dispatched to ${msg.responsePayload?.actionConfirmation?.targetName || 'Emergency Contacts'}`);
                              onLogAudit?.('chat_action_executed', `Shared live location with contacts`);
                            }}
                            className="px-4 py-2 rounded-xl bg-[#ECF4F4] hover:bg-[#BCD4D4]/30 text-[#1C2C34] font-bold flex items-center space-x-1.5 shadow-xs transition border border-[#BCD4D4] cursor-pointer"
                          >
                            <MapPin className="w-3.5 h-3.5 text-[#FC7454]" />
                            <span>{msg.responsePayload.actionConfirmation.buttonLabel}</span>
                          </button>
                        )}

                        {msg.responsePayload.actionConfirmation.actionType === 'sos' && (
                          <button
                            onClick={() => onOpenCrisis?.()}
                            className="px-4 py-2 rounded-xl bg-[#FC7454] hover:bg-[#FC7C54] text-white font-bold flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>{msg.responsePayload.actionConfirmation.buttonLabel}</span>
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Clean, Compact References Dropdown (Redesigned into minimal clickable list) */}
                  {msg.responsePayload.sourceReferences?.length > 0 && (
                    <div className="pt-1">
                      <button
                        onClick={() => setExpandedCitation(expandedCitation === msg.id ? null : msg.id)}
                        className="flex items-center space-x-1.5 text-xs font-bold text-[#5A6E78] hover:text-[#1C2C34] transition-colors py-1 group cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-[#FC7454]" />
                        <span>{isUrdu ? `حوالہ جات (${msg.responsePayload.sourceReferences.length}) ▾` : `References (${msg.responsePayload.sourceReferences.length}) ▾`}</span>
                        {expandedCitation === msg.id ? (
                          <ChevronUp className="w-3.5 h-3.5 text-[#5A6E78] group-hover:text-[#1C2C34]" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-[#5A6E78] group-hover:text-[#1C2C34]" />
                        )}
                      </button>

                      <AnimatePresence>
                        {expandedCitation === msg.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 space-y-1.5 pl-5 border-l-2 border-[#BCD4D4] overflow-hidden"
                          >
                            {msg.responsePayload.sourceReferences.map((citation: LegalSourceCitation, cIdx: number) => (
                              <div key={cIdx} className="py-1">
                                <a
                                  href={citation.url || '#'}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs font-bold text-[#1C2C34] hover:text-[#FC7454] hover:underline flex items-center space-x-1.5 transition-colors"
                                >
                                  <span>{citation.document} — {citation.section}: {citation.sectionTitle}</span>
                                  <ExternalLink className="w-3 h-3 text-[#5A6E78] hover:text-[#FC7454] flex-shrink-0" />
                                </a>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Action Shortcuts */}
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        const title = msg.responsePayload?.legalConcepts?.[0] || 'Legal Advisory Note';
                        const summary = msg.responsePayload?.answerSummary || msg.text;
                        onOpenVaultWithDraft?.(title, summary);
                      }}
                      className="px-3.5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-[#1C2C34] flex items-center justify-center space-x-2 transition shadow-xs cursor-pointer"
                    >
                      <Bookmark className="w-4 h-4 text-[#FC7454]" />
                      <span>{isUrdu ? 'پرائیویٹ نوٹ میں محفوظ کریں' : 'Save to Private Notes'}</span>
                    </button>

                    <button
                      onClick={() => {
                        // #31: Aggregate ALL user messages from current conversation
                        const allUserMessages = messages
                          .filter(m => m.sender === 'user' && m.text && !m.text.startsWith('['))
                          .map(m => m.text);
                        const aggregated = allUserMessages.join('\n\n');
                        const summary = aggregated || msg.responsePayload?.answerSummary || msg.text;
                        const cat = msg.responsePayload?.legalConcepts?.[0] || 'domestic_violence';
                        const photos = msg.photos || [];
                        onOpenComplaintWithData?.(summary, cat, photos);
                      }}
                      className="px-3.5 py-2.5 rounded-2xl bg-[#1C2C34] hover:bg-[#263842] text-xs font-bold text-white flex items-center justify-center space-x-2 shadow-xs transition cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-[#BCD4D4]" />
                      <span>{isUrdu ? 'درخواست کا ڈرافٹ تیار کریں' : 'Prepare Complaint Draft'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2.5 text-[#1C2C34] text-xs sm:text-sm font-bold p-3.5 rounded-2xl bg-white border border-[#BCD4D4] w-fit shadow-xs">
            <RefreshCw className="w-4 h-4 animate-spin text-[#FC7454]" />
            <span>{isUrdu ? 'پنجاب کے قوانین میں تلاش اور تصدیق کی تیاری...' : 'Synthesizing source-grounded legal analysis for Punjab...'}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Quick Prompts (ChatGPT style) */}
      <div className="py-1.5 border-t border-slate-200/80">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[11px] font-semibold text-[#5A6E78] shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#FC7454]" />
            <span>{isUrdu ? 'فوری سوالات:' : 'Quick prompts:'}</span>
          </span>
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt.id}
              type="button"
              onClick={() => handleSend(prompt.query)}
              className="px-2.5 py-1 rounded-full bg-slate-50 hover:bg-[#ECF4F4] border border-slate-200 hover:border-[#BCD4D4] text-[11px] font-medium text-[#1C2C34] transition shrink-0 shadow-2xs hover:shadow-xs cursor-pointer active:scale-95 flex items-center space-x-1"
            >
              <span>{isUrdu ? prompt.labelUrdu : prompt.labelEn}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Active Location & Photo Preview Chips Bar */}
      {(activeLocation || attachedPhotos.length > 0 || isVoiceRecording) && (
        <div className="pb-2 flex flex-wrap items-center gap-2">
          {/* Active Location Badge */}
          {activeLocation && (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#ECF4F4] border border-[#BCD4D4] text-xs font-bold text-[#1C2C34] shadow-xs">
              <MapPin className="w-3.5 h-3.5 text-[#FC7454]" />
              <span>{isUrdu ? 'مقام:' : 'Location:'} {activeLocation}</span>
              <button
                onClick={() => setActiveLocation(null)}
                className="hover:text-red-500 ml-1 p-0.5 cursor-pointer"
                title="Remove location tag"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Attached Photo Preview Badges */}
          {attachedPhotos.map((photo, idx) => (
            <div key={idx} className="relative group flex items-center space-x-1 px-2 py-1 rounded-xl bg-slate-100 border border-slate-200">
              <img src={photo} alt="Thumbnail" className="w-6 h-6 object-cover rounded-lg" />
              <span className="text-[11px] font-bold text-[#1C2C34]">{isUrdu ? 'تصویر ثبوت' : 'Evidence Photo'}</span>
              <button
                onClick={() => removeAttachedPhoto(idx)}
                className="text-slate-400 hover:text-red-500 p-0.5 ml-1 cursor-pointer"
                title="Remove photo"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {/* Active Voice Recording Indicator (#24: Stop Recording button) */}
          {isVoiceRecording && (
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold ${
              voiceError
                ? 'bg-rose-50 border border-rose-200 text-rose-600'
                : 'bg-[#ECF4F4] border border-[#FC7454]/40 text-[#FC7454]'
            }`}>
              <Mic className={`w-3.5 h-3.5 ${voiceError ? '' : 'animate-pulse'}`} />
              <span className="flex-1">
                {voiceError
                  ? voiceError
                  : (isUrdu ? 'ریکارڈنگ جاری... بولیں' : 'Recording... Speak freely')}
              </span>
              {!voiceError && speechTranscript && (
                <span className="text-[10px] text-[#5A6E78] max-w-[120px] truncate hidden sm:inline">{speechTranscript}</span>
              )}
              <button
                onClick={handleToggleVoiceRecording}
                className="ml-2 px-3 py-1 rounded-lg bg-[#FC7454] text-white text-xs font-black hover:bg-[#FC7C54] transition cursor-pointer flex items-center gap-1"
              >
                {voiceError ? <X className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
                <span>{voiceError ? (isUrdu ? 'بند کریں' : 'Dismiss') : (isUrdu ? 'روکیں' : 'Stop')}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 5. Compact Unified Chat Bar */}
      <div className="pt-1 relative">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative"
        >
          {/* Hidden File Input for Photos */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoSelect}
            accept="image/*"
            multiple
            className="hidden"
          />

          {/* Unified Input Container */}
          <div className="w-full bg-slate-50 border border-slate-200 focus-within:border-[#FC7454] focus-within:ring-2 focus-within:ring-[#FC7454]/20 rounded-2xl flex items-center px-1.5 py-1.5 shadow-2xs transition gap-1 relative">
            
            {/* Combined Attachment & Location Menu Button */}
            <div className="relative" ref={attachMenuRef}>
              <button
                type="button"
                onClick={() => setIsAttachMenuOpen(!isAttachMenuOpen)}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer ${
                  attachedPhotos.length > 0 || activeLocation
                    ? 'bg-[#ECF4F4] text-[#FC7454] border border-[#BCD4D4]'
                    : 'text-[#5A6E78] hover:text-[#1C2C34] hover:bg-slate-200/60'
                }`}
                title={isUrdu ? 'منسلک کریں' : 'Attach photo or location'}
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Popover Menu for Attachments & Location */}
              {isAttachMenuOpen && (
                <div className="absolute bottom-full mb-2 left-0 bg-white rounded-2xl border border-[#BCD4D4] shadow-lg p-1.5 flex flex-col min-w-[160px] z-30">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAttachMenuOpen(false);
                      fileInputRef.current?.click();
                    }}
                    className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#1C2C34] hover:bg-[#ECF4F4] cursor-pointer text-left"
                  >
                    <Paperclip className="w-4 h-4 text-[#FC7454]" />
                    <span>{isUrdu ? 'تصویر ثبوت' : 'Attach Photo'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAttachMenuOpen(false);
                      setIsLocationModalOpen(true);
                    }}
                    className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#1C2C34] hover:bg-[#ECF4F4] cursor-pointer text-left"
                  >
                    <MapPin className="w-4 h-4 text-[#FC7454]" />
                    <span>{isUrdu ? 'مقام منتخب کریں' : 'Tag Location'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Voice Mode Button inside chat bar */}
            <button
              type="button"
              onClick={handleToggleVoiceRecording}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer ${
                isVoiceRecording
                  ? 'bg-[#FC7454] text-white animate-pulse shadow-xs'
                  : 'text-[#5A6E78] hover:text-[#1C2C34] hover:bg-slate-200/60'
              }`}
              title={isVoiceRecording ? (isUrdu ? 'ریکارڈنگ روکیں' : 'Stop Recording') : (isUrdu ? 'بولیں' : 'Voice Input')}
            >
              {isVoiceRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isUrdu
                  ? 'اپنا سوال لکھیں یا بولیں...'
                  : 'Ask about legal rights or protection...'
              }
              className={`flex-1 bg-transparent border-0 focus:outline-none px-2 py-1 text-sm sm:text-base text-[#1C2C34] placeholder:text-slate-400 ${
                isUrdu ? 'font-urdu' : 'font-medium'
              }`}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={(!inputText.trim() && attachedPhotos.length === 0) || loading}
              className="w-8 h-8 rounded-xl bg-[#1C2C34] hover:bg-[#263842] disabled:opacity-30 text-white transition shadow-2xs flex items-center justify-center cursor-pointer shrink-0"
              title={isUrdu ? 'بھیجیں' : 'Send'}
            >
              <Send className="w-3.5 h-3.5 text-[#BCD4D4]" />
            </button>
          </div>
        </form>

        {/* Short, precise safety subtitle */}
        <div className="flex items-center justify-center space-x-1.5 mt-2 text-[10px] sm:text-xs text-[#5A6E78]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#1C2C34]" />
          <span>
            {isUrdu 
              ? 'مکمل نجی اور انکرپٹڈ۔ کوئی ڈیٹا شیئر نہیں کیا جاتا۔' 
              : 'Private & encrypted. Never shared externally.'}
          </span>
        </div>
      </div>

      {/* 6. Location Picker Modal */}
      <AnimatePresence>
        {isLocationModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#BCD4D4] rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4 text-[#1C2C34]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-[#ECF4F4] text-[#FC7454] flex items-center justify-center border border-[#BCD4D4]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold">{isUrdu ? 'مقام منتخب کریں' : 'Tag Incident Location'}</h3>
                    <p className="text-xs text-[#5A6E78]">{isUrdu ? 'پنجاب کا ضلع یا علاقہ منتخب کریں' : 'Choose your Punjab district or area'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsLocationModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Auto GPS Detection Button */}
              <button
                onClick={handleDetectGPS}
                disabled={isDetectingGps}
                className="w-full p-3 rounded-2xl bg-[#1C2C34] hover:bg-[#263842] text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                <Radio className={`w-4 h-4 text-[#BCD4D4] ${isDetectingGps ? 'animate-pulse' : ''}`} />
                <span>{isDetectingGps ? (isUrdu ? 'مقام تلاش ہو رہا ہے...' : 'Detecting GPS Location...') : (isUrdu ? 'موجودہ جی پی ایس مقام حاصل کریں' : 'Use Current Live GPS Location')}</span>
              </button>

              {/* Quick Popular Locations */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-[#5A6E78] uppercase tracking-wider">
                  {isUrdu ? 'مشہور اضلاع و مقامات:' : 'Popular Punjab Locations:'}
                </span>
                <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {POPULAR_PUNJAB_LOCATIONS.map((loc, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveLocation(loc);
                        setIsLocationModalOpen(false);
                      }}
                      className="p-2 rounded-xl text-left text-xs font-semibold bg-slate-50 hover:bg-[#ECF4F4] text-[#1C2C34] border border-slate-200 truncate transition cursor-pointer"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <input
                  type="text"
                  value={customLocationInput}
                  onChange={(e) => setCustomLocationInput(e.target.value)}
                  placeholder={isUrdu ? 'یا کوئی اور مقام لکھیں...' : 'Or type custom location (e.g. Wapda Town, Gujrat)...'}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#1C2C34]"
                />
                <button
                  onClick={() => {
                    if (customLocationInput.trim()) {
                      setActiveLocation(customLocationInput.trim());
                      setCustomLocationInput('');
                      setIsLocationModalOpen(false);
                    }
                  }}
                  disabled={!customLocationInput.trim()}
                  className="w-full py-2 rounded-xl bg-[#1C2C34] hover:bg-[#263842] text-white text-xs font-bold disabled:opacity-30 cursor-pointer"
                >
                  {isUrdu ? 'مقام شامل کریں' : 'Apply Location'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
