#!/usr/bin/env python3
"""
VN30-Quantum AI Signal Generator CLI
Test and generate trading signals from command line
"""
import sys
import json
import argparse
from datetime import datetime, timedelta

# Add parent dir to path
sys.path.insert(0, '.')

from ai_engine import (
    SignalGenerator, 
    PatternDetector,
    GeminiAdvisor,
    SignalType
)


def generate_sample_data(days: int = 30) -> dict:
    """Generate sample price data for testing"""
    import random
    
    base_price = 25000
    prices = []
    volumes = []
    opens = []
    highs = []
    lows = []
    closes = []
    
    for i in range(days):
        # Random walk
        change = random.uniform(-0.03, 0.035)  # Slight bullish bias
        base_price = base_price * (1 + change)
        
        # OHLC
        open_price = base_price * random.uniform(0.99, 1.01)
        close_price = base_price
        high_price = max(open_price, close_price) * random.uniform(1.0, 1.02)
        low_price = min(open_price, close_price) * random.uniform(0.98, 1.0)
        volume = random.randint(500000, 2000000)
        
        opens.append(open_price)
        highs.append(high_price)
        lows.append(low_price)
        closes.append(close_price)
        prices.append(close_price)
        volumes.append(volume)
    
    return {
        'opens': opens,
        'highs': highs,
        'lows': lows,
        'closes': closes,
        'prices': prices,
        'volumes': volumes
    }


def print_signal(signal, verbose: bool = False):
    """Pretty print a trading signal"""
    emoji = {
        SignalType.STRONG_BUY: "🟢🟢",
        SignalType.BUY: "🟢",
        SignalType.HOLD: "🟡",
        SignalType.SELL: "🔴",
        SignalType.STRONG_SELL: "🔴🔴"
    }
    
    print(f"\n{'='*50}")
    print(f" {emoji.get(signal.signal_type, '⚪')} {signal.symbol} - {signal.signal_type.value}")
    print(f"{'='*50}")
    print(f" Price:      {signal.price:,.0f} VND")
    print(f" Target:     {signal.target_price:,.0f} VND ({(signal.target_price/signal.price-1)*100:+.1f}%)")
    print(f" Stop Loss:  {signal.stop_loss:,.0f} VND ({(signal.stop_loss/signal.price-1)*100:+.1f}%)")
    print(f" Risk/Reward: {signal.risk_reward_ratio:.2f}")
    print(f" Confidence: {signal.confidence:.0%}")
    print(f" Generated:  {signal.generated_at.strftime('%Y-%m-%d %H:%M:%S')}")
    
    if signal.reasoning:
        print(f"\n📊 Reasoning:")
        for reason in signal.reasoning:
            print(f"   {reason}")
    
    if verbose and signal.indicators:
        print(f"\n📈 Indicators:")
        for name, ind in signal.indicators.items():
            print(f"   • {ind.name}: {ind.value} ({ind.signal.name})")


def print_patterns(patterns):
    """Pretty print detected patterns"""
    if not patterns:
        print("\n⚪ No significant patterns detected")
        return
    
    print(f"\n{'='*50}")
    print(f" 📐 DETECTED PATTERNS")
    print(f"{'='*50}")
    
    for p in patterns:
        emoji = "🟢" if p.is_bullish else "🔴"
        print(f" {emoji} {p.pattern_type.value.upper()}")
        print(f"    {p.description}")
        print(f"    Confidence: {p.confidence:.0%}")
        if p.target_price:
            print(f"    Target: {p.target_price:,.0f} | SL: {p.stop_loss:,.0f}")
        print()


def main():
    parser = argparse.ArgumentParser(
        description='VN30-Quantum AI Signal Generator',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python signal_cli.py HPG                    # Generate signal for HPG
  python signal_cli.py HPG VNM FPT           # Multiple stocks
  python signal_cli.py --all                  # All VN30 stocks
  python signal_cli.py HPG --patterns         # Include pattern detection
  python signal_cli.py HPG --ai               # Include Gemini AI analysis
        """
    )
    
    parser.add_argument('symbols', nargs='*', help='Stock symbols (e.g., HPG VNM FPT)')
    parser.add_argument('--all', action='store_true', help='Analyze all VN30 stocks')
    parser.add_argument('--patterns', action='store_true', help='Include pattern detection')
    parser.add_argument('--ai', action='store_true', help='Include Gemini AI analysis')
    parser.add_argument('--verbose', '-v', action='store_true', help='Verbose output')
    parser.add_argument('--json', action='store_true', help='Output as JSON')
    parser.add_argument('--top', type=int, default=5, help='Show top N signals (default: 5)')
    
    args = parser.parse_args()
    
    # Default symbols
    if args.all:
        from hunter.config import VN30_STOCKS
        symbols = VN30_STOCKS
    elif args.symbols:
        symbols = [s.upper() for s in args.symbols]
    else:
        symbols = ['HPG', 'VNM', 'FPT', 'VCB', 'TCB']  # Default demo
    
    print(f"\n🚀 VN30-Quantum AI Signal Generator v2.0")
    print(f"⏰ {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"📊 Analyzing {len(symbols)} stocks...")
    
    # Initialize engines
    signal_gen = SignalGenerator()
    pattern_det = PatternDetector() if args.patterns else None
    gemini = GeminiAdvisor() if args.ai else None
    
    results = []
    
    for symbol in symbols:
        # Generate sample data (in production, fetch from InfluxDB)
        data = generate_sample_data(30)
        
        # Generate signal
        signal = signal_gen.generate_signal(
            symbol=symbol,
            prices=data['prices'],
            volumes=data['volumes']
        )
        
        if args.json:
            results.append(signal.to_dict())
        else:
            print_signal(signal, args.verbose)
        
        # Pattern detection
        if pattern_det:
            patterns = pattern_det.detect_all_patterns(
                data['opens'], data['highs'], data['lows'], data['closes']
            )
            if not args.json:
                print_patterns(patterns)
        
        # AI Analysis
        if gemini and signal.signal_type != SignalType.HOLD:
            if not args.json:
                print(f"\n🤖 Gemini AI Analysis:")
                analysis = gemini.analyze_stock(
                    symbol=symbol,
                    prices=data['prices'],
                    volumes=data['volumes'],
                    indicators=signal.indicators,
                    signal_type=signal.signal_type.value,
                    confidence=signal.confidence
                )
                print(f"   Sentiment: {analysis.sentiment.upper()}")
                print(f"   Summary: {analysis.summary}")
    
    if args.json:
        print(json.dumps(results, indent=2, default=str))
    
    print(f"\n✅ Analysis complete!")


if __name__ == '__main__':
    main()
