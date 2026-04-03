# Banco de Dados - MOVOUT

Este diretório contém os scripts SQL para criação e inicialização do banco de dados MySQL.

## 📋 Arquivos

- **`schema.sql`**: Script principal de criação do banco de dados e todas as tabelas
- **`seed.sql`**: Script com dados de exemplo para testes
- **`README.md`**: Este arquivo

## 🚀 Como usar

### 1. Instalar MySQL

Certifique-se de ter o MySQL instalado e rodando na sua máquina.

### 2. Criar o banco de dados

Execute o script `schema.sql` no MySQL:

```bash
# Via linha de comando
mysql -u root -p < database/schema.sql

# Ou via MySQL Workbench / phpMyAdmin
# Abra o arquivo schema.sql e execute
```

### 3. (Opcional) Popular com dados de exemplo

Se quiser testar com dados de exemplo:

```bash
mysql -u root -p movout_db < database/seed.sql
```

### 4. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do MySQL:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha  ## admin123
DB_NAME=movout_db
```

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

1. **pessoa7**: Informações básicas de pessoas (clientes e motoristas)
2. **cliente7**: Informações específicas de clientes
3. **motorista7**: Informações específicas de motoristas
4. **veiculo7**: Veículos dos motoristas
5. **frete7**: Fretes solicitados
6. **item_modelo7**: Catálogo de itens transportáveis
7. **frete_item7**: Relação entre fretes e itens (Many-to-Many)
8. **negociacao7**: Propostas de negociação
9. **imagem_fret**: Imagens relacionadas a fretes
10. **token_notificaca**: Tokens de notificação push

### Views

- **vw_fretes_completos**: View com informações completas dos fretes
- **vw_motoristas_estatisticas**: View com estatísticas dos motoristas

### Triggers

- **trg_frete_aceito**: Atualiza `data_aceitacao` quando frete é aceito
- **trg_frete_concluido**: Atualiza `data_conclusao` quando frete é concluído

## 🔍 Observações sobre o Modelo

### Relacionamentos 1:1

O modelo atual permite que uma pessoa seja **OU** cliente **OU** motorista (relacionamento 1:1). Se no futuro precisar permitir que uma pessoa seja ambos, será necessário:

1. Remover a constraint UNIQUE de `id_pessoa` nas tabelas `cliente7` e `motorista7`
2. Alterar para relacionamento Many-to-One

### Campos NULL em frete7

Os campos `id_motorista` e `id_veiculo` em `frete7` podem ser NULL porque:
- Um frete pode estar pendente (sem motorista atribuído)
- Um frete pode estar em negociação (vários motoristas podem fazer propostas)

### Coordenadas Geográficas

O modelo inclui campos de latitude/longitude para origem e destino. Se no futuro precisar de funcionalidades geográficas avançadas, considere usar:
- **PostGIS** (extensão do PostgreSQL) para queries espaciais
- Ou manter MySQL com índices nas coordenadas (como está agora)

## 🛠️ Manutenção

### Backup

```bash
mysqldump -u root -p movout_db > backup_$(date +%Y%m%d).sql
```

### Restaurar Backup

```bash
mysql -u root -p movout_db < backup_20240101.sql
```

## 📝 Próximos Passos

1. Criar modelos SQLAlchemy baseados nas tabelas
2. Implementar migrations (Alembic)
3. Adicionar índices adicionais conforme necessário
4. Implementar soft delete se necessário
