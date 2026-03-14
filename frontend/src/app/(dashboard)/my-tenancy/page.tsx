import { Building2, CreditCard, Wrench, FileText, Calendar } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function formatCurrency(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function MyTenancyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get tenancy with property info
  const { data: tenancies } = await supabase
    .from("tenancies")
    .select("*, properties(name, city, country, address_line1)")
    .eq("tenant_profile_id", user.id)
    .in("status", ["active", "invited", "ending"])
    .order("created_at", { ascending: false })
    .limit(1);

  const tenancy = tenancies?.[0];

  // Get recent payments
  const { data: payments } = tenancy
    ? await supabase
        .from("rent_payments")
        .select("*")
        .eq("tenancy_id", tenancy.id)
        .order("payment_month", { ascending: false })
        .limit(6)
    : { data: null };

  // Get open maintenance requests
  const { data: maintenanceRequests } = tenancy
    ? await supabase
        .from("maintenance_requests")
        .select("*")
        .eq("property_id", tenancy.property_id)
        .eq("raised_by", user.id)
        .order("created_at", { ascending: false })
        .limit(5)
    : { data: null };

  if (!tenancy) {
    return (
      <div className="max-w-lg mx-auto mt-12 text-center animate-fade-in">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8">
          <Building2 className="w-10 h-10 text-ink-light/40 mx-auto mb-3" />
          <h1 className="text-h1 font-bold text-ink mb-2">No Active Tenancy</h1>
          <p className="text-body text-ink-light">
            You don&apos;t have an active tenancy. If your landlord has invited you,
            please check your email for the invitation link.
          </p>
        </div>
      </div>
    );
  }

  const property = tenancy.properties || {};
  const statusColors: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700",
    invited: "bg-blue-100 text-blue-700",
    ending: "bg-amber-100 text-amber-700",
  };
  const paymentStatusColors: Record<string, string> = {
    paid: "bg-emerald-100 text-emerald-700",
    partial: "bg-amber-100 text-amber-700",
    pending: "bg-gray-100 text-gray-600",
    overdue: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-h1 font-bold text-ink">My Tenancy</h1>
        <p className="text-body text-ink-light mt-1">
          {property.name} {property.city ? `· ${property.city}` : ""}
        </p>
      </div>

      {/* Property & Tenancy Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-propblue-light rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-propblue" />
            </div>
            <div>
              <h2 className="text-h3 font-semibold text-ink">{property.name}</h2>
              <p className="text-caption text-ink-light">
                {property.address_line1 || ""}{" "}
                {property.city ? `${property.city}, ` : ""}
                {property.country || ""}
              </p>
            </div>
          </div>
          {tenancy.unit_identifier && (
            <div className="flex justify-between text-sm py-2 border-t border-gray-50">
              <span className="text-ink-light">Unit</span>
              <span className="font-medium text-ink">{tenancy.unit_identifier}</span>
            </div>
          )}
          <div className="flex justify-between text-sm py-2 border-t border-gray-50">
            <span className="text-ink-light">Status</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[tenancy.status] || "bg-gray-100 text-gray-600"}`}>
              {tenancy.status.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-h3 font-semibold text-ink">Rent Details</h2>
            </div>
          </div>
          <div className="flex justify-between text-sm py-2 border-t border-gray-50">
            <span className="text-ink-light">Monthly Rent</span>
            <span className="font-semibold text-ink">
              {formatCurrency(tenancy.monthly_rent, tenancy.currency)}
            </span>
          </div>
          <div className="flex justify-between text-sm py-2 border-t border-gray-50">
            <span className="text-ink-light">Due Day</span>
            <span className="font-medium text-ink">{tenancy.rent_due_day}th of every month</span>
          </div>
          <div className="flex justify-between text-sm py-2 border-t border-gray-50">
            <span className="text-ink-light">Security Deposit</span>
            <span className="font-medium text-ink">
              {formatCurrency(tenancy.security_deposit || 0, tenancy.currency)}
            </span>
          </div>
          {tenancy.agreement_start_date && (
            <div className="flex justify-between text-sm py-2 border-t border-gray-50">
              <span className="text-ink-light">Agreement</span>
              <span className="font-medium text-ink flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {tenancy.agreement_start_date} — {tenancy.agreement_end_date || "Ongoing"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Recent Payments */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-h2 font-semibold text-ink">Recent Payments</h2>
          <Link href="/payments" className="text-sm font-medium text-propblue">View All</Link>
        </div>
        {(!payments || payments.length === 0) ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 text-center">
            <p className="text-sm text-ink-light">No payment records yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {payments.map((p) => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-card flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink">{p.payment_month}</p>
                  <p className="text-caption text-ink-light">
                    Due: {formatCurrency(p.amount_due, tenancy.currency)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-ink">
                    {formatCurrency(p.amount_paid || 0, tenancy.currency)}
                  </p>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${paymentStatusColors[p.status] || "bg-gray-100 text-gray-600"}`}>
                    {p.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Maintenance Requests */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-h2 font-semibold text-ink">My Requests</h2>
          <Link
            href="/maintenance/new"
            className="flex items-center gap-1 text-sm font-medium text-propblue"
          >
            <Wrench className="w-3.5 h-3.5" /> New Request
          </Link>
        </div>
        {(!maintenanceRequests || maintenanceRequests.length === 0) ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 text-center">
            <p className="text-sm text-ink-light">No maintenance requests.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {maintenanceRequests.map((r) => (
              <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-ink">{r.title}</p>
                    <p className="text-caption text-ink-light mt-0.5">
                      {r.category ? r.category.replace(/_/g, " ") : "General"} · {r.priority}
                    </p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    r.status === "resolved" ? "bg-emerald-100 text-emerald-700" :
                    r.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                    r.status === "open" ? "bg-amber-100 text-amber-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {r.status.replace(/_/g, " ").toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/documents"
          className="bg-white rounded-2xl border border-gray-100 p-4 shadow-card hover:shadow-card-hover transition-all flex items-center gap-3"
        >
          <FileText className="w-5 h-5 text-propblue" />
          <span className="text-sm font-medium text-ink">View Documents</span>
        </Link>
        <Link
          href="/maintenance/new"
          className="bg-white rounded-2xl border border-gray-100 p-4 shadow-card hover:shadow-card-hover transition-all flex items-center gap-3"
        >
          <Wrench className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-medium text-ink">Report Issue</span>
        </Link>
      </div>
    </div>
  );
}
