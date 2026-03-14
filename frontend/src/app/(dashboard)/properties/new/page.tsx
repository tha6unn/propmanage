"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PROPERTY_TYPES, PROPERTY_STATUSES } from "@/config/constants";

export default function NewPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    const propertyData = {
      owner_id: user.id,
      name: formData.get("name") as string,
      address_line1: formData.get("address_line1") as string || null,
      address_line2: formData.get("address_line2") as string || null,
      city: formData.get("city") as string || null,
      state_province: formData.get("state_province") as string || null,
      country: formData.get("country") as string || "IN",
      postal_code: formData.get("postal_code") as string || null,
      property_type: formData.get("property_type") as string || null,
      status: formData.get("status") as string || "vacant",
      total_units: parseInt(formData.get("total_units") as string) || 1,
      year_built: formData.get("year_built") ? parseInt(formData.get("year_built") as string) : null,
      area_sqft: formData.get("area_sqft") ? parseFloat(formData.get("area_sqft") as string) : null,
      notes: formData.get("notes") as string || null,
    };

    const { error: insertError } = await supabase
      .from("properties")
      .insert(propertyData);

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/properties");
    router.refresh();
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/properties"
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-ink-light" />
        </Link>
        <div>
          <h1 className="text-h1 font-bold text-ink">Add Property</h1>
          <p className="text-body text-ink-light mt-0.5">Fill in the property details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 space-y-5">
        {/* Name */}
        <div>
          <label className="block text-label text-ink-medium mb-1.5">Property Name *</label>
          <input
            type="text"
            name="name"
            required
            placeholder="e.g., Sunrise Apartments - 3B"
            className="w-full px-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue focus:ring-2 focus:ring-propblue/10"
          />
        </div>

        {/* Type & Status Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-label text-ink-medium mb-1.5">Type</label>
            <select
              name="property_type"
              className="w-full px-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue"
            >
              <option value="">Select type</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-label text-ink-medium mb-1.5">Status</label>
            <select
              name="status"
              defaultValue="vacant"
              className="w-full px-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue"
            >
              {PROPERTY_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-label text-ink-medium mb-1.5">Address Line 1</label>
          <input
            type="text"
            name="address_line1"
            placeholder="Street address"
            className="w-full px-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue focus:ring-2 focus:ring-propblue/10"
          />
        </div>

        <div>
          <label className="block text-label text-ink-medium mb-1.5">Address Line 2</label>
          <input
            type="text"
            name="address_line2"
            placeholder="Apartment, floor, etc."
            className="w-full px-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue focus:ring-2 focus:ring-propblue/10"
          />
        </div>

        {/* City, State, Country Row */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-label text-ink-medium mb-1.5">City</label>
            <input
              type="text"
              name="city"
              placeholder="Chennai"
              className="w-full px-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue"
            />
          </div>
          <div>
            <label className="block text-label text-ink-medium mb-1.5">State</label>
            <input
              type="text"
              name="state_province"
              placeholder="Tamil Nadu"
              className="w-full px-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue"
            />
          </div>
          <div>
            <label className="block text-label text-ink-medium mb-1.5">Country</label>
            <select
              name="country"
              defaultValue="IN"
              className="w-full px-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue"
            >
              <option value="IN">India</option>
              <option value="AE">UAE</option>
              <option value="GB">UK</option>
              <option value="US">USA</option>
              <option value="SG">Singapore</option>
              <option value="DE">Germany</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-label text-ink-medium mb-1.5">Postal Code</label>
          <input
            type="text"
            name="postal_code"
            placeholder="600001"
            className="w-full px-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue"
          />
        </div>

        {/* Details Row */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-label text-ink-medium mb-1.5">Total Units</label>
            <input
              type="number"
              name="total_units"
              defaultValue="1"
              min="1"
              className="w-full px-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue"
            />
          </div>
          <div>
            <label className="block text-label text-ink-medium mb-1.5">Year Built</label>
            <input
              type="number"
              name="year_built"
              placeholder="2020"
              className="w-full px-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue"
            />
          </div>
          <div>
            <label className="block text-label text-ink-medium mb-1.5">Area (sqft)</label>
            <input
              type="number"
              name="area_sqft"
              placeholder="1200"
              className="w-full px-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-label text-ink-medium mb-1.5">Notes</label>
          <textarea
            name="notes"
            rows={3}
            placeholder="Any additional notes about this property..."
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
            href="/properties"
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
                <Building2 className="w-4 h-4" />
                Create Property
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
