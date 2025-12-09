#!/usr/bin/env python3
"""
VN30-Quantum Analyst - The Quantum Brain
Professional Technical Analysis using ta library
"""
import time
import os
import pandas as pd
import numpy as np
from datetime import datetime
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS

# Technical Analysis library
import ta
from ta.momentum import RSIIndicator, StochasticOscillator
from ta.trend import MACD, SMAIndicator, EMAIndicator
from ta.volatility import BollingerBands

# ═══════════════════════════════════════════════════════
# CONFIG
# ═══════════════════════════════════════════════════════
INFLUX_URL = os.getenv('INFLUX_URL', 'http://influxdb:8086')
INFLUX_TOKEN = os.getenv('INFLUX_TOKEN', 'my-super-secret-auth-token')
INFLUX_ORG = os.getenv('INFLUX_ORG', 'vnquant')
INFLUX_BUCKET = os.getenv('INFLUX_BUCKET', 'market_data')

VN30_STOCKS = [
    "ACB", "BCM", "BID", "BVH", "CTG", "FPT", "GAS", "GVR", 
    "HDB", "HPG", "MBB", "MSN", "MWG", "PLX", "POW", "SAB", 
    "SHB", "SSB", "SSI", "STB", "TCB", "TPB", "VCB", "VHM", 
    "VIB", "VIC", "VJC", "VNM", "VPB", "VRE"
]

# ═══════════════════════════════════════════════════════
# COLORS
# ═══════════════════════════════════════════════════════
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    CYAN = '\033[96m'
    PURPLE = '\033[95m'
    BOLD = '\033[1m'
    RESET = '\033[0m'

# ═══════════════════════════════════════════════════════
# STARTUP BANNER
# ═══════════════════════════════════════════════════════
print(f"""
{Colors.PURPLE}{Colors.BOLD}
╔═══════════════════════════════════════════════════════╗
║        🧠 VN30-QUANTUM ANALYST                       ║
║        The Quantum Brain - TA Library Edition         ║
╚═══════════════════════════════════════════════════════╝
{Colors.RESET}
🎯 Phân tích: {Colors.BOLD}{len(VN30_STOCKS)} mã VN30{Colors.RESET}
📡 Database: {INFLUX_URL}
🔬 Engine: ta library (Technical Analysis)
📊 Chỉ báo: RSI, MACD, Bollinger Bands, Stochastic
""")

# ═══════════════════════════════════════════════════════
# DATABASE SETUP
# ═══════════════════════════════════════════════════════
try:
    client = InfluxDBClient(url=INFLUX_URL, token=INFLUX_TOKEN, org=INFLUX_ORG)
    query_api = client.query_api()
    write_api = client.write_api(write_options=SYNCHRONOUS)
    print(f"{Colors.GREEN}✅ Kết nối InfluxDB thành công!{Colors.RESET}")
except Exception as e:
    print(f"{Colors.RED}❌ Lỗi kết nối InfluxDB: {e}{Colors.RESET}")
    exit(1)


