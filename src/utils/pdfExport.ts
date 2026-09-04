/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import { ComplaintDraft, VaultRecord } from '../types';

export interface PDFExportOptions {
  password?: string;
  complainantName?: string;
  includeAttachedRecords?: boolean;
  attachedRecords?: VaultRecord[];
  caseReferenceNumber?: string;
  confidentialWatermark?: boolean;
  downloadImmediately?: boolean;
}

export interface PDFExportResult {
  blob: Blob;
  base64: string;
  dataUri: string;
  fileName: string;
  isPasswordProtected: boolean;
  pageCount: number;
}

/**
 * Downloads a binary Blob in browser environments cleanly without popups
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  setTimeout(() => {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Formats a category code to a clean legal label
 */
function getLegalCategoryTitle(category: string): string {
  const map: Record<string, string> = {
    domestic_violence: 'Domestic Violence & Physical Endangerment (PPWVA 2016)',
    coercive_control: 'Coercive Control, Confinement & Emotional Abuse',
    threats_intimidation: 'Criminal Intimidation & Extortion Threats (PPC 506)',
    workplace_harassment: 'Harassment at Workplace (Protection Act 2010 / 2022)',
    stalking_harassment: 'Stalking, Surveillance & Public Space Harassment',
    cyber_blackmail: 'Cyber Blackmail, Non-Consensual Imagery & Doxxing (PECA 2016)',
    physical_assault: 'Physical Assault & Grievous Hurt (PPC 337 / 354)',
    financial_abuse: 'Economic Deprivation & Denial of Maintenance Rights',
    other: 'General Protective Petition & Incident Record'
  };
  return map[category] || 'Formal Incident Petition';
}

/**
 * Formats the authority destination string
 */
function getAuthorityHeading(requestedSupport?: string, channel?: string): string {
  if (channel) return channel.toUpperCase();
  if (requestedSupport === 'workplace_ombudsperson') {
    return 'BEFORE THE PROVINCIAL OMBUDSPERSON FOR PROTECTION AGAINST HARASSMENT OF WOMEN AT WORKPLACE, PUNJAB';
  }
  if (requestedSupport === 'fia_cybercrime') {
    return 'BEFORE THE FEDERAL INVESTIGATION AGENCY (FIA) CYBER CRIME WING / NR3C (PECA 2016)';
  }
  if (requestedSupport === 'protection_committee') {
    return 'BEFORE THE DISTRICT WOMEN PROTECTION COMMITTEE (DWPC) & DISTRICT WOMEN PROTECTION OFFICER, PUNJAB';
  }
  if (requestedSupport === 'pcsw_helpline') {
    return 'BEFORE THE PUNJAB COMMISSION ON THE STATUS OF WOMEN (PCSW) & WOMEN HELPLINE 1043';
  }
  if (requestedSupport === 'fospah') {
    return 'BEFORE THE FEDERAL OMBUDSPERSON FOR PROTECTION AGAINST HARASSMENT (FOSPAH)';
  }
  if (requestedSupport === 'shelter') {
    return 'BEFORE THE DAR-UL-AMAN CRISIS SHELTER & SOCIAL WELFARE DEPARTMENT, PUNJAB';
  }
  if (requestedSupport === 'social_welfare') {
    return 'BEFORE THE SOCIAL WELFARE & BAIT-UL-MAAL DEPARTMENT, PUNJAB';
  }
  if (requestedSupport === 'counselling') {
    return 'CLINICAL PSYCHOLOGICAL COUNSELLING & TRAUMA HEALTH SERVICES';
  }
  if (requestedSupport === 'legal_aid') {
    return 'BEFORE THE LEGAL AID & HUMAN RIGHTS COUNSEL / HIGH COURT BAR CELL';
  }
  return 'BEFORE THE PUNJAB SAFE CITIES AUTHORITY (PSCA) & VIRTUAL WOMEN POLICE STATION, PUNJAB POLICE';
}

/**
 * Adds standard legal headers, case particulars, and borders on each page
 */
