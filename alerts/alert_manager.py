"""
VN30-Quantum Alert Manager
Unified alert system orchestrator
"""
import asyncio
from typing import List, Dict, Optional
from dataclasses import dataclass
from datetime import datetime
from enum import Enum

from .config import alert_thresholds
from .telegram_bot import telegram_bot
from .email_service import email_service
from .websocket_manager import ws_manager


class AlertChannel(Enum):
    TELEGRAM = "telegram"
    EMAIL = "email"
    WEBSOCKET = "websocket"
    ALL = "all"


@dataclass
class AlertRecipient:
    """Alert recipient configuration"""
    user_id: int
    email: Optional[str] = None
    telegram_chat_id: Optional[str] = None
    channels: List[AlertChannel] = None
    
    def __post_init__(self):
        if self.channels is None:
            self.channels = [AlertChannel.WEBSOCKET]


class AlertManager:
    """
    Unified Alert Manager
    Orchestrates alerts across Telegram, Email, and WebSocket
    """
    
    def __init__(self):
        self.telegram = telegram_bot
        self.email = email_service
        self.websocket = ws_manager
        self.alert_history: List[Dict] = []
    
    async def send_signal_alert(
        self,
        recipient: AlertRecipient,
        symbol: str,
        signal_type: str,
        price: float,
        target: float,
        stop_loss: float,
        confidence: float,
        reasoning: List[str] = None
    ):
        """Send trading signal alert via configured channels"""
        
        # Check confidence threshold
        if confidence < alert_thresholds.signal_confidence_min:
            return {"sent": False, "reason": "Confidence below threshold"}
        
        results = {}
        
        for channel in recipient.channels:
            if channel == AlertChannel.TELEGRAM or channel == AlertChannel.ALL:
                if recipient.telegram_chat_id:
                    result = await self.telegram.send_signal_alert(
                        symbol=symbol,
                        signal_type=signal_type,
                        price=price,
                        target=target,
                        stop_loss=stop_loss,
                        confidence=confidence,
                        reasoning=reasoning
                    )
                    results["telegram"] = result
            
            if channel == AlertChannel.EMAIL or channel == AlertChannel.ALL:
                if recipient.email:
                    result = self.email.send_signal_alert(
                        to_email=recipient.email,
                        symbol=symbol,
                        signal_type=signal_type,
                        price=price,
                        target=target,
                        stop_loss=stop_loss,
                        confidence=confidence,
                        reasoning=reasoning
                    )
                    results["email"] = result
            
            if channel == AlertChannel.WEBSOCKET or channel == AlertChannel.ALL:
                await self.websocket.broadcast_signal(
                    symbol=symbol,
                    signal_type=signal_type,
                    price=price,
                    confidence=confidence,
                    target=target,
                    stop_loss=stop_loss,
                    reasoning=reasoning
                )
                results["websocket"] = {"sent": True}
        
        # Log alert
        self._log_alert("signal", symbol, results)
        
        return results
    
    async def send_price_alert(
        self,
        recipient: AlertRecipient,
        symbol: str,
        current_price: float,
        target_price: float,
        alert_type: str  # "above" or "below"
    ):
        """Send price target alert"""
        results = {}
        
        for channel in recipient.channels:
            if channel == AlertChannel.TELEGRAM or channel == AlertChannel.ALL:
                if recipient.telegram_chat_id:
                    result = await self.telegram.send_price_alert(
                        symbol=symbol,
                        current_price=current_price,
                        target_price=target_price,
                        alert_type=alert_type
                    )
                    results["telegram"] = result
            
            if channel == AlertChannel.WEBSOCKET or channel == AlertChannel.ALL:
                await self.websocket.broadcast_alert(
                    symbol=symbol,
                    alert_type=f"price_{alert_type}",
                    message_text=f"{symbol} {'vượt' if alert_type == 'above' else 'giảm dưới'} {target_price:,.0f}"
                )
                results["websocket"] = {"sent": True}
        
        self._log_alert("price", symbol, results)
        return results
    
    async def send_volume_alert(
        self,
        recipient: AlertRecipient,
        symbol: str,
        current_volume: float,
        avg_volume: float,
        ratio: float
    ):
        """Send volume spike alert"""
        
        # Check threshold
        if ratio < alert_thresholds.volume_spike_ratio:
            return {"sent": False, "reason": "Below volume threshold"}
        
        results = {}
        
        for channel in recipient.channels:
            if channel == AlertChannel.TELEGRAM or channel == AlertChannel.ALL:
                if recipient.telegram_chat_id:
                    result = await self.telegram.send_volume_alert(
                        symbol=symbol,
                        current_volume=current_volume,
                        avg_volume=avg_volume,
                        ratio=ratio
                    )
                    results["telegram"] = result
            
            if channel == AlertChannel.WEBSOCKET or channel == AlertChannel.ALL:
                await self.websocket.broadcast_alert(
                    symbol=symbol,
                    alert_type="volume_spike",
                    message_text=f"{symbol} volume tăng {ratio:.1f}x"
                )
                results["websocket"] = {"sent": True}
        
        self._log_alert("volume", symbol, results)
        return results
    
    async def send_market_overview(
        self,
        recipient: AlertRecipient,
        buy_count: int,
        sell_count: int,
        hold_count: int,
        sentiment: str,
        top_buys: List[Dict] = None,
        top_sells: List[Dict] = None
    ):
        """Send market overview"""
        results = {}
        
        for channel in recipient.channels:
            if channel == AlertChannel.TELEGRAM or channel == AlertChannel.ALL:
                if recipient.telegram_chat_id:
                    result = await self.telegram.send_market_overview(
                        buy_count=buy_count,
                        sell_count=sell_count,
                        hold_count=hold_count,
                        sentiment=sentiment,
                        top_buys=top_buys,
                        top_sells=top_sells
                    )
                    results["telegram"] = result
            
            if channel == AlertChannel.EMAIL or channel == AlertChannel.ALL:
                if recipient.email:
                    result = self.email.send_daily_summary(
                        to_email=recipient.email,
                        buy_count=buy_count,
                        sell_count=sell_count,
                        hold_count=hold_count,
                        top_signals=top_buys or []
                    )
                    results["email"] = result
        
        self._log_alert("overview", "VN30", results)
        return results
    
    async def broadcast_signal_to_all(
        self,
        symbol: str,
        signal_type: str,
        price: float,
        confidence: float,
        **kwargs
    ):
        """Broadcast signal to all WebSocket clients"""
        await self.websocket.broadcast_signal(
            symbol=symbol,
            signal_type=signal_type,
            price=price,
            confidence=confidence,
            **kwargs
        )
    
    def _log_alert(self, alert_type: str, symbol: str, results: Dict):
        """Log alert for history"""
        self.alert_history.append({
            "type": alert_type,
            "symbol": symbol,
            "results": results,
            "timestamp": datetime.now().isoformat()
        })
        
        # Keep only last 100 alerts
        if len(self.alert_history) > 100:
            self.alert_history = self.alert_history[-100:]
    
    def get_alert_stats(self) -> Dict:
        """Get alert statistics"""
        return {
            "total_alerts": len(self.alert_history),
            "websocket_clients": self.websocket.get_stats(),
            "telegram_enabled": self.telegram.enabled,
            "email_enabled": self.email.enabled
        }


# Global alert manager
alert_manager = AlertManager()
