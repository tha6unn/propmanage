import { Wrench, Plus } from "lucide-react";
import Link from "next/link";

export default function MaintenancePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-bold text-ink">Maintenance</h1>
          <p className="text-body text-ink-light mt-1">Track maintenance requests</p>
        </div>
        <Link
          href="/maintenance/new"
          className="flex items-center gap-2 bg-propblue hover:bg-propblue-dark text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Request</span>
        </Link>
      </div>

      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-card">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
          <Wrench className="w-8 h-8 text-amber" />
        </div>
        <h3 className="text-h3 font-semibold text-ink mb-1">No maintenance requests</h3>
        <p className="text-body text-ink-light">
          Requests will appear here when tenants or managers create them.
        </p>
      </div>
    </div>
  );
}