# ═══════════════════════════════════════════════════════
# ANALYSIS FUNCTION
# ═══════════════════════════════════════════════════════
def analyze_stock(symbol: str) -> dict:
    """
    Phân tích kỹ thuật cho một mã cổ phiếu
    Trả về dict với các chỉ báo và tín hiệu
    """
    
    # 1. QUERY DỮ LIỆU TỪ INFLUXDB
    query = f'''
    from(bucket: "{INFLUX_BUCKET}")
      |> range(start: -6h) 
      |> filter(fn: (r) => r["_measurement"] == "stock_price")
      |> filter(fn: (r) => r["symbol"] == "{symbol}")
      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> sort(columns: ["_time"])
    '''
    
    try:
        tables = query_api.query(query, org=INFLUX_ORG)
        
        # Convert to DataFrame
        records = []
        for table in tables:
            for record in table.records:
                records.append({
                    'time': record.get_time(),
                    'open': float(record.values.get('open', 0) or record.values.get('price', 0)),
                    'high': float(record.values.get('high', 0) or record.values.get('price', 0)),
                    'low': float(record.values.get('low', 0) or record.values.get('price', 0)),
                    'close': float(record.values.get('close', 0) or record.values.get('price', 0)),
                    'volume': float(record.values.get('volume', 0))
                })
        
        if not records or len(records) < 20:
            return None
        
        df = pd.DataFrame(records)
        df = df.set_index('time')
        
        # 2. TÍNH TOÁN CHỈ BÁO VỚI ta library
        
        # RSI (14 periods)
        rsi_indicator = RSIIndicator(close=df['close'], window=14)
        df['RSI'] = rsi_indicator.rsi()
        
        # MACD (12, 26, 9)
        macd_indicator = MACD(close=df['close'], window_slow=26, window_fast=12, window_sign=9)
        df['MACD'] = macd_indicator.macd()
        df['MACD_signal'] = macd_indicator.macd_signal()
        df['MACD_hist'] = macd_indicator.macd_diff()
        
        # Bollinger Bands (20, 2)
        bb_indicator = BollingerBands(close=df['close'], window=20, window_dev=2)
        df['BB_upper'] = bb_indicator.bollinger_hband()
        df['BB_lower'] = bb_indicator.bollinger_lband()
        df['BB_mid'] = bb_indicator.bollinger_mavg()
        
        # Stochastic (14, 3)
        stoch_indicator = StochasticOscillator(high=df['high'], low=df['low'], close=df['close'], window=14, smooth_window=3)
        df['Stoch_k'] = stoch_indicator.stoch()
        df['Stoch_d'] = stoch_indicator.stoch_signal()
        
        # SMA (20, 50)
        df['SMA_20'] = SMAIndicator(close=df['close'], window=20).sma_indicator()
        df['SMA_50'] = SMAIndicator(close=df['close'], window=50).sma_indicator()
        
        # EMA (12, 26)
        df['EMA_12'] = EMAIndicator(close=df['close'], window=12).ema_indicator()
        df['EMA_26'] = EMAIndicator(close=df['close'], window=26).ema_indicator()
        
        # Lấy dòng cuối cùng
        last = df.iloc[-1]
        price = last['close']
        
        # 3. LOGIC RA TÍN HIỆU (RULE ENGINE)
        signal_score = 0
        reasons = []
        
        # === RSI Rules ===
        rsi = last.get('RSI', 50)
        if pd.notna(rsi):
            if rsi < 30:
                signal_score += 2
                reasons.append(f"RSI={rsi:.1f} Quá bán 🟢")
            elif rsi < 40:
                signal_score += 1
                reasons.append(f"RSI={rsi:.1f} Gần quá bán")
            elif rsi > 70:
                signal_score -= 2
                reasons.append(f"RSI={rsi:.1f} Quá mua 🔴")
            elif rsi > 60:
                signal_score -= 1
                reasons.append(f"RSI={rsi:.1f} Gần quá mua")
        
        # === MACD Rules ===
        macd_val = last.get('MACD', 0)
        macd_signal = last.get('MACD_signal', 0)
        macd_hist = last.get('MACD_hist', 0)
        
        if pd.notna(macd_val) and pd.notna(macd_signal):
            if macd_hist > 0 and macd_val > macd_signal:
                signal_score += 1
                reasons.append("MACD cắt lên 📈")
            elif macd_hist < 0 and macd_val < macd_signal:
                signal_score -= 1
                reasons.append("MACD cắt xuống 📉")
        
        # === Bollinger Bands Rules ===
        bb_lower = last.get('BB_lower', 0)
        bb_upper = last.get('BB_upper', 0)
        bb_mid = last.get('BB_mid', 0)
        
        if pd.notna(bb_lower) and pd.notna(bb_upper) and bb_lower > 0:
            if price < bb_lower:
                signal_score += 2
                reasons.append("Giá chạm BB dưới 🟢")
            elif price > bb_upper:
                signal_score -= 2
                reasons.append("Giá chạm BB trên 🔴")
        
        # === Stochastic Rules ===
        stoch_k = last.get('Stoch_k', 50)
        stoch_d = last.get('Stoch_d', 50)
        
        if pd.notna(stoch_k):
            if stoch_k < 20:
                signal_score += 1
                reasons.append(f"Stoch={stoch_k:.1f} Quá bán")
            elif stoch_k > 80:
                signal_score -= 1
                reasons.append(f"Stoch={stoch_k:.1f} Quá mua")
        
        # === Trend Rules (SMA Crossover) ===
        sma_20 = last.get('SMA_20', 0)
        sma_50 = last.get('SMA_50', 0)
        
        if pd.notna(sma_20) and pd.notna(sma_50) and sma_50 > 0:
            if sma_20 > sma_50:
                signal_score += 1
                reasons.append("SMA20 > SMA50 (Uptrend)")
            else:
                signal_score -= 1
                reasons.append("SMA20 < SMA50 (Downtrend)")
        
        # 4. XÁC ĐỊNH TÍN HIỆU CUỐI CÙNG
        if signal_score >= 4:
            signal_type = "STRONG_BUY"
            color = Colors.GREEN
        elif signal_score >= 2:
            signal_type = "BUY"
            color = Colors.GREEN
        elif signal_score <= -4:
            signal_type = "STRONG_SELL"
            color = Colors.RED
        elif signal_score <= -2:
            signal_type = "SELL"
            color = Colors.RED
        else:
            signal_type = "NEUTRAL"
            color = Colors.YELLOW
        
        # 5. GHI VÀO DATABASE
        point = Point("strategy_signal") \
            .tag("symbol", symbol) \
            .tag("signal_type", signal_type) \
            .field("price", float(price)) \
            .field("rsi", float(rsi) if pd.notna(rsi) else 50.0) \
            .field("macd", float(macd_val) if pd.notna(macd_val) else 0.0) \
            .field("macd_signal", float(macd_signal) if pd.notna(macd_signal) else 0.0) \
            .field("macd_hist", float(macd_hist) if pd.notna(macd_hist) else 0.0) \
            .field("bb_upper", float(bb_upper) if pd.notna(bb_upper) else 0.0) \
            .field("bb_lower", float(bb_lower) if pd.notna(bb_lower) else 0.0) \
            .field("stoch_k", float(stoch_k) if pd.notna(stoch_k) else 50.0) \
            .field("signal_score", int(signal_score)) \
            .field("signal_text", signal_type) \
            .field("reasons", "; ".join(reasons)) \
            .time(datetime.utcnow())
        
        write_api.write(bucket=INFLUX_BUCKET, org=INFLUX_ORG, record=point)
        
        # 6. PRINT OUTPUT
        if signal_type in ["STRONG_BUY", "STRONG_SELL"]:
            emoji = "🟢🟢" if "BUY" in signal_type else "🔴🔴"
            print(f"  {color}{emoji} {symbol}: {signal_type} (Score: {signal_score:+d}) | RSI={rsi:.1f}{Colors.RESET}")
        
        return {
            'symbol': symbol,
            'signal': signal_type,
            'score': signal_score,
            'rsi': rsi,
            'reasons': reasons
        }
        
    except Exception as e:
        print(f"{Colors.YELLOW}⚠️ Lỗi {symbol}: {str(e)[:50]}{Colors.RESET}")
        return None

