import { CreditCard, TrendingUp, AlertTriangle, Clock, DollarSign, Plus } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPayments, getPaymentSummary, type RentPayment } from "@/lib/queries";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: "badge-paid",
    partial: "badge-pending",
    pending: "badge-pending",
    overdue: "badge-overdue",
    waived: "bg-gray-100 text-gray-500 text-[12px] font-semibold px-2 py-0.5 rounded-[6px]",
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

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const [payments, summary] = await Promise.all([
    getPayments(supabase, { status: params.status }),
    getPaymentSummary(supabase),
  ]);

  const statusTabs = [
    { value: "", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "overdue", label: "Overdue" },
    { value: "paid", label: "Paid" },
    { value: "partial", label: "Partial" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-bold text-ink">Payments</h1>
          <p className="text-body text-ink-light mt-1">Track rent collection across all properties</p>
        </div>
        <Link
          href="/payments/new"
          className="flex items-center gap-2 bg-propblue hover:bg-propblue-dark text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Record Payment</span>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-sage" />
            </div>
          </div>
          <div className="text-2xl font-bold text-sage">{formatCurrency(summary.totalCollected)}</div>
          <div className="text-caption text-ink-light">Total Collected</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-propblue" />
            </div>
          </div>
          <div className="text-2xl font-bold text-ink">{formatCurrency(summary.totalOutstanding)}</div>
          <div className="text-caption text-ink-light">Outstanding</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-crimson" />
            </div>
          </div>
          <div className="text-2xl font-bold text-crimson">{summary.overdueCount}</div>
          <div className="text-caption text-ink-light">Overdue</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber">{formatCurrency(summary.overdueAmount)}</div>
          <div className="text-caption text-ink-light">Overdue Amount</div>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 bg-surface rounded-xl p-1">
        {statusTabs.map((tab) => (
          <Link
            key={tab.value}
            href={`/payments${tab.value ? `?status=${tab.value}` : ""}`}
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

      {/* Payment Entries */}
      {payments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-card">
          <CreditCard className="w-10 h-10 text-ink-light/40 mx-auto mb-3" />
          <p className="text-body font-medium text-ink mb-1">No payments found</p>
          <p className="text-caption text-ink-light">
            {params.status ? "Try a different filter" : "Payments appear when you create tenancies"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-6 gap-4 px-5 py-3 bg-surface text-caption text-ink-light font-medium">
            <div className="col-span-2">Property / Tenant</div>
            <div>Month</div>
            <div className="text-right">Due</div>
            <div className="text-right">Paid</div>
            <div className="text-right">Status</div>
          </div>
          <div className="divide-y divide-gray-50">
            {payments.map((payment: RentPayment, i: number) => (
              <div
                key={payment.id}
                className="grid grid-cols-1 md:grid-cols-6 gap-2 md:gap-4 px-5 py-3.5 hover:bg-surface/50 transition-colors animate-slide-up"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="col-span-2">
                  <div className="text-sm font-medium text-ink">
                    {payment.tenancies?.properties?.name || "—"}
                  </div>
                  <div className="text-caption text-ink-light">
                    {payment.tenancies?.tenant_invite_email || payment.tenancies?.unit_identifier || "—"}
                  </div>
                </div>
                <div className="text-sm text-ink">
                  {new Date(payment.payment_month).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                </div>
                <div className="text-sm text-ink text-right font-medium">
                  {formatCurrency(payment.amount_due)}
                </div>
                <div className="text-sm text-right font-medium text-sage">
                  {formatCurrency(payment.amount_paid || 0)}
                </div>
                <div className="text-right">
                  <StatusBadge status={payment.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
