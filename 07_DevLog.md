# Development Log (DevLog)
## PropManage — AI-Powered Global Property Management Platform

**Document ID:** PM-DEVLOG-001  
**Version:** Living Document (Updated with each sprint)  
**Date Started:** March 2026  
**Primary Developer:** Tharun

---

## How to Use This DevLog

This is a living document. Update it every 1–2 days with:
1. What was done (specific tasks completed)
2. Decisions made and why
3. Problems encountered and how they were resolved
4. Next steps

This log is the single source of truth for build progress and will be used to generate status updates for the client.

---

## Project Setup Log

### Day 0 — March 13, 2026 — Project Kickoff

**Completed:**
- Finalized product vision and architecture with full documentation suite
- Defined three-model AI architecture: Gemini (orchestrator), pgvector RAG, Claude (knowledge)
- Confirmed tech stack: FastAPI + Supabase + Google ADK + React Native (Expo) + Railway
- Created 7 core documents: SRS, PRD, TechSpec, BLAST Prompts, Brand Guidelines, Use Cases, DevLog

**Key Decisions:**
- **Supabase over Neon/PlanetScale:** Supabase gives auth + DB + storage + pgvector in one service. Eliminates 3 separate integrations.
- **Google ADK over LangChain:** ADK is purpose-built for multi-agent orchestration and has native Gemini integration. LangGraph would work but ADK is cleaner for this use case.
- **FastAPI over Next.js API routes:** Python ecosystem is required for AI/ML libraries. FastAPI is production-grade and async-native.
- **Railway over Render/DigitalOcean:** Simpler environment variable management, auto-deploy from GitHub, better container support.
- **Expo over bare React Native:** Managed workflow speeds up Phase 1 significantly. Can eject later if needed.

**Open Questions:**
- [ ] Google Document AI pricing at scale (estimate 50,000 pages/year = ~₹5,000/year)
- [ ] Twilio WhatsApp Business API approval timeline (sandbox vs. production)
- [ ] Whether to use Supabase Storage or AWS S3 for document storage (will decide at Phase 1 Step 1.3)

**Next Steps:**
- Set up Git repository with folder structure
- Create all service accounts (Supabase, Google Cloud, Anthropic, Twilio, SendGrid, Railway)
- Run Supabase schema SQL
- Build first FastAPI route (health check + auth)

---

## Sprint Log Template

Copy this template for each sprint:

```
### Sprint [N] — [Date Range]

**Sprint Goal:** [One sentence goal]

**Tasks Completed:**
- [ ] Task 1
- [ ] Task 2

**Tasks In Progress:**
- [ ] Task

**Blocked:**
- [ ] Issue + reason

**Decisions Made:**
- Decision + reasoning

**Bugs Fixed:**
- Bug description + fix

**Performance Notes:**
- Any latency/performance observations

**Next Sprint Goal:**
```

---

## Sprint 1 — [Week 1] — Foundation

**Sprint Goal:** Working FastAPI server with Supabase connection and auth endpoints

**Tasks:**
- [ ] Git repo created with folder structure from build guide
- [ ] Supabase project created, schema SQL executed (all 10 tables)
- [ ] pgvector extension enabled
- [ ] FastAPI skeleton with health check running locally
- [ ] Auth routes: register, login, refresh token
- [ ] JWT implementation with role claims
- [ ] Supabase Row Level Security policies deployed
- [ ] Railway project created, first deploy successful
- [ ] GitHub Actions CI pipeline configured (tests → deploy)
- [ ] All env vars added to Railway dashboard

**Expected Outcome:** `GET /health` returns 200 on Railway URL. `POST /api/auth/register` creates a user in Supabase.

---

## Sprint 2 — [Week 2] — Property + Document Core

**Sprint Goal:** Owner can create a property and upload a document

**Tasks:**
- [ ] Property CRUD endpoints (GET list, POST create, GET detail, PATCH, soft DELETE)
- [ ] Property access control (owner_id filtering at API level)
- [ ] Document upload endpoint (multipart/form-data)
- [ ] Supabase Storage integration — upload file, return storage path
- [ ] UUID filename generation (never expose original filename)
- [ ] Signed URL generation for document download (15-min expiry)
- [ ] Document metadata saved to documents table
- [ ] Background OCR job queued after upload (stub for now — logs "OCR queued")

