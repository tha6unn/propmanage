# Software Requirements Specification (SRS)
## PropManage — AI-Powered Global Property Management Platform

**Document ID:** PM-SRS-001  
**Version:** 1.0  
**Status:** Approved  
**Date:** March 2026  
**Author:** Tharun (Lead Developer)

---

## 1. Introduction

### 1.1 Purpose
This document defines the complete software requirements for PropManage, a mobile-first, AI-powered property management platform designed for individual landlords and small-to-mid-sized property management firms managing 5 to 200+ properties globally.

### 1.2 Scope
PropManage covers the full property ownership lifecycle: property registration, document vaulting, tenant lifecycle management, rent tracking, maintenance coordination, intelligent notifications, and an AI agent capable of reasoning over the owner's private document corpus using Retrieval-Augmented Generation (RAG).

### 1.3 Intended Audience
- Lead Developer (Tharun) — primary implementer
- Google Antigravity — AI-assisted build tooling
- Future engineering hires

### 1.4 Product Overview
PropManage is a multi-tenant SaaS platform accessible via a React Native mobile app (iOS + Android). The backend is a Python FastAPI service deployed on Railway, backed by Supabase (PostgreSQL + pgvector + Storage). The AI layer uses Google ADK with Gemini 2.0 Flash as the orchestrator, pgvector for semantic search over private documents, Claude (Anthropic) for general property knowledge, and OpenAI Whisper for voice input.

---

## 2. Overall Description

### 2.1 Product Context
There is no existing product that combines: global multi-country scope + private landlord pricing + per-property document vault with lifecycle tracking + RAG-based AI agent + voice + multilingual support. PropManage fills this gap.

### 2.2 Target Users

| User Type | Description | Property Count |
|---|---|---|
| Solo Landlord | Individual managing residential properties | 1–20 |
| Portfolio Owner | HNI, NRI, or investor managing multiple assets | 20–100 |
| Property Manager | Hired professional managing on owner's behalf | 10–200 (assigned) |
| Tenant | Renting one or more units from the owner | N/A |

### 2.3 User Personas

**Persona 1 — Ramesh, 54, Chennai**
Retired civil engineer, owns 12 residential apartments across Chennai and Coimbatore. Currently uses WhatsApp to communicate with tenants, paper receipts for rent, and physical filing cabinets for ownership documents. Misses agreement renewals. Cannot recall which tenant is overdue. Needs reminders, a searchable document vault, and WhatsApp-native workflow.

**Persona 2 — Priya, 38, London (NRI)**
Owns 4 properties in Chennai managed by a local agent. Receives zero visibility into document status, rent collection, or maintenance. Needs remote visibility, digital document access, and alerts on her phone without time-zone friction.

**Persona 3 — Abdul, 46, Dubai**
Manages 35 residential units across Dubai and Abu Dhabi for two family trusts. Needs Arabic-language support, multi-owner structure, and regulatory document tracking (Ejari registrations, RERA compliance docs).

**Persona 4 — Meenakshi, 32, Property Manager**
Works for a Chennai-based real estate firm managing 80 properties across 6 owners. Needs role-scoped access (only her assigned properties), maintenance tracking, and tenant communication — no access to owner financials.

### 2.4 Constraints
- Must work on poor mobile data networks (low-bandwidth optimization)
- Document OCR must handle multilingual, handwritten, and camera-captured documents
- All financial data is private — no integration with tax authorities or external financial systems
- Must comply with data residency expectations per region (configurable)
- No web app in Phase 1 — mobile only

---

## 3. Functional Requirements

### 3.1 User Management & Authentication

