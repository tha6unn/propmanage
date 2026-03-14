/**
 * Supabase query functions for server components.
 * Each function takes a Supabase client and returns typed data.
 */
import { SupabaseClient } from "@supabase/supabase-js";

// ---- Types ----
export type Property = {
  id: string;
  owner_id: string;
  name: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state_province?: string;
  country: string;
  postal_code?: string;
  property_type?: string;
  status: string;
  total_units: number;
  year_built?: number;
  area_sqft?: number;
  notes?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type Tenancy = {
  id: string;
  property_id: string;
  tenant_profile_id?: string;
  tenant_invite_email?: string;
  tenant_invite_phone?: string;
  unit_identifier?: string;
  status: string;
  monthly_rent: number;
  security_deposit: number;
  rent_due_day: number;
  agreement_start_date?: string;
  agreement_end_date?: string;
  currency: string;
  notice_period_days: number;
  created_at: string;
  properties?: { name: string; city?: string };
};

export type RentPayment = {
  id: string;
  tenancy_id: string;
  property_id: string;
  owner_id: string;
  payment_month: string;
  amount_due: number;
  amount_paid: number;
  payment_date?: string;
  payment_method?: string;
  status: string;
  transaction_reference?: string;
  notes?: string;
  created_at: string;
  tenancies?: {
    unit_identifier?: string;
    tenant_invite_email?: string;
    properties?: { name: string };
  };
};

export type Document = {
  id: string;
  property_id: string;
  owner_id: string;
  category: string;
  title: string;
  description?: string;
  file_path: string;
  original_filename?: string;
  file_type?: string;
  file_size_bytes?: number;
  expiry_date?: string;
  ocr_status: string;
  created_at: string;
  properties?: { name: string };
};

export type MaintenanceRequest = {
  id: string;
  property_id: string;
  title: string;
  description?: string;
  category?: string;
  priority: string;
  status: string;
  estimated_cost?: number;
  actual_cost?: number;
  vendor_name?: string;
  resolution_notes?: string;
  resolved_at?: string;
  created_at: string;
  properties?: { name: string };
};

// ---- Portfolio Stats ----
export async function getPortfolioStats(supabase: SupabaseClient) {
  // Parallel fetch — all 4 queries run concurrently instead of sequentially
  const [
    { data: properties },
    { data: tenancies },
    { data: payments },
    { data: documents },
  ] = await Promise.all([
    supabase.from("properties").select("id, status, total_units"),
    supabase.from("tenancies").select("monthly_rent, status").in("status", ["active", "invited"]),
    supabase.from("rent_payments").select("status, amount_due, amount_paid"),
    supabase.from("documents").select("expiry_date").not("expiry_date", "is", null),
  ]);

  const props = properties || [];
  const tns = tenancies || [];
  const pmts = payments || [];
  const docs = documents || [];

  const occupiedCount = props.filter((p) => p.status === "occupied").length;
  const vacantCount = props.filter((p) => p.status === "vacant").length;
  const monthlyIncome = tns
    .filter((t) => t.status === "active")
    .reduce((sum, t) => sum + Number(t.monthly_rent), 0);
  const overduePayments = pmts.filter((p) => p.status === "overdue").length;
  const overdueAmount = pmts
    .filter((p) => p.status === "overdue")
    .reduce(
      (sum, p) => sum + Number(p.amount_due) - Number(p.amount_paid || 0),
      0
    );

  // Expiring docs — within 30 days
  const now = new Date();
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiringDocs = docs.filter((d) => {
    if (!d.expiry_date) return false;
    const exp = new Date(d.expiry_date);
    return exp >= now && exp <= thirtyDays;
  }).length;

  return {
    totalProperties: props.length,
    occupiedUnits: occupiedCount,
    vacantUnits: vacantCount,
    monthlyIncome,
    overduePayments,
    overdueAmount,
    expiringDocs,
  };
}

// ---- Properties ----
export async function getProperties(
  supabase: SupabaseClient,
  options?: { status?: string; search?: string }
) {
  let query = supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });

  if (options?.status) {
    query = query.eq("status", options.status);
  }
  if (options?.search) {
    query = query.ilike("name", `%${options.search}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getProperties error:", error.message);
    return [] as Property[];
  }
  return (data || []) as Property[];
}

export async function getRecentProperties(supabase: SupabaseClient, limit = 5) {
  const { data } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data || []) as Property[];
}

// ---- Tenancies ----
export async function getTenancies(
  supabase: SupabaseClient,
  propertyId?: string
) {
  let query = supabase
    .from("tenancies")
    .select("*, properties(name, city)")
    .order("created_at", { ascending: false });

  if (propertyId) {
    query = query.eq("property_id", propertyId);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getTenancies error:", error.message);
    return [] as Tenancy[];
  }
  return (data || []) as Tenancy[];
}

// ---- Payments ----
export async function getPayments(
  supabase: SupabaseClient,
  options?: { status?: string; propertyId?: string }
) {
  let query = supabase
    .from("rent_payments")
    .select("*, tenancies(unit_identifier, tenant_invite_email, properties(name))")
    .order("payment_month", { ascending: false });

  if (options?.status) {
    query = query.eq("status", options.status);
  }
  if (options?.propertyId) {
    query = query.eq("property_id", options.propertyId);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getPayments error:", error.message);
    return [] as RentPayment[];
  }
  return (data || []) as RentPayment[];
}

export async function getPaymentSummary(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("rent_payments")
    .select("amount_due, amount_paid, status");

  const payments = data || [];
  const totalDue = payments.reduce((s, p) => s + Number(p.amount_due), 0);
  const totalPaid = payments.reduce(
    (s, p) => s + Number(p.amount_paid || 0),
    0
  );
  const overdueCount = payments.filter((p) => p.status === "overdue").length;
  const overdueAmount = payments
    .filter((p) => p.status === "overdue")
    .reduce(
      (s, p) => s + Number(p.amount_due) - Number(p.amount_paid || 0),
      0
    );

  return {
    totalDue,
    totalCollected: totalPaid,
    totalOutstanding: totalDue - totalPaid,
    overdueCount,
    overdueAmount,
  };
}

// ---- Documents ----
export async function getDocuments(
  supabase: SupabaseClient,
  options?: { category?: string; propertyId?: string }
) {
  let query = supabase
    .from("documents")
    .select("*, properties(name)")
    .order("created_at", { ascending: false });

  if (options?.category) {
    query = query.eq("category", options.category);
  }
  if (options?.propertyId) {
    query = query.eq("property_id", options.propertyId);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getDocuments error:", error.message);
    return [] as Document[];
  }
  return (data || []) as Document[];
}

// ---- Maintenance ----
export async function getMaintenanceRequests(
  supabase: SupabaseClient,
  options?: { status?: string; propertyId?: string }
) {
  let query = supabase
    .from("maintenance_requests")
    .select("*, properties(name)")
    .order("created_at", { ascending: false });

  if (options?.status) {
    query = query.eq("status", options.status);
  }
  if (options?.propertyId) {
    query = query.eq("property_id", options.propertyId);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getMaintenanceRequests error:", error.message);
    return [] as MaintenanceRequest[];
  }
  return (data || []) as MaintenanceRequest[];
}
