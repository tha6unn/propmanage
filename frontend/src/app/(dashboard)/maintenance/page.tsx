import { Wrench, AlertCircle, Clock, CheckCircle2, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getMaintenanceRequests, type MaintenanceRequest } from "@/lib/queries";
import Link from "next/link";

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    emergency: "bg-red-100 text-crimson",
    high: "bg-orange-100 text-orange-700",
    medium: "bg-amber-50 text-amber",
    low: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md uppercase ${styles[priority] || styles.medium}`}>
      {priority}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    open: "badge-overdue",
    acknowledged: "badge-pending",
    in_progress: "badge-pending",
    resolved: "badge-paid",
    closed: "bg-gray-100 text-gray-500 text-[12px] font-semibold px-2 py-0.5 rounded-[6px]",
    rejected: "bg-gray-100 text-gray-500 text-[12px] font-semibold px-2 py-0.5 rounded-[6px]",
  };
  return (
    <span className={styles[status] || "badge-pending"}>
      {status.replace(/_/g, " ").toUpperCase()}
    </span>
  );
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "open":
      return <AlertCircle className="w-4 h-4 text-crimson" />;
    case "in_progress":
    case "acknowledged":
      return <Clock className="w-4 h-4 text-amber" />;
    case "resolved":
    case "closed":
      return <CheckCircle2 className="w-4 h-4 text-sage" />;
    default:
      return <Wrench className="w-4 h-4 text-ink-light" />;
  }
}

export default async function MaintenancePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const requests = await getMaintenanceRequests(supabase, {
    status: params.status,
  });

  const statusTabs = [
    { value: "", label: "All" },
    { value: "open", label: "Open" },
    { value: "in_progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-bold text-ink">Maintenance</h1>
          <p className="text-body text-ink-light mt-1">{requests.length} requests</p>
        </div>
        <Link
          href="/maintenance/new"
          className="flex items-center gap-2 bg-propblue hover:bg-propblue-dark text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Request</span>
        </Link>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 bg-surface rounded-xl p-1">
        {statusTabs.map((tab) => (
          <Link
            key={tab.value}
            href={`/maintenance${tab.value ? `?status=${tab.value}` : ""}`}
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

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-card">
          <Wrench className="w-10 h-10 text-ink-light/40 mx-auto mb-3" />
          <p className="text-body font-medium text-ink mb-1">No maintenance requests</p>
          <p className="text-caption text-ink-light">
            {params.status ? "No requests with this status" : "All clear! No maintenance needed."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req: MaintenanceRequest, i: number) => (
            <div
              key={req.id}
              className="bg-white rounded-xl border border-gray-100 p-4 shadow-card hover:shadow-card-hover transition-all duration-200 animate-slide-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <StatusIcon status={req.status} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-sm font-semibold text-ink">{req.title}</h3>
                    <StatusBadge status={req.status} />
                    <PriorityBadge priority={req.priority} />
                  </div>
                  <p className="text-caption text-ink-light mb-1">
                    {req.properties?.name || "—"}
                    {req.category && ` · ${req.category}`}
                  </p>
                  {req.description && (
                    <p className="text-caption text-ink-light line-clamp-2">{req.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-caption text-ink-light">
                    <span>
                      Created {new Date(req.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                    {req.estimated_cost && (
                      <span>Est. ₹{req.estimated_cost.toLocaleString()}</span>
                    )}
                    {req.vendor_name && <span>Vendor: {req.vendor_name}</span>}
                    {req.resolved_at && (
                      <span className="text-sage">
                        Resolved {new Date(req.resolved_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
