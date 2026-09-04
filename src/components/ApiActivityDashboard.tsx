/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Live API Integration Activity Monitor (Prompt #2).
 *
 * Streams the user's own rows from the api_activity_logs table — every
 * Twilio SMS, Resend email, Gemini call and Supabase write the server makes
 * on her behalf — with:
 *   - Supabase Realtime INSERT subscription (live tail, RLS-scoped),
 *   - aggregate stats (success rate, avg latency, per-service counts),
 *   - service + status filters,
 *   - expandable request/response previews (secrets already redacted
 *     server-side before insert).
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  ChevronDown,
  Lock,
  Radio,
  Zap,
  MessageSquare,
  Mail,
  Database,
  Server,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ApiActivityLog, AppLanguage } from '../types';
import { getSupabase } from '../utils/supabase';

interface ApiActivityDashboardProps {
  language: AppLanguage;
}

const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  twilio: MessageSquare,
  resend: Mail,
  gemini: Zap,
  supabase: Database,
  server: Server,
  geolocation: Radio
};

const SERVICE_COLORS: Record<string, string> = {
  twilio: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900',
  resend: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900',
  gemini: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900',
  supabase: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
  server: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  geolocation: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-900'
};

const STATUS_STYLES: Record<string, string> = {
  success: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
  failed: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900',
  pending: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900',
  timeout: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900'
};

function mapRow(row: Record<string, unknown>): ApiActivityLog {
  return {
    id: String(row.id ?? `${Date.now()}-${Math.random()}`),
    endpoint: String(row.endpoint ?? ''),
    method: String(row.method ?? ''),
    targetService: String(row.target_service ?? 'server'),
    status: String(row.status ?? 'pending'),
    statusCode: typeof row.status_code === 'number' ? row.status_code : null,
    requestPreview: typeof row.request_preview === 'string' ? row.request_preview : null,
    responsePreview: typeof row.response_preview === 'string' ? row.response_preview : null,
    durationMs: typeof row.duration_ms === 'number' ? row.duration_ms : null,
    errorMessage: typeof row.error_message === 'string' ? row.error_message : null,
    createdAt: String(row.created_at ?? new Date().toISOString())
  };
}

