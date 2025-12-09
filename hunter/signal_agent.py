#!/usr/bin/env python3
"""
VN30-Quantum AI Signal Agent
Reads price data, calculates indicators, writes trading signals to InfluxDB
"""
import os
import time
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS

# ═══════════════════════════════════════════════════════
# CONFIG
# ═══════════════════════════════════════════════════════
INFLUX_URL = os.getenv('INFLUX_URL', 'http://influxdb:8086')
INFLUX_TOKEN = os.getenv('INFLUX_TOKEN', 'my-super-secret-auth-token')
INFLUX_ORG = os.getenv('INFLUX_ORG', 'vnquant')
INFLUX_BUCKET = os.getenv('INFLUX_BUCKET', 'market_data')
SIGNALS_BUCKET = os.getenv('SIGNALS_BUCKET', 'trading_signals')

VN30_STOCKS = [
    "ACB", "BCM", "BID", "BVH", "CTG", "FPT", "GAS", "GVR", 
    "HDB", "HPG", "MBB", "MSN", "MWG", "PLX", "POW", "SAB", 
    "SHB", "SSB", "SSI", "STB", "TCB", "TPB", "VCB", "VHM", 
    "VIB", "VIC", "VJC", "VNM", "VPB", "VRE"
]

# ═══════════════════════════════════════════════════════
# SIGNAL TYPES
# ═══════════════════════════════════════════════════════
class SignalType(Enum):
    STRONG_BUY = "STRONG_BUY"
    BUY = "BUY"
    HOLD = "HOLD"
    SELL = "SELL"
    STRONG_SELL = "STRONG_SELL"

@dataclass
class TradingSignal:
    symbol: str
    signal: SignalType
    confidence: float  # 0.0 - 1.0
    price: float
    rsi: float
    macd: float
    macd_signal: float
    bb_position: float  # 0=lower, 0.5=middle, 1=upper
    pattern: Optional[str] = None
    reasoning: List[str] = None

# ═══════════════════════════════════════════════════════
# COLORS
# ═══════════════════════════════════════════════════════
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    CYAN = '\033[96m'
    PURPLE = '\033[95m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

# ═══════════════════════════════════════════════════════
# TECHNICAL INDICATORS
# ═══════════════════════════════════════════════════════
def calculate_rsi(prices: List[float], period: int = 14) -> float:
    """Calculate Relative Strength Index"""
    if len(prices) < period + 1:
        return 50.0  # Neutral
    
    deltas = np.diff(prices)
    gains = np.where(deltas > 0, deltas, 0)
    losses = np.where(deltas < 0, -deltas, 0)
    
    avg_gain = np.mean(gains[-period:])
    avg_loss = np.mean(losses[-period:])
    
    if avg_loss == 0:
        return 100.0
    
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    return float(rsi)

def calculate_macd(prices: List[float]) -> Tuple[float, float, float]:
    """Calculate MACD, Signal Line, and Histogram"""
    if len(prices) < 26:
        return 0.0, 0.0, 0.0
    
    prices_arr = np.array(prices)
    
    # EMA 12
    ema12 = calculate_ema(prices_arr, 12)
    # EMA 26
    ema26 = calculate_ema(prices_arr, 26)
    
    macd_line = ema12 - ema26
    
    # Signal line (EMA 9 of MACD)
    if len(prices) >= 35:
        signal_line = calculate_ema(np.array([macd_line]), 9)
    else:
        signal_line = macd_line
    
    histogram = macd_line - signal_line
    
    return float(macd_line), float(signal_line), float(histogram)

def calculate_ema(prices: np.ndarray, period: int) -> float:
    """Calculate Exponential Moving Average"""
    if len(prices) < period:
        return float(np.mean(prices))
    
    multiplier = 2 / (period + 1)
    ema = prices[0]
    for price in prices[1:]:
        ema = (price - ema) * multiplier + ema
    return float(ema)

def calculate_bollinger(prices: List[float], period: int = 20) -> Tuple[float, float, float, float]:
    """Calculate Bollinger Bands and position"""
    if len(prices) < period:
        return 0.0, 0.0, 0.0, 0.5
    
    prices_arr = np.array(prices[-period:])
    sma = np.mean(prices_arr)
    std = np.std(prices_arr)
    
    upper = sma + (std * 2)
    lower = sma - (std * 2)
    
    current_price = prices[-1]
    # Position: 0 = at lower, 0.5 = at middle, 1 = at upper
    if upper != lower:
        position = (current_price - lower) / (upper - lower)
    else:
        position = 0.5
    
    position = max(0, min(1, position))  # Clamp to [0, 1]
    
    return float(upper), float(sma), float(lower), float(position)

