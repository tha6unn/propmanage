"""Email service using Resend for transactional emails.

Graceful fallback: if RESEND_API_KEY is not set, emails are logged
to console instead of crashing.
"""
import logging
import resend
from app.config import settings
from app.services.supabase import get_supabase_admin

logger = logging.getLogger(__name__)


def _send_email(to_email: str, subject: str, html_content: str) -> bool:
    """Send an email via Resend. Returns True if sent, False if failed/skipped."""
    if not settings.RESEND_API_KEY:
        logger.info(f"[EMAIL-SKIP] No RESEND_API_KEY set. To: {to_email} | Subject: {subject}")
        return False

    try:
        resend.api_key = settings.RESEND_API_KEY

        # Use Resend test address in non-production or when domain isn't verified
        from_email = settings.RESEND_FROM_EMAIL
        if settings.APP_ENV != "production" or from_email.endswith("@propmanage.app"):
            from_address = f"PropManage <onboarding@resend.dev>"
        else:
            from_address = f"{settings.RESEND_FROM_NAME} <{from_email}>"

        logger.info(f"[EMAIL] Sending to {to_email} via Resend")

        params: resend.Emails.SendParams = {
            "from": from_address,
            "to": [to_email],
            "subject": subject,
            "html": html_content,
        }
        email = resend.Emails.send(params)
        logger.info(f"[EMAIL] Result: {email}")
        return True
    except Exception as e:
        logger.error(f"[EMAIL-FAIL] To: {to_email} | Error: {e}")
        return False


def _log_notification(
    recipient_email: str,
    recipient_id: str | None,
    notification_type: str,
    content: str,
    status: str = "sent",
    channel: str = "email",
):
    """Log notification to notification_log table."""
    try:
        admin = get_supabase_admin()
        admin.table("notification_log").insert({
            "recipient_id": recipient_id,
            "channel": channel,
            "notification_type": notification_type,
            "content": f"To: {recipient_email} | {content[:500]}",
            "status": status,
            "attempts": 1,
        }).execute()
    except Exception as e:
        logger.error(f"Failed to log notification: {e}")


# ──────────────────────────────────────────
# BASE EMAIL TEMPLATE
# ──────────────────────────────────────────

def _base_template(title: str, body_html: str) -> str:
    """Wrap body in PropManage branded email template."""
    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
</head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:16px;border:1px solid #E5E7EB;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:#1B4FD8;padding:24px 32px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:36px;height:36px;background:rgba(255,255,255,0.2);border-radius:10px;text-align:center;vertical-align:middle;">
                    <span style="color:#fff;font-size:18px;font-weight:bold;">P</span>
                  </td>
                  <td style="padding-left:12px;">
                    <span style="color:#FFFFFF;font-size:20px;font-weight:700;letter-spacing:-0.3px;">PropManage</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              {body_html}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #E5E7EB;background:#F9FAFB;">
              <p style="margin:0;font-size:12px;color:#6B7280;text-align:center;">
                PropManage — Your properties. Always in order.<br>
                <a href="{settings.FRONTEND_URL}" style="color:#1B4FD8;text-decoration:none;">propmanage.app</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


# ──────────────────────────────────────────
# EMAIL FUNCTIONS
# ──────────────────────────────────────────