| ID | Requirement | Priority |
|---|---|---|
| FR-AUTH-001 | Users register with email+password or Google/Apple SSO | Must Have |
| FR-AUTH-002 | Phone OTP verification for Indian mobile numbers (via Twilio) | Must Have |
| FR-AUTH-003 | Property Managers are invited by email — they do not self-register | Must Have |
| FR-AUTH-004 | Tenants are invited by email or phone — they do not self-register | Must Have |
| FR-AUTH-005 | JWT-based session with 24h access token + refresh token rotation | Must Have |
| FR-AUTH-006 | Optional 2FA for owners | Should Have |
| FR-AUTH-007 | Profile: name, phone, email, preferred language, avatar | Must Have |
| FR-AUTH-008 | Account deletion with data export | Should Have |

### 3.2 Property Management

| ID | Requirement | Priority |
|---|---|---|
| FR-PROP-001 | Owner can create, edit, archive a property | Must Have |
| FR-PROP-002 | Property fields: name, address (multi-country format), type, status, units | Must Have |
| FR-PROP-003 | Property types: residential (apartment, house, villa), commercial (office, retail, warehouse), land, mixed-use | Must Have |
| FR-PROP-004 | Property status: occupied, vacant, under maintenance, listed | Must Have |
| FR-PROP-005 | Portfolio overview screen: all properties, occupancy rate, monthly income, overdue count | Must Have |
| FR-PROP-006 | Owner can assign Property Managers to specific properties | Must Have |
| FR-PROP-007 | Owner can set per-manager permissions: see financials (yes/no), see tenant KYC (yes/no) | Must Have |
| FR-PROP-008 | Multi-unit support (apartment buildings with multiple units) | Should Have |
| FR-PROP-009 | Property photo gallery | Nice to Have |
| FR-PROP-010 | Map view of all properties | Nice to Have |

### 3.3 Document Management

| ID | Requirement | Priority |
|---|---|---|
| FR-DOC-001 | Owner can upload documents via camera, file picker, or share extension | Must Have |
| FR-DOC-002 | Supported formats: PDF, JPEG, PNG, HEIC (auto-converted to PDF/JPEG) | Must Have |
| FR-DOC-003 | Document categories: Ownership, Tenant KYC, Rental Agreement, Financial Records, Legal, Insurance, Inspection, Maintenance | Must Have |
| FR-DOC-004 | Each document is stored encrypted (AES-256) in Supabase Storage | Must Have |
| FR-DOC-005 | Files accessed only via short-lived signed URLs (15–60 min expiry) | Must Have |
| FR-DOC-006 | OCR runs automatically on every uploaded document (background) | Must Have |
| FR-DOC-007 | Auto-extraction of key fields: tenant name, rent amount, start/end dates, clause summaries | Must Have |
| FR-DOC-008 | OCR confidence score stored; user prompted to re-upload if below 70% | Should Have |
| FR-DOC-009 | Expiry date field with configurable alert threshold (default 30 days) | Must Have |
| FR-DOC-010 | Document search by title, category, property, extracted text | Must Have |
| FR-DOC-011 | Time-limited read-only share links for CA/legal access (no login required) | Should Have |
| FR-DOC-012 | Audit log of who accessed each document | Must Have |
| FR-DOC-013 | Document versioning (new upload replaces old, old retained) | Should Have |

### 3.4 Tenant Management

| ID | Requirement | Priority |
|---|---|---|
| FR-TEN-001 | Owner creates a tenancy linked to a property + unit | Must Have |
| FR-TEN-002 | Owner invites tenant via email or WhatsApp link | Must Have |
| FR-TEN-003 | Tenant accepts invite → creates an account → sees only own tenancy data | Must Have |
| FR-TEN-004 | Tenancy fields: unit, monthly rent, deposit, currency, rent due day, agreement dates | Must Have |
| FR-TEN-005 | Tenancy statuses: Invited, Active, Ending (notice given), Ended, Archived | Must Have |
| FR-TEN-006 | Notice period tracking with automated alerts | Must Have |
| FR-TEN-007 | Tenancy history per property (past + current tenants) | Must Have |
| FR-TEN-008 | Tenant profile: name, phone, email, emergency contact, KYC document links | Should Have |

### 3.5 Rent & Financial Tracking

