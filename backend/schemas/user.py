"""
VN30-Quantum Pydantic Schemas
Request/Response validation
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

from ..models.user import SubscriptionTier, UserRole


# ============== Auth Schemas ==============

class UserRegister(BaseModel):
    """User registration request"""
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: Optional[str] = None
    phone: Optional[str] = None


class UserLogin(BaseModel):
    """User login request"""
    email: EmailStr
    password: str


class Token(BaseModel):
    """Token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenRefresh(BaseModel):
    """Token refresh request"""
    refresh_token: str


# ============== User Schemas ==============

class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    full_name: Optional[str] = None
    phone: Optional[str] = None


class UserResponse(UserBase):
    """User response (public data)"""
    id: int
    is_active: bool
    is_verified: bool
    role: UserRole
    subscription_tier: SubscriptionTier
    subscription_end: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    """User update request"""
    full_name: Optional[str] = None
    phone: Optional[str] = None


class PasswordChange(BaseModel):
    """Password change request"""
    current_password: str
    new_password: str = Field(..., min_length=8)


# ============== Watchlist Schemas ==============

class WatchlistAdd(BaseModel):
    """Add stock to watchlist"""
    symbol: str = Field(..., max_length=10)
    notes: Optional[str] = None
    alert_enabled: bool = False
    price_target_high: Optional[float] = None
    price_target_low: Optional[float] = None


class WatchlistResponse(BaseModel):
    """Watchlist item response"""
    id: int
    symbol: str
    notes: Optional[str]
    alert_enabled: bool
    price_target_high: Optional[float]
    price_target_low: Optional[float]
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============== Subscription Schemas ==============

class SubscriptionInfo(BaseModel):
    """Subscription information"""
    tier: SubscriptionTier
    is_active: bool
    stocks_limit: int
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    features: List[str]


class SubscriptionUpgrade(BaseModel):
    """Subscription upgrade request"""
    tier: SubscriptionTier
    payment_method: str  # stripe, bank_transfer


# ============== API Key Schemas ==============

class APIKeyCreate(BaseModel):
    """Create API key request"""
    name: str = Field(..., max_length=100)
    can_write: bool = False


class APIKeyResponse(BaseModel):
    """API key response"""
    id: int
    name: str
    key_prefix: str  # First 8 chars
    can_read: bool
    can_write: bool
    is_active: bool
    last_used: Optional[datetime]
    request_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class APIKeyCreated(APIKeyResponse):
    """API key created response (includes full key)"""
    api_key: str  # Full key, only shown once


# ============== Response Schemas ==============

class MessageResponse(BaseModel):
    """Generic message response"""
    message: str
    success: bool = True


class ErrorResponse(BaseModel):
    """Error response"""
    detail: str
    code: str
