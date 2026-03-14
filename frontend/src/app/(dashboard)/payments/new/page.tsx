"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type TenancyOption = {
  id: string;
  property_id: string;
  unit_identifier: string | null;
  tenant_invite_email: string | null;
  monthly_rent: number;
  properties: { name: string } | null;
};

const PAYMENT_METHODS = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "upi", label: "UPI" },
  { value: "cash", label: "Cash" },
  { value: "cheque", label: "Cheque" },
  { value: "card", label: "Card" },
  { value: "other", label: "Other" },
];

export default function RecordPaymentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tenancies, setTenancies] = useState<TenancyOption[]>([]);
  const [selectedTenancy, setSelectedTenancy] = useState<TenancyOption | null>(null);

  useEffect(() => {
    async function fetchTenancies() {
      const supabase = createClient();
      const { data } = await supabase
        .from("tenancies")
        .select("id, property_id, unit_identifier, tenant_invite_email, monthly_rent, properties(name)")
        .in("status", ["active", "invited"])
        .order("created_at", { ascending: false });
      setTenancies((data as unknown as TenancyOption[]) || []);
    }
    fetchTenancies();
  }, []);

  const handleTenancyChange = (tenancyId: string) => {
    const t = tenancies.find((x) => x.id === tenancyId);
    setSelectedTenancy(t || null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be logged in");
      setLoading(false);
      return;
    }

    const tenancyId = formData.get("tenancy_id") as string;
    const tenancy = tenancies.find((t) => t.id === tenancyId);

    if (!tenancy) {
      setError("Please select a tenancy");
      setLoading(false);
      return;
    }

    const paymentData = {
      tenancy_id: tenancyId,
      property_id: tenancy.property_id,
      owner_id: user.id,
      payment_month: formData.get("payment_month") as string,
      amount_due: parseFloat(formData.get("amount_due") as string),
      amount_paid: parseFloat(formData.get("amount_paid") as string),
      payment_date: (formData.get("payment_date") as string) || null,
      payment_method: (formData.get("payment_method") as string) || null,
      transaction_reference: (formData.get("transaction_reference") as string) || null,
      notes: (formData.get("notes") as string) || null,
      status: "paid",
    };

    // Determine status based on amounts
    if (paymentData.amount_paid >= paymentData.amount_due) {
      paymentData.status = "paid";
    } else if (paymentData.amount_paid > 0) {
      paymentData.status = "partial";
    } else {
      paymentData.status = "pending";
    }

    const { error: insertError } = await supabase
      .from("rent_payments")
      .insert(paymentData);

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/payments");
    router.refresh();
  };

  // Derive a label for the current month
  const currentMonth = new Date().toISOString().slice(0, 7) + "-01";

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/payments"
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-ink-light" />
        </Link>
        <div>
          <h1 className="text-h1 font-bold text-ink">Record Payment</h1>
          <p className="text-body text-ink-light mt-0.5">Log a rent payment for a tenancy</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 space-y-5">
        {/* Tenancy Selection */}
        <div>
          <label className="block text-label text-ink-medium mb-1.5">Tenancy *</label>
          <select
            name="tenancy_id"
            required
            onChange={(e) => handleTenancyChange(e.target.value)}
            className="w-full px-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue"
          >
            <option value="">Select tenancy</option>
            {tenancies.map((t) => (
              <option key={t.id} value={t.id}>
                {t.properties?.name || "Property"} — {t.unit_identifier || t.tenant_invite_email || "Unit"}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Month */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-label text-ink-medium mb-1.5">Payment Month *</label>
            <input
              type="date"
              name="payment_month"
              required
              defaultValue={currentMonth}
              className="w-full px-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue"
            />
          </div>
          <div>
            <label className="block text-label text-ink-medium mb-1.5">Payment Date</label>
            <input
              type="date"
              name="payment_date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              className="w-full px-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue"
            />
          </div>
        </div>

        {/* Amounts */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-label text-ink-medium mb-1.5">Amount Due *</label>
            <input
              type="number"
              name="amount_due"
              required
              min="0"
              step="0.01"
              defaultValue={selectedTenancy?.monthly_rent || ""}
              placeholder="25000"
              className="w-full px-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue"
            />
          </div>
          <div>
            <label className="block text-label text-ink-medium mb-1.5">Amount Paid *</label>
            <input
              type="number"
              name="amount_paid"
              required
              min="0"
              step="0.01"
              defaultValue={selectedTenancy?.monthly_rent || ""}
              placeholder="25000"
              className="w-full px-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue"
            />
          </div>
        </div>

        {/* Payment Method & Reference */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-label text-ink-medium mb-1.5">Payment Method</label>
            <select
              name="payment_method"
              className="w-full px-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue"
            >
              <option value="">Select method</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-label text-ink-medium mb-1.5">Transaction Reference</label>
            <input
              type="text"
              name="transaction_reference"
              placeholder="UPI Ref / Cheque No."
              className="w-full px-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue focus:ring-2 focus:ring-propblue/10"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-label text-ink-medium mb-1.5">Notes</label>
          <textarea
            name="notes"
            rows={2}
            placeholder="Any additional notes..."
            className="w-full px-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue focus:ring-2 focus:ring-propblue/10 resize-none"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/payments"
            className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-ink-medium hover:bg-surface transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-propblue hover:bg-propblue-dark text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Recording...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                Record Payment
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