| ID | Requirement | Priority |
|---|---|---|
| FR-FIN-001 | System auto-generates monthly rent entries based on agreement start date | Must Have |
| FR-FIN-002 | Owner logs cash/UPI/bank transfer/cheque payments manually | Must Have |
| FR-FIN-003 | Payment statuses: Pending, Partial, Paid, Overdue, Waived | Must Have |
| FR-FIN-004 | Overdue flag set automatically when payment_month passes with status Pending | Must Have |
| FR-FIN-005 | Security deposit tracking (paid, held, returned) | Must Have |
| FR-FIN-006 | Multi-currency support (INR, AED, GBP, EUR, SGD, USD, etc.) | Must Have |
| FR-FIN-007 | Rent receipt generation (PDF) | Should Have |
| FR-FIN-008 | Portfolio-level financial summary (monthly income, collected vs. outstanding) | Must Have |
| FR-FIN-009 | Export financial data to CSV | Should Have |
| FR-FIN-010 | Financial records are NEVER visible to Property Managers by default | Must Have |

### 3.6 Maintenance Management

| ID | Requirement | Priority |
|---|---|---|
| FR-MAINT-001 | Tenant can raise a maintenance request with category + priority + description | Must Have |
| FR-MAINT-002 | Owner/Manager receives push notification for new requests | Must Have |
| FR-MAINT-003 | Request statuses: Open, Acknowledged, In Progress, Resolved, Closed, Rejected | Must Have |
| FR-MAINT-004 | Cost logging (estimated and actual) per request | Should Have |
| FR-MAINT-005 | Maintenance history per property | Must Have |
| FR-MAINT-006 | Photo attachments to maintenance requests | Should Have |

### 3.7 Notifications

| ID | Requirement | Priority |
|---|---|---|
| FR-NOTIF-001 | WhatsApp reminders for overdue rent (via Twilio) | Must Have |
| FR-NOTIF-002 | WhatsApp/SMS reminders for expiring agreements (30, 15, 7 days before) | Must Have |
| FR-NOTIF-003 | Document expiry alerts to owner | Must Have |
| FR-NOTIF-004 | Maintenance request updates to tenant and owner | Must Have |
| FR-NOTIF-005 | Email notifications via SendGrid as fallback | Must Have |
| FR-NOTIF-006 | In-app notification feed | Should Have |
| FR-NOTIF-007 | Notification preferences per user (opt out of specific types) | Should Have |
| FR-NOTIF-008 | Daily scheduled alert job runs at 9 AM in user's timezone | Must Have |

### 3.8 AI Agent (Phase 2)

| ID | Requirement | Priority |
|---|---|---|
| FR-AI-001 | Text-based chat interface for all roles | Must Have |
| FR-AI-002 | Agent retrieves information from user's private documents via RAG | Must Have |
| FR-AI-003 | Agent queries live database (rent, tenancies, maintenance) | Must Have |
| FR-AI-004 | Agent answers general property/legal knowledge using Claude (Anthropic) | Must Have |
| FR-AI-005 | All agent tool calls are scoped by authenticated user's role and permitted properties | Must Have |
| FR-AI-006 | Agent cites which document it retrieved information from | Must Have |
| FR-AI-007 | Confirmed action flow: agent shows what it's about to do, waits for approval | Must Have |
| FR-AI-008 | Agent can draft: rent receipts, renewal notices, legal notices, WhatsApp messages | Should Have |
| FR-AI-009 | Voice input via OpenAI Whisper (language auto-detected) | Should Have |
| FR-AI-010 | Agent responds in user's preferred language | Should Have |
| FR-AI-011 | All agent interactions logged in agent_action_log table | Must Have |

---

## 4. Non-Functional Requirements

### 4.1 Performance
- API response time: < 300ms for CRUD operations (p95)
- Document upload feedback: < 2s (upload starts, OCR is async)
- Agent chat response: < 4s for simple queries, < 8s for RAG queries
- Voice transcription: < 2s via Whisper API
- App cold start: < 3s on mid-range Android device

