/**
 * API client for backend-exclusive operations.
 * For CRUD, use Supabase directly via queries.ts.
 * This is for operations that require server-side logic:
 * document upload, AI agent chat, notifications.
 */
import { API_URL } from "@/config/constants";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async getAuthToken(): Promise<string | null> {
    if (typeof window === "undefined") return null;
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  }

  private async request<T>(
    method: string,
    path: string,
    options?: {
      body?: unknown;
      formData?: FormData;
      headers?: Record<string, string>;
    }
  ): Promise<T> {
    const token = await this.getAuthToken();

    const headers: Record<string, string> = {
      ...(options?.headers || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    if (options?.formData) {
      fetchOptions.body = options.formData;
    } else if (options?.body) {
      headers["Content-Type"] = "application/json";
      fetchOptions.body = JSON.stringify(options.body);
    }

    const res = await fetch(`${this.baseUrl}${path}`, fetchOptions);

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(error.detail || `API error: ${res.status}`);
    }

    return res.json();
  }

  // Document upload (uses multipart/form-data via backend)
  async uploadDocument(formData: FormData) {
    return this.request<{ data: Record<string, unknown> }>(
      "POST",
      "/api/documents/upload",
      { formData }
    );
  }

  // Document download — returns signed URL (requires auth)
  async downloadDocument(documentId: string): Promise<{ url: string; filename: string }> {
    return this.request<{ url: string; filename: string }>(
      "GET",
      `/api/documents/${documentId}/download`
    );
  }

  // Agent chat
  async sendAgentMessage(message: string, sessionId?: string) {
    return this.request<{
      response: string;
      session_id: string;
      sources: unknown[] | null;
    }>("POST", "/api/agent/chat", {
      body: { message, session_id: sessionId },
    });
  }

  // Payment summary
  async getPaymentSummary() {
    return this.request<{
      data: {
        total_due: number;
        total_collected: number;
        total_outstanding: number;
        overdue_count: number;
        overdue_amount: number;
      };
    }>("GET", "/api/payments/summary");
  }

  // ─── Tenancy ───────────────────────────

  async createTenancy(data: {
    property_id: string;
    tenant_invite_email?: string | null;
    tenant_invite_phone?: string | null;
    unit_identifier?: string | null;
    monthly_rent: number;
    security_deposit?: number;
    rent_due_day?: number;
    agreement_start_date?: string | null;
    agreement_end_date?: string | null;
    currency?: string;
    notice_period_days?: number;
  }) {
    return this.request<{
      data: Record<string, unknown>;
      rent_entries_created: number;
      invite_sent: boolean;
    }>("POST", "/api/tenancies/", { body: data });
  }

  async sendTenantInvite(tenancyId: string) {
    return this.request<{
      message: string;
      sent: boolean;
      email: string;
    }>("POST", `/api/tenancies/${tenancyId}/invite`);
  }

  // ─── Maintenance ───────────────────────

  async createMaintenanceRequest(data: {
    property_id: string;
    tenancy_id?: string | null;
    title: string;
    description?: string | null;
    category?: string | null;
    priority?: string;
    estimated_cost?: number | null;
  }) {
    return this.request<{ data: Record<string, unknown> }>(
      "POST",
      "/api/maintenance/",
      { body: data }
    );
  }

  // ─── Payments ──────────────────────────

  async logPayment(data: {
    tenancy_id: string;
    payment_month: string;
    amount_paid: number;
    payment_method?: string | null;
    transaction_reference?: string | null;
    notes?: string | null;
  }) {
    return this.request<{ data: Record<string, unknown> }>(
      "POST",
      "/api/payments/log",
      { body: data }
    );
  }

  // ─── Invite ────────────────────────────

  async getInviteDetails(token: string) {
    return this.request<{
      data: {
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
    }>("GET", `/api/auth/invite/details?token=${encodeURIComponent(token)}`);
  }

  async acceptInvite(data: {
    token: string;
    full_name: string;
    password: string;
    phone?: string | null;
  }) {
    return this.request<{
      data: {
        success: boolean;
        user_id: string;
        access_token?: string;
        refresh_token?: string;
        existing_user?: boolean;
        message?: string;
      };
    }>("POST", "/api/auth/invite/accept", { body: data });
  }

  async acceptManagerInvite(data: {
    token: string;
    full_name: string;
    password: string;
    phone?: string | null;
  }) {
    return this.request<{
      data: {
        success: boolean;
        user_id: string;
        access_token?: string;
        refresh_token?: string;
        existing_user?: boolean;
      };
    }>("POST", "/api/auth/invite/accept-manager", { body: data });
  }

  // ─── Notifications ─────────────────────

  async sendRentReminder(tenancyId: string) {
    return this.request<{ message: string }>(
      "POST",
      "/api/notifications/send-reminder",
      { body: { tenancy_id: tenancyId } }
    );
  }
}

export const api = new ApiClient(API_URL);

