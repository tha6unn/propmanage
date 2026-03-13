# Technical Specification Document
## PropManage — AI-Powered Global Property Management Platform

**Document ID:** PM-TECH-001  
**Version:** 1.0  
**Date:** March 2026

---

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    MOBILE CLIENT                        │
│           React Native (Expo) — iOS + Android           │
│  Auth │ Portfolio │ Documents │ Chat │ Notifications    │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS / REST + WebSocket
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   RAILWAY SERVICES                      │
│                                                         │
│  ┌──────────────────┐    ┌──────────────────────────┐  │
│  │   API SERVICE    │    │    WORKER SERVICE         │  │
│  │   (FastAPI)      │    │    (Background Jobs)      │  │
│  │                  │    │                           │  │
│  │  /api/auth       │    │  • OCR Pipeline           │  │
│  │  /api/properties │    │  • Embedding Jobs         │  │
│  │  /api/documents  │    │  • Daily Alert Cron       │  │
│  │  /api/tenancies  │    │  • Notification Queue     │  │
│  │  /api/payments   │    │                           │  │
│  │  /api/agent      │    └──────────────────────────┘  │
│  │  /api/notify     │                                   │
│  └─────────┬────────┘                                   │
│            │                                            │
└────────────┼────────────────────────────────────────────┘
             │
      ┌──────┴───────────────────────────────────────┐
      │              SUPABASE                        │
      │  PostgreSQL + pgvector + Auth + Storage       │
      │                                              │
      │  Tables: profiles, properties,               │
      │  tenancies, documents, document_chunks,      │
      │  rent_payments, maintenance_requests,        │
      │  notification_log, agent_action_log          │
      │                                              │
      │  Storage: documents bucket (encrypted)       │
      │  pgvector: document_chunks.embedding         │
      └──────────────────────────────────────────────┘
             │
      ┌──────┴───────────────────────────────────────┐
      │           EXTERNAL AI SERVICES               │
      │                                              │
      │  Google Gemini 2.0 Flash — Orchestrator      │
      │  Google text-embedding-004 — Embeddings      │
      │  Google Document AI — OCR                    │
      │  Anthropic Claude Haiku — Knowledge LLM      │
      │  OpenAI Whisper — Voice STT                  │
      │  Google Cloud TTS — Voice output             │
      └──────────────────────────────────────────────┘
             │
      ┌──────┴───────────────────────────────────────┐
      │         NOTIFICATION SERVICES                │
      │                                              │
      │  Twilio — WhatsApp + SMS                     │
      │  SendGrid — Email                            │
      └──────────────────────────────────────────────┘
```

### 1.2 AI Agent Architecture

```
User Message (text or voice)
        │
        ▼ [If voice: Whisper STT first]
FastAPI /api/agent/chat
        │
        ▼
Google ADK — LlmAgent (Gemini 2.0 Flash)
[PropAssistOrchestrator]
System prompt: role-scoped instruction
        │
        ├─────────────────────────────────┐
        │                                 │
        ▼                                 ▼
FunctionTool: search_my_documents    FunctionTool: get_portfolio_data
    │                                    │
    ▼                                    ▼
text-embedding-004                  Supabase direct query
    │                                (overdue, expiring,
    ▼                                 portfolio summary)
pgvector similarity search
(filtered by owner_id)
    │
    ▼
Top-5 chunks returned as context
        │
        ▼
FunctionTool: get_property_knowledge
    │
    ▼
Anthropic Claude Haiku API
(general legal/property knowledge)
        │
        ▼
FunctionTool: [action tools]
(log_payment, send_notification, draft_notice)
→ ALWAYS confirm before executing
        │
        ▼
ADK assembles final response
        │
        ▼
