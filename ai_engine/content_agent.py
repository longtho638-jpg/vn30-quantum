"""
VN30-Quantum AI Content Generator
Uses Claude/Gemini to generate daily market analysis
"""

import os
import json
from datetime import datetime
from typing import Optional
import requests

# API Configuration
CLAUDE_API_KEY = os.environ.get('CLAUDE_API_KEY', '')
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')

class ContentGeneratorAgent:
    """AI Agent for generating market content"""
    
    def __init__(self):
        self.claude_api_key = CLAUDE_API_KEY
        self.gemini_api_key = GEMINI_API_KEY
        
    def generate_daily_analysis(self, market_data: dict) -> str:
        """Generate daily market analysis in Vietnamese"""
        
        prompt = f"""
        Bạn là chuyên gia phân tích thị trường chứng khoán Việt Nam.
        
        Dữ liệu thị trường hôm nay:
        - Top tăng: {market_data.get('top_gainers', [])}
        - Top giảm: {market_data.get('top_losers', [])}
        - Tín hiệu STRONG_BUY: {market_data.get('strong_buy_count', 0)}
        - Tín hiệu STRONG_SELL: {market_data.get('strong_sell_count', 0)}
        - VN-Index: {market_data.get('vn_index', 'N/A')}
        
        Hãy viết một bài phân tích thị trường ngắn gọn (~200 từ) bao gồm:
        1. Tóm tắt diễn biến thị trường
        2. Các cổ phiếu đáng chú ý
        3. Khuyến nghị cho nhà đầu tư
        
        Viết bằng tiếng Việt, giọng văn chuyên nghiệp nhưng dễ hiểu.
        """
        
        # Try Claude first, fallback to Gemini
        if self.claude_api_key:
            return self._call_claude(prompt)
        elif self.gemini_api_key:
            return self._call_gemini(prompt)
        else:
            return self._generate_fallback(market_data)
    
    def generate_stock_report(self, symbol: str, data: dict) -> str:
        """Generate detailed analysis for a specific stock"""
        
        prompt = f"""
        Bạn là chuyên gia phân tích kỹ thuật chứng khoán.
        
        Dữ liệu cổ phiếu {symbol}:
        - Giá hiện tại: {data.get('price', 'N/A')}
        - RSI: {data.get('rsi', 'N/A')}
        - MACD: {data.get('macd', 'N/A')}
        - Bollinger: {data.get('bb_position', 'N/A')}
        - AI Predicted Price: {data.get('predicted_price', 'N/A')}
        - Signal: {data.get('signal', 'N/A')}
        
        Viết báo cáo phân tích ngắn (~150 từ) bằng tiếng Việt về:
        1. Tín hiệu từ các chỉ báo kỹ thuật
        2. Nhận định xu hướng ngắn hạn
        3. Mức giá mục tiêu và stop-loss đề xuất
        
        Lưu ý: Đây chỉ là phân tích tham khảo, không phải khuyến nghị đầu tư.
        """
        
        if self.claude_api_key:
            return self._call_claude(prompt)
        elif self.gemini_api_key:
            return self._call_gemini(prompt)
        else:
            return self._generate_stock_fallback(symbol, data)
    
    def generate_telegram_alert(self, signal: dict) -> str:
        """Generate formatted Telegram alert message"""
        
        action = signal.get('signal', 'NEUTRAL')
        symbol = signal.get('symbol', 'N/A')
        price = signal.get('price', 0)
        predicted = signal.get('predicted_price', 0)
        rsi = signal.get('rsi', 50)
        
        # Calculate prediction change
        if price > 0 and predicted > 0:
            change_pct = ((predicted - price) / price) * 100
            direction = "↑" if change_pct > 0 else "↓"
        else:
            change_pct = 0
            direction = "→"
        
        # Emoji based on signal
        emoji_map = {
            'STRONG_BUY': '🚀🟢',
            'BUY': '📈🟢',
            'NEUTRAL': '➡️🟡',
            'SELL': '📉🔴',
            'STRONG_SELL': '🔻🔴',
        }
        action_emoji = emoji_map.get(action, '📊')
        
        message = f"""
{action_emoji} TÍN HIỆU VN30: {symbol}
━━━━━━━━━━━━━━━━━━
⚡ Action: {action}
💰 Giá hiện tại: {price:,.0f} VND
🔮 AI Dự báo: {predicted:,.0f} ({direction}{abs(change_pct):.2f}%)
📈 RSI: {rsi:.1f}
━━━━━━━━━━━━━━━━━━
🤖 VN30-Quantum Oracle
⏰ {datetime.now().strftime('%H:%M:%S %d/%m/%Y')}
"""
        return message.strip()
    
    def generate_weekly_summary(self, weekly_data: dict) -> str:
        """Generate weekly performance summary"""
        
        prompt = f"""
        Tạo báo cáo tổng kết tuần cho VN30-Quantum:
        
        - Tổng số tín hiệu: {weekly_data.get('total_signals', 0)}
        - Tín hiệu BUY: {weekly_data.get('buy_signals', 0)}
        - Tín hiệu SELL: {weekly_data.get('sell_signals', 0)}
        - Top performers: {weekly_data.get('top_performers', [])}
        - Độ chính xác AI: {weekly_data.get('ai_accuracy', 0)}%
        
        Viết báo cáo ngắn gọn (~100 từ) bằng tiếng Việt.
        """
        
        if self.claude_api_key:
            return self._call_claude(prompt)
        else:
            return f"""
📊 BÁO CÁO TUẦN VN30-QUANTUM

📈 Tổng tín hiệu: {weekly_data.get('total_signals', 0)}
🟢 Buy: {weekly_data.get('buy_signals', 0)} | 🔴 Sell: {weekly_data.get('sell_signals', 0)}
🎯 Độ chính xác AI: {weekly_data.get('ai_accuracy', 0)}%

Cảm ơn bạn đã tin tưởng VN30-Quantum!
"""

    def _call_claude(self, prompt: str) -> str:
        """Call Claude API"""
        try:
            response = requests.post(
                'https://api.anthropic.com/v1/messages',
                headers={
                    'x-api-key': self.claude_api_key,
                    'content-type': 'application/json',
                    'anthropic-version': '2023-06-01',
                },
                json={
                    'model': 'claude-3-haiku-20240307',
                    'max_tokens': 1024,
                    'messages': [{'role': 'user', 'content': prompt}],
                },
                timeout=30,
            )
            
            if response.status_code == 200:
                data = response.json()
                return data['content'][0]['text']
            else:
                print(f"Claude API error: {response.status_code}")
                return self._generate_fallback({})
        except Exception as e:
            print(f"Claude API exception: {e}")
            return self._generate_fallback({})
    
    def _call_gemini(self, prompt: str) -> str:
        """Call Gemini API"""
        try:
            response = requests.post(
                f'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={self.gemini_api_key}',
                headers={'Content-Type': 'application/json'},
                json={
                    'contents': [{'parts': [{'text': prompt}]}],
                },
                timeout=30,
            )
            
            if response.status_code == 200:
                data = response.json()
                return data['candidates'][0]['content']['parts'][0]['text']
            else:
                print(f"Gemini API error: {response.status_code}")
                return self._generate_fallback({})
        except Exception as e:
            print(f"Gemini API exception: {e}")
            return self._generate_fallback({})
    
    def _generate_fallback(self, data: dict) -> str:
        """Generate fallback content without AI"""
        now = datetime.now()
        return f"""
📊 PHÂN TÍCH THỊ TRƯỜNG - {now.strftime('%d/%m/%Y')}

Thị trường VN30 hôm nay ghi nhận nhiều diễn biến đáng chú ý.

🔹 Các tín hiệu STRONG_BUY: {data.get('strong_buy_count', 0)} mã
🔹 Các tín hiệu STRONG_SELL: {data.get('strong_sell_count', 0)} mã

Nhà đầu tư nên theo dõi sát tín hiệu và quản lý rủi ro chặt chẽ.

Xem chi tiết tại dashboard VN30-Quantum.
"""

    def _generate_stock_fallback(self, symbol: str, data: dict) -> str:
        """Generate fallback stock report"""
        signal = data.get('signal', 'NEUTRAL')
        rsi = data.get('rsi', 50)
        
        rsi_note = "trong vùng trung tính"
        if rsi < 30:
            rsi_note = "trong vùng QUÁ BÁN"
        elif rsi > 70:
            rsi_note = "trong vùng QUÁ MUA"
        
        return f"""
📈 PHÂN TÍCH {symbol}

Tín hiệu: {signal}
RSI ({rsi:.1f}) {rsi_note}

Dự báo AI: {data.get('predicted_price', 'N/A')}

⚠️ Đây là phân tích tham khảo, không phải khuyến nghị đầu tư.
"""


# Export instance
content_agent = ContentGeneratorAgent()

if __name__ == '__main__':
    # Test
    agent = ContentGeneratorAgent()
    
    # Test Telegram alert
    test_signal = {
        'symbol': 'HPG',
        'signal': 'STRONG_BUY',
        'price': 25000,
        'predicted_price': 25750,
        'rsi': 28.5,
    }
    
    print(agent.generate_telegram_alert(test_signal))
