#!/usr/bin/env python3
"""
VN30-Quantum Oracle - The AI Prediction & Alert System
Phase 3-4: AI Price Prediction + Telegram Sentinel
"""
import time
import os
import requests
import numpy as np
import pandas as pd
from datetime import datetime
from sklearn.linear_model import LinearRegression
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

# Telegram Configuration (Set via environment or edit here)
TELE_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN', 'YOUR_BOT_TOKEN_HERE')
TELE_CHAT_ID = os.getenv('TELEGRAM_CHAT_ID', 'YOUR_CHAT_ID_HERE')

VN30_STOCKS = [
    "ACB", "BCM", "BID", "BVH", "CTG", "FPT", "GAS", "GVR", 
    "HDB", "HPG", "MBB", "MSN", "MWG", "PLX", "POW", "SAB", 
    "SHB", "SSB", "SSI", "STB", "TCB", "TPB", "VCB", "VHM", 
    "VIB", "VIC", "VJC", "VNM", "VPB", "VRE"
]

# Cooldown: Avoid spam (seconds)
ALERT_COOLDOWN = 900  # 15 minutes

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

# Memory for cooldown
last_alert_time = {}

# ═══════════════════════════════════════════════════════
# STARTUP BANNER
# ═══════════════════════════════════════════════════════
print(f"""
{Colors.PURPLE}{Colors.BOLD}
╔═══════════════════════════════════════════════════════╗
║        🔮 VN30-QUANTUM ORACLE                        ║
║        AI Prediction + Telegram Sentinel              ║
╚═══════════════════════════════════════════════════════╝
{Colors.RESET}
🎯 Phân tích: {Colors.BOLD}{len(VN30_STOCKS)} mã VN30{Colors.RESET}
📡 Database: {INFLUX_URL}
🔬 AI: Linear Regression Price Prediction
📱 Telegram: {'✅ Configured' if 'YOUR_' not in TELE_TOKEN else '❌ Not configured'}
⏱ Alert Cooldown: {ALERT_COOLDOWN}s
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
# TELEGRAM SENTINEL
# ═══════════════════════════════════════════════════════
def send_telegram(symbol: str, signal: str, price: float, rsi: float, prediction: float):
    """Send formatted alert to Telegram"""
    if "YOUR_" in TELE_TOKEN:
        return  # Not configured
    
    icon = "🚀" if "BUY" in signal else "🔻"
    color = "🟢" if "BUY" in signal else "🔴"
    trend = "↑" if prediction > price else "↓"
    diff_pct = ((prediction - price) / price) * 100
    
    msg = f"""
{icon} *TÍN HIỆU VN30: {symbol}*
━━━━━━━━━━━━━━━━━━
⚡ Action: *{signal}* {color}
💰 Giá hiện tại: `{price:,.0f}`
🔮 AI Dự báo: `{prediction:,.0f}` ({trend}{abs(diff_pct):.2f}%)
📈 RSI: `{rsi:.1f}`
━━━━━━━━━━━━━━━━━━
🤖 _VN30-Quantum Oracle_
⏰ {datetime.now().strftime('%H:%M:%S %d/%m/%Y')}
"""
    
    try:
        url = f"https://api.telegram.org/bot{TELE_TOKEN}/sendMessage"
        response = requests.post(url, json={
            "chat_id": TELE_CHAT_ID,
            "text": msg,
            "parse_mode": "Markdown"
        }, timeout=10)
        if response.ok:
            print(f"{Colors.GREEN}📱 Telegram: Đã gửi thành công!{Colors.RESET}")
        else:
            print(f"{Colors.YELLOW}📱 Telegram error: {response.text}{Colors.RESET}")
    except Exception as e:
        print(f"{Colors.RED}❌ Telegram error: {e}{Colors.RESET}")

# ═══════════════════════════════════════════════════════
# AI PREDICTION ENGINE (LINEAR REGRESSION)
# ═══════════════════════════════════════════════════════
def predict_next_price(prices: list) -> float:
    """
    Use Linear Regression to predict next candle price
    Takes last 30 data points, fits a line, predicts step 31
    """
    if len(prices) < 30:
        return prices[-1] if prices else 0
    
    data = prices[-30:]  # Last 30 candles
    X = np.array(range(len(data))).reshape(-1, 1)
    y = np.array(data)
    
    model = LinearRegression()
    model.fit(X, y)
    
    # Predict next step
    next_index = np.array([[30]])
    predicted = model.predict(next_index)[0]
    
    return float(predicted)

# ═══════════════════════════════════════════════════════
# ANALYSIS FUNCTION
# ═══════════════════════════════════════════════════════
def analyze_stock(symbol: str) -> dict:
    """
    Complete analysis with:
    1. Technical indicators (RSI, MACD, BB)
    2. AI Price Prediction
    3. Telegram Alerts
    """
    
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
        
        if not records or len(records) < 30:
            return None
        
        df = pd.DataFrame(records)
        df = df.set_index('time')
        
        # ═══ 1. TÍNH TOÁN INDICATORS ═══
        rsi_indicator = RSIIndicator(close=df['close'], window=14)
        df['RSI'] = rsi_indicator.rsi()
        
        bb_indicator = BollingerBands(close=df['close'], window=20, window_dev=2)
        df['BB_upper'] = bb_indicator.bollinger_hband()
        df['BB_lower'] = bb_indicator.bollinger_lband()
        
        macd_indicator = MACD(close=df['close'], window_slow=26, window_fast=12, window_sign=9)
        df['MACD'] = macd_indicator.macd()
        df['MACD_signal'] = macd_indicator.macd_signal()
        
        last = df.iloc[-1]
        price = last['close']
        rsi = last.get('RSI', 50)
        
        # ═══ 2. AI PRICE PREDICTION ═══
        prices_list = df['close'].tolist()
        predicted_price = predict_next_price(prices_list)
        
        # ═══ 3. SIGNAL SCORING ═══
        signal_score = 0
        reasons = []
        
        # RSI Logic
        if pd.notna(rsi):
            if rsi < 30:
                signal_score += 2
                reasons.append(f"RSI={rsi:.1f} Quá bán")
            elif rsi < 40:
                signal_score += 1
            elif rsi > 70:
                signal_score -= 2
                reasons.append(f"RSI={rsi:.1f} Quá mua")
            elif rsi > 60:
                signal_score -= 1
        
        # Bollinger Bands Logic
        bb_lower = last.get('BB_lower', 0)
        bb_upper = last.get('BB_upper', 0)
        if pd.notna(bb_lower) and bb_lower > 0:
            if price < bb_lower:
                signal_score += 2
                reasons.append("Giá chạm BB dưới")
            elif price > bb_upper:
                signal_score -= 2
                reasons.append("Giá chạm BB trên")
        
        # AI Prediction Logic
        if predicted_price > price * 1.002:  # AI predicts +0.2%
            signal_score += 1
            reasons.append(f"AI: +{((predicted_price-price)/price*100):.2f}%")
        elif predicted_price < price * 0.998:  # AI predicts -0.2%
            signal_score -= 1
            reasons.append(f"AI: {((predicted_price-price)/price*100):.2f}%")
        
        # MACD Logic
        macd_val = last.get('MACD', 0)
        macd_sig = last.get('MACD_signal', 0)
        if pd.notna(macd_val) and pd.notna(macd_sig):
            if macd_val > macd_sig:
                signal_score += 1
            else:
                signal_score -= 1
        
        # ═══ 4. DETERMINE SIGNAL ═══
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
        
        # ═══ 5. TELEGRAM ALERT (COOLDOWN) ═══
        now = time.time()
        if "STRONG" in signal_type:
            last_sent = last_alert_time.get(symbol, 0)
            if now - last_sent > ALERT_COOLDOWN:
                print(f"{Colors.PURPLE}📱 Gửi Telegram: {symbol} - {signal_type}{Colors.RESET}")
                send_telegram(symbol, signal_type, price, rsi if pd.notna(rsi) else 50, predicted_price)
                last_alert_time[symbol] = now
        
        # ═══ 6. WRITE TO DATABASE ═══
        point = Point("strategy_signal") \
            .tag("symbol", symbol) \
            .tag("signal_type", signal_type) \
            .field("price", float(price)) \
            .field("predicted_price", float(predicted_price)) \
            .field("rsi", float(rsi) if pd.notna(rsi) else 50.0) \
            .field("macd", float(macd_val) if pd.notna(macd_val) else 0.0) \
            .field("signal_score", int(signal_score)) \
            .field("signal_text", signal_type) \
            .field("reasons", "; ".join(reasons)) \
            .time(datetime.utcnow())
        
        write_api.write(bucket=INFLUX_BUCKET, org=INFLUX_ORG, record=point)
        
        # ═══ 7. PRINT OUTPUT ═══
        trend = "↑" if predicted_price > price else "↓"
        if "STRONG" in signal_type:
            emoji = "🟢🟢" if "BUY" in signal_type else "🔴🔴"
            print(f"  {color}{emoji} {symbol}: {signal_type} | Giá={price:,.0f} | AI={predicted_price:,.0f} {trend}{Colors.RESET}")
        
        return {
            'symbol': symbol,
            'signal': signal_type,
            'score': signal_score,
            'price': price,
            'predicted': predicted_price,
            'rsi': rsi if pd.notna(rsi) else 50,
            'reasons': reasons
        }
        
    except Exception as e:
        print(f"{Colors.YELLOW}⚠️ Lỗi {symbol}: {str(e)[:50]}{Colors.RESET}")
        return None

# ═══════════════════════════════════════════════════════
# MAIN LOOP
# ═══════════════════════════════════════════════════════
def main_loop():
    """Main analysis loop with AI prediction"""
    cycle = 0
    
    while True:
        cycle += 1
        start_time = time.time()
        
        print(f"\n{Colors.CYAN}{'═'*55}")
        print(f"      🔮 ORACLE SCANNING - Cycle #{cycle}")
        print(f"{'═'*55}{Colors.RESET}")
        
        buy_signals = []
        sell_signals = []
        predictions = []
        
        for symbol in VN30_STOCKS:
            result = analyze_stock(symbol)
            
            if result:
                predictions.append(result)
                if "BUY" in result['signal']:
                    buy_signals.append(result)
                elif "SELL" in result['signal']:
                    sell_signals.append(result)
        
        elapsed = time.time() - start_time
        
        # Summary
        print(f"\n{Colors.BOLD}📊 TỔNG KẾT:{Colors.RESET}")
        print(f"   {Colors.GREEN}↑ Tín hiệu MUA: {len(buy_signals)}{Colors.RESET}")
        print(f"   {Colors.RED}↓ Tín hiệu BÁN: {len(sell_signals)}{Colors.RESET}")
        print(f"   ⏱ Thời gian: {elapsed:.1f}s")
        
        # Top predictions
        if buy_signals:
            top_buy = max(buy_signals, key=lambda x: x['score'])
            print(f"\n{Colors.GREEN}🏆 TOP MUA: {top_buy['symbol']} (Score: {top_buy['score']:+d})")
            print(f"   💰 Giá: {top_buy['price']:,.0f} → AI: {top_buy['predicted']:,.0f}{Colors.RESET}")
        
        if sell_signals:
            top_sell = min(sell_signals, key=lambda x: x['score'])
            print(f"{Colors.RED}⚠️ TOP BÁN: {top_sell['symbol']} (Score: {top_sell['score']:+d})")
            print(f"   💰 Giá: {top_sell['price']:,.0f} → AI: {top_sell['predicted']:,.0f}{Colors.RESET}")
        
        print(f"\n⏳ Đợi 60s cho nến tiếp theo...")
        time.sleep(60)

# ═══════════════════════════════════════════════════════
# ENTRY POINT
# ═══════════════════════════════════════════════════════
if __name__ == "__main__":
    try:
        main_loop()
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}👋 Oracle đã dừng.{Colors.RESET}")
    finally:
        client.close()
