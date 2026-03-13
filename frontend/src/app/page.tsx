import Link from "next/link";
import {
  Building2,
  FileText,
  Users,
  Banknote,
  MessageSquare,
  ArrowRight,
  Shield,
  Zap,
  Globe,
  ChevronRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-propblue rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-ink">PropManage</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-ink-light hover:text-ink transition-colors text-sm font-medium">
                Features
              </a>
              <a href="#how-it-works" className="text-ink-light hover:text-ink transition-colors text-sm font-medium">
                How it Works
              </a>
              <a href="#pricing" className="text-ink-light hover:text-ink transition-colors text-sm font-medium">
                Pricing
              </a>
            </nav>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-ink-medium hover:text-ink transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-propblue hover:bg-propblue-dark text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 hover:shadow-glow active:scale-[0.98]"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-propblue-light via-white to-white" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-propblue/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-propblue-light text-propblue text-sm font-medium px-4 py-1.5 rounded-full mb-8 animate-fade-in">
              <Zap className="w-4 h-4" />
              AI-Powered Property Intelligence
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-ink leading-tight mb-6 animate-slide-up">
              Your properties.{" "}
              <span className="text-propblue">Always in order.</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-ink-light max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "100ms" }}>
              The intelligent co-pilot for property owners. Manage documents,
              track rent, coordinate tenants — all from your phone. Powered by
              AI that understands your actual documents.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "200ms" }}>
              <Link
                href="/register"
                className="w-full sm:w-auto bg-propblue hover:bg-propblue-dark text-white text-base font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 hover:shadow-glow active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Start Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto border-2 border-propblue text-propblue text-base font-semibold px-8 py-3.5 rounded-xl hover:bg-propblue-light transition-all duration-200 text-center"
              >
                See How It Works
              </a>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-6 mt-12 text-sm text-ink-light animate-fade-in" style={{ animationDelay: "400ms" }}>
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-sage" />
                Bank-grade encryption
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-propblue" />
                Global coverage
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber" />
                AI-powered
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-gray-100 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "10K+", label: "Properties Managed" },
              { value: "500+", label: "Active Owners" },
              { value: "8", label: "Languages" },
              { value: "99.9%", label: "Uptime" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-propblue mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-ink-light">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-ink mb-4">
              Everything you need to manage properties
            </h2>
            <p className="text-lg text-ink-light max-w-2xl mx-auto">
              From document vaults to AI-powered insights — one platform for
              your entire portfolio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Building2,
                title: "Portfolio Dashboard",
                desc: "See all your properties at a glance. Occupancy rates, income summaries, and overdue alerts — real-time.",
                color: "bg-propblue-light text-propblue",
              },
              {
                icon: FileText,
                title: "Document Vault",
                desc: "Upload, OCR, and search any document. Set expiry alerts. Never lose a sale deed or agreement again.",
                color: "bg-emerald-50 text-sage",
              },
              {
                icon: Users,
                title: "Tenant Management",
                desc: "Invite tenants, track agreements, manage the full lifecycle from active to archived.",
                color: "bg-violet-50 text-violet",
              },
              {
                icon: Banknote,
                title: "Rent Tracking",
                desc: "Auto-generated rent entries, payment logging, overdue flagging. Multi-currency support.",
                color: "bg-amber-50 text-amber",
              },
              {
                icon: MessageSquare,
                title: "AI Agent",
                desc: '"Who owes me rent this month?" Ask your AI assistant that reads your actual documents.',
                color: "bg-blue-50 text-blue-600",
              },
              {
                icon: Shield,
                title: "Role-Based Access",
                desc: "Owner, Manager, Tenant — each sees only what they should. Bank-grade security.",
                color: "bg-red-50 text-crimson",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group relative bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-card-hover hover:border-propblue/20 transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4`}
                >
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-ink mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-ink-light leading-relaxed">
                  {feature.desc}
                </p>
                <ChevronRight className="w-5 h-5 text-ink-light/0 group-hover:text-propblue absolute top-6 right-6 transition-all duration-300 group-hover:translate-x-1" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-propblue to-propblue-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to take control of your properties?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Join thousands of property owners who manage smarter with PropManage.
            Free for up to 3 properties.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-propblue font-semibold text-base px-8 py-3.5 rounded-xl hover:bg-gray-50 transition-all duration-200 active:scale-[0.98]"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-propblue rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">PropManage</span>
            </div>
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} PropManage. Property intelligence,
              finally.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
