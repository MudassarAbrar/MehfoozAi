/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * AgentStepsPanel — collapsible panel showing the agent's reasoning steps.
 * Uses safe labels, never shows raw tool names or system internals.
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, Loader2, Clock, AlertTriangle } from 'lucide-react';
import { AgentStep } from '../types';

interface AgentStepsPanelProps {
  steps: AgentStep[];
  isUrdu?: boolean;
}

/** Maps raw tool names to safe, user-friendly labels. */
const SAFE_STEP_LABELS: Record<string, { en: string; ur: string }> = {
  search_legal_corpus: { en: 'Searching legal corpus…', ur: 'قانونی مجموعہ تلاش ہو رہا ہے…' },
  look_up_support_directory: { en: 'Looking up support resources…', ur: 'مدد کے وسائل تلاش ہو رہے ہیں…' },
  get_complaint_status: { en: 'Checking complaint status…', ur: 'شکایت کی حیثیت دیکھی جا رہی ہے…' },
  open_crisis_modal: { en: 'Opening crisis support…', ur: 'ہنگامی مدد کھولی جا رہی ہے…' },
  open_complaint_builder: { en: 'Opening complaint builder…', ur: 'شکایت ڈرافٹر کھولا جا رہا ہے…' },
  prepare_complaint_draft: { en: 'Preparing complaint draft…', ur: 'شکایت کا مسودہ تیار ہو رہا ہے…' },
  save_incident_to_vault: { en: 'Saving to private vault…', ur: 'پرائیویٹ والٹ میں محفوظ ہو رہا ہے…' },
  start_safety_checkin: { en: 'Starting safety check-in…', ur: 'سیفٹی چیک ان شروع ہو رہا ہے…' },
  send_sms_to_contact: { en: 'Preparing SMS…', ur: 'پیغام تیار ہو رہا ہے…' },
  email_complaint_to_authority: { en: 'Preparing email…', ur: 'ای میل تیار ہو رہا ہے…' },
};

function getSafeLabel(step: AgentStep, isUrdu: boolean): string {
  if (step.toolName && SAFE_STEP_LABELS[step.toolName]) {
    return isUrdu ? SAFE_STEP_LABELS[step.toolName].ur : SAFE_STEP_LABELS[step.toolName].en;
  }
  return step.label;
}

function StatusIcon({ status }: { status: AgentStep['status'] }) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />;
    case 'active':
      return <Loader2 className="w-3.5 h-3.5 text-[#FC7454] animate-spin" />;
    case 'waiting':
      return <Clock className="w-3.5 h-3.5 text-amber-500" />;
    case 'failed':
      return <AlertTriangle className="w-3.5 h-3.5 text-red-500" />;
    default:
      return <div className="w-3.5 h-3.5 rounded-full bg-slate-200" />;
  }
}

function statusLabel(status: AgentStep['status'], isUrdu: boolean): string {
  switch (status) {
    case 'completed': return isUrdu ? 'مکمل' : 'completed';
    case 'active': return isUrdu ? 'جاری ہے' : 'in progress';
    case 'waiting': return isUrdu ? 'انتظار' : 'waiting';
    case 'failed': return isUrdu ? 'ناکام' : 'failed';
    default: return '';
  }
}

export const AgentStepsPanel: React.FC<AgentStepsPanelProps> = ({ steps, isUrdu = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!steps || steps.length === 0) return null;

  const hasActive = steps.some(s => s.status === 'active');
  const hasWaiting = steps.some(s => s.status === 'waiting');
  const completedCount = steps.filter(s => s.status === 'completed').length;

  return (
    <div className="mt-2 rounded-xl border border-[#BCD4D4]/40 bg-[#F8FBFB] overflow-hidden">
      {/* Collapsed header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs cursor-pointer hover:bg-[#ECF4F4]/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {hasActive && <Loader2 className="w-3.5 h-3.5 text-[#FC7454] animate-spin" />}
          {!hasActive && !hasWaiting && (
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
          )}
          {hasWaiting && <Clock className="w-3.5 h-3.5 text-amber-500" />}
          <span className="font-semibold text-[#1C2C34]">
            {isUrdu ? 'کارروائی کے مراحل' : 'Agent Steps'}
          </span>
          <span className="text-[#5A6E78]">
            ({completedCount}/{steps.length})
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-[#5A6E78]" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-[#5A6E78]" />
        )}
      </button>

      {/* Expanded step list */}
      {isExpanded && (
        <div className="px-3 pb-2 space-y-1.5">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center gap-2 text-[11px]">
              <StatusIcon status={step.status} />
              <span className="text-[#1C2C34] flex-1">
                {getSafeLabel(step, isUrdu)}
              </span>
              <span className={`font-medium ${
                step.status === 'completed' ? 'text-green-600' :
                step.status === 'active' ? 'text-[#FC7454]' :
                step.status === 'waiting' ? 'text-amber-600' :
                step.status === 'failed' ? 'text-red-500' :
                'text-[#5A6E78]'
              }`}>
                {statusLabel(step.status, isUrdu)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
