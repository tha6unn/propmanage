import {
  Building2,
  TrendingUp,
  AlertCircle,
  DoorOpen,
  Plus,
  ChevronRight,
  FileWarning,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPortfolioStats, getRecentProperties, type Property } from "@/lib/queries";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    occupied: "badge-occupied",
    vacant: "badge-vacant",
    under_maintenance: "badge-pending",
    listed: "badge-pending",
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

export default async function PortfolioPage() {
  const supabase = await createClient();
  const stats = await getPortfolioStats(supabase);
  const properties = await getRecentProperties(supabase, 6);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-bold text-ink">Portfolio</h1>
          <p className="text-body text-ink-light mt-1">
            {stats.totalProperties} properties · {stats.occupiedUnits} occupied
          </p>
        </div>
        <Link
          href="/properties/new"
          className="flex items-center gap-2 bg-propblue hover:bg-propblue-dark text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Property</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-propblue-light rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-propblue" />
            </div>
          </div>
          <div className="text-2xl font-bold text-ink">{stats.totalProperties}</div>
          <div className="text-caption text-ink-light">Total Properties</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-sage" />
            </div>
          </div>
          <div className="text-2xl font-bold text-ink">
            {formatCurrency(stats.monthlyIncome)}
          </div>
          <div className="text-caption text-ink-light">Monthly Income</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-amber" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber">{stats.overduePayments}</div>
          <div className="text-caption text-ink-light">Overdue Payments</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center">
              <DoorOpen className="w-4 h-4 text-violet" />
            </div>
          </div>
          <div className="text-2xl font-bold text-violet">{stats.vacantUnits}</div>
          <div className="text-caption text-ink-light">Vacant Units</div>
        </div>
      </div>

      {/* Alert Cards */}
      {stats.overduePayments > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card status-card-overdue p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-crimson" />
              <div>
                <p className="text-sm font-semibold text-ink">
                  {stats.overduePayments} overdue payment{stats.overduePayments > 1 ? "s" : ""}
                </p>
                <p className="text-caption text-ink-light">
                  Total outstanding: {formatCurrency(stats.overdueAmount)}
                </p>
              </div>
            </div>
            <Link href="/payments?status=overdue" className="text-sm font-medium text-propblue">
              View All
            </Link>
          </div>
        </div>
      )}

      {stats.expiringDocs > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card border-l-4 border-l-amber p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileWarning className="w-5 h-5 text-amber" />
              <div>
                <p className="text-sm font-semibold text-ink">
                  {stats.expiringDocs} document{stats.expiringDocs > 1 ? "s" : ""} expiring soon
                </p>
                <p className="text-caption text-ink-light">Within the next 30 days</p>
              </div>
            </div>
            <Link href="/documents" className="text-sm font-medium text-propblue">
              View
            </Link>
          </div>
        </div>
      )}

      {/* Properties List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h2 font-semibold text-ink">Properties</h2>
          <Link href="/properties" className="text-sm font-medium text-propblue flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {properties.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-card">
            <Building2 className="w-10 h-10 text-ink-light/40 mx-auto mb-3" />
            <p className="text-body font-medium text-ink mb-1">No properties yet</p>
            <p className="text-caption text-ink-light mb-4">
              Add your first property to get started
            </p>
            <Link
              href="/properties/new"
              className="inline-flex items-center gap-2 bg-propblue hover:bg-propblue-dark text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Property
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {properties.map((property: Property, i: number) => (
              <Link
                key={property.id}
                href={`/properties/${property.id}`}
                className="block bg-white rounded-2xl border border-gray-100 p-4 shadow-card hover:shadow-card-hover hover:border-propblue/20 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-h3 font-semibold text-ink">
                        {property.name}
                      </h3>
                      <StatusBadge status={property.status} />
                    </div>
                    <p className="text-caption text-ink-light">
                      {[property.city, property.country].filter(Boolean).join(", ")}
                    </p>
                    {property.property_type && (
                      <p className="text-caption text-ink-light mt-1 capitalize">
                        {property.property_type.replace(/_/g, " ")}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-caption text-ink-light">
                      {property.total_units} unit{property.total_units > 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
