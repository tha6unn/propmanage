import { Users, Plus, Search } from "lucide-react";
import Link from "next/link";

export default function TenantsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-bold text-ink">Tenants</h1>
          <p className="text-body text-ink-light mt-1">Manage your tenancies</p>
        </div>
        <Link
          href="/tenants/invite"
          className="flex items-center gap-2 bg-propblue hover:bg-propblue-dark text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Invite Tenant</span>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-light" />
        <input
          type="text"
          placeholder="Search tenants..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue focus:ring-1 focus:ring-propblue/20"
        />
      </div>

      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-card">
        <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-violet" />
        </div>
        <h3 className="text-h3 font-semibold text-ink mb-1">No tenants yet</h3>
        <p className="text-body text-ink-light mb-6">
          Invite your first tenant to a property.
        </p>
        <Link
          href="/tenants/invite"
          className="bg-propblue hover:bg-propblue-dark text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all active:scale-[0.98]"
        >
          Invite Tenant
        </Link>
      </div>
    </div>
  );
}
