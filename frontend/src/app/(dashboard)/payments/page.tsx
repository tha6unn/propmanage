import { Banknote, TrendingUp, AlertCircle, Download } from "lucide-react";

export default function PaymentsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-bold text-ink">Payments</h1>
          <p className="text-body text-ink-light mt-1">Track rent and payments</p>
        </div>
        <button className="flex items-center gap-2 text-sm font-medium text-propblue hover:text-propblue-dark transition-colors">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-card">
          <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center mb-2">
            <TrendingUp className="w-4 h-4 text-sage" />
          </div>
          <div className="text-xl font-bold text-ink">₹2,85,000</div>
          <div className="text-caption text-ink-light">Collected</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-card">
          <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center mb-2">
            <AlertCircle className="w-4 h-4 text-amber" />
          </div>
          <div className="text-xl font-bold text-amber">₹75,500</div>
          <div className="text-caption text-ink-light">Outstanding</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-card">
          <div className="w-8 h-8 bg-propblue-light rounded-lg flex items-center justify-center mb-2">
            <Banknote className="w-4 h-4 text-propblue" />
          </div>
          <div className="text-xl font-bold text-ink">₹3,60,500</div>
          <div className="text-caption text-ink-light">Total Due</div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-card">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
          <Banknote className="w-8 h-8 text-amber" />
        </div>
        <h3 className="text-h3 font-semibold text-ink mb-1">No payments recorded</h3>
        <p className="text-body text-ink-light">
          Payment records will appear here once tenancies are active.
        </p>
      </div>
    </div>
  );
}
