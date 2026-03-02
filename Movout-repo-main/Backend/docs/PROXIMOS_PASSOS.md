# Próximos passos – Movout Backend

Roteiro sugerido para dar continuidade ao projeto após MySQL e API estarem rodando.

---

## Já feito

- [x] Estrutura do Backend (app, core, db, tests, docs)
- [x] Conexão MySQL e teste de conexão
- [x] Banco `movout_db` e tabelas (schema.sql)
- [x] Seed com dados de exemplo (pessoas, clientes, motoristas, fretes)
- [x] Endpoint de login (inicialmente mock; em seguida: **login real com banco**)
- [x] API no ar com `uvicorn main:app --reload`

---

## 1. Login real com o banco (prioridade)

**Objetivo:** Autenticar usando a tabela `pessoa7` e definir se o usuário é cliente ou motorista.

- Consultar `pessoa7` por `email`.
- Validar senha com **bcrypt** (`senha_hash`).
- Verificar se `id_pessoa` existe em `cliente7` ou `motorista7` e retornar `tipo`: `"cliente"` ou `"motorista"`.
- Resposta: `nome`, `tipo`, e em seguida um token (primeiro fixo, depois JWT).

**Dependência:** `pip install bcrypt` (ou `pip install -r requirements-auth.txt`).  
**Arquivo:** `app/api/v1/endpoints/shared.py`.

**Se o login com usuários do seed falhar** (senha incorreta para fabricio@ufmt.br / 123456), o hash no seed pode estar inválido. Gere um hash real e atualize o banco:
```powershell
pip install bcrypt
python database/gerar_hash_senha.py
```
Use o hash impresso no script para atualizar a coluna `senha_hash` em `pessoa7` (via MySQL Shell ou script).

---

## 2. Registro de usuário

**Objetivo:** Cadastrar nova pessoa como cliente ou motorista.

- **POST** `/api/v1/auth/register` com: nome, cpf, email, telefone, senha, tipo (`cliente` ou `motorista`).
- Gerar `senha_hash` com bcrypt e inserir em `pessoa7`.
- Inserir em `cliente7` ou `motorista7` conforme o tipo.
- Validações: email e CPF únicos, formato de CPF/senha (e opcionalmente e-mail).

---

## 3. Autenticação com JWT

**Objetivo:** Trocar o token fixo por um token JWT.

- Usar **PyJWT** (já no `requirements.txt`).
- No login, gerar JWT com `id_pessoa`, `email`, `tipo` e tempo de expiração.
- Criar dependency no FastAPI que lê o header `Authorization`, valida o JWT e retorna o usuário.
- Proteger rotas que precisam de usuário logado (ex.: criar frete, ver meus fretes).

---

## 4. Endpoints de fretes

**Objetivo:** Cliente cria e lista fretes; motorista lista e aceita fretes.

- **POST** `/api/v1/fretes` – cliente cria frete (origem, destino, itens, etc.).
- **GET** `/api/v1/fretes` – listar fretes (filtros: por cliente, por motorista, por status).
- **GET** `/api/v1/fretes/{id}` – detalhe de um frete.
- **PATCH** `/api/v1/fretes/{id}/aceitar` – motorista aceita frete (e opcionalmente vincula veículo).

Usar `get_db` e, quando JWT estiver pronto, dependency de “usuário logado”.

---

## 5. Modelos SQLAlchemy (opcional, mas recomendado)

**Objetivo:** Deixar de usar SQL bruto e usar ORM.

- Criar modelos em `app/models/` (ou `app/db/models/`) espelhando as tabelas: `Pessoa`, `Cliente`, `Motorista`, `Frete`, etc.
- Usar `Session` e `db.query(Model)` (ou estilo 2.0 com `select`) nos endpoints.
- Facilita validação, relacionamentos e futuras migrações (ex.: Alembic).

---

## 6. Integração com o frontend

**Objetivo:** App (React Native / Expo) consumir a API de verdade.

- Definir URL base da API (ex.: `http://IP:8000` em desenvolvimento).
- Tela de login chamar **POST** `/api/v1/auth/login` e guardar o token (AsyncStorage ou equivalente).
- Incluir o token no header `Authorization` em todas as requisições autenticadas.
- Telas de registro, listagem de fretes e criação de frete chamando os endpoints correspondentes.

---

## 7. Outros itens depois

- **Negociação:** endpoints para propostas em `negociacao7`.
- **Perfil:** GET/PATCH do usuário logado (dados em `pessoa7` + `cliente7` ou `motorista7`).
- **Veículos:** motorista cadastrar/listar veículos (`veiculo7`).
- **Migrations:** Alembic para evoluir o schema sem recriar o banco.
- **Testes:** pytest para login, registro e endpoints principais.

---

## Ordem sugerida

1. **Login real com banco** (bcrypt + pessoa7 + cliente7/motorista7).  
2. **JWT** no login e dependency de autenticação.  
3. **Registro** de usuário.  
4. **Um ou dois endpoints de fretes** (criar e listar).  
5. **Frontend** apontando para a API e usando token.  
6. Modelos SQLAlchemy e demais endpoints conforme a necessidade.

Se quiser, o próximo passo concreto é implementar o **login real** no `shared.py` (consulta ao banco + bcrypt + tipo cliente/motorista).