FastAPI returns to mobile app
```

---

## 2. Technology Stack

### 2.1 Backend

| Component | Technology | Version | Justification |
|---|---|---|---|
| Web Framework | FastAPI | 0.110+ | Async-native, automatic OpenAPI docs, Python ecosystem for AI |
| Runtime | Python | 3.11 | Stable LTS, best AI/ML library support |
| ASGI Server | Uvicorn | Latest | Production-grade ASGI server |
| Auth | Supabase Auth + python-jose | Latest | JWT handling, SSO, phone OTP |
| Database ORM | Supabase Python client | Latest | Direct Supabase SDK, simpler than SQLAlchemy for this use case |
| Background Jobs | APScheduler | 3.x | Cron jobs for daily alerts; simple and battle-tested |
| Task Queue | None (Phase 1) → Redis/Celery (Phase 2) | — | Start simple; add queue when OCR load requires it |
| File Handling | aiofiles, python-multipart | Latest | Async file reads for uploads |
| PDF Processing | PyMuPDF (fitz) | Latest | Fast PDF text extraction before Document AI |
| Agent Framework | Google ADK | Latest | Multi-agent orchestration, Gemini-native |
| HTTP Client | httpx | Latest | Async HTTP calls to external APIs |

### 2.2 Mobile

| Component | Technology | Version | Justification |
|---|---|---|---|
| Framework | React Native | 0.73+ | Cross-platform (iOS + Android), large ecosystem |
| Build Tool | Expo SDK | 51+ | Faster iteration, OTA updates, managed workflow |
| State Management | Zustand | 4.x | Lightweight, minimal boilerplate vs Redux |
| Server State | TanStack Query | 5.x | Caching, background refetch, optimistic updates |
| Navigation | Expo Router | 3.x | File-based routing, native feel |
| UI Components | Custom + NativeBase | — | Custom design system built on top |
| Supabase Client | @supabase/supabase-js | 2.x | Auth, realtime, storage access from mobile |
| Audio | expo-av | Latest | Recording for voice input |
| Document Picker | expo-document-picker | Latest | File selection from device |
| Camera | expo-camera | Latest | Document scanning from camera |

### 2.3 Infrastructure

| Component | Technology | Justification |
|---|---|---|
| Deployment | Railway | Auto-deploy from GitHub, simple scaling, affordable |
| Database | Supabase | PostgreSQL + Auth + Storage + pgvector in one, generous free tier |
| File Storage | Supabase Storage | Integrated with auth; signed URLs; S3-compatible API |
| CDN | Railway / Supabase built-in | Adequate for document thumbnails and API responses |
| Monitoring | Railway built-in logs + Sentry | Error tracking without overhead |
| CI/CD | GitHub Actions | Auto-run tests on PR, auto-deploy to Railway on merge to main |

---

## 3. Database Schema (Complete)

### 3.1 Entity Relationship Diagram (Text)

```
auth.users (Supabase managed)
    │
    └──► profiles (1:1)
              │
              ├──► properties (1:N, as owner)
              │         │
              │         ├──► property_access (N:M — managers)
              │         │
              │         ├──► tenancies (1:N)
              │         │         │
              │         │         ├──► rent_payments (1:N)
              │         │         └──► profiles (1:1, as tenant)
              │         │
              │         ├──► documents (1:N)
              │         │         └──► document_chunks (1:N)
              │         │
              │         └──► maintenance_requests (1:N)
              │
              └──► agent_action_log (1:N)
