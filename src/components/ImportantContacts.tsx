/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Phone, 
  MessageSquare, 
  Mail, 
  ShieldAlert, 
  Star, 
  Check, 
  X, 
  Trash2, 
  Edit3, 
  Search, 
  Filter, 
  Scale, 
  Heart, 
  Building2, 
  UserCheck,
  Share2,
  AlertCircle,
  Clock,
  Sparkles,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppLanguage, ContactRelationship, UserContact, UserProfile } from '../types';

interface ImportantContactsProps {
  language: AppLanguage;
  user: UserProfile | null;
  onUpdateUser?: (updated: UserProfile) => void;
  onOpenCrisis: () => void;
  onStartCheckInWithContact?: (contactId: string) => void;
}

const DEFAULT_DEMO_CONTACTS: UserContact[] = [
  {
    id: 'c1',
    name: 'Tulsi (Mom)',
    relation: 'Mother',
    contactType: 'family',
    phone: '+92 300 9876543',
    email: 'mom.contact@example.pk',
    isEmergencyContact: true,
    isDefaultNotified: true,
    avatarColor: 'bg-rose-500'
  },
  {
    id: 'c2',
    name: 'Gopal (Brother)',
    relation: 'Brother',
    contactType: 'family',
    phone: '+92 321 4567890',
    email: 'gopal.brother@example.pk',
    isEmergencyContact: true,
    isDefaultNotified: true,
    avatarColor: 'bg-blue-500'
  },
  {
    id: 'c3',
    name: 'Adv. Asma Jahangir Legal Aid',
    relation: 'Pro-Bono Lawyer',
    contactType: 'lawyer',
    organization: 'AGHS Legal Aid Cell, Lahore',
    phone: '+92 42 35763234',
    email: 'help@aghslegalaid.org',
    isEmergencyContact: false,
    isDefaultNotified: false,
    avatarColor: 'bg-amber-600'
  },
  {
    id: 'c4',
    name: 'Dr. Ayesha Clinic',
    relation: 'Family Physician',
    contactType: 'doctor',
    organization: 'Services Hospital Lahore',
    phone: '+92 333 1122334',
    isEmergencyContact: false,
    isDefaultNotified: false,
    avatarColor: 'bg-emerald-600'
  }
];

