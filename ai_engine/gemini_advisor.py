"""
VN30-Quantum AI Engine - Gemini AI Advisor
AI-powered market analysis using Google Gemini
"""
import os
import json
from typing import Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False


@dataclass
class AIAnalysis:
    """AI-generated market analysis"""
    symbol: str
    summary: str
    sentiment: str  # bullish, bearish, neutral
    key_insights: List[str]
    risks: List[str]
    opportunities: List[str]
    recommendation: str
    confidence: float
    generated_at: datetime


class GeminiAdvisor:
    """
    Gemini AI-powered trading advisor
    Provides market analysis and recommendations in Vietnamese
    """
    
    SYSTEM_PROMPT = """Bạn là một chuyên gia phân tích chứng khoán Việt Nam với 20 năm kinh nghiệm.
Bạn phân tích dữ liệu kỹ thuật và đưa ra nhận định chuyên nghiệp.

Quy tắc:
1. Phân tích khách quan dựa trên dữ liệu
2. Cảnh báo rủi ro rõ ràng  
3. Không đảm bảo lợi nhuận
4. Sử dụng thuật ngữ chứng khoán VN
5. Output JSON format

Bạn PHẢI trả lời bằng JSON với cấu trúc:
{
  "sentiment": "bullish" | "bearish" | "neutral",
  "summary": "Tóm tắt ngắn gọn 2-3 câu",
  "key_insights": ["insight 1", "insight 2", "insight 3"],
  "risks": ["risk 1", "risk 2"],
  "opportunities": ["opportunity 1", "opportunity 2"],
  "recommendation": "Khuyến nghị cụ thể",
  "confidence": 0.0-1.0
}"""

    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY', '')
        self.model = None
        
        if GEMINI_AVAILABLE and self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
            except Exception as e:
                print(f"⚠️ Gemini init error: {e}")
    
    def analyze_stock(
        self,
        symbol: str,
        prices: List[float],
        volumes: List[float],
        indicators: Dict,
        signal_type: str,
        confidence: float
    ) -> AIAnalysis:
        """
        Get AI analysis for a stock
        """
        if not self.model:
            return self._fallback_analysis(symbol, signal_type, confidence)
        
        # Prepare data for AI
        prompt = self._create_prompt(symbol, prices, volumes, indicators, signal_type, confidence)
        
        try:
            response = self.model.generate_content(
                [self.SYSTEM_PROMPT, prompt],
                generation_config={
                    'temperature': 0.7,
                    'max_output_tokens': 1024
                }
            )
            
            result = self._parse_response(response.text)
            
            return AIAnalysis(
                symbol=symbol,
                summary=result.get('summary', 'Không có phân tích'),
                sentiment=result.get('sentiment', 'neutral'),
                key_insights=result.get('key_insights', []),
                risks=result.get('risks', []),
                opportunities=result.get('opportunities', []),
                recommendation=result.get('recommendation', 'Theo dõi thêm'),
                confidence=result.get('confidence', 0.5),
                generated_at=datetime.now()
            )
        
        except Exception as e:
            print(f"⚠️ Gemini API error: {e}")
            return self._fallback_analysis(symbol, signal_type, confidence)
    
    def _create_prompt(
        self,
        symbol: str,
        prices: List[float],
        volumes: List[float],
        indicators: Dict,
        signal_type: str,
        confidence: float
    ) -> str:
        """Create analysis prompt"""
        
        # Price statistics
        current_price = prices[-1] if prices else 0
        price_change_1d = ((prices[-1] / prices[-2]) - 1) * 100 if len(prices) >= 2 else 0
        price_change_5d = ((prices[-1] / prices[-5]) - 1) * 100 if len(prices) >= 5 else 0
        
        # Format indicators
        indicator_text = ""
        for name, ind in indicators.items():
            if hasattr(ind, 'description'):
                indicator_text += f"- {ind.name}: {ind.description} (Signal: {ind.signal.name})\n"
        
        prompt = f"""
Phân tích cổ phiếu {symbol}:

📊 DỮ LIỆU GIÁ:
- Giá hiện tại: {current_price:,.0f} VND
- Thay đổi 1 ngày: {price_change_1d:+.2f}%
- Thay đổi 5 ngày: {price_change_5d:+.2f}%
- Volume trung bình: {sum(volumes[-5:])/5:,.0f} if volumes else 'N/A'

📈 CHỈ BÁO KỸ THUẬT:
{indicator_text}

🎯 TÍN HIỆU:
- Loại: {signal_type}
- Độ tin cậy: {confidence:.0%}

Hãy phân tích và đưa ra nhận định chi tiết.
"""
        return prompt
    
    def _parse_response(self, text: str) -> Dict:
        """Parse AI response to JSON"""
        try:
            # Remove markdown code blocks if present
            if '```json' in text:
                text = text.split('```json')[1].split('```')[0]
            elif '```' in text:
                text = text.split('```')[1].split('```')[0]
            
            return json.loads(text.strip())
        except:
            return {}
    
    def _fallback_analysis(
        self,
        symbol: str,
        signal_type: str,
        confidence: float
    ) -> AIAnalysis:
        """Fallback when AI is unavailable"""
        
        sentiment = "bullish" if "BUY" in signal_type else "bearish" if "SELL" in signal_type else "neutral"
        
        return AIAnalysis(
            symbol=symbol,
            summary=f"Cổ phiếu {symbol} đang có tín hiệu {signal_type} với độ tin cậy {confidence:.0%}",
            sentiment=sentiment,
            key_insights=[
                "Phân tích dựa trên chỉ báo kỹ thuật",
                "Cần theo dõi khối lượng giao dịch",
                "Xem xét bối cảnh thị trường chung"
            ],
            risks=[
                "Biến động thị trường có thể ảnh hưởng",
                "Thông tin chưa phản ánh đầy đủ yếu tố vĩ mô"
            ],
            opportunities=[
                f"Tín hiệu {signal_type} từ phân tích kỹ thuật",
                "Tiềm năng theo xu hướng ngắn hạn"
            ],
            recommendation="Theo dõi diễn biến và khối lượng giao dịch trước khi quyết định",
            confidence=confidence,
            generated_at=datetime.now()
        )
    
    def get_market_overview(self, stock_signals: List[Dict]) -> str:
        """Get overall market analysis"""
        if not self.model:
            return self._fallback_market_overview(stock_signals)
        
        # Count signals
        buys = sum(1 for s in stock_signals if 'BUY' in s.get('signal', ''))
        sells = sum(1 for s in stock_signals if 'SELL' in s.get('signal', ''))
        holds = len(stock_signals) - buys - sells
        
        prompt = f"""
Tổng quan thị trường VN30 hôm nay:

📊 THỐNG KÊ TÍN HIỆU:
- Tín hiệu MUA: {buys} cổ phiếu
- Tín hiệu BÁN: {sells} cổ phiếu
- Trung lập: {holds} cổ phiếu

Hãy đưa ra nhận định tổng quan thị trường VN30 trong 3-4 câu.
"""
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return self._fallback_market_overview(stock_signals)
    
    def _fallback_market_overview(self, stock_signals: List[Dict]) -> str:
        """Fallback market overview"""
        buys = sum(1 for s in stock_signals if 'BUY' in s.get('signal', ''))
        sells = sum(1 for s in stock_signals if 'SELL' in s.get('signal', ''))
        
        if buys > sells * 1.5:
            return f"🟢 Thị trường VN30 có xu hướng TÍCH CỰC với {buys} tín hiệu mua so với {sells} tín hiệu bán."
        elif sells > buys * 1.5:
            return f"🔴 Thị trường VN30 có xu hướng TIÊU CỰC với {sells} tín hiệu bán so với {buys} tín hiệu mua."
        else:
            return f"🟡 Thị trường VN30 đang GIẰNG CO với {buys} mua, {sells} bán. Cần theo dõi thêm."