```

### 3.2 Table: profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT NOT NULL,
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'en'
    CHECK (preferred_language IN ('en','hi','ta','ar','fr','de','es','ms')),
  role TEXT NOT NULL DEFAULT 'owner'
    CHECK (role IN ('owner','manager','tenant')),
  timezone TEXT DEFAULT 'Asia/Kolkata',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.3 Table: properties
```sql
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id),
  name TEXT NOT NULL,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state_province TEXT,
  country TEXT NOT NULL DEFAULT 'IN',
  postal_code TEXT,
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  property_type TEXT CHECK (property_type IN (
    'residential_apartment','residential_house','residential_villa',
    'commercial_office','commercial_retail','commercial_warehouse',
    'land','mixed_use'
  )),
  status TEXT DEFAULT 'vacant'
    CHECK (status IN ('occupied','vacant','under_maintenance','listed')),
  total_units INTEGER DEFAULT 1,
  year_built INTEGER,
  area_sqft NUMERIC(10,2),
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_properties_owner ON properties(owner_id);
CREATE INDEX idx_properties_status ON properties(status);
```

### 3.4 Table: property_access
```sql
CREATE TABLE property_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  access_level TEXT NOT NULL CHECK (access_level IN ('manager','viewer')),
  can_see_financials BOOLEAN DEFAULT FALSE,
  can_see_tenant_kyc BOOLEAN DEFAULT FALSE,
  granted_by UUID REFERENCES profiles(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  UNIQUE(property_id, user_id)
);
```

### 3.5 Table: tenancies
```sql
CREATE TABLE tenancies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id),
  tenant_profile_id UUID REFERENCES profiles(id),
  tenant_invite_email TEXT,
  tenant_invite_phone TEXT,
  unit_identifier TEXT,
  status TEXT DEFAULT 'invited'
    CHECK (status IN ('invited','active','ending','ended','archived')),
  monthly_rent NUMERIC(12,2) NOT NULL,
  security_deposit NUMERIC(12,2) DEFAULT 0,
  deposit_status TEXT DEFAULT 'held'
    CHECK (deposit_status IN ('pending','held','partially_returned','returned')),
  rent_due_day INTEGER DEFAULT 1 CHECK (rent_due_day BETWEEN 1 AND 28),
  agreement_start_date DATE,
  agreement_end_date DATE,
  currency TEXT DEFAULT 'INR',
  notice_period_days INTEGER DEFAULT 30,
  rent_escalation_pct NUMERIC(5,2),
  special_conditions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tenancies_property ON tenancies(property_id);
CREATE INDEX idx_tenancies_tenant ON tenancies(tenant_profile_id);
CREATE INDEX idx_tenancies_status ON tenancies(status);
```

### 3.6 Table: documents
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES profiles(id),
  tenancy_id UUID REFERENCES tenancies(id),
  category TEXT NOT NULL CHECK (category IN (
    'ownership','tenant_kyc','agreement','financial',
    'legal','insurance','inspection','maintenance','other'
  )),
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  original_filename TEXT,
  file_type TEXT,
  file_size_bytes INTEGER,
  extracted_text TEXT,
  auto_extracted_fields JSONB DEFAULT '{}',
  ocr_confidence NUMERIC(5,2),
  ocr_status TEXT DEFAULT 'pending'
    CHECK (ocr_status IN ('pending','processing','done','failed')),
  expiry_date DATE,
  alert_days_before INTEGER DEFAULT 30,
  is_indexed BOOLEAN DEFAULT FALSE,
  version INTEGER DEFAULT 1,
  previous_version_id UUID REFERENCES documents(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_property ON documents(property_id);
CREATE INDEX idx_documents_owner ON documents(owner_id);
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_expiry ON documents(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX idx_documents_is_indexed ON documents(is_indexed) WHERE is_indexed = FALSE;
```

### 3.7 Table: rent_payments
```sql
CREATE TABLE rent_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenancy_id UUID NOT NULL REFERENCES tenancies(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id),
  owner_id UUID NOT NULL REFERENCES profiles(id),
  payment_month DATE NOT NULL,
  amount_due NUMERIC(12,2) NOT NULL,
  amount_paid NUMERIC(12,2) DEFAULT 0,
  payment_date DATE,
  payment_method TEXT CHECK (payment_method IN (
    'cash','bank_transfer','upi','cheque','card','other'
  )),
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','partial','paid','overdue','waived')),
  transaction_reference TEXT,
  notes TEXT,
  receipt_generated BOOLEAN DEFAULT FALSE,
  receipt_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenancy_id, payment_month)
);

CREATE INDEX idx_payments_tenancy ON rent_payments(tenancy_id);
CREATE INDEX idx_payments_status ON rent_payments(status);
CREATE INDEX idx_payments_owner ON rent_payments(owner_id);
```

