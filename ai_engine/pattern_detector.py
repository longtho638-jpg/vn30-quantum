"""
VN30-Quantum AI Engine - Pattern Detector
Detects chart patterns and candlestick formations
"""
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import numpy as np


class PatternType(Enum):
    # Bullish patterns
    DOUBLE_BOTTOM = "double_bottom"
    HEAD_SHOULDERS_INVERSE = "inverse_head_shoulders"
    ASCENDING_TRIANGLE = "ascending_triangle"
    BULLISH_ENGULFING = "bullish_engulfing"
    HAMMER = "hammer"
    MORNING_STAR = "morning_star"
    
    # Bearish patterns
    DOUBLE_TOP = "double_top"
    HEAD_SHOULDERS = "head_shoulders"
    DESCENDING_TRIANGLE = "descending_triangle"
    BEARISH_ENGULFING = "bearish_engulfing"
    SHOOTING_STAR = "shooting_star"
    EVENING_STAR = "evening_star"
    
    # Continuation patterns
    FLAG = "flag"
    PENNANT = "pennant"
    CHANNEL = "channel"


@dataclass
class PatternResult:
    """Detected pattern result"""
    pattern_type: PatternType
    confidence: float  # 0.0 to 1.0
    is_bullish: bool
    description: str
    target_price: Optional[float] = None
    stop_loss: Optional[float] = None


