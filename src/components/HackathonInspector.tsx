/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  TerminalSquare, 
  X, 
  ShieldCheck, 
  Cpu, 
  Lock, 
  Network, 
  CheckCircle2, 
  FileCode, 
  Activity, 
  Key, 
  Eye, 
  AlertTriangle,
  Scale
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AuditLogEntry } from '../types';

interface HackathonInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  auditLogs: AuditLogEntry[];
}

export const HackathonInspector: React.FC<HackathonInspectorProps> = ({
  isOpen,
  onClose,
  auditLogs,
}) => {
  const [activeTab, setActiveTab] = useState<'rag' | 'security' | 'handoff' | 'logs'>('rag');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white border-l border-slate-200 shadow-2xl flex flex-col text-[#1C2C34]">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-[#F4F4FC]">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#ECF4F4] text-[#FC7454] flex items-center justify-center border border-[#BCD4D4]">
            <TerminalSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1C2C34] flex items-center space-x-2">
              <span>Judge & Telemetry Inspector</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-mono border border-emerald-200 font-bold">
                Live Engine
              </span>
            </h3>
            <p className="text-[11px] text-[#5A6E78]">Architecture, RAG Grounding & Security Verification</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-[#1C2C34] hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 bg-[#F4F4FC] text-xs">
        <button
          onClick={() => setActiveTab('rag')}
          className={`flex-1 py-2.5 font-bold text-center border-b-2 transition cursor-pointer ${
            activeTab === 'rag' 
              ? 'border-[#FC7454] text-[#FC7454] bg-white font-bold' 
              : 'border-transparent text-[#5A6E78] hover:text-[#1C2C34]'
          }`}
        >
          Safety & RAG
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex-1 py-2.5 font-bold text-center border-b-2 transition cursor-pointer ${
            activeTab === 'security' 
              ? 'border-[#FC7454] text-[#FC7454] bg-white font-bold' 
              : 'border-transparent text-[#5A6E78] hover:text-[#1C2C34]'
          }`}
        >
          Crypto / Vault
        </button>
        <button
          onClick={() => setActiveTab('handoff')}
          className={`flex-1 py-2.5 font-bold text-center border-b-2 transition cursor-pointer ${
            activeTab === 'handoff' 
              ? 'border-[#FC7454] text-[#FC7454] bg-white font-bold' 
              : 'border-transparent text-[#5A6E78] hover:text-[#1C2C34]'
          }`}
        >
          Handoff Pipeline
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex-1 py-2.5 font-bold text-center border-b-2 transition cursor-pointer ${
            activeTab === 'logs' 
              ? 'border-[#FC7454] text-[#FC7454] bg-white font-bold' 
              : 'border-transparent text-[#5A6E78] hover:text-[#1C2C34]'
          }`}
        >
          Live Logs ({auditLogs.length})
        </button>
      </div>

      {/* Drawer Content Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-[#1C2C34]">
        {/* TAB 1: RAG & Safety Architecture */}
        {activeTab === 'rag' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-[#1C2C34] flex items-center space-x-1.5 text-xs">
                <Cpu className="w-4 h-4 text-[#FC7454]" />
                <span>Deterministic Safety Pipeline & Intent Classifier</span>
              </h4>
              <p className="text-[#5A6E78] leading-relaxed text-[11px]">
                Mehfooz executes a multi-stage evaluation pipeline prior to synthesis:
              </p>
              <div className="space-y-1.5 font-mono text-[11px] bg-white p-3 rounded-xl border border-slate-200 text-[#1C2C34]">
                <p className="text-rose-600 font-semibold">Stage 1: Crisis & Imminent Danger Pre-Check</p>
                <p className="text-[#1C2C34] font-semibold">Stage 2: Intent Classification (Statutory Law / Vault / Emergency)</p>
                <p className="text-[#1C2C34] font-semibold">Stage 3: Vector & Keyword Match over Punjab Statutes</p>
                <p className="text-emerald-700 font-semibold">Stage 4: Grounded Synthesis with Official Gazette Citations</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-[#1C2C34] flex items-center space-x-1.5 text-xs">
                <Scale className="w-4 h-4 text-[#FC7454]" />
                <span>Punjab Legal Corpus Grounding Index</span>
              </h4>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <strong className="text-[#1C2C34] block">PPWVA 2016</strong>
                  <span className="text-[#5A6E78]">Sections 3, 4, 7, 8, 9, 10 (Protection, Residence, VAWC)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <strong className="text-[#1C2C34] block">Workplace Act 2010</strong>
                  <span className="text-[#5A6E78]">Sections 4, 8, 9 (Inquiry Committee, Ombudsperson)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <strong className="text-[#1C2C34] block">PECA 2016</strong>
                  <span className="text-[#5A6E78]">Sections 20, 21, 24 (Cyber stalking, image blackmail)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <strong className="text-[#1C2C34] block">PPC Penal Code</strong>
                  <span className="text-[#5A6E78]">Sections 354, 506, 509 (Assault, intimidation, modesty)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Security & Cryptography */}
        {activeTab === 'security' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="font-bold text-[#1C2C34] flex items-center space-x-1.5 text-xs">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>Zero-Knowledge AES-GCM 256 Local Encryption</span>
              </h4>
              <p className="text-[#5A6E78] text-[11px] leading-relaxed">
                All incident dates, locations, audio recordings, and notes are processed through the Web Crypto API using browser-level key generation.
              </p>

              <div className="space-y-2 font-mono text-[11px]">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Algorithm:</span>
                  <span className="text-emerald-700 font-semibold">AES-GCM (256-bit Key, 12-byte IV)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Server Storage:</span>
                  <span className="text-[#1C2C34] font-semibold">0 KB (Zero server telemetry or central DB)</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-[#1C2C34] flex items-center space-x-1.5 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Active Server Rate Limiting & Protection Layer</span>
              </h4>
              <p className="text-[#5A6E78] text-[11px]">
                Express backend security middleware defends against DDoS, prompt injection spam, and brute-force attempts.
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono mt-1">
                <div className="p-2 rounded-xl bg-white border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">AI Rate Limit:</span>
                  <span className="text-emerald-700 font-bold">30 req / 5 min</span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">Global API Limit:</span>
                  <span className="text-[#1C2C34] font-bold">120 req / 15 min</span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">Security Headers:</span>
                  <span className="text-[#1C2C34] font-bold">Helmet + nosniff</span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">Payload Sanitizer:</span>
                  <span className="text-[#1C2C34] font-bold">Active (Null/XSS)</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-[#1C2C34] flex items-center space-x-1.5 text-xs">
                <Key className="w-4 h-4 text-[#FC7454]" />
                <span>Stealth Weather Cover Pin Engine</span>
              </h4>
              <p className="text-[#5A6E78] text-[11px]">
                PIN entry is masked behind interactive weather temperature widgets to prevent shoulder surfing in hostile home environments.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: Handoff & Consent Protocol */}
        {activeTab === 'handoff' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-[#1C2C34] flex items-center space-x-1.5 text-xs">
                <Network className="w-4 h-4 text-[#FC7454]" />
                <span>Transparent Official Route Protocol</span>
              </h4>
              <p className="text-[#5A6E78] text-[11px] leading-relaxed">
                Mehfooz strictly separates AI assistance from legal authority.
              </p>

              <div className="space-y-2 text-[11px] mt-2">
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-[#1C2C34]">Explicit Consent Gate:</strong> No payload transmission without checkbox and timestamped audit token.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-[#1C2C34]">No Automated Dispatch:</strong> App explicitly notifies the user that physical response requires official police confirmation.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-[#1C2C34]">Official Destination Route:</strong> Handed off to Punjab Safe Cities Authority 15 & Virtual Women Police Station.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Live Logs */}
        {activeTab === 'logs' && (
          <div className="space-y-2 font-mono text-[11px]">
            {auditLogs.length === 0 ? (
              <p className="text-[#5A6E78] text-center py-8">No audit events generated in this session yet.</p>
            ) : (
              auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[#FC7454] font-bold uppercase">{log.eventType}</span>
                    <span className="text-[#5A6E78]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-[#1C2C34]">{log.detail}</p>
                  {log.confidence !== undefined && (
                    <span className="text-[10px] text-emerald-700 font-medium">Confidence: {Math.round(log.confidence * 100)}%</span>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100 bg-white text-right">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1C2C34] text-xs font-semibold transition cursor-pointer"
        >
          Close Inspector
        </button>
      </div>
    </div>
  );
};
