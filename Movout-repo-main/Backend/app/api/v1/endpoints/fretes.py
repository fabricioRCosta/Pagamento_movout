from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from pydantic import BaseModel
from typing import List, Optional
from sqlmodel import Session, select
from sqlalchemy.exc import DataError
from app.services.ai_service import detectar_objeto as call_ai_service
from app.websockets.manager import manager
from app.db.database import get_session
from app.models.models import PedidoFrete, PropostaFrete


router = APIRouter()


# ===== SCHEMAS (para entrada de dados, sem ser tabela) =====
class PropostaFreteCreate(BaseModel):
    motorista_id: int
    nome_motorista: str
    valor: float
    tempo_estimado: str
    rating: float = 4.8


class FreteCreate(BaseModel):
    descricao: str
    peso_estimado: float
    status: str = "aberto"
    origem: Optional[str] = None
    destino: Optional[str] = None
    origem_lat: Optional[float] = None
    origem_lng: Optional[float] = None
    destino_lat: Optional[float] = None
    destino_lng: Optional[float] = None
    distancia_km: Optional[float] = None
    tipo_veiculo: Optional[str] = None
    objeto_ia: Optional[str] = None
    prioridade: Optional[str] = "today"
    fragil: bool = False


# ===== ENDPOINTS =====

@router.post("/")
def criar_frete(dados: FreteCreate, session: Session = Depends(get_session)):
    payload = dados.dict()
    # Evita erro "Data too long" em bancos criados com colunas curtas.
    for field in ("descricao", "status", "origem", "destino", "tipo_veiculo", "objeto_ia", "prioridade"):
        value = payload.get(field)
        if isinstance(value, str):
            payload[field] = value[:255]

    frete = PedidoFrete(**payload)
    session.add(frete)
    try:
        session.commit()
    except DataError:
        session.rollback()
        raise HTTPException(
            status_code=400,
            detail="Endereco/descricao muito longo para o banco atual. Tente um endereco mais curto.",
        )
    session.refresh(frete)
    return frete


@router.get("/")
def listar_fretes(session: Session = Depends(get_session)):
    fretes = session.exec(select(PedidoFrete)).all()
    # Para cada frete, carrega as propostas
    result = []
    for frete in fretes:
        frete_dict = {
            "id": frete.id,
            "descricao": frete.descricao,
            "peso_estimado": frete.peso_estimado,
            "status": frete.status,
            "origem": frete.origem,
            "destino": frete.destino,
            "origem_lat": frete.origem_lat,
            "origem_lng": frete.origem_lng,
            "destino_lat": frete.destino_lat,
            "destino_lng": frete.destino_lng,
            "distancia_km": frete.distancia_km,
            "tipo_veiculo": frete.tipo_veiculo,
            "objeto_ia": frete.objeto_ia,
            "prioridade": frete.prioridade,
            "fragil": frete.fragil,
            "propostas": frete.propostas,
        }
        result.append(frete_dict)
    return result


@router.get("/{frete_id}")
def obter_frete(frete_id: int, session: Session = Depends(get_session)):
    frete = session.get(PedidoFrete, frete_id)
    if not frete:
        raise HTTPException(status_code=404, detail="Frete nao encontrado")
    return {
        "id": frete.id,
        "descricao": frete.descricao,
        "peso_estimado": frete.peso_estimado,
        "status": frete.status,
        "origem": frete.origem,
        "destino": frete.destino,
        "origem_lat": frete.origem_lat,
        "origem_lng": frete.origem_lng,
        "destino_lat": frete.destino_lat,
        "destino_lng": frete.destino_lng,
        "distancia_km": frete.distancia_km,
        "tipo_veiculo": frete.tipo_veiculo,
        "objeto_ia": frete.objeto_ia,
        "prioridade": frete.prioridade,
        "fragil": frete.fragil,
        "propostas": frete.propostas,
    }


@router.post("/{frete_id}/proposta")
def enviar_proposta(frete_id: int, dados: PropostaFreteCreate, session: Session = Depends(get_session)):
    frete = session.get(PedidoFrete, frete_id)
    if not frete:
        raise HTTPException(status_code=404, detail="Frete nao encontrado")

    proposta = PropostaFrete(frete_id=frete_id, **dados.dict())
    session.add(proposta)
    session.commit()

    # Conta propostas atuais
    propostas = session.exec(select(PropostaFrete).where(PropostaFrete.frete_id == frete_id)).all()
    return {"status": "proposta_enviada", "propostas_atuais": len(propostas)}


