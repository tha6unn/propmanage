"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Eye, EyeOff, Loader2, Mail, Lock, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    // Sign up with Supabase Auth
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Create profile row
    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        email,
        full_name: fullName,
        role: "owner",
      });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        // Don't block — auth succeeded, profile can be retried
      }
    }

    // Check if email confirmation is required
    if (data.user && !data.session) {
      setSuccess(true);
      setLoading(false);
      return;
    }

    router.push("/portfolio");
    router.refresh();
  };

  if (success) {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-propblue rounded-xl flex items-center justify-center shadow-glow">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-ink">PropManage</span>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-sage" />
          </div>
          <h2 className="text-h2 font-semibold text-ink mb-2">Check your email</h2>
          <p className="text-body text-ink-light mb-6">
            We&apos;ve sent a confirmation link to{" "}
            <span className="font-medium text-ink">{email}</span>. Click it to
            activate your account.
          </p>
          <Link
            href="/login"
            className="text-propblue font-semibold hover:text-propblue-dark text-sm"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Logo */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className="w-10 h-10 bg-propblue rounded-xl flex items-center justify-center shadow-glow">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-bold text-ink">PropManage</span>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
        <div className="text-center mb-6">
          <h1 className="text-h1 font-bold text-ink">Create your account</h1>
          <p className="text-body text-ink-light mt-1">
            Start managing your properties in minutes
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-label text-ink-medium mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-light" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue focus:ring-2 focus:ring-propblue/10 transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-label text-ink-medium mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-light" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue focus:ring-2 focus:ring-propblue/10 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-label text-ink-medium mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-light" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                required
                minLength={6}
                className="w-full pl-10 pr-10 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue focus:ring-2 focus:ring-propblue/10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-light hover:text-ink"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-propblue hover:bg-propblue-dark text-white font-semibold py-2.5 rounded-xl transition-all duration-200 hover:shadow-glow active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Terms */}
        <p className="text-[11px] text-ink-light text-center mt-4">
          By creating an account, you agree to our{" "}
          <span className="text-propblue">Terms of Service</span> and{" "}
          <span className="text-propblue">Privacy Policy</span>.
        </p>
      </div>

      {/* Footer */}
      <p className="text-center text-sm text-ink-light mt-6">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-propblue font-semibold hover:text-propblue-dark"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
