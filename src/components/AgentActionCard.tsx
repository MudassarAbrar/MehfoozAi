/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * AgentActionCard — renders a pending action proposal with Confirm/Cancel buttons.
 * Shows title, description, recipient/destination, message preview, and expiration.
 */

import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, CheckCircle2, Loader2, AlertTriangle, Clock } from 'lucide-react';
import { AgentToolProposal } from '../types';
import { confirmAgentAction, cancelAgentAction } from '../utils/agentClient';

interface AgentActionCardProps {
  action: AgentToolProposal;
  isUrdu?: boolean;
  onConfirmed?: (result: any) => void;
  onCancelled?: () => void;
}

type CardStatus = 'pending' | 'confirming' | 'cancelling' | 'confirmed' | 'cancelled' | 'failed';

export const AgentActionCard: React.FC<AgentActionCardProps> = ({
  action,
  isUrdu = false,
  onConfirmed,
  onCancelled
}) => {
  const [status, setStatus] = useState<CardStatus>(
    action.status === 'executed' ? 'confirmed' :
    action.status === 'cancelled' ? 'cancelled' : 'pending'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState<string>('');

  // Countdown timer for expiration
  useEffect(() => {
    if (!action.expiresAt || status !== 'pending') return;

    const updateExpiry = () => {
      const expiresAt = new Date(action.expiresAt!).getTime();
      const now = Date.now();
      const remaining = expiresAt - now;

      if (remaining <= 0) {
        setExpiresIn(isUrdu ? 'میعاد ختم ہو گئی' : 'Expired');
        setStatus('cancelled');
        return;
      }

      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setExpiresIn(
        isUrdu
          ? `${minutes} منٹ ${seconds} سیکنڈ باقی`
          : `${minutes}m ${seconds}s remaining`
      );
    };

    updateExpiry();
    const interval = setInterval(updateExpiry, 1000);
    return () => clearInterval(interval);
  }, [action.expiresAt, status, isUrdu]);

  const handleConfirm = async () => {
    setStatus('confirming');
    setErrorMessage(null);
    try {
      const result = await confirmAgentAction(action.id);
      setStatus('confirmed');
      onConfirmed?.(result);
    } catch (err: any) {
      setStatus('failed');
      setErrorMessage(err.message || 'Confirmation failed');
    }
  };

  const handleCancel = async () => {
    setStatus('cancelling');
    try {
      await cancelAgentAction(action.id);
      setStatus('cancelled');
      onCancelled?.();
    } catch (err: any) {
      setStatus('failed');
      setErrorMessage(err.message || 'Cancel failed');
    }
  };

  const { displayData } = action;

  return (
    <div className={`rounded-2xl border-2 p-4 my-3 transition-all ${
      status === 'confirmed'
        ? 'border-green-300 bg-green-50'
        : status === 'cancelled'
        ? 'border-slate-200 bg-slate-50 opacity-60'
        : status === 'failed'
        ? 'border-red-300 bg-red-50'
        : 'border-[#FC7454]/40 bg-white shadow-sm'
    }`}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
          status === 'confirmed' ? 'bg-green-100 text-green-600' :
          status === 'cancelled' ? 'bg-slate-100 text-slate-400' :
          'bg-[#FC7454]/10 text-[#FC7454]'
        }`}>
          {status === 'confirmed' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : status === 'cancelled' ? (
            <X className="w-5 h-5" />
          ) : (
            <ShieldCheck className="w-5 h-5" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm text-[#1C2C34]">
            {action.title}
          </h4>
          {status === 'pending' && expiresIn && (
            <div className="flex items-center gap-1 mt-0.5 text-[11px] text-amber-600">
              <Clock className="w-3 h-3" />
              <span>{expiresIn}</span>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-[#5A6E78] mb-3 leading-relaxed">
        {action.description}
      </p>

      {/* Key details */}
      <div className="space-y-1.5 mb-3">
        {displayData.recipient && (
          <DetailRow label={isUrdu ? 'وصول کنندہ' : 'To'} value={displayData.recipient} />
        )}
        {displayData.destination && (
          <DetailRow label={isUrdu ? 'منزل' : 'Destination'} value={displayData.destination} />
        )}
        {displayData.durationMinutes && (
          <DetailRow label={isUrdu ? 'مدت' : 'Duration'} value={`${displayData.durationMinutes} min`} />
        )}
        {displayData.messagePreview && (
          <DetailRow label={isUrdu ? 'پیغام' : 'Message'} value={`"${displayData.messagePreview}"`} />
        )}
        {displayData.complaintCategory && (
          <DetailRow label={isUrdu ? 'زمرہ' : 'Category'} value={displayData.complaintCategory.replace(/_/g, ' ')} />
        )}
        {displayData.incidentType && (
          <DetailRow label={isUrdu ? 'واقعہ کی قسم' : 'Incident Type'} value={displayData.incidentType.replace(/_/g, ' ')} />
        )}
        {displayData.contactNames && (
          <DetailRow label={isUrdu ? 'رابطے' : 'Contacts'} value={displayData.contactNames} />
        )}
      </div>

      {/* Status / Actions */}
      {status === 'pending' && (
        <div className="flex gap-2">
          <button
            onClick={handleConfirm}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#FC7454] text-white text-sm font-bold hover:bg-[#e8634a] transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isUrdu ? 'تصدیق کریں' : 'Confirm'}
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-[#5A6E78] text-sm font-bold hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
            {isUrdu ? 'منسوخ کریں' : 'Cancel'}
          </button>
        </div>
      )}

      {status === 'confirming' && (
        <div className="flex items-center justify-center gap-2 py-2 text-[#FC7454]">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-semibold">{isUrdu ? 'عملدرآمد ہو رہا ہے…' : 'Executing…'}</span>
        </div>
      )}

      {status === 'cancelling' && (
        <div className="flex items-center justify-center gap-2 py-2 text-[#5A6E78]">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-semibold">{isUrdu ? 'منسوخ ہو رہا ہے…' : 'Cancelling…'}</span>
        </div>
      )}

      {status === 'confirmed' && (
        <div className="flex items-center gap-2 py-1 text-green-600">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm font-semibold">{isUrdu ? 'مکمل ہو گیا' : 'Completed'}</span>
        </div>
      )}

      {status === 'cancelled' && (
        <div className="flex items-center gap-2 py-1 text-[#5A6E78]">
          <X className="w-4 h-4" />
          <span className="text-sm font-semibold">{isUrdu ? 'منسوخ کر دیا گیا' : 'Cancelled'}</span>
        </div>
      )}

      {status === 'failed' && errorMessage && (
        <div className="flex items-center gap-2 py-1 text-red-600">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-semibold">{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2 text-xs">
      <span className="font-semibold text-[#1C2C34] min-w-[70px]">{label}:</span>
      <span className="text-[#5A6E78]">{value}</span>
    </div>
  );
}