@router.get("/{frete_id}/propostas")
def listar_propostas(frete_id: int, session: Session = Depends(get_session)):
    frete = session.get(PedidoFrete, frete_id)
    if not frete:
        raise HTTPException(status_code=404, detail="Frete nao encontrado")
    propostas = session.exec(select(PropostaFrete).where(PropostaFrete.frete_id == frete_id)).all()
    return propostas


@router.post("/{frete_id}/aceitar-proposta")
def aceitar_proposta(frete_id: int, motorista_id: int, session: Session = Depends(get_session)):
    frete = session.get(PedidoFrete, frete_id)
    if not frete:
        raise HTTPException(status_code=404, detail="Frete nao encontrado")

    proposta = session.exec(
        select(PropostaFrete).where(
            PropostaFrete.frete_id == frete_id,
            PropostaFrete.motorista_id == motorista_id,
        )
    ).first()
    if not proposta:
        raise HTTPException(status_code=404, detail="Proposta do motorista nao encontrada")

    frete.status = "aceito"
    session.add(frete)
    session.commit()
    session.refresh(frete)

    payload = {
        "status": "ACEITO",
        "frete_id": frete.id,
        "motorista": {
            "id": proposta.motorista_id,
            "nome": proposta.nome_motorista,
            "nota": proposta.rating,
            "veiculo": frete.tipo_veiculo or "Veiculo",
            "placa": "N/A",
            "foto": "https://randomuser.me/api/portraits/men/32.jpg",
            "telefone": "",
        },
    }
    try:
        import asyncio

        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.create_task(manager.send_location(frete.id, payload))
        else:
            loop.run_until_complete(manager.send_location(frete.id, payload))
    except Exception:
        # Nao falha o aceite caso o websocket nao esteja conectado.
        pass

    return {"status": "sucesso", "frete_id": frete.id, "novo_status": frete.status}


@router.post("/{frete_id}/cancelar")
def cancelar_frete(frete_id: int, session: Session = Depends(get_session)):
    frete = session.get(PedidoFrete, frete_id)
    if not frete:
        raise HTTPException(status_code=404, detail="Frete nao encontrado")
    frete.status = "cancelado"
    session.add(frete)
    session.commit()
    session.refresh(frete)
    return {"status": "cancelado", "frete_id": frete.id, "novo_status": frete.status}


@router.post("/{frete_id}/match")
def match_frete(frete_id: int, session: Session = Depends(get_session)):
    from app.models.models import Motorista

    frete = session.get(PedidoFrete, frete_id)
    if not frete:
        raise HTTPException(status_code=404, detail="Frete nao encontrado")

    stmt = select(Motorista).where(
        Motorista.disponivel.is_(True),
        Motorista.capacidade_kg >= frete.peso_estimado,
    )
    motorista = session.exec(stmt).first()

    if not motorista:
        return {"mensagem": "Nenhum motorista disponivel"}

    motorista.disponivel = False
    frete.status = "em andamento"
    session.add(frete)
    session.add(motorista)
    session.commit()
    session.refresh(frete)
    session.refresh(motorista)

    return {
        "frete": frete,
        "motorista": motorista,
    }


@router.post("/detectar-objeto")
def post_detectar_objeto(
    file: UploadFile = File(...),
    frete_id: Optional[int] = None
):
    """
    Recebe uma imagem, envia para a IA e retorna o objeto detectado.
    """
    import logging
    logger = logging.getLogger("uvicorn.error")

    logger.info(f"--- [ENDPOINT] Recebida solicitacao de deteccao (frete_id: {frete_id}) ---")
    try:
        resultado = call_ai_service(file)
        objeto_identificado = resultado
        logger.info(f"--- [ENDPOINT] IA respondeu com sucesso: {objeto_identificado} ---")

        if frete_id:
            import asyncio
            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    asyncio.create_task(manager.send_location(frete_id, {
                        "tipo": "DETECCAO_OBJETO",
                        "objeto": objeto_identificado
                    }))
                else:
                    loop.run_until_complete(manager.send_location(frete_id, {
                        "tipo": "DETECCAO_OBJETO",
                        "objeto": objeto_identificado
                    }))
            except Exception as ws_err:
                logger.error(f"Erro ao enviar WebSocket: {ws_err}")

        return {
            "status": "sucesso",
            "objeto": objeto_identificado
        }

    except Exception as e:
        logger.error(f"--- [ENDPOINT] Erro: {str(e)} ---")
        raise HTTPException(status_code=500, detail=str(e))
