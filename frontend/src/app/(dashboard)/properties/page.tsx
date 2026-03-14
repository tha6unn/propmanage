import { Building2, Plus, Search, MapPin } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProperties, type Property } from "@/lib/queries";

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

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const properties = await getProperties(supabase, {
    status: params.status,
    search: params.search,
  });

  const statusTabs = [
    { value: "", label: "All" },
    { value: "occupied", label: "Occupied" },
    { value: "vacant", label: "Vacant" },
    { value: "under_maintenance", label: "Maintenance" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-bold text-ink">Properties</h1>
          <p className="text-body text-ink-light mt-1">
            {properties.length} total properties
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <form className="relative flex-1" action="/properties">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-light" />
          <input
            type="text"
            name="search"
            defaultValue={params.search || ""}
            placeholder="Search properties..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue focus:ring-2 focus:ring-propblue/10 transition-all"
          />
          {params.status && (
            <input type="hidden" name="status" value={params.status} />
          )}
        </form>

        {/* Status Tabs */}
        <div className="flex gap-1 bg-surface rounded-xl p-1">
          {statusTabs.map((tab) => (
            <Link
              key={tab.value}
              href={`/properties${tab.value ? `?status=${tab.value}` : ""}${params.search ? `${tab.value ? "&" : "?"}search=${params.search}` : ""}`}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                (params.status || "") === tab.value
                  ? "bg-white text-propblue shadow-sm"
                  : "text-ink-light hover:text-ink"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Properties Grid */}
      {properties.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-card">
          <Building2 className="w-10 h-10 text-ink-light/40 mx-auto mb-3" />
          <p className="text-body font-medium text-ink mb-1">
            {params.search || params.status ? "No matching properties" : "No properties yet"}
          </p>
          <p className="text-caption text-ink-light mb-4">
            {params.search || params.status
              ? "Try adjusting your filters"
              : "Add your first property to get started"}
          </p>
          {!params.search && !params.status && (
            <Link
              href="/properties/new"
              className="inline-flex items-center gap-2 bg-propblue hover:bg-propblue-dark text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Property
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((property: Property, i: number) => (
            <Link
              key={property.id}
              href={`/properties/${property.id}`}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card hover:shadow-card-hover hover:border-propblue/20 transition-all duration-300 animate-slide-up group"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-propblue-light rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-propblue" />
                </div>
                <StatusBadge status={property.status} />
              </div>

              <h3 className="text-h3 font-semibold text-ink mb-1 group-hover:text-propblue transition-colors">
                {property.name}
              </h3>

              {property.city && (
                <div className="flex items-center gap-1 text-caption text-ink-light mb-2">
                  <MapPin className="w-3 h-3" />
                  {[property.city, property.country].filter(Boolean).join(", ")}
                </div>
              )}

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span className="text-caption text-ink-light capitalize">
                  {property.property_type?.replace(/_/g, " ") || "—"}
                </span>
                <span className="text-caption text-ink-medium font-medium">
                  {property.total_units} unit{property.total_units > 1 ? "s" : ""}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
