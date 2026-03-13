import { FileText, Upload, Search, Filter } from "lucide-react";
import Link from "next/link";

export default function DocumentsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-bold text-ink">Documents</h1>
          <p className="text-body text-ink-light mt-1">
            Your secure document vault
          </p>
        </div>
        <Link
          href="/documents/upload"
          className="flex items-center gap-2 bg-propblue hover:bg-propblue-dark text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-[0.98]"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Upload</span>
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-light" />
          <input
            type="text"
            placeholder="Search documents..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue focus:ring-1 focus:ring-propblue/20"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-ink-medium hover:bg-surface transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-card">
        <div className="w-16 h-16 bg-propblue-light rounded-2xl flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-propblue" />
        </div>
        <h3 className="text-h3 font-semibold text-ink mb-1">No documents yet</h3>
        <p className="text-body text-ink-light mb-6">
          Upload your first document to get started.
        </p>
        <Link
          href="/documents/upload"
          className="bg-propblue hover:bg-propblue-dark text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all active:scale-[0.98]"
        >
          Upload Document
        </Link>
      </div>
    </div>
  );
}
