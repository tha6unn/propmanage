"""Pagination utilities."""
from typing import Any


def paginate_params(page: int = 1, per_page: int = 20) -> tuple[int, int]:
    """Calculate offset and limit from page params.

    Returns:
        (offset, limit) tuple
    """
    page = max(1, page)
    per_page = min(max(1, per_page), 100)  # Clamp to 1-100
    offset = (page - 1) * per_page
    return offset, per_page


def paginated_response(data: list[Any], total: int, page: int, per_page: int) -> dict:
    """Build a standard paginated response envelope."""
    return {
        "data": data,
        "meta": {
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": max(1, (total + per_page - 1) // per_page),
        },
    }
