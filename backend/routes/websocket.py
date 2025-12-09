"""
VN30-Quantum WebSocket Routes
Real-time WebSocket endpoints
"""
from typing import Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
import uuid

from ..routes.auth import get_current_user
from ..models.user import User

import sys
sys.path.insert(0, '../..')
from alerts import ws_manager, alert_manager

router = APIRouter(prefix="/ws", tags=["WebSocket"])


@router.websocket("/signals")
async def websocket_signals(
    websocket: WebSocket,
    token: Optional[str] = Query(None)
):
    """
    WebSocket endpoint for real-time signals
    
    Connect: ws://localhost:8000/api/v1/ws/signals?token=YOUR_JWT
    
    Messages:
    - Subscribe: {"action": "subscribe", "symbols": ["HPG", "VNM"]}
    - Unsubscribe: {"action": "unsubscribe", "symbols": ["HPG"]}
    
    Receives:
    - Signal updates
    - Price updates
    - Alerts
    """
    client_id = str(uuid.uuid4())
    user_id = None
    
    # TODO: Validate token and get user_id
    # For now, accept all connections
    
    try:
        client = await ws_manager.connect(websocket, client_id, user_id)
        
        while True:
            data = await websocket.receive_json()
            
            action = data.get("action")
            
            if action == "subscribe":
                symbols = data.get("symbols", [])
                await ws_manager.subscribe(client_id, symbols)
            
            elif action == "unsubscribe":
                symbols = data.get("symbols", [])
                await ws_manager.unsubscribe(client_id, symbols)
            
            elif action == "ping":
                await client.send({"type": "pong"})
            
    except WebSocketDisconnect:
        ws_manager.disconnect(client_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        ws_manager.disconnect(client_id)


@router.get("/stats")
async def websocket_stats():
    """Get WebSocket connection statistics"""
    return ws_manager.get_stats()


@router.get("/alerts/stats")
async def alert_stats():
    """Get alert system statistics"""
    return alert_manager.get_alert_stats()
