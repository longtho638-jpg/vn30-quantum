"""
VN30-Quantum Email Alerts
Email notifications via SendGrid
"""
import asyncio
from typing import List, Dict, Optional
from dataclasses import dataclass
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from .config import email_config

# Try to import sendgrid
try:
    from sendgrid import SendGridAPIClient
    from sendgrid.helpers.mail import Mail, Email, To, Content
    SENDGRID_AVAILABLE = True
except ImportError:
    SENDGRID_AVAILABLE = False


@dataclass
class EmailAlert:
    """Email alert structure"""
    to_email: str
    subject: str
    html_content: str
    text_content: Optional[str] = None


class EmailService:
    """
    Email service for VN30-Quantum alerts
    Uses SendGrid for delivery
    """
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or email_config.api_key
        self.from_email = email_config.from_email
        self.from_name = email_config.from_name
        self.enabled = email_config.enabled and email_config.is_configured and SENDGRID_AVAILABLE
        
        if self.enabled:
            self.client = SendGridAPIClient(self.api_key)
    
    def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: str = None
    ) -> Dict:
        """Send email via SendGrid"""
        if not self.enabled:
            return {"success": False, "error": "Email not configured"}
        
        try:
            message = Mail(
                from_email=Email(self.from_email, self.from_name),
                to_emails=To(to_email),
                subject=subject,
                html_content=Content("text/html", html_content)
            )
            
            if text_content:
                message.add_content(Content("text/plain", text_content))
            
            response = self.client.send(message)
            
            return {
                "success": True,
                "status_code": response.status_code
            }
        
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    # ============== Email Templates ==============
    
    def create_signal_email(
        self,
        symbol: str,
        signal_type: str,
        price: float,
        target: float,
        stop_loss: float,
        confidence: float,
        reasoning: List[str] = None
    ) -> tuple[str, str]:
        """Create signal alert email (subject, html)"""
        
        # Determine colors
        if "BUY" in signal_type:
            color = "#00C853"
            action = "MUA" if "STRONG" not in signal_type else "MUA MẠNH"
        elif "SELL" in signal_type:
            color = "#FF1744"
            action = "BÁN" if "STRONG" not in signal_type else "BÁN MẠNH"
        else:
            color = "#FFD600"
            action = "GIỮ"
        
        target_pct = ((target / price) - 1) * 100
        sl_pct = ((stop_loss / price) - 1) * 100
        
        subject = f"🚨 VN30-Quantum: {symbol} - Tín hiệu {action}"
        
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #1a1a2e; color: #eee; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, {color}, {color}dd); padding: 20px; border-radius: 10px; text-align: center; }}
        .content {{ background: #16213e; padding: 20px; border-radius: 10px; margin-top: 20px; }}
        .metric {{ display: inline-block; width: 45%; padding: 15px; margin: 5px; background: #0f3460; border-radius: 8px; }}
        .value {{ font-size: 24px; font-weight: bold; color: {color}; }}
        .label {{ color: #888; font-size: 12px; }}
        .reasoning {{ background: #0f3460; padding: 15px; border-radius: 8px; margin-top: 15px; }}
        .footer {{ text-align: center; color: #666; font-size: 12px; margin-top: 20px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin:0; color: white;">{symbol}</h1>
            <h2 style="margin:10px 0 0; color: white;">{action}</h2>
        </div>
        
        <div class="content">
            <div class="metric">
                <div class="label">Giá hiện tại</div>
                <div class="value">{price:,.0f} VND</div>
            </div>
            <div class="metric">
                <div class="label">Độ tin cậy</div>
                <div class="value">{confidence:.0%}</div>
            </div>
            <div class="metric">
                <div class="label">Target</div>
                <div class="value">{target:,.0f} ({target_pct:+.1f}%)</div>
            </div>
            <div class="metric">
                <div class="label">Stop Loss</div>
                <div class="value">{stop_loss:,.0f} ({sl_pct:+.1f}%)</div>
            </div>
            
            <div class="reasoning">
                <strong>Lý do:</strong>
                <ul>
                    {"".join(f"<li>{r}</li>" for r in (reasoning or ["Phân tích kỹ thuật"])[:3])}
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <p>VN30-Quantum Trading Signals</p>
            <p>{datetime.now().strftime('%H:%M:%S %d/%m/%Y')}</p>
        </div>
    </div>
</body>
</html>
"""
        
        return subject, html
    
    def create_daily_summary_email(
        self,
        buy_count: int,
        sell_count: int,
        hold_count: int,
        top_signals: List[Dict]
    ) -> tuple[str, str]:
        """Create daily summary email"""
        
        subject = f"📊 VN30-Quantum: Tổng hợp ngày {datetime.now().strftime('%d/%m/%Y')}"
        
        total = buy_count + sell_count + hold_count
        
        signals_html = ""
        for s in top_signals[:5]:
            color = "#00C853" if "BUY" in s.get('signal', '') else "#FF1744" if "SELL" in s.get('signal', '') else "#FFD600"
            signals_html += f"""
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #333;">{s.get('symbol', 'N/A')}</td>
                <td style="padding: 10px; border-bottom: 1px solid #333; color: {color};">{s.get('signal', 'N/A')}</td>
                <td style="padding: 10px; border-bottom: 1px solid #333;">{s.get('confidence', 0):.0%}</td>
            </tr>
            """
        
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #1a1a2e; color: #eee; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea, #764ba2); padding: 20px; border-radius: 10px; text-align: center; }}
        .stats {{ display: flex; justify-content: space-around; margin: 20px 0; }}
        .stat {{ text-align: center; padding: 15px; background: #16213e; border-radius: 8px; flex: 1; margin: 0 5px; }}
        .stat-value {{ font-size: 28px; font-weight: bold; }}
        table {{ width: 100%; background: #16213e; border-radius: 8px; }}
        th {{ background: #0f3460; padding: 12px; text-align: left; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin:0; color: white;">VN30 Daily Summary</h1>
            <p style="color: #ddd;">{datetime.now().strftime('%d/%m/%Y')}</p>
        </div>
        
        <div class="stats">
            <div class="stat">
                <div class="stat-value" style="color: #00C853;">🟢 {buy_count}</div>
                <div>Mua</div>
            </div>
            <div class="stat">
                <div class="stat-value" style="color: #FF1744;">🔴 {sell_count}</div>
                <div>Bán</div>
            </div>
            <div class="stat">
                <div class="stat-value" style="color: #FFD600;">🟡 {hold_count}</div>
                <div>Giữ</div>
            </div>
        </div>
        
        <h3>Top Tín Hiệu Hôm Nay</h3>
        <table>
            <tr>
                <th>Mã CK</th>
                <th>Tín hiệu</th>
                <th>Độ tin cậy</th>
            </tr>
            {signals_html}
        </table>
        
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            VN30-Quantum Trading Signals
        </div>
    </div>
</body>
</html>
"""
        
        return subject, html
    
    # ============== Send Alerts ==============
    
    def send_signal_alert(
        self,
        to_email: str,
        **kwargs
    ) -> Dict:
        """Send signal alert email"""
        subject, html = self.create_signal_email(**kwargs)
        return self.send_email(to_email, subject, html)
    
    def send_daily_summary(
        self,
        to_email: str,
        **kwargs
    ) -> Dict:
        """Send daily summary email"""
        subject, html = self.create_daily_summary_email(**kwargs)
        return self.send_email(to_email, subject, html)


# Default email service
email_service = EmailService()
