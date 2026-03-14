"use client";

import { useState, useEffect } from "react";
import { Users, Loader2, ArrowLeft, Mail, CheckCircle, Info } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type PropertyOption = { id: string; name: string; status: string };

export default function NewTenancyPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [success, setSuccess] = useState<{ email: string; property: string; inviteSent?: boolean; rentEntries?: number } | null>(null);

  useEffect(() => {
    async function fetchProperties() {
      const supabase = createClient();
      const { data } = await supabase
        .from("properties")
        .select("id, name, status")
        .order("name");
      setProperties(data || []);
    }
    fetchProperties();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const propertyId = formData.get("property_id") as string;
    const tenantEmail = (formData.get("tenant_invite_email") as string) || null;

    try {
      const { api } = await import("@/lib/api");

      const result = await api.createTenancy({
        property_id: propertyId,
        tenant_invite_email: tenantEmail,
        tenant_invite_phone: (formData.get("tenant_invite_phone") as string) || null,
        unit_identifier: (formData.get("unit_identifier") as string) || null,
        monthly_rent: parseFloat(formData.get("monthly_rent") as string),
        security_deposit: parseFloat(formData.get("security_deposit") as string) || 0,
        rent_due_day: parseInt(formData.get("rent_due_day") as string) || 1,
        agreement_start_date: (formData.get("agreement_start_date") as string) || null,
        agreement_end_date: (formData.get("agreement_end_date") as string) || null,
        currency: (formData.get("currency") as string) || "INR",
      });

      const propertyName = properties.find((p) => p.id === propertyId)?.name || "Property";
      setSuccess({
        email: tenantEmail || "",
        property: propertyName,
        inviteSent: result.invite_sent,
        rentEntries: result.rent_entries_created,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create tenancy";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (success) {
    return (
      <div className="max-w-lg mx-auto animate-fade-in mt-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8 text-center">
          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-sage" />
          </div>
          <h2 className="text-h2 font-bold text-ink mb-2">Tenancy Created!</h2>
          <p className="text-body text-ink-light mb-4">
            Tenancy for <strong>{success.property}</strong> has been created successfully.
            The property status has been updated to <strong>Occupied</strong>.
          </p>

          {success.email && (
            <div className="bg-propblue-light rounded-xl p-4 mb-4 text-left">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-propblue mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-ink">Invite Pending</p>
                  <p className="text-caption text-ink-light mt-0.5">
                    An invitation will be sent to <strong>{success.email}</strong> once
                    email notifications are enabled. For now, share the login link
                    manually with the tenant.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center gap-3 mt-6">
            <Link
              href="/tenants"
              className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-ink-medium hover:bg-surface transition-colors"
            >
              View Tenants
            </Link>
            <Link
              href="/tenants/new"
              onClick={() => setSuccess(null)}
              className="flex items-center gap-2 bg-propblue hover:bg-propblue-dark text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
            >
              <Users className="w-4 h-4" />
              Add Another
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/tenants"
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-ink-light" />
        </Link>
        <div>
          <h1 className="text-h1 font-bold text-ink">Add Tenancy</h1>
          <p className="text-body text-ink-light mt-0.5">Create a new tenant record</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-propblue-light rounded-xl p-3 mb-4 flex items-start gap-2">
        <Info className="w-4 h-4 text-propblue mt-0.5 flex-shrink-0" />
        <p className="text-caption text-propblue">
          Creating a tenancy will automatically update the property status to &quot;Occupied&quot;.
          The tenant will receive an invite via the email provided.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 space-y-5">
        {/* Property Selection */}
        <div>
          <label className="block text-label text-ink-medium mb-1.5">Property *</label>
          <select
            name="property_id"
            required
            className="w-full px-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue"
          >
            <option value="">Select property</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.status === "occupied" ? "(Occupied)" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Tenant Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-label text-ink-medium mb-1.5">Tenant Email</label>
            <input
              type="email"
              name="tenant_invite_email"
              placeholder="tenant@example.com"
              className="w-full px-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue focus:ring-2 focus:ring-propblue/10"
            />
          </div>
          <div>
            <label className="block text-label text-ink-medium mb-1.5">Tenant Phone</label>
            <input
              type="tel"
              name="tenant_invite_phone"
              placeholder="+91 98765 43210"
              className="w-full px-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue focus:ring-2 focus:ring-propblue/10"
            />
          </div>
        </div>

        {/* Unit */}
        <div>
          <label className="block text-label text-ink-medium mb-1.5">Unit Identifier</label>
          <input
            type="text"
            name="unit_identifier"
            placeholder="e.g., Flat 3B, Unit 201"
            className="w-full px-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue focus:ring-2 focus:ring-propblue/10"
          />
        </div>

        {/* Rent & Deposit */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-label text-ink-medium mb-1.5">Monthly Rent *</label>
            <input
              type="number"
              name="monthly_rent"
              required
              min="0"
              step="0.01"
              placeholder="25000"
              className="w-full px-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue"
            />
          </div>
          <div>
            <label className="block text-label text-ink-medium mb-1.5">Security Deposit</label>
            <input
              type="number"
              name="security_deposit"
              min="0"
              step="0.01"
              placeholder="50000"
              className="w-full px-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue"
            />
          </div>
          <div>
            <label className="block text-label text-ink-medium mb-1.5">Currency</label>
            <select
              name="currency"
              defaultValue="INR"
              className="w-full px-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
              <option value="AED">AED</option>
              <option value="SGD">SGD</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
        </div>

        {/* Rent Due Day & Dates */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-label text-ink-medium mb-1.5">Rent Due Day</label>
            <input
              type="number"
              name="rent_due_day"
              defaultValue="1"
              min="1"
              max="28"
              className="w-full px-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue"
            />
          </div>
          <div>
            <label className="block text-label text-ink-medium mb-1.5">Start Date</label>
            <input
              type="date"
              name="agreement_start_date"
              className="w-full px-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue"
            />
          </div>
          <div>
            <label className="block text-label text-ink-medium mb-1.5">End Date</label>
            <input
              type="date"
              name="agreement_end_date"
              className="w-full px-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue"
            />
          </div>
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
            href="/tenants"
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
                Creating...
              </>
            ) : (
              <>
                <Users className="w-4 h-4" />
                Add Tenancy
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
