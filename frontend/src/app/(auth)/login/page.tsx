"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/portfolio";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  };

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
          <h1 className="text-h1 font-bold text-ink">Welcome back</h1>
          <p className="text-body text-ink-light mt-1">
            Sign in to manage your properties
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-label text-ink-medium">Password</label>
              <button
                type="button"
                className="text-[12px] text-propblue hover:text-propblue-dark font-medium"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-light" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-[12px] text-ink-light">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Social login placeholder */}
        <button
          type="button"
          disabled
          className="w-full border border-gray-200 text-ink-medium font-medium py-2.5 rounded-xl hover:bg-surface transition-colors text-sm opacity-50 cursor-not-allowed"
        >
          Continue with Google (coming soon)
        </button>
      </div>

      {/* Footer */}
      <p className="text-center text-sm text-ink-light mt-6">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-propblue font-semibold hover:text-propblue-dark"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="animate-pulse" />}>
      <LoginForm />
    </Suspense>
  );
}
