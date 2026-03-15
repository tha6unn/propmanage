"""Background worker with scheduled jobs.

Uses APScheduler to run periodic tasks:
- mark_overdue_payments: daily at 9 AM IST, marks pending rent entries past due as overdue
"""
import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import date

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler(timezone="Asia/Kolkata")


async def mark_overdue_payments():
    """Mark all pending rent payments past their due date as overdue."""
    try:
        from app.services.supabase import get_supabase_admin

        admin = get_supabase_admin()
        today = date.today()
        current_month = today.replace(day=1).isoformat()

        # Find all pending payments for months that have already passed
        result = (
            admin.table("rent_payments")
            .update({"status": "overdue"})
            .eq("status", "pending")
            .lt("payment_month", current_month)
            .execute()
        )

        count = len(result.data or [])
        if count > 0:
            logger.info(f"[CRON] Marked {count} payment(s) as overdue")
        else:
            logger.debug("[CRON] No payments to mark as overdue")

    except Exception as e:
        logger.error(f"[CRON] Failed to mark overdue payments: {e}")


# Schedule: daily at 9:00 AM IST
scheduler.add_job(
    mark_overdue_payments,
    CronTrigger(hour=9, minute=0),
    id="mark_overdue",
    replace_existing=True,
)
