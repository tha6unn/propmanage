"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, Loader2, CheckCircle, AlertCircle, User, Lock, Phone } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

type InviteDetails = {
  email: string;
  role: string;
  valid: boolean;
  invited_by_name?: string;
  property_name?: string;
  property_location?: string;
  unit?: string;
  monthly_rent?: number;
  currency?: string;
  agreement_start?: string;
  agreement_end?: string;
  property_names?: string[];
};

function InviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [details, setDetails] = useState<InviteDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [existingUser, setExistingUser] = useState(false);

  useEffect(() => {
    async function fetchDetails() {
      if (!token) {
        setError("No invitation token provided.");
        setLoading(false);
        return;
      }
      try {
        const res = await api.getInviteDetails(token);
        setDetails(res.data);
      } catch {
        setError("This invitation link is invalid or has expired.");
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const full_name = formData.get("full_name") as string;
    const password = formData.get("password") as string;
    const phone = (formData.get("phone") as string) || undefined;

    try {
      const isManager = details?.role === "manager";
      const acceptFn = isManager ? api.acceptManagerInvite.bind(api) : api.acceptInvite.bind(api);

      const result = await acceptFn({
        token: token!,
        full_name,
        password,
        phone,
      });

      if (result.data.existing_user) {
        setExistingUser(true);
      }
      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to accept invitation";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-propblue mx-auto mb-3" />
          <p className="text-sm text-ink-light">Loading invitation details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !details) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 shadow-card p-8 text-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-h2 font-bold text-ink mb-2">Invalid Invitation</h2>
          <p className="text-body text-ink-light mb-6">{error}</p>
          <Link href="/login" className="text-sm font-medium text-propblue hover:underline">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 shadow-card p-8 text-center animate-fade-in">
          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-emerald-600" />
          </div>
          <h2 className="text-h2 font-bold text-ink mb-2">
            {existingUser ? "Access Granted!" : "Account Created!"}
          </h2>
          <p className="text-body text-ink-light mb-6">
            {existingUser
              ? "Your access has been updated. Please log in to continue."
              : "Your account has been created successfully. Log in to access your dashboard."}
          </p>
          <button
            onClick={() => router.push("/login")}
            className="inline-flex items-center gap-2 bg-propblue hover:bg-propblue-dark text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Invite details + registration form
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2.5 mb-4">
            <div className="w-10 h-10 bg-propblue rounded-xl flex items-center justify-center shadow-glow">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-ink">PropManage</span>
          </div>
          <h1 className="text-2xl font-bold text-ink">You&apos;re Invited!</h1>
          <p className="text-body text-ink-light mt-1">
            {details?.invited_by_name
              ? `${details.invited_by_name} has invited you as a ${details.role}`
              : `You've been invited as a ${details?.role}`}
          </p>
        </div>

        {/* Invite Details Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
          {details?.role === "tenant" && details.property_name && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-ink-light">Property</span>
                <span className="font-semibold text-ink">{details.property_name}</span>
              </div>
              {details.unit && (
                <div className="flex justify-between text-sm">
                  <span className="text-ink-light">Unit</span>
                  <span className="font-medium text-ink">{details.unit}</span>
                </div>
              )}
              {details.monthly_rent !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-ink-light">Monthly Rent</span>
                  <span className="font-semibold text-ink">
                    {details.currency} {details.monthly_rent?.toLocaleString()}
                  </span>
                </div>
              )}
              {details.property_location && (
                <div className="flex justify-between text-sm">
                  <span className="text-ink-light">Location</span>
                  <span className="font-medium text-ink">{details.property_location}</span>
                </div>
              )}
            </div>
          )}

          {details?.role === "manager" && details.property_names && (
            <div>
              <p className="text-sm text-ink-light mb-2">Assigned Properties:</p>
              <ul className="space-y-1">
                {details.property_names.map((name, i) => (
                  <li key={i} className="text-sm font-medium text-ink flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-propblue" />
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Registration Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 space-y-4"
        >
          <h3 className="text-lg font-semibold text-ink">Create Your Account</h3>
          <p className="text-caption text-ink-light -mt-2">
            for <strong>{details?.email}</strong>
          </p>

          <div>
            <label className="block text-label text-ink-medium mb-1.5">Full Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-light" />
              <input
                type="text"
                name="full_name"
                required
                placeholder="Your full name"
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue focus:ring-2 focus:ring-propblue/10"
              />
            </div>
          </div>

          <div>
            <label className="block text-label text-ink-medium mb-1.5">Password *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-light" />
              <input
                type="password"
                name="password"
                required
                minLength={6}
                placeholder="Create a password (min 6 characters)"
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue focus:ring-2 focus:ring-propblue/10"
              />
            </div>
          </div>

          <div>
            <label className="block text-label text-ink-medium mb-1.5">Phone (Optional)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-light" />
              <input
                type="tel"
                name="phone"
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue focus:ring-2 focus:ring-propblue/10"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-propblue hover:bg-propblue-dark text-white text-sm font-semibold py-3 rounded-xl transition-all active:scale-[0.98] disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Accept & Create Account"
            )}
          </button>

          <p className="text-center text-caption text-ink-light">
            Already have an account?{" "}
            <Link href="/login" className="text-propblue font-medium hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-propblue" />
        </div>
      }
    >
      <InviteContent />
    </Suspense>
  );
}
