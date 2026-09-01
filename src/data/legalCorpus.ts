/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LegalSourceCitation } from '../types';

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
