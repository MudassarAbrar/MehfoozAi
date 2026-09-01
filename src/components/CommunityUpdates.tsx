/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  MapPin, 
  ThumbsUp, 
  Share2, 
  Plus, 
  ShieldCheck, 
  Star, 
  CheckCircle2, 
  MessageSquare, 
  X, 
  Sparkles,
  Filter,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppLanguage, CommunityUpdate, UserProfile } from '../types';
import { StarRating } from './ui/star-rating';
import { SentimentPicker } from './ui/sentiment-picker';

interface CommunityUpdatesProps {
  language: AppLanguage;
  user: UserProfile | null;
  onOpenReportModal?: () => void;
}

export const CommunityUpdates: React.FC<CommunityUpdatesProps> = ({
  language,
  user
}) => {
  const isUrdu = language === 'ur';

  const [activeFilter, setActiveFilter] = useState<'all' | 'last_hour' | 'neighborhood'>('all');
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  // Form states for Share Your Experience (Matching Image 10 - Right Screen)
  const [formLocation, setFormLocation] = useState<string>('Dhanmondi 27 / Gulberg Main');
  const [formSentiment, setFormSentiment] = useState<'very_unsafe' | 'uncomfortable' | 'neutral' | 'safe' | 'very_safe'>('safe');
  const [formTags, setFormTags] = useState<string[]>(['Well-lit', 'Crowded', 'Shops open']);
  const [formDetails, setFormDetails] = useState<string>('');

  const [updates, setUpdates] = useState<CommunityUpdate[]>([
    {
      id: 'comm-1',
      authorName: 'Verified Member',
      authorRole: 'Daily Commuter',
      isVerified: true,
      starRating: 5,
      timestamp: new Date().toISOString(),
      timeAgo: '12 min ago',
      locationName: 'Dhanmondi 27 / Gulberg',
      district: user?.district || 'Lahore',
      text: 'Well-lit, tea stalls open, felt completely safe walking to the bus station.',
      textUrdu: 'اسٹریٹ لائٹس روشن ہیں، چائے کے کھوکھے کھلے ہیں، بس اسٹاپ تک واک بہت محفوظ رہی۔',
      sentiment: 'very_safe',
      tags: ['Well-lit', 'Crowded', 'Shops open'],
      viewsCount: 79,
      helpfulCount: 24,
      isHelpfulByUser: false
    },
    {
      id: 'comm-2',
      authorName: 'Verified Member',
      authorRole: 'University Student',
      isVerified: true,
      starRating: 4,
      timestamp: new Date().toISOString(),
      timeAgo: '35 min ago',
      locationName: 'Banani 10 / Commercial Avenue',
      district: user?.district || 'Lahore',
      text: 'Police van stationed at the main roundabout. Safe corridor for evening transit.',
      textUrdu: 'مین چوک پر پولیس وین موجود ہے۔ شام کے وقت سفر کے لیے محفوظ راستہ ہے۔',
      sentiment: 'safe',
      tags: ['Police present', 'Good visibility', 'Well-lit'],
      viewsCount: 134,
      helpfulCount: 42,
      isHelpfulByUser: false
    },
    {
      id: 'comm-3',
      authorName: 'Verified Member',
      authorRole: 'Resident',
      isVerified: true,
      starRating: 2,
      timestamp: new Date().toISOString(),
      timeAgo: '1 hour ago',
      locationName: 'Mirpur Road Underpass',
      district: user?.district || 'Lahore',
      text: 'Lights flickering near the pedestrian ramp. Group loitering by the corner.',
      textUrdu: 'پیدل راستے کی لائٹس خراب ہیں۔ کارنر پر مشکوک افراد موجود ہیں۔ محتاط رہیں۔',
      sentiment: 'uncomfortable',
      tags: ['Quiet/isolated', 'Felt watched'],
      viewsCount: 210,
      helpfulCount: 65,
      isHelpfulByUser: false
    }
  ]);

  const availableTags = [
    'Well-lit',
    'Crowded',
    'Police present',
    'Felt watched',
    'Shops open',
    'Quiet/isolated',
    'Good visibility'
  ];

  const handleToggleTag = (tag: string) => {
    setFormTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleToggleHelpful = (id: string) => {
    setUpdates(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          helpfulCount: item.isHelpfulByUser ? item.helpfulCount - 1 : item.helpfulCount + 1,
          isHelpfulByUser: !item.isHelpfulByUser
        };
      }
      return item;
    }));
  };

  const handlePostUpdate = () => {
    if (!formLocation) return;

    const newUpdate: CommunityUpdate = {
      id: `comm-${Date.now()}`,
      authorName: user?.safeNickname || 'Verified Member',
      authorRole: 'Community Guardian',
      isVerified: true,
      starRating: formSentiment === 'very_safe' ? 5 : formSentiment === 'safe' ? 4 : formSentiment === 'neutral' ? 3 : 2,
      timestamp: new Date().toISOString(),
      timeAgo: 'Just now',
      locationName: formLocation,
      district: user?.district || 'Lahore',
      text: formDetails || 'Shared safety update for this area.',
      sentiment: formSentiment,
      tags: formTags,
      viewsCount: 1,
      helpfulCount: 1,
      isHelpfulByUser: true
    };

    setUpdates([newUpdate, ...updates]);
    setIsShareModalOpen(false);
    setFormDetails('');
  };

  return (
    <div className="max-w-xl mx-auto px-3 sm:px-4 py-4 space-y-4 text-[#181A20]">
      {/* 1. Header Banner */}
      <div className="rounded-[28px] bg-white border border-slate-200/80 p-5 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F5EEFD] text-[#9333EA] border border-[#E9D5FF] flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#181A20]">
                {isUrdu ? 'کمیونٹی اپ ڈیٹس' : 'Community Safety Feed'}
              </h2>
              <p className="text-xs text-[#6B7280] font-medium">
                {isUrdu ? 'آپ کے علاقے کی خواتین کے حقیقی مشاہدات و تجربات' : 'Real-time safety insights from verified women in Punjab'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#181A20] hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#B886FD]" />
            <span>{isUrdu ? 'تجربہ شیئر کریں' : 'Share Update'}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary Metric Pills */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
          <span className="text-xl font-black text-[#9333EA] block">127</span>
          <span className="text-[11px] text-[#6B7280] font-semibold">Active Today</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
          <span className="text-xl font-black text-emerald-600 block">43</span>
          <span className="text-[11px] text-[#6B7280] font-semibold">Updates</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
          <span className="text-xl font-black text-[#181A20] block">38</span>
          <span className="text-[11px] text-[#6B7280] font-semibold">Verified</span>
        </div>
      </div>

      {/* 3. Filter Pills */}
      <div className="flex space-x-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-[#181A20] text-white shadow-xs'
              : 'bg-white text-[#6B7280] hover:bg-slate-50 border border-slate-200'
          }`}
        >
          All Updates
        </button>
        <button
          onClick={() => setActiveFilter('last_hour')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeFilter === 'last_hour'
              ? 'bg-[#181A20] text-white shadow-xs'
              : 'bg-white text-[#6B7280] hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Last Hour
        </button>
        <button
          onClick={() => setActiveFilter('neighborhood')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeFilter === 'neighborhood'
              ? 'bg-[#181A20] text-white shadow-xs'
              : 'bg-white text-[#6B7280] hover:bg-slate-50 border border-slate-200'
          }`}
        >
          My Neighborhood
        </button>
      </div>

      {/* 4. Updates Feed List */}
      <div className="space-y-3">
        {updates.map((item) => (
          <div
            key={item.id}
            className="rounded-3xl bg-white border border-slate-200 p-4 shadow-xs space-y-2.5 transition-all"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-[#F5EEFD] text-[#9333EA] border border-[#E9D5FF] flex items-center justify-center font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-[#181A20]">
                      {item.authorName}
                    </span>
                    <StarRating rating={item.starRating} size="sm" />
                  </div>
                  <span className="text-[10px] text-[#6B7280]">{item.timeAgo}</span>
                </div>
              </div>

              <span className="text-xs font-medium text-[#6B7280] flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-[#9333EA]" />
                <span>{item.locationName}</span>
              </span>
            </div>

            {/* Content text */}
            <p className="text-xs text-[#181A20] leading-relaxed">
              {isUrdu && item.textUrdu ? item.textUrdu : item.text}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {item.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-md bg-[#F5EEFD] text-[#9333EA] text-[10px] font-semibold border border-[#E9D5FF]"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Footer metrics & actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-[#6B7280]">
              <div className="flex items-center space-x-3 text-[11px] text-[#6B7280]">
                <span>{item.viewsCount} views</span>
                <span>•</span>
                <span className="text-emerald-700 font-bold">Verified user</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleHelpful(item.id)}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    item.isHelpfulByUser
                      ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                      : 'hover:bg-[#F5EEFD] text-[#6B7280]'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Helpful ({item.helpfulCount})</span>
                </button>
                <button className="p-1 rounded-lg text-[#6B7280] hover:text-[#181A20] cursor-pointer">
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 5. SHARE YOUR EXPERIENCE MODAL */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-[#181A20]"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-[#181A20]">
                  {isUrdu ? 'اپنا مشاہدہ شیئر کریں' : 'Share Your Experience'}
                </h3>
                <button
                  onClick={() => setIsShareModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#181A20] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Location Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#181A20]">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 absolute left-3 top-3 text-[#9333EA]" />
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-[#181A20] focus:outline-none focus:border-[#9333EA]"
                  />
                </div>
                <span className="text-[10px] text-[#6B7280]">
                  Auto-detected. You can edit if needed.
                </span>
              </div>

              {/* How did you feel? Experience rating */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#181A20]">
                  How did you feel? *
                </label>
                <SentimentPicker
                  value={formSentiment}
                  onChange={(val) => setFormSentiment(val)}
                  isUrdu={isUrdu}
                />
              </div>

              {/* Quick Tags */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#181A20]">
                  Quick tags (select all that apply)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableTags.map((tag) => {
                    const isSelected = formTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#181A20] text-white border-[#181A20] shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-[#6B7280] hover:bg-[#F5EEFD]'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Narrative textarea */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#181A20]">
                  Add details (optional)
                </label>
                <textarea
                  rows={3}
                  value={formDetails}
                  onChange={(e) => setFormDetails(e.target.value)}
                  placeholder="Share more about lighting, tea stalls, crowds, or safe zones..."
                  className="w-full bg-[#F8F9FA] border border-slate-200 rounded-xl p-3 text-xs text-[#181A20] focus:outline-none focus:border-[#9333EA]"
                />
              </div>

              {/* Submit button */}
              <button
                type="button"
                onClick={handlePostUpdate}
                className="w-full py-3.5 rounded-2xl bg-[#181A20] hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                {isUrdu ? 'اپ ڈیٹ شیئر کریں' : 'Share Update'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