export const ImportantContacts: React.FC<ImportantContactsProps> = ({
  language,
  user,
  onUpdateUser,
  onOpenCrisis,
  onStartCheckInWithContact
}) => {
  const isUrdu = language === 'ur';

  const [contacts, setContacts] = useState<UserContact[]>(() => {
    if (user?.emergencyContacts && user.emergencyContacts.length > 0) {
      return user.emergencyContacts;
    }
    const saved = localStorage.getItem('mehfooz_user_contacts_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return DEFAULT_DEMO_CONTACTS;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<UserContact | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formRelation, setFormRelation] = useState('Family');
  const [formType, setFormType] = useState<ContactRelationship>('family');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formOrg, setFormOrg] = useState('');
  const [formIsEmergency, setFormIsEmergency] = useState(false);
  const [formIsDefaultNotified, setFormIsDefaultNotified] = useState(false);

  const saveContacts = (updated: UserContact[]) => {
    setContacts(updated);
    localStorage.setItem('mehfooz_user_contacts_v1', JSON.stringify(updated));
    if (user && onUpdateUser) {
      onUpdateUser({
        ...user,
        emergencyContacts: updated
      });
    }
  };

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  const handleOpenAdd = () => {
    setEditingContact(null);
    setFormName('');
    setFormRelation('Family');
    setFormType('family');
    setFormPhone('');
    setFormEmail('');
    setFormOrg('');
    setFormIsEmergency(false);
    setFormIsDefaultNotified(false);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (contact: UserContact) => {
    setEditingContact(contact);
    setFormName(contact.name);
    setFormRelation(contact.relation || '');
    setFormType(contact.contactType || 'family');
    setFormPhone(contact.phone);
    setFormEmail(contact.email || '');
    setFormOrg(contact.organization || '');
    setFormIsEmergency(!!contact.isEmergencyContact);
    setFormIsDefaultNotified(!!contact.isDefaultNotified);
    setIsAddModalOpen(true);
  };

  const handleDelete = (id: string) => {
    const filtered = contacts.filter(c => c.id !== id);
    saveContacts(filtered);
    showNotification(isUrdu ? 'رابطہ کامیابی سے ہٹا دیا گیا' : 'Contact removed successfully');
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) return;

    if (editingContact) {
      const updated = contacts.map(c => {
        if (c.id === editingContact.id) {
          return {
            ...c,
            name: formName.trim(),
            relation: formRelation.trim(),
            contactType: formType,
            phone: formPhone.trim(),
            email: formEmail.trim() || undefined,
            organization: formOrg.trim() || undefined,
            isEmergencyContact: formIsEmergency,
            isDefaultNotified: formIsDefaultNotified
          };
        }
        return c;
      });
      saveContacts(updated);
      showNotification(isUrdu ? 'رابطہ اپ ڈیٹ ہو گیا' : 'Contact updated');
    } else {
      const colors = ['bg-rose-500', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-indigo-500'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const newContact: UserContact = {
        id: `c-${Date.now()}`,
        name: formName.trim(),
        relation: formRelation.trim(),
        contactType: formType,
        phone: formPhone.trim(),
        email: formEmail.trim() || undefined,
        organization: formOrg.trim() || undefined,
        isEmergencyContact: formIsEmergency,
        isDefaultNotified: formIsDefaultNotified,
        avatarColor: randomColor
      };
      saveContacts([...contacts, newContact]);
      showNotification(isUrdu ? 'نیا رابطہ شامل کر لیا گیا' : 'New contact added');
    }
    setIsAddModalOpen(false);
  };

  const handleToggleEmergency = (id: string) => {
    const updated = contacts.map(c => c.id === id ? { ...c, isEmergencyContact: !c.isEmergencyContact } : c);
    saveContacts(updated);
  };

  const handleToggleDefaultNotified = (id: string) => {
    const updated = contacts.map(c => c.id === id ? { ...c, isDefaultNotified: !c.isDefaultNotified } : c);
    saveContacts(updated);
  };

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.phone.includes(searchTerm) || 
                          (c.relation && c.relation.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (c.organization && c.organization.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;
    if (filterType === 'all') return true;
    if (filterType === 'emergency') return c.isEmergencyContact;
    if (filterType === 'checkin') return c.isDefaultNotified;
    return c.contactType === filterType;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-5 text-[#181A20]">
      {/* Toast Notification */}
      <AnimatePresence>
        {actionSuccessMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-[#181A20] text-white font-bold text-xs shadow-lg flex items-center space-x-2 border border-slate-700"
          >
            <Check className="w-4 h-4 text-[#B886FD]" />
            <span>{actionSuccessMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-2xl bg-[#F5EEFD] text-[#9333EA] border border-[#E9D5FF] shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#181A20]">
                {isUrdu ? 'اہم اور ہنگامی رابطے' : 'Important & Trusted Contacts'}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#6B7280] max-w-xl leading-relaxed">
              {isUrdu 
                ? 'اپنے بااعتماد دوست، اہلخانہ، وکلاء اور ڈاکٹرز کے نمبرز محفوظ کریں۔ یہ رابطے سیفٹی چیک ان اور ایمرجنسی ایس او ایس میں خودکار الرٹس وصول کریں گے۔'
                : 'Manage your trusted circle for instant Emergency SOS triggers, automated Journey Check-In monitoring, and secure legal document sharing.'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 rounded-2xl bg-[#181A20] hover:bg-slate-800 text-white text-xs font-bold flex items-center space-x-2 shadow-xs transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-[#B886FD]" />
              <span>{isUrdu ? 'نیا رابطہ شامل کریں' : 'Add New Contact'}</span>
            </button>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs text-[#6B7280] font-semibold">
          <span className="flex items-center space-x-1">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            <span><strong className="text-[#181A20]">{contacts.filter(c => c.isEmergencyContact).length}</strong> {isUrdu ? 'ہنگامی رابطے' : 'Emergency Contacts'}</span>
          </span>
          <span className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-[#9333EA]" />
            <span><strong className="text-[#181A20]">{contacts.filter(c => c.isDefaultNotified).length}</strong> {isUrdu ? 'چیک ان نگران' : 'Check-In Monitors'}</span>
          </span>
          <span className="flex items-center space-x-1">
            <Lock className="w-3.5 h-3.5 text-[#9CA3AF]" />
            <span>{isUrdu ? 'اینڈ ٹو اینڈ محفوظ ڈیوائس اسٹوریج' : 'Encrypted on-device zero-knowledge'}</span>
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isUrdu ? 'نام، فون نمبر یا تعلق تلاش کریں...' : 'Search contacts by name, phone, or relationship...'}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs text-[#181A20] focus:outline-none focus:ring-2 focus:ring-[#9333EA] shadow-2xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#181A20] p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { key: 'all', label: isUrdu ? 'تمام' : 'All' },
            { key: 'emergency', label: isUrdu ? 'ہنگامی' : 'Emergency' },
            { key: 'checkin', label: isUrdu ? 'چیک ان' : 'Check-In' },
            { key: 'lawyer', label: isUrdu ? 'وکلاء' : 'Lawyers' },
            { key: 'doctor', label: isUrdu ? 'طبی' : 'Medical' }
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilterType(f.key)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                filterType === f.key
                  ? 'bg-[#181A20] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-[#6B7280] hover:bg-[#F5EEFD] hover:text-[#181A20]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contacts List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredContacts.map((contact) => (
          <motion.div
            key={contact.id}
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-3xl bg-white border p-4 sm:p-5 shadow-xs transition-all flex flex-col justify-between space-y-4 ${
              contact.isEmergencyContact 
                ? 'border-rose-200 hover:border-rose-300' 
                : 'border-slate-200 hover:border-[#E9D5FF]'
            }`}
          >
            {/* Top row: Avatar + Name + Badges */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-[#9333EA] font-black text-sm flex-shrink-0 shadow-2xs bg-[#F5EEFD] border border-[#E9D5FF]">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-1.5 flex-wrap">
                    <h3 className="font-extrabold text-sm text-[#181A20] truncate">
                      {contact.name}
                    </h3>
                    {contact.isEmergencyContact && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-black uppercase tracking-wider border border-rose-200">
                        SOS
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#6B7280] flex items-center space-x-1 mt-0.5">
                    <span>{contact.relation}</span>
                    {contact.organization && (
                      <span>• {contact.organization}</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Edit / Delete Buttons */}
              <div className="flex items-center space-x-1 flex-shrink-0">
                <button
                  onClick={() => handleOpenEdit(contact)}
                  className="p-1.5 rounded-xl hover:bg-[#F5EEFD] text-slate-400 hover:text-[#9333EA] transition cursor-pointer"
                  title="Edit Contact"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(contact.id)}
                  className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                  title="Remove Contact"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Contact Chips & Toggles */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between text-xs text-[#181A20] bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                <span className="font-mono font-bold text-xs">{contact.phone}</span>
                {contact.email && (
                  <span className="text-[11px] text-[#6B7280] truncate max-w-[140px]">{contact.email}</span>
                )}
              </div>

              {/* Roles / Flags */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <button
                  onClick={() => handleToggleEmergency(contact.id)}
                  className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                    contact.isEmergencyContact
                      ? 'bg-rose-50 border-rose-200 text-rose-700'
                      : 'bg-white border-slate-200 text-[#6B7280] hover:bg-[#F5EEFD]'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  <span>{isUrdu ? 'ایمرجنسی SOS' : 'Emergency SOS'}</span>
                </button>

                <button
                  onClick={() => handleToggleDefaultNotified(contact.id)}
                  className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                    contact.isDefaultNotified
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-white border-slate-200 text-[#6B7280] hover:bg-[#F5EEFD]'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isUrdu ? 'چیک ان مانیٹر' : 'Check-In Monitor'}</span>
                </button>
              </div>
            </div>

            {/* Direct Action Buttons */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2">
              <a
                href={`tel:${contact.phone}`}
                className="py-2 px-2 rounded-xl bg-[#181A20] hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-2xs transition"
              >
                <Phone className="w-3.5 h-3.5 text-[#B886FD]" />
                <span>{isUrdu ? 'کال' : 'Call'}</span>
              </a>

              <a
                href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Assalam-o-Alaikum, I am reaching out from Mehfooz Safety App. My current location is verified.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="py-2 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-xs flex items-center justify-center space-x-1.5 transition"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </a>

              <button
                onClick={() => onStartCheckInWithContact?.(contact.id)}
                className="py-2 px-2 rounded-xl bg-[#F5EEFD] hover:bg-[#E9D5FF] text-[#9333EA] border border-[#E9D5FF] font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
                title="Start a Safety Check-In with this contact"
              >
                <Clock className="w-3.5 h-3.5 text-[#9333EA]" />
                <span>Check-In</span>
              </button>
            </div>
          </motion.div>
        ))}

        {filteredContacts.length === 0 && (
          <div className="col-span-full p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
            <Users className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-[#6B7280]">
              {isUrdu ? 'کوئی رابطہ نہیں ملا' : 'No contacts found matching your search.'}
            </p>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-2xl bg-[#181A20] text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              {isUrdu ? 'پہلا رابطہ شامل کریں' : 'Add your first contact'}
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Contact Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-[#181A20]"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-xl bg-[#F5EEFD] text-[#9333EA] border border-[#E9D5FF]">
                    <UserPlus className="w-5 h-5 text-[#9333EA]" />
                  </div>
                  <h2 className="text-base font-black text-[#181A20]">
                    {editingContact 
                      ? (isUrdu ? 'رابطہ تبدیل کریں' : 'Edit Contact') 
                      : (isUrdu ? 'نیا اہم رابطہ شامل کریں' : 'Add Important Contact')}
                  </h2>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-[#181A20] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[#181A20] mb-1">
                    {isUrdu ? 'مکمل نام *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Fatima Noor / Adv. Tahira"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-[#181A20] focus:outline-none focus:ring-2 focus:ring-[#9333EA]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#181A20] mb-1">
                      {isUrdu ? 'تعلق / رشتہ' : 'Relationship / Role'}
                    </label>
                    <input
                      type="text"
                      value={formRelation}
                      onChange={(e) => setFormRelation(e.target.value)}
                      placeholder="e.g. Mother, Lawyer, Roommate"
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-[#181A20] focus:outline-none focus:ring-2 focus:ring-[#9333EA]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#181A20] mb-1">
                      {isUrdu ? 'رابطے کی قسم' : 'Contact Category'}
                    </label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as ContactRelationship)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-[#181A20] focus:outline-none focus:ring-2 focus:ring-[#9333EA]"
                    >
                      <option value="family">{isUrdu ? 'اہلخانہ (Family)' : 'Family'}</option>
                      <option value="friend">{isUrdu ? 'دوست (Friend)' : 'Friend'}</option>
                      <option value="emergency">{isUrdu ? 'ہنگامی (Emergency SOS)' : 'Emergency Guardian'}</option>
                      <option value="lawyer">{isUrdu ? 'وکیل / قانونی نمائندہ' : 'Lawyer / Legal Aid'}</option>
                      <option value="doctor">{isUrdu ? 'ڈاکٹر / طبی عملہ' : 'Doctor / Medical'}</option>
                      <option value="colleague">{isUrdu ? 'ہم منصب / دفتری ساتھی' : 'Colleague'}</option>
                      <option value="organization_rep">{isUrdu ? 'این جی او / ادارے کا نمائندہ' : 'NGO / Shelter Rep'}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#181A20] mb-1">
                      {isUrdu ? 'فون نمبر *' : 'Phone Number *'}
                    </label>
                    <input
                      type="tel"
                      required
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="+92 300 1234567"
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-[#181A20] focus:outline-none focus:ring-2 focus:ring-[#9333EA]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#181A20] mb-1">
                      {isUrdu ? 'ای میل (اختیاری)' : 'Email (Optional)'}
                    </label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="contact@example.pk"
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-[#181A20] focus:outline-none focus:ring-2 focus:ring-[#9333EA]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#181A20] mb-1">
                    {isUrdu ? 'ادارہ / تنظیم (اگر کوئی ہو)' : 'Organization / Law Firm (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={formOrg}
                    onChange={(e) => setFormOrg(e.target.value)}
                    placeholder="e.g. AGHS Legal Cell / Lahore High Court Bar"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-[#181A20] focus:outline-none focus:ring-2 focus:ring-[#9333EA]"
                  />
                </div>

                {/* Checkbox settings */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsEmergency}
                      onChange={(e) => setFormIsEmergency(e.target.checked)}
                      className="mt-0.5 rounded text-rose-600 focus:ring-rose-400"
                    />
                    <div>
                      <span className="font-bold text-[#181A20] block">
                        {isUrdu ? 'ہنگامی SOS میں شامل کریں' : 'Include in Emergency SOS Circle'}
                      </span>
                      <span className="text-[11px] text-[#6B7280]">
                        {isUrdu ? 'ایمرجنسی کا بٹن دبانے پر اس رابطے کو فوری لائیو لوکیشن ایس ایم ایس جائے گا۔' : 'Receives immediate emergency broadcast with GPS coordinates.'}
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsDefaultNotified}
                      onChange={(e) => setFormIsDefaultNotified(e.target.checked)}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-400"
                    />
                    <div>
                      <span className="font-bold text-[#181A20] block">
                        {isUrdu ? 'سیفٹی چیک ان میں بطور نگران شامل کریں' : 'Default Monitor for Safety Check-In'}
                      </span>
                      <span className="text-[11px] text-[#6B7280]">
                        {isUrdu ? 'جب بھی نیا چیک ان شروع ہو گا، یہ رابطہ پہلے سے منتخب ہو گا۔' : 'Automatically pre-selected when starting a new journey check-in.'}
                      </span>
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 rounded-2xl bg-slate-100 text-[#6B7280] font-bold hover:bg-slate-200 cursor-pointer"
                  >
                    {isUrdu ? 'منسوخ کریں' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-2xl bg-[#181A20] hover:bg-slate-800 text-white font-bold shadow-xs flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-[#B886FD]" />
                    <span>{isUrdu ? 'محفوظ کریں' : 'Save Contact'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
