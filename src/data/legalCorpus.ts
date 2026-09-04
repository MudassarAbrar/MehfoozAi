/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LegalSourceCitation } from '../types.js';

export interface LegalArticle {
  id: string;
  actTitle: string;
  actTitleUrdu: string;
  section: string;
  title: string;
  titleUrdu: string;
  keywords: string[];
  summary: string;
  summaryUrdu: string;
  fullText: string;
  fullTextUrdu: string;
  remedies: string[];
  remediesUrdu: string[];
  jurisdiction: string;
  url?: string;
}

export const PUNJAB_LEGAL_CORPUS: LegalArticle[] = [
  {
    id: 'ppwva_sec_3',
    actTitle: 'Punjab Protection of Women Against Violence Act, 2016',
    actTitleUrdu: 'پنجاب تحفظ نسواں برائے انسدادِ تشدد ایکٹ 2016',
    section: 'Section 3',
    title: 'Offences and Acts of Violence Covered',
    titleUrdu: 'تشدد اور جرائم کی تعریف اور دائرہ کار',
    keywords: [
      'violence', 'abuse', 'physical abuse', 'emotional abuse', 'psychological abuse', 
      'coercive control', 'economic abuse', 'stalking', 'cyber harassment', 'isolation',
      'marpeet', 'tashaddud', 'phone cheenna', 'threats', 'dhamki', 'room lock'
    ],
    summary: 'Defines violence against women broadly to include domestic violence, physical injury, emotional, psychological, mental harassment, stalking, cyber harassment, deprivation of financial resources, and wrongful confinement by any person in domestic relationship.',
    summaryUrdu: 'خواتین پر تشدد کی جامع تعریف جس میں جسمانی مار پیٹ، ذہنی و نفسیاتی اذیت، زبردستی کنٹرول، پیچھا کرنا (اسٹاکنگ)، انٹرنیٹ پر ہراساں کرنا، معاشی حق چھیننا اور گھر میں قید کرنا شامل ہے۔',
    fullText: 'Section 3 establishes that violence means any offence committed against a woman including abetment of an offence, domestic violence, emotional, psychological and verbal abuse, economic abuse, stalking, and cybercrime.',
    fullTextUrdu: 'دفعہ 3 کے تحت تشدد میں ہر قسم کا گھریلو تشدد، جسمانی، ذہنی، جذباتی، معاشی استحصال، پیچھا کرنا اور سائبر کرائم شامل ہیں جو کسی خاتون کے خلاف گھریلو تعلق کے دوران کیے جائیں۔',
    remedies: ['Protection Order', 'Residence Order', 'Monetary Compensation', 'WPO Intervention'],
    remediesUrdu: ['حفاظتی حکم نامہ', 'رہائشی حکم نامہ', 'مالی معاوضہ', 'وومن پروٹیکشن آفیسر کی مدد'],
    jurisdiction: 'Punjab, Pakistan',
    url: 'https://pcsw.punjab.gov.pk/laws_punjab'
  },
  {
    id: 'ppwva_sec_7',
    actTitle: 'Punjab Protection of Women Against Violence Act, 2016',
    actTitleUrdu: 'پنجاب تحفظ نسواں برائے انسدادِ تشدد ایکٹ 2016',
    section: 'Section 7',
    title: 'Protection Orders (حفاظتی احکامات)',
    titleUrdu: 'حفاظتی حکم نامہ (پروٹیکشن آرڈر)',
    keywords: [
      'protection order', 'restraining order', 'restrain', 'stay away', 'stop contacting',
      'weapon prohibition', 'harassment order', 'safe distance', 'dhamkian rokna'
    ],
    summary: 'The Family Court / Magistrate may pass a Protection Order restraining the aggressor from committing any act of violence, communicating with the aggrieved woman directly or indirectly, entering her workplace, or possessing any firearm.',
    summaryUrdu: 'عدالت ملزم کو تشدد کرنے، خاتون سے براہ راست یا فون/پیغامات کے ذریعے رابطہ کرنے، اس کے کام کی جگہ آنے یا اسلحہ رکھنے سے روکنے کا حفاظتی حکم جاری کر سکتی ہے۔',
    fullText: 'Section 7: The Court may direct the defendant to stop all communication, stay away from the victim and her children, surrender any weapon, and wear a GPS tracking bracelet (where operationalized by the Government).',
    fullTextUrdu: 'دفعہ 7: عدالت مدعا علیہ کو خاتون سے رابطہ منقطع کرنے، اس سے مخصوص فاصلہ برقرار رکھنے اور کسی بھی قسم کے نقصان سے باز رہنے کا پابند بناتی ہے۔',
    remedies: ['Immediate interim protection', 'Police enforcement', 'GPS monitoring order where available'],
    remediesUrdu: ['فوری عبوری تحفظ', 'پولیس نفاذ', 'مانیٹرنگ احکامات'],
    jurisdiction: 'Punjab, Pakistan',
    url: 'https://punjablaws.gov.pk/laws/2634.html'
  },
  {
    id: 'ppwva_sec_8',
    actTitle: 'Punjab Protection of Women Against Violence Act, 2016',
    actTitleUrdu: 'پنجاب تحفظ نسواں برائے انسدادِ تشدد ایکٹ 2016',
    section: 'Section 8',
    title: 'Residence Orders (رہائشی تحفظ کا حق)',
    titleUrdu: 'رہائشی حکم نامہ (گھر سے نکالے جانے کے خلاف تحفظ)',
    keywords: [
      'residence order', 'eviction', 'thrown out of house', 'ghar se nikalna', 'shelter',
      'shared household', 'alternate accommodation', 'chhat', 'roof'
    ],
    summary: 'Guarantees the aggrieved woman the right not to be evicted from the shared household. The court can order the aggressor to leave the house or pay for safe alternative accommodation of equivalent standard.',
    summaryUrdu: 'خاتون کو مشترکہ گھر سے زبردستی نکالے جانے کے خلاف قانونی تحفظ۔ عدالت شوہر/ملزم کو گھر خالی کرنے یا خاتون کے لیے مناسب متبادل رہائش کا کرایہ ادا کرنے کا حکم دے سکتی ہے۔',
    fullText: 'Section 8: The Court may direct the defendant not to evict or dispose of the aggrieved person from the shared household, or direct the defendant to secure alternative accommodation for her.',
    fullTextUrdu: 'دفعہ 8: مدعا علیہ کو متاثرہ خاتون کو گھر سے نکالنے سے روکنا یا اس کے لیے علیحدہ اور محفوظ رہائش کا بندوبست کرنا عدالت کے اختیارات میں شامل ہے۔',
    remedies: ['Non-eviction protection', 'Alternate rent coverage', 'Entry protection'],
    remediesUrdu: ['بے دخلی سے روک تھام', 'متبادل کرایہ ادائیگی', 'گھر میں داخلے کی حفاظت'],
    jurisdiction: 'Punjab, Pakistan',
    url: 'https://punjablaws.gov.pk/laws/2634.html'
  },
  {
    id: 'ppwva_sec_9',
    actTitle: 'Punjab Protection of Women Against Violence Act, 2016',
    actTitleUrdu: 'پنجاب تحفظ نسواں برائے انسدادِ تشدد ایکٹ 2016',
    section: 'Section 9',
    title: 'Monetary Orders & Medical Compensation',
    titleUrdu: 'مالی اخراجات اور علاج معالجے کا حکم نامہ',
    keywords: [
      'monetary order', 'expenses', 'medical bill', 'loss of income', 'maintenance',
      'financial support', 'kharcha', 'ilaj ke paise', 'economic relief'
    ],
    summary: 'Empowers the court to order the respondent to pay medical expenses incurred due to abuse, compensate for lost earnings, provide immediate maintenance for the woman and dependent children.',
    summaryUrdu: 'عدالت ملزم کو تشدد کی وجہ سے ہونے والے علاج کے تمام اخراجات، مالی نقصان اور خاتون اور بچوں کا ماہانہ خرچہ ادا کرنے کا حکم دے سکتی ہے۔',
    fullText: 'Section 9: The Court may direct payment of monetary relief to meet the expenses incurred and losses suffered by the aggrieved person as a result of violence.',
    fullTextUrdu: 'دفعہ 9: تشدد کے نتیجے میں ہونے والے طبی، معاشی اور مالی نقصانات کی تلافی اور نان نفقہ کی فوری ادائیگی کا عدالتی حکم۔',
    remedies: ['Medical bill reimbursement', 'Monthly allowance', 'Damages for personal property'],
    remediesUrdu: ['طبی اخراجات کی واپسی', 'ماہانہ خرچہ', 'نقصان کی تلافی'],
    jurisdiction: 'Punjab, Pakistan',
    url: 'https://punjablaws.gov.pk/laws/2634.html'
  },
  {
    id: 'workplace_act_2010',
    actTitle: 'Protection Against Harassment of Women at the Workplace Act, 2010 (as amended 2022)',
    actTitleUrdu: 'کام کی جگہ پر خواتین کو ہراساں کیے جانے کے خلاف تحفظ کا ایکٹ 2010',
    section: 'Sections 2, 4 & 8',
    title: 'Workplace Harassment & Punjab Ombudsperson Inquiries',
    titleUrdu: 'کام کی جگہ پر ہراسانی اور محتسب پنجاب کے اختیارات',
    keywords: [
      'workplace harassment', 'boss', 'colleague', 'office', 'contract termination',
      'unwanted advances', 'quid pro quo', 'hostile environment', 'inquiry committee', 'ombudsperson'
    ],
    summary: 'Enables any woman to file a direct complaint before the Punjab Provincial Ombudsperson or the internal Standing Inquiry Committee of the organization. Penalties include fine, demotion, termination, and compensation.',
    summaryUrdu: 'دفتر، فیکٹری یا کسی بھی کام کی جگہ پر غیر اخلاقی رویے یا بلیک میلنگ کی صورت میں محتسب پنجاب یا اندرونی انکوائری کمیٹی کو شکایت کا بااختیار حق۔ سزا میں ملازمت سے برطرفی اور معاوضہ شامل ہے۔',
    fullText: 'Section 4 mandates internal inquiry committees; Section 8 empowers the Ombudsperson to summon records and pass binding corrective orders.',
    fullTextUrdu: 'قانون کے تحت تمام اداروں کے لیے اندرونی کمیٹی قائم کرنا لازم ہے اور محتسب کو عدالتی اختیارات حاصل ہیں۔',
    remedies: ['Provincial Ombudsperson Complaint', 'Job Protection Order', 'Financial Compensation Award'],
    remediesUrdu: ['صوبائی محتسب کو درخواست', 'ملازمت کا تحفظ', 'مالی معاوضہ'],
    jurisdiction: 'Punjab, Pakistan',
    url: 'https://ombudspersonpunjab.gov.pk/'
  },
  {
    id: 'ppc_sec_506',
    actTitle: 'Pakistan Penal Code (Act XLV of 1860)',
    actTitleUrdu: 'مجموعہ تعزیراتِ پاکستان 1860',
    section: 'Section 506 & 509',
    title: 'Criminal Intimidation & Insulting the Modesty of a Woman',
    titleUrdu: 'دھمکیاں دینا (506) اور خاتون کی حرمت پامال کرنا (509)',
    keywords: [
      'threat to life', 'murder threat', 'dhamki', 'maar dalna', 'chhuri', 'pistol',
      'stalking on street', 'indecent gestures', 'shor sharaba', 'gaali galoch'
    ],
    summary: 'Section 506 provides up to 7 years imprisonment for threatening death or grievous hurt. Section 509 penalizes insulting words, gestures, stalking, or intruding upon the privacy of a woman with up to 3 years imprisonment.',
    summaryUrdu: 'دفعہ 506 کے تحت جان سے مارنے کی دھمکی پر 7 سال تک قید۔ دفعہ 509 کے تحت بازار، سڑک یا کسی بھی جگہ خاتون کو ہراساں کرنے یا گالی گلوچ کرنے پر 3 سال قید اور جرمانہ۔',
    fullText: 'Section 509: Whoever intending to insult the modesty of any woman utters any word, makes any sound or gesture, or exhibits any object commits a cognizable criminal offense.',
    fullTextUrdu: 'خاتون کی عزت و آبرو کو مجروح کرنے یا دھمکانے والے ملزمان کے خلاف پولیس کی فوری گرفتاری اور ایف آئی آر کا اندراج۔',
    remedies: ['Police FIR (Virtual Women Police Station / 15)', 'Judicial Magistrate Bail Denial', 'Protective Police Escort'],
    remediesUrdu: ['پولیس ایف آئی آر (15 یا وومن پولیس اسٹیشن)', 'مجسٹریٹ کو استغاثہ', 'پولیس پروٹیکشن'],
    jurisdiction: 'Pakistan / Punjab',
    url: 'https://punjabpolice.gov.pk/'
  },
  {
    id: 'peca_sec_20_21',
    actTitle: 'Prevention of Electronic Crimes Act, 2016 (PECA)',
    actTitleUrdu: 'پریونشن آف الیکٹرانک کرائمز ایکٹ 2016 (PECA سائبر کرائم)',
    section: 'Sections 20, 21 & 24',
    title: 'Cyberstalking, Image-Based Blackmail & Online Harassment',
    titleUrdu: 'سائبر اسٹاکنگ، بلیک میلنگ اور تصاویر کے ذریعے ہراسانی',
    keywords: [
      'peca', 'cyber crime', 'online harassment', 'blackmail with photos', 'whatsapp threat',
      'fake account', 'deepfake', 'cyberstalking', 'tasveer viral karna', 'tasveeron se blackmail'
    ],
    summary: 'Covers non-consensual sharing or threats to share private photos/videos, making fake profiles, unauthorized tracking, and cyberstalking. Investigated by FIA Cyber Crime Wing and Punjab Police Special Cyber Desks.',
    summaryUrdu: 'بغیر اجازت تصاویر یا ویڈیوز پھیلانے کی دھمکی، بلیک میلنگ، سوشل میڈیا پر جعلی اکاؤنٹ بنا کر بدنام کرنے یا آن لائن پیچھا کرنے کے خلاف قانون۔ 5 سال تک قید اور بھاری جرمانے کی سزا۔',
    fullText: 'Sections 20 & 21 establish strict penal liability for offenses against dignity of natural persons and cyberstalking through any information system or device.',
    fullTextUrdu: 'سائبر قوانین کے تحت ڈیجیٹل بلیک میلنگ اور پرائیویسی پامال کرنے والے ملزمان کے خلاف فوری قانونی کارروائی اور مواد کو ہٹانے کا حکم۔',
    remedies: ['FIA Cyber Crime Complaint (helpline 1991)', 'DRF Cyber Harassment Helpline (0800-39393)', 'Police Cyber Desks'],
    remediesUrdu: ['ایف آئی اے سائبر کرائم رپورٹ (1991)', 'ڈیجیٹل رائٹس فاؤنڈیشن ہیلپ لائن (0800-39393)', 'پولیس سائبر سیل'],
    jurisdiction: 'Pakistan / Punjab',
    url: 'https://complaint.fia.gov.pk/'
  },
  {
    id: 'who_vaw_guidelines',
    actTitle: 'WHO — Violence Against Women Guidelines',
    actTitleUrdu: 'عالمی ادارہ صحت (WHO) — خواتین پر تشدد کے خلاف گائیڈ لائنز',
    section: 'Clinical & Policy Guidance',
    title: 'Healthcare Responding to Intimate Partner Violence & Sexual Violence',
    titleUrdu: 'طبی و نفسیاتی امداد اور تحفظ کا بین الاقوامی معیار',
    keywords: ['who', 'world health organization', 'healthcare', 'medical evidence', 'trauma', 'counselling'],
    summary: 'Provides international clinical and policy standards for survivor-centered care, trauma-informed documentation, and confidential psychosocial support for women experiencing violence.',
    summaryUrdu: 'تشدد کا شکار خواتین کے لیے بین الاقوامی طبی معیار، صدمے کی صورت میں قانونی دستاویز سازی اور مفت نفسیاتی مدد۔',
    fullText: 'WHO Guidelines emphasize immediate safety assessment, confidential medical documentation of injuries, and integrated crisis response pathways.',
    fullTextUrdu: 'ڈبلیو ایچ او کا ضابطہ رازداری اور متاثرہ خواتین کے حقوق کے تحفظ پر زور دیتا ہے۔',
    remedies: ['Medical Documentation Protocol', 'Confidential Psychosocial Counseling'],
    remediesUrdu: ['طبی معائنہ پروٹوکول', 'خفیہ کونسلنگ'],
    jurisdiction: 'International / Standard',
    url: 'https://www.who.int/news-room/fact-sheets/detail/violence-against-women'
  },
  {
    id: 'un_women_safety',
    actTitle: 'UN Women — Safety Resources & Global Standards',
    actTitleUrdu: 'اقوام متحدہ خواتین (UN Women) — عالمی حفاظتی وسائل',
    section: 'Framework for Prevention of VAW',
    title: 'Essential Services Package for Women Subject to Violence',
    titleUrdu: 'تشدد کا شکار خواتین کے لیے بنیادی امدادی سروسز',
    keywords: ['un women', 'united nations', 'safe cities', 'gender equality', 'global standards'],
    summary: 'Standardized core policing, justice, health and social services coordination package to ensure prompt and secure multi-agency support for women.',
    summaryUrdu: 'اقوام متحدہ کی خواتین کے تحفظ کے لیے بین الاقوامی گائیڈ لائنز اور محفوظ شہروں کا فریم ورک۔',
    fullText: 'UN Women Framework coordinates police, social welfare, shelter homes, and legal aid into a seamless rapid-response network.',
    fullTextUrdu: 'یو این وومن کا نیٹ ورک تمام قانونی اور فلاحی اداروں کو جوڑتا ہے۔',
    remedies: ['Multi-Sectoral Safe City Framework', 'Survivor Legal Aid Fund'],
    remediesUrdu: ['محفوظ شہر فریم ورک', 'قانونی امداد فنڈ'],
    jurisdiction: 'International / Standard',
    url: 'https://www.unwomen.org/en/what-we-do/ending-violence-against-women'
  },
  {
    id: 'gov_pk_complaint_portal',
    actTitle: 'Government of Pakistan — Official Complaint & Citizen Portal',
    actTitleUrdu: 'حکومت پاکستان — سٹیزن پورٹل اور وفاقی شکایات نظام',
    section: 'Citizen Portal Grievance Redressal',
    title: 'Direct Citizen Grievance Redressal & Public Office Routing',
    titleUrdu: 'عوامی شکایات کا براہِ راست اندراج اور مانیٹرنگ',
    keywords: ['citizen portal', 'prime minister portal', 'federal ombudsman', 'official complaint', 'gov portal'],
    summary: 'Centralized government grievance registration system connecting directly to all deputy commissioners, police chiefs, and provincial inspector generals.',
    summaryUrdu: 'حکومتی پورٹل جس کے ذریعے کسی بھی سرکاری محکمے کے خلاف براہ راست شکایت درج کی جا سکتی ہے۔',
    fullText: 'Pakistan Citizen Portal routes complaints with time-bound resolution mandates directly to the concerned provincial secretaries and district commissioners.',
    fullTextUrdu: 'سٹیزن پورٹل پر درج شکایت کا باقاعدہ فالو اپ اور ٹائم لائن پر مبنی ازالہ ممکن بنایا جاتا ہے۔',
    remedies: ['Citizen Portal Tracking ID', 'Direct Escalate to Provincial Chief Secretary'],
    remediesUrdu: ['ٹریسنگ آئی ڈی', 'چیف سیکرٹری کو براہ راست ریفرل'],
    jurisdiction: 'Pakistan / Federal & Provincial',
    url: 'https://citizenportal.gov.pk/'
  },
  {
    id: 'ppwva_sec_4_5',
    actTitle: 'Punjab Protection of Women Against Violence Act, 2016',
    actTitleUrdu: 'پنجاب تحفظ نسواں برائے انسدادِ تشدد ایکٹ 2016',
    section: 'Sections 4 & 5',
    title: 'Women Protection Officers (WPO) & VAWC Centres',
    titleUrdu: 'وومن پروٹیکشن افسران اور تشدد کے خلاف مراکز (VAWC)',
    keywords: [
      'wpo', 'women protection officer', 'vawc', 'violence against women center',
      'shelter', 'dar ul aman', 'free legal aid', 'medical examination', 'multan vawc'
    ],
    summary: 'Establishes female Women Protection Officers (WPO) in every district of Punjab and Violence Against Women Centres (VAWC) providing one-stop police reporting, medical examination, psychological counselling, shelter and free legal assistance.',
    summaryUrdu: 'پنجاب کے ہر ضلع میں وومن پروٹیکشن آفیسرز اور ون اسٹاپ وائلنس اگینسٹ وومن سینٹرز (VAWC) جہاں پولیس رپورٹ، میڈیکل، قانونی مدد، مشاورت اور عارضی پناہ ایک ہی چھت تلے مہیا ہے۔',
    fullText: 'Sections 4 & 5 provide for District Women Protection Committees, appointment of Women Protection Officers, and universal access to integrated support facilities.',
    fullTextUrdu: 'دفعہ 4 اور 5 کے تحت ضلعی وومن پروٹیکشن کمیٹیاں اور مراکز قائم ہیں جو متاثرہ خواتین کی 24 گھنٹے مدد اور رہنمائی کے پابند ہیں۔',
    remedies: ['District WPO assistance', 'Emergency shelter transit', 'Free legal representation'],
    remediesUrdu: ['ضلعی پروٹیکشن آفیسر کی مدد', 'دارالامان میں محفوظ رہائش', 'مفت قانونی نمائندگی'],
    jurisdiction: 'Punjab, Pakistan'
  },
  {
    id: 'ppwva_sec_18',
    actTitle: 'Punjab Protection of Women Against Violence Act, 2016',
    actTitleUrdu: 'پنجاب تحفظ نسواں برائے انسدادِ تشدد ایکٹ 2016',
    section: 'Section 18',
    title: 'Penalties for Violating Protection Orders',
    titleUrdu: 'حفاظتی احکامات کی خلاف ورزی پر سزائیں',
    keywords: [
      'breach of order', 'violation penalty', 'jail for breach', 'fine', 'jail sentence',
      'saza', 'hukam ki khilaf warzi'
    ],
    summary: 'A breach of any Protection or Residence Order is a cognizable and non-bailable offence punishable with imprisonment of up to 1 year or a fine up to PKR 200,000, or both. Repeat breaches carry up to 2 years imprisonment.',
    summaryUrdu: 'عدالتی پروٹیکشن آرڈر کی خلاف ورزی ایک قابل دست اندازی پولیس اور ناقابل ضمانت جرم ہے جس کی سزا 1 سال تک قید اور 2 لاکھ روپے تک جرمانہ ہے۔ بار بار خلاف ورزی پر سزا 2 سال تک ہے۔',
    fullText: 'Section 18: A person who breaches a protection order shall be punished with imprisonment for a term which may extend to one year or with fine up to PKR 200,000.',
    fullTextUrdu: 'دفعہ 18: عدالتی حکم نامے کی خلاف ورزی پر سخت تعزیری سزائیں اور فوری گرفتاری کا عمل نافذ ہوتا ہے۔',
    remedies: ['Immediate arrest on breach', 'Contempt of court proceedings', 'Enhanced security protection'],
    remediesUrdu: ['فوری گرفتاری', 'تہینِ عدالت کی کارروائی', 'سیکیورٹی میں اضافہ'],
    jurisdiction: 'Punjab, Pakistan'
  },
  {
    id: 'workplace_act_2010',
    actTitle: 'Protection Against Harassment of Women at Workplace Act, 2010 (Amended 2022)',
    actTitleUrdu: 'کام کی جگہ پر خواتین کو ہراساں کیے جانے کے خلاف تحفظ ایکٹ 2010 (ترمیم شدہ 2022)',
    section: 'Sections 2, 3, 4 & 8',
    title: 'Workplace Harassment & Provincial Ombudsperson',
    titleUrdu: 'کام کی جگہ پر ہراسانی اور محتسب پنجاب کے اختیارات',
    keywords: [
      'workplace harassment', 'boss harassment', 'colleague', 'office', 'job threat', 
      'sexual harassment', 'hostile work environment', 'inquiry committee', 'ombudsperson',
      'naukri se nikalna', 'دفتر میں ہراسانی', 'محتسب'
    ],
    summary: 'Covers physical, verbal, written, visual or electronic harassment creating a hostile work environment. Requires all organizations to have a 3-member Internal Inquiry Committee. Victims can file directly with the Punjab Provincial Ombudsperson.',
    summaryUrdu: 'دفتر، فیکٹری یا کسی بھی کام کی جگہ پر جنسی یا غیر جنسی ہراسانی، نوکری سے نکالنے کی دھمکی یا نازیبا رویے کے خلاف تحفظ۔ ہر ادارے میں 3 رکنی کمیٹی کا ہونا لازم ہے اور براہ راست صوبائی محتسب پنجاب کو شکایت درج کروائی جا سکتی ہے۔',
    fullText: 'Sections 2-8 mandate the Code of Conduct in all workplaces, internal inquiry procedures with 30-day decision limits, and powers of the Provincial Ombudsperson to order termination, demotion, fine, and compensation.',
    fullTextUrdu: 'قانون کے تحت تمام سرکاری و نجی اداروں میں ضابطہ اخلاق نافذ کرنا لازمی ہے اور محتسب پنجاب ملزم کو نوکری سے برطرف کرنے اور جرمانہ کرنے کا مکمل اختیار رکھتا ہے۔',
    remedies: ['Direct petition to Punjab Ombudsperson', 'Workplace Internal Inquiry', 'Protection from retaliation / wrongful termination'],
    remediesUrdu: ['صوبائی محتسب پنجاب کو براہِ راست درخواست', 'داخلی انکوائری کمیٹی', 'نوکری سے بلاجواز برطرفی کے خلاف تحفظ'],
    jurisdiction: 'Punjab, Pakistan'
  },
  {
    id: 'ppc_sec_506',
    actTitle: 'Pakistan Penal Code (PPC)',
    actTitleUrdu: 'مجموعہ تعزیراتِ پاکستان (PPC)',
    section: 'Section 506',
    title: 'Criminal Intimidation (مجرمانہ دھمکیاں)',
    titleUrdu: 'دفعہ 506: جان سے مارنے یا نقصان پہنچانے کی دھمکی',
    keywords: [
      'threats', 'intimidation', 'threat to kill', 'jaan se marne ki dhamki', 'acid threat',
      'blackmail', 'death threat', 'harm threat', 'dhamkiyan'
    ],
    summary: 'Criminalizes threatening any person with injury to their person, reputation or property. If the threat is to cause death, grievous hurt, or destruction of property, it is punishable with up to 7 years imprisonment and fine.',
    summaryUrdu: 'کسی بھی شخص کو جان سے مارنے، شدید زخمی کرنے، یا اس کی عزت اور جائیداد کو نقصان پہنچانے کی دھمکی دینا جرم ہے۔ سنگین دھمکیوں پر 7 سال تک قید اور جرمانے کی سزا ہو سکتی ہے۔',
    fullText: 'Section 506 PPC: Whoever commits the offence of criminal intimidation shall be punished with imprisonment of either description for a term which may extend to two years, and if the threat be to cause death or grievous hurt, up to seven years.',
    fullTextUrdu: 'دفعہ 506: جان سے مارنے یا شدید نقصان کی مجرمانہ دھمکیاں دینے پر 7 سال تک قید بامشقت کی سزا مقرر ہے۔',
    remedies: ['Police FIR registration', 'Magistrate trial', 'Security undertaking under CrPC Sec 107'],
    remediesUrdu: ['پولیس ایف آئی آر کا اندراج', 'مجسٹریٹ کے پاس شکایت', 'ضابطہ فوجداری دفعہ 107 کے تحت امن کی پابندی'],
    jurisdiction: 'Pakistan / Punjab'
  },
  {
    id: 'ppc_sec_509',
    actTitle: 'Pakistan Penal Code (PPC)',
    actTitleUrdu: 'مجموعہ تعزیراتِ پاکستان (PPC)',
    section: 'Section 509',
    title: 'Insulting Modesty of a Woman & Public Harassment',
    titleUrdu: 'دفعہ 509: خاتون کی عزت و حرمت کے خلاف نازیبا الفاظ، اشارے یا ہراسانی',
    keywords: [
      'insult modesty', 'lewd gestures', 'verbal harassment', 'eve teasing', 'stalking in public',
      'indecent remarks', 'gandi batein', 'badtameezi', 'bazar mein tang karna'
    ],
    summary: 'Penalizes uttering any word, making any sound or gesture, exhibiting any object with intent to insult the modesty of a woman, or intruding upon her privacy. Punishable with imprisonment up to 3 years and fine up to PKR 500,000.',
    summaryUrdu: 'عوامی مقامات، گلیوں، مارکیٹوں یا فون پر نازیبا کلمات، فحش اشارے یا پرائیویسی میں دخل اندازی کے خلاف قانون۔ سزا 3 سال تک قید اور 5 لاکھ روپے تک جرمانہ ہے۔',
    fullText: 'Section 509 PPC: Whoever intending to insult the modesty of any woman utters any word, makes any sound or gesture... shall be punished with imprisonment up to three years, or with fine up to 500,000 rupees, or both.',
    fullTextUrdu: 'دفعہ 509: کسی بھی خاتون کی توہین یا حیا کے منافی حرکات پر 3 سال قید اور جرمانے کا نفاذ۔',
    remedies: ['Police complaint at PSCA 15 / Virtual Women Police Station', 'Direct FIR in local Police Station'],
    remediesUrdu: ['ورچوئل وومن پولیس اسٹیشن یا 15 پر شکایت', 'تھانے میں فوری رپورٹ'],
    jurisdiction: 'Pakistan / Punjab'
  },
  {
    id: 'peca_sec_20_21',
    actTitle: 'Prevention of Electronic Crimes Act, 2016 (PECA)',
    actTitleUrdu: 'پریونشن آف الیکٹرانک کرائمز ایکٹ 2016 (PECA سائبر کرائم)',
    section: 'Sections 20, 21 & 24',
    title: 'Cyberstalking, Image-Based Blackmail & Online Harassment',
    titleUrdu: 'سائبر اسٹاکنگ، بلیک میلنگ اور تصاویر کے ذریعے ہراسانی',
    keywords: [
      'peca', 'cyber crime', 'online harassment', 'blackmail with photos', 'whatsapp threat',
      'fake account', 'deepfake', 'cyberstalking', 'tasveer viral karna', 'tasveeron se blackmail'
    ],
    summary: 'Covers non-consensual sharing or threats to share private photos/videos, making fake profiles, unauthorized tracking, and cyberstalking. Investigated by FIA Cyber Crime Wing and Punjab Police Special Cyber Desks.',
    summaryUrdu: 'بغیر اجازت تصاویر یا ویڈیوز پھیلانے کی دھمکی، بلیک میلنگ، سوشل میڈیا پر جعلی اکاؤنٹ بنا کر بدنام کرنے یا آن لائن پیچھا کرنے کے خلاف قانون۔ 5 سال تک قید اور بھاری جرمانے کی سزا۔',
    fullText: 'Sections 20 & 21 establish strict penal liability for offenses against dignity of natural persons and cyberstalking through any information system or device.',
    fullTextUrdu: 'سائبر قوانین کے تحت ڈیجیٹل بلیک میلنگ اور پرائیویسی پامال کرنے والے ملزمان کے خلاف فوری قانونی کارروائی اور مواد کو ہٹانے کا حکم۔',
    remedies: ['FIA Cyber Crime Complaint (helpline 1991)', 'DRF Cyber Harassment Helpline (0800-39393)', 'Police Cyber Desks'],
    remediesUrdu: ['ایف آئی اے سائبر کرائم رپورٹ (1991)', 'ڈیجیٹل رائٹس فاؤنڈیشن ہیلپ لائن (0800-39393)', 'پولیس سائبر سیل'],
    jurisdiction: 'Pakistan / Punjab'
  },
  {
    id: 'honor_killing_2016',
    actTitle: 'Punjab Criminal Laws (Amendment) Act, 2016 (Anti-Honor Killing)',
    actTitleUrdu: 'پنجاب کریمینل لاز (ترمیمی) ایکٹ 2016 (غیرت کے نام پر قتل)',
    section: 'Sections 299, 302, 311 PPC (Amended)',
    title: 'Honor Killing — Mandatory Life Imprisonment & Waiver Abolished',
    titleUrdu: 'غیرت کے نام پر قتل — لازم عمر قید اور درگزر کا خاتمہ',
    keywords: [
      'honor killing', 'karo kari', 'ghairat', 'honor crime', 'family murder', 'izzat',
      'sharm', 'qatal', 'bhai ne mara', 'beta ne mara', 'family killed me', 'clan violence'
    ],
    summary: 'Amends PPC Sections 299, 302 & 311 to make honor killing punishable by mandatory life imprisonment (25 years). Crucially, the waiver (afw) and compromise (sulh) provisions under Qisas & Diyat law no longer apply — even if heirs forgive the murderer, the state MUST prosecute and impose life sentence.',
    summaryUrdu: 'غیرت کے نام پر قتل کو لازماً عمر قید (25 سال) کی سزا قرار دیا گیا ہے۔ درگزر اور صلح کی دفعات اب لاگو نہیں ہوں گی — اگر وارث معاف بھی کر دیں تو بھی ریاست ملزم کو سزا دے گی۔',
    fullText: 'The 2016 Amendment closed the loophole where honor killing perpetrators could escape punishment through heir forgiveness. Under new Section 311-A, where the victim is a woman and the offence is committed in the name of honor, the court shall impose imprisonment for life (minimum 25 years) regardless of any waiver by the heirs.',
    fullTextUrdu: '2016 کی ترمیم نے اس قانونی خلا کو بند کر دیا جہاں غیرت کے نام پر قتل کے ملزمان وارث کی معافی سے بچ نکلنے میں کامیاب ہو جاتے تھے۔ اب نئی دفعہ 311-A کے تحت اگر متاثرہ خاتون ہو اور قتل غیرت کے نام پر ہوا ہو تو عدالت وارث کی معافی کے باوجود لازماً عمر قید کی سزا دے گی۔',
    remedies: ['Mandatory Life Imprisonment (25 years)', 'State Prosecution Regardless of Heir Waiver', 'Witness Protection Program'],
    remediesUrdu: ['لازمی عمر قید (25 سال)', 'وارث کی معافی کے باوجود ریاستی استغاثہ', 'گواہوں کے تحفظ کا پروگرام'],
    jurisdiction: 'Punjab / Pakistan',
    url: 'https://punjablaws.gov.pk/'
  },
  {
    id: 'anti_rape_2016',
    actTitle: 'Criminal Law (Amendment) Act, 2016 (Anti-Rape Provisions)',
    actTitleUrdu: 'کریمینل لا (ترمیمی) ایکٹ 2016 (زیادتی کے خلاف)',
    section: 'Sections 376, 164A CrPC, 53A CrPC',
    title: 'Rape & Sexual Assault — Enhanced Punishment, DNA Testing & Victim Protection',
    titleUrdu: 'زیادتی و جنسی تشدد — سخت سزا، ڈی این اے ٹیسٹ اور متاثرہ خاتون کا تحفظ',
    keywords: [
      'rape', 'sexual assault', 'zina bil jabr', 'ziyadti', 'forced sex', 'molestation',
      'chhed chad', 'hands on', 'assaulted', 'raped', 'attempted rape', 'gang rape'
    ],
    summary: 'The 2016 Anti-Rape amendments mandate: (1) DNA testing as mandatory evidence in all rape cases; (2) establishment of special courts for expedited rape trials (within 3 months); (3) enhanced punishment — death or rigorous imprisonment up to 25 years plus fine; (4) victim identity protection in all proceedings; (5) prohibition on character assassination of the victim during trial.',
    summaryUrdu: '2016 کی زیادتی مخالف ترمیم کے تحت: (1) تمام زیادتی کے مقدمات میں ڈی این اے ٹیسٹ لازمی ہے؛ (2) 3 ماہ میں ٹرائل کے لیے خصوصی عدالتیں؛ (3) سزا — موت یا 25 سال تک قید سخت اور جرمانہ؛ (4) متاثرہ خاتون کی شناخت کا تحفظ؛ (5) عدالت میں متاثرہ کے کردار پر تنقید ممنوع۔',
    fullText: 'Section 376 PPC (as amended): Whoever commits rape shall be punished with death or rigorous imprisonment for a term which shall not be less than 10 years nor more than 25 years, and shall also be liable to fine. Section 164A CrPC mandates recording of victim statement by a female officer. Section 53A makes DNA examination mandatory.',
    fullTextUrdu: 'دفعہ 376 (ترمیم شدہ): زیادتی کا مرتکب موت یا 10 سے 25 سال تک سخت قید اور جرمانے کا مستحق ہے۔ دفعہ 164A خاتون افسر کے سامنے بیان ریکارڈ کرنے کا حکم دیتی ہے۔ دفعہ 53A ڈی این اے معائنہ لازمی قرار دیتی ہے۔',
    remedies: ['Special Court Expedited Trial (3-month deadline)', 'Mandatory DNA Evidence Collection', 'Victim Identity Protection Order', 'Compensation under Section 544A CrPC'],
    remediesUrdu: ['خصوصی عدالت میں جلد ٹرائل (3 ماہ کی حد)', 'لازمی ڈی این اے شواہد اکٹھا کرنا', 'متاثرہ کی شناخت کا حفاظتی حکم', 'دفعہ 544A کے تحت معاوضہ'],
    jurisdiction: 'Pakistan / Punjab',
    url: 'https://punjablaws.gov.pk/'
  },
  {
    id: 'acid_crime_ppc_336',
    actTitle: 'Pakistan Penal Code (PPC) — Acid Crime Provisions',
    actTitleUrdu: 'مجموعہ تعزیراتِ پاکستان — تیزاب سے حملہ',
    section: 'Sections 336A, 336B PPC',
    title: 'Acid Throwing & Acid Attacks — Punishment and Compensation',
    titleUrdu: 'تیزاب پھینکنے اور تیزاب سے حملے — سزا اور معاوضہ',
    keywords: [
      'acid', 'tezaab', 'acid attack', 'acid throwing', 'burnt with acid', 'tezab se hamla',
      'face burnt', 'disfigurement', 'chemical attack', 'jal gaya'
    ],
    summary: 'Section 336A punishes acid throwing causing hurt with imprisonment of minimum 10 years up to life and fine up to PKR 1 million. Section 336B punishes attempt to throw acid with minimum 7 years up to 14 years imprisonment. The court MUST order the accused to pay compensation to the victim for medical treatment and rehabilitation.',
    summaryUrdu: 'دفعہ 336A تیزاب پھینکنے سے نقصان پہنچانے پر کم از کم 10 سال سے عمر قید تک اور 10 لاکھ روپے تک جرمانے کی سزا مقرر کرتا ہے۔ دفعہ 336B تیزاب پھینکنے کی کوشش پر 7 سے 14 سال تک قید کی سزا ہے۔ عدالت ملزم کو متاثرہ کے علاج اور بحالی کے لیے معاوضہ ادا کرنے کا لازماً حکم دے گی۔',
    fullText: 'Section 336A: Whoever causes hurt by means of corrosive substance shall be punished with imprisonment for life or for a term not less than 10 years and with fine which may extend to one million rupees. The court shall direct the accused to pay compensation to the victim.',
    fullTextUrdu: 'دفعہ 336A: جو شخص کسی کھردار مادے سے نقصان پہنچائے اسے عمر قید یا کم از کم 10 سال کی قید اور دس لاکھ روپے تک جرمانے سے سزا دی جائے گی۔ عدالت ملزم کو متاثرہ کو معاوضہ ادا کرنے کا حکم دے گی۔',
    remedies: ['Life Imprisonment or Minimum 10 Years', 'Mandatory Victim Compensation (Medical + Rehabilitation)', 'Police FIR with Immediate Investigation'],
    remediesUrdu: ['عمر قید یا کم از کم 10 سال', 'لازمی متاثرہ معاوضہ (طبی + بحالی)', 'فوری تحقیقات کے ساتھ پولیس ایف آئی آر'],
    jurisdiction: 'Pakistan / Punjab',
    url: 'https://punjablaws.gov.pk/'
  },
  {
    id: 'child_marriage_1929',
    actTitle: 'Child Marriage Restraint Act, 1929 (as amended by Punjab 2015)',
    actTitleUrdu: 'قیدِ نکاحِ اطفال ایکٹ 1929 (پنجاب ترمیم 2015)',
    section: 'Sections 3, 4, 5, 6 & 7',
    title: 'Child Marriage Prohibition — Age 18 for Women, Punishment for All Parties',
    titleUrdu: 'بچوں کی شادی کی ممانعت — خواتین کے لیے 18 سال کی حد، تمام فریقوں کو سزا',
    keywords: [
      'child marriage', 'underage marriage', 'bachon ki shadi', 'nai umar shadi',
      'child bride', 'jabardasti shadi', 'forced marriage', 'minor marriage', 'larki ki shadi'
    ],
    summary: 'Prohibits marriage of any female below 18 years and male below 18 years (Punjab amended the male age from 18 in 2015). Punishment extends to all parties involved — the adult male contracting party, the person solemnizing the marriage (nikah khawan), and any parent or guardian who promotes or permits the child marriage. Imprisonment up to 3 years and fine.',
    summaryUrdu: '18 سال سے کم عمر خاتون اور مرد کی شادی ممنوع ہے (پنجاب نے 2015 میں مرد کی عمر بھی 18 سال مقرر کی)۔ سزا تمام شامل فریقوں کو ہوگی — بالغ مرد، نکاح خوان اور وہ والدین یا سرپرست جو بچوں کی شادی کروائیں یا اس کی اجازت دیں۔ 3 سال تک قید اور جرمانہ۔',
    fullText: 'Section 3: Child marriage defined as where either party is under 18 years. Section 4: Punishment for adult male contracting party. Section 5: Punishment for solemnizing (nikah khawan). Section 6: Punishment for parent/guardian promoting or permitting. All punishable with simple imprisonment up to 3 years and fine.',
    fullTextUrdu: 'دفعہ 3: بچوں کی شادی کی تعریف جہاں کوئی فریق 18 سال سے کم ہو۔ دفعہ 4: بالغ مرد فریق کو سزا۔ دفعہ 5: نکاح خوان کو سزا۔ دفعہ 6: والدین/سرپرست کو جو شادی کو فروغ دیں یا اجازت دیں۔ سب کو 3 سال تک سادہ قید اور جرمانہ۔',
    remedies: ['Criminal Complaint Against All Parties', 'Annulment of Child Marriage by Court', 'Child Protection Commission Intervention'],
    remediesUrdu: ['تمام فریقوں کے خلاف فوجداری شکایت', 'عدالت سے بچوں کی شادی کی منسوخی', 'چائلڈ پروٹیکشن کمیشن کی مداخلت'],
    jurisdiction: 'Punjab / Pakistan',
    url: 'https://punjablaws.gov.pk/'
  },
  {
    id: 'dowry_act_1976',
    actTitle: 'Dowry and Bridal Gifts (Restriction) Act, 1976',
    actTitleUrdu: 'جہیز اور تحائفِ عروسیت (پابندی) ایکٹ 1976',
    section: 'Sections 2, 3 & 4',
    title: 'Dowry Prohibition — Maximum 5000 Rupees, Punishment for Demand',
    titleUrdu: 'جہیز کی ممانعت — زیادہ سے زیادہ 5000 روپے، مطالبہ کرنے پر سزا',
    keywords: [
      'dowry', 'jahez', 'jahiz', 'bridal gifts', 'wedding demand', 'jahez ka masla',
      'dowry death', 'dowry harassment', 'jahez na lana', 'sasural walay'
    ],
    summary: 'Prohibits the display, demand, or giving of dowry in excess of PKR 5,000 (as originally set). Any agreement for payment of dowry is void. Punishment for demanding dowry: imprisonment up to 6 months or fine up to PKR 5,000 or both. The Act also prohibits advertisements inviting dowry demands in any publication.',
    summaryUrdu: '5000 روپے سے زائد جہیز کی نمائش، مطالبہ یا ادائیگی ممنوع ہے۔ جہیز کا کوئی بھی معاہدہ باطل ہے۔ جہیز کا مطالبہ کرنے پر سزا: 6 ماہ تک قید یا 5000 روپے تک جرمانہ یا دونوں۔ یہ ایکٹ کسی بھی اشاعت میں جہیز کے مطالبات کی اشتہارات کو بھی ممنوع قرار دیتا ہے۔',
    fullText: 'Section 2: Dowry defined as property or valuable security given in connection with marriage. Section 3: Prohibition of dowry display and agreement. Section 4: Penalty for demanding dowry — imprisonment up to 6 months or fine up to PKR 5,000 or both.',
    fullTextUrdu: 'دفعہ 2: جہیز کی تعریف شادی کے سلسلے میں دی گئی جائیداد یا قیمتی تحفہ۔ دفعہ 3: جہیز کی نمائش اور معاہدے کی ممانعت۔ دفعہ 4: جہیز کے مطالبے کی سزا — 6 ماہ تک قید یا 5000 روپے تک جرمانہ یا دونوں۔',
    remedies: ['Criminal Complaint for Dowry Demand', 'Void Agreement — No Legal Obligation to Pay', 'Women Protection Commission Complaint'],
    remediesUrdu: ['جہیز کے مطالبے کی فوجداری شکایت', 'باطل معاہدہ — ادا کرنے کا کوئی قانونی فرض نہیں', 'وومن پروٹیکشن کمیشن کو شکایت'],
    jurisdiction: 'Punjab / Pakistan',
    url: 'https://punjablaws.gov.pk/'
  },
  {
    id: 'muslim_family_laws_1961',
    actTitle: 'Muslim Family Laws Ordinance, 1961',
    actTitleUrdu: 'قانونِ احوالِ شخصیہِ مسلمہ آرڈیننس 1961',
    section: 'Sections 3, 4, 5, 6, 7 & 8',
    title: 'Marriage Registration, Polygamy Restrictions, Divorce & Maintenance',
    titleUrdu: 'نکاح کی رجسٹریشن، کثرتِ ازدواج کی پابندیاں، طلاق اور نان نفقہ',
    keywords: [
      'marriage registration', 'nikah nama', 'polygamy', 'second wife', 'doosri biwi',
      'talaq', 'divorce', 'khula', 'maintenance', 'nan nafqa', 'iddat', 'haq mehr'
    ],
    summary: 'Mandates compulsory registration of all Muslim marriages through Union Council. Restricts polygamy — a man must obtain written permission from the Arbitration Council before contracting a second marriage (failure: fine up to PKR 5,000 and imprisonment up to 1 year). Regulates talaq procedure — must be notified in writing to the Chairman Union Council and a copy to the wife. Entitles the wife to dower (mehr) and maintenance during iddat period.',
    summaryUrdu: 'یونین کونسل کے ذریعے تمام مسلم نکاح کی لازمی رجسٹریشن۔ کثرتِ ازدواج پر پابندی — دوسری شادی سے پہلے آربیٹریشن کونسل کی تحریری اجازت لازمی (ورنہ 5000 روپے جرمانہ اور 1 سال قید)۔ طلاق کا طریقہ — یونین کونسل کے چیئرمین کو تحریری اطلاع اور بیوی کو کاپی۔ بیوی کو مہر اور عدت میں نان نفقہ کا حق۔',
    fullText: 'Section 3: Compulsory marriage registration. Section 4: Polygamy restrictions — written permission of Arbitration Council required. Section 5: Dower (mehr) rights. Section 6: Registration of marriages. Section 7: Talaq procedure — written notice to Chairman and copy to wife, effective after 90 days. Section 8: Maintenance and dower recovery.',
    fullTextUrdu: 'دفعہ 3: لازمی نکارجسٹریشن۔ دفعہ 4: کثرتِ ازدواج کی پابندیاں — آربیٹریشن کونسل کی تحریری اجازت۔ دفعہ 5: حق مہر۔ دفعہ 6: نکاح کی رجسٹریشن۔ دفعہ 7: طلاق کا طریقہ — چیئرمین کو تحریری نوٹس اور بیوی کو کاپی، 90 دن بعد نافذ۔ دفعہ 8: نان نفقہ اور مہر کی وصولی۔',
    remedies: ['Union Council Marriage Registration', 'Arbitration Council Petition Against Polygamy', 'Family Court for Dower/Maintenance Recovery'],
    remediesUrdu: ['یونین کونسل نکاح رجسٹریشن', 'کثرتِ ازدواج کے خلاف آربیٹریشن کونسل درخواست', 'مہر/نان نفقہ کی وصولی کے لیے فیملی کورٹ'],
    jurisdiction: 'Pakistan / Punjab',
    url: 'https://punjablaws.gov.pk/'
  },
  {
    id: 'family_courts_act_1964',
    actTitle: 'Family Courts Act, 1964',
    actTitleUrdu: 'فیملی کورٹس ایکٹ 1964',
    section: 'Sections 2, 3, 5, 7, 12 & 17',
    title: 'Family Courts — Jurisdiction for Divorce, Custody, Maintenance & Dower',
    titleUrdu: 'فیملی کورٹس — طلاق، تحویل، نان نفقہ اور مہر کا اختیار',
    keywords: [
      'family court', 'divorce court', 'khula case', 'child custody', 'talaq case',
      'nafka', 'mehr recovery', 'visiting rights', 'guardian', 'custody of children',
      'bachi ka haq', 'bachon ki custody'
    ],
    summary: 'Establishes specialized Family Courts for expedited resolution of family disputes including: dissolution of marriage (talaq, khula, faskh), dower recovery, maintenance, child custody (hizanat), visiting rights, and dowry return. Proceedings are held in camera (private) to protect privacy. Cases must be decided within 4 months. Appeal lies to the High Court within 30 days.',
    summaryUrdu: 'خاندانی تنازعات کے جلد حل کے لیے خصوصی فیملی کورٹس قائم کی گئیں جن میں شامل ہیں: نکاح کی تحلیل (طلاق، خلع، فسخ)، مہر کی وصولی، نان نفقہ، بچوں کی تحویل (حضانت)، ملاقات کے حقوق اور جہیز کی واپسی۔ کارروائی خفیہ (پرائیویٹ) ہوتی ہے۔ مقدمات 4 ماہ میں فیصل ہونے لازمی۔ اپیل 30 دن میں ہائی کورٹ میں۔',
    fullText: 'Section 5: Family Courts jurisdiction over dissolution, dower, maintenance, polygamy, dowry, personal status, and child custody. Section 7: Pre-trial reconciliation. Section 12: In camera proceedings. Section 17: Cases to be decided within 4 months of institution.',
    fullTextUrdu: 'دفعہ 5: فیملی کورٹ کا نکاح کی تحلیل، مہر، نان نفقہ، کثرتِ ازدواج، جہیز، ذاتی حیثیت اور بچوں کی تحویل پر اختیار۔ دفعہ 7: مقدمے سے پہلے صلح۔ دفعہ 12: خفیہ کارروائی۔ دفعہ 17: مقدمات دائر ہونے کے 4 ماہ میں فیصل ہونے لازمی۔',
    remedies: ['Family Court Petition (4-month disposal mandate)', 'In Camera Proceedings (Privacy Protected)', 'Pre-Trial Reconciliation Attempt', 'High Court Appeal Within 30 Days'],
    remediesUrdu: ['فیملی کورٹ درخواست (4 ماہ میں نمٹاری لازمی)', 'خفیہ کارروائی (نجی تحفظ)', 'مقدمے سے پہلے صلح کی کوشش', '30 دن میں ہائی کورٹ اپیل'],
    jurisdiction: 'Punjab / Pakistan',
    url: 'https://punjablaws.gov.pk/'
  },
  {
    id: 'guardians_wards_act_1890',
    actTitle: 'Guardians and Wards Act, 1890',
    actTitleUrdu: 'سرپرستی و ward ایکٹ 1890',
    section: 'Sections 7, 12, 17, 25 & 41',
    title: 'Child Custody, Guardianship Rights & Visiting Orders',
    titleUrdu: 'بچوں کی تحویل، سرپرستی کے حقوق اور ملاقات کے احکامات',
    keywords: [
      'child custody', 'guardian', 'hizanat', 'visiting rights', 'bache ka haq',
      'bachon ki custody', 'father custody', 'mother custody', 'ward', 'minor rights'
    ],
    summary: 'Governs appointment of guardians for minors and custody disputes. Under Islamic law as applied in Pakistan: mother has right of hizanat (physical custody) of young children — sons until age 7, daughters until puberty (unless mother remarries or is unfit). Father is the natural legal guardian. Court always decides based on the welfare of the minor (paramount consideration). Visiting rights can be granted to either parent.',
    summaryUrdu: 'نابالغوں کے سرپرستوں کی تقرری اور تحویل کے تنازعات کا قانون۔ پاکستان میں اسلامی قانون کے تحت: ماں کو چھوٹے بچوں کی حضانت (جسمانی تحویل) کا حق — بیٹے 7 سال کی عمر تک، بیٹیاں بلوغت تک (جب تک ماں دوبارہ شادی نہ کرے یا نااہل نہ ہو)۔ باپ قدرتی قانونی سرپرست ہے۔ عدالت ہمیشہ نابالغ کی فلاح و بہبود کو اولین ترجیح دیتی ہے۔ ملاقات کے حقوق دونوں والدین کو دیے جا سکتے ہیں۔',
    fullText: 'Section 7: Court may appoint guardian of person or property of minor. Section 17: Welfare of the minor is the paramount consideration. Section 25: Court may order delivery of minor to guardian. Section 41: Visiting rights and access orders.',
    fullTextUrdu: 'دفعہ 7: عدالت نابالغ کے شخص یا جائیداد کا سرپرست مقرر کر سکتی ہے۔ دفعہ 17: نابالغ کی فلاح و بہبود اولین ترجیح ہے۔ دفعہ 25: عدالت نابالغ کو سرپرست کے حوالے کرنے کا حکم دے سکتی ہے۔ دفعہ 41: ملاقات کے حقوق اور رسائی کے احکامات۔',
    remedies: ['Guardianship Petition in Family Court', 'Visiting Rights Order', 'Custody Modification Petition', 'Welfare-Based Custody Determination'],
    remediesUrdu: ['فیملی کورٹ میں سرپرستی کی درخواست', 'ملاقات کے حقوق کا حکم', 'تحویل میں تبدیلی کی درخواست', 'فلاح و بہبود پر مبنی تحویل کا تعین'],
    jurisdiction: 'Pakistan / Punjab',
    url: 'https://punjablaws.gov.pk/'
  },
  {
    id: 'anti_women_practices_2011',
    actTitle: 'Criminal Laws Amendment (Protection of Women) Act, 2006 & Anti-Women Practices',
    actTitleUrdu: 'کریمینل لاز ترمیم (خواتین کا تحفظ) ایکٹ 2006 اور عورتوں کے خلاف رسمیں',
    section: 'Sections 310A, 310B, 498A, 498B PPC',
    title: 'Forced Marriage, Vani/Swara, Deprivation of Inheritance & Disgraceful Conduct',
    titleUrdu: 'جبری شادی، وانی/سوارہ، وراثت سے محرومی اور بے عزتی سلوک',
    keywords: [
      'forced marriage', 'vani', 'swara', 'watta satta', 'inheritance denial', 'miras na dena',
      'property rights', 'jabardasti nikah', 'exchange marriage', 'women as compensation',
      'disgrace', 'beizzati', 'ghar se nikalna', 'inheritance haq'
    ],
    summary: 'Criminalizes: (1) Forced marriage of a woman to settle a dispute (Vani/Swara) — punishable with 3-10 years imprisonment; (2) Depriving a woman of her inheritance rights in property — punishable with up to 10 years imprisonment and fine up to PKR 1 million; (3) Compelling a woman to marry against her will — punishable with 3-7 years imprisonment; (4) Any custom or tradition that deprives women of their legal rights is void.',
    summaryUrdu: 'مجرمانہ قرار: (1) تنازعہ حل کرنے کے لیے خاتون کی جبری شادی (وانی/سوارہ) — 3 سے 10 سال قید؛ (2) خاتون کو جائیداد میں وراثت کے حق سے محروم کرنا — 10 سال تک قید اور 10 لاکھ روپے تک جرمانہ؛ (3) خاتون کو اپنی مرضی کے خلاف شادی پر مجبور کرنا — 3 سے 7 سال قید؛ (4) کوئی بھی رسم یا روایت جو خواتین کو ان کے قانونی حقوق سے محروم کرے باطل ہے۔',
    fullText: 'Section 310A PPC: Kidnapping or abducting a woman to compel her marriage — 3 to 10 years. Section 310B PPC: Compelling marriage (vani/swara) — 3 to 10 years. Section 498A PPC: Depriving women from inheritance — up to 10 years and fine up to 1 million. Section 498B: Disgraceful conduct towards women.',
    fullTextUrdu: 'دفعہ 310A: خاتون کو جبری شادی کے لیے اغوا کرنا — 3 سے 10 سال۔ دفعہ 310B: جبری شادی (وانی/سوارہ) — 3 سے 10 سال۔ دفعہ 498A: خواتین کو وراثت سے محروم کرنا — 10 سال تک اور 10 لاکھ روپے تک جرمانہ۔ دفعہ 498B: خواتین کے خلاف بے عزتی سلوک۔',
    remedies: ['Criminal FIR Against All Participants', 'Court Declaration Voiding Forced Marriage', 'Inheritance Recovery Through Civil Suit', 'Women Protection Commission Complaint'],
    remediesUrdu: ['تمام شرکاء کے خلاف فوجداری ایف آئی آر', 'جبری شادی کو باطل قرار دینے کا عدالتی اعلان', 'سول مقدمے کے ذریعے وراثت کی وصولی', 'وومن پروٹیکشن کمیشن کو شکایت'],
    jurisdiction: 'Pakistan / Punjab',
    url: 'https://punjablaws.gov.pk/'
  },
  {
    id: 'trafficking_2018',
    actTitle: 'Prevention of Trafficking in Persons Act, 2018',
    actTitleUrdu: 'انسدادِ انسانی اسمگلنگ ایکٹ 2018',
    section: 'Sections 3, 4, 5, 6 & 10',
    title: 'Human Trafficking — Forced Labor, Sexual Exploitation & Organ Removal',
    titleUrdu: 'انسانی اسمگلنگ — جبری مشقت، جنسی استحصال اور اعضاء کی فروخت',
    keywords: [
      'trafficking', 'human trafficking', 'forced labor', 'begar', 'mazdoori', 'jabori mazdoori',
      'sexual exploitation', 'organ selling', 'gurda', 'kidney', 'bonded labor', 'naukrani'
    ],
    summary: 'Criminalizes human trafficking including: recruitment, transportation, or harboring of persons through force, fraud, or coercion for exploitation. Covers forced labor, sexual exploitation, domestic servitude, and organ removal. Punishment: 7-25 years imprisonment and fine up to PKR 5 million. Special protection for women and children victims. Witness protection program mandated.',
    summaryUrdu: 'انسانی اسمگلنگ کو جرم قرار دیتا ہے جس میں زور، دھوکہ یا جبر کے ذریعے افراد کی بھرتی، نقل و حمل یا پناہ دینا شامل ہے۔ جبری مشقت، جنسی استحصال، گھریلو غلامی اور اعضاء کی فروخت کو شامل کرتا ہے۔ سزا: 7 سے 25 سال قید اور 50 لاکھ روپے تک جرمانہ۔ خواتین اور بچوں کے متاثرین کے لیے خصوصی تحفظ۔',
    fullText: 'Section 3: Definition of trafficking — use of force, fraud or coercion for exploitation. Section 4: Punishment for trafficking — 7 to 25 years and fine up to 5 million. Section 5: Aggravated trafficking (women/children). Section 6: Protection of victims. Section 10: Witness protection.',
    fullTextUrdu: 'دفعہ 3: اسمگلنگ کی تعریف — استحصال کے لیے زور، دھوکہ یا جبر کا استعمال۔ دفعہ 4: اسمگلنگ کی سزا — 7 سے 25 سال اور 50 لاکھ تک جرمانہ۔ دفعہ 5: سنگین اسمگلنگ (خواتین/بچے)۔ دفعہ 6: متاثرین کا تحفظ۔ دفعہ 10: گواہوں کا تحفظ۔',
    remedies: ['FIA Anti-Trafficking Unit Complaint', 'Victim Protection & Rehabilitation', 'Witness Protection Program', 'Compensation from Accused'],
    remediesUrdu: ['ایف آئی اے اینٹی ٹریفکنگ یونٹ سے شکایت', 'متاثرین کا تحفظ اور بحالی', 'گواہوں کے تحفظ کا پروگرام', 'ملزم سے معاوضہ'],
    jurisdiction: 'Pakistan / Punjab',
    url: 'https://fia.gov.pk/'
  },
  {
    id: 'transgender_act_2018',
    actTitle: 'Transgender Persons (Protection of Rights) Act, 2018',
    actTitleUrdu: 'تبدیلِ جنس افراد (حقوق کا تحفظ) ایکٹ 2018',
    section: 'Sections 2, 3, 4, 5, 6, 7 & 15',
    title: 'Protection Against Discrimination, Harassment & Right to Self-Identification',
    titleUrdu: 'امتیاز، ہراسانی اور خود مختار شناخت کے حق کا تحفظ',
    keywords: [
      'transgender', 'khawaja sara', 'hijra', 'gender identity', 'trans rights',
      'discrimination', 'transgender harassment', 'gender expression', 'third gender'
    ],
    summary: 'Protects transgender persons from discrimination in education, employment, healthcare, and access to public places. Prohibits harassment, denial of access, and unfair treatment based on gender identity or expression. Guarantees right to self-identified gender. Punishment for violations: imprisonment up to 3 months or fine up to PKR 50,000 or both. Government must establish rehabilitation centers and provide vocational training.',
    summaryUrdu: 'تبدیلِ جنس افراد کو تعلیم، ملازمت، صحت اور عوامی مقامات تک رسائی میں امتیاز سے تحفظ دیتا ہے۔ ہراسانی، رسائی سے انکار اور جنسی شناخت یا اظہار کی بنیاد پر ناانصافی ممنوع۔ خود مختار شناخت کا حق ضمانت شدہ۔ خلاف ورزی کی سزا: 3 ماہ تک قید یا 50,000 روپے تک جرمانہ یا دونوں۔',
    fullText: 'Section 3: Prohibition of discrimination against transgender persons. Section 4: Right to self-identified gender. Section 5: Right to education without discrimination. Section 6: Right to employment. Section 7: Right to healthcare. Section 15: Punishment for obstruction or harassment — up to 3 months or fine up to 50,000.',
    fullTextUrdu: 'دفعہ 3: تبدیلِ جنس افراد کے خلاف امتیاز کی ممانعت۔ دفعہ 4: خود مختار شناخت کا حق۔ دفعہ 5: امتیاز کے بغیر تعلیم کا حق۔ دفعہ 6: ملازمت کا حق۔ دفعہ 7: صحت کی سہولت کا حق۔ دفعہ 15: رکاوٹ یا ہراسانی کی سزا — 3 ماہ تک یا 50,000 تک جرمانہ۔',
    remedies: ['Police Complaint for Harassment', 'National Commission on Status of Women Complaint', 'Human Rights Commission Petition', 'Rehabilitation Center Assistance'],
    remediesUrdu: ['ہراسانی کی پولیس شکایت', 'قومی کمیشن برائے وقارِ نسواں کو شکایت', 'انسانی حقوق کمیشن کی درخواست', 'بحالی مرکز کی امداد'],
    jurisdiction: 'Pakistan / Punjab',
    url: 'https://punjablaws.gov.pk/'
  },
  {
    id: 'domestic_workers_punjab_2019',
    actTitle: 'Punjab Domestic Workers Act, 2019',
    actTitleUrdu: 'پنجاب گھریلو ملازمین ایکٹ 2019',
    section: 'Sections 3, 4, 5, 6, 7, 11 & 14',
    title: 'Domestic Workers Rights — Minimum Wage, Working Hours & Protection from Abuse',
    titleUrdu: 'گھریلو ملازمین کے حقوق — کم از کم اجرت، اوقاتِ کار اور تشدد سے تحفظ',
    keywords: [
      'domestic worker', 'naukrani', 'maid', 'house help', 'kaam wali bai',
      'underpaid', 'overwork', 'child domestic worker', 'bonded domestic labor', 'ghar ki naukrani'
    ],
    summary: 'Establishes rights for domestic workers in Punjab including: (1) compulsory registration with District Labour Department; (2) minimum wage as notified by Government; (3) maximum 8 hours daily work with overtime pay; (4) weekly rest day; (5) prohibition of child domestic workers under 15 years; (6) protection from physical and mental abuse by employer; (7) right to written employment contract.',
    summaryUrdu: 'پنجاب میں گھریلو ملازمین کے حقوق قائم کرتا ہے جن میں شامل ہیں: (1) ضلعی لیبر ڈیپارٹمنٹ میں لازمی رجسٹریشن؛ (2) حکومت کی طرف سے مقرر کم از کم اجرت؛ (3) روزانہ زیادہ سے زیادہ 8 گھنٹے کام اور اوور ٹائم اجرت؛ (4) ہفتہ وار آرام کا دن؛ (5) 15 سال سے کم عمر گھریلو ملازمین کی ممانعت؛ (6) آجر کے جسمانی اور ذہنی تشدد سے تحفظ؛ (7) تحریری ملازمت معاہدے کا حق۔',
    fullText: 'Section 3: Definition and registration of domestic workers. Section 4: Prohibition of child domestic workers under 15. Section 5: Minimum wage and working conditions. Section 6: Written employment contract. Section 7: Working hours and overtime. Section 11: Protection from abuse. Section 14: Penalty for violations — up to 6 months imprisonment or fine.',
    fullTextUrdu: 'دفعہ 3: گھریلو ملازمین کی تعریف اور رجسٹریشن۔ دفعہ 4: 15 سال سے کم عمر گھریلو ملازمین کی ممانعت۔ دفعہ 5: کم از کم اجرت اور کام کے حالات۔ دفعہ 6: تحریری ملازمت معاہدہ۔ دفعہ 7: اوقاتِ کار اور اوور ٹائم۔ دفعہ 11: تشدد سے تحفظ۔ دفعہ 14: خلاف ورزی کی سزا — 6 ماہ تک قید یا جرمانہ۔',
    remedies: ['District Labour Officer Complaint', 'Written Employment Contract Demand', 'Minimum Wage Recovery Application', 'Police FIR for Abuse/Exploitation'],
    remediesUrdu: ['ضلعی لیبر آفیسر کو شکایت', 'تحریری ملازمت معاہدے کا مطالبہ', 'کم از کم اجرت کی وصولی کی درخواست', 'تشدد/استحصال کی پولیس ایف آئی آر'],
    jurisdiction: 'Punjab, Pakistan',
    url: 'https://punjablaws.gov.pk/'
  },
  {
    id: 'ppc_sec_366_366b',
    actTitle: 'Pakistan Penal Code (PPC)',
    actTitleUrdu: 'مجموعہ تعزیراتِ پاکستان',
    section: 'Sections 363, 365, 366 & 366B',
    title: 'Kidnapping, Abduction & Forced Marriage of Women',
    titleUrdu: 'خواتین کی اغوا، بازیابی اور جبری شادی',
    keywords: [
      'kidnapping', 'abduction', 'aghwa', 'jabardasti utha le gaya', 'kidnap', 'baziyaft',
      'forced marriage', 'jabardasti shadi', 'bhaag gayi', 'zabardasti le gaya', 'larki ko utha liya'
    ],
    summary: 'Section 363: Kidnapping from lawful guardianship — up to 7 years and fine. Section 365: Kidnapping with intent to secretly confine — up to 7 years. Section 366: Kidnapping or abducting a woman to compel her marriage or force illicit intercourse — up to 10 years and fine. Section 366B: Importation of a girl under 21 years for illicit intercourse — up to 10 years and fine.',
    summaryUrdu: 'دفعہ 363: قانونی سرپرستی سے اغوا — 7 سال تک اور جرمانہ۔ دفعہ 365: خفیہ نظر بند کرنے کی نیت سے اغوا — 7 سال تک۔ دفعہ 366: خاتون کی اغوا یا بازیابی اس کی جبری شادی یا ناجائز تعلقات کے لیے — 10 سال تک اور جرمانہ۔ دفعہ 366B: 21 سال سے کم عمر لڑکی کی ناجائز تعلقات کے لیے درآمد — 10 سال تک اور جرمانہ۔',
    fullText: 'Section 363: Kidnapping from lawful guardianship — imprisonment up to 7 years and fine. Section 365: Kidnapping with intent to secretly and wrongfully confine — up to 7 years. Section 366: Kidnapping or abducting to compel marriage or illicit intercourse — up to 10 years and fine. Section 366B: Importation of girl under 21 — up to 10 years and fine.',
    fullTextUrdu: 'دفعہ 363: قانونی سرپرستی سے اغوا — 7 سال تک قید اور جرمانہ۔ دفعہ 365: خفیہ اور غلط طور پر نظر بند کرنے کی نیت سے اغوا — 7 سال تک۔ دفعہ 366: جبری شادی یا ناجائز تعلقات کے لیے اغوا یا بازیابی — 10 سال تک اور جرمانہ۔ دفعہ 366B: 21 سال سے کم عمر لڑکی کی درآمد — 10 سال تک اور جرمانہ۔',
    remedies: ['Immediate Police FIR (Emergency 15)', 'Habeas Corpus Petition in High Court', 'Anti-Kidnapping Cell Punjab', 'Virtual Women Police Station Report'],
    remediesUrdu: ['فوری پولیس ایف آئی آر (ایمرجنسی 15)', 'ہائی کورٹ میں habeas corpus درخواست', 'اینٹی کڈنیپنگ سیل پنجاب', 'ورچوئل وومن پولیس اسٹیشن رپورٹ'],
    jurisdiction: 'Pakistan / Punjab',
    url: 'https://punjabpolice.gov.pk/'
  },
  {
    id: 'inheritance_rights_islamic',
    actTitle: 'Islamic Law of Inheritance as Applied in Pakistan',
    actTitleUrdu: 'پاکستان میں نافذ اسلامی قانونِ وراثت',
    section: 'Muslim Personal Law (Shariat) Application Act, 1962 — Sections 3 & 4',
    title: "Women's Inheritance Rights — Mandatory Share in Parental & Marital Property",
    titleUrdu: 'خواتین کے وراثتی حقوق — والدین اور شوہر کی جائیداد میں لازمی حصہ',
    keywords: [
      'inheritance', 'miras', 'wirasat', 'property rights', 'share in property',
      'baap ki jaidad', 'father property', 'mother property', 'husband property inheritance',
      'jaidad mein hissa', 'inheritance denial', 'bhai ne jaidad na di'
    ],
    summary: 'Under Islamic law as applied in Pakistan, women have mandatory inheritance rights: (1) A daughter receives half the share of a son in parental property; (2) A wife receives 1/8th (with children) or 1/4th (without children) of husband\'s estate; (3) A mother receives 1/6th of her child\'s estate; (4) These shares are mandatory — no family agreement or custom can override them. Denial of inheritance is a criminal offence under Section 498A PPC.',
    summaryUrdu: 'پاکستان میں نافذ اسلامی قانون کے تحت خواتین کے لازمی وراثتی حقوق: (1) بیٹی کو والدین کی جائیداد میں بیٹے کا آدھا حصہ ملتا ہے؛ (2) بیوی کو شوہر کی جائیداد کا 1/8 واں حصہ (بچوں کے ساتھ) یا 1/4 واں حصہ (بچوں کے بغیر) ملتا ہے؛ (3) ماں کو اولاد کی جائیداد کا 1/6 واں حصہ ملتا ہے؛ (4) یہ حصے لازمی ہیں — کوئی خاندانی معاہدہ یا رسم ان پر فوقیت نہیں رکھ سکتی۔ وراثت سے انکار دفعہ 498A کے تحت جرم ہے۔',
    fullText: 'The Muslim Personal Law (Shariat) Application Act, 1962 mandates application of Islamic inheritance principles. Under these principles, female heirs have fixed shares (faraiz) in the estate of the deceased. Any attempt to deprive a female heir of her share through force, fraud, custom (such as riwaaj or vani) or family pressure is void and constitutes a criminal offence under Section 498A PPC punishable by up to 10 years imprisonment.',
    fullTextUrdu: 'مسلم پرسنل لا (شریعت) ایپلیکیشن ایکٹ 1962 اسلامی وراثتی اصولوں کے نفاذ کا حکم دیتا ہے۔ ان اصولوں کے تحت خواتین وارثین کا متوفی کی جائیداد میں مقرر حصے (فرائض) ہیں۔ زور، دھوکہ، رسم (جیسے رواج یا وانی) یا خاندانی دباؤ کے ذریعے کسی خاتون وارث کو اس کے حصے سے محروم کرنے کی کوئی کوشش باطل ہے اور دفعہ 498A کے تحت 10 سال تک قید کا فوجداری جرم ہے۔',
    remedies: ['Civil Suit for Inheritance Recovery', 'Criminal FIR Under Section 498A PPC', 'Revenue Authority Mutation Correction', 'Legal Aid from AGHS or Punjab Legal Aid'],
    remediesUrdu: ['وراثت کی وصولی کے لیے سول مقدمہ', 'دفعہ 498A کے تحت فوجداری ایف آئی آر', 'ریونیو اتھارٹی سے میوٹیشن کی درستی', 'AGHS یا پنجاب لیگل ایڈ سے قانونی امداد'],
    jurisdiction: 'Pakistan / Punjab',
    url: 'https://punjablaws.gov.pk/'
  },
  {
    id: 'punjab_safe_cities_2015',
    actTitle: 'Punjab Safe Cities Authority Act, 2015 (PSCA)',
    actTitleUrdu: 'پنجاب سیف سٹیز اتھارٹی ایکٹ 2015',
    section: 'Sections 3, 5, 12, 16 & 23',
    title: 'Safe Cities Authority — CCTV Surveillance, Emergency Response & Women Safety',
    titleUrdu: 'سیف سٹیز اتھارٹی — سی سی ٹی وی نگرانی، ایمرجنسی رسپانس اور خواتین کا تحفظ',
    keywords: [
      'safe cities', 'psca', 'cctv', 'surveillance', 'emergency 15', 'police emergency',
      'panic button', 'safety app', 'women safety', 'safe city lahore', 'monitoring'
    ],
    summary: 'Establishes the Punjab Safe Cities Authority (PSCA) to manage city-wide CCTV surveillance, emergency communication systems (15), and integrated policing in major Punjab cities. PSCA operates: (1) 24/7 emergency helpline 15; (2) CCTV monitoring across Punjab cities; (3) Virtual Women Police Station for remote complaint filing; (4) GPS tracking of police vehicles; (5) Panic button systems in public areas. All data is managed with privacy safeguards.',
    summaryUrdu: 'پنجاب سیف سٹیز اتھارٹی (PSCA) قائم کرتا ہے جو شہر بھر میں سی سی ٹی وی نگرانی، ایمرجنسی مواصلاتی نظام (15) اور بڑے پنجاب شہروں میں مربوط پولیسنگ کا انتظام کرتا ہے۔ PSCA چلاتا ہے: (1) 24/7 ایمرجنسی ہیلپ لائن 15؛ (2) پنجاب شہروں میں سی سی ٹی وی مانیٹرنگ؛ (3) ریموٹ شکایت درج کرنے کے لیے ورچوئل وومن پولیس اسٹیشن؛ (4) پولیس گاڑیوں کی جی پی ایس ٹریکنگ؛ (5) عوامی علاقوں میں پینک بٹن سسٹم۔',
    fullText: 'Section 3: Establishment of PSCA. Section 5: Functions include CCTV surveillance, emergency communication, and integrated policing. Section 12: Emergency response systems. Section 16: Data protection and privacy safeguards. Section 23: Virtual Police Station for online complaint registration.',
    fullTextUrdu: 'دفعہ 3: PSCA کا قیام۔ دفعہ 5: فرائض میں سی سی ٹی وی نگرانی، ایمرجنسی مواصلات اور مربوط پولیسنگ شامل ہیں۔ دفعہ 12: ایمرجنسی رسپانس سسٹم۔ دفعہ 16: ڈیٹا کا تحفظ اور پرائیویسی کے تحفظات۔ دفعہ 23: آن لائن شکایت رجسٹریشن کے لیے ورچوئل پولیس اسٹیشن۔',
    remedies: ['Call Emergency 15', 'Virtual Women Police Station Online Complaint', 'CCTV Evidence Request', 'PSCA Women Safety App'],
    remediesUrdu: ['ایمرجنسی 15 پر کال کریں', 'ورچوئل وومن پولیس اسٹیشن آن لائن شکایت', 'سی سی ٹی وی شواہد کی درخواست', 'PSCA وومن سیفٹی ایپ'],
    jurisdiction: 'Punjab, Pakistan',
    url: 'https://pscapunjab.gov.pk/'
  },
  {
    id: 'maintenance_crpc_488',
    actTitle: 'Code of Criminal Procedure (CrPC) — Maintenance Provisions',
    actTitleUrdu: 'ضابطہ فوجداری — نان نفقہ کی دفعات',
    section: 'Section 488-490 CrPC',
    title: 'Maintenance Allowance for Wives, Children & Parents',
    titleUrdu: 'بیویوں، بچوں اور والدین کے لیے نان نفقہ الاؤنس',
    keywords: [
      'maintenance', 'nan nafqa', 'kharcha', 'allowance', 'wife maintenance', 'bivi ka kharcha',
      'shohar ka kharcha', 'child support', 'bachon ka kharcha', 'no money', 'financial support'
    ],
    summary: 'Section 488 CrPC empowers a Magistrate to order a person with sufficient means to pay a monthly maintenance allowance for the maintenance of: (1) his wife (including divorced wife who has not remarried); (2) his legitimate minor children (male or female); (3) his legitimate adult children if physically or mentally disabled; (4) his parents if unable to maintain themselves. Maximum monthly allowance as prescribed by the court. Non-compliance punishable with imprisonment up to 1 month.',
    summaryUrdu: 'دفعہ 488 ضابطہ فوجداری مجسٹریٹ کو اختیار دیتی ہے کہ وہ کافی وسائل رکھنے والے شخص کو ماہانہ نان نفقہ الاؤنس ادا کرنے کا حکم دے: (1) اس کی بیوی (بشمول مطلقہ بیوی جس نے دوبارہ شادی نہ کی ہو)؛ (2) اس کے جائز نابالغ بچے (بیٹا یا بیٹی)؛ (3) اس کے جائز بالغ بچے اگر جسمانی یا ذہنی معذور ہوں؛ (4) اس کے والدین اگر خود کو برقرار رکھنے سے قاصر ہوں۔ عدالت کی طرف سے مقرر زیادہ سے زیادہ ماہانہ الاؤنس۔ عدم تعمیل پر 1 ماہ تک قید۔',
    fullText: 'Section 488: Order for maintenance of wives, children and parents. Section 489: Alteration in allowance. Section 490: Enforcement of order — imprisonment up to 1 month for non-payment. The Magistrate may order an interim maintenance during pendency of proceedings.',
    fullTextUrdu: 'دفعہ 488: بیویوں، بچوں اور والدین کے نان نفقہ کا حکم۔ دفعہ 489: الاؤنس میں تبدیلی۔ دفعہ 490: حکم کا نفاذ — عدم ادائیگی پر 1 ماہ تک قید۔ مجسٹریٹ کارروائی کے دوران عبوری نان نفقہ کا حکم دے سکتا ہے۔',
    remedies: ['Magistrate Court Maintenance Petition', 'Interim Maintenance During Proceedings', 'Enforcement Through Imprisonment for Non-Payment', 'Modification of Allowance Amount'],
    remediesUrdu: ['مجسٹریٹ کورٹ نان نفقہ درخواست', 'کارروائی کے دوران عبوری نان نفقہ', 'عدم ادائیگی پر قید کے ذریعے نفاذ', 'الائونس کی رقم میں ترمیم'],
    jurisdiction: 'Pakistan / Punjab',
    url: 'https://punjablaws.gov.pk/'
  },
  {
    id: 'home_workers_punjab_2019',
    actTitle: 'Punjab Home-Based Workers Act, 2019',
    actTitleUrdu: 'پنجاب گھر پر مبنی ملازمین ایکٹ 2019',
    section: 'Sections 3, 4, 5, 6 & 12',
    title: 'Home-Based Workers — Minimum Wage, Health Safety & Social Protection',
    titleUrdu: 'گھر پر مبنی ملازمین — کم از کم اجرت، صحت و حفاظت اور سماجی تحفظ',
    keywords: [
      'home worker', 'home based', 'piece rate', 'ghar ka kaam', 'sewing at home',
      'craft worker', 'handicraft', 'underpaid home work', 'invisible labor'
    ],
    summary: 'Recognizes and protects home-based workers in Punjab — including women doing piece-rate work (sewing, embroidery, handicrafts, assembly) from their homes. Key rights: (1) Registration with Labour Department; (2) Minimum wage entitlement; (3) Occupational health and safety standards; (4) Access to social security benefits; (5) Right to form associations. Employers/intermediaries violating provisions face imprisonment up to 6 months or fine.',
    summaryUrdu: 'پنجاب میں گھر پر مبنی ملازمین کو تسلیم کرتا ہے اور تحفظ دیتا ہے — جن میں خواتین شامل ہیں جو گھر سے ٹکڑے کی شرح پر کام (سلائی، کڑھائی، دستکاری، اسمبلی) کرتی ہیں۔ اہم حقوق: (1) لیبر ڈیپارٹمنٹ میں رجسٹریشن؛ (2) کم از کم اجرت کا حق؛ (3) پیشہ ورانہ صحت و حفاظت کے معیار؛ (4) سماجی تحفظ کے فوائد تک رسائی؛ (5) انجمن بنانے کا حق۔ خلاف ورزی پر 6 ماہ تک قید یا جرمانہ۔',
    fullText: 'Section 3: Definition and registration of home-based workers. Section 4: Minimum wage and piece rate protection. Section 5: Health and safety standards. Section 6: Social security access. Section 12: Penalty for violations — up to 6 months or fine.',
    fullTextUrdu: 'دفعہ 3: گھر پر مبنی ملازمین کی تعریف اور رجسٹریشن۔ دفعہ 4: کم از کم اجرت اور ٹکڑے کی شرح کا تحفظ۔ دفعہ 5: صحت و حفاظت کے معیار۔ دفعہ 6: سماجی تحفظ تک رسائی۔ دفعہ 12: خلاف ورزی کی سزا — 6 ماہ تک یا جرمانہ۔',
    remedies: ['Labour Department Registration', 'Minimum Wage Recovery Application', 'District Labour Officer Complaint', 'Workers Association Formation'],
    remediesUrdu: ['لیبر ڈیپارٹمنٹ میں رجسٹریشن', 'کم از کم اجرت کی وصولی کی درخواست', 'ضلعی لیبر آفیسر کو شکایت', 'ورکرز ایسوسی ایشن کا قیام'],
    jurisdiction: 'Punjab, Pakistan',
    url: 'https://punjablaws.gov.pk/'
  },
  {
    id: 'child_protection_punjab_2019',
    actTitle: 'Punjab Destitute and Neglected Children Act, 2004 & Child Protection Authority Act, 2019',
    actTitleUrdu: 'پنجاب بے سہارا اور نظرانداز بچوں ایکٹ 2004 اور چائلڈ پروٹیکشن ایکٹ 2019',
    section: 'Sections 3, 4, 5, 11, 15 & 22',
    title: 'Child Protection — Abuse, Neglect, Child Labor & Exploitation',
    titleUrdu: 'بچوں کا تحفظ — تشدد، غفلت، بچوں کی محنت اور استحصال',
    keywords: [
      'child abuse', 'child neglect', 'child labor', 'bachon par tashaddud', 'bachon ka istehsal',
      'child protection', 'bachon ki mehngi', 'corporal punishment', 'school beating',
      'child exploitation', 'bachon ko mara'
    ],
    summary: 'Establishes the Punjab Child Protection and Welfare Commission with authority to: (1) investigate child abuse and neglect; (2) remove children from dangerous environments; (3) prosecute offenders of child abuse (physical, sexual, emotional); (4) prohibit corporal punishment in schools; (5) regulate child labor. Punishment for child abuse: imprisonment up to 10 years and fine. Mandatory reporting by teachers, doctors, and caregivers.',
    summaryUrdu: 'پنجاب چائلڈ پروٹیکشن اینڈ ویلفیئر کمیشن قائم کرتا ہے جسے اختیار ہے: (1) بچوں پر تشدد اور غفلت کی تحقیقات؛ (2) خطرناک ماحول سے بچوں کو نکالنا؛ (3) بچوں پر تشدد (جسمانی، جنسی، جذباتی) کے مجرموں کا استغاثہ؛ (4) اسکولوں میں جسمانی سزا کی ممانعت؛ (5) بچوں کی محنت کی ضابطہ بندی۔ بچوں پر تشدد کی سزا: 10 سال تک قید اور جرمانہ۔ اساتذہ، ڈاکٹروں اور نگہبانوں کی طرف سے لازمی رپورٹنگ۔',
    fullText: 'The Act establishes the Child Protection and Welfare Commission, mandates reporting of child abuse, prohibits corporal punishment, regulates child labor conditions, and provides for removal of children from harmful environments. Section 11: Punishment for cruelty to children — up to 10 years. Section 15: Mandatory reporting obligation. Section 22: Protection of child witnesses.',
    fullTextUrdu: 'یہ ایکٹ چائلڈ پروٹیکشن اینڈ ویلفیئر کمیشن قائم کرتا ہے، بچوں پر تشدد کی رپورٹنگ لازمی قرار دیتا ہے، جسمانی سزا ممنوع کرتا ہے، بچوں کی محنت کے حالات کو ضابطہ بناتا ہے اور بچوں کو نقصان دہ ماحول سے نکالنے کی فراہمی دیتا ہے۔ دفعہ 11: بچوں پر ظلم کی سزا — 10 سال تک۔ دفعہ 15: لازمی رپورٹنگ کا فرض۔ دفعہ 22: بچے گواہوں کا تحفظ۔',
    remedies: ['Child Protection Helpline 1121', 'Child Protection Commission Complaint', 'Police FIR for Child Abuse', 'Emergency Removal Order'],
    remediesUrdu: ['چائلڈ پروٹیکشن ہیلپ لائن 1121', 'چائلڈ پروٹیکشن کمیشن کو شکایت', 'بچوں پر تشدد کی پولیس ایف آئی آر', 'فوری نکالنے کا حکم'],
    jurisdiction: 'Punjab, Pakistan',
    url: 'https://punjablaws.gov.pk/'
  },
  {
    id: 'mental_health_punjab_2014',
    actTitle: 'Punjab Mental Health Act, 2014',
    actTitleUrdu: 'پنجاب ذہنی صحت ایکٹ 2014',
    section: 'Sections 3, 23, 30, 40 & 55',
    title: 'Mental Health Rights — Involuntary Treatment Protections & Non-Discrimination',
    titleUrdu: 'ذہنی صحت کے حقوق — غیر اختیاری علاج کا تحفظ اور امتیاز کی ممانعت',
    keywords: [
      'mental health', 'depression', 'trauma', 'ptsd', 'anxiety', 'psychological abuse',
      'mental illness', 'psychiatric', 'suicidal', 'self harm', 'zehni sehat', 'pagal'
    ],
    summary: 'Protects rights of persons with mental health conditions in Punjab. Key provisions: (1) Right to informed consent for treatment; (2) Protections against involuntary admission except in specified emergencies; (3) Prohibition of discrimination in employment, education and healthcare based on mental health history; (4) Right to confidentiality of mental health records; (5) Establishment of Mental Health Authority for oversight. Punishment for violations: imprisonment up to 3 years or fine.',
    summaryUrdu: 'پنجاب میں ذہنی صحت کے حالات میں مبتلا افراد کے حقوق کا تحفظ کرتا ہے۔ اہم دفعات: (1) علاج کے لیے باخبر رضامندی کا حق؛ (2) مخصوص ہنگامی صورتحال کے علاوہ غیر اختیاری داخلے کے خلاف تحفظات؛ (3) ذہنی صحت کی تاریخ کی بنیاد پر ملازمت، تعلیم اور صحت میں امتیاز کی ممانعت؛ (4) ذہنی صحت کے ریکارڈ کی رازداری کا حق؛ (5) نگرانی کے لیے ذہنی صحت اتھارٹی کا قیام۔ خلاف ورزی کی سزا: 3 سال تک قید یا جرمانہ۔',
    fullText: 'Section 3: Rights of persons with mental disorders. Section 23: Informed consent requirements. Section 30: Emergency involuntary admission procedures. Section 40: Confidentiality of records. Section 55: Penalty for unauthorized treatment or violation of rights — up to 3 years or fine.',
    fullTextUrdu: 'دفعہ 3: ذہنی عوارض میں مبتلا افراد کے حقوق۔ دفعہ 23: باخبر رضامندی کے تقاضے۔ دفعہ 30: ہنگامی غیر اختیاری داخلے کے طریقے۔ دفعہ 40: ریکارڈ کی رازداری۔ دفعہ 55: غیر مجاز علاج یا حقوق کی خلاف ورزی کی سزا — 3 سال تک یا جرمانہ۔',
    remedies: ['Mental Health Authority Complaint', 'Informed Consent Violation Report', 'Confidentiality Breach Complaint', 'Free Psychiatric Emergency Services'],
    remediesUrdu: ['ذہنی صحت اتھارٹی کو شکایت', 'باخبر رضامندی کی خلاف ورزی کی رپورٹ', 'رازداری کی خلاف ورزی کی شکایت', 'مفت نفسیاتی ایمرجنسی سروسز'],
    jurisdiction: 'Punjab, Pakistan',
    url: 'https://punjablaws.gov.pk/'
  },
  {
    id: 'disabilities_punjab_2020',
    actTitle: 'Punjab Disabilities Protection and Rehabilitation Authority Act, 2020',
    actTitleUrdu: 'پنجاب معذور افراد تحفظ اور بحالی اتھارٹی ایکٹ 2020',
    section: 'Sections 3, 5, 6, 7, 14 & 24',
    title: 'Disability Rights — Non-Discrimination, Employment Quota & Accessibility',
    titleUrdu: 'معذوری کے حقوق — امتیاز کی ممانعت، ملازمت کا کوٹہ اور رسائی',
    keywords: [
      'disability', 'disabled', 'handicap', 'wheelchair', 'special needs', 'maazoor',
      'discrimination disabled', 'accessibility', 'employment quota', 'disabled rights'
    ],
    summary: 'Protects persons with disabilities from discrimination and ensures: (1) Equal opportunity in employment (5% quota in government jobs); (2) Accessible public buildings and transport; (3) Free education for children with disabilities; (4) Rehabilitation services; (5) Protection from abuse and neglect. Punishment for discrimination: imprisonment up to 3 months or fine up to PKR 50,000. Establishment of Disabilities Protection Authority for enforcement.',
    summaryUrdu: 'معذور افراد کو امتیاز سے تحفظ دیتا ہے اور یقینی بناتا ہے: (1) ملازمت میں مساوی موقع (سرکاری ملازمتوں میں 5% کوٹہ)؛ (2) عوامی عمارتوں اور نقل و حمل تک رسائی؛ (3) معذور بچوں کے لیے مفت تعلیم؛ (4) بحالی کی سروسز؛ (5) تشدد اور غفلت سے تحفظ۔ امتیاز کی سزا: 3 ماہ تک قید یا 50,000 روپے تک جرمانہ۔ نفاذ کے لیے معذور افراد تحفظ اتھارٹی کا قیام۔',
    fullText: 'Section 3: Definition and non-discrimination. Section 5: Employment quota (5%). Section 6: Accessible infrastructure. Section 7: Free education. Section 14: Rehabilitation services. Section 24: Penalty for discrimination — up to 3 months or fine up to 50,000.',
    fullTextUrdu: 'دفعہ 3: تعریف اور امتیاز کی ممانعت۔ دفعہ 5: ملازمت کا کوٹہ (5%)۔ دفعہ 6: قابل رسائی انفراسٹرکچر۔ دفعہ 7: مفت تعلیم۔ دفعہ 14: بحالی کی سروسز۔ دفعہ 24: امتیاز کی سزا — 3 ماہ تک یا 50,000 تک جرمانہ۔',
    remedies: ['Disabilities Protection Authority Complaint', 'Employment Quota Enforcement Petition', 'Accessibility Violation Report', 'Free Rehabilitation Services'],
    remediesUrdu: ['معذور افراد تحفظ اتھارٹی کو شکایت', 'ملازمت کوٹے کے نفاذ کی درخواست', 'رسائی کی خلاف ورزی کی رپورٹ', 'مفت بحالی سروسز'],
    jurisdiction: 'Punjab, Pakistan',
    url: 'https://punjablaws.gov.pk/'
  },
  {
    id: 'stalking_ppc_509_expanded',
    actTitle: 'Pakistan Penal Code & PECA — Stalking & Cyber-Stalking Provisions',
    actTitleUrdu: 'مجموعہ تعزیراتِ پاکستان اور PECA — پیچھا کرنے اور سائبر اسٹاکنگ کی دفعات',
    section: 'Section 509 PPC, Sections 20-21 PECA',
    title: 'Stalking, Following, Surveillance & Cyber-Monitoring of Women',
    titleUrdu: 'خواتین کا پیچھا کرنا، نگرانی اور سائبر مانیٹرنگ',
    keywords: [
      'stalking', 'following', 'peecha karna', 'surveillance', 'watching', 'spy on',
      'tracking phone', 'spy app', 'constant following', 'raaste mein peecha', 'bar bar dekhna'
    ],
    summary: 'Stalking is criminalized under multiple laws: (1) Section 509 PPC — following a woman, repeated attempts to contact, or monitoring her movements constitutes insulting modesty — up to 3 years imprisonment; (2) Sections 20-21 PECA — cyber-stalking through digital means (GPS tracking apps, social media monitoring, unauthorized location sharing) — up to 5 years imprisonment and fine. Both physical and digital stalking are covered. Victims can obtain restraining orders under PPWVA Section 7.',
    summaryUrdu: 'پیچھا کرنا متعدد قوانین کے تحت جرم ہے: (1) دفعہ 509 PPC — خاتون کا پیچھا کرنا، بار بار رابطے کی کوشش، یا اس کی نقل و حرکت کی نگرانی — 3 سال تک قید؛ (2) دفعات 20-21 PECA — ڈیجیٹل ذرائع سے سائبر اسٹاکنگ (GPS ٹریکنگ ایپس، سوشل میڈیا مانیٹرنگ، بغیر اجازت لوکیشن شیئرنگ) — 5 سال تک قید اور جرمانہ۔ جسمانی اور ڈیجیٹل دونوں طرح کا پیچھا شامل ہے۔ متاثرین PPWVA دفعہ 7 کے تحت پابندی کے احکامات حاصل کر سکتی ہیں۔',
    fullText: 'Section 509 PPC as amended includes stalking (following, monitoring movements, repeated contact attempts). PECA Sections 20-21 cover cyber-stalking (unauthorized digital surveillance, GPS tracking, social media harassment). PPWVA Section 7 provides for Protection Orders against stalkers.',
    fullTextUrdu: 'دفعہ 509 PPC (ترمیم شدہ) میں پیچھا کرنا (نگرانی، نقل و حرکت کی مانیٹرنگ، بار بار رابطے کی کوششیں) شامل ہے۔ PECA دفعات 20-21 سائبر اسٹاکنگ (غیر مجاز ڈیجیٹل نگرانی، GPS ٹریکنگ، سوشل میڈیا ہراسانی) کو شامل کرتی ہیں۔ PPWVA دفعہ 7 پیچھا کرنے والوں کے خلاف حفاظتی احکامات فراہم کرتی ہے۔',
    remedies: ['Police FIR for Stalking (Section 509 PPC)', 'FIA Cyber Crime Complaint for Digital Stalking', 'Protection Order Under PPWVA Section 7', 'Remove Spy/Tracking Apps from Device'],
    remediesUrdu: ['پیچھا کرنے کی پولیس ایف آئی آر (دفعہ 509)', 'ڈیجیٹل پیچھا کرنے کی ایف آئی اے سائبر کرائم شکایت', 'PPWVA دفعہ 7 کے تحت حفاظتی حکم', 'ڈیوائس سے جاسوسی/ٹریکنگ ایپس ہٹائیں'],
    jurisdiction: 'Pakistan / Punjab',
    url: 'https://punjabpolice.gov.pk/'
  }
];

