from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlmodel import Session

from app.db.database import get_session

router = APIRouter()

@router.get("/me")
async def obter_usuario(email: str, db: Session = Depends(get_session)):
    """
    Retorna os dados do usuário a partir do e-mail.
    """
    q = text("""
        SELECT nome, email, cpf, telefone 
        FROM pessoa7 
        WHERE email = :email LIMIT 1
    """)
    row = db.exec(q, params={"email": email}).fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    nome, db_email, cpf, telefone = row
    return {
        "nome": nome,
        "email": db_email,
        "cpf": cpf,
        "telefone": telefone
    }

@router.get("/me/historico")
async def obter_historico(email: str, db: Session = Depends(get_session)):
    """
    Retorna o histórico de fretes de um usuário (como cliente ou motorista).
    """
    q = text("""
        SELECT f.id_frete, f.endereco_origem, f.endereco_destino,
               f.preco_fechado, f.preco_estimado, f.status,
               p_motorista.nome as motorista_nome
        FROM frete7 f
        LEFT JOIN cliente7 c ON f.id_cliente = c.id_cliente
        LEFT JOIN pessoa7 p_cliente ON c.id_pessoa = p_cliente.id_pessoa
        LEFT JOIN motorista7 m ON f.id_motorista = m.id_motorista
        LEFT JOIN pessoa7 p_motorista ON m.id_pessoa = p_motorista.id_pessoa
        WHERE (p_cliente.email = :email OR p_motorista.email = :email)
        ORDER BY f.id_frete DESC
    """)
    rows = db.exec(q, params={"email": email}).fetchall()
    
    historico = []
    for row in rows:
        id_frete, origem, destino, preco_f, preco_e, status, motorista = row
            
        preco = preco_f if preco_f is not None else preco_e
        preco_str = f"R$ {float(preco):.2f}".replace(".", ",") if preco is not None else "A combinar"
        
        historico.append({
            "id": id_frete,
            "date": "N/A",
            "origin": origem,
            "dest": destino,
            "price": preco_str,
            "status": status,
            "driver": motorista or "Não atribuído"
        })
    return historico

@router.get("/me/negociacao_ativa")
async def obter_negociacao_ativa(email: str, db: Session = Depends(get_session)):
    """
    Retorna a proposta (negociação) mais recente pendente para um frete do cliente.
    """
    q = text("""
        SELECT n.id_negociacao, n.preco_proposto, n.distancia_km, n.volume_carga,
               m.avaliacao_media,
               p_motorista.nome as motorista_nome,
               v.marca, v.modelo, v.placa
        FROM negociacao7 n
        JOIN frete7 f ON n.id_frete = f.id_frete
        JOIN cliente7 c ON f.id_cliente = c.id_cliente
        JOIN pessoa7 p_cliente ON c.id_pessoa = p_cliente.id_pessoa
        JOIN motorista7 m ON n.id_motorista = m.id_motorista
        JOIN pessoa7 p_motorista ON m.id_pessoa = p_motorista.id_pessoa
        JOIN veiculo7 v ON n.id_veiculo = v.id_veiculo
        WHERE p_cliente.email = :email AND n.status = 'PENDENTE'
        ORDER BY n.data_negociacao DESC LIMIT 1
    """)
    row = db.exec(q, params={"email": email}).fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail="Nenhuma negociação pendente")
    
    id_negociacao, preco, dist, vol, avaliacao, motorista, marca, modelo, placa = row
    
    # Calculate basic estimated time
    dist_val = float(dist) if dist else 10.0
    preco_val = float(preco) if preco else 50.0
    tempo_minutos = int((dist_val * 2) + 10)
    
    return {
        "id_negociacao": id_negociacao,
        "driver": {
            "name": motorista,
            "rating": float(avaliacao) if avaliacao else 5.0,
            "trips": 12,
            "vehicle": f"{marca} {modelo}",
            "plate": placa,
            "photo": "https://randomuser.me/api/portraits/men/32.jpg",
            "price": f"R$ {preco_val:.2f}".replace(".", ","),
            "rawPrice": preco_val,
            "time": f"{tempo_minutos} min",
            "suggestedPrice": f"R$ {(preco_val * 0.9):.2f}".replace(".", ",")
        }
    }

