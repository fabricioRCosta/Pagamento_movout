from typing import Dict, List

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.redis import redis_client
from app.websockets.manager import manager

router = APIRouter()

# Sala de chat por frete: frete_id -> websockets conectados.
chat_connections: Dict[int, List[WebSocket]] = {}


@router.websocket('/fretes/{frete_id}')
async def websocket_localizacao(websocket: WebSocket, frete_id: int):
    await manager.connect(frete_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(frete_id, websocket)


@router.websocket('/motoristas/{motorista_id}')
async def websocket_motorista(websocket: WebSocket, motorista_id: int):
    await websocket.accept()
    print(f' Motorista {motorista_id} conectado')

    try:
        while True:
            data = await websocket.receive_json()

            latitude = data['latitude']
            longitude = data['longitude']
            frete_id = data['frete_id']

            chave = f'motorista:{motorista_id}:localizacao'

            redis_client.hset(
                chave,
                mapping={'latitude': latitude, 'longitude': longitude},
            )
            redis_client.expire(chave, 30)

            await manager.send_location(
                frete_id,
                {
                    'motorista_id': motorista_id,
                    'latitude': latitude,
                    'longitude': longitude,
                },
            )

    except WebSocketDisconnect:
        print(f' Motorista {motorista_id} desconectado')


@router.websocket('/chat/{frete_id}')
async def websocket_chat(websocket: WebSocket, frete_id: int):
    await websocket.accept()
    chat_connections.setdefault(frete_id, []).append(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            for ws in chat_connections.get(frete_id, []):
                await ws.send_json(data)
    except WebSocketDisconnect:
        if frete_id in chat_connections and websocket in chat_connections[frete_id]:
            chat_connections[frete_id].remove(websocket)
