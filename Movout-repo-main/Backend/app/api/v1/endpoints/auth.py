from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlmodel import Session
import bcrypt
from typing import Optional

from app.db.database import get_session

router = APIRouter()


class LoginRequest(BaseModel):
    email: str
    senha: str


class RegisterRequest(BaseModel):
    nome: str
    email: str
    senha: str
    cpf: str
    telefone: Optional[str] = "Não informado"
    tipo: str = "motorista" # 'cliente' ou 'motorista'
    # Campos de veículo (Opcionais para clientes)
    veiculo: Optional[str] = None
    marca: Optional[str] = None
    placa: Optional[str] = None


def _verificar_senha(senha_plain: str, senha_hash: str) -> bool:
    """Verifica senha com bcrypt."""
    try:
        return bcrypt.checkpw(senha_plain.encode("utf-8"), senha_hash.encode("utf-8"))
    except Exception:
        return False


def _hash_senha(senha_plain: str) -> str:
    """Gera hash da senha com bcrypt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(senha_plain.encode("utf-8"), salt).decode("utf-8")


@router.post("/login")
async def realizar_login(dados: LoginRequest, db: Session = Depends(get_session)):
    q = text("""
        SELECT p.id_pessoa, p.nome, p.senha_hash, p.email, p.cpf, p.telefone,
               c.id_cliente, m.id_motorista
        FROM pessoa7 p
        LEFT JOIN cliente7 c ON c.id_pessoa = p.id_pessoa
        LEFT JOIN motorista7 m ON m.id_pessoa = p.id_pessoa
        WHERE p.email = :email
        LIMIT 1
    """)
    
    row = db.exec(q, params={"email": dados.email}).fetchone()
    if not row:
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos")

    id_pessoa, nome, senha_hash, db_email, cpf, telefone, id_cliente, id_motorista = row
    
    if not _verificar_senha(dados.senha, senha_hash):
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos")

    tipo = "cliente" if id_cliente else "motorista" if id_motorista else "pessoa"

    return {
        "status": "sucesso",
        "token": "token-temporario-real",
        "usuario": {
            "id_pessoa": id_pessoa, 
            "nome": nome, 
            "email": db_email,
            "cpf": cpf,
            "telefone": telefone,
            "tipo": tipo,
            "id_motorista": id_motorista if id_motorista else None
        }
    }


@router.post("/register")
async def realizar_cadastro(dados: RegisterRequest, db: Session = Depends(get_session)):
    """
    Cadastra um novo usuário (cliente ou motorista).
    """
    try:
        # 0. Validações Básicas
        if dados.tipo == "motorista" and (not dados.veiculo or not dados.placa):
            raise HTTPException(status_code=400, detail="Dados do veículo são obrigatórios para motoristas")

        # 1. Criar Pessoa
        senha_hash = _hash_senha(dados.senha)
        q_pessoa = text("""
            INSERT INTO pessoa7 (nome, cpf, email, telefone, senha_hash)
            VALUES (:nome, :cpf, :email, :telefone, :senha_hash)
        """)
        result_pessoa = db.exec(q_pessoa, params={
            "nome": dados.nome,
            "cpf": dados.cpf,
            "email": dados.email,
            "telefone": dados.telefone,
            "senha_hash": senha_hash
        })
        
        # Pega o ID da pessoa recém criada (lastrowid é mais seguro que commit + SELECT)
        id_pessoa = result_pessoa.lastrowid
        if not id_pessoa:
            id_pessoa = db.exec(text("SELECT LAST_INSERT_ID()")).first()[0]

        if dados.tipo == "cliente":
            # 2. Criar Cliente
            q_cliente = text("""
                INSERT INTO cliente7 (id_pessoa, tipo_cliente)
                VALUES (:id_pessoa, 'PESSOA_FISICA')
            """)
            db.exec(q_cliente, params={"id_pessoa": id_pessoa})
            
        else:
            # 2. Criar Motorista
            q_motorista = text("""
                INSERT INTO motorista7 (id_pessoa, data_inicio)
                VALUES (:id_pessoa, CURDATE())
            """)
            result_motorista = db.exec(q_motorista, params={"id_pessoa": id_pessoa})

            id_motorista = result_motorista.lastrowid
            if not id_motorista:
                id_motorista = db.exec(text("SELECT LAST_INSERT_ID()")).first()[0]

            # 3. Criar Veículo
            q_veiculo = text("""
                INSERT INTO veiculo7 (id_motorista, tipo, marca, placa, carga_max_kg, volume_max_carga)
                VALUES (:id_motorista, :tipo, :marca, :placa, 1000, 10)
            """)
            db.exec(q_veiculo, params={
                "id_motorista": id_motorista,
                "tipo": dados.veiculo,
                "marca": dados.marca,
                "placa": dados.placa
            })
        
        db.commit()
        return {"status": "sucesso", "mensagem": f"Cadastro de {dados.tipo} realizado com sucesso!"}

    except HTTPException as e:
        raise e
    except Exception as e:
        db.rollback()
        error_msg = str(e)
        if "Duplicate entry" in error_msg:
            if "email" in error_msg:
                raise HTTPException(status_code=400, detail="Este e-mail já está cadastrado")
            if "cpf" in error_msg:
                raise HTTPException(status_code=400, detail="Este CPF já está cadastrado")
            if "placa" in error_msg:
                raise HTTPException(status_code=400, detail="Esta placa já está cadastrada")
        
        raise HTTPException(status_code=500, detail=f"Erro no cadastro: {error_msg}")
