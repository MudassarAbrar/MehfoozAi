/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Agent tool executor — dispatches safe tool calls to their implementations.
 * Read-only tools execute automatically; UI-only tools return action signals.
 */

import { searchLegalCorpus } from '../../src/data/legalCorpus.js';
import { PUNJAB_SUPPORT_DIRECTORY } from '../../src/data/supportDirectory.js';
import { createUserClient } from '../supabaseServer.js';
import { AgentCitation } from './schemas.js';

export interface ToolExecutionResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

/** Executes a safe (read-only or UI-only) tool. */
export async function executeSafeTool(
  name: string,
  args: Record<string, unknown>,
  userId: string,
  accessToken: string
): Promise<ToolExecutionResult> {
  try {
    switch (name) {
      case 'search_legal_corpus':
        return await executeSearchLegalCorpus(args);

      case 'look_up_support_directory':
        return await executeLookUpSupportDirectory(args);

      case 'get_complaint_status':
        return await executeGetComplaintStatus(args, userId, accessToken);

      case 'open_crisis_modal':
        return { success: true, data: { uiAction: 'open_crisis_modal' } };

      case 'open_complaint_builder':
        return { success: true, data: { uiAction: 'open_complaint_builder', category: args.category } };

      default:
        return { success: false, error: `Unknown safe tool: ${name}` };
    }
  } catch (err: any) {
    console.warn(`Tool execution failed (${name}):`, err.message);
    return { success: false, error: err.message || 'Tool execution failed' };
  }
}

/** search_legal_corpus: searches the local Punjab legal corpus. */
async function executeSearchLegalCorpus(args: Record<string, unknown>): Promise<ToolExecutionResult> {
  const query = typeof args.query === 'string' ? args.query : '';
  if (!query) {
    return { success: false, error: 'Query is required' };
  }

  const maxResults = typeof args.max_results === 'number' ? Math.min(Math.max(1, args.max_results), 5) : 3;
  const statuteFilter = typeof args.statute_filter === 'string' ? args.statute_filter : undefined;

  const citations = searchLegalCorpus(query, maxResults);

  // Filter by statute if provided
  const filtered = statuteFilter
    ? citations.filter(c =>
        c.document.toLowerCase().includes(statuteFilter.toLowerCase()) ||
        c.sectionTitle.toLowerCase().includes(statuteFilter.toLowerCase())
      )
    : citations;

  const result: AgentCitation[] = filtered.map(c => ({
    sourceId: c.chunkId,
    title: c.sectionTitle,
    statute: c.document,
    section: c.section,
    summary: c.excerpt
  }));

  return { success: true, data: { citations: result } };
}

/** look_up_support_directory: filters the support directory by category/district. */
async function executeLookUpSupportDirectory(args: Record<string, unknown>): Promise<ToolExecutionResult> {
  const category = typeof args.category === 'string' ? args.category : '';
  if (!category) {
    return { success: false, error: 'Category is required' };
  }

  const district = typeof args.district === 'string' ? args.district : undefined;

  let results = PUNJAB_SUPPORT_DIRECTORY.filter(r => r.category === category);

  if (district) {
    results = results.filter(r =>
      r.district === 'All Punjab' ||
      r.district.toLowerCase().includes(district.toLowerCase())
    );
  }

  const formatted = results.map(r => ({
    id: r.id,
    name: r.name,
    nameUrdu: r.nameUrdu,
    category: r.category,
    district: r.district,
    phone: r.phone,
    helpline: r.helpline,
    website: r.website,
    address: r.address,
    description: r.description,
    is24x7: r.is24x7,
    freeOfCost: r.freeOfCost,
    verified: r.verified
  }));

  return { success: true, data: { resources: formatted } };
}

/** get_complaint_status: looks up a complaint by tracking number (RLS-scoped). */
async function executeGetComplaintStatus(
  args: Record<string, unknown>,
  userId: string,
  accessToken: string
): Promise<ToolExecutionResult> {
  const trackingNumber = typeof args.tracking_number === 'string' ? args.tracking_number : '';
  if (!trackingNumber) {
    return { success: false, error: 'Tracking number is required' };
  }

  const userClient = createUserClient(accessToken);
  if (!userClient) {
    return { success: false, error: 'Supabase backend not configured' };
  }

  const { data, error } = await userClient
    .from('complaints')
    .select('id, tracking_number, status, stage, category, district, summary_plain, delivery_status, created_at, updated_at')
    .eq('tracking_number', trackingNumber)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data) {
    return { success: false, error: 'Complaint not found or access denied' };
  }

  return { success: true, data: data };
}