### 4.2 Security
- AES-256 document encryption at rest
- HTTPS everywhere; no HTTP fallback
- JWT with short-lived access tokens (24h) + refresh rotation
- Row-Level Security (RLS) enforced in Supabase for all tables
- API-level role enforcement independent of RLS (defense in depth)
- No PII in URL parameters or logs
- UUID filenames in storage (never expose original filenames)
- Rate limiting on auth endpoints (10 req/min per IP)

### 4.3 Reliability
- Uptime target: 99.5% (Railway managed infrastructure)
- Background jobs (OCR, embeddings, alerts) must retry on failure (max 3 retries)
- Document uploads must not fail silently — user must see error state

### 4.4 Scalability
- Support 10,000 active owners in Year 1
- Support 500,000 documents with vector embeddings
- Agent queries must not degrade with index size (use filtered pgvector search)

### 4.5 Accessibility
- Minimum font size: 16sp on mobile
- All interactive elements: minimum 44×44px tap target
- Sufficient color contrast (WCAG AA)
- Support OS-level font scaling

### 4.6 Localization
- UI: English (Phase 1), Hindi, Tamil, Arabic (Phase 3)
- Agent responses: multilingual (Gemini 2.0 Flash native capability)
- Date/currency formatting per locale
- RTL layout support for Arabic (Phase 3)

---

## 5. External Interface Requirements

### 5.1 APIs and Services
| Service | Purpose | Tier |
|---|---|---|
| Supabase | PostgreSQL DB, Auth, Storage, pgvector | Free → Pro |
| Google Gemini 2.0 Flash | Agent orchestrator, embeddings | Pay-per-use |
| Anthropic Claude Haiku | General property knowledge | Pay-per-use |
| OpenAI Whisper | Voice transcription | Pay-per-use |
| Twilio | WhatsApp + SMS notifications | Pay-per-use |
| SendGrid | Email notifications | Free (100/day) → paid |
| Google Document AI | OCR for uploaded documents | Pay-per-use |
| Google Cloud TTS | Text-to-speech for voice responses | Free tier |
| Railway | Backend deployment | Starter plan |

### 5.2 Mobile Platform Requirements
- iOS 15.0+
- Android 10.0+ (API 29+)
- Permissions needed: camera, photo library, notifications, microphone (Phase 3)

---

## 6. Use Case Summary

| UC ID | Use Case | Actor |
|---|---|---|
| UC-001 | Register and set up first property | Owner |
| UC-002 | Upload ownership documents and set expiry alert | Owner |
| UC-003 | Invite a tenant to a property | Owner |
| UC-004 | Log a rent payment received in cash | Owner |
| UC-005 | Send WhatsApp reminder to all overdue tenants | Owner via AI Agent |
| UC-006 | Ask "Which of my agreements expire in 90 days?" | Owner via AI Agent |
| UC-007 | Retrieve a specific clause from a lease agreement | Owner via AI Agent |
| UC-008 | Raise a maintenance request | Tenant |
| UC-009 | View own payment history and agreement terms | Tenant |
| UC-010 | Access assigned properties and log maintenance resolution | Property Manager |
| UC-011 | Generate a rent receipt for a tenant | Owner |
| UC-012 | Upload a rental agreement and get auto-extracted key dates | Owner |

---

## 7. Acceptance Criteria

The platform is considered MVP-complete when:
1. An owner can register, add a property, upload a document, and invite a tenant end-to-end without any manual backend intervention
2. A rent payment can be logged and a WhatsApp notification sent to the tenant automatically
3. The AI agent can answer "Which tenant owes me rent this month?" using live database data
4. The AI agent can retrieve a specific clause from an uploaded PDF agreement
5. All data access is correctly scoped by role (owner sees all, manager sees assigned, tenant sees own)
6. OCR pipeline processes and indexes an uploaded document within 60 seconds

---

*SRS Version 1.0 — PropManage*
