"""Pydantic models for request/response schemas."""
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime
from enum import Enum


# ---- Enums ----
class PropertyType(str, Enum):
    RESIDENTIAL_APARTMENT = "residential_apartment"
    RESIDENTIAL_HOUSE = "residential_house"
    RESIDENTIAL_VILLA = "residential_villa"
    COMMERCIAL_OFFICE = "commercial_office"
    COMMERCIAL_RETAIL = "commercial_retail"
    COMMERCIAL_WAREHOUSE = "commercial_warehouse"
    LAND = "land"
    MIXED_USE = "mixed_use"


class PropertyStatus(str, Enum):
    OCCUPIED = "occupied"
    VACANT = "vacant"
    UNDER_MAINTENANCE = "under_maintenance"
    LISTED = "listed"


class UserRole(str, Enum):
    OWNER = "owner"
    MANAGER = "manager"
    TENANT = "tenant"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    PARTIAL = "partial"
    PAID = "paid"
    OVERDUE = "overdue"
    WAIVED = "waived"


class PaymentMethod(str, Enum):
    CASH = "cash"
    BANK_TRANSFER = "bank_transfer"
    UPI = "upi"
    CHEQUE = "cheque"
    CARD = "card"
    OTHER = "other"


# ---- Auth ----
class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    phone: Optional[str] = None
    preferred_language: str = "en"


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: str


class ProfileResponse(BaseModel):
    id: str
    full_name: str
    email: str
    phone: Optional[str]
    avatar_url: Optional[str]
    role: str
    preferred_language: str
    timezone: str


# ---- Properties ----
class PropertyCreate(BaseModel):
    name: str
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state_province: Optional[str] = None
    country: str = "IN"
    postal_code: Optional[str] = None
    property_type: Optional[PropertyType] = None
    status: PropertyStatus = PropertyStatus.VACANT
    total_units: int = 1
    year_built: Optional[int] = None
    area_sqft: Optional[float] = None
    notes: Optional[str] = None


class PropertyUpdate(BaseModel):
    name: Optional[str] = None
    address_line1: Optional[str] = None
    city: Optional[str] = None
    state_province: Optional[str] = None
    country: Optional[str] = None
    property_type: Optional[PropertyType] = None
    status: Optional[PropertyStatus] = None
    total_units: Optional[int] = None
    notes: Optional[str] = None


class PropertyResponse(BaseModel):
    id: str
    owner_id: str
    name: str
    city: Optional[str]
    country: str
    property_type: Optional[str]
    status: str
    total_units: int
    created_at: str


# ---- Tenancies ----
class TenancyCreate(BaseModel):
    property_id: str
    tenant_invite_email: Optional[str] = None
    tenant_invite_phone: Optional[str] = None
    unit_identifier: Optional[str] = None
    monthly_rent: float
    security_deposit: float = 0
    rent_due_day: int = 1
    agreement_start_date: Optional[date] = None
    agreement_end_date: Optional[date] = None
    currency: str = "INR"
    notice_period_days: int = 30


# ---- Payments ----
class PaymentLog(BaseModel):
    tenancy_id: str
    payment_month: date
    amount_paid: float
    payment_method: Optional[PaymentMethod] = None
    transaction_reference: Optional[str] = None
    notes: Optional[str] = None


# ---- Agent ----
class AgentChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


class AgentChatResponse(BaseModel):
    response: str
    session_id: str
    sources: Optional[List[dict]] = None


# ---- Standard Wrappers ----
class DataResponse(BaseModel):
    data: dict | list
    meta: Optional[dict] = None


class ErrorResponse(BaseModel):
    error: dict
