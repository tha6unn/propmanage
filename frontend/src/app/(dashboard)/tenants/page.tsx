import { Users, Mail, Phone, Calendar, Building2, Plus } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getTenancies, type Tenancy } from "@/lib/queries";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "badge-occupied",
    invited: "badge-pending",
    ending: "badge-overdue",
    ended: "bg-gray-100 text-gray-500 text-[12px] font-semibold px-2 py-0.5 rounded-[6px]",
    archived: "bg-gray-100 text-gray-500 text-[12px] font-semibold px-2 py-0.5 rounded-[6px]",
  };
  return (
    <span className={styles[status] || "badge-pending"}>
      {status.toUpperCase()}
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

export default async function TenantsPage() {
  const supabase = await createClient();
  const tenancies = await getTenancies(supabase);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-bold text-ink">Tenants</h1>
          <p className="text-body text-ink-light mt-1">
            {tenancies.length} tenancies
          </p>
        </div>
        <Link
          href="/tenants/new"
          className="flex items-center gap-2 bg-propblue hover:bg-propblue-dark text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Tenancy</span>
        </Link>
      </div>

      {/* Tenancies List */}
      {tenancies.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-card">
          <Users className="w-10 h-10 text-ink-light/40 mx-auto mb-3" />
          <p className="text-body font-medium text-ink mb-1">No tenants yet</p>
          <p className="text-caption text-ink-light">
            Add a tenancy from a property&apos;s detail page to get started
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tenancies.map((tenancy: Tenancy, i: number) => (
            <div
              key={tenancy.id}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card hover:shadow-card-hover transition-all duration-200 animate-slide-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-violet" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-h3 font-semibold text-ink">
                        {tenancy.tenant_invite_email || tenancy.unit_identifier || "Tenant"}
                      </h3>
                      <StatusBadge status={tenancy.status} />
                    </div>

                    <div className="flex items-center gap-1 text-caption text-ink-light mb-2">
                      <Building2 className="w-3 h-3" />
                      {tenancy.properties?.name || "—"}
                      {tenancy.properties?.city && ` · ${tenancy.properties.city}`}
                    </div>

                    <div className="flex items-center gap-4 text-caption text-ink-light">
                      {tenancy.tenant_invite_email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {tenancy.tenant_invite_email}
                        </div>
                      )}
                      {tenancy.tenant_invite_phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {tenancy.tenant_invite_phone}
                        </div>
                      )}
                      {tenancy.agreement_start_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(tenancy.agreement_start_date).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                          {tenancy.agreement_end_date && (
                            <> — {new Date(tenancy.agreement_end_date).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-body-lg font-semibold text-ink">
                    {formatCurrency(tenancy.monthly_rent, tenancy.currency)}
                  </div>
                  <div className="text-caption text-ink-light">/month</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