def detect_candlestick_pattern(opens: List[float], highs: List[float], 
                                lows: List[float], closes: List[float]) -> Optional[str]:
    """Detect basic candlestick patterns"""
    if len(closes) < 3:
        return None
    
    # Last 3 candles
    o1, o2, o3 = opens[-3], opens[-2], opens[-1]
    h1, h2, h3 = highs[-3], highs[-2], highs[-1]
    l1, l2, l3 = lows[-3], lows[-2], lows[-1]
    c1, c2, c3 = closes[-3], closes[-2], closes[-1]
    
    # Hammer (Bullish reversal)
    body = abs(c3 - o3)
    lower_wick = min(o3, c3) - l3
    upper_wick = h3 - max(o3, c3)
    total_range = h3 - l3
    
    if total_range > 0:
        if lower_wick > body * 2 and upper_wick < body * 0.5:
            if c3 > o3:  # Bullish
                return "HAMMER 🔨"
    
    # Bullish Engulfing
    if c2 < o2 and c3 > o3:  # Yesterday red, today green
        if c3 > o2 and o3 < c2:  # Today engulfs yesterday
            return "BULLISH_ENGULFING 🟢"
    
    # Bearish Engulfing
    if c2 > o2 and c3 < o3:  # Yesterday green, today red
        if c3 < o2 and o3 > c2:  # Today engulfs yesterday
            return "BEARISH_ENGULFING 🔴"
    
    # Doji
    if body < total_range * 0.1:
        return "DOJI ✚"
    
    return None

# ═══════════════════════════════════════════════════════
# SIGNAL GENERATOR
# ═══════════════════════════════════════════════════════
def generate_signal(symbol: str, prices: List[float], 
                    opens: List[float] = None, highs: List[float] = None,
                    lows: List[float] = None, volumes: List[float] = None) -> TradingSignal:
    """Generate trading signal based on multiple indicators"""
    
    if not prices or len(prices) < 5:
        return TradingSignal(
            symbol=symbol, signal=SignalType.HOLD, confidence=0.0,
            price=0.0, rsi=50.0, macd=0.0, macd_signal=0.0, bb_position=0.5
        )
    
    current_price = prices[-1]
    reasoning = []
    score = 0  # -100 to +100
    
    # Calculate indicators
    rsi = calculate_rsi(prices)
    macd, macd_signal_val, macd_hist = calculate_macd(prices)
    bb_upper, bb_middle, bb_lower, bb_position = calculate_bollinger(prices)
    
    # RSI Analysis (weight: 25)
    if rsi < 30:
        score += 25
        reasoning.append(f"RSI={rsi:.1f} Quá bán")
    elif rsi < 40:
        score += 10
        reasoning.append(f"RSI={rsi:.1f} Gần vùng quá bán")
    elif rsi > 70:
        score -= 25
        reasoning.append(f"RSI={rsi:.1f} Quá mua")
    elif rsi > 60:
        score -= 10
        reasoning.append(f"RSI={rsi:.1f} Gần vùng quá mua")
    
    # MACD Analysis (weight: 25)
    if macd > macd_signal_val and macd_hist > 0:
        score += 25
        reasoning.append("MACD cắt lên Signal")
    elif macd < macd_signal_val and macd_hist < 0:
        score -= 25
        reasoning.append("MACD cắt xuống Signal")
    
    # Bollinger Bands (weight: 20)
    if bb_position < 0.2:
        score += 20
        reasoning.append("Giá chạm Bollinger dưới")
    elif bb_position > 0.8:
        score -= 20
        reasoning.append("Giá chạm Bollinger trên")
    
    # Pattern Detection (weight: 30)
    pattern = None
    if opens and highs and lows:
        pattern = detect_candlestick_pattern(opens, highs, lows, prices)
        if pattern:
            if "BULLISH" in pattern or "HAMMER" in pattern:
                score += 30
                reasoning.append(f"Mẫu nến: {pattern}")
            elif "BEARISH" in pattern:
                score -= 30
                reasoning.append(f"Mẫu nến: {pattern}")
    
    # Determine final signal
    confidence = min(abs(score) / 100, 1.0)
    
    if score >= 50:
        signal = SignalType.STRONG_BUY
    elif score >= 20:
        signal = SignalType.BUY
    elif score <= -50:
        signal = SignalType.STRONG_SELL
    elif score <= -20:
        signal = SignalType.SELL
    else:
        signal = SignalType.HOLD
    
    return TradingSignal(
        symbol=symbol,
        signal=signal,
        confidence=confidence,
        price=current_price,
        rsi=rsi,
        macd=macd,
        macd_signal=macd_signal_val,
        bb_position=bb_position,
        pattern=pattern,
        reasoning=reasoning
    )

# ═══════════════════════════════════════════════════════
# INFLUXDB FUNCTIONS
# ═══════════════════════════════════════════════════════
def fetch_price_data(client: InfluxDBClient, symbol: str, hours: int = 24) -> Dict:
    """Fetch price data from InfluxDB"""
    query_api = client.query_api()
    
    query = f'''
    from(bucket: "{INFLUX_BUCKET}")
      |> range(start: -{hours}h)
      |> filter(fn: (r) => r["_measurement"] == "stock_price")
      |> filter(fn: (r) => r["symbol"] == "{symbol}")
      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> sort(columns: ["_time"])
    '''
    
    try:
        tables = query_api.query(query, org=INFLUX_ORG)
        
        prices, opens, highs, lows, volumes = [], [], [], [], []
        
        for table in tables:
            for record in table.records:
                if 'close' in record.values:
                    prices.append(float(record.values.get('close', 0)))
                if 'open' in record.values:
                    opens.append(float(record.values.get('open', 0)))
                if 'high' in record.values:
                    highs.append(float(record.values.get('high', 0)))
                if 'low' in record.values:
                    lows.append(float(record.values.get('low', 0)))
                if 'volume' in record.values:
                    volumes.append(float(record.values.get('volume', 0)))
        
        return {
            'prices': prices,
            'opens': opens,
            'highs': highs,
            'lows': lows,
            'volumes': volumes
        }
    except Exception as e:
        print(f"Error fetching {symbol}: {e}")
        return {'prices': [], 'opens': [], 'highs': [], 'lows': [], 'volumes': []}

