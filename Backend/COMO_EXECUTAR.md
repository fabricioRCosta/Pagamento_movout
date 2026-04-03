
PARA RODAR O SERVIDOR BACKEND NA SUA MÁQUINA, USE OS SEGUINTES COMANDOS:


PARTE 1 


NA PASTA BACKEND '''cd Backend''' USE OS PRÓXIMOS COMANDOS

CRIAR A VENV '''python -m venv venv'''

ATIVE A VENV USANDO O COMANDO '''.\venv\Scripts\activate'''

DEPOIS INSTALAR AS DEPENDÊNCIAS '''pip install -r requirements.txt'''

----------------------------------------------------------------------------

PARTE 2

TALVEZ VOCÊ NÃO TENHA UM ARQUIVO CHAMADO '''.env''', SE TIVER ÓTIMO, CASO CONTRÁRIO, CRIE UM E PREENCHA
COM OS DADOS DO LINK DO PAULO:

COPIE E COLE OS DADOS ABAIXO NO ARQUIVO .env QUE VOCÊ CRIOU:

_____________________________________________________
DB_HOST=shuttle.proxy.rlwy.net
DB_PORT=21256
DB_USER=root
DB_PASSWORD=RnqgCpaDxRsxYrdRmbPQuDuylhvSnkxN
DB_NAME=railway
DATABASE_URL=mysql+pymysql://root:RnqgCpaDxRsxYrdRmbPQuDuylhvSnkxN@shuttle.proxy.rlwy.net:21256/railway
_____________________________________________________

EXECUTE O COMANDO '''python main.py''' NO DIRETÓRIO 


-------------------------------------------------------------------------------

PARTE 3

SE FUNCIONAR DEPOIS DESSE ÚLTIMO COMANDO, REALIZE OS TESTES QUE ESTÃO NO DIRETÓRIO '''scripts'''

EM CADA ARQUIVO .py DENTRO DO DIRETÓRIO, LOGO ABAIXO DO CABEÇALHO, TEM A FORMA DE RODÁ-LOS, É 
COPIAR E COLAR.

SE NÃO FUNCIONAR, SE VIRA, SÓ NÃO MEXA NAS ROTAS.