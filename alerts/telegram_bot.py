"""
VN30-Quantum Telegram Bot
Real-time trading alerts via Telegram
"""
import asyncio
import httpx
from typing import Optional, List, Dict
from dataclasses import dataclass
from datetime import datetime

from .config import telegram_config


@dataclass
class TelegramMessage:
    """Telegram message structure"""
    text: str
    parse_mode: str = "HTML"
    disable_preview: bool = True


class TelegramBot:
    """
    Telegram Bot for VN30-Quantum alerts
    Supports: Signals, Price alerts, Market updates
    """
    
    BASE_URL = "https://api.telegram.org/bot"
    
    def __init__(self, token: str = None, channel_id: str = None):
        self.token = token or telegram_config.bot_token
        self.channel_id = channel_id or telegram_config.channel_id
        self.enabled = telegram_config.enabled and telegram_config.is_configured
        
        if self.token:
            self.api_url = f"{self.BASE_URL}{self.token}"
    
    async def send_message(
        self,
        text: str,
        chat_id: str = None,
        parse_mode: str = "HTML",
        disable_preview: bool = True
    ) -> Dict:
        """Send message to Telegram"""
        if not self.enabled:
            return {"ok": False, "error": "Telegram not configured"}
        
        chat_id = chat_id or self.channel_id
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.api_url}/sendMessage",
                    json={
                        "chat_id": chat_id,
                        "text": text,
                        "parse_mode": parse_mode,
                        "disable_web_page_preview": disable_preview
                    },
                    timeout=10.0
                )
                return response.json()
            except Exception as e:
                return {"ok": False, "error": str(e)}
    
    def send_message_sync(self, text: str, chat_id: str = None) -> Dict:
        """Synchronous wrapper for send_message"""
        return asyncio.run(self.send_message(text, chat_id))
    
    # ============== Alert Formatters ==============
    
    def format_signal_alert(
        self,
        symbol: str,
        signal_type: str,
        price: float,
        target: float,
        stop_loss: float,
        confidence: float,
        reasoning: List[str] = None
    ) -> str:
        """Format trading signal alert"""
        
        # Emoji based on signal
        if "STRONG_BUY" in signal_type:
            emoji = "🟢🟢"
            action = "STRONG BUY"
        elif "BUY" in signal_type:
            emoji = "🟢"
            action = "BUY"
        elif "STRONG_SELL" in signal_type:
            emoji = "🔴🔴"
            action = "STRONG SELL"
        elif "SELL" in signal_type:
            emoji = "🔴"
            action = "SELL"
        else:
            emoji = "🟡"
            action = "HOLD"
        
        # Calculate percentages
        target_pct = ((target / price) - 1) * 100
        sl_pct = ((stop_loss / price) - 1) * 100
        
        message = f"""
{emoji} <b>VN30-QUANTUM SIGNAL</b> {emoji}

📊 <b>{symbol}</b> - {action}
💰 Giá hiện tại: <code>{price:,.0f}</code> VND

🎯 Target: <code>{target:,.0f}</code> ({target_pct:+.1f}%)
🛑 Stop Loss: <code>{stop_loss:,.0f}</code> ({sl_pct:+.1f}%)
📈 Độ tin cậy: <b>{confidence:.0%}</b>
"""
        
        if reasoning:
            message += "\n<b>📋 Lý do:</b>\n"
            for reason in reasoning[:3]:  # Max 3 reasons
                message += f"• {reason}\n"
        
        message += f"\n⏰ {datetime.now().strftime('%H:%M:%S %d/%m/%Y')}"
        
        return message.strip()
    
    def format_price_alert(
        self,
        symbol: str,
        current_price: float,
        target_price: float,
        alert_type: str  # "above" or "below"
    ) -> str:
        """Format price target alert"""
        
        emoji = "📈" if alert_type == "above" else "📉"
        direction = "vượt" if alert_type == "above" else "giảm dưới"
        
        return f"""
{emoji} <b>CẢNH BÁO GIÁ</b> {emoji}

📊 <b>{symbol}</b> đã {direction} mục tiêu!

💰 Giá hiện tại: <code>{current_price:,.0f}</code> VND
🎯 Mục tiêu: <code>{target_price:,.0f}</code> VND

⏰ {datetime.now().strftime('%H:%M:%S %d/%m/%Y')}
""".strip()
    
    def format_volume_alert(
        self,
        symbol: str,
        current_volume: float,
        avg_volume: float,
        ratio: float
    ) -> str:
        """Format volume spike alert"""
        
        return f"""
📊 <b>CẢNH BÁO KHỐI LƯỢNG</b> 📊

📈 <b>{symbol}</b> - Volume tăng đột biến!

📦 Volume hiện tại: <code>{current_volume:,.0f}</code>
📊 Volume trung bình: <code>{avg_volume:,.0f}</code>
⚡ Tỷ lệ: <b>{ratio:.1f}x</b>

💡 <i>Có thể có tin quan trọng hoặc dòng tiền lớn</i>

⏰ {datetime.now().strftime('%H:%M:%S %d/%m/%Y')}
""".strip()
    
    def format_market_overview(
        self,
        buy_count: int,
        sell_count: int,
        hold_count: int,
        sentiment: str,
        top_buys: List[Dict] = None,
        top_sells: List[Dict] = None
    ) -> str:
        """Format daily market overview"""
        
        total = buy_count + sell_count + hold_count
        
        message = f"""
📊 <b>VN30 DAILY OVERVIEW</b> 📊

🟢 Mua: {buy_count}/{total}
🔴 Bán: {sell_count}/{total}
🟡 Giữ: {hold_count}/{total}

📈 Xu hướng: <b>{sentiment}</b>
"""
        
        if top_buys:
            message += "\n<b>Top MUA:</b>\n"
            for stock in top_buys[:3]:
                message += f"  🟢 {stock['symbol']}: {stock.get('confidence', 0):.0%}\n"
        
        if top_sells:
            message += "\n<b>Top BÁN:</b>\n"
            for stock in top_sells[:3]:
                message += f"  🔴 {stock['symbol']}: {stock.get('confidence', 0):.0%}\n"
        
        message += f"\n⏰ {datetime.now().strftime('%H:%M:%S %d/%m/%Y')}"
        
        return message.strip()
    
    # ============== Send Alerts ==============
    
    async def send_signal_alert(self, **kwargs) -> Dict:
        """Send trading signal alert"""
        message = self.format_signal_alert(**kwargs)
        return await self.send_message(message)
    
    async def send_price_alert(self, **kwargs) -> Dict:
        """Send price target alert"""
        message = self.format_price_alert(**kwargs)
        return await self.send_message(message)
    
    async def send_volume_alert(self, **kwargs) -> Dict:
        """Send volume spike alert"""
        message = self.format_volume_alert(**kwargs)
        return await self.send_message(message)
    
    async def send_market_overview(self, **kwargs) -> Dict:
        """Send market overview"""
        message = self.format_market_overview(**kwargs)
        return await self.send_message(message)


# Default bot instance
telegram_bot = TelegramBot()
