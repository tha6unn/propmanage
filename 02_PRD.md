# Product Requirements Document (PRD)
## PropManage — AI-Powered Global Property Management Platform

**Document ID:** PM-PRD-001  
**Version:** 1.0  
**Status:** Approved  
**Date:** March 2026

---

## 1. Product Vision

**PropManage is the intelligent co-pilot for property owners who manage real properties, real documents, and real tenants — without the overhead of enterprise software.**

We believe every landlord, regardless of portfolio size, deserves the same clarity and control as a professional property management firm. PropManage achieves this by unifying the entire property ownership lifecycle into one private, intelligent, mobile-first system — and adding an AI agent that understands your actual documents.

---

## 2. The Problem

### 2.1 Core Problem Statement

Property owners managing 5–200 properties across India, the Middle East, and Southeast Asia operate in fragmented chaos:

- **Documents are scattered** across WhatsApp, email, physical folders, pen drives, and Google Drive with no structure, no search, and no expiry tracking.
- **Rent is tracked informally** — in notebooks, Excel sheets, or purely from memory. When a tenant is overdue, the owner has to remember to chase it.
- **Agreements expire without warning.** Owners discover this when a tenant vacates or when a legal dispute arises, at which point the agreement is years out of date.
- **No audit trail.** When disputes arise, there is no record of what was said, what was agreed, or who communicated what.
- **Hiring a property manager means losing visibility.** The manager has all the information; the owner sees nothing unless they call.
- **Maintenance is invisible.** Requests go to WhatsApp. Status updates are ad hoc. Costs are untracked.

### 2.2 Why Existing Tools Fail

| Tool | Why It Fails |
|---|---|
| WhatsApp | No structure, no search, no document lifecycle, ephemeral |
| Excel | Manual, single-user, no notifications, no intelligence |
| AppFolio / Buildium | Built for US market, enterprise pricing, English-only, no document intelligence |
| Google Drive | No property structure, no tenant lifecycle, no AI, no reminders |
| Local property managers | Creates a visibility black hole, fee-based, trust risk |

### 2.3 Pain Points (Ranked by Severity)

1. **Agreement expiry surprises** — discovered too late, no renewal pipeline
2. **Overdue rent chasing** — manual, embarrassing, ineffective
3. **Document retrieval during disputes** — "Which folder is the original sale deed in?"
4. **NRI/remote owner blind spots** — no real-time visibility into properties they can't visit
5. **Manager accountability gaps** — no structured record of manager activity
6. **Multilingual barriers** — South Indian landlords need Tamil support; Gulf properties need Arabic
7. **No financial audit trail** — informal receipts, no payment history

---

## 3. Target Market

### 3.1 Primary Market
- **Geography:** India (Tamil Nadu, Maharashtra, Karnataka, Delhi), UAE, Singapore, UK
- **User:** Individual property owners with 5–50 properties
- **Age:** 35–65
- **Tech comfort:** Moderate (smartphones, WhatsApp, Google Docs) — not developers

### 3.2 Secondary Market
- **Property management firms:** 2–10 person firms managing 50–200 properties for multiple clients
- **NRI investors:** Indians living abroad with domestic property portfolios
- **Family offices / HNI investors:** Managing mixed portfolios (residential + commercial)

### 3.3 Total Addressable Market
- India has ~100 million landlords (NSSO data). The addressable segment (5+ properties, smartphone owner) is approximately 8–12 million.
- UAE has ~200,000 registered landlords in Dubai alone.
- This is a deeply underserved segment globally.

---

## 4. Goals & Success Metrics

### 4.1 Phase 1 Goals (Months 1–4)
| Goal | Metric |
|---|---|
| Working core platform | All 6 user flows functional end-to-end |
| Document vault live | 100 test documents uploaded and indexed |
| Notifications working | WhatsApp reminders delivered with < 5% failure rate |
| First 10 real users | 10 property owners actively using platform |

### 4.2 Phase 2 Goals (Months 5–7)
| Goal | Metric |
|---|---|
| AI agent live | Agent correctly answers 80%+ of test queries |
| RAG accuracy | 90%+ of document queries return relevant, cited results |
| User satisfaction | NPS > 40 from early users |

### 4.3 12-Month Goals
| Goal | Metric |
|---|---|
| Active users | 500 paying owners |
| ARR | ₹25L–₹50L (India) + AED/GBP additional |
| Properties managed | 10,000+ |
| Documents indexed | 100,000+ |
| Agent sessions | 50,000/month |

---

## 5. Features & Prioritization (MoSCoW)

### Must Have (MVP — Phase 1)
- Property CRUD with all metadata fields
- Document vault: upload, categorize, OCR, expiry tracking
- Tenant lifecycle: invite, active, ended, archived
- Rent tracking: monthly auto-generation, manual logging, overdue flagging
- 3-role auth: Owner, Property Manager, Tenant
- WhatsApp + email notifications
- Portfolio dashboard: occupancy, income, overdue summary
- Scheduled daily alerts

### Should Have (Phase 2)
- AI agent: RAG over private documents
- AI agent: live database queries (overdue, expiring, portfolio)
- AI agent: general property knowledge (Claude)
- Confirmed action flow for agent actions
- Draft generation: rent receipts, renewal notices
- Document versioning
- Time-limited share links (for CA/legal)

### Could Have (Phase 3–4)
- Voice input via Whisper
- Multilingual UI (Hindi, Tamil, Arabic)
- Agent voice responses (TTS)
- Co-owner access model
- Vendor/contractor role
- Proactive agent insights ("Your tenant's agreement expires in 15 days — shall I draft a renewal?")

