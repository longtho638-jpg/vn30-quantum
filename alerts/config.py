"""
VN30-Quantum Alerts Configuration
"""
import os
from dataclasses import dataclass
from typing import Optional


@dataclass
class TelegramConfig:
    """Telegram Bot configuration"""
    bot_token: str = os.getenv("TELEGRAM_BOT_TOKEN", "")
    channel_id: str = os.getenv("TELEGRAM_CHANNEL_ID", "")
    enabled: bool = bool(os.getenv("TELEGRAM_ENABLED", "false").lower() == "true")
    
    @property
    def is_configured(self) -> bool:
        return bool(self.bot_token and self.channel_id)


@dataclass
class EmailConfig:
    """Email (SendGrid) configuration"""
    api_key: str = os.getenv("SENDGRID_API_KEY", "")
    from_email: str = os.getenv("EMAIL_FROM", "alerts@vn30quantum.com")
    from_name: str = os.getenv("EMAIL_FROM_NAME", "VN30-Quantum Alerts")
    enabled: bool = bool(os.getenv("EMAIL_ENABLED", "false").lower() == "true")
    
    @property
    def is_configured(self) -> bool:
        return bool(self.api_key)


@dataclass
class WebSocketConfig:
    """WebSocket configuration"""
    enabled: bool = True
    ping_interval: int = 30
    ping_timeout: int = 10


# Alert thresholds
@dataclass
class AlertThresholds:
    """Default alert thresholds"""
    price_change_percent: float = 3.0  # Alert if price changes > 3%
    volume_spike_ratio: float = 2.0    # Alert if volume > 2x average
    signal_confidence_min: float = 0.7  # Only alert for high confidence signals
    rsi_oversold: float = 30
    rsi_overbought: float = 70


# Initialize configs
telegram_config = TelegramConfig()
email_config = EmailConfig()
websocket_config = WebSocketConfig()
alert_thresholds = AlertThresholds()