**Expected Outcome:** Owner can create a property via API. Can upload a PDF and get a signed download URL back.

---

## Sprint 3 — [Week 3] — Tenancy + Rent

**Sprint Goal:** Owner can invite a tenant and track rent

**Tasks:**
- [ ] Tenancy CRUD endpoints
- [ ] Tenant invite flow (generates invite link with signed token)
- [ ] Tenant account creation from invite link
- [ ] Rent entry auto-generation (on tenancy creation, generate 12 monthly entries)
- [ ] Payment logging endpoint
- [ ] Overdue flag logic (cron updates status from 'pending' to 'overdue' when past due)
- [ ] Portfolio summary endpoint (total properties, income, overdue count)

---

## Sprint 4 — [Week 4] — Notifications

**Sprint Goal:** Working WhatsApp + email notifications

**Tasks:**
- [ ] Twilio WhatsApp sandbox integration
- [ ] send_whatsapp() function with delivery logging
- [ ] SendGrid email integration  
- [ ] Scheduled daily cron job (APScheduler)
- [ ] Overdue rent detection + WhatsApp reminder trigger
- [ ] Document expiry detection + alert trigger
- [ ] Notification log stored in notification_log table
- [ ] Manual "Send Reminder" API endpoint

---

## Sprint 5 — [Week 5-6] — Mobile App Phase 1

**Sprint Goal:** Working mobile app with all Phase 1 screens

**Tasks:**
- [ ] Expo project created
- [ ] Supabase client configured with AsyncStorage
- [ ] Auth flow: login, register, OTP screens
- [ ] Bottom tab navigation (Portfolio, Documents, Tenants, Payments, Agent)
- [ ] Portfolio screen: property list, occupancy chips, income summary
- [ ] Property detail screen: tabs for Overview / Documents / Tenants / Payments / Maintenance
- [ ] Document upload screen: camera + file picker
- [ ] Document list screen: filterable by category, expiry badges
- [ ] Tenant screen: profile, payment history, agreement info
- [ ] Add Property form
- [ ] Add Tenancy form
- [ ] Payment log form
- [ ] Push notification setup (Expo Notifications)

---

## Sprint 6 — [Week 7-8] — OCR Pipeline

**Sprint Goal:** Documents are automatically processed and key fields extracted

**Tasks:**
- [ ] Google Document AI integration
- [ ] OCR pipeline: upload → Document AI → extract text → store in extracted_text
- [ ] Auto-extraction prompt with Gemini (extract structured fields from OCR text)
- [ ] Update documents table with extracted_text, auto_extracted_fields, ocr_confidence
- [ ] Display extracted fields in app: "Auto-detected: Tenant: Ravi Kumar, Rent: ₹22,500, End: Apr 2026"
- [ ] Owner can confirm or correct extracted fields
- [ ] Re-upload prompt if confidence < 70%

---

## Sprint 7 — [Week 9-10] — Vector Embeddings

**Sprint Goal:** Documents are chunked, embedded, and searchable

**Tasks:**
- [ ] Chunking function: 400 tokens, 50 overlap, preserve paragraph boundaries
- [ ] Google text-embedding-004 API integration
- [ ] Document embedding pipeline: chunk → embed → store in document_chunks
- [ ] pgvector similarity search function (SQL function: search_document_chunks)
- [ ] Embedding job runs automatically after OCR completion
- [ ] is_indexed flag updated on document when embedding complete
- [ ] Search test: verify correct chunks returned for test queries

---

## Sprint 8 — [Week 11-12] — AI Agent

**Sprint Goal:** Working AI agent with all three tools

**Tasks:**
- [ ] Google ADK installation and configuration
- [ ] PropAssistOrchestrator LlmAgent defined with Gemini 2.0 Flash
- [ ] Tool 1: search_my_documents (RAG via pgvector)
- [ ] Tool 2: get_portfolio_data (DB queries: overdue, expiring, summary)
- [ ] Tool 3: get_property_knowledge (Claude Haiku via Anthropic API)
- [ ] Tool 4: record_rent_payment (with confirmation flow)
- [ ] Tool 5: draft_document
- [ ] FastAPI /api/agent/chat endpoint
- [ ] Session management (conversation history per user+session)
- [ ] Role-scoped agent (owner vs. manager vs. tenant system prompt)
- [ ] Agent action logging to agent_action_log table
- [ ] Agent chat UI in mobile app

