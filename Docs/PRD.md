# MEHFOOZ (محفوظ) / SAFEPATH — PRODUCT REQUIREMENT DOCUMENT (PRD)
**Version:** 2.4.0  
**Document Owner:** Product & Engineering Team  
**Status:** Approved / Production-Ready  
**Classification:** Public Safety & Privacy-Preserving Technology  
**Target Region:** Punjab, Pakistan (with scalable modularity for South Asia)

---

## 1. Executive Summary & Vision

### 1.1 Executive Summary
**Mehfooz (محفوظ)** is a client-first, privacy-preserving women's safety ecosystem designed specifically for the ground realities of Punjab, Pakistan. It integrates six critical safety pillars into a single application:
1. **Stealth Weather Cover**: A realistic Tuscany meteorological disguise with dual triggers (double-tap and long-press) and custom PIN entry.
2. **Safe Corridor Navigation**: Algorithmic pedestrian routing weighted by Street Lighting Density, Safe City CCTV camera clusters, commercial footfall, and verified safe havens.
3. **Punjab AI Legal Advisor**: A grounded Retrieval-Augmented Generation (RAG) statutory legal AI trained on the *Punjab Protection of Women Against Violence Act (PPWVA 2016)*, *PECA Cyber Laws (2016)*, and relevant Pakistan Penal Code (PPC) provisions.
4. **Zero-Knowledge Incident Vault**: Client-side AES-GCM-256 encrypted evidence locker storing audio notes, photographs, and harassment timestamps.
5. **Silent Destination Check-In**: Automated failsafe journey timers dispatching GPS coordinates and SMS alerts to guardian circles upon missed deadlines.
6. **Crisis SOS Engine**: Emergency one-tap coordination connecting users directly with Punjab Police Safe City (15), Punjab Commission on the Status of Women (PCSW 1043), and Rescue 1122.

### 1.2 Vision Statement
To eliminate fear in mobility and legal ambiguity for women and vulnerable citizens through discreet, accessible, and privacy-preserving technology that bridges immediate physical protection with long-term legal empowerment.

---

## 2. System Architecture & Tech Stack

```
+-----------------------------------------------------------------------------------+
|                                  USER INTERFACE                                   |
|   [Stealth Weather Cover]  [Safe Corridors]  [Punjab Legal AI]  [Encrypted Vault] |
+-----------------------------------------------------------------------------------+
                                         |
+-----------------------------------------------------------------------------------+
|                             CLIENT APPLICATION LAYER                              |
|   React 18 (SPA) | Vite | Tailwind CSS v4 | Motion (Animations) | Lucide Icons    |
|   Client Crypto (Web Cryptography API - AES-GCM-256 / PBKDF2)                     |
+-----------------------------------------------------------------------------------+
                                         |
            +----------------------------+----------------------------+
            |                                                         |
+-----------------------+                                 +-----------------------+
|  STATE & PERSISTENCE  |                                 |    EXTERNAL APIS      |
|  - Local Storage      |                                 |  - Web Speech API     |
|  - Encrypted Blob KV  |                                 |  - Geolocation API    |
|  - Session Context    |                                 |  - Punjab Helplines   |
+-----------------------+                                 +-----------------------+
```

### 2.1 Technology Stack Matrix
| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18.3+ with TypeScript | High type-safety, modular component tree, deterministic state handling |
| **Build System** | Vite 5.x | Ultra-fast bundling, minimal bundle overhead, rapid HMR in development |
| **Styling Engine** | Tailwind CSS v4 | Responsive utility classes, custom design tokens, dark/light theme switching |
| **Animation Engine** | `motion/react` | Smooth transition states, gesture handling, sheet physics, micro-interactions |
| **Iconography** | `lucide-react` | Standardized, lightweight SVG iconography |
| **Client Encryption** | Web Crypto API (SubtleCrypto) | Native browser cryptographic engine (PBKDF2 key derivation + AES-GCM-256) |
| **AI Legal RAG Engine** | Gemini Flash / Grounded Statutory Vector KB | Zero-hallucination statutory legal citations and formal complaint drafting |
| **Audio Processing** | Web Audio API / MediaRecorder | Local evidence recording and discreet frequency siren beacon |
| **Geospatial & Maps** | Canvas / Vector Street Rendering | High-performance route rendering, heatmaps, and camera cluster pins |

---

## 3. Security, Authentication & Zero-Knowledge Architecture

### 3.1 Stealth Access & Disguise Protocol
- **Default Entry State**: The application launches into the **Tuscany Meteorological Station UI**.
- **Stealth Trigger 1 (Tap)**: Double-tap on the temperature numeral (`23°`) triggers the numeric PIN modal.
- **Stealth Trigger 2 (Hold)**: Long-press (2.5 seconds) on the background triggers an unobtrusive green progress bar followed by automatic unlock.
- **Panic Escape Trigger**: Pressing `Esc` on desktop or double-tapping the top-left logo immediately terminates the session and returns to the weather screen.

### 3.2 Cryptographic Key Derivation & Vault Storage
- **Encryption Scheme**: AES-GCM-256 (Galois/Counter Mode).
- **Key Derivation**: PBKDF2 with HMAC-SHA-256 (100,000 iterations), salt generated via `crypto.getRandomValues(32)`.
- **Zero-Knowledge Guarantee**: The encryption key is derived solely in volatile browser RAM from the user's PIN/passphrase. Plaintext evidence never touches persistent cloud databases unencrypted.

---

## 4. Functional Requirements (By Core Pillar)

