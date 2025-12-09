"""
VN30-Quantum Hunter Bot v2.0
Multi-stock data collection with async support
"""
import asyncio
import time
from datetime import datetime, timedelta
from typing import List, Dict, Any
from concurrent.futures import ThreadPoolExecutor
from vnstock import stock_historical_data
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS

from config import (
    influx_config, hunter_config, VN30_STOCKS,
    log_info, log_success, log_warning, log_error, log_header
)

class VN30Hunter:
    """Hunter bot for VN30 stock data collection"""
    
    def __init__(self):
        self.client = InfluxDBClient(
            url=influx_config.url,
            token=influx_config.token,
            org=influx_config.org
        )
        self.write_api = self.client.write_api(write_options=SYNCHRONOUS)
        self.stats = {
            'success': 0,
            'failed': 0,
            'total_points': 0
        }
    
    def fetch_stock_data(self, symbol: str, start_date: str, end_date: str) -> Dict[str, Any]:
        """Fetch data for a single stock"""
        try:
            df = stock_historical_data(
                symbol=symbol,
                start_date=start_date,
                end_date=end_date,
                resolution='1D',
                type='stock',
                source='TCBS'
            )
            
            if df is not None and not df.empty:
                return {'symbol': symbol, 'data': df, 'success': True}
            return {'symbol': symbol, 'data': None, 'success': False}
        
        except Exception as e:
            log_warning(f"[{symbol}] Error: {e}")
            return {'symbol': symbol, 'data': None, 'success': False, 'error': str(e)}
    
    def write_to_influx(self, symbol: str, df) -> int:
        """Write dataframe to InfluxDB"""
        points_written = 0
        
        for idx, row in df.iterrows():
            try:
                point = Point("stock_price") \
                    .tag("symbol", symbol) \
                    .field("open", float(row['open'])) \
                    .field("high", float(row['high'])) \
                    .field("low", float(row['low'])) \
                    .field("close", float(row['close'])) \
                    .field("volume", float(row['volume'])) \
                    .time(row['time'] if 'time' in row else idx)
                
                self.write_api.write(
                    bucket=influx_config.bucket,
                    org=influx_config.org,
                    record=point
                )
                points_written += 1
            except Exception as e:
                log_warning(f"[{symbol}] Write error: {e}")
        
        return points_written
    
    def load_historical_data(self, stocks: List[str] = None):
        """Load historical data for all stocks"""
        stocks = stocks or hunter_config.stocks
        start_date = (datetime.now() - timedelta(days=hunter_config.history_days)).strftime('%Y-%m-%d')
        end_date = datetime.now().strftime('%Y-%m-%d')
        
        log_header(f"Loading {hunter_config.history_days} days history for {len(stocks)} stocks")
        
        # Process in batches to avoid rate limiting
        for i in range(0, len(stocks), hunter_config.batch_size):
            batch = stocks[i:i + hunter_config.batch_size]
            log_info(f"Processing batch {i//hunter_config.batch_size + 1}: {', '.join(batch)}")
            
            with ThreadPoolExecutor(max_workers=hunter_config.batch_size) as executor:
                futures = [
                    executor.submit(self.fetch_stock_data, symbol, start_date, end_date)
                    for symbol in batch
                ]
                
                for future in futures:
                    result = future.result()
                    symbol = result['symbol']
                    
                    if result['success'] and result['data'] is not None:
                        points = self.write_to_influx(symbol, result['data'])
                        self.stats['success'] += 1
                        self.stats['total_points'] += points
                        log_success(f"[{symbol}] {len(result['data'])} days, {points} points")
                    else:
                        self.stats['failed'] += 1
                        log_warning(f"[{symbol}] No data")
            
            # Rate limit between batches
            if i + hunter_config.batch_size < len(stocks):
                time.sleep(hunter_config.rate_limit_delay)
        
        log_header("Historical Data Load Complete")
        log_info(f"Success: {self.stats['success']} | Failed: {self.stats['failed']} | Points: {self.stats['total_points']}")
    
    def refresh_today_data(self, stocks: List[str] = None):
        """Refresh today's data for all stocks"""
        stocks = stocks or hunter_config.stocks
        today = datetime.now().strftime('%Y-%m-%d')
        
        success_count = 0
        prices = []
        
        for i in range(0, len(stocks), hunter_config.batch_size):
            batch = stocks[i:i + hunter_config.batch_size]
            
            with ThreadPoolExecutor(max_workers=hunter_config.batch_size) as executor:
                futures = [
                    executor.submit(self.fetch_stock_data, symbol, today, today)
                    for symbol in batch
                ]
                
                for future in futures:
                    result = future.result()
                    symbol = result['symbol']
                    
                    if result['success'] and result['data'] is not None:
                        self.write_to_influx(symbol, result['data'])
                        latest = result['data'].iloc[-1]
                        prices.append(f"{symbol}:{latest['close']:,.0f}")
                        success_count += 1
            
            time.sleep(hunter_config.rate_limit_delay)
        
        timestamp = datetime.now().strftime('%H:%M:%S')
        log_success(f"[{timestamp}] Updated {success_count}/{len(stocks)} stocks")
        
        # Print top gainers/losers summary
        if prices:
            print(f"   Latest: {' | '.join(prices[:5])}...")
    
    def run(self):
        """Main run loop"""
        log_header("VN30-QUANTUM HUNTER v2.0")
        log_info(f"Target: {len(hunter_config.stocks)} stocks")
        log_info(f"Database: {influx_config.url}")
        log_info(f"Refresh interval: {hunter_config.refresh_interval}s")
        
        # Load historical data first
        self.load_historical_data()
        
        # Continuous refresh loop
        log_header("Starting Continuous Monitoring")
        while True:
            try:
                self.refresh_today_data()
            except Exception as e:
                log_error(f"Refresh error: {e}")
            
            time.sleep(hunter_config.refresh_interval)


if __name__ == "__main__":
    hunter = VN30Hunter()
    hunter.run()
