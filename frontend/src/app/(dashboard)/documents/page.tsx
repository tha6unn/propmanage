import { FileText, Plus, AlertTriangle, Download, Eye } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDocuments, type Document } from "@/lib/queries";
import { DOCUMENT_CATEGORIES } from "@/config/constants";

function CategoryBadge({ category }: { category: string }) {
  const colors: Record<string, string> = {
    ownership: "bg-propblue-light text-propblue",
    agreement: "bg-violet-50 text-violet",
    tenant_kyc: "bg-emerald-50 text-sage",
    financial: "bg-amber-50 text-amber",
    legal: "bg-red-50 text-crimson",
    insurance: "bg-blue-50 text-blue-600",
    other: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${colors[category] || colors.other}`}>
      {category.replace(/_/g, " ").toUpperCase()}
    </span>
  );
}

function isExpiringSoon(expiryDate: string | undefined | null): boolean {
  if (!expiryDate) return false;
  const exp = new Date(expiryDate);
  const now = new Date();
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  return exp >= now && exp <= thirtyDays;
}

function isExpired(expiryDate: string | undefined | null): boolean {
  if (!expiryDate) return false;
  return new Date(expiryDate) < new Date();
}

function getDocumentViewUrl(filePath: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/documents/${filePath}`;
}

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const documents = await getDocuments(supabase, { category: params.category });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-bold text-ink">Documents</h1>
          <p className="text-body text-ink-light mt-1">{documents.length} documents</p>
        </div>
        <Link
          href="/documents/upload"
          className="flex items-center gap-2 bg-propblue hover:bg-propblue-dark text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Upload</span>
        </Link>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 flex-wrap">
        <Link
          href="/documents"
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            !params.category ? "bg-propblue text-white" : "bg-surface text-ink-light hover:text-ink"
          }`}
        >
          All
        </Link>
        {DOCUMENT_CATEGORIES.map((cat) => (
          <Link
            key={cat.value}
            href={`/documents?category=${cat.value}`}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              params.category === cat.value
                ? "bg-propblue text-white"
                : "bg-surface text-ink-light hover:text-ink"
            }`}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      {/* Documents List */}
      {documents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-card">
          <FileText className="w-10 h-10 text-ink-light/40 mx-auto mb-3" />
          <p className="text-body font-medium text-ink mb-1">No documents found</p>
          <p className="text-caption text-ink-light mb-4">Upload your property documents to get started</p>
          <Link
            href="/documents/upload"
            className="inline-flex items-center gap-2 bg-propblue hover:bg-propblue-dark text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            Upload Document
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc: Document, i: number) => (
            <div
              key={doc.id}
              className="bg-white rounded-xl border border-gray-100 p-4 shadow-card hover:shadow-card-hover transition-all duration-200 animate-slide-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 bg-violet-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-violet" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-semibold text-ink truncate">{doc.title}</h3>
                      <CategoryBadge category={doc.category} />
                    </div>
                    <p className="text-caption text-ink-light">
                      {doc.properties?.name || "—"} · {doc.file_type?.toUpperCase()} · {doc.file_size_bytes ? `${(doc.file_size_bytes / 1024).toFixed(0)} KB` : "—"}
                    </p>
                    {doc.expiry_date && (
                      <div className={`flex items-center gap-1 mt-1 text-[11px] font-medium ${
                        isExpired(doc.expiry_date) ? "text-crimson" :
                        isExpiringSoon(doc.expiry_date) ? "text-amber" : "text-ink-light"
                      }`}>
                        <AlertTriangle className="w-3 h-3" />
                        {isExpired(doc.expiry_date) ? "Expired " : "Expires "}
                        {new Date(doc.expiry_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    )}
                  </div>
                </div>
                {/* Actions — View & Download */}
                <div className="flex items-center gap-1 ml-3">
                  <a
                    href={getDocumentViewUrl(doc.file_path)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface text-ink-light hover:text-propblue transition-colors"
                    title="View document"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                  <a
                    href={getDocumentViewUrl(doc.file_path)}
                    download={doc.original_filename || doc.title}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface text-ink-light hover:text-sage transition-colors"
                    title="Download document"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
