import {
  Building2,
  TrendingUp,
  AlertCircle,
  DoorOpen,
  Plus,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

// Mock data for initial scaffold — will be replaced with API calls
const portfolioStats = {
  totalProperties: 12,
  occupiedUnits: 9,
  vacantUnits: 3,
  monthlyIncome: 285000,
  overduePayments: 3,
  expiringDocs: 2,
};

const recentProperties = [
  {
    id: "1",
    name: "Sunrise Apartments - 3B",
    city: "Chennai",
    status: "occupied" as const,
    monthlyRent: 22500,
    tenantName: "Ravi Kumar",
  },
  {
    id: "2",
    name: "Lakshmi Residency - 7A",
    city: "Coimbatore",
    status: "occupied" as const,
    monthlyRent: 18000,
    tenantName: "Lakshmi Devi",
  },
  {
    id: "3",
    name: "Green Valley Plot",
    city: "Chennai",
    status: "vacant" as const,
    monthlyRent: 0,
    tenantName: null,
  },
  {
    id: "4",
    name: "Tech Park - Shop 2",
    city: "Bangalore",
    status: "occupied" as const,
    monthlyRent: 35000,
    tenantName: "ABC Enterprises",
  },
];

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    occupied: "badge-occupied",
    vacant: "badge-vacant",
    under_maintenance: "badge-pending",
    listed: "badge-pending",
    overdue: "badge-overdue",
    paid: "badge-paid",
    pending: "badge-pending",
  };
  return (
    <span className={styles[status] || "badge-pending"}>
      {status.replace("_", " ").toUpperCase()}
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

export default function PortfolioPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-bold text-ink">Portfolio</h1>
          <p className="text-body text-ink-light mt-1">
            {portfolioStats.totalProperties} properties · {portfolioStats.occupiedUnits} occupied
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
          <div className="text-2xl font-bold text-ink">{portfolioStats.totalProperties}</div>
          <div className="text-caption text-ink-light">Total Properties</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-sage" />
            </div>
          </div>
          <div className="text-2xl font-bold text-ink">
            {formatCurrency(portfolioStats.monthlyIncome)}
          </div>
          <div className="text-caption text-ink-light">Monthly Income</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-amber" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber">{portfolioStats.overduePayments}</div>
          <div className="text-caption text-ink-light">Overdue Payments</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center">
              <DoorOpen className="w-4 h-4 text-violet" />
            </div>
          </div>
          <div className="text-2xl font-bold text-violet">{portfolioStats.vacantUnits}</div>
          <div className="text-caption text-ink-light">Vacant Units</div>
        </div>
      </div>

      {/* Alert Cards */}
      {portfolioStats.overduePayments > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card status-card-overdue p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-crimson" />
              <div>
                <p className="text-sm font-semibold text-ink">
                  {portfolioStats.overduePayments} overdue payments
                </p>
                <p className="text-caption text-ink-light">
                  Total outstanding: {formatCurrency(75500)}
                </p>
              </div>
            </div>
            <Link href="/payments?status=overdue" className="text-sm font-medium text-propblue">
              View All
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

        <div className="space-y-3">
          {recentProperties.map((property, i) => (
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
                  <p className="text-caption text-ink-light">{property.city}</p>
                  {property.tenantName && (
                    <p className="text-body text-ink-medium mt-2">
                      Tenant: {property.tenantName}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  {property.monthlyRent > 0 && (
                    <div className="text-body-lg font-semibold text-ink">
                      {formatCurrency(property.monthlyRent)}
                    </div>
                  )}
                  <div className="text-caption text-ink-light">/month</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
