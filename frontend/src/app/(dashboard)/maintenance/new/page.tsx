"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Wrench, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type PropertyOption = { id: string; name: string };

const CATEGORIES = [
  { value: "plumbing", label: "Plumbing" },
  { value: "electrical", label: "Electrical" },
  { value: "structural", label: "Structural" },
  { value: "appliance", label: "Appliance" },
  { value: "pest_control", label: "Pest Control" },
  { value: "cleaning", label: "Cleaning" },
  { value: "security", label: "Security" },
  { value: "other", label: "Other" },
];

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "emergency", label: "Emergency" },
];

export default function NewMaintenancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [properties, setProperties] = useState<PropertyOption[]>([]);

  useEffect(() => {
    async function fetchProperties() {
      const supabase = createClient();
      const { data } = await supabase
        .from("properties")
        .select("id, name")
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

    try {
      const { api } = await import("@/lib/api");

      await api.createMaintenanceRequest({
        property_id: formData.get("property_id") as string,
        title: formData.get("title") as string,
        description: (formData.get("description") as string) || null,
        category: (formData.get("category") as string) || null,
        priority: (formData.get("priority") as string) || "medium",
        estimated_cost: formData.get("estimated_cost")
          ? parseFloat(formData.get("estimated_cost") as string)
          : null,
      });

      router.push("/maintenance");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create request";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/maintenance"
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-ink-light" />
        </Link>
        <div>
          <h1 className="text-h1 font-bold text-ink">New Maintenance Request</h1>
          <p className="text-body text-ink-light mt-0.5">Report an issue or schedule maintenance</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 space-y-5">
        {/* Property */}
        <div>
          <label className="block text-label text-ink-medium mb-1.5">Property *</label>
          <select
            name="property_id"
            required
            className="w-full px-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue"
          >
            <option value="">Select property</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-label text-ink-medium mb-1.5">Issue Title *</label>
          <input
            type="text"
            name="title"
            required
            placeholder="e.g., Leaking tap in kitchen"
            className="w-full px-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue focus:ring-2 focus:ring-propblue/10"
          />
        </div>

        {/* Category & Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-label text-ink-medium mb-1.5">Category</label>
            <select
              name="category"
              className="w-full px-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue"
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-label text-ink-medium mb-1.5">Priority</label>
            <select
              name="priority"
              defaultValue="medium"
              className="w-full px-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue"
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-label text-ink-medium mb-1.5">Description</label>
          <textarea
            name="description"
            rows={4}
            placeholder="Describe the issue in detail..."
            className="w-full px-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue focus:ring-2 focus:ring-propblue/10 resize-none"
          />
        </div>

        {/* Cost & Vendor */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-label text-ink-medium mb-1.5">Estimated Cost (₹)</label>
            <input
              type="number"
              name="estimated_cost"
              min="0"
              step="0.01"
              placeholder="5000"
              className="w-full px-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue"
            />
          </div>
          <div>
            <label className="block text-label text-ink-medium mb-1.5">Vendor / Contractor</label>
            <input
              type="text"
              name="vendor_name"
              placeholder="Contractor name"
              className="w-full px-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue focus:ring-2 focus:ring-propblue/10"
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
            href="/maintenance"
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
                Submitting...
              </>
            ) : (
              <>
                <Wrench className="w-4 h-4" />
                Submit Request
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
