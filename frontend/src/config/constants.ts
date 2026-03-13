export const APP_NAME = "PropManage";
export const APP_TAGLINE = "Your properties. Always in order.";
export const APP_DESCRIPTION =
  "AI-powered property management platform for landlords. Manage properties, documents, tenants, and rent — all in one place.";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const PROPERTY_TYPES = [
  { value: "residential_apartment", label: "Apartment" },
  { value: "residential_house", label: "House" },
  { value: "residential_villa", label: "Villa" },
  { value: "commercial_office", label: "Office" },
  { value: "commercial_retail", label: "Retail" },
  { value: "commercial_warehouse", label: "Warehouse" },
  { value: "land", label: "Land" },
  { value: "mixed_use", label: "Mixed Use" },
] as const;

export const PROPERTY_STATUSES = [
  { value: "occupied", label: "Occupied" },
  { value: "vacant", label: "Vacant" },
  { value: "under_maintenance", label: "Under Maintenance" },
  { value: "listed", label: "Listed" },
] as const;

export const DOCUMENT_CATEGORIES = [
  { value: "ownership", label: "Ownership" },
  { value: "tenant_kyc", label: "Tenant KYC" },
  { value: "agreement", label: "Agreement" },
  { value: "financial", label: "Financial" },
  { value: "legal", label: "Legal" },
  { value: "insurance", label: "Insurance" },
  { value: "inspection", label: "Inspection" },
  { value: "maintenance", label: "Maintenance" },
  { value: "other", label: "Other" },
] as const;

export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "upi", label: "UPI" },
  { value: "cheque", label: "Cheque" },
  { value: "card", label: "Card" },
  { value: "other", label: "Other" },
] as const;

export const PAYMENT_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "partial", label: "Partial" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "waived", label: "Waived" },
] as const;

export const CURRENCIES = [
  { value: "INR", label: "₹ INR", symbol: "₹" },
  { value: "AED", label: "AED", symbol: "AED" },
  { value: "GBP", label: "£ GBP", symbol: "£" },
  { value: "EUR", label: "€ EUR", symbol: "€" },
  { value: "SGD", label: "S$ SGD", symbol: "S$" },
  { value: "USD", label: "$ USD", symbol: "$" },
] as const;

export const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "ta", label: "Tamil" },
  { value: "ar", label: "Arabic" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "es", label: "Spanish" },
  { value: "ms", label: "Malay" },
] as const;
