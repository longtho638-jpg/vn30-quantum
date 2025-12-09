"""
VN30-Quantum Hunter Configuration
Centralized config for all VN30 stocks
"""
import os
from dataclasses import dataclass
from typing import List

# VN30 Index Components (30 stocks)
VN30_STOCKS: List[str] = [
    "VNM", "VIC", "VHM", "HPG", "VCB", "BID", "CTG", "TCB",
    "MBB", "VPB", "FPT", "VRE", "MSN", "NVL", "PLX", "GAS",
    "SAB", "MWG", "POW", "HDB", "STB", "TPB", "VJC", "BVH",
    "SSI", "REE", "KDH", "PDR", "PNJ", "ACB"
]

@dataclass
class InfluxConfig:
    """InfluxDB configuration"""
    url: str = os.getenv('INFLUX_URL', 'http://localhost:8086')
    token: str = os.getenv('INFLUX_TOKEN', '')
    org: str = os.getenv('INFLUX_ORG', 'vnquant')
    bucket: str = os.getenv('INFLUX_BUCKET', 'market_data')

@dataclass
class HunterConfig:
    """Hunter bot configuration"""
    stocks: List[str] = None
    refresh_interval: int = int(os.getenv('REFRESH_INTERVAL', '60'))
    history_days: int = int(os.getenv('HISTORY_DAYS', '30'))
    batch_size: int = int(os.getenv('BATCH_SIZE', '5'))
    rate_limit_delay: float = float(os.getenv('RATE_LIMIT_DELAY', '0.5'))
    
    def __post_init__(self):
        if self.stocks is None:
            # Get from env or use all VN30
            stocks_env = os.getenv('TARGET_STOCKS', '')
            if stocks_env:
                self.stocks = [s.strip() for s in stocks_env.split(',')]
            else:
                self.stocks = VN30_STOCKS

# Default configs
influx_config = InfluxConfig()
hunter_config = HunterConfig()

# Logging colors
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def log_info(msg: str):
    print(f"{Colors.CYAN}ℹ️  {msg}{Colors.ENDC}")

def log_success(msg: str):
    print(f"{Colors.GREEN}✅ {msg}{Colors.ENDC}")

def log_warning(msg: str):
    print(f"{Colors.WARNING}⚠️  {msg}{Colors.ENDC}")

def log_error(msg: str):
    print(f"{Colors.FAIL}❌ {msg}{Colors.ENDC}")

def log_header(msg: str):
    print(f"\n{Colors.BOLD}{Colors.HEADER}{'='*50}")
    print(f"   {msg}")
    print(f"{'='*50}{Colors.ENDC}\n")