def send_tenant_invite_email(
    to_email: str,
    tenant_name: str | None,
    property_name: str,
    unit: str | None,
    monthly_rent: float,
    currency: str,
    invite_link: str,
    owner_name: str,
    recipient_id: str | None = None,
):
    """Send tenant invite email with registration link."""
    greeting = f"Hi {tenant_name}," if tenant_name else "Hi,"
    unit_text = f" (Unit {unit})" if unit else ""

    body = f"""
    <h2 style="margin:0 0 8px;font-size:22px;color:#0D0D0D;">{greeting}</h2>
    <p style="margin:0 0 20px;font-size:15px;color:#2E2E2E;line-height:24px;">
      <strong>{owner_name}</strong> has invited you to manage your tenancy at
      <strong>{property_name}{unit_text}</strong> through PropManage.
    </p>

    <div style="background:#F9FAFB;border-radius:12px;padding:20px;margin:0 0 24px;">
      <table cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="font-size:13px;color:#6B7280;padding-bottom:8px;">Property</td>
          <td style="font-size:14px;color:#0D0D0D;font-weight:600;padding-bottom:8px;text-align:right;">{property_name}{unit_text}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#6B7280;padding-bottom:8px;">Monthly Rent</td>
          <td style="font-size:14px;color:#0D0D0D;font-weight:600;padding-bottom:8px;text-align:right;">{currency} {monthly_rent:,.2f}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#6B7280;">Invited by</td>
          <td style="font-size:14px;color:#0D0D0D;font-weight:600;text-align:right;">{owner_name}</td>
        </tr>
      </table>
    </div>

    <p style="margin:0 0 24px;font-size:15px;color:#2E2E2E;line-height:24px;">
      Click the button below to create your account and view your tenancy details, payment history, and documents.
    </p>

    <table cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <a href="{invite_link}" style="display:inline-block;background:#1B4FD8;color:#FFFFFF;font-size:16px;font-weight:600;padding:14px 32px;border-radius:12px;text-decoration:none;">
            Accept Invitation
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:20px 0 0;font-size:13px;color:#6B7280;text-align:center;">
      This invite link expires in 7 days. If you didn't expect this email, you can safely ignore it.
    </p>
    """

    html = _base_template("You're Invited to PropManage", body)
    success = _send_email(to_email, f"You're invited to {property_name} on PropManage", html)
    _log_notification(
        to_email, recipient_id, "tenant_invite",
        f"Invite to {property_name}",
        "sent" if success else "pending",
    )
    return success


def send_manager_invite_email(
    to_email: str,
    manager_name: str | None,
    property_names: list[str],
    invite_link: str,
    owner_name: str,
    recipient_id: str | None = None,
):
    """Send manager invite email."""
    greeting = f"Hi {manager_name}," if manager_name else "Hi,"
    props_list = "".join(f"<li style='padding:4px 0;'>{p}</li>" for p in property_names)

    body = f"""
    <h2 style="margin:0 0 8px;font-size:22px;color:#0D0D0D;">{greeting}</h2>
    <p style="margin:0 0 20px;font-size:15px;color:#2E2E2E;line-height:24px;">
      <strong>{owner_name}</strong> has invited you as a <strong>Property Manager</strong> on PropManage.
    </p>

    <div style="background:#F9FAFB;border-radius:12px;padding:20px;margin:0 0 24px;">
      <p style="margin:0 0 8px;font-size:13px;color:#6B7280;">Assigned Properties:</p>
      <ul style="margin:0;padding:0 0 0 20px;font-size:14px;color:#0D0D0D;font-weight:500;">
        {props_list}
      </ul>
    </div>

    <table cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <a href="{invite_link}" style="display:inline-block;background:#1B4FD8;color:#FFFFFF;font-size:16px;font-weight:600;padding:14px 32px;border-radius:12px;text-decoration:none;">
            Accept Invitation
          </a>
        </td>
      </tr>
    </table>
    """

    html = _base_template("Manager Invitation — PropManage", body)
    success = _send_email(to_email, f"{owner_name} invited you to manage properties on PropManage", html)
    _log_notification(to_email, recipient_id, "manager_invite", f"Manager invite from {owner_name}", "sent" if success else "pending")
    return success


