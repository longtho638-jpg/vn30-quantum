"""
VN30-Quantum AI Engine - Signal Generator
Combines multiple indicators to generate trading signals
"""
import os
from typing import List, Dict, Optional
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum

from .indicators import TechnicalIndicators, SignalStrength, IndicatorResult


class SignalType(Enum):
    STRONG_BUY = "STRONG_BUY"
    BUY = "BUY"
    HOLD = "HOLD"
    SELL = "SELL"
    STRONG_SELL = "STRONG_SELL"


@dataclass
class TradingSignal:
    """Trading signal with confidence and reasoning"""
    symbol: str
    signal_type: SignalType
    confidence: float  # 0.0 to 1.0
    price: float
    target_price: float
    stop_loss: float
    risk_reward_ratio: float
    indicators: Dict[str, IndicatorResult]
    reasoning: List[str]
    generated_at: datetime = field(default_factory=datetime.now)
    
    def to_dict(self) -> Dict:
        return {
            "symbol": self.symbol,
            "signal": self.signal_type.value,
            "confidence": f"{self.confidence:.0%}",
            "price": self.price,
            "target": self.target_price,
            "stop_loss": self.stop_loss,
            "risk_reward": f"{self.risk_reward_ratio:.2f}",
            "reasoning": self.reasoning,
            "generated_at": self.generated_at.isoformat()
        }