class PatternDetector:
    """
    Chart Pattern Detection Engine
    Detects various chart patterns and candlestick formations
    """
    
    def detect_all_patterns(
        self,
        opens: List[float],
        highs: List[float],
        lows: List[float],
        closes: List[float]
    ) -> List[PatternResult]:
        """Detect all patterns in the price data"""
        patterns = []
        
        # Candlestick patterns (require OHLC)
        candlestick = self.detect_candlestick_patterns(opens, highs, lows, closes)
        patterns.extend(candlestick)
        
        # Chart patterns
        chart = self.detect_chart_patterns(closes, highs, lows)
        patterns.extend(chart)
        
        # Sort by confidence
        patterns.sort(key=lambda p: p.confidence, reverse=True)
        
        return patterns
    
    def detect_candlestick_patterns(
        self,
        opens: List[float],
        highs: List[float],
        lows: List[float],
        closes: List[float]
    ) -> List[PatternResult]:
        """Detect candlestick patterns"""
        patterns = []
        
        if len(closes) < 3:
            return patterns
        
        # Get last 3 candles
        o1, o2, o3 = opens[-3], opens[-2], opens[-1]
        h1, h2, h3 = highs[-3], highs[-2], highs[-1]
        l1, l2, l3 = lows[-3], lows[-2], lows[-1]
        c1, c2, c3 = closes[-3], closes[-2], closes[-1]
        
        # Hammer (bullish reversal)
        body = abs(c3 - o3)
        lower_shadow = min(o3, c3) - l3
        upper_shadow = h3 - max(o3, c3)
        
        if body > 0 and lower_shadow >= body * 2 and upper_shadow <= body * 0.5:
            patterns.append(PatternResult(
                pattern_type=PatternType.HAMMER,
                confidence=0.7,
                is_bullish=True,
                description="HAMMER: Mô hình đảo chiều tăng. Lực mua mạnh cuối phiên."
            ))
        
        # Shooting Star (bearish reversal)
        if body > 0 and upper_shadow >= body * 2 and lower_shadow <= body * 0.5:
            patterns.append(PatternResult(
                pattern_type=PatternType.SHOOTING_STAR,
                confidence=0.7,
                is_bullish=False,
                description="SHOOTING STAR: Mô hình đảo chiều giảm. Lực bán mạnh cuối phiên."
            ))
        
        # Bullish Engulfing
        if c2 < o2 and c3 > o3 and o3 < c2 and c3 > o2:
            patterns.append(PatternResult(
                pattern_type=PatternType.BULLISH_ENGULFING,
                confidence=0.75,
                is_bullish=True,
                description="BULLISH ENGULFING: Nến xanh nuốt chửng nến đỏ. Tín hiệu đảo chiều mạnh."
            ))
        
        # Bearish Engulfing
        if c2 > o2 and c3 < o3 and o3 > c2 and c3 < o2:
            patterns.append(PatternResult(
                pattern_type=PatternType.BEARISH_ENGULFING,
                confidence=0.75,
                is_bullish=False,
                description="BEARISH ENGULFING: Nến đỏ nuốt chửng nến xanh. Tín hiệu đảo chiều giảm."
            ))
        
        # Morning Star (bullish reversal)
        if c1 < o1 and abs(c2 - o2) < (h2 - l2) * 0.3 and c3 > o3 and c3 > (o1 + c1) / 2:
            patterns.append(PatternResult(
                pattern_type=PatternType.MORNING_STAR,
                confidence=0.8,
                is_bullish=True,
                description="MORNING STAR: Mô hình sao mai. Tín hiệu đảo chiều tăng mạnh."
            ))
        
        # Evening Star (bearish reversal)
        if c1 > o1 and abs(c2 - o2) < (h2 - l2) * 0.3 and c3 < o3 and c3 < (o1 + c1) / 2:
            patterns.append(PatternResult(
                pattern_type=PatternType.EVENING_STAR,
                confidence=0.8,
                is_bullish=False,
                description="EVENING STAR: Mô hình sao hôm. Tín hiệu đảo chiều giảm mạnh."
            ))
        
        return patterns
    
    def detect_chart_patterns(
        self,
        closes: List[float],
        highs: List[float] = None,
        lows: List[float] = None
    ) -> List[PatternResult]:
        """Detect larger chart patterns"""
        patterns = []
        
        if len(closes) < 20:
            return patterns
        
        highs = highs or closes
        lows = lows or closes
        
        # Double Bottom detection
        double_bottom = self._detect_double_bottom(closes, lows)
        if double_bottom:
            patterns.append(double_bottom)
        
        # Double Top detection
        double_top = self._detect_double_top(closes, highs)
        if double_top:
            patterns.append(double_top)
        
        return patterns
    
    def _detect_double_bottom(
        self,
        closes: List[float],
        lows: List[float]
    ) -> Optional[PatternResult]:
        """Detect double bottom pattern"""
        if len(lows) < 30:
            return None
        
        recent_lows = lows[-30:]
        
        # Find two local minimums
        min_indices = []
        for i in range(2, len(recent_lows) - 2):
            if (recent_lows[i] < recent_lows[i-1] and 
                recent_lows[i] < recent_lows[i-2] and
                recent_lows[i] < recent_lows[i+1] and 
                recent_lows[i] < recent_lows[i+2]):
                min_indices.append(i)
        
        if len(min_indices) >= 2:
            low1 = recent_lows[min_indices[-2]]
            low2 = recent_lows[min_indices[-1]]
            
            # Check if lows are similar (within 3%)
            if abs(low1 - low2) / low1 < 0.03:
                current_price = closes[-1]
                neckline = max(closes[min_indices[-2]:min_indices[-1]])
                
                if current_price > neckline:
                    target = neckline + (neckline - low2)
                    return PatternResult(
                        pattern_type=PatternType.DOUBLE_BOTTOM,
                        confidence=0.7,
                        is_bullish=True,
                        description=f"DOUBLE BOTTOM: Đáy đôi tại {low2:,.0f}. Target: {target:,.0f}",
                        target_price=target,
                        stop_loss=low2 * 0.98
                    )
        
        return None
    
    def _detect_double_top(
        self,
        closes: List[float],
        highs: List[float]
    ) -> Optional[PatternResult]:
        """Detect double top pattern"""
        if len(highs) < 30:
            return None
        
        recent_highs = highs[-30:]
        
        # Find two local maximums
        max_indices = []
        for i in range(2, len(recent_highs) - 2):
            if (recent_highs[i] > recent_highs[i-1] and 
                recent_highs[i] > recent_highs[i-2] and
                recent_highs[i] > recent_highs[i+1] and 
                recent_highs[i] > recent_highs[i+2]):
                max_indices.append(i)
        
        if len(max_indices) >= 2:
            high1 = recent_highs[max_indices[-2]]
            high2 = recent_highs[max_indices[-1]]
            
            # Check if highs are similar (within 3%)
            if abs(high1 - high2) / high1 < 0.03:
                current_price = closes[-1]
                neckline = min(closes[max_indices[-2]:max_indices[-1]])
                
                if current_price < neckline:
                    target = neckline - (high2 - neckline)
                    return PatternResult(
                        pattern_type=PatternType.DOUBLE_TOP,
                        confidence=0.7,
                        is_bullish=False,
                        description=f"DOUBLE TOP: Đỉnh đôi tại {high2:,.0f}. Target: {target:,.0f}",
                        target_price=target,
                        stop_loss=high2 * 1.02
                    )
        
        return None
    
    def get_pattern_summary(self, patterns: List[PatternResult]) -> str:
        """Get a summary of detected patterns"""
        if not patterns:
            return "Không phát hiện mô hình giá đáng chú ý."
        
        bullish = [p for p in patterns if p.is_bullish]
        bearish = [p for p in patterns if not p.is_bullish]
        
        summary = []
        
        if bullish:
            summary.append(f"🟢 {len(bullish)} mô hình TĂNG: {', '.join([p.pattern_type.value for p in bullish])}")
        
        if bearish:
            summary.append(f"🔴 {len(bearish)} mô hình GIẢM: {', '.join([p.pattern_type.value for p in bearish])}")
        
        return " | ".join(summary)
