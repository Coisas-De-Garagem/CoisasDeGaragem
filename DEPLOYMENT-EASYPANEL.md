# Coisas de Garagem no projeto harz

## Organizacao

Criar quatro servicos separados no projeto `harz`: `cdg-postgres`, `cdg-minio`, `cdg-backend` e `cdg-frontend`. Nao reutilizar bancos ou volumes do Wolfex. A origem de producao confirmada em 14/11/2026 usa PostgreSQL 17.12 e possui 9 tabelas publicas: 13 usuarios, 7 produtos, 2 locais, 1 compra e 8 registros de migrations; as demais tabelas estao vazias. A contagem pode mudar antes da migracao.

## 1. PostgreSQL

No Easypanel, New Service > Postgres. Nome `cdg-postgres`, database `cdgdb`, usuario proprio e senha forte. Imagem `postgres:17-alpine`, para manter a mesma versao principal da origem. Mantenha armazenamento persistente e sem porta publica. Copie a conexao interna e as credenciais. Nao inicie o backend antes de importar o banco existente.

## 2. MinIO

Criar `cdg-minio` com usuario e senha exclusivos e volume `cdg-minio-data` em `/data`. Pode usar o Dockerfile `infra/minio/Dockerfile` deste repositorio (Build Path `/infra/minio`, File `Dockerfile`), compilado a partir do codigo-fonte como no Wolfex. A edicao Community usada nessa receita esta arquivada; isso nao garante atualizacoes de seguranca. Considere uma distribuicao mantida para operacao prolongada.

Criar dominio HTTPS para a API S3 encaminhando para HTTP interno na porta 9000. Console, se necessario, usa outro dominio na porta 9001. Bucket privado `coisasdegaragem`. O backend verifica/cria o bucket. Nao usar nomes internos contendo `_` como endpoint MinIO: usar o dominio HTTPS da API que ja foi validado no Wolfex. `/minio/health/ready` deve responder 200.

## 3. Migracao do Neon

Apenas os links antigos de imagens podem ser descartados. Usuarios, senhas criptografadas, produtos, compras, locais, eventos e historico de migrations devem ser preservados.

Nao executar seed, reset ou `db push` sobre o banco importado. Interromper as gravacoes na origem antes da copia final. Manter o Neon e o backup ate terminar a validacao do destino.

Use clientes PostgreSQL 17 ou superior. Exemplo em um terminal com pg_dump/pg_restore instalados, usando variaveis de ambiente locais para as URLs:

```sh
pg_dump --dbname="$SOURCE_DATABASE_URL" --format=custom --no-owner --no-acl --file=coisasdegaragem.dump
pg_restore --list coisasdegaragem.dump > restore.list
# Excluir SOMENTE a entrada SCHEMA - public da lista, pois public ja existe no destino vazio.
pg_restore --dbname="$TARGET_DATABASE_URL" --no-owner --no-acl --exit-on-error --single-transaction --use-list=restore.list coisasdegaragem.dump
```

SOURCE_DATABASE_URL deve ser a conexao DIRETA Neon, sem `-pooler`, com TLS. TARGET_DATABASE_URL deve ser a conexao do banco NOVO vazio. Nao adicionar `--clean`. O restore deve acontecer antes de o backend criar tabelas. Se o destino nao estiver vazio, pare e confira os dados antes de restaurar.

Se nao houver clientes instalados no computador, os mesmos comandos podem ser executados em um container `postgres:17-alpine` na VPS, com a rede privada do Easypanel e um volume/pasta para o dump. As credenciais podem ser fornecidas com PGHOST, PGPORT, PGUSER, PGPASSWORD e PGDATABASE em arquivo local protegido, passado por `--env-file`, sem inserir senhas no comando. O procedimento concreto depende do hostname e do volume que o painel criar; nao exponha a porta 5432 para toda a Internet.

Antes de usar o destino, comparar as contagens por tabela (incluindo `_prisma_migrations`) e validar login e relacionamentos. Um pg_dump consistente nao inclui gravacoes posteriores ao inicio da copia; fazer uma nova copia se a origem continuar recebendo alteracoes.

