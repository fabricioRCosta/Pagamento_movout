# Antes de Codar:
No terminal da pasta raiz (movout):

git pull origin main

# Após terminar uma tarefa (O Push)
Quando você terminar uma funcionalidade ou correção, siga o "ciclo sagrado":

Verifique o que mudou:

git status

Prepare os arquivos:

git add .

Grave a alteração com uma mensagem clara:

git commit -m "Explique aqui o que você fez (ex: Criado a tela de login)"

Envie para o GitHub:

git push origin main

# Regras de Ouro para o Time
Nunca suba código que não roda: Antes de dar o push, teste o app na sua máquina. Se estiver quebrado, você vai quebrar a máquina de todo mundo do time.

Mensagens de commit úteis: Evite mensagens como "ajuste" ou "abc". Use mensagens que ajudem o time a entender o histórico (ex: "Consertado erro no cálculo do frete").

Cuidado com o .gitignore: Se alguém do time for instalar uma biblioteca nova, garanta que ela não está sendo enviada para o GitHub (o node_modules deve continuar ignorado).

# O que fazer se der erro no Push?
Se você tentar dar push e o Git recusar (geralmente dizendo "rejected - non-fast-forward"), é porque alguém do time enviou algo antes de você.

A solução é simples:

Dê um git pull origin main.

O Git vai tentar unir os códigos automaticamente. Se ele pedir uma mensagem de commit para o merge, basta salvar e fechar.

Depois tente o git push origin main novamente.


# # # # # # # # 
1. O Ambiente Virtual (venv)
Criamos um ambiente isolado para o projeto.

O que é: O venv funciona como uma "bolha". Todas as bibliotecas (FastAPI, Uvicorn, etc.) ficam instaladas dentro dessa pasta no projeto, e não no Windows global.

Por que usamos: Isso garante que todos no grupo usem as mesmas versões das ferramentas, evitando o erro "na minha máquina funciona, na sua não".

Atenção: A pasta venv/ não vai para o GitHub (está no .gitignore), pois cada um deve criar a sua própria ao baixar o projeto.

2. O Servidor e a API (FastAPI + Uvicorn)
FastAPI: É o framework que estamos usando para criar as rotas (como a de /login). Ele é extremamente rápido e moderno.

Uvicorn: É o "motor" que faz o servidor rodar. Sem ele, o código Python é apenas um arquivo parado.

Swagger UI: É a mágica do FastAPI. Ao rodar o servidor e acessar http://127.0.0.1:8000/docs, temos uma página interativa para testar o login e outras rotas sem precisar de uma tela de Front-end pronta.

3. Estrutura de Arquivos e Organização
Organizei as pastas seguindo padrões de mercado:

main.py: O ponto de entrada. É aqui que o servidor "nasce".

app/api/v1/endpoints/: Aqui ficarão as lógicas de cada funcionalidade. O login já está iniciado em shared.py.

requirements.txt: Este é o arquivo mais importante para vocês. Ele contém a "lista de compras" de tudo o que o projeto precisa para rodar.

.gitignore: Configurado para ignorar arquivos de cache (__pycache__) e o próprio venv, mantendo o nosso GitHub limpo.

🛠️ Como rodar o projeto na sua máquina (Passo a Passo)
Sempre que vocês baixarem uma versão nova do código, sigam estes comandos no terminal dentro da pasta Backend:

Criar seu ambiente (Só na primeira vez): python -m venv venv

Permitir execução de scripts (Se der erro de segurança no Windows): Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process

Ativar o ambiente: .\venv\Scripts\activate (Você verá um (venv) verde no terminal).

Instalar as dependências: pip install -r requirements.txt

Ligar o servidor: python -m uvicorn main:app --reload

🧪 O que já temos pronto para testar?
Criei uma lógica inicial de Login. Se vocês acessarem o Swagger, clicarem em Try it out e enviarem o e-mail fabricio@ufmt.br com a senha 123456, o sistema retornará um Sucesso (200 OK). Qualquer outra combinação retornará um erro de Não Autorizado (401).
