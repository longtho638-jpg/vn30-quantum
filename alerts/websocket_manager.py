"""
VN30-Quantum WebSocket Manager
Real-time push notifications
"""
import json
import asyncio
from typing import Dict, Set, Optional, List
from dataclasses import dataclass, field
from datetime import datetime
from fastapi import WebSocket, WebSocketDisconnect


@dataclass
class WebSocketClient:
    """Connected WebSocket client"""
    websocket: WebSocket
    user_id: Optional[int] = None
    subscribed_symbols: Set[str] = field(default_factory=set)
    connected_at: datetime = field(default_factory=datetime.now)
    
    async def send(self, message: Dict):
        """Send message to client"""
        try:
            await self.websocket.send_json(message)
            return True
        except:
            return False


class WebSocketManager:
    """
    WebSocket connection manager for real-time alerts
    Supports: Signal updates, Price alerts, Market data
    """
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocketClient] = {}
        self.symbol_subscribers: Dict[str, Set[str]] = {}  # symbol -> client_ids
    
    async def connect(
        self,
        websocket: WebSocket,
        client_id: str,
        user_id: int = None
    ) -> WebSocketClient:
        """Accept new WebSocket connection"""
        await websocket.accept()
        
        client = WebSocketClient(
            websocket=websocket,
            user_id=user_id
        )
        self.active_connections[client_id] = client
        
        # Send welcome message
        await client.send({
            "type": "connected",
            "client_id": client_id,
            "message": "Connected to VN30-Quantum real-time alerts"
        })
        
        return client
    
    def disconnect(self, client_id: str):
        """Remove client on disconnect"""
        if client_id in self.active_connections:
            client = self.active_connections[client_id]
            
            # Remove from symbol subscriptions
            for symbol in client.subscribed_symbols:
                if symbol in self.symbol_subscribers:
                    self.symbol_subscribers[symbol].discard(client_id)
            
            del self.active_connections[client_id]
    
    async def subscribe(self, client_id: str, symbols: List[str]):
        """Subscribe client to symbol updates"""
        if client_id not in self.active_connections:
            return
        
        client = self.active_connections[client_id]
        
        for symbol in symbols:
            symbol = symbol.upper()
            client.subscribed_symbols.add(symbol)
            
            if symbol not in self.symbol_subscribers:
                self.symbol_subscribers[symbol] = set()
            self.symbol_subscribers[symbol].add(client_id)
        
        await client.send({
            "type": "subscribed",
            "symbols": list(client.subscribed_symbols)
        })
    
    async def unsubscribe(self, client_id: str, symbols: List[str]):
        """Unsubscribe client from symbols"""
        if client_id not in self.active_connections:
            return
        
        client = self.active_connections[client_id]
        
        for symbol in symbols:
            symbol = symbol.upper()
            client.subscribed_symbols.discard(symbol)
            
            if symbol in self.symbol_subscribers:
                self.symbol_subscribers[symbol].discard(client_id)
    
    # ============== Broadcast Methods ==============
    
    async def broadcast_all(self, message: Dict):
        """Broadcast to all connected clients"""
        disconnected = []
        
        for client_id, client in self.active_connections.items():
            success = await client.send(message)
            if not success:
                disconnected.append(client_id)
        
        # Clean up disconnected clients
        for client_id in disconnected:
            self.disconnect(client_id)
    
    async def broadcast_to_symbol(self, symbol: str, message: Dict):
        """Broadcast to clients subscribed to a symbol"""
        symbol = symbol.upper()
        
        if symbol not in self.symbol_subscribers:
            return
        
        disconnected = []
        
        for client_id in self.symbol_subscribers[symbol]:
            if client_id in self.active_connections:
                success = await self.active_connections[client_id].send(message)
                if not success:
                    disconnected.append(client_id)
        
        for client_id in disconnected:
            self.disconnect(client_id)
    
    async def send_to_user(self, user_id: int, message: Dict):
        """Send to specific user's connections"""
        for client_id, client in self.active_connections.items():
            if client.user_id == user_id:
                await client.send(message)
    
    # ============== Alert Broadcasts ==============
    
    async def broadcast_signal(
        self,
        symbol: str,
        signal_type: str,
        price: float,
        confidence: float,
        **kwargs
    ):
        """Broadcast trading signal"""
        message = {
            "type": "signal",
            "symbol": symbol,
            "signal": signal_type,
            "price": price,
            "confidence": confidence,
            "timestamp": datetime.now().isoformat(),
            **kwargs
        }
        
        await self.broadcast_to_symbol(symbol, message)
        
        # Also broadcast to "all" subscribers
        await self.broadcast_to_symbol("ALL", message)
    
    async def broadcast_price_update(
        self,
        symbol: str,
        price: float,
        change_percent: float,
        volume: float
    ):
        """Broadcast price update"""
        message = {
            "type": "price_update",
            "symbol": symbol,
            "price": price,
            "change_percent": change_percent,
            "volume": volume,
            "timestamp": datetime.now().isoformat()
        }
        
        await self.broadcast_to_symbol(symbol, message)
    
    async def broadcast_alert(
        self,
        symbol: str,
        alert_type: str,
        message_text: str
    ):
        """Broadcast custom alert"""
        message = {
            "type": "alert",
            "alert_type": alert_type,
            "symbol": symbol,
            "message": message_text,
            "timestamp": datetime.now().isoformat()
        }
        
        await self.broadcast_to_symbol(symbol, message)
    
    async def broadcast_market_status(
        self,
        is_open: bool,
        session: str,
        next_open: str = None
    ):
        """Broadcast market status"""
        message = {
            "type": "market_status",
            "is_open": is_open,
            "session": session,
            "next_open": next_open,
            "timestamp": datetime.now().isoformat()
        }
        
        await self.broadcast_all(message)
    
    # ============== Stats ==============
    
    def get_stats(self) -> Dict:
        """Get connection statistics"""
        return {
            "total_connections": len(self.active_connections),
            "subscribed_symbols": len(self.symbol_subscribers),
            "symbols": list(self.symbol_subscribers.keys())
        }


# Global WebSocket manager
ws_manager = WebSocketManager()
