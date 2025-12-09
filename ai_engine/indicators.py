"""
VN30-Quantum AI Engine - Technical Indicators
Professional-grade technical analysis for Vietnamese stocks
"""
import numpy as np
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from enum import Enum


class SignalStrength(Enum):
    STRONG_BUY = 2
    BUY = 1
    NEUTRAL = 0
    SELL = -1
    STRONG_SELL = -2


@dataclass
class IndicatorResult:
    """Result from a technical indicator"""
    name: str
    value: float
    signal: SignalStrength
    description: str


class TechnicalIndicators:
    """
    Technical Analysis Engine
    Calculates RSI, MACD, Bollinger Bands, and more
    """
    
    @staticmethod
    def calculate_rsi(prices: List[float], period: int = 14) -> Tuple[float, SignalStrength]:
        """
        Calculate Relative Strength Index
        RSI < 30 = Oversold (BUY signal)
        RSI > 70 = Overbought (SELL signal)
        """
        if len(prices) < period + 1:
            return 50.0, SignalStrength.NEUTRAL
        
        deltas = np.diff(prices)
        gains = np.where(deltas > 0, deltas, 0)
        losses = np.where(deltas < 0, -deltas, 0)
        
        avg_gain = np.mean(gains[-period:])
        avg_loss = np.mean(losses[-period:])
        
        if avg_loss == 0:
            rsi = 100.0
        else:
            rs = avg_gain / avg_loss
            rsi = 100 - (100 / (1 + rs))
        
        # Determine signal
        if rsi <= 20:
            signal = SignalStrength.STRONG_BUY
        elif rsi <= 30:
            signal = SignalStrength.BUY
        elif rsi >= 80:
            signal = SignalStrength.STRONG_SELL
        elif rsi >= 70:
            signal = SignalStrength.SELL
        else:
            signal = SignalStrength.NEUTRAL
        
        return round(rsi, 2), signal
    
    @staticmethod
    def calculate_macd(
        prices: List[float],
        fast_period: int = 12,
        slow_period: int = 26,
        signal_period: int = 9
    ) -> Tuple[Dict[str, float], SignalStrength]:
        """
        Calculate MACD (Moving Average Convergence Divergence)
        MACD crosses above signal = BUY
        MACD crosses below signal = SELL
        """
        if len(prices) < slow_period + signal_period:
            return {"macd": 0, "signal": 0, "histogram": 0}, SignalStrength.NEUTRAL
        
        prices_array = np.array(prices)
        
        # Calculate EMAs
        ema_fast = TechnicalIndicators._ema(prices_array, fast_period)
        ema_slow = TechnicalIndicators._ema(prices_array, slow_period)
        
        # MACD line
        macd_line = ema_fast - ema_slow
        
        # Signal line (EMA of MACD)
        signal_line = TechnicalIndicators._ema(macd_line, signal_period)
        
        # Histogram
        histogram = macd_line - signal_line
        
        current_macd = macd_line[-1]
        current_signal = signal_line[-1]
        current_histogram = histogram[-1]
        prev_histogram = histogram[-2] if len(histogram) > 1 else 0
        
        # Determine signal
        if current_histogram > 0 and prev_histogram <= 0:
            signal = SignalStrength.BUY  # Bullish crossover
        elif current_histogram < 0 and prev_histogram >= 0:
            signal = SignalStrength.SELL  # Bearish crossover
        elif current_histogram > 0:
            signal = SignalStrength.BUY if current_histogram > prev_histogram else SignalStrength.NEUTRAL
        elif current_histogram < 0:
            signal = SignalStrength.SELL if current_histogram < prev_histogram else SignalStrength.NEUTRAL
        else:
            signal = SignalStrength.NEUTRAL
        
        return {
            "macd": round(current_macd, 4),
            "signal": round(current_signal, 4),
            "histogram": round(current_histogram, 4)
        }, signal
    
    @staticmethod
    def calculate_bollinger_bands(
        prices: List[float],
        period: int = 20,
        num_std: float = 2.0
    ) -> Tuple[Dict[str, float], SignalStrength]:
        """
        Calculate Bollinger Bands
        Price near lower band = potential BUY
        Price near upper band = potential SELL
        """
        if len(prices) < period:
            current_price = prices[-1] if prices else 0
            return {"upper": 0, "middle": 0, "lower": 0, "width": 0}, SignalStrength.NEUTRAL
        
        prices_array = np.array(prices[-period:])
        middle = np.mean(prices_array)
        std = np.std(prices_array)
        
        upper = middle + (num_std * std)
        lower = middle - (num_std * std)
        width = (upper - lower) / middle * 100
        
        current_price = prices[-1]
        
        # Determine signal based on price position
        price_position = (current_price - lower) / (upper - lower) if upper != lower else 0.5
        
        if price_position <= 0.1:
            signal = SignalStrength.STRONG_BUY
        elif price_position <= 0.2:
            signal = SignalStrength.BUY
        elif price_position >= 0.9:
            signal = SignalStrength.STRONG_SELL
        elif price_position >= 0.8:
            signal = SignalStrength.SELL
        else:
            signal = SignalStrength.NEUTRAL
        
        return {
            "upper": round(upper, 2),
            "middle": round(middle, 2),
            "lower": round(lower, 2),
            "width": round(width, 2),
            "position": round(price_position, 2)
        }, signal
    
    @staticmethod
    def calculate_sma(prices: List[float], period: int) -> float:
        """Simple Moving Average"""
        if len(prices) < period:
            return np.mean(prices) if prices else 0
        return np.mean(prices[-period:])
    
    @staticmethod
    def calculate_ema(prices: List[float], period: int) -> float:
        """Exponential Moving Average"""
        if len(prices) < period:
            return np.mean(prices) if prices else 0
        return TechnicalIndicators._ema(np.array(prices), period)[-1]
    
    @staticmethod
    def _ema(data: np.ndarray, period: int) -> np.ndarray:
        """Calculate EMA using pandas-like method"""
        alpha = 2 / (period + 1)
        ema = np.zeros_like(data, dtype=float)
        ema[0] = data[0]
        
        for i in range(1, len(data)):
            ema[i] = alpha * data[i] + (1 - alpha) * ema[i-1]
        
        return ema
    
    @staticmethod
    def calculate_volume_analysis(
        volumes: List[float],
        prices: List[float],
        period: int = 20
    ) -> Tuple[Dict[str, float], SignalStrength]:
        """
        Volume analysis with price correlation
        High volume + price up = Bullish confirmation
        High volume + price down = Bearish confirmation
        """
        if len(volumes) < period or len(prices) < 2:
            return {"avg_volume": 0, "volume_ratio": 0}, SignalStrength.NEUTRAL
        
        avg_volume = np.mean(volumes[-period:])
        current_volume = volumes[-1]
        volume_ratio = current_volume / avg_volume if avg_volume > 0 else 1
        
        price_change = (prices[-1] - prices[-2]) / prices[-2] * 100 if prices[-2] != 0 else 0
        
        # High volume with price movement
        if volume_ratio > 1.5:
            if price_change > 1:
                signal = SignalStrength.STRONG_BUY
            elif price_change > 0:
                signal = SignalStrength.BUY
            elif price_change < -1:
                signal = SignalStrength.STRONG_SELL
            elif price_change < 0:
                signal = SignalStrength.SELL
            else:
                signal = SignalStrength.NEUTRAL
        else:
            signal = SignalStrength.NEUTRAL
        
        return {
            "avg_volume": round(avg_volume, 0),
            "current_volume": round(current_volume, 0),
            "volume_ratio": round(volume_ratio, 2),
            "price_change": round(price_change, 2)
        }, signal
    
    @staticmethod
    def calculate_all_indicators(
        prices: List[float],
        volumes: List[float] = None
    ) -> Dict[str, IndicatorResult]:
        """Calculate all indicators at once"""
        results = {}
        
        # RSI
        rsi_value, rsi_signal = TechnicalIndicators.calculate_rsi(prices)
        results['rsi'] = IndicatorResult(
            name='RSI (14)',
            value=rsi_value,
            signal=rsi_signal,
            description=f"RSI at {rsi_value}: {'Oversold' if rsi_value < 30 else 'Overbought' if rsi_value > 70 else 'Neutral'}"
        )
        
        # MACD
        macd_values, macd_signal = TechnicalIndicators.calculate_macd(prices)
        results['macd'] = IndicatorResult(
            name='MACD (12,26,9)',
            value=macd_values['histogram'],
            signal=macd_signal,
            description=f"MACD Histogram: {macd_values['histogram']}"
        )
        
        # Bollinger Bands
        bb_values, bb_signal = TechnicalIndicators.calculate_bollinger_bands(prices)
        results['bollinger'] = IndicatorResult(
            name='Bollinger Bands (20,2)',
            value=bb_values.get('position', 0.5),
            signal=bb_signal,
            description=f"Price at {bb_values.get('position', 0.5)*100:.0f}% of bands"
        )
        
        # Moving Averages
        sma_20 = TechnicalIndicators.calculate_sma(prices, 20)
        sma_50 = TechnicalIndicators.calculate_sma(prices, 50)
        current_price = prices[-1] if prices else 0
        
        ma_signal = SignalStrength.BUY if current_price > sma_20 > sma_50 else \
                    SignalStrength.SELL if current_price < sma_20 < sma_50 else \
                    SignalStrength.NEUTRAL
        
        results['moving_averages'] = IndicatorResult(
            name='MA Cross (20/50)',
            value=current_price,
            signal=ma_signal,
            description=f"Price: {current_price:,.0f}, SMA20: {sma_20:,.0f}, SMA50: {sma_50:,.0f}"
        )
        
        # Volume analysis
        if volumes:
            vol_values, vol_signal = TechnicalIndicators.calculate_volume_analysis(volumes, prices)
            results['volume'] = IndicatorResult(
                name='Volume Analysis',
                value=vol_values['volume_ratio'],
                signal=vol_signal,
                description=f"Volume {vol_values['volume_ratio']:.1f}x average"
            )
        
        return results
