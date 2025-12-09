"""
VN30-Quantum Signals Routes
AI trading signals endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from ..routes.auth import get_current_active_user
from ..models.user import User, SubscriptionTier

import sys
sys.path.insert(0, '../..')

router = APIRouter(prefix="/signals", tags=["Trading Signals"])


# ============== Schemas ==============

class SignalResponse(BaseModel):
    """Trading signal response"""
    symbol: str
    signal: str
    confidence: float
    price: float
    target: float
    stop_loss: float
    risk_reward: float
    reasoning: List[str]


class MarketOverview(BaseModel):
    """Market overview response"""
    timestamp: str
    total_stocks: int
    buy_signals: int
    sell_signals: int
    hold_signals: int
    top_buys: List[SignalResponse]
    top_sells: List[SignalResponse]
    market_sentiment: str


# ============== Routes ==============

@router.get("/stock/{symbol}", response_model=SignalResponse)
async def get_stock_signal(
    symbol: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get trading signal for a specific stock"""
    symbol = symbol.upper()
    
    # Check subscription limits
    from hunter.config import VN30_STOCKS
    if symbol not in VN30_STOCKS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid symbol. Must be one of VN30: {', '.join(VN30_STOCKS[:5])}..."
        )
    
    # Check tier access
    if current_user.subscription_tier == SubscriptionTier.FREE:
        allowed = VN30_STOCKS[:5]  # First 5 only
        if symbol not in allowed:
            raise HTTPException(
                status_code=403,
                detail=f"Free tier limited to: {', '.join(allowed)}. Upgrade to access {symbol}."
            )
    
    # Generate signal
    try:
        from ai_engine import SignalGenerator
        
        # TODO: Fetch real data from InfluxDB
        # For now, generate sample data
        import random
        prices = [random.uniform(20000, 30000) for _ in range(30)]
        volumes = [random.randint(500000, 2000000) for _ in range(30)]
        
        generator = SignalGenerator()
        signal = generator.generate_signal(symbol, prices, volumes)
        
        return SignalResponse(
            symbol=signal.symbol,
            signal=signal.signal_type.value,
            confidence=signal.confidence,
            price=signal.price,
            target=signal.target_price,
            stop_loss=signal.stop_loss,
            risk_reward=signal.risk_reward_ratio,
            reasoning=signal.reasoning
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating signal: {str(e)}"
        )


@router.get("/watchlist", response_model=List[SignalResponse])
async def get_watchlist_signals(
    current_user: User = Depends(get_current_active_user)
):
    """Get signals for user's watchlist"""
    # TODO: Fetch from database
    # For now, return sample
    return []


@router.get("/top", response_model=List[SignalResponse])
async def get_top_signals(
    signal_type: Optional[str] = Query(None, description="Filter: buy, sell, or all"),
    limit: int = Query(5, ge=1, le=20),
    current_user: User = Depends(get_current_active_user)
):
    """Get top trading signals"""
    # Check tier for limits
    max_stocks = current_user.stocks_limit
    
    from hunter.config import VN30_STOCKS
    allowed_stocks = VN30_STOCKS[:max_stocks]
    
    try:
        from ai_engine import SignalGenerator, SignalType
        import random
        
        generator = SignalGenerator()
        signals = []
        
        for symbol in allowed_stocks:
            prices = [random.uniform(20000, 30000) for _ in range(30)]
            volumes = [random.randint(500000, 2000000) for _ in range(30)]
            
            signal = generator.generate_signal(symbol, prices, volumes)
            
            # Filter by type
            if signal_type:
                if signal_type.lower() == "buy" and "BUY" not in signal.signal_type.value:
                    continue
                if signal_type.lower() == "sell" and "SELL" not in signal.signal_type.value:
                    continue
            
            signals.append(SignalResponse(
                symbol=signal.symbol,
                signal=signal.signal_type.value,
                confidence=signal.confidence,
                price=signal.price,
                target=signal.target_price,
                stop_loss=signal.stop_loss,
                risk_reward=signal.risk_reward_ratio,
                reasoning=signal.reasoning
            ))
        
        # Sort by confidence
        signals.sort(key=lambda s: s.confidence, reverse=True)
        
        return signals[:limit]
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating signals: {str(e)}"
        )


@router.get("/market-overview", response_model=MarketOverview)
async def get_market_overview(
    current_user: User = Depends(get_current_active_user)
):
    """Get VN30 market overview"""
    from datetime import datetime
    from hunter.config import VN30_STOCKS
    from ai_engine import SignalGenerator
    import random
    
    max_stocks = current_user.stocks_limit
    stocks = VN30_STOCKS[:max_stocks]
    
    generator = SignalGenerator()
    all_signals = []
    
    for symbol in stocks:
        prices = [random.uniform(20000, 30000) for _ in range(30)]
        volumes = [random.randint(500000, 2000000) for _ in range(30)]
        
        signal = generator.generate_signal(symbol, prices, volumes)
        all_signals.append(SignalResponse(
            symbol=signal.symbol,
            signal=signal.signal_type.value,
            confidence=signal.confidence,
            price=signal.price,
            target=signal.target_price,
            stop_loss=signal.stop_loss,
            risk_reward=signal.risk_reward_ratio,
            reasoning=signal.reasoning
        ))
    
    # Count signals
    buy_count = sum(1 for s in all_signals if "BUY" in s.signal)
    sell_count = sum(1 for s in all_signals if "SELL" in s.signal)
    hold_count = len(all_signals) - buy_count - sell_count
    
    # Determine sentiment
    if buy_count > sell_count * 1.5:
        sentiment = "BULLISH 🟢"
    elif sell_count > buy_count * 1.5:
        sentiment = "BEARISH 🔴"
    else:
        sentiment = "NEUTRAL 🟡"
    
    # Get top signals
    top_buys = sorted([s for s in all_signals if "BUY" in s.signal], 
                      key=lambda x: x.confidence, reverse=True)[:3]
    top_sells = sorted([s for s in all_signals if "SELL" in s.signal], 
                       key=lambda x: x.confidence, reverse=True)[:3]
    
    return MarketOverview(
        timestamp=datetime.now().isoformat(),
        total_stocks=len(all_signals),
        buy_signals=buy_count,
        sell_signals=sell_count,
        hold_signals=hold_count,
        top_buys=top_buys,
        top_sells=top_sells,
        market_sentiment=sentiment
    )