### 3.8 Table: maintenance_requests
```sql
CREATE TABLE maintenance_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id),
  tenancy_id UUID REFERENCES tenancies(id),
  raised_by UUID REFERENCES profiles(id),
  assigned_to UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN (
    'plumbing','electrical','structural','appliance',
    'pest_control','cleaning','security','other'
  )),
  priority TEXT DEFAULT 'medium'
    CHECK (priority IN ('low','medium','high','emergency')),
  status TEXT DEFAULT 'open'
    CHECK (status IN ('open','acknowledged','in_progress','resolved','closed','rejected')),
  estimated_cost NUMERIC(10,2),
  actual_cost NUMERIC(10,2),
  vendor_name TEXT,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.9 Table: document_chunks (RAG)
```sql
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  property_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  chunk_index INTEGER NOT NULL,
  chunk_text TEXT NOT NULL,
  embedding vector(768),
  token_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chunks_document ON document_chunks(document_id);
CREATE INDEX idx_chunks_owner ON document_chunks(owner_id);
CREATE INDEX ON document_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

### 3.10 Table: agent_action_log
```sql
CREATE TABLE agent_action_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  session_id TEXT NOT NULL,
  agent_name TEXT,
  action_type TEXT,
  input_summary TEXT,
  output_summary TEXT,
  tools_called JSONB DEFAULT '[]',
  documents_retrieved JSONB DEFAULT '[]',
  tokens_used INTEGER,
  latency_ms INTEGER,
  status TEXT DEFAULT 'completed',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_log_user ON agent_action_log(user_id);
CREATE INDEX idx_agent_log_session ON agent_action_log(session_id);
```

