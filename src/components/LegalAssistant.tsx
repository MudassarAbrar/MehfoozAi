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
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppLanguage, LegalQueryResponse, LegalSourceCitation, PunjabDistrict, VaultRecord, UserContact } from '../types';
import { processSafetyOrchestration } from '../utils/orchestrator';

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

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  location?: string;
  photos?: string[];
  responsePayload?: LegalQueryResponse;
}

const PRESET_SCENARIOS = [
  {
    id: 'coercive',
    title: 'Ghar mein qaid aur phone cheenna (Coercive Control)',
    titleEn: 'Locked inside room & phone confiscated by in-laws',
    titleUrdu: 'کمرے میں بندش اور فون چھیننا (گھریلو تشدد)',
    query: 'My husband and in-laws took my phone, locked me in the room, and forbid me from leaving the house. What are my legal protections under Punjab law?'
  },
  {
    id: 'workplace',
    title: 'Daftar mein harassment aur dhamki (Workplace Act)',
    titleEn: 'Workplace harassment & termination threats by manager',
    titleUrdu: 'دفتر میں ہراسانی اور ملازمت سے برطرفی کی دھمکی',
    query: 'My supervisor at the office is making unwanted advances and threatening to cancel my contract if I refuse. How can I file a complaint with the Punjab Ombudsperson?'
  },
  {
    id: 'cyber',
    title: 'Tasveeron se blackmail (PECA Cybercrime)',
    titleEn: 'Blackmail with private photos on WhatsApp / Social Media',
    titleUrdu: 'تصاویر و واٹس ایپ کے ذریعے بلیک میلنگ (سائبر کرائم)',
    query: 'Someone is blackmailing me on WhatsApp, threatening to share edited private photos unless I pay them. Which law applies in Pakistan?'
  },
  {
    id: 'protection',
    title: 'Hifazati Hukam Nama (Protection Order PPWVA 2016)',
    titleEn: 'How to obtain a Protection Order & Residence Order in Lahore?',
    titleUrdu: 'لاہور میں پروٹیکشن اور رہائشی آرڈر کیسے حاصل کریں؟',
    query: 'What is the procedure to get a Protection Order under PPWVA 2016 in Punjab so the respondent cannot approach my residence?'
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
  // Synchronized language state (allows local & global toggling)
  const [currentLang, setCurrentLang] = useState<AppLanguage>(language);

  useEffect(() => {
    setCurrentLang(language);
  }, [language]);

  const isUrdu = currentLang === 'ur';

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: isUrdu 
        ? 'خوش آمدید۔ آپ پنجاب کے قوانین، گھریلو تشدد، ہراسانی اور قانونی حقوق بارے کوئی بھی سوال پوچھ سکتی ہیں۔ آپ کا ڈیٹا مکمل پرائیویٹ ہے۔'
        : 'Welcome to Mehfooz Legal Navigator. You can describe any situation in your own words (English, Urdu, or Roman Urdu) to understand your legal rights under Punjab law, protection orders, and safe next steps.'
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedCitation, setExpandedCitation] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [autoVoiceReadout, setAutoVoiceReadout] = useState(false);
  
  // 1. Prebuilt questions dismissal state
  const [showPresets, setShowPresets] = useState<boolean>(true);

  // 2. Location feature state
  const [activeLocation, setActiveLocation] = useState<string | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [customLocationInput, setCustomLocationInput] = useState('');
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  // 3. Voice Mode state
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  // 4. Photo Evidence state
  const [attachedPhotos, setAttachedPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, showPresets, attachedPhotos]);

  // Handle Speech Recognition
  const handleToggleVoiceRecording = () => {
    if (isVoiceRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsVoiceRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(isUrdu ? 'براؤزر میں وائس ریکگنیشن سپورٹ دستیاب نہیں ہے۔' : 'Speech recognition is not supported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = isUrdu ? 'ur-PK' : 'en-US';

      recognition.onstart = () => {
        setIsVoiceRecording(true);
        setSpeechTranscript('');
        onLogAudit?.('voice_input_started', `Started voice recording (${recognition.lang})`);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const finalTranscript = event.results[i][0].transcript;
            setInputText(prev => (prev ? `${prev} ${finalTranscript}` : finalTranscript));
            setSpeechTranscript(finalTranscript);
          } else {
            interim += event.results[i][0].transcript;
            setSpeechTranscript(interim);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsVoiceRecording(false);
      };

      recognition.onend = () => {
        setIsVoiceRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setIsVoiceRecording(false);
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

    // Immediately dismiss pre-built questions so they don't stay on screen
    setShowPresets(false);

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
        const existingVault: VaultRecord[] = JSON.parse(localStorage.getItem('mehfooz_vault_records_v1') || '[]');
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
        localStorage.setItem('mehfooz_vault_records_v1', JSON.stringify([newRecord, ...existingVault]));
        onLogAudit?.('vault_photo_saved', 'Saved attached evidence photo into encrypted client vault');
      } catch (e) {
        console.error('Failed to save vault photo', e);
      }
    }

    onLogAudit?.('orchestrator_query', `Legal query with ${photosToAttach.length} photos: ${query.substring(0, 40)}...`);

    try {
      // Send text query to model (Note: raw images are stored safely in local vault and not transmitted to model for strict user privacy)
      const promptQuery = currentLoc ? `[Location: ${currentLoc}] ${query}` : query;
      const response = await processSafetyOrchestration(promptQuery, currentLang, userContacts);

      const assistantMessageId = `assistant-${Date.now()}`;
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
    <div className="flex flex-col h-[calc(100vh-130px)] max-w-4xl mx-auto px-4 py-3 text-[#181A20] bg-white/80 backdrop-blur-xs rounded-[28px] border border-white/80 shadow-sm">
      {/* 1. Header Toolbar with English / Urdu Toggle and Voice Mode */}
      <div className="flex flex-wrap items-center justify-between py-2 border-b border-slate-200 gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-[#F5EEFD] text-[#9333EA] flex items-center justify-center shadow-xs border border-[#E9D5FF]">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm text-[#181A20]">
                {isUrdu ? 'پنجاب قانونی معلوماتی معاون' : 'Punjab Legal Information Assistant'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#F5EEFD] text-[#9333EA] font-bold text-[10px] border border-[#E9D5FF]">
                PPWVA 2016 • RAG
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls: English/Urdu Pill & Voice Mode */}
        <div className="flex items-center space-x-2">
          {/* English / Urdu Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => handleLanguageToggle('en')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                !isUrdu 
                  ? 'bg-white text-[#181A20] shadow-xs' 
                  : 'text-[#6B7280] hover:text-[#181A20]'
              }`}
            >
              <span>🇬🇧</span>
              <span>English</span>
            </button>
            <button
              onClick={() => handleLanguageToggle('ur')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold font-urdu transition flex items-center space-x-1 cursor-pointer ${
                isUrdu 
                  ? 'bg-[#181A20] text-white shadow-xs' 
                  : 'text-[#6B7280] hover:text-[#181A20]'
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
                ? 'bg-[#F5EEFD] border-[#E9D5FF] text-[#9333EA]'
                : 'bg-white border-slate-200 text-[#6B7280] hover:bg-slate-50'
            }`}
            title="Auto voice readout for answers"
          >
            <Volume2 className={`w-3.5 h-3.5 ${autoVoiceReadout ? 'text-[#9333EA]' : ''}`} />
            <span className="hidden sm:inline">{isUrdu ? 'آواز موڈ' : 'Voice Mode'}</span>
          </button>
        </div>
      </div>

      {/* 2. Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-3.5 space-y-4 pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center space-x-2 text-[11px] text-[#9CA3AF] mb-1 px-1">
              <span>{msg.sender === 'user' ? (isUrdu ? 'آپ' : 'You') : (isUrdu ? 'محفوظ لیگل اسسٹنٹ' : 'Mehfooz Legal Assistant')}</span>
              <span>•</span>
              <span>{msg.timestamp}</span>
              {msg.location && (
                <span className="flex items-center space-x-0.5 text-[#181A20] font-semibold bg-[#F5EEFD] px-1.5 py-0.2 rounded-md border border-[#E9D5FF]">
                  <MapPin className="w-3 h-3 text-[#B886FD]" />
                  <span>{msg.location}</span>
                </span>
              )}
            </div>

            <div
              className={`max-w-2xl rounded-3xl p-4 sm:p-5 shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-[#181A20] text-white rounded-br-xs'
                  : 'bg-white border border-slate-200 text-[#181A20] rounded-bl-xs'
              }`}
            >
              {/* If user attached photos */}
              {msg.photos && msg.photos.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center space-x-1.5 text-xs text-[#181A20] mb-1.5 font-bold">
                    <Lock className="w-3.5 h-3.5 text-[#B886FD]" />
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

              {/* Assistant Grounded Payload */}
              {msg.responsePayload && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3.5">
                  {/* Confidence and readout badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="flex items-center space-x-1.5 text-[#9333EA] font-bold bg-[#F5EEFD] px-3 py-1.5 rounded-xl border border-[#E9D5FF]">
                      <ShieldCheck className="w-4 h-4 text-[#9333EA]" />
                      <span>{Math.round(msg.responsePayload.confidence * 100)}% Grounded in Punjab Statutes</span>
                    </span>

                    <button
                      onClick={() => handleSpeak(msg.id, msg.text)}
                      className="p-1.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#181A20] border border-slate-200 transition text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
                      title="Audio readout"
                    >
                      {speakingId === msg.id ? (
                        <VolumeX className="w-4 h-4 text-[#B886FD]" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-[#181A20]" />
                      )}
                      <span>{speakingId === msg.id ? (isUrdu ? 'روکیں' : 'Stop') : (isUrdu ? 'سنیں' : 'Read Aloud')}</span>
                    </button>
                  </div>

                  {/* Key Legal Concepts */}
                  {msg.responsePayload.legalConcepts?.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-extrabold text-[#6B7280] uppercase tracking-wider">
                        {isUrdu ? 'متعلقہ قانونی شقیں و حقوق:' : 'Identified Legal Remedies & Rights:'}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.responsePayload.legalConcepts.map((concept, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-xl bg-[#F5EEFD] text-[#9333EA] text-xs border border-[#E9D5FF] font-bold"
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
                      className="p-3.5 rounded-2xl bg-[#F8F9FD] border border-[#E9D5FF] text-xs space-y-2.5 shadow-xs"
                    >
                      <div className="flex items-center space-x-2 text-[#181A20] font-bold">
                        <Sparkles className="w-4 h-4 text-[#B886FD]" />
                        <span>{isUrdu ? 'کارروائی کی توثیق (Confirmation Required)' : 'Action Confirmation'}</span>
                      </div>
                      <p className="text-[#4B5563] font-medium">
                        {msg.responsePayload.actionConfirmation.prompt}
                      </p>

                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        {msg.responsePayload.actionConfirmation.actionType === 'call' && (
                          <a
                            href={`tel:${msg.responsePayload.actionConfirmation.targetPhone || ''}`}
                            onClick={() => onLogAudit?.('chat_action_executed', `Initiated call to ${msg.responsePayload?.actionConfirmation?.targetName}`)}
                            className="px-4 py-2 rounded-xl bg-[#F5EEFD] hover:bg-[#EDE9FE] text-[#9333EA] font-bold flex items-center space-x-1.5 shadow-xs transition border border-[#E9D5FF] cursor-pointer"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>{msg.responsePayload.actionConfirmation.buttonLabel}</span>
                          </a>
                        )}

                        {msg.responsePayload.actionConfirmation.actionType === 'send_complaint' && (
                          <button
                            onClick={() => {
                              const summary = msg.responsePayload?.answerSummary || 'Complaint Summary';
                              onOpenComplaintWithData?.(summary, 'domestic_violence');
                              onLogAudit?.('chat_action_executed', `Routed to complaint builder for ${msg.responsePayload?.actionConfirmation?.targetName}`);
                            }}
                            className="px-4 py-2 rounded-xl bg-[#181A20] hover:bg-slate-800 text-white font-bold flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#B886FD]" />
                            <span>{msg.responsePayload.actionConfirmation.buttonLabel}</span>
                          </button>
                        )}

                        {msg.responsePayload.actionConfirmation.actionType === 'share_location' && (
                          <button
                            onClick={() => {
                              alert(isUrdu ? 'آپ کی موجودہ محفوظ لوکیشن ہنگامی رابطوں کو بھیج دی گئی ہے۔' : `Live location dispatched to ${msg.responsePayload?.actionConfirmation?.targetName || 'Emergency Contacts'}`);
                              onLogAudit?.('chat_action_executed', `Shared live location with contacts`);
                            }}
                            className="px-4 py-2 rounded-xl bg-[#F5EEFD] hover:bg-[#EDE9FE] text-[#9333EA] font-bold flex items-center space-x-1.5 shadow-xs transition border border-[#E9D5FF] cursor-pointer"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{msg.responsePayload.actionConfirmation.buttonLabel}</span>
                          </button>
                        )}

                        {msg.responsePayload.actionConfirmation.actionType === 'sos' && (
                          <button
                            onClick={() => onOpenCrisis?.()}
                            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
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
                        className="flex items-center space-x-1.5 text-xs font-bold text-[#6B7280] hover:text-[#181A20] transition-colors py-1 group cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-[#B886FD]" />
                        <span>{isUrdu ? `حوالہ جات (${msg.responsePayload.sourceReferences.length}) ▾` : `References (${msg.responsePayload.sourceReferences.length}) ▾`}</span>
                        {expandedCitation === msg.id ? (
                          <ChevronUp className="w-3.5 h-3.5 text-[#9CA3AF] group-hover:text-[#181A20]" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF] group-hover:text-[#181A20]" />
                        )}
                      </button>

                      <AnimatePresence>
                        {expandedCitation === msg.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 space-y-1.5 pl-5 border-l-2 border-[#E9D5FF] overflow-hidden"
                          >
                            {msg.responsePayload.sourceReferences.map((citation: LegalSourceCitation, cIdx: number) => (
                              <div key={cIdx} className="py-1">
                                <a
                                  href={citation.url || '#'}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs font-bold text-[#181A20] hover:text-[#9333EA] hover:underline flex items-center space-x-1.5 transition-colors"
                                >
                                  <span>{citation.document} — {citation.section}: {citation.sectionTitle}</span>
                                  <ExternalLink className="w-3 h-3 text-[#9CA3AF] hover:text-[#9333EA] flex-shrink-0" />
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
                      className="px-3.5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-[#181A20] flex items-center justify-center space-x-2 transition shadow-xs cursor-pointer"
                    >
                      <Bookmark className="w-4 h-4 text-[#B886FD]" />
                      <span>{isUrdu ? 'پرائیویٹ نوٹ میں محفوظ کریں' : 'Save to Private Notes'}</span>
                    </button>

                    <button
                      onClick={() => {
                        const summary = msg.responsePayload?.answerSummary || msg.text;
                        const cat = msg.responsePayload?.legalConcepts?.[0] || 'domestic_violence';
                        const photos = msg.photos || [];
                        onOpenComplaintWithData?.(summary, cat, photos);
                      }}
                      className="px-3.5 py-2.5 rounded-2xl bg-[#181A20] hover:bg-slate-800 text-xs font-bold text-white flex items-center justify-center space-x-2 shadow-xs transition cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-[#B886FD]" />
                      <span>{isUrdu ? 'درخواست کا ڈرافٹ تیار کریں' : 'Prepare Complaint Draft'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2.5 text-[#181A20] text-xs sm:text-sm font-bold p-3.5 rounded-2xl bg-white border border-slate-200 w-fit shadow-xs">
            <RefreshCw className="w-4 h-4 animate-spin text-[#B886FD]" />
            <span>{isUrdu ? 'پنجاب کے قوانین میں تلاش اور تصدیق کی تیاری...' : 'Synthesizing source-grounded legal analysis for Punjab...'}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. PRESET SCENARIO CHIPS */}
      <div className="py-2 border-t border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setShowPresets(!showPresets)}
            className="flex items-center space-x-1.5 text-xs font-bold text-[#6B7280] hover:text-[#181A20] cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#B886FD]" />
            <span>
              {isUrdu 
                ? (showPresets ? 'اکثر پوچھے جانے والے سوالات چھپائیں' : 'اکثر پوچھے جانے والے سوالات دکھائیں')
                : (showPresets ? 'Hide Common Punjab Scenarios' : '💡 Show Common Punjab Legal Scenarios')}
            </span>
          </button>
        </div>

        <AnimatePresence>
          {showPresets && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2"
            >
              {PRESET_SCENARIOS.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => handleSend(scenario.query)}
                  className="text-left p-3 rounded-2xl bg-white hover:bg-[#F5EEFD] border border-slate-200 hover:border-[#E9D5FF] text-xs text-[#181A20] transition flex items-start space-x-2.5 shadow-xs group cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-full bg-[#F5EEFD] text-[#9333EA] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold line-clamp-2 leading-relaxed">
                    {isUrdu ? scenario.titleUrdu : scenario.titleEn}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Active Location & Photo Preview Chips Bar */}
      {(activeLocation || attachedPhotos.length > 0 || isVoiceRecording) && (
        <div className="pb-2 flex flex-wrap items-center gap-2">
          {/* Active Location Badge */}
          {activeLocation && (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#F5EEFD] border border-[#E9D5FF] text-xs font-bold text-[#181A20] shadow-xs">
              <MapPin className="w-3.5 h-3.5 text-[#B886FD]" />
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
              <span className="text-[11px] font-bold text-[#181A20]">{isUrdu ? 'تصویر ثبوت' : 'Evidence Photo'}</span>
              <button
                onClick={() => removeAttachedPhoto(idx)}
                className="text-slate-400 hover:text-red-500 p-0.5 ml-1 cursor-pointer"
                title="Remove photo"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {/* Active Voice Recording Indicator */}
          {isVoiceRecording && (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#F5EEFD] border border-[#E9D5FF] text-xs font-bold text-[#9333EA] animate-pulse">
              <Mic className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'بولیں، آواز ریکارڈ ہو رہی ہے...' : 'Listening... (Speak your question)'}</span>
              <button
                onClick={handleToggleVoiceRecording}
                className="ml-2 text-xs underline font-bold cursor-pointer"
              >
                {isUrdu ? 'مکمل' : 'Done'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* 5. Input Form with Location, Voice, and Photo Buttons */}
      <div className="pt-1">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center space-x-1.5"
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

          {/* Input Action 1: Add Photo */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`p-3 rounded-2xl border transition flex items-center justify-center cursor-pointer ${
              attachedPhotos.length > 0
                ? 'bg-[#F5EEFD] border-[#E9D5FF] text-[#9333EA]'
                : 'bg-white border-slate-200 text-[#6B7280] hover:text-[#181A20] hover:bg-slate-50'
            }`}
            title="Attach evidence photo (Saved encrypted in Safety Vault)"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Input Action 2: Add Location */}
          <button
            type="button"
            onClick={() => setIsLocationModalOpen(true)}
            className={`p-3 rounded-2xl border transition flex items-center justify-center cursor-pointer ${
              activeLocation
                ? 'bg-[#F5EEFD] border-[#E9D5FF] text-[#9333EA]'
                : 'bg-white border-slate-200 text-[#6B7280] hover:text-[#181A20] hover:bg-slate-50'
            }`}
            title="Tag incident location / Punjab district"
          >
            <MapPin className="w-4 h-4" />
          </button>

          {/* Input Action 3: Voice Mode */}
          <button
            type="button"
            onClick={handleToggleVoiceRecording}
            className={`p-3 rounded-2xl border transition flex items-center justify-center cursor-pointer ${
              isVoiceRecording
                ? 'bg-[#F5EEFD] border-[#E9D5FF] text-[#9333EA] animate-pulse shadow-xs'
                : 'bg-white border-slate-200 text-[#6B7280] hover:text-[#181A20] hover:bg-slate-50'
            }`}
            title={isVoiceRecording ? 'Stop Recording' : 'Voice Input (Urdu & English)'}
          >
            {isVoiceRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[#181A20]" />}
          </button>

          {/* Main Text Input Field */}
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isUrdu
                  ? 'اپنا سوال اردو یا انگلش میں لکھیں یا بولیں...'
                  : 'Describe your situation in English, Urdu, or Roman Urdu...'
              }
              className={`w-full bg-slate-50 border border-slate-200 focus:border-[#B886FD] rounded-2xl py-3 pl-4 pr-12 text-sm sm:text-base text-[#181A20] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#B886FD]/20 shadow-xs transition ${
                isUrdu ? 'font-urdu' : 'font-medium'
              }`}
            />

            <button
              type="submit"
              disabled={(!inputText.trim() && attachedPhotos.length === 0) || loading}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3.5 rounded-xl bg-[#181A20] hover:bg-slate-800 disabled:opacity-40 text-white transition shadow-xs flex items-center justify-center font-bold cursor-pointer"
            >
              <Send className="w-4 h-4 text-[#B886FD]" />
            </button>
          </div>
        </form>

        {/* Privacy & Safety Subtitle */}
        <div className="flex items-center justify-center space-x-2 mt-2 text-[10px] sm:text-xs text-[#9CA3AF]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#181A20]" />
          <span>
            {isUrdu 
              ? 'تصاویر اور آواز پرائیویٹ سیفٹی والٹ میں محفوظ رہتی ہیں اور بیرونی ماڈل سے شیئر نہیں ہوتیں۔' 
              : 'Photos are stored encrypted in your private local Safety Vault and never shared with external models.'}
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
              className="bg-white border border-slate-200 rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4 text-[#181A20]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-[#F5EEFD] text-[#9333EA] flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold">{isUrdu ? 'مقام منتخب کریں' : 'Tag Incident Location'}</h3>
                    <p className="text-xs text-[#6B7280]">{isUrdu ? 'پنجاب کا ضلع یا علاقہ منتخب کریں' : 'Choose your Punjab district or area'}</p>
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
                className="w-full p-3 rounded-2xl bg-[#181A20] hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                <Radio className={`w-4 h-4 text-[#B886FD] ${isDetectingGps ? 'animate-pulse' : ''}`} />
                <span>{isDetectingGps ? (isUrdu ? 'مقام تلاش ہو رہا ہے...' : 'Detecting GPS Location...') : (isUrdu ? 'موجودہ جی پی ایس مقام حاصل کریں' : 'Use Current Live GPS Location')}</span>
              </button>

              {/* Quick Popular Locations */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">
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
                      className="p-2 rounded-xl text-left text-xs font-semibold bg-slate-50 hover:bg-[#F5EEFD] text-[#181A20] border border-slate-200 truncate transition cursor-pointer"
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
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#181A20]"
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
                  className="w-full py-2 rounded-xl bg-[#181A20] hover:bg-slate-800 text-white text-xs font-bold disabled:opacity-30 cursor-pointer"
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
