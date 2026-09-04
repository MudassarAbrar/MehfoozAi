/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Copy, Check, ExternalLink, Twitter, Linkedin, Instagram, ShieldCheck, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const OFFICIAL_LINKS = {
  adminEmail: 'mudassarabrarr@gmail.com',
  helpDeskEmails: [
    'ridaamircs@gmail.com',
    'zainab.irfan2428@gmail.com'
  ],
  contacts: [
    {
      email: 'ridaamircs@gmail.com',
      role: 'Help Desk Support',
      roleUr: 'ہیلپ ڈیسک سپورٹ',
      badge: 'Help Desk',
      badgeColor: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
    },
    {
      email: 'zainab.irfan2428@gmail.com',
      role: 'Help Desk Support',
      roleUr: 'ہیلپ ڈیسک سپورٹ',
      badge: 'Help Desk',
      badgeColor: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
    },
    {
      email: 'mudassarabrarr@gmail.com',
      role: 'Administration & Feedback',
      roleUr: 'ایڈمنسٹریشن و فیڈبیک',
      badge: 'Admin',
      badgeColor: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
    }
  ],
  twitter: 'https://x.com/MehfoozAii',
  linkedin: 'https://www.linkedin.com/company/mehfoozai',
  instagram: 'https://instagram.com/mehfoozai?utm_source=qr&igsi=MXJ1cGx6dXg2NHdwcg=='
};

interface SocialLinksRowProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

export const SocialLinksRow: React.FC<SocialLinksRowProps> = ({
  className = '',
  size = 'md',
  showLabels = false
}) => {
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  const pad = size === 'sm' ? 'p-1.5' : size === 'lg' ? 'p-2.5' : 'p-2';

  const channels = [
    {
      name: 'X (Twitter)',
      label: 'Twitter / X',
      url: OFFICIAL_LINKS.twitter,
      icon: Twitter,
      color: 'hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
    },
    {
      name: 'LinkedIn',
      label: 'LinkedIn',
      url: OFFICIAL_LINKS.linkedin,
      icon: Linkedin,
      color: 'hover:text-[#0A66C2] hover:bg-[#0A66C2]/10'
    },
    {
      name: 'Instagram',
      label: 'Instagram',
      url: OFFICIAL_LINKS.instagram,
      icon: Instagram,
      color: 'hover:text-[#E4405F] hover:bg-[#E4405F]/10'
    }
  ];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {channels.map((channel) => {
        const Icon = channel.icon;
        return (
          <a
            key={channel.name}
            href={channel.url}
            target="_blank"
            rel="noopener noreferrer"
            title={`Follow Mehfooz on ${channel.name}`}
            className={`flex items-center gap-1.5 ${pad} rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#18242A] text-slate-600 dark:text-slate-300 transition-all ${channel.color} cursor-pointer group shadow-2xs`}
          >
            <Icon className={`${iconSize} transition-transform group-hover:scale-110`} />
            {showLabels && (
              <span className="text-xs font-semibold">{channel.label}</span>
            )}
          </a>
        );
      })}
    </div>
  );
};

interface AdminContactBoxProps {
  language?: 'en' | 'ur';
  className?: string;
  compact?: boolean;
}

export const AdminContactBox: React.FC<AdminContactBoxProps> = ({
  language = 'en',
  className = '',
  compact = false
}) => {
  const isUrdu = language === 'ur';
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const handleCopy = (email: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2500);
  };

  if (compact) {
    return (
      <div className={`space-y-1.5 ${className}`}>
        {OFFICIAL_LINKS.contacts.map((contact) => (
          <div
            key={contact.email}
            className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-[#18242A] border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${contact.badgeColor} flex-shrink-0`}>
                {contact.badge}
              </span>
              <a
                href={`mailto:${contact.email}`}
                className="text-xs font-medium text-[#1C2C34] dark:text-[#F4F4FC] hover:text-[#FC7454] transition truncate cursor-pointer"
                title={`Email: ${contact.email}`}
              >
                {contact.email}
              </a>
            </div>
            <button
              onClick={(e) => handleCopy(contact.email, e)}
              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition flex-shrink-0 cursor-pointer"
              title={`Copy ${contact.email}`}
            >
              {copiedEmail === contact.email ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-2xl bg-white dark:bg-[#18242A] border border-slate-200 dark:border-slate-700 shadow-xs ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-xl bg-[#FC7454]/10 flex items-center justify-center text-[#FC7454]">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1C2C34] dark:text-[#F4F4FC]">
              {isUrdu ? 'ہیلپ ڈیسک سپورٹ و ایڈمن' : 'Help Desk Support & Admin'}
            </h4>
            <p className="text-[11px] text-[#5A6E78] dark:text-slate-400">
              {isUrdu ? 'براہ راست سپورٹ اور ایڈمن ٹیم سے رابطہ کریں' : 'Direct email support for technical help & emergency reporting'}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          {isUrdu ? 'آن لائن سپورٹ' : 'Online Support'}
        </span>
      </div>

      <div className="space-y-2 mt-2">
        {OFFICIAL_LINKS.contacts.map((contact) => {
          const isCopied = copiedEmail === contact.email;
          return (
            <div
              key={contact.email}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#121A1E] border border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 transition"
            >
              <div className="flex items-center space-x-2 min-w-0">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${contact.badgeColor} flex-shrink-0`}>
                  {contact.badge}
                </span>
                <a
                  href={`mailto:${contact.email}`}
                  className="text-xs font-semibold text-[#1C2C34] dark:text-[#F4F4FC] hover:text-[#FC7454] transition truncate cursor-pointer"
                  title={`Send email to ${contact.email}`}
                >
                  <span className="truncate">{contact.email}</span>
                </a>
              </div>

              <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                <button
                  onClick={(e) => handleCopy(contact.email, e)}
                  className="px-2 py-1 rounded-lg bg-white dark:bg-[#18242A] hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-300 transition flex items-center space-x-1 cursor-pointer"
                  title={`Copy ${contact.email}`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-600 font-bold">{isUrdu ? 'کاپی ہو گیا' : 'Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-500" />
                      <span>{isUrdu ? 'کاپی' : 'Copy'}</span>
                    </>
                  )}
                </button>
                <a
                  href={`mailto:${contact.email}`}
                  className="p-1 rounded-lg bg-[#FC7454] hover:bg-[#FC7C54] text-white transition flex items-center justify-center cursor-pointer"
                  title={`Open mail client for ${contact.email}`}
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
