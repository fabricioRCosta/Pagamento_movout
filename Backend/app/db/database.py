"""
Configuração de conexão com o banco de dados MySQL usando SQLModel.
Mantém compatibilidade com código legado que usa SQLAlchemy diretamente.
"""
from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy import text # Mantendo para compatibilidade se necessário
from sqlalchemy.orm import sessionmaker
from app.core.config import (
    DB_HOST,
    DB_NAME,
    DB_PASSWORD,
    DB_PORT,
    DB_USER,
    DATABASE_URL_ENV,
)

# String de conexão MySQL
if DATABASE_URL_ENV:
    # Garante que use o driver pymysql se não estiver especificado
    if DATABASE_URL_ENV.startswith("mysql://"):
        DATABASE_URL = DATABASE_URL_ENV.replace("mysql://", "mysql+pymysql://", 1)
    else:
        DATABASE_URL = DATABASE_URL_ENV
else:
    DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"

# Cria o engine do SQLAlchemy (SQLModel é wrapper do SQLAlchemy)
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False
)

# Alias para SessionLocal se for necessário em código legacy
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_session():
    """
    Dependency para obter sessão do banco de dados (SQLModel).
    """
    with Session(engine) as session:
        yield session

# Alias para compatibilidade com código que importa get_db
get_db = get_session

def create_db_and_tables():
    """
    Cria as tabelas definidas nos modelos SQLModel.
    """
    # Importar modelos para registrar no SQLModel.metadata
    from app.models.models import Motorista, PedidoFrete, PropostaFrete
    SQLModel.metadata.create_all(engine)
    _ensure_pedidofrete_columns()


def _ensure_pedidofrete_columns():
    """
    Ajusta schema legado sem migracao formal.
    """
    base_statements = [
        "ALTER TABLE pedidofrete MODIFY COLUMN origem VARCHAR(255) NULL",
        "ALTER TABLE pedidofrete MODIFY COLUMN destino VARCHAR(255) NULL",
    ]
    maybe_columns = {
        "origem_lat": "ALTER TABLE pedidofrete ADD COLUMN origem_lat DOUBLE NULL",
        "origem_lng": "ALTER TABLE pedidofrete ADD COLUMN origem_lng DOUBLE NULL",
        "destino_lat": "ALTER TABLE pedidofrete ADD COLUMN destino_lat DOUBLE NULL",
        "destino_lng": "ALTER TABLE pedidofrete ADD COLUMN destino_lng DOUBLE NULL",
        "distancia_km": "ALTER TABLE pedidofrete ADD COLUMN distancia_km DOUBLE NULL",
    }
    try:
        with engine.begin() as conn:
            for stmt in base_statements:
                conn.execute(text(stmt))
            existing = conn.execute(
                text(
                    "SELECT COLUMN_NAME FROM information_schema.COLUMNS "
                    "WHERE TABLE_SCHEMA = :db_name AND TABLE_NAME = 'pedidofrete'"
                ),
                {"db_name": DB_NAME},
            ).fetchall()
            existing_names = {row[0] for row in existing}
            for col_name, stmt in maybe_columns.items():
                if col_name not in existing_names:
                    conn.execute(text(stmt))
    except Exception as e:
        print(f"Aviso ao ajustar schema pedidofrete: {e}")

def test_connection():
    """
    Testa a conexão com o banco de dados.
    """
    try:
        with Session(engine) as session:
            session.exec(text("SELECT 1"))
            return True
    except Exception as e:
        print(f"Erro ao conectar ao banco de dados: {e}")
        return False
