import { Building2, Wrench, MapPin, ChevronRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    occupied: "bg-emerald-100 text-emerald-700",
    vacant: "bg-blue-100 text-blue-700",
    under_maintenance: "bg-amber-100 text-amber-700",
    listed: "bg-purple-100 text-purple-700",
  };
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${styles[status] || "bg-gray-100 text-gray-600"}`}>
      {status.replace(/_/g, " ").toUpperCase()}
    </span>
  );
}

export default async function AssignedPropertiesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get property access entries for this manager
  const { data: accessEntries } = await supabase
    .from("property_access")
    .select("property_id, access_level, can_see_financials, can_see_tenant_kyc")
    .eq("user_id", user.id)
    .is("revoked_at", null);

  const propertyIds = (accessEntries || []).map((a) => a.property_id);

  // Get properties
  const { data: properties } = propertyIds.length > 0
    ? await supabase
        .from("properties")
        .select("*")
        .in("id", propertyIds)
        .order("name")
    : { data: [] };

  // Get open maintenance requests count
  const { count: openMaintenance } = propertyIds.length > 0
    ? await supabase
        .from("maintenance_requests")
        .select("id", { count: "exact", head: true })
        .in("property_id", propertyIds)
        .in("status", ["open", "acknowledged", "in_progress"])
    : { count: 0 };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-h1 font-bold text-ink">Assigned Properties</h1>
        <p className="text-body text-ink-light mt-1">
          {properties?.length || 0} properties assigned to you
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-propblue-light rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-propblue" />
            </div>
          </div>
          <div className="text-2xl font-bold text-ink">{properties?.length || 0}</div>
          <div className="text-caption text-ink-light">Properties</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <Wrench className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600">{openMaintenance || 0}</div>
          <div className="text-caption text-ink-light">Open Requests</div>
        </div>
      </div>

      {/* Properties List */}
      {(!properties || properties.length === 0) ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-card">
          <Building2 className="w-10 h-10 text-ink-light/40 mx-auto mb-3" />
          <p className="text-body font-medium text-ink mb-1">No properties assigned</p>
          <p className="text-caption text-ink-light">
            Your property owner hasn&apos;t assigned you any properties yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {properties.map((property, i) => (
            <Link
              key={property.id}
              href={`/properties/${property.id}`}
              className="block bg-white rounded-2xl border border-gray-100 p-4 shadow-card hover:shadow-card-hover hover:border-propblue/20 transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-h3 font-semibold text-ink">{property.name}</h3>
                    <StatusBadge status={property.status} />
                  </div>
                  <div className="flex items-center gap-1 text-caption text-ink-light">
                    <MapPin className="w-3 h-3" />
                    {[property.city, property.country].filter(Boolean).join(", ")}
                  </div>
                  {property.property_type && (
                    <p className="text-caption text-ink-light mt-1 capitalize">
                      {property.property_type.replace(/_/g, " ")}
                    </p>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-ink-light" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
