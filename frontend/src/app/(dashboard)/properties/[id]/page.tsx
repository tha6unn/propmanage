import { ArrowLeft, MapPin, Users, CreditCard, FileText, Wrench, Eye, Download, Plus } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    occupied: "badge-occupied",
    vacant: "badge-vacant",
    under_maintenance: "badge-pending",
    listed: "badge-pending",
    active: "badge-occupied",
    invited: "badge-pending",
    pending: "badge-pending",
    paid: "badge-paid",
    overdue: "badge-overdue",
    open: "badge-overdue",
    resolved: "badge-paid",
  };
  return (
    <span className={styles[status] || "badge-pending"}>
      {status.replace(/_/g, " ").toUpperCase()}
    </span>
  );
}

function formatCurrency(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getDocumentViewUrl(docId: string): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  return `${apiUrl}/api/documents/${docId}/download`;
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (!property) notFound();

  // Fetch related data IN PARALLEL for speed
  const [
    { data: tenancies },
    { data: payments },
    { data: documents },
    { data: maintenance },
  ] = await Promise.all([
    supabase
      .from("tenancies")
      .select("*")
      .eq("property_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("rent_payments")
      .select("*")
      .eq("property_id", id)
      .order("payment_month", { ascending: false })
      .limit(10),
    supabase
      .from("documents")
      .select("*")
      .eq("property_id", id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("maintenance_requests")
      .select("*")
      .eq("property_id", id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link
          href="/properties"
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface transition-colors mt-1"
        >
          <ArrowLeft className="w-4 h-4 text-ink-light" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-h1 font-bold text-ink">{property.name}</h1>
            <StatusBadge status={property.status} />
          </div>
          {property.city && (
            <div className="flex items-center gap-1 text-body text-ink-light">
              <MapPin className="w-3.5 h-3.5" />
              {[property.address_line1, property.city, property.state_province, property.country].filter(Boolean).join(", ")}
            </div>
          )}
        </div>
      </div>

      {/* Property Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-card">
          <div className="text-caption text-ink-light mb-1">Type</div>
          <div className="text-sm font-medium text-ink capitalize">{property.property_type?.replace(/_/g, " ") || "—"}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-card">
          <div className="text-caption text-ink-light mb-1">Units</div>
          <div className="text-sm font-medium text-ink">{property.total_units}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-card">
          <div className="text-caption text-ink-light mb-1">Year Built</div>
          <div className="text-sm font-medium text-ink">{property.year_built || "—"}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-card">
          <div className="text-caption text-ink-light mb-1">Area</div>
          <div className="text-sm font-medium text-ink">{property.area_sqft ? `${property.area_sqft} sqft` : "—"}</div>
        </div>
      </div>

      {/* Tenancies Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-propblue" />
          <h2 className="text-h2 font-semibold text-ink">Tenancies</h2>
          <span className="text-caption text-ink-light ml-auto">{(tenancies || []).length} total</span>
        </div>
        {(tenancies || []).length === 0 ? (
          <p className="text-body text-ink-light">No tenancies for this property yet.</p>
        ) : (
          <div className="space-y-2">
            {(tenancies || []).map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <span className="text-sm font-medium text-ink">{t.tenant_invite_email || t.unit_identifier || "Tenant"}</span>
                  <StatusBadge status={t.status} />
                </div>
                <span className="text-sm font-semibold text-ink">{formatCurrency(t.monthly_rent, t.currency)}/mo</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Payments */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-sage" />
          <h2 className="text-h2 font-semibold text-ink">Recent Payments</h2>
        </div>
        {(payments || []).length === 0 ? (
          <p className="text-body text-ink-light">No payment records yet.</p>
        ) : (
          <div className="space-y-2">
            {(payments || []).slice(0, 6).map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <span className="text-sm text-ink">{new Date(p.payment_month).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>
                  <StatusBadge status={p.status} />
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-ink">{formatCurrency(p.amount_paid || 0)}</span>
                  <span className="text-caption text-ink-light"> / {formatCurrency(p.amount_due)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Documents & Maintenance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Documents — with View/Download + Upload */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-violet" />
            <h2 className="text-h3 font-semibold text-ink">Documents</h2>
            <span className="text-caption text-ink-light ml-auto">{(documents || []).length}</span>
            <Link
              href="/documents/upload"
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-propblue-light hover:bg-propblue/20 text-propblue transition-colors"
              title="Upload document for this property"
            >
              <Plus className="w-3.5 h-3.5" />
            </Link>
          </div>
          {(documents || []).length === 0 ? (
            <div className="text-center py-3">
              <p className="text-body text-ink-light mb-2">No documents yet.</p>
              <Link
                href="/documents/upload"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-propblue hover:text-propblue-dark transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Upload first document
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {(documents || []).slice(0, 5).map((d) => (
                <div key={d.id} className="flex items-center gap-2 py-1.5 group">
                  <FileText className="w-3.5 h-3.5 text-ink-light flex-shrink-0" />
                  <span className="text-sm text-ink truncate flex-1">{d.title}</span>
                  <span className="badge-pending text-[10px] flex-shrink-0">{d.category}</span>
                  {/* View & Download */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={getDocumentViewUrl(d.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-6 h-6 flex items-center justify-center rounded hover:bg-surface text-ink-light hover:text-propblue transition-colors"
                      title="View"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={getDocumentViewUrl(d.id)}
                      download
                      className="w-6 h-6 flex items-center justify-center rounded hover:bg-surface text-ink-light hover:text-sage transition-colors"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Wrench className="w-5 h-5 text-amber" />
            <h2 className="text-h3 font-semibold text-ink">Maintenance</h2>
            <span className="text-caption text-ink-light ml-auto">{(maintenance || []).length}</span>
          </div>
          {(maintenance || []).length === 0 ? (
            <p className="text-body text-ink-light">No maintenance requests.</p>
          ) : (
            <div className="space-y-2">
              {(maintenance || []).map((m) => (
                <div key={m.id} className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-ink truncate flex-1">{m.title}</span>
                  <StatusBadge status={m.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