# ═══════════════════════════════════════════════════════
# MAIN LOOP
# ═══════════════════════════════════════════════════════
def main_loop():
    """Main analysis loop"""
    cycle = 0
    
    while True:
        cycle += 1
        start_time = time.time()
        
        print(f"\n{Colors.CYAN}{'═'*50}")
        print(f"      🔬 Analysis Cycle #{cycle}")
        print(f"{'═'*50}{Colors.RESET}")
        
        buy_count = 0
        sell_count = 0
        strong_signals = []
        
        for symbol in VN30_STOCKS:
            result = analyze_stock(symbol)
            
            if result:
                if "BUY" in result['signal']:
                    buy_count += 1
                    if result['signal'] == "STRONG_BUY":
                        strong_signals.append(('BUY', result))
                elif "SELL" in result['signal']:
                    sell_count += 1
                    if result['signal'] == "STRONG_SELL":
                        strong_signals.append(('SELL', result))
        
        elapsed = time.time() - start_time
        
        # Summary
        print(f"\n{Colors.BOLD}📊 TỔNG KẾT:{Colors.RESET}")
        print(f"   {Colors.GREEN}↑ Tín hiệu MUA: {buy_count}{Colors.RESET}")
        print(f"   {Colors.RED}↓ Tín hiệu BÁN: {sell_count}{Colors.RESET}")
        print(f"   ⏱ Thời gian: {elapsed:.1f}s")
        
        # Top signals
        if strong_signals:
            print(f"\n{Colors.BOLD}🏆 TOP SIGNALS:{Colors.RESET}")
            for signal_type, result in strong_signals:
                color = Colors.GREEN if signal_type == 'BUY' else Colors.RED
                print(f"   {color}• {result['symbol']}: {result['signal']} (RSI={result['rsi']:.1f}){Colors.RESET}")
        
        # Wait 60 seconds (1 minute candle)
        print(f"\n⏳ Đợi 60s cho nến tiếp theo...")
        time.sleep(60)

# ═══════════════════════════════════════════════════════
# ENTRY POINT
# ═══════════════════════════════════════════════════════
if __name__ == "__main__":
    try:
        main_loop()
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}👋 Analyst đã dừng.{Colors.RESET}")
    finally:
        client.close()