export function searchLegalCorpus(query: string, limit = 3): LegalSourceCitation[] {
  const normalized = query.toLowerCase();
  
  const scored = PUNJAB_LEGAL_CORPUS.map(article => {
    let score = 0;
    
    // Check keyword hits
    for (const kw of article.keywords) {
      if (normalized.includes(kw.toLowerCase())) {
        score += 2.5;
      }
    }
    
    // Check summary & full text hits
    const titleHits = (normalized.match(new RegExp(article.title.toLowerCase(), 'g')) || []).length;
    score += titleHits * 2.0;
    
    if (normalized.includes('work') || normalized.includes('office') || normalized.includes('boss') || normalized.includes('naukri')) {
      if (article.id === 'workplace_act_2010') score += 5.0;
    }
    if (normalized.includes('ghar') || normalized.includes('husband') || normalized.includes('shohar') || normalized.includes('beat') || normalized.includes('marpeet') || normalized.includes('control')) {
      if (article.id.startsWith('ppwva')) score += 4.0;
    }
    if (normalized.includes('dhamki') || normalized.includes('threat') || normalized.includes('maar dalunga') || normalized.includes('kill')) {
      if (article.id === 'ppc_sec_506') score += 4.5;
    }
    if (normalized.includes('photo') || normalized.includes('video') || normalized.includes('blackmail') || normalized.includes('whatsapp') || normalized.includes('online')) {
      if (article.id === 'peca_sec_20_21') score += 5.0;
    }

    // Default baseline if query is general legal question
    if (score === 0 && (normalized.includes('law') || normalized.includes('haq') || normalized.includes('help') || normalized.includes('rights'))) {
      if (article.id === 'ppwva_sec_3' || article.id === 'ppwva_sec_7') score = 1.0;
    }

    return {
      article,
      score
    };
  });

  scored.sort((a, b) => b.score - a.score);

  const topHits = scored.filter(s => s.score > 0).slice(0, limit);
  
  // If no specific hits, return default foundational articles (PPWVA 2016)
  const resultsToMap = topHits.length > 0 ? topHits : [
    { article: PUNJAB_LEGAL_CORPUS[0], score: 1.0 },
    { article: PUNJAB_LEGAL_CORPUS[1], score: 0.8 }
  ];

  return resultsToMap.map(({ article, score }) => ({
    document: article.actTitle,
    documentUrdu: article.actTitleUrdu,
    section: article.section,
    sectionTitle: article.title,
    sectionTitleUrdu: article.titleUrdu,
    excerpt: article.summary,
    excerptUrdu: article.summaryUrdu,
    relevanceScore: Math.min(0.98, Math.max(0.65, 0.7 + (score * 0.05))),
    chunkId: article.id,
    jurisdiction: article.jurisdiction,
    url: article.url || 'https://pcsw.punjab.gov.pk/'
  }));
}
