"""
VN30-Quantum Alerts Module
Real-time alerts via Telegram, Email, and WebSocket
"""

from .config import (
    telegram_config, email_config, websocket_config, alert_thresholds
)
from .telegram_bot import TelegramBot, telegram_bot
from .email_service import EmailService, email_service
from .websocket_manager import WebSocketManager, ws_manager
from .alert_manager import AlertManager, AlertChannel, AlertRecipient, alert_manager

__all__ = [
    # Config
    'telegram_config',
    'email_config',
    'websocket_config',
    'alert_thresholds',
    
    # Telegram
    'TelegramBot',
    'telegram_bot',
    
    # Email
    'EmailService',
    'email_service',
    
    # WebSocket
    'WebSocketManager',
    'ws_manager',
    
    # Alert Manager
    'AlertManager',
    'AlertChannel',
    'AlertRecipient',
    'alert_manager',
]

__version__ = '2.0.0'
