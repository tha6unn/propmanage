-- ============================================
-- PropManage — Complete Database Schema
-- Version: 1.0
-- Date: March 2026
-- Target: Supabase (PostgreSQL + pgvector)
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================
-- 1. PROFILES
-- ============================================
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

-- ============================================
-- 2. PROPERTIES
-- ============================================
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

-- ============================================
-- 3. PROPERTY ACCESS (Manager assignments)
-- ============================================
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

-- ============================================
-- 4. TENANCIES
-- ============================================
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

-- ============================================
-- 5. DOCUMENTS
-- ============================================
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

-- ============================================
-- 6. DOCUMENT CHUNKS (RAG / pgvector)
-- ============================================
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

-- ============================================
-- 7. RENT PAYMENTS
-- ============================================
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

-- ============================================
-- 8. MAINTENANCE REQUESTS
-- ============================================
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

-- ============================================
-- 9. AGENT ACTION LOG
-- ============================================
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

-- ============================================
-- 10. NOTIFICATION LOG
-- ============================================
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

-- ============================================
-- 11. UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenancies_updated_at
  BEFORE UPDATE ON tenancies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_updated_at
  BEFORE UPDATE ON maintenance_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 12. PGVECTOR SEARCH FUNCTION
-- ============================================
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

-- ============================================
-- 13. ROW LEVEL SECURITY
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE rent_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_action_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

-- Profiles: users see only their own profile
CREATE POLICY "profiles_own" ON profiles
  FOR ALL USING (id = auth.uid());

-- Properties: owners see only their own
CREATE POLICY "properties_owner" ON properties
  FOR ALL USING (owner_id = auth.uid());

-- Properties: managers see assigned only
CREATE POLICY "properties_manager" ON properties
  FOR SELECT USING (
    id IN (SELECT property_id FROM property_access WHERE user_id = auth.uid() AND revoked_at IS NULL)
  );

-- Property access: owners manage access for their properties
CREATE POLICY "property_access_owner" ON property_access
  FOR ALL USING (
    property_id IN (SELECT id FROM properties WHERE owner_id = auth.uid())
  );

-- Tenancies: owners see their properties' tenancies
CREATE POLICY "tenancies_owner" ON tenancies
  FOR ALL USING (
    property_id IN (SELECT id FROM properties WHERE owner_id = auth.uid())
  );

-- Tenancies: tenants see only their own
CREATE POLICY "tenancies_tenant" ON tenancies
  FOR SELECT USING (tenant_profile_id = auth.uid());

-- Documents: owners see all their docs
CREATE POLICY "documents_owner" ON documents
  FOR ALL USING (owner_id = auth.uid());

-- Documents: tenants see only their tenancy docs
CREATE POLICY "documents_tenant" ON documents
  FOR SELECT USING (
    tenancy_id IN (
      SELECT id FROM tenancies WHERE tenant_profile_id = auth.uid()
    )
    AND category IN ('agreement', 'tenant_kyc')
  );

-- Document chunks: owners see their own
CREATE POLICY "chunks_owner" ON document_chunks
  FOR ALL USING (owner_id = auth.uid());

-- Rent payments: owners see their own
CREATE POLICY "payments_owner" ON rent_payments
  FOR ALL USING (owner_id = auth.uid());

-- Rent payments: tenants see their own tenancy payments
CREATE POLICY "payments_tenant" ON rent_payments
  FOR SELECT USING (
    tenancy_id IN (SELECT id FROM tenancies WHERE tenant_profile_id = auth.uid())
  );

-- Maintenance: visible to property owner and tenant who raised it
CREATE POLICY "maintenance_owner" ON maintenance_requests
  FOR ALL USING (
    property_id IN (SELECT id FROM properties WHERE owner_id = auth.uid())
  );

CREATE POLICY "maintenance_tenant" ON maintenance_requests
  FOR SELECT USING (raised_by = auth.uid());

-- Agent log: users see their own logs
CREATE POLICY "agent_log_own" ON agent_action_log
  FOR ALL USING (user_id = auth.uid());

-- Notification log: users see their own notifications
CREATE POLICY "notification_log_own" ON notification_log
  FOR ALL USING (recipient_id = auth.uid());

-- ============================================
-- SCHEMA COMPLETE
-- ============================================
