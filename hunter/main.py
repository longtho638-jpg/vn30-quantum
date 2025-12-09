#!/usr/bin/env python3
"""
VN30-Quantum Hunter V2.0
Multi-threaded data collector for all VN30 stocks
"""
import time
import os
import concurrent.futures
from datetime import datetime
from vnstock import stock_historical_data
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS

# ═══════════════════════════════════════════════════════
# CẤU HÌNH
# ═══════════════════════════════════════════════════════
INFLUX_URL = os.getenv('INFLUX_URL', 'http://influxdb:8086')
INFLUX_TOKEN = os.getenv('INFLUX_TOKEN', 'my-super-secret-auth-token')
INFLUX_ORG = os.getenv('INFLUX_ORG', 'vnquant')
INFLUX_BUCKET = os.getenv('INFLUX_BUCKET', 'market_data')

# DANH SÁCH VN30 (Cập nhật mới nhất)
VN30_STOCKS = [
    "ACB", "BCM", "BID", "BVH", "CTG", "FPT", "GAS", "GVR", 
    "HDB", "HPG", "MBB", "MSN", "MWG", "PLX", "POW", "SAB", 
    "SHB", "SSB", "SSI", "STB", "TCB", "TPB", "VCB", "VHM", 
    "VIB", "VIC", "VJC", "VNM", "VPB", "VRE"
]

# ═══════════════════════════════════════════════════════
# COLORS FOR TERMINAL
# ═══════════════════════════════════════════════════════
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    CYAN = '\033[96m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def log_info(msg):
    print(f"{Colors.GREEN}✅ {msg}{Colors.RESET}")

def log_warn(msg):
    print(f"{Colors.YELLOW}⚠️  {msg}{Colors.RESET}")

def log_error(msg):
    print(f"{Colors.RED}❌ {msg}{Colors.RESET}")

# ═══════════════════════════════════════════════════════
# STARTUP BANNER
# ═══════════════════════════════════════════════════════
print(f"""
{Colors.CYAN}{Colors.BOLD}
╔═══════════════════════════════════════════════════════╗
║        🚀 VN30-QUANTUM HUNTER V2.0                   ║
║        Multi-Thread Data Collector                    ║
╚═══════════════════════════════════════════════════════╝
{Colors.RESET}
🎯 Mục tiêu: {Colors.BOLD}{len(VN30_STOCKS)} mã VN30{Colors.RESET}
📡 Database: {INFLUX_URL}
⚡ Mode: Multi-Thread (10 workers)
""")

# ═══════════════════════════════════════════════════════
# DATABASE SETUP
# ═══════════════════════════════════════════════════════
try:
    client = InfluxDBClient(url=INFLUX_URL, token=INFLUX_TOKEN, org=INFLUX_ORG)
    write_api = client.write_api(write_options=SYNCHRONOUS)
    log_info("Kết nối InfluxDB thành công!")
except Exception as e:
    log_error(f"Không thể kết nối InfluxDB: {e}")
    exit(1)

# ═══════════════════════════════════════════════════════
# WORKER FUNCTION
# ═══════════════════════════════════════════════════════
def fetch_and_store(symbol: str) -> Point | None:
    """
    Worker function - Fetch data for a single stock
    Returns InfluxDB Point or None on error
    """
    try:
        now_str = datetime.now().strftime('%Y-%m-%d')
        
        # Fetch data from TCBS
        df = stock_historical_data(
            symbol=symbol, 
            start_date=now_str, 
            end_date=now_str, 
            resolution='1m', 
            type='stock', 
            source='TCBS'
        )
        
        if df is not None and not df.empty:
            latest = df.iloc[-1]
            price = float(latest['close'])
            volume = float(latest['volume'])
            high = float(latest['high']) if 'high' in latest else price
            low = float(latest['low']) if 'low' in latest else price
            open_price = float(latest['open']) if 'open' in latest else price
            
            # Create InfluxDB Point
            point = Point("stock_price") \
                .tag("symbol", symbol) \
                .tag("market", "VN30") \
                .field("price", price) \
                .field("open", open_price) \
                .field("high", high) \
                .field("low", low) \
                .field("close", price) \
                .field("volume", volume) \
                .time(datetime.utcnow())
            
            return point
        else:
            return None
            
    except Exception as e:
        log_warn(f"Lỗi {symbol}: {str(e)[:50]}")
        return None

# ═══════════════════════════════════════════════════════
# MAIN LOOP
# ═══════════════════════════════════════════════════════
def main_loop():
    """Main execution loop with parallel processing"""
    cycle_count = 0
    
    while True:
        cycle_count += 1
        start_time = time.time()
        points_batch = []
        
        print(f"\n{Colors.CYAN}━━━ Cycle #{cycle_count} ━━━{Colors.RESET}")
        
        # PARALLEL EXECUTION (Power of V2)
        # Use 10 workers for parallel requests
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            # Submit all stocks to workers
            results = executor.map(fetch_and_store, VN30_STOCKS)
            
            # Collect results
            for point in results:
                if point:
                    points_batch.append(point)

        # Batch write to database (IO optimized)
        if points_batch:
            try:
                write_api.write(bucket=INFLUX_BUCKET, org=INFLUX_ORG, record=points_batch)
                elapsed = time.time() - start_time
                
                # Success stats
                success_rate = (len(points_batch) / len(VN30_STOCKS)) * 100
                color = Colors.GREEN if success_rate > 80 else Colors.YELLOW
                
                print(f"{color}✅ Đã cập nhật {len(points_batch)}/{len(VN30_STOCKS)} mã " +
                      f"({success_rate:.0f}%) trong {elapsed:.2f}s{Colors.RESET}")
                      
            except Exception as e:
                log_error(f"Lỗi ghi database: {e}")
        else:
            print(f"{Colors.YELLOW}💤 Thị trường đang ngủ hoặc không có dữ liệu...{Colors.RESET}")

        # Sleep interval (10s default, can reduce to 5s for faster updates)
        time.sleep(10)


if __name__ == "__main__":
    try:
        main_loop()
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}👋 Hunter đã dừng.{Colors.RESET}")
    finally:
        client.close()