### Won't Have (This Version)
- Tax authority integration (not in scope — privacy-first)
- Payment gateway (we log payments; we don't process them)
- Web application (mobile-first; web is Phase 5+)
- Public property listings
- Tenant screening / background checks

---

## 6. User Journeys

### Journey 1 — Owner Onboards a New Property

1. Downloads app, registers with Google SSO
2. Taps "Add Property" → fills name, address, type (apartment), status (occupied)
3. Uploads sale deed from camera → categorized as "Ownership" → OCR runs async
4. System extracts property address, registration number, owner name from deed
5. Owner sets expiry alert: "Remind me 30 days before property tax renewal (Apr 30 2026)"
6. Property appears in portfolio dashboard

### Journey 2 — Owner Invites a Tenant

1. Owner opens property → taps "Add Tenancy"
2. Fills: tenant name, phone, email, monthly rent (₹25,000), deposit (₹75,000), agreement dates (May 2025 – Apr 2026), rent due on 5th
3. Uploads signed rental agreement PDF → system extracts: tenant name, rent, dates
4. Taps "Invite Tenant" → tenant receives WhatsApp link
5. Tenant opens link → creates account → sees their tenancy: agreement, payment history, maintenance form
6. System auto-generates 12 monthly rent entries from May 2025

### Journey 3 — Monthly Rent Cycle

1. Scheduled job runs every 1st: marks pending entries as "due"
2. On the 10th, if payment_status is still "Pending," system auto-sends WhatsApp to tenant
3. Owner opens app → sees "3 tenants overdue" on dashboard
4. Owner asks AI agent: "Who hasn't paid rent this month?"
5. Agent returns: "Flat 3B (Ravi Kumar, ₹18,000), Flat 7A (Lakshmi Devi, ₹22,500), Shop 2 (ABC Enterprises, ₹35,000)"
6. Owner says "Send reminders to all three on WhatsApp" → agent drafts and shows messages → owner confirms → messages sent

### Journey 4 — Document Retrieval via AI Agent

1. Tenant vacates and disputes security deposit deduction
2. Owner opens AI agent, types: "What does my agreement with Ravi Kumar say about deposit deductions?"
3. Agent searches vector index, retrieves relevant clause from the uploaded agreement
4. Returns: "From your Rental Agreement dated May 2024 for Flat 3B: 'The security deposit shall be returned within 30 days of handover, after deducting costs for any damage beyond normal wear and tear.' The agreement further specifies..."
5. Owner screenshots and sends to tenant — dispute resolved

---

## 7. Pricing Strategy

### 7.1 Planned Tiers (India Market)

| Plan | Price | Properties | Documents | AI Queries/mo | Users |
|---|---|---|---|---|---|
| **Starter** | Free | Up to 3 | 50 docs | 50 | Owner only |
| **Growth** | ₹799/mo | Up to 20 | 500 docs | 500 | +2 managers |
| **Portfolio** | ₹1,999/mo | Unlimited | 5,000 docs | Unlimited | +5 managers |
| **Enterprise** | Custom | Unlimited | Unlimited | Unlimited | Unlimited |

### 7.2 International Pricing
- UAE: AED 15 / AED 49 / AED 129
- UK: £5 / £12 / £29
- Singapore: SGD 8 / SGD 20 / SGD 50

### 7.3 Monetization Logic
- Freemium drives acquisition (target: 60% free → 20% Growth → 15% Portfolio → 5% Enterprise)
- AI query limits create natural upgrade pressure
- Annual plans at 20% discount

---

## 8. Competitive Positioning

| Feature | PropManage | AppFolio | Buildium | NoBroker | Magic Bricks |
|---|---|---|---|---|---|
| Document Vault + OCR | ✅ Core | ❌ | ❌ | ❌ | ❌ |
| AI Agent (RAG) | ✅ Core | Partial | ❌ | ❌ | ❌ |
| Global + Multilingual | ✅ 8 langs | 🇺🇸 only | 🇺🇸 only | 🇮🇳 EN only | 🇮🇳 only |
| Individual Landlord Pricing | ✅ Freemium | ❌ Enterprise | ❌ Enterprise | ❌ | ❌ |
| WhatsApp Native | ✅ | ❌ | ❌ | Partial | ❌ |
| Voice Input | ✅ Phase 3 | ❌ | ❌ | ❌ | ❌ |
| Tenant Portal | ✅ | ✅ | ✅ | ❌ | ❌ |

**Our Moat:** No competitor combines private document intelligence + global pricing + WhatsApp-native workflow + multilingual voice for individual landlords.

---

## 9. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| OCR quality too low on Indian documents | Medium | High | Use Google Document AI (best multilingual OCR); prompt user to re-upload below 70% confidence |
| Twilio WhatsApp business approval delays | Medium | High | Start with Twilio sandbox; apply early for Business API |
| Agent RAG hallucination | Medium | High | Ground all doc answers with cited chunks; add "NOT FOUND" response path |
| User won't upload documents (behavior change) | High | High | Reduce friction: camera-first upload, auto-extract fields, immediate value display |
| Data privacy concerns in India | Medium | Medium | Privacy-first design: no tax integration, private audit log, offline mode option |
| Railway outage | Low | High | Export data to Supabase directly; Railway has 99.9% SLA |

---

*PRD Version 1.0 — PropManage*