---

## Sprint 9 — [Week 13-14] — Voice Input

**Sprint Goal:** User can speak queries to the agent

**Tasks:**
- [ ] expo-av audio recording integration
- [ ] /api/agent/transcribe endpoint (OpenAI Whisper)
- [ ] Voice button in chat UI with recording indicator
- [ ] Transcribed text displayed before sending to agent
- [ ] Language auto-detection from audio

---

## Known Technical Risks (Track Here)

| Risk | Status | Mitigation |
|---|---|---|
| Twilio WhatsApp Business API slow to approve | 🟡 Open | Start with sandbox; apply early |
| Google Document AI accuracy on handwritten Indian docs | 🟡 Open | Test with 20 real scanned docs before Sprint 6 |
| pgvector performance with 500K+ chunks | 🟡 Open | Add IVFFlat index with lists=100; test with synthetic data |
| ADK session memory limits in long conversations | 🟡 Open | Implement summary-based memory after 10 turns |
| Expo OTA update + Supabase Auth edge cases | 🟡 Open | Test on low-end Android (Redmi 9A) |

---

## Architecture Decision Records (ADRs)

### ADR-001: Use pgvector instead of Pinecone for vector storage
**Date:** March 2026  
**Decision:** Use Supabase pgvector instead of a standalone vector database  
**Rationale:** pgvector is already in Supabase. No additional service to manage, no additional cost, no cross-service auth complexity. For 500K vectors at 768 dimensions with IVFFlat index, performance is sufficient. Will revisit if we exceed 5M vectors.  
**Trade-off:** Pinecone would offer better filtering and faster search at extreme scale. Accept this trade-off for Phase 1-3.

---

### ADR-002: Use Claude (Anthropic) for General Knowledge, not Gemini
**Date:** March 2026  
**Decision:** Route general property/legal knowledge queries to Claude Haiku, not Gemini  
**Rationale:** Claude's reasoning on legal/compliance content is measurably better. It cites regulations by name, adds appropriate caveats, and handles nuanced country-specific norms more accurately. The cost difference (Haiku is very cheap) does not justify using a weaker model.  
**Trade-off:** Adds one external API dependency. Mitigated by: the tool only triggers for general knowledge queries (not RAG queries), so failure is graceful.

---

### ADR-003: Expo Managed Workflow over Bare
**Date:** March 2026  
**Decision:** Use Expo managed workflow for React Native  
**Rationale:** Eliminates native build complexity for Phase 1. Camera, audio, document picker, notifications all available via Expo SDK. OTA updates allow fixing bugs without App Store review.  
**Trade-off:** Cannot use certain native libraries that require custom native code. If this becomes a constraint (e.g., specific OCR native module), eject to bare workflow.

---

### ADR-004: Soft Delete for all entities
**Date:** March 2026  
**Decision:** Never hard-delete properties, tenancies, documents, or payments — use status/archived flags  
**Rationale:** Users may accidentally delete. Hard deletion removes audit trail. Legal disputes require historical records. Storage cost is negligible.  
**Implementation:** Add `archived_at TIMESTAMPTZ` column to key tables. Filter with `WHERE archived_at IS NULL` in all queries.

---

## Release History

| Version | Date | Features |
|---|---|---|
| v0.1 | [TBD] | Backend API + Auth (Sprint 1) |
| v0.2 | [TBD] | Properties + Documents + Upload (Sprint 2) |
| v0.3 | [TBD] | Tenancies + Rent + Notifications (Sprint 3-4) |
| v0.4 | [TBD] | Mobile App Phase 1 (Sprint 5) |
| v0.5 | [TBD] | OCR + Embeddings (Sprint 6-7) |
| v1.0 | [TBD] | AI Agent Live (Sprint 8) |
| v1.1 | [TBD] | Voice Input (Sprint 9) |

---

*DevLog v1.0 — PropManage*  
*This is a living document. Update it every working day.*
