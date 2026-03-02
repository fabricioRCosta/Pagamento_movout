# 🚚 Movout Backend

Backend modernizado do projeto Movout, construído com **FastAPI**, **SQLModel** (MySQL/SQLite) e **Redis**.

A arquitetura é modular, limpa e pronta para produção.

---

## ⚡ Guia Rápido (Start Here)

Siga estes passos para rodar o projeto do zero.

### 1. Pré-requisitos
- Python 3.10+
- Docker (Opcional, para Redis funcional)
- Git

### 2. Instalação

1.  Acesse a pasta do backend:
    ```bash
    cd Backend
    ```
2.  Crie e ative o ambiente virtual:
    ```bash
    python -m venv venv
    # Windows:
    ..\venv\Scripts\activate
    # Linux/Mac:
    source ../venv/bin/activate
    ```
3.  Instale as dependências:
    ```bash
    pip install -r requirements.txt
    ```

### 3. Configuração (.env)
Crie um arquivo `.env` na pasta `Backend/` (copie de `.env.example`).
```bash
cp .env.example .env


### 4. Rodando o Servidor
Execute o comando:
```bash
uvicorn main:app --reload
```
O servidor iniciará em `http://127.0.0.1:8000`.

---

## 🗺️ Como Usar (Features)

### 📚 Documentação API (Swagger)
Acesse **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)** para ver todos os endpoints disponíveis e testá-los interativamente.

### 📍 Mapa em Tempo Real (Simulação)
O projeto inclui uma interface visual para testar o rastreamento GPS.

1.  Abra: **[ t.html](http://127.0.0.1:8000/static/client.html)** (Visão do Cliente)
2.  Abra: **[http://127.0.0.1:8000/static/motorista.html](http://127.0.0.1:8000/static/motorista.html)** (App do Motorista)
3.  No Motorista, clique em **"Iniciar Corrida"**.
4.  No Cliente, você verá o ícone se movendo no mapa.

*Nota: Para isso funcionar, você precisa do Redis rodando.*
-   **Docker Redis:** `docker run -d -p 6379:6379 redis`
-   **Local Redis:** Instale e rode na porta 6379.

---

## 📂 Estrutura do Projeto

```text
Backend/
├── app/
│   ├── api/v1/          # Rotas da API (Auth, Motoristas, Fretes)
│   ├── core/            # Configurações (Redis, Segurança)
│   ├── db/              # Conexão com Banco de Dados
│   ├── models/          # Modelos de Dados (Tabelas)
│   ├── static/          # Arquivos do Mapa (Frontend de Teste)
│   └── websockets/      # Gerenciador de Tempo Real
├── docs/                # Documentação Técnica Avançada
├── scripts/             # Scripts Utilitários (ex: simulador)
├── main.py              # Ponto de Entrada
└── requirements.txt     # Dependências
```

## 🛠️ Documentação Técnica (Avançado)
Para detalhes profundos sobre a migração e arquitetura:
- [Análise de Funcionalidades](docs/ANALISE_FUNCIONALIDADES.md)
- [Validação Tempo Real](docs/VALIDACAO_TEMPO_REAL.md)
- [Análise do Modelo de Dados](docs/ANALISE_MODELO.md)