def write_signal_to_db(write_api, signal: TradingSignal):
    """Write trading signal to InfluxDB"""
    
    # Convert signal to numeric for Grafana
    signal_value = {
        SignalType.STRONG_BUY: 2,
        SignalType.BUY: 1,
        SignalType.HOLD: 0,
        SignalType.SELL: -1,
        SignalType.STRONG_SELL: -2
    }.get(signal.signal, 0)
    
    point = Point("trading_signal") \
        .tag("symbol", signal.symbol) \
        .tag("signal_type", signal.signal.value) \
        .tag("pattern", signal.pattern or "NONE") \
        .field("signal_value", signal_value) \
        .field("confidence", signal.confidence) \
        .field("price", signal.price) \
        .field("rsi", signal.rsi) \
        .field("macd", signal.macd) \
        .field("macd_signal", signal.macd_signal) \
        .field("bb_position", signal.bb_position) \
        .field("reasoning", "; ".join(signal.reasoning) if signal.reasoning else "") \
        .time(datetime.utcnow())
    
    write_api.write(bucket=INFLUX_BUCKET, org=INFLUX_ORG, record=point)

# ═══════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════
def main():
    print(f"""
{Colors.PURPLE}{Colors.BOLD}
╔═══════════════════════════════════════════════════════╗
║        🧠 VN30-QUANTUM AI SIGNAL AGENT               ║
║        Real-time Trading Signal Generator             ║
╚═══════════════════════════════════════════════════════╝
{Colors.RESET}
🎯 Phân tích: {Colors.BOLD}{len(VN30_STOCKS)} mã VN30{Colors.RESET}
📡 Database: {INFLUX_URL}
🔬 Indicators: RSI, MACD, Bollinger, Patterns
""")
    
    # Connect to InfluxDB
    client = InfluxDBClient(url=INFLUX_URL, token=INFLUX_TOKEN, org=INFLUX_ORG)
    write_api = client.write_api(write_options=SYNCHRONOUS)
    
    cycle = 0
    while True:
        cycle += 1
        start_time = time.time()
        
        print(f"\n{Colors.CYAN}━━━ Analysis Cycle #{cycle} ━━━{Colors.RESET}")
        
        buy_signals = []
        sell_signals = []
        
        for symbol in VN30_STOCKS:
            # Fetch data
            data = fetch_price_data(client, symbol)
            
            if data['prices']:
                # Generate signal
                signal = generate_signal(
                    symbol=symbol,
                    prices=data['prices'],
                    opens=data['opens'],
                    highs=data['highs'],
                    lows=data['lows'],
                    volumes=data['volumes']
                )
                
                # Write to DB
                write_signal_to_db(write_api, signal)
                
                # Categorize
                if signal.signal in [SignalType.BUY, SignalType.STRONG_BUY]:
                    buy_signals.append(signal)
                elif signal.signal in [SignalType.SELL, SignalType.STRONG_SELL]:
                    sell_signals.append(signal)
                
                # Print strong signals
                if signal.signal == SignalType.STRONG_BUY:
                    print(f"  {Colors.GREEN}🟢🟢 {symbol}: MUA MẠNH ({signal.confidence:.0%}){Colors.RESET}")
                elif signal.signal == SignalType.STRONG_SELL:
                    print(f"  {Colors.RED}🔴🔴 {symbol}: BÁN MẠNH ({signal.confidence:.0%}){Colors.RESET}")
        
        elapsed = time.time() - start_time
        print(f"\n📊 Kết quả: {Colors.GREEN}+{len(buy_signals)} MUA{Colors.RESET} | {Colors.RED}-{len(sell_signals)} BÁN{Colors.RESET} | ⏱ {elapsed:.1f}s")
        
        # Top signals
        if buy_signals:
            top_buy = max(buy_signals, key=lambda s: s.confidence)
            print(f"🏆 Top MUA: {Colors.GREEN}{top_buy.symbol} ({top_buy.confidence:.0%}){Colors.RESET}")
        if sell_signals:
            top_sell = max(sell_signals, key=lambda s: s.confidence)
            print(f"⚠️ Top BÁN: {Colors.RED}{top_sell.symbol} ({top_sell.confidence:.0%}){Colors.RESET}")
        
        # Sleep 30 seconds between analysis cycles
        time.sleep(30)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}👋 AI Agent đã dừng.{Colors.RESET}")