Os links existentes podem permanecer ate serem substituidos pelo usuario. Opcionalmente, somente no destino e apos confirmar a autorizacao para descartar fotos antigas:

```sql
BEGIN;
UPDATE "Product" SET "imageUrl" = NULL, "images" = ARRAY[]::text[];
UPDATE "User" SET "avatarUrl" = NULL;
COMMIT;
```

Isso tambem remove eventuais imagens base64 antigas do destino. Nao altera produtos nem usuarios alem dos campos de imagem. Essa limpeza nao foi executada automaticamente.

## 4. Backend

Fonte Git, branch de producao (os workflows atuais usam `master`), Build Path `/backend`, builder Dockerfile, arquivo `Dockerfile`, porta 3000. Usar `backend/.env.example` como referencia e preservar as demais integracoes reais do ambiente antigo. DATABASE_URL e DIRECT_URL devem apontar ambas para o PostgreSQL novo interno. Nao copiar parametros Neon de SSL para o banco interno sem TLS. PUBLIC_API_URL deve ser o endereco publico HTTPS do backend com `/api/v1`. O bucket e privado; fotos do catalogo sao servidas publicamente pela rota `/api/v1/media/:usuario/:hash.webp`.

Uploads exigem JWT. JPG, PNG e WebP sao decodificados no servidor, com limite de entrada de 10 MB e 24 megapixels. A imagem e orientada pelo EXIF, redimensionada para ate 1600 px, convertida para WebP inicialmente em qualidade 70, com reducao adaptativa para respeitar 512 KB. EXIF/GPS nao e preservado. Arquivos animados e SVG nao sao aceitos. Nao ha promessa de percentual fixo de economia. Mesma imagem otimizada do mesmo usuario usa a mesma chave, evitando duplicar o objeto.

Fotos enviadas e removidas do formulario antes de salvar podem ficar sem referencia no bucket; esta versao nao apaga objetos automaticamente para evitar excluir fotos reutilizadas em outros produtos. Planeje limpeza de objetos sem referencia conforme o uso crescer. Mantenha o dominio temporario da API quando adicionar dominio proprio: URLs antigas de fotos ficam gravadas no banco.

## 5. Frontend

Fonte Git, Build Path `/frontend`, builder Dockerfile, arquivo `Dockerfile`, porta 8080. Definir VITE_API_BASE_URL=https://API/api/v1 antes do build e VITE_ENABLE_MOCK_DATA=false. O Dockerfile declara o ARG e gera os arquivos estaticos servidos por Nginx sem root na porta 8080; alterar a URL exige rebuild. Dominio publico HTTPS, CORS_ORIGIN no backend igual ao dominio do frontend.

## 6. Validacao e virada

Subir banco/MinIO, importar os dados, configurar backend, fazer deploy e verificar `/api/v1/health`. Fazer deploy do frontend, testar login de usuario importado, listagem e edicao de produtos, compras/eventos, upload de foto e avatar. Conferir WebP no MinIO e persistencia depois de redeploy. Somente depois trocar os enderecos publicos e desligar o ambiente antigo. O workflow CDG | Checks and Deploy verifica PRs para master e, depois do merge, dispara o Easypanel somente se seguranca, testes e builds passarem. Cadastrar os repository secrets CDG_BACKEND_DEPLOY_URL e CDG_FRONTEND_DEPLOY_URL antes do primeiro merge que usara esse workflow. Manter Auto Deploy do Easypanel desligado para passar por esse gate. Os workflows de deploy antigos da Azure foram removidos; o workflow ci.yml concentra verificacoes e deploy no Easypanel. O sucesso dos gatilhos confirma a aceitacao dos pedidos, nao o termino dos builds na VPS; acompanhar Deployments no painel. Configurar a protecao da branch master para exigir os checks se quiser impedir merges com verificacoes pendentes ou falhas.

Configurar backup externo do PostgreSQL e MinIO. Snapshot da VPS sozinho nao e um backup externo. Testar restore num destino separado.

Referencias: https://www.postgresql.org/docs/17/app-pgdump.html ; https://www.postgresql.org/docs/17/app-pgrestore.html ; https://sharp.pixelplumbing.com/api-output/ ; https://easypanel.io/docs/services/app