### 3.11 Table: notification_log
```sql
CREATE TABLE notification_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID REFERENCES profiles(id),
  channel TEXT CHECK (channel IN ('whatsapp','sms','email','in_app')),
  notification_type TEXT,
  content TEXT,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','sent','delivered','failed')),
  external_id TEXT,
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.12 pgvector Search Function
```sql
CREATE OR REPLACE FUNCTION search_document_chunks(
  query_embedding vector(768),
  owner_id_filter UUID,
  match_count INT DEFAULT 5,
  property_id_filter UUID DEFAULT NULL,
  category_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  chunk_text TEXT,
  document_id UUID,
  title TEXT,
  property_name TEXT,
  category TEXT,
  similarity FLOAT
)
LANGUAGE SQL STABLE AS $$
  SELECT
    dc.chunk_text,
    dc.document_id,
    d.title,
    p.name AS property_name,
    d.category,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  JOIN documents d ON d.id = dc.document_id
  JOIN properties p ON p.id = dc.property_id
  WHERE dc.owner_id = owner_id_filter
    AND (property_id_filter IS NULL OR dc.property_id = property_id_filter)
    AND (category_filter IS NULL OR d.category = category_filter)
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
$$;
```

---

## 4. API Specification

### 4.1 Authentication Endpoints
```
POST /api/auth/register          — Register new owner
POST /api/auth/login             — Email/password login → JWT
POST /api/auth/refresh           — Refresh access token
POST /api/auth/logout            — Invalidate refresh token
POST /api/auth/google            — Google SSO callback
POST /api/auth/otp/send          — Send phone OTP
POST /api/auth/otp/verify        — Verify OTP → JWT
GET  /api/auth/me                — Get current user profile
PATCH /api/auth/me               — Update profile
```

### 4.2 Property Endpoints
```
GET    /api/properties           — List all owner's properties
POST   /api/properties           — Create property
GET    /api/properties/{id}      — Get property details
PATCH  /api/properties/{id}      — Update property
DELETE /api/properties/{id}      — Archive property (soft delete)
GET    /api/properties/{id}/summary — Occupancy, income, overdue for one property
POST   /api/properties/{id}/access — Grant manager access
DELETE /api/properties/{id}/access/{user_id} — Revoke manager access
```

### 4.3 Document Endpoints
```
GET    /api/documents                    — List documents (filterable by property, category)
POST   /api/documents/upload             — Upload document (multipart/form-data)
GET    /api/documents/{id}               — Get document metadata
GET    /api/documents/{id}/download      — Get signed URL for download
PATCH  /api/documents/{id}               — Update metadata (title, expiry, category)
DELETE /api/documents/{id}               — Soft delete
GET    /api/documents/search             — Full-text search over extracted_text
POST   /api/documents/{id}/share         — Generate time-limited share link
```

### 4.4 Agent Endpoint
```
POST /api/agent/chat             — Send message, get AI response
POST /api/agent/transcribe       — Upload audio → get transcribed text
GET  /api/agent/history/{session_id} — Get conversation history
```

### 4.5 Notification Endpoints
```
POST /api/notifications/send-reminder   — Manually trigger rent reminder
GET  /api/notifications/history         — View sent notifications
PATCH /api/notifications/preferences    — Update notification preferences
```

### 4.6 Request/Response Format

All requests accept and return `application/json`.

**Standard Success Response:**
```json
{
  "data": { ... },
  "meta": { "total": 10, "page": 1 }
}
```

**Standard Error Response:**
```json
{
  "error": {
    "code": "DOCUMENT_NOT_FOUND",
    "message": "Document with ID xyz does not exist or you don't have access.",
    "status": 404
  }
}
```

---

## 5. Security Specification

### 5.1 Authentication Flow
```
Client → POST /api/auth/login
       ← { access_token (JWT, 24h), refresh_token (UUID, 30d) }

Client → API request with Authorization: Bearer {access_token}
API   → Verify JWT signature + expiry
API   → Extract user_id, role, permissions from JWT claims
API   → Enforce role-based access at handler level
DB    → RLS enforces owner_id filter at database level (second layer)
```

### 5.2 JWT Claims Structure
```json
{
  "sub": "user-uuid",
  "role": "owner",
  "email": "user@example.com",
  "exp": 1748000000,
  "iat": 1747913600
}
```

### 5.3 Document Storage Security
- All files stored in Supabase Storage under path: `{owner_id}/{property_id}/{category}/{uuid}.{ext}`
- Storage bucket is private — no public URLs
- All downloads go through backend which validates ownership before issuing signed URL
- Signed URL expiry: 15 minutes (read) / 5 minutes (upload)
- File size limit: 50MB per document

### 5.4 Row Level Security Policies
```sql
-- Properties: owners see only their own
CREATE POLICY "owner_policy" ON properties
  USING (owner_id = auth.uid());

-- Properties: managers see assigned only
CREATE POLICY "manager_policy" ON properties
  FOR SELECT USING (
    id IN (SELECT property_id FROM property_access WHERE user_id = auth.uid())
  );

-- Documents: owners see all, tenants see only their tenancy docs
CREATE POLICY "document_owner_policy" ON documents
  USING (owner_id = auth.uid());

CREATE POLICY "document_tenant_policy" ON documents
  FOR SELECT USING (
    tenancy_id IN (
      SELECT id FROM tenancies WHERE tenant_profile_id = auth.uid()
    )
    AND category IN ('agreement', 'tenant_kyc')
  );