class SignalGenerator:
    """
    AI Signal Generator
    Combines technical indicators with weighted scoring
    """
    
    # Indicator weights for final signal
    INDICATOR_WEIGHTS = {
        'rsi': 0.25,
        'macd': 0.30,
        'bollinger': 0.20,
        'moving_averages': 0.15,
        'volume': 0.10
    }
    
    # Signal strength to score mapping
    SIGNAL_SCORES = {
        SignalStrength.STRONG_BUY: 2,
        SignalStrength.BUY: 1,
        SignalStrength.NEUTRAL: 0,
        SignalStrength.SELL: -1,
        SignalStrength.STRONG_SELL: -2
    }
    
    def __init__(self):
        self.indicators = TechnicalIndicators()
    
    def generate_signal(
        self,
        symbol: str,
        prices: List[float],
        volumes: List[float] = None,
        support_levels: List[float] = None,
        resistance_levels: List[float] = None
    ) -> TradingSignal:
        """
        Generate trading signal for a stock
        Combines multiple indicators with weighted scoring
        """
        if not prices or len(prices) < 2:
            return self._create_neutral_signal(symbol, 0)
        
        current_price = prices[-1]
        
        # Calculate all indicators
        indicator_results = self.indicators.calculate_all_indicators(prices, volumes)
        
        # Calculate weighted score
        total_score = 0.0
        total_weight = 0.0
        reasoning = []
        
        for indicator_name, result in indicator_results.items():
            weight = self.INDICATOR_WEIGHTS.get(indicator_name, 0.1)
            score = self.SIGNAL_SCORES.get(result.signal, 0)
            
            total_score += score * weight
            total_weight += weight
            
            # Add reasoning
            if result.signal != SignalStrength.NEUTRAL:
                direction = "🟢" if score > 0 else "🔴"
                reasoning.append(f"{direction} {result.name}: {result.description}")
        
        # Normalize score (-2 to +2 range)
        final_score = total_score / total_weight if total_weight > 0 else 0
        
        # Determine signal type and confidence
        signal_type, confidence = self._score_to_signal(final_score)
        
        # Calculate target and stop loss
        volatility = self._calculate_volatility(prices)
        target_price, stop_loss = self._calculate_levels(
            current_price, signal_type, volatility, support_levels, resistance_levels
        )
        
        # Risk/Reward ratio
        risk = abs(current_price - stop_loss)
        reward = abs(target_price - current_price)
        risk_reward = reward / risk if risk > 0 else 0
        
        return TradingSignal(
            symbol=symbol,
            signal_type=signal_type,
            confidence=confidence,
            price=current_price,
            target_price=target_price,
            stop_loss=stop_loss,
            risk_reward_ratio=risk_reward,
            indicators=indicator_results,
            reasoning=reasoning
        )
    
    def _score_to_signal(self, score: float) -> tuple[SignalType, float]:
        """Convert weighted score to signal type and confidence"""
        if score >= 1.5:
            return SignalType.STRONG_BUY, min(0.95, 0.7 + score * 0.1)
        elif score >= 0.5:
            return SignalType.BUY, min(0.85, 0.5 + score * 0.15)
        elif score <= -1.5:
            return SignalType.STRONG_SELL, min(0.95, 0.7 + abs(score) * 0.1)
        elif score <= -0.5:
            return SignalType.SELL, min(0.85, 0.5 + abs(score) * 0.15)
        else:
            return SignalType.HOLD, 0.5
    
    def _calculate_volatility(self, prices: List[float], period: int = 20) -> float:
        """Calculate price volatility (standard deviation percentage)"""
        if len(prices) < period:
            return 2.0  # Default 2%
        
        import numpy as np
        returns = np.diff(prices[-period:]) / prices[-period:-1]
        return np.std(returns) * 100
    
    def _calculate_levels(
        self,
        current_price: float,
        signal_type: SignalType,
        volatility: float,
        support_levels: List[float] = None,
        resistance_levels: List[float] = None
    ) -> tuple[float, float]:
        """Calculate target price and stop loss"""
        
        # Default based on volatility
        default_target_pct = max(3.0, volatility * 2)
        default_stop_pct = max(2.0, volatility * 1.5)
        
        if signal_type in [SignalType.STRONG_BUY, SignalType.BUY]:
            target = current_price * (1 + default_target_pct / 100)
            stop = current_price * (1 - default_stop_pct / 100)
            
            # Use resistance as target if available
            if resistance_levels:
                next_resistance = min([r for r in resistance_levels if r > current_price], default=target)
                target = next_resistance
            
            # Use support as stop if available
            if support_levels:
                nearest_support = max([s for s in support_levels if s < current_price], default=stop)
                stop = nearest_support * 0.99  # Slightly below support
        
        elif signal_type in [SignalType.STRONG_SELL, SignalType.SELL]:
            target = current_price * (1 - default_target_pct / 100)
            stop = current_price * (1 + default_stop_pct / 100)
            
            # Use support as target if available
            if support_levels:
                next_support = max([s for s in support_levels if s < current_price], default=target)
                target = next_support
            
            # Use resistance as stop if available
            if resistance_levels:
                nearest_resistance = min([r for r in resistance_levels if r > current_price], default=stop)
                stop = nearest_resistance * 1.01  # Slightly above resistance
        
        else:  # HOLD
            target = current_price
            stop = current_price * 0.95
        
        return round(target, 0), round(stop, 0)
    
    def _create_neutral_signal(self, symbol: str, price: float) -> TradingSignal:
        """Create a neutral/hold signal"""
        return TradingSignal(
            symbol=symbol,
            signal_type=SignalType.HOLD,
            confidence=0.5,
            price=price,
            target_price=price,
            stop_loss=price * 0.95,
            risk_reward_ratio=0,
            indicators={},
            reasoning=["Insufficient data for analysis"]
        )
    
    def batch_generate(
        self,
        stocks_data: Dict[str, Dict]
    ) -> List[TradingSignal]:
        """
        Generate signals for multiple stocks
        stocks_data format: {symbol: {"prices": [...], "volumes": [...]}}
        """
        signals = []
        
        for symbol, data in stocks_data.items():
            prices = data.get("prices", [])
            volumes = data.get("volumes", [])
            
            signal = self.generate_signal(symbol, prices, volumes)
            signals.append(signal)
        
        # Sort by confidence and signal strength
        signals.sort(key=lambda s: (
            s.signal_type != SignalType.HOLD,
            s.confidence
        ), reverse=True)
        
        return signals
    
    def get_top_signals(
        self,
        stocks_data: Dict[str, Dict],
        top_n: int = 5,
        signal_types: List[SignalType] = None
    ) -> List[TradingSignal]:
        """Get top N signals, optionally filtered by type"""
        all_signals = self.batch_generate(stocks_data)
        
        if signal_types:
            all_signals = [s for s in all_signals if s.signal_type in signal_types]
        
        # Filter out HOLD signals
        active_signals = [s for s in all_signals if s.signal_type != SignalType.HOLD]
        
        return active_signals[:top_n]