def send_welcome_email(to_email: str, name: str, role: str, recipient_id: str | None = None):
    """Send welcome email after account creation from invite."""
    body = f"""
    <h2 style="margin:0 0 8px;font-size:22px;color:#0D0D0D;">Welcome to PropManage, {name}!</h2>
    <p style="margin:0 0 20px;font-size:15px;color:#2E2E2E;line-height:24px;">
      Your account has been created as a <strong>{role}</strong>. You can now log in to access your dashboard.
    </p>

    <table cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <a href="{settings.FRONTEND_URL}/login" style="display:inline-block;background:#1B4FD8;color:#FFFFFF;font-size:16px;font-weight:600;padding:14px 32px;border-radius:12px;text-decoration:none;">
            Go to Dashboard
          </a>
        </td>
      </tr>
    </table>
    """

    html = _base_template("Welcome to PropManage", body)
    success = _send_email(to_email, "Welcome to PropManage!", html)
    _log_notification(to_email, recipient_id, "welcome", f"Welcome as {role}", "sent" if success else "pending")
    return success


def send_payment_confirmation_email(
    to_email: str,
    tenant_name: str,
    property_name: str,
    amount: float,
    currency: str,
    payment_month: str,
    payment_method: str | None,
    recipient_id: str | None = None,
):
    """Send payment confirmation to tenant."""
    method_text = payment_method.replace("_", " ").title() if payment_method else "Not specified"

    body = f"""
    <h2 style="margin:0 0 8px;font-size:22px;color:#0D0D0D;">Payment Received</h2>
    <p style="margin:0 0 20px;font-size:15px;color:#2E2E2E;line-height:24px;">
      Hi {tenant_name}, your rent payment has been recorded.
    </p>

    <div style="background:#DCFCE7;border-radius:12px;padding:20px;margin:0 0 24px;border-left:4px solid #16A34A;">
      <table cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="font-size:13px;color:#15803D;padding-bottom:8px;">Amount</td>
          <td style="font-size:18px;color:#15803D;font-weight:700;padding-bottom:8px;text-align:right;">{currency} {amount:,.2f}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#15803D;padding-bottom:8px;">Month</td>
          <td style="font-size:14px;color:#15803D;font-weight:600;padding-bottom:8px;text-align:right;">{payment_month}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#15803D;padding-bottom:8px;">Property</td>
          <td style="font-size:14px;color:#15803D;font-weight:600;padding-bottom:8px;text-align:right;">{property_name}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#15803D;">Method</td>
          <td style="font-size:14px;color:#15803D;font-weight:600;text-align:right;">{method_text}</td>
        </tr>
      </table>
    </div>

    <table cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <a href="{settings.FRONTEND_URL}/login" style="display:inline-block;background:#1B4FD8;color:#FFFFFF;font-size:14px;font-weight:600;padding:12px 24px;border-radius:12px;text-decoration:none;">
            View Payment History
          </a>
        </td>
      </tr>
    </table>
    """

    html = _base_template("Payment Confirmed", body)
    success = _send_email(to_email, f"Payment received — {currency} {amount:,.2f} for {payment_month}", html)
    _log_notification(to_email, recipient_id, "payment_confirmation", f"Payment {currency} {amount:,.2f} for {payment_month}", "sent" if success else "pending")
    return success