```

---

## 6. AI Stack Specification

### 6.1 Model Usage

| Model | Use Case | Approx Cost |
|---|---|---|
| gemini-2.0-flash | Orchestrator, RAG synthesis, draft generation | $0.075/1M input tokens |
| text-embedding-004 | Document chunks + query embedding | $0.00002/1K chars |
| claude-haiku-4-5 | General property/legal knowledge | $0.25/1M input tokens |
| whisper-1 | Voice transcription | $0.006/min |
| google-docai | Document OCR | $1.50/1K pages (free: 1K/mo) |

### 6.2 Chunking Strategy
- Chunk size: 400 tokens
- Overlap: 50 tokens
- Preserve paragraph boundaries (split on `\n\n` first, then by token count)
- Minimum chunk size: 50 tokens (discard smaller chunks)
- Each chunk stores: document_id, property_id, owner_id, chunk_index, raw text, embedding

### 6.3 RAG Query Pipeline
```
1. User query → embed with text-embedding-004
2. pgvector similarity search (cosine) filtered by owner_id
3. Retrieve top-5 chunks with similarity > 0.7 threshold
4. If 0 results above threshold → return "No relevant documents found"
5. Format chunks as context: "From '{document_title}' ({category}):\n{chunk_text}"
6. Inject into Gemini prompt with strict instruction: "Answer ONLY based on the provided context"
7. Gemini returns cited answer → return to user
```

### 6.4 Google ADK Agent Configuration
```python
PropAssistOrchestrator = LlmAgent(
    name="PropAssistOrchestrator",
    model="gemini-2.0-flash",
    instruction=ROLE_SCOPED_SYSTEM_PROMPT,
    tools=[
        FunctionTool(func=search_my_documents),
        FunctionTool(func=get_portfolio_data),
        FunctionTool(func=get_property_knowledge),
        FunctionTool(func=record_rent_payment),
        FunctionTool(func=draft_document),
        FunctionTool(func=send_notification_draft),
    ]
)
```

---

## 7. Deployment Specification

### 7.1 Railway Services

| Service | Dockerfile | Environment | Memory | CPU |
|---|---|---|---|---|
| api | `backend/Dockerfile` | All env vars | 512MB | 0.5 vCPU |
| worker | `backend/Dockerfile.worker` | All env vars | 256MB | 0.25 vCPU |

### 7.2 Environment Variables (Complete List)
```
# Core
APP_ENV=production
SECRET_KEY=<64-char random hex>

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Google
GOOGLE_API_KEY=...
GOOGLE_CLOUD_PROJECT=...
GOOGLE_APPLICATION_CREDENTIALS=/app/service_account.json

# Anthropic
ANTHROPIC_API_KEY=...

# OpenAI (Whisper)
OPENAI_API_KEY=...

# Twilio
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# SendGrid
SENDGRID_API_KEY=...
SENDGRID_FROM_EMAIL=noreply@propmanage.app

# JWT
JWT_SECRET_KEY=...
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Feature Flags
ENABLE_AI_AGENT=true
ENABLE_VOICE=false
ENABLE_EMBEDDINGS=true
```

### 7.3 CI/CD Pipeline
```
GitHub Push → main branch
    │
    ▼
GitHub Actions:
  1. Run pytest (backend unit tests)
  2. Run ESLint (mobile)
  3. Build Expo (check for build errors)
    │
    ▼ (if all pass)
Railway auto-deploy:
  1. Build Docker image
  2. Zero-downtime deploy (new container → health check → switch traffic)
  3. Old container terminated
```

---

## 8. Performance Targets

| Operation | P50 | P95 | P99 |
|---|---|---|---|
| Property list (20 items) | 80ms | 200ms | 400ms |
| Document upload (10MB PDF) | 1.5s | 3s | 5s |
| OCR completion | 5s | 15s | 30s |
| Agent text query (no RAG) | 800ms | 2s | 4s |
| Agent RAG query | 1.5s | 4s | 8s |
| Voice transcription (30s audio) | 1s | 2s | 3s |
| Vector similarity search (100K chunks) | 50ms | 150ms | 300ms |

---

*Technical Specification v1.0 — PropManage*
