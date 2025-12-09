import time
import os
from datetime import datetime, timedelta
from vnstock import stock_historical_data
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS

# LẤY CẤU HÌNH TỪ DOCKER
URL = os.getenv('INFLUX_URL')
TOKEN = os.getenv('INFLUX_TOKEN')
ORG = os.getenv('INFLUX_ORG')
BUCKET = os.getenv('INFLUX_BUCKET')
SYMBOL = os.getenv('TARGET_STOCK', 'HPG')

print(f"🚀 [HUNTER] Khởi động... Mục tiêu: {SYMBOL}")
print(f"📡 Đang kết nối Database: {URL}")

# Setup kết nối DB
client = InfluxDBClient(url=URL, token=TOKEN, org=ORG)
write_api = client.write_api(write_options=SYNCHRONOUS)

# Lấy data historical lần đầu (30 ngày gần nhất)
print("📊 Đang tải dữ liệu lịch sử...")
try:
    start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
    end_date = datetime.now().strftime('%Y-%m-%d')
    
    df = stock_historical_data(
        symbol=SYMBOL, 
        start_date=start_date, 
        end_date=end_date, 
        resolution='1D',  # Daily data
        type='stock', 
        source='TCBS'
    )
    
    if df is not None and not df.empty:
        print(f"📈 Đã tải {len(df)} ngày dữ liệu!")
        
        # Ghi tất cả data lịch sử vào InfluxDB
        for idx, row in df.iterrows():
            point = Point("stock_price") \
                .tag("symbol", SYMBOL) \
                .field("open", float(row['open'])) \
                .field("high", float(row['high'])) \
                .field("low", float(row['low'])) \
                .field("close", float(row['close'])) \
                .field("volume", float(row['volume'])) \
                .time(row['time'] if 'time' in row else idx)
            
            write_api.write(bucket=BUCKET, org=ORG, record=point)
        
        latest = df.iloc[-1]
        print(f"✅ Đã ghi xong! Giá mới nhất: {SYMBOL} = {latest['close']:,.0f} VND")
    else:
        print("⚠️ Không lấy được dữ liệu lịch sử!")

except Exception as e:
    print(f"❌ Lỗi khi tải dữ liệu lịch sử: {e}")

# Loop để refresh data định kỳ
print("🔄 Bắt đầu theo dõi liên tục...")
while True:
    try:
        today = datetime.now().strftime('%Y-%m-%d')
        df = stock_historical_data(
            symbol=SYMBOL, 
            start_date=today, 
            end_date=today, 
            resolution='1D',
            type='stock', 
            source='TCBS'
        )
        
        if df is not None and not df.empty:
            latest = df.iloc[-1]
            price = float(latest['close'])
            volume = float(latest['volume'])
            
            point = Point("stock_price") \
                .tag("symbol", SYMBOL) \
                .field("open", float(latest['open'])) \
                .field("high", float(latest['high'])) \
                .field("low", float(latest['low'])) \
                .field("close", price) \
                .field("volume", volume)
            
            write_api.write(bucket=BUCKET, org=ORG, record=point)
            print(f"✅ [{datetime.now().strftime('%H:%M:%S')}] {SYMBOL}: {price:,.0f} VND | Vol: {volume:,.0f}")
        else:
            print(f"⏸️ [{datetime.now().strftime('%H:%M:%S')}] Chờ dữ liệu mới...")

    except Exception as e:
        print(f"❌ Lỗi: {e}")
        
    time.sleep(30)  # Refresh mỗi 30 giây
