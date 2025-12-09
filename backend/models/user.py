"""
VN30-Quantum User Models
SQLAlchemy models for users and subscriptions
"""
from datetime import datetime
from enum import Enum
from typing import Optional
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SQLEnum, Float
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class SubscriptionTier(str, Enum):
    FREE = "free"
    BASIC = "basic"
    PRO = "pro"


class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"


class User(Base):
    """User model"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    role = Column(SQLEnum(UserRole), default=UserRole.USER)
    
    # Subscription
    subscription_tier = Column(SQLEnum(SubscriptionTier), default=SubscriptionTier.FREE)
    subscription_start = Column(DateTime, nullable=True)
    subscription_end = Column(DateTime, nullable=True)
    
    # Tracking
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    def __repr__(self):
        return f"<User {self.email}>"
    
    @property
    def is_subscription_active(self) -> bool:
        """Check if subscription is currently active"""
        if self.subscription_tier == SubscriptionTier.FREE:
            return True
        if not self.subscription_end:
            return False
        return self.subscription_end > datetime.utcnow()
    
    @property
    def stocks_limit(self) -> int:
        """Get stock limit based on subscription tier"""
        limits = {
            SubscriptionTier.FREE: 5,
            SubscriptionTier.BASIC: 15,
            SubscriptionTier.PRO: 30
        }
        return limits.get(self.subscription_tier, 5)


class Watchlist(Base):
    """User's stock watchlist"""
    __tablename__ = "watchlists"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    symbol = Column(String(10), nullable=False)
    
    # Alert settings
    alert_enabled = Column(Boolean, default=False)
    price_target_high = Column(Float, nullable=True)
    price_target_low = Column(Float, nullable=True)
    
    # Notes
    notes = Column(String(500), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)


class APIKey(Base):
    """User API keys for programmatic access"""
    __tablename__ = "api_keys"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    key_hash = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    
    # Permissions
    can_read = Column(Boolean, default=True)
    can_write = Column(Boolean, default=False)
    
    # Usage tracking
    last_used = Column(DateTime, nullable=True)
    request_count = Column(Integer, default=0)
    
    # Status
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
