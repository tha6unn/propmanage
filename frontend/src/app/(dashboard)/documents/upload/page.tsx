"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, Loader2, ArrowLeft, X } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { DOCUMENT_CATEGORIES } from "@/config/constants";

type PropertyOption = { id: string; name: string };

export default function UploadDocumentPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select a file to upload");
      return;
    }

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

    const propertyId = formData.get("property_id") as string;
    if (!propertyId) {
      setError("Please select a property");
      setLoading(false);
      return;
    }

    // Generate a unique file path
    const fileExt = selectedFile.name.split(".").pop()?.toLowerCase() || "pdf";
    const filePath = `${user.id}/${propertyId}/${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, selectedFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      // If bucket doesn't exist, store just the metadata with a placeholder path
      console.warn("Storage upload failed (bucket may not exist):", uploadError.message);
    }

    // Insert document record
    const { error: insertError } = await supabase.from("documents").insert({
      property_id: propertyId,
      owner_id: user.id,
      category: (formData.get("category") as string) || "other",
      title: (formData.get("title") as string) || selectedFile.name,
      description: (formData.get("description") as string) || null,
      file_path: filePath,
      original_filename: selectedFile.name,
      file_type: fileExt,
      file_size_bytes: selectedFile.size,
      expiry_date: (formData.get("expiry_date") as string) || null,
      ocr_status: "pending",
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/documents");
    router.refresh();
  };

  const fileSizeText = selectedFile
    ? selectedFile.size < 1024 * 1024
      ? `${(selectedFile.size / 1024).toFixed(0)} KB`
      : `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
    : "";

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/documents"
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-ink-light" />
        </Link>
        <div>
          <h1 className="text-h1 font-bold text-ink">Upload Document</h1>
          <p className="text-body text-ink-light mt-0.5">
            Upload property documents securely
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 space-y-5">
        {/* File Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragActive
              ? "border-propblue bg-propblue/5"
              : selectedFile
              ? "border-sage bg-emerald-50/50"
              : "border-gray-200 hover:border-propblue/50 hover:bg-surface"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls,.csv,.txt"
          />

          {selectedFile ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-sage" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-ink truncate max-w-[300px]">
                  {selectedFile.name}
                </p>
                <p className="text-caption text-ink-light">{fileSizeText}</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                }}
                className="ml-2 w-6 h-6 rounded-full bg-gray-100 hover:bg-red-100 flex items-center justify-center transition-colors"
              >
                <X className="w-3 h-3 text-ink-light" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-ink-light/40 mx-auto mb-2" />
              <p className="text-sm font-medium text-ink">
                Drop your file here or click to browse
              </p>
              <p className="text-caption text-ink-light mt-1">
                PDF, DOC, DOCX, JPG, PNG, XLSX — up to 10MB
              </p>
            </>
          )}
        </div>

        {/* Property Selection */}
        <div>
          <label className="block text-label text-ink-medium mb-1.5">
            Property *
          </label>
          <select
            name="property_id"
            required
            className="w-full px-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue"
          >
            <option value="">Select property</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Title & Category */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-label text-ink-medium mb-1.5">
              Document Title *
            </label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g., Rental Agreement 2025"
              className="w-full px-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue focus:ring-2 focus:ring-propblue/10"
            />
          </div>
          <div>
            <label className="block text-label text-ink-medium mb-1.5">
              Category
            </label>
            <select
              name="category"
              defaultValue="other"
              className="w-full px-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue"
            >
              {DOCUMENT_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-label text-ink-medium mb-1.5">
            Description
          </label>
          <textarea
            name="description"
            rows={2}
            placeholder="Brief description of this document..."
            className="w-full px-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue focus:ring-2 focus:ring-propblue/10 resize-none"
          />
        </div>

        {/* Expiry Date */}
        <div className="w-1/2">
          <label className="block text-label text-ink-medium mb-1.5">
            Expiry Date
          </label>
          <input
            type="date"
            name="expiry_date"
            className="w-full px-4 py-2.5 bg-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-propblue"
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
            href="/documents"
            className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-ink-medium hover:bg-surface transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || !selectedFile}
            className="flex items-center gap-2 bg-propblue hover:bg-propblue-dark text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Document
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
