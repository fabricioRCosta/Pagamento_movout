from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional
from app.db.database import get_session
from app.models.models import Motorista
from sqlalchemy import text

router = APIRouter()

@router.get("/{motorista_id}/perfil")
def obter_perfil_motorista(motorista_id: int, db: Session = Depends(get_session)):
    # 1. Buscar dados básicos do motorista e da pessoa
    q_perfil = text("""
        SELECT p.nome, p.cpf, m.id_motorista, m.data_inicio, m.avaliacao_media
        FROM motorista7 m
        JOIN pessoa7 p ON m.id_pessoa = p.id_pessoa
        WHERE m.id_motorista = :motorista_id
    """)
    row = db.exec(q_perfil, params={"motorista_id": motorista_id}).fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail="Motorista não encontrado")
    
    nome, cpf, id_m, data_inicio, avaliacao = row

    # 2. Calcular estatísticas (Somando Legado e Novo Esquema de Propostas)
    # Esquema 1: Tabela frete7 (legado)
    q_stats_legado = text("""
        SELECT 
            COUNT(id_frete) as total,
            SUM(IFNULL(preco_fechado, 0)) as saldo
        FROM frete7
        WHERE id_motorista = :motorista_id AND status IN ('aceito', 'em andamento', 'concluido')
    """)
    stats_legado = db.exec(q_stats_legado, params={"motorista_id": motorista_id}).fetchone()
    
    # Esquema 2: Tabela propostafrete + pedidofrete (esquema atual da API de fretes)
    # Contamos propostas do motorista onde o pedido vinculado está aceito ou em andamento
    q_stats_novo = text("""
        SELECT 
            COUNT(pf.id) as total,
            SUM(IFNULL(pf.valor, 0)) as saldo
        FROM propostafrete pf
        JOIN pedidofrete p ON pf.frete_id = p.id
        WHERE pf.motorista_id = :motorista_id AND p.status IN ('aceito', 'em andamento', 'concluido')
    """)
    stats_novo = db.exec(q_stats_novo, params={"motorista_id": motorista_id}).fetchone()

    total_fretes = (stats_legado[0] if stats_legado else 0) + (stats_novo[0] if stats_novo else 0)
    saldo_carteira = float((stats_legado[1] if stats_legado and stats_legado[1] else 0.0) + 
                           (stats_novo[1] if stats_novo and stats_novo[1] else 0.0))

    return {
        "nome": nome,
        "cpf": cpf,
        "id_motorista": id_m,
        "data_inicio": data_inicio.strftime("%b/%Y") if data_inicio else "Não informado",
        "avaliacao": float(avaliacao) if avaliacao else 0.0,
        "total_fretes": total_fretes,
        "saldo_carteira": saldo_carteira
    }

@router.get("/")
def listar_motoristas(db: Session = Depends(get_session)):
    # Usando raw SQL para garantir que pegamos os IDs da motorista7 (que o frontend usa)
    res = db.exec(text("SELECT id_motorista, id_pessoa FROM motorista7"))
    return [{"id_motorista": r[0], "id_pessoa": r[1]} for r in res]

@router.get("/{motorista_id}/historico")
def obter_historico_motorista(motorista_id: int, db: Session = Depends(get_session)):
    historico = []
    
    try:
        # 1. Buscar histórico no esquema legado (tabela frete7)
        q_legado = text("SELECT id_frete as id, 'Frete Legado' as descricao, peso_total_kg as peso_estimado, "
                        "status, endereco_origem as origem, endereco_destino as destino, preco_fechado as preco "
                        "FROM frete7 WHERE id_motorista = :motorista_id")
        res_legado = db.execute(q_legado, {"motorista_id": motorista_id}).fetchall()
        
        for r in res_legado:
            m = r._mapping
            historico.append({
                "id": m["id"],
                "descricao": m["descricao"],
                "peso_estimado": float(m["peso_estimado"]) if m["peso_estimado"] is not None else 0.0,
                "status": m["status"],
                "origem": m["origem"] if m["origem"] else "Não informado",
                "destino": m["destino"] if m["destino"] else "Não informado",
                "preco": float(m["preco"]) if m["preco"] is not None else 0.0
            })
            
        # 2. Buscar histórico no esquema novo (propostas aceitas)
        q_novo = text("SELECT p.id, p.descricao, p.peso_estimado, p.status, p.origem, p.destino, pf.valor as preco "
                      "FROM propostafrete pf JOIN pedidofrete p ON pf.frete_id = p.id "
                      "WHERE pf.motorista_id = :motorista_id")
        res_novo = db.execute(q_novo, {"motorista_id": motorista_id}).fetchall()
        
        for r in res_novo:
            m = r._mapping
            historico.append({
                "id": m["id"],
                "descricao": m["descricao"],
                "peso_estimado": float(m["peso_estimado"]) if m["peso_estimado"] is not None else 0.0,
                "status": m["status"],
                "origem": m["origem"] if m["origem"] else "Não informado",
                "destino": m["destino"] if m["destino"] else "Não informado",
                "preco": float(m["preco"]) if m["preco"] is not None else 0.0
            })
            
    except Exception as e:
        print(f"Erro ao buscar historico: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
    return historico