export const ApiActivityDashboard: React.FC<ApiActivityDashboardProps> = ({ language }) => {
  const isUrdu = language === 'ur';

  const [logs, setLogs] = useState<ApiActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [liveInserts, setLiveInserts] = useState(0);
  const [realtimeUp, setRealtimeUp] = useState(false);

  const loadLogs = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) {
      setIsSignedIn(false);
      setIsLoading(false);
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setIsSignedIn(false);
      setIsLoading(false);
      return;
    }
    setIsSignedIn(true);
    const { data, error } = await supabase
      .from('api_activity_logs')
      .select('id, endpoint, method, target_service, status, status_code, request_preview, response_preview, duration_ms, error_message, created_at')
      .order('created_at', { ascending: false })
      .limit(60);
    if (!error && data) {
      setLogs((data as unknown as Record<string, unknown>[]).map(mapRow));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  // Live tail — Supabase Realtime INSERTs (RLS ensures she only sees her own).
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    const channel = supabase
      .channel('api-activity-monitor')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'api_activity_logs' },
        (payload) => {
          const row = (payload as { new?: Record<string, unknown> }).new;
          if (!row) return;
          setLogs(prev => [mapRow(row), ...prev].slice(0, 60));
          setLiveInserts(count => count + 1);
        }
      )
      .subscribe((status) => {
        setRealtimeUp(status === 'SUBSCRIBED');
      });
    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadLogs();
    setIsRefreshing(false);
  };

  const services = useMemo(() => {
    const counts = new Map<string, number>();
    for (const log of logs) counts.set(log.targetService, (counts.get(log.targetService) || 0) + 1);
    return counts;
  }, [logs]);

  const filteredLogs = useMemo(() => (
    logs.filter(log =>
      (serviceFilter === 'all' || log.targetService === serviceFilter) &&
      (statusFilter === 'all' || log.status === statusFilter)
    )
  ), [logs, serviceFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = logs.length;
    const success = logs.filter(l => l.status === 'success').length;
    const failed = logs.filter(l => l.status === 'failed' || l.status === 'timeout').length;
    const durations = logs.map(l => l.durationMs).filter((d): d is number => typeof d === 'number');
    const avgDuration = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
    return { total, success, failed, successRate: total > 0 ? Math.round((success / total) * 100) : 100, avgDuration };
  }, [logs]);

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleString([], {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
    } catch {
      return iso;
    }
  };

  // ---------------------------------------------------------------------
  // Not configured / signed-out states
  // ---------------------------------------------------------------------
  if (!isLoading && isSignedIn === false) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="rounded-3xl bg-white dark:bg-[#181B24] border border-slate-200 dark:border-slate-800 p-8 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#ECF4F4] dark:bg-[#263842] border border-[#BCD4D4] dark:border-slate-700 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7 text-[#FC7454]" />
          </div>
          <h2 className="text-lg font-black text-[#1C2C34] dark:text-white uppercase tracking-wide">
            {isUrdu ? 'لائیو انٹیگریشن مانیٹر' : 'Live Integration Monitor'}
          </h2>
          <p className="text-xs text-[#5A6E78] dark:text-slate-400 leading-relaxed max-w-md mx-auto">
            {isUrdu
              ? 'ہر ٹویلیو ایس ایم ایس، ری سینڈ ای میل، جیمنی کال اور Supabase ٹرانزیکشن کا لائیو ریکارڈ — صرف آپ کے اکاؤنٹ کے لیے۔ دیکھنے کے لیے سائن اِن کریں۔'
              : 'A live, auditable record of every Twilio SMS, Resend email, Gemini call and Supabase transaction the server performs on your behalf — visible only to your account. Sign in to view your activity stream.'}
          </p>
          <div className="flex items-center justify-center gap-2 text-[11px] text-[#5A6E78] dark:text-slate-400">
            <ShieldAlert className="w-4 h-4 text-[#FC7454]" />
            <span>{isUrdu ? 'رازدانی: صرف آپ کی اپنی سرگرمی (RLS)' : 'Privacy: RLS ensures you only ever see your own activity rows.'}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 space-y-4 text-[#1C2C34] dark:text-[#F9FAFB]">
      {/* Header */}
      <div className="rounded-3xl bg-white dark:bg-[#181B24] p-5 shadow-xs border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[11px] font-black tracking-[0.2em] text-[#FC7454] uppercase block">
              {isUrdu ? 'لائیو انٹیگریشن' : 'LIVE INTEGRATIONS'}
            </span>
            <h2 className="text-lg sm:text-xl font-black tracking-wide text-[#1C2C34] dark:text-white uppercase">
              {isUrdu ? 'API ایکٹیویٹی مانیٹر' : 'API Activity Monitor'}
            </h2>
            <p className="text-xs text-[#5A6E78] dark:text-slate-400 font-medium">
              {isUrdu
                ? 'سرور کی جانب سے آپ کے لیے کیے گئے ہر بیرونی کال کا ریکارڈ'
                : 'Every external call the server performs on your behalf — SMS, email, AI, database.'}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-[#ECF4F4] dark:bg-[#263842] hover:bg-[#C4DCDC] dark:hover:bg-[#344854] border border-[#BCD4D4] dark:border-slate-700 text-[#1C2C34] dark:text-white transition cursor-pointer disabled:opacity-50 flex-shrink-0"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Realtime + live counters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full border ${
            realtimeUp
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400'
              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-[#5A6E78] dark:text-slate-400'
          }`}>
            <Radio className={`w-3 h-3 ${realtimeUp ? 'animate-pulse' : ''}`} />
            {realtimeUp
              ? (isUrdu ? 'ریئل ٹائم فعال' : 'Realtime connected')
              : (isUrdu ? 'ریئل ٹائم…' : 'Connecting…')}
          </span>
          {liveInserts > 0 && (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full bg-[#ECF4F4] dark:bg-[#263842] border border-[#BCD4D4] dark:border-slate-700 text-[#1C2C34] dark:text-white">
              <Activity className="w-3 h-3 text-[#FC7454]" />
              {isUrdu ? `${liveInserts} نئے` : `${liveInserts} live`}
            </span>
          )}
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-2xl bg-[#F8F9FD] dark:bg-[#12141C] border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] font-black tracking-wider uppercase text-[#5A6E78] dark:text-slate-400">
              {isUrdu ? 'کُال کالز' : 'Total Calls'}
            </div>
            <div className="text-xl font-black text-[#1C2C34] dark:text-white mt-0.5">{stats.total}</div>
          </div>
          <div className="p-3 rounded-2xl bg-[#F8F9FD] dark:bg-[#12141C] border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] font-black tracking-wider uppercase text-[#5A6E78] dark:text-slate-400">
              {isUrdu ? 'کامیابی' : 'Success'}
            </div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{stats.successRate}%</div>
          </div>
          <div className="p-3 rounded-2xl bg-[#F8F9FD] dark:bg-[#12141C] border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] font-black tracking-wider uppercase text-[#5A6E78] dark:text-slate-400">
              {isUrdu ? 'ناکام' : 'Failed'}
            </div>
            <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-0.5">{stats.failed}</div>
          </div>
          <div className="p-3 rounded-2xl bg-[#F8F9FD] dark:bg-[#12141C] border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] font-black tracking-wider uppercase text-[#5A6E78] dark:text-slate-400">
              {isUrdu ? 'اوسط رفتار' : 'Avg Latency'}
            </div>
            <div className="text-xl font-black text-[#1C2C34] dark:text-white mt-0.5">
              {stats.avgDuration}<span className="text-xs font-bold text-[#5A6E78]">ms</span>
            </div>
          </div>
        </div>

        {/* Service filter chips */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setServiceFilter('all')}
            className={`px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase border transition cursor-pointer ${
              serviceFilter === 'all'
                ? 'bg-[#1C2C34] dark:bg-[#BCD4D4] text-white dark:text-[#1C2C34] border-transparent'
                : 'bg-white dark:bg-[#12141C] text-[#5A6E78] dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-[#BCD4D4]'
            }`}
          >
            {isUrdu ? 'تمام' : 'All'} · {logs.length}
          </button>
          {[...services.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([service, count]) => (
              <button
                key={service}
                onClick={() => setServiceFilter(serviceFilter === service ? 'all' : service)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase border transition cursor-pointer ${
                  serviceFilter === service
                    ? 'bg-[#1C2C34] dark:bg-[#BCD4D4] text-white dark:text-[#1C2C34] border-transparent'
                    : `${SERVICE_COLORS[service] || SERVICE_COLORS.server} hover:opacity-80`
                }`}
              >
                {service} · {count}
              </button>
            ))}
        </div>

        {/* Status filter */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: isUrdu ? 'کُال اسٹیٹس' : 'Any status' },
            { id: 'success', label: isUrdu ? 'کامیاب' : 'Success' },
            { id: 'failed', label: isUrdu ? 'ناکام' : 'Failed' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setStatusFilter(opt.id)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
                statusFilter === opt.id
                  ? 'bg-[#FC7454] text-white'
                  : 'bg-[#F8F9FD] dark:bg-[#12141C] text-[#5A6E78] dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Log stream */}
      <div className="space-y-2">
        {isLoading && (
          <div className="rounded-2xl bg-white dark:bg-[#181B24] border border-slate-200 dark:border-slate-800 p-6 text-center">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#FC7454]" />
            <p className="text-xs text-[#5A6E78] dark:text-slate-400 mt-2">
              {isUrdu ? 'لوڈ ہو رہا ہے…' : 'Loading activity stream…'}
            </p>
          </div>
        )}

        {!isLoading && filteredLogs.length === 0 && (
          <div className="rounded-2xl bg-white dark:bg-[#181B24] border border-slate-200 dark:border-slate-800 p-8 text-center space-y-2">
            <Activity className="w-8 h-8 mx-auto text-[#BCD4D4]" />
            <p className="text-xs font-bold text-[#1C2C34] dark:text-white">
              {isUrdu ? 'ابھی کوئی سرگرمی ریکارڈ نہیں ہوئی' : 'No activity recorded yet'}
            </p>
            <p className="text-[11px] text-[#5A6E78] dark:text-slate-400 leading-relaxed">
              {isUrdu
                ? 'جب آپ چیک ان شروع کریں گے، ایس او ایس بھیجیں گے یا شکایت جمع کروائیں گے تو ہر بیرونی کال یہاں فوری طور پر ظاہر ہوگی۔'
                : 'Start a check-in, send an SOS alert, or file a complaint — every external dispatch will appear here in real time.'}
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {filteredLogs.map(log => {
            const ServiceIcon = SERVICE_ICONS[log.targetService] || Server;
            const isExpanded = expandedId === log.id;
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl bg-white dark:bg-[#181B24] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  className="w-full p-3.5 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-[#F8F9FD] dark:hover:bg-[#12141C]/60 transition"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${SERVICE_COLORS[log.targetService] || SERVICE_COLORS.server}`}>
                      <ServiceIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-[#1C2C34] dark:text-white truncate">
                          {log.endpoint}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase border ${STATUS_STYLES[log.status] || STATUS_STYLES.pending}`}>
                          {log.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-[#5A6E78] dark:text-slate-400 mt-0.5">
                        <span className="font-bold uppercase">{log.method}</span>
                        {log.statusCode !== null && <span>· {log.statusCode}</span>}
                        {log.durationMs !== null && (
                          <span className="inline-flex items-center gap-0.5">
                            · <Clock className="w-3 h-3" />{log.durationMs}ms
                          </span>
                        )}
                        <span>· {formatTime(log.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-[#5A6E78] dark:text-slate-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {isExpanded && (
                  <div className="px-3.5 pb-3.5 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                    {log.errorMessage && (
                      <div className="flex items-start gap-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-[11px] text-rose-700 dark:text-rose-300 leading-relaxed">
                        <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span className="break-all">{log.errorMessage}</span>
                      </div>
                    )}
                    {log.requestPreview && (
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-wider text-[#5A6E78] dark:text-slate-400 mb-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-[#FC7454]" />
                          {isUrdu ? 'درخواست (رازوں کو ہٹا دیا گیا)' : 'Request (secrets redacted)'}
                        </div>
                        <pre className="p-2.5 rounded-xl bg-[#F8F9FD] dark:bg-[#12141C] border border-slate-200 dark:border-slate-800 text-[10px] leading-relaxed whitespace-pre-wrap break-all max-h-40 overflow-y-auto text-[#1C2C34] dark:text-slate-300">
                          {log.requestPreview}
                        </pre>
                      </div>
                    )}
                    {log.responsePreview && (
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-wider text-[#5A6E78] dark:text-slate-400 mb-1">
                          {isUrdu ? 'جواب' : 'Response'}
                        </div>
                        <pre className="p-2.5 rounded-xl bg-[#F8F9FD] dark:bg-[#12141C] border border-slate-200 dark:border-slate-800 text-[10px] leading-relaxed whitespace-pre-wrap break-all max-h-40 overflow-y-auto text-[#1C2C34] dark:text-slate-300">
                          {log.responsePreview}
                        </pre>
                      </div>
                    )}
                    {!log.errorMessage && !log.requestPreview && !log.responsePreview && (
                      <p className="text-[11px] text-[#5A6E78] dark:text-slate-400">
                        {isUrdu ? 'کوئی پریویو دستیاب نہیں۔' : 'No preview payload recorded.'}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer note */}
      <p className="text-[10px] text-center text-[#5A6E78] dark:text-slate-500 leading-relaxed px-4 pb-2">
        {isUrdu
          ? 'ہر اندراج سرور پر خفیہ رازوں (ٹوکن، پاس ورڈز) کو ہٹانے کے بعد محفوظ کیا جاتا ہے — صرف 500 حروف کا جائزہ۔ RLS کے تحت یہ ڈیٹا صرف آپ دیکھ سکتی ہیں۔'
          : 'Every entry is stored server-side after stripping secrets (tokens, keys) — previews capped at 500 chars. RLS restricts this data to your account only.'}
      </p>
    </div>
  );
};
