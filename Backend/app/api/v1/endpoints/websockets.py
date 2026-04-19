from typing import Dict, List, Optional
from datetime import datetime
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query, HTTPException
from sqlmodel import Session, select

from app.core.redis import redis_client
from app.websockets.manager import manager
from app.db.database import get_session, engine
from app.models.models import MensagemChat, PedidoFrete, PropostaFrete

logger = logging.getLogger("uvicorn.error")

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
            
            # Tratamento de erro DB e commit antes do broadcast
            try:
                with Session(engine) as session:
                    msg = MensagemChat(
                        frete_id=frete_id,
                        remetente=data.get('sender', 'user'),
                        texto=data.get('text', '')
                    )
                    session.add(msg)
                    session.commit()
                    session.refresh(msg)
                    
                    msg_dict = {
                        "id": msg.id,
                        "text": msg.texto,
                        "sender": msg.remetente,
                        "time": msg.data_hora.strftime("%H:%M") if msg.data_hora else datetime.utcnow().strftime("%H:%M")
                    }
                    
                    # Somente apos commit bem sucedido, notifica os clients
                    for ws in chat_connections.get(frete_id, []):
                        await ws.send_json(msg_dict)
                        
            except Exception as db_err:
                logger.error(f"Erro ao persistir mensagem de chat: {db_err}")
                
    except WebSocketDisconnect:
        if frete_id in chat_connections and websocket in chat_connections[frete_id]:
            chat_connections[frete_id].remove(websocket)


@router.get('/chat/{frete_id}/historico')
def obter_historico_chat(
    frete_id: int, 
    role: Optional[str] = Query(None, description="role: 'user' ou 'driver'"),
    user_id: Optional[int] = Query(None, description="ID do usuário p/ validacao"),
    session: Session = Depends(get_session)
):
    frete = session.get(PedidoFrete, frete_id)
    if not frete:
        raise HTTPException(status_code=404, detail="Frete nao encontrado")
    
    # Validação de segurança básica para motoristas
    if role == 'driver' and user_id:
        proposta = session.exec(
            select(PropostaFrete)
            .where(PropostaFrete.frete_id == frete_id, PropostaFrete.motorista_id == user_id)
        ).first()
        if not proposta:
            raise HTTPException(status_code=403, detail="Acesso negado: Motorista nao envolvido no frete")
    
    stm = select(MensagemChat).where(MensagemChat.frete_id == frete_id).order_by(MensagemChat.data_hora.asc())
    mensagens = session.exec(stm).all()
    
    resultados = []
    for m in mensagens:
        resultados.append({
            "id": m.id,
            "text": m.texto,
            "sender": m.remetente,
            "time": m.data_hora.strftime("%H:%M") if m.data_hora else ""
        })
    return resultados