### 4.1 Module 1: Stealth Weather Cover
- **FR-1.1**: Render realistic weather data (Day, Night, and Sunrise themes).
- **FR-1.2**: Support 6 realistic urban and provincial stations (Tuscany, Florence, Lahore, Islamabad, Murree, Karachi).
- **FR-1.3**: Provide real-time UI components: 24-hour forecast, 7-day outlook, AQI meter, humidity, wind velocity, and UV index.
- **FR-1.4**: Numeric PIN pad keypad (per-user stealth PIN set in the user profile; demo default `1520`) with wrong-PIN shake feedback and automatic input masking. A long-press on the weather card acts as the designed recovery unlock — there is no universal default code.

### 4.2 Module 2: Safe Corridor Navigation
- **FR-2.1**: Interactive corridor map displaying safety ratings ($A+$, $A$, $B$, $C$).
- **FR-2.2**: Calculate multidimensional safety score:
  $$\text{Safety Score} = 0.35 \times \text{Lighting} + 0.30 \times \text{CCTV Coverage} + 0.20 \times \text{Safe Havens} + 0.15 \times \text{Crowd Density}$$
- **FR-2.3**: Safe Haven Business Pins (Pharmacies, 24/7 fuel stations, police service centers).
- **FR-2.4**: Live audit submission allowing commuters to flag broken street lights or harassment hotspots.

### 4.3 Module 3: Grounded AI Legal Advisor
- **FR-3.1**: Grounded RAG chat interface answering queries in Urdu and English.
- **FR-3.2**: Exact statutory citations for:
  - *PPWVA 2016*: §4 (Protection Order), §5 (Residence Order), §6 (Monetary Order).
  - *PECA 2016*: §20 (Offences Against Dignity), §21 (Non-Consensual Images), §24 (Cyber Stalking).
  - *Pakistan Penal Code (PPC)*: §354A, §509 (Insulting Modesty).
- **FR-3.3**: Automated Police & Court Complaint Generator creating formal formatted draft letters ready for filing.

### 4.4 Module 4: Zero-Knowledge Incident Vault
- **FR-4.1**: Create incident records categorized by type (Physical Stalking, Workplace Harassment, Cyber Extortion, Domestic Dispute).
- **FR-4.2**: Client-side encrypted audio recorder storing evidence logs in encrypted IndexedDB/LocalStorage.
- **FR-4.3**: Legal Court Export generating clean PDF/Markdown packages with checksum timestamps.

### 4.5 Module 5: Destination Check-In Timer
- **FR-5.1**: User sets journey duration (e.g., 20 mins) and destination name.
- **FR-5.2**: Visual countdown timer with 2-minute Grace Period notification.
- **FR-5.3**: Automatic SMS dispatch trigger with live GPS coordinates if user fails to check in.

### 4.6 Module 6: Crisis SOS Dispatch Engine
- **FR-6.1**: One-touch hold-to-activate (2-second countdown) emergency beacon.
- **FR-6.2**: Direct telephony integration to 15 (Police), 1043 (Women Helpline), and 1122 (Rescue).
- **FR-6.3**: Simulated and live multi-guardian SMS transmission with battery level and Google Maps coordinates.

---

## 5. Non-Functional Requirements (NFR)

| Parameter | Metric / Standard |
| :--- | :--- |
| **Response Latency** | Emergency SOS trigger initiates telephony link within $< 100\text{ ms}$ of touch release |
| **Cold Start** | Full app load time $< 1.2\text{ s}$ on 3G/4G mobile networks |
| **Encryption Strength** | AES-256-GCM authenticated encryption with 96-bit IV and 128-bit authentication tag |
| **Accessibility** | WCAG 2.1 AA compliant color contrast, high-legibility Urdu Naskh/Nastaliq font rendering |
| **Offline Resilience** | Core legal statutes, contacts directory, and encrypted vault operational with 0kbps data |
| **Cross-Platform** | Fully responsive layout optimized for mobile viewports ($360\text{px}$ to $430\text{px}$) and desktop browsers |

---

## 6. User Stories & Personas

### Persona A: Ayesha (University Student, Lahore)
- **Context**: Commutes on public transit and walking routes along Canal Road after evening classes.
- **User Story**: *"As a student commuting at dusk, I want to view verified well-lit walking corridors so that I can avoid unmonitored dark alleys."*

### Persona B: Fatima (Corporate Employee, Rawalpindi)
- **Context**: Facing workplace harassment and cyber blackmail from an ex-colleague.
- **User Story**: *"As a survivor of harassment, I want to store dated screenshots and audio memos in an encrypted vault disguised as a weather app so that my phone cannot be compromised by family or peers."*

### Persona C: Zainab (Freelancer, Multan)
- **Context**: Needs to understand legal remedies under Punjab law without paying high retainer fees to a lawyer.
- **User Story**: *"As a citizen, I want to ask plain-language questions about domestic protection orders and get exact Punjab legal section numbers and draft letters."*

---

## 7. Step-by-Step Installation & Deployment

### 7.1 Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn

### 7.2 Local Setup
```bash
# 1. Clone the repository
git clone <repository-url>
cd mehfooz-safepath

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

### 7.3 Production Build
```bash
# Compile and build production bundle
npm run build

# Preview build locally
npm run preview
```

---

## 8. Compliance & Legal Framework (Punjab, Pakistan)
- **Punjab Protection of Women Against Violence Act (PPWVA 2016)**: Direct compliance with Section 4–8 provisions for violence tracking and protection center integration.
- **Prevention of Electronic Crimes Act (PECA 2016)**: Alignment with Section 20, 21, and 24 evidence requirements for FIA Cyber Crime submission.
- **Data Minimization Principle**: The system adheres to zero-log telemetry on user locations and personal identities.