def send_maintenance_notification_email(
    to_email: str,
    recipient_name: str,
    property_name: str,
    title: str,
    status: str,
    description: str | None = None,
    is_owner: bool = True,
    recipient_id: str | None = None,
):
    """Send maintenance request notification to owner or status update to tenant."""
    if is_owner:
        heading = "New Maintenance Request"
        intro = f"A maintenance request has been submitted for <strong>{property_name}</strong>."
    else:
        heading = "Maintenance Update"
        intro = f"Your maintenance request for <strong>{property_name}</strong> has been updated."

    status_colors = {
        "open": ("#D97706", "#FEF3C7"),
        "acknowledged": ("#1B4FD8", "#E8EDFF"),
        "in_progress": ("#1B4FD8", "#E8EDFF"),
        "resolved": ("#16A34A", "#DCFCE7"),
        "closed": ("#64748B", "#F1F5F9"),
        "rejected": ("#DC2626", "#FEE2E2"),
    }
    text_color, bg_color = status_colors.get(status, ("#64748B", "#F1F5F9"))
    desc_html = f'<p style="margin:12px 0 0;font-size:14px;color:#2E2E2E;">{description}</p>' if description else ""

    body = f"""
    <h2 style="margin:0 0 8px;font-size:22px;color:#0D0D0D;">Hi {recipient_name},</h2>
    <p style="margin:0 0 20px;font-size:15px;color:#2E2E2E;line-height:24px;">{intro}</p>

    <div style="background:#F9FAFB;border-radius:12px;padding:20px;margin:0 0 24px;">
      <p style="margin:0 0 4px;font-size:16px;color:#0D0D0D;font-weight:600;">{title}</p>
      <span style="display:inline-block;background:{bg_color};color:{text_color};font-size:12px;font-weight:600;padding:4px 10px;border-radius:6px;text-transform:uppercase;">
        {status.replace('_', ' ')}
      </span>
      {desc_html}
    </div>

    <table cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <a href="{settings.FRONTEND_URL}/maintenance" style="display:inline-block;background:#1B4FD8;color:#FFFFFF;font-size:14px;font-weight:600;padding:12px 24px;border-radius:12px;text-decoration:none;">
            View Details
          </a>
        </td>
      </tr>
    </table>
    """

    html = _base_template(heading, body)
    subject = f"{'New' if is_owner else 'Update:'} Maintenance — {title} at {property_name}"
    success = _send_email(to_email, subject, html)
    _log_notification(to_email, recipient_id, "maintenance_update", f"{heading}: {title}", "sent" if success else "pending")
    return success


def send_rent_reminder_email(
    to_email: str,
    tenant_name: str,
    property_name: str,
    amount_due: float,
    currency: str,
    payment_month: str,
    days_overdue: int = 0,
    recipient_id: str | None = None,
):
    """Send rent reminder email to tenant."""
    if days_overdue > 0:
        urgency = f"Your rent for <strong>{payment_month}</strong> is <strong>{days_overdue} days overdue</strong>."
        subject = f"Rent Overdue — {currency} {amount_due:,.2f} for {payment_month}"
    else:
        urgency = f"This is a friendly reminder that your rent for <strong>{payment_month}</strong> is due."
        subject = f"Rent Reminder — {currency} {amount_due:,.2f} for {payment_month}"

    body = f"""
    <h2 style="margin:0 0 8px;font-size:22px;color:#0D0D0D;">Hi {tenant_name},</h2>
    <p style="margin:0 0 20px;font-size:15px;color:#2E2E2E;line-height:24px;">{urgency}</p>

    <div style="background:{'#FEF3C7' if days_overdue > 0 else '#F9FAFB'};border-radius:12px;padding:20px;margin:0 0 24px;{'border-left:4px solid #D97706;' if days_overdue > 0 else ''}">
      <table cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="font-size:13px;color:#6B7280;padding-bottom:8px;">Amount Due</td>
          <td style="font-size:18px;color:#0D0D0D;font-weight:700;padding-bottom:8px;text-align:right;">{currency} {amount_due:,.2f}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#6B7280;padding-bottom:8px;">Property</td>
          <td style="font-size:14px;color:#0D0D0D;font-weight:600;padding-bottom:8px;text-align:right;">{property_name}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#6B7280;">Month</td>
          <td style="font-size:14px;color:#0D0D0D;font-weight:600;text-align:right;">{payment_month}</td>
        </tr>
      </table>
    </div>

    <p style="margin:0 0 4px;font-size:13px;color:#6B7280;text-align:center;">
      Please contact your landlord if you have already made this payment.
    </p>
    """

    html = _base_template("Rent Reminder", body)
    success = _send_email(to_email, subject, html)
    _log_notification(to_email, recipient_id, "rent_reminder", f"Rent reminder: {currency} {amount_due:,.2f}", "sent" if success else "pending")
    return success