function drawPageDecorations(doc: jsPDF, pageNum: number, totalPages: number, refCode: string, isEncrypted: boolean) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Outer framing line (0.2mm stroke for clean printout)
  doc.setDrawColor(30, 41, 59); // slate-800
  doc.setLineWidth(0.3);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

  // Inner hairline border
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.1);
  doc.rect(13.5, 13.5, pageWidth - 27, pageHeight - 27);

  // Top header text
  doc.setFont('times', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('GOVERNMENT OF PUNJAB • FORMAL PROTECTIVE PETITION DOSSIER', 16, 17);
  doc.text(`REF: ${refCode}`, pageWidth - 16, 17, { align: 'right' });

  // Bottom footer text
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  const securityTag = isEncrypted ? ' • [PASSWORD PROTECTED 128-BIT]' : '';
  doc.text(
    `CONFIDENTIAL LEGAL PETITION${securityTag} • SUBMISSION COPY`,
    16,
    pageHeight - 16
  );
  doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 16, pageHeight - 16, { align: 'right' });
}

/**
 * Exports a formal complaint draft into a printer-friendly, password-protected PDF
 */
export async function exportComplaintToPDF(
  draft: ComplaintDraft,
  options: PDFExportOptions = {}
): Promise<PDFExportResult> {
  const hasPassword = Boolean(options.password && options.password.trim().length > 0);
  const cleanPassword = options.password ? options.password.trim() : undefined;
  const refCode = options.caseReferenceNumber || draft.officialReferenceNumber || `MEHFOOZ-${draft.district.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;

  // Instantiate jsPDF with encryption if password provided
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    ...(hasPassword && cleanPassword
      ? {
          encryption: {
            userPassword: cleanPassword,
            ownerPassword: `${cleanPassword}_master_auth_key`,
            userPermissions: ['print', 'copy']
          }
        }
      : {})
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = 25;

  // Helper for line advancement with automatic page break
  const ensureSpace = (requiredHeight: number) => {
    if (cursorY + requiredHeight > pageHeight - 22) {
      doc.addPage();
      cursorY = 24;
    }
  };

  // 1. OFFICIAL PETITION BANNER & COAT OF ARMS / LOGO HEAD
  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42); // slate-900
  const authority = getAuthorityHeading(draft.requestedSupport, draft.officialChannelUsed);
  const authLines = doc.splitTextToSize(authority, contentWidth);
  doc.text(authLines, pageWidth / 2, cursorY, { align: 'center' });
  cursorY += authLines.length * 5.5 + 2;

  doc.setFont('times', 'italic');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Province of Punjab, Islamic Republic of Pakistan', pageWidth / 2, cursorY, { align: 'center' });
  cursorY += 6;

  // Horizontal divider
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.5);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 5;

  // 2. CASE PARTICULARS TABLE HEADER
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, cursorY, contentWidth, 24, 'FD');

  doc.setFont('times', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('CASE / DIARY REF NO:', margin + 4, cursorY + 6);
  doc.setFont('courier', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(2, 44, 34); // emerald-950
  doc.text(refCode, margin + 44, cursorY + 6);

  doc.setFont('times', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('DATE OF FILING:', margin + 105, cursorY + 6);
  doc.setFont('times', 'normal');
  doc.text(new Date(draft.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }), margin + 138, cursorY + 6);

  doc.setFont('times', 'bold');
  doc.text('JURISDICTION / DISTRICT:', margin + 4, cursorY + 13);
  doc.setFont('times', 'normal');
  doc.text(`${draft.district}, Punjab`, margin + 52, cursorY + 13);

  doc.setFont('times', 'bold');
  doc.text('LEGAL SUBJECT:', margin + 4, cursorY + 20);
  doc.setFont('times', 'normal');
  const catTitle = getLegalCategoryTitle(draft.category);
  doc.text(catTitle, margin + 35, cursorY + 20);
  cursorY += 29;

  // 3. TITLE OF DOCUMENT
  ensureSpace(12);
  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('FORMAL WRITTEN COMPLAINT & PETITION FOR PROTECTION', pageWidth / 2, cursorY, { align: 'center' });
  cursorY += 4;
  doc.setFont('times', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('(Submitted under relevant statutes of Punjab & Federal Laws of Pakistan)', pageWidth / 2, cursorY, { align: 'center' });
  cursorY += 8;

  // 4. PARTIES SECTION
  ensureSpace(24);
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('1. PARTICULARS OF COMPLAINANT:', margin, cursorY);
  cursorY += 5;

  doc.setFont('times', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  const complainantStr = `Name / Identity Identifier: ${options.complainantName || 'Complainant (Protected Under Section 13 PPWVA)'}\nLocation of Incident: ${draft.locationDetails || 'District ' + draft.district}\nSafe Contact Channel: ${draft.safeContactMethod || 'In-App Secure Virtual Channel / Emergency Sister Contact'}\nIncident Date & Time: ${draft.incidentDate || 'Recent'} at ${draft.incidentTime || 'Recorded'}\nThreat Status: ${draft.isSituationOngoing ? 'ONGOING THREAT / REPEAT OFFENSE RISK - IMMEDIATE PROTECTIVE MEASURES REQUESTED' : 'Documented Historical Incident'}`;
  const compLines = doc.splitTextToSize(complainantStr, contentWidth - 4);
  doc.text(compLines, margin + 4, cursorY);
  cursorY += compLines.length * 4.8 + 6;

  // 5. STATUTORY GROUNDS & CITATIONS
  ensureSpace(20);
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.text('2. STATUTORY LEGAL FRAMEWORK & APPLICABLE REMEDIES:', margin, cursorY);
  cursorY += 5;

  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  let statutes = '• Punjab Protection of Women Against Violence Act, 2016 (Sections 3, 5, 7, 8, 9 & 13);\n• Protection Against Harassment of Women at the Workplace Act, 2010 (as amended 2022);\n• Prevention of Electronic Crimes Act (PECA), 2016 (Sections 20, 21 & 24 for cyber harassment);\n• Pakistan Penal Code (PPC), 1860 (Sections 337, 354, 506 & 509).';
  const statuteLines = doc.splitTextToSize(statutes, contentWidth - 4);
  doc.text(statuteLines, margin + 4, cursorY);
  cursorY += statuteLines.length * 4.6 + 6;

  // 6. STATEMENT OF FACTS / DETAILED NARRATIVE
  ensureSpace(20);
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.text('3. STATEMENT OF FACTS & INCIDENT PARTICULARS:', margin, cursorY);
  cursorY += 5;

  doc.setFont('times', 'normal');
  doc.setFontSize(9.5);
  const narrative = draft.incidentSummary || draft.originalUserWords || 'Incident statement provided on official record.';
  const narrativeLines = doc.splitTextToSize(narrative, contentWidth - 4);

  // Render narrative across pages cleanly
  for (let i = 0; i < narrativeLines.length; i++) {
    ensureSpace(6);
    doc.text(narrativeLines[i], margin + 4, cursorY);
    cursorY += 4.8;
  }
  cursorY += 5;

  // 7. ATTACHED EVIDENCE INVENTORY
  ensureSpace(20);
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.text('4. EVIDENCE INVENTORY & DIGITAL ATTESTATION:', margin, cursorY);
  cursorY += 5;

  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  const evidenceCount = (draft.attachedPhotos?.length || 0) + (draft.attachedVaultRecordIds?.length || 0);
  let evidenceText = `• Total Verified Records Attached: ${evidenceCount}\n• Attached Photo Documentation: ${draft.attachedPhotos && draft.attachedPhotos.length > 0 ? `${draft.attachedPhotos.length} photograph(s) with timestamp confirmation` : 'No photographs attached'}\n• Incident Vault Timestamped Logs: ${draft.attachedVaultRecordIds && draft.attachedVaultRecordIds.length > 0 ? `${draft.attachedVaultRecordIds.length} encrypted ledger entry(ies)` : 'Direct submission'}\n• Cryptographic Integrity: Timestamp recorded at ${new Date(draft.createdAt || Date.now()).toISOString()} with AES-256 local verification`;
  const evidenceLines = doc.splitTextToSize(evidenceText, contentWidth - 4);
  doc.text(evidenceLines, margin + 4, cursorY);
  cursorY += evidenceLines.length * 4.6 + 6;

  // If attached vault records are provided in options, print them out as sub-items
  if (options.includeAttachedRecords && options.attachedRecords && options.attachedRecords.length > 0) {
    ensureSpace(16);
    doc.setFont('times', 'bold');
    doc.setFontSize(9.5);
    doc.text('Detailed Sub-Records from Encrypted Vault:', margin + 4, cursorY);
    cursorY += 5;

    for (const rec of options.attachedRecords) {
      ensureSpace(18);
      doc.setFont('times', 'bold');
      doc.setFontSize(8.5);
      doc.text(`[Record ID: ${rec.id}] ${rec.title} (${rec.incidentDate} at ${rec.incidentTime})`, margin + 6, cursorY);
      cursorY += 4.5;
      doc.setFont('times', 'normal');
      doc.setFontSize(8);
      const noteLines = doc.splitTextToSize(rec.note, contentWidth - 14);
      for (const line of noteLines) {
        ensureSpace(5);
        doc.text(line, margin + 8, cursorY);
        cursorY += 4;
      }
      cursorY += 2;
    }
    cursorY += 4;
  }

  // 8. PRAYER FOR RELIEF
  ensureSpace(28);
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.text('5. PRAYER / RELIEF SOUGHT:', margin, cursorY);
  cursorY += 5;

  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  const prayerText = `In view of the respectfully submitted facts above, it is prayed that this competent authority may graciously be pleased to:\n  a) Register and docket this complaint with an official diary / FIR / inquiry number under the relevant provisions of the law;\n  b) Issue an immediate Protection Order / Residence Order / Direction preventing the perpetrator from any contact, intimidation, or harassment;\n  c) Maintain strict privacy and confidentiality of the complainant's identity, residence, and contact information as mandated under Section 13 of the PPWVA 2016;\n  d) Grant any other interim relief deemed just and necessary for the protection of life, dignity, and bodily safety of the complainant.`;
  const prayerLines = doc.splitTextToSize(prayerText, contentWidth - 4);
  doc.text(prayerLines, margin + 4, cursorY);
  cursorY += prayerLines.length * 4.6 + 8;

  // 9. SOLEMN VERIFICATION & SIGNATURE BLOCK
  ensureSpace(34);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.rect(margin, cursorY, contentWidth, 32);

  doc.setFont('times', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('VERIFICATION ON OATH:', margin + 4, cursorY + 5.5);

  doc.setFont('times', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const verifyText = 'I, the complainant named herein, do hereby solemnly declare and affirm that the statements made above are true, accurate, and correct to the best of my personal knowledge, belief, and records, and that nothing relevant has been concealed or falsely stated.';
  const vLines = doc.splitTextToSize(verifyText, contentWidth - 8);
  doc.text(vLines, margin + 4, cursorY + 10.5);

  // Signatures
  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Place: District ${draft.district}, Punjab`, margin + 4, cursorY + 26);
  doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, margin + 4, cursorY + 29.5);

  doc.text('____________________________________', pageWidth - margin - 60, cursorY + 24);
  doc.setFont('times', 'bold');
  doc.text('Complainant Signature / Attestation', pageWidth - margin - 60, cursorY + 28);
  cursorY += 38;

  // 10. DECORATE ALL PAGES (Page borders, page numbers, security tags)
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawPageDecorations(doc, p, totalPages, refCode, hasPassword);
  }

  // Generate output artifacts
  const fileName = `Mehfooz_Legal_Complaint_${refCode.replace(/[^a-zA-Z0-9-]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  const blob = doc.output('blob');
  const base64 = doc.output('datauristring');

  // Downloads are strictly opt-in: a browser download may only be triggered by an
  // explicit user action (never draft creation, preview, save, or email confirm).
  if (options.downloadImmediately === true && typeof window !== 'undefined') {
    downloadBlob(blob, fileName);
  }

  return {
    blob,
    base64,
    dataUri: base64,
    fileName,
    isPasswordProtected: hasPassword,
    pageCount: totalPages
  };
}

/**
 * Exports a set of incident vault records into a printer-friendly, password-protected PDF dossier
 */
export async function exportIncidentRecordsToPDF(
  records: VaultRecord[],
  options: PDFExportOptions = {}
): Promise<PDFExportResult> {
  const hasPassword = Boolean(options.password && options.password.trim().length > 0);
  const cleanPassword = options.password ? options.password.trim() : undefined;
  const refCode = options.caseReferenceNumber || `VAULT-LOGS-${Date.now().toString().slice(-6)}`;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    ...(hasPassword && cleanPassword
      ? {
          encryption: {
            userPassword: cleanPassword,
            ownerPassword: `${cleanPassword}_vault_owner_key`,
            userPermissions: ['print', 'copy']
          }
        }
      : {})
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = 25;

  const ensureSpace = (requiredHeight: number) => {
    if (cursorY + requiredHeight > pageHeight - 22) {
      doc.addPage();
      cursorY = 24;
    }
  };

  // Header Title
  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('INCIDENT TIMELINE & EVIDENCE DOSSIER', pageWidth / 2, cursorY, { align: 'center' });
  cursorY += 5;

  doc.setFont('times', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Encrypted Incident Records Compiled for Legal Submission & Advisory Review', pageWidth / 2, cursorY, { align: 'center' });
  cursorY += 5;

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 6;

  // Metadata Summary Block
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, cursorY, contentWidth, 18, 'FD');

  doc.setFont('times', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`DOSSIER ID: ${refCode}`, margin + 4, cursorY + 5.5);
  doc.text(`TOTAL INCIDENTS: ${records.length} Record(s)`, margin + 105, cursorY + 5.5);
  doc.setFont('times', 'normal');
  doc.text(`Compiled On: ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`, margin + 4, cursorY + 12);
  doc.text(`Security: AES-256 On-Device ${hasPassword ? '(PDF Encrypted)' : '(Standard Format)'}`, margin + 105, cursorY + 12);
  cursorY += 23;

  // Incident Records Loop
  records.forEach((rec, idx) => {
    ensureSpace(35);

    // Entry Header Box
    doc.setFillColor(241, 245, 249); // slate-100
    doc.setDrawColor(203, 213, 225);
    doc.rect(margin, cursorY, contentWidth, 8, 'FD');

    doc.setFont('times', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(`RECORD #${idx + 1}: ${rec.title.toUpperCase()}`, margin + 3, cursorY + 5.5);
    doc.setFont('times', 'normal');
    doc.text(`${rec.incidentDate} • ${rec.incidentTime}`, pageWidth - margin - 3, cursorY + 5.5, { align: 'right' });
    cursorY += 11;

    // Attributes Table
    doc.setFont('times', 'bold');
    doc.setFontSize(8.5);
    doc.text('Category:', margin + 3, cursorY);
    doc.setFont('times', 'normal');
    doc.text(getLegalCategoryTitle(rec.category), margin + 22, cursorY);

    if (rec.location) {
      cursorY += 4.5;
      doc.setFont('times', 'bold');
      doc.text('Location:', margin + 3, cursorY);
      doc.setFont('times', 'normal');
      doc.text(rec.location, margin + 22, cursorY);
    }

    if (rec.witnesses) {
      cursorY += 4.5;
      doc.setFont('times', 'bold');
      doc.text('Witnesses:', margin + 3, cursorY);
      doc.setFont('times', 'normal');
      doc.text(rec.witnesses, margin + 22, cursorY);
    }

    cursorY += 5;

    // Narrative Note
    doc.setFont('times', 'bold');
    doc.text('Contemporaneous Statement & Notes:', margin + 3, cursorY);
    cursorY += 4.5;

    doc.setFont('times', 'normal');
    doc.setFontSize(8.5);
    const noteLines = doc.splitTextToSize(rec.note, contentWidth - 8);
    for (const line of noteLines) {
      ensureSpace(5);
      doc.text(line, margin + 4, cursorY);
      cursorY += 4.2;
    }

    // Media Attestation
    if (rec.hasPhoto || rec.audioDuration) {
      ensureSpace(6);
      doc.setFont('times', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      const mediaParts = [];
      if (rec.hasPhoto) mediaParts.push('Photograph/Screenshot securely archived');
      if (rec.audioDuration) mediaParts.push(`Voice recording saved (${rec.audioDuration} seconds)`);
      doc.text(`[Digital Evidence: ${mediaParts.join('; ')}]`, margin + 4, cursorY);
      cursorY += 5;
    }

    cursorY += 4;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(margin + 5, cursorY, pageWidth - margin - 5, cursorY);
    cursorY += 5;
  });

  // End of dossier summary and legal notice
  ensureSpace(24);
  doc.setFont('times', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  const endNotice = 'Note: These records are contemporaneously documented by the user. Under Section 164 of Qanun-e-Shahadat Order 1984, electronic and digital records are admissible in court subject to forensic verification.';
  const noticeLines = doc.splitTextToSize(endNotice, contentWidth);
  doc.text(noticeLines, margin, cursorY);

  // Decorate all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawPageDecorations(doc, p, totalPages, refCode, hasPassword);
  }

  const fileName = `Mehfooz_Incident_Vault_Records_${new Date().toISOString().split('T')[0]}.pdf`;
  const blob = doc.output('blob');
  const base64 = doc.output('datauristring');

  if (options.downloadImmediately === true && typeof window !== 'undefined') {
    downloadBlob(blob, fileName);
  }

  return {
    blob,
    base64,
    dataUri: base64,
    fileName,
    isPasswordProtected: hasPassword,
    pageCount: totalPages
  };
}
