# Guia de Deployment — Coisas de Garagem

## 1. Finalidade deste documento

Este documento descreve como o projeto **Coisas de Garagem** pode ser executado em dois contextos diferentes. O primeiro é o ambiente de desenvolvimento, utilizado pela equipe para implementação, testes e validação local do sistema. O segundo é o ambiente de produção, pensado para disponibilização da aplicação com frontend, backend e banco de dados desacoplados.

A versão atual da arquitetura considera **React + Vite** no frontend, **NestJS** no backend, **Prisma** como camada de acesso a dados e **PostgreSQL** como banco relacional. Em produção, o banco previsto é o **Neon**. Em desenvolvimento local, a equipe pode utilizar PostgreSQL por meio de **Docker Compose**.

Este guia foi atualizado para refletir a arquitetura vigente do projeto, substituindo referências antigas a uma configuração baseada em Supabase e FastAPI.

## 2. Visão geral da implantação

No cenário final de produção, a aplicação foi pensada para ser distribuída da seguinte forma: o frontend é publicado em uma plataforma adequada a aplicações web modernas, como a **Vercel**; o backend é executado em um serviço Node.js em nuvem, como o **Render**; e o banco de dados é mantido em uma instância PostgreSQL gerenciada pelo **Neon**.

Em paralelo, o projeto mantém um cenário de desenvolvimento local. Nesse caso, frontend e backend podem ser executados nas máquinas da equipe, enquanto o banco de dados roda em contêiner Docker com PostgreSQL. Essa separação é importante porque o ambiente local atende ao ciclo diário de codificação e testes, enquanto o ambiente de produção atende à disponibilização do sistema.

## 3. Pré-requisitos

Para reproduzir a implantação ou o ambiente local, é recomendável ter acesso ao repositório do projeto, Node.js instalado, npm configurado, Docker Desktop disponível para o cenário local e contas ativas nas plataformas escolhidas para produção, especialmente Vercel, Render e Neon. Também é necessário definir corretamente as variáveis de ambiente de frontend e backend antes da publicação.

## 4. Desenvolvimento local

No ambiente local, o banco de dados pode ser iniciado por meio do `docker-compose.yml` existente na raiz do projeto. Essa configuração já prevê um contêiner PostgreSQL e, se desejado, também contêineres para backend e frontend. O banco local utiliza, por padrão, as credenciais abaixo:

```env
POSTGRES_DB=garagedb
POSTGRES_USER=user
POSTGRES_PASSWORD=password
```

Para iniciar os serviços definidos no arquivo Compose, use:

```bash
docker compose up -d
```

Caso o ambiente utilize a sintaxe antiga do Docker Compose, o comando equivalente é:

```bash
docker-compose up -d
```

Após a inicialização do banco, o backend pode ser executado localmente com as dependências instaladas e as migrations do Prisma aplicadas. O fluxo recomendado é o seguinte:

```bash
cd backend
npm install
npx prisma migrate dev
npm run start:dev
```

Com isso, a API deverá ficar disponível, por padrão, em `http://localhost:3000`. A aplicação NestJS utiliza o prefixo global `/api/v1`, de modo que os endpoints principais ficam sob esse caminho. A documentação interativa da API é publicada em `/api`.

No frontend, o fluxo local é semelhante:

```bash
cd frontend
npm install
npm run dev
```

Por padrão, a interface fica disponível em `http://localhost:5173`.

### 4.1 Variáveis de ambiente no desenvolvimento local

No backend, a configuração mínima esperada é semelhante ao exemplo abaixo:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/garagedb?schema=public
JWT_SECRET=troque_por_um_valor_seguro
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
```

No frontend, a variável principal observada no código atual é:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

Esse ponto merece atenção, porque a aplicação frontend atual utiliza **`VITE_API_BASE_URL`** e não `VITE_API_URL`. Manter esse nome correto evita falhas de integração entre interface e API.

## 5. Produção

No cenário de produção, a arquitetura prevista separa claramente as três camadas da solução. O frontend é implantado na Vercel, o backend no Render e o banco de dados no Neon. Essa organização favorece desacoplamento, facilita manutenção e aproxima o projeto de uma configuração real de disponibilização em nuvem.

### 5.1 Banco de dados no Neon

O primeiro passo para a implantação em produção é provisionar a base PostgreSQL no Neon. Após a criação do projeto no painel do serviço, é necessário copiar a connection string principal e utilizá-la na variável `DATABASE_URL` do backend.

Um exemplo genérico de connection string é o seguinte:

```env
DATABASE_URL=postgresql://usuario:senha@ep-exemplo.us-east-2.aws.neon.tech/neondb?sslmode=require
```

Com a conexão definida, as migrations do Prisma devem ser aplicadas no banco de produção. O comando recomendado para esse contexto é:

```bash
cd backend
npx prisma migrate deploy
```

Esse comando é o mais apropriado para produção porque aplica as migrations existentes sem tentar criar novas versões do schema.

### 5.2 Backend no Render

Para o backend, o serviço recomendado é um Web Service Node.js no Render, apontando para a pasta `backend` do repositório. A configuração geral esperada é esta:

```text
Name: coisas-de-garagem-api
Root Directory: backend
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm run start:prod
```

As variáveis de ambiente mínimas para o backend em produção podem seguir este modelo:

```env
DATABASE_URL=postgresql://usuario:senha@ep-exemplo.us-east-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=troque_por_um_valor_seguro
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=production
```

É importante registrar que o código atual habilita CORS de forma ampla com `app.enableCors()`. Portanto, embora uma variável como `CORS_ORIGINS` possa ser adotada futuramente como melhoria, ela **não é consumida diretamente na versão atual do backend**. Por isso, não faz sentido tratá-la neste documento como requisito obrigatório de implantação.

Após a publicação, o backend deve responder na raiz da aplicação e expor a documentação Swagger em `/api`. Como a API usa o prefixo global `/api/v1`, as rotas de negócio também ficam abaixo desse caminho.

### 5.3 Frontend na Vercel

Para o frontend, a implantação pode ser feita como projeto Vite na Vercel, apontando para a pasta `frontend`. A configuração esperada é a seguinte:

```text
Framework Preset: Vite
Root Directory: frontend
Build Command: npm install && npm run build
Output Directory: dist
```

No frontend em produção, a variável de ambiente mais importante é a que informa a URL base da API. Considerando o comportamento atual do código, ela deve ser configurada assim:

```env
VITE_API_BASE_URL=https://sua-api-no-render.onrender.com/api/v1
```

Esse valor deve apontar diretamente para a base da API já com o prefixo `/api/v1`, pois esse é o formato esperado pelo serviço de integração do frontend.

## 6. Integrações em desenvolvimento

A documentação do projeto já prevê integração com **AbacatePay/PIX**, mas essa funcionalidade deve ser tratada, neste momento, como **em desenvolvimento**. Em outras palavras, ela pode aparecer como parte da evolução planejada do sistema, mas não deve ser descrita como etapa obrigatória do deployment atual se o fluxo completo ainda não estiver consolidado no código que será apresentado.

Se a equipe optar por manter variáveis relacionadas a PIX e webhook em ambientes futuros, isso pode ser documentado em uma seção específica de integração financeira. Neste estágio, o mais prudente é manter o guia principal focado no núcleo já estabilizado da implantação.

## 7. Verificação após o deploy

Depois da publicação, a validação básica deve considerar três frentes. A primeira é verificar se o frontend carrega corretamente em produção. A segunda é confirmar se o backend está respondendo e se a documentação Swagger está acessível em `/api`. A terceira é garantir que a aplicação frontend consegue autenticar, listar produtos e consumir a API sem erros de integração.

Como o código atual não implementa um endpoint dedicado em `/health`, não é adequado orientar a equipe a testá-lo como verificação oficial. Em vez disso, é mais coerente validar a raiz da API, a rota do Swagger e alguns endpoints reais da aplicação.

Exemplos de teste:

```bash
curl https://sua-api-no-render.onrender.com/
curl https://sua-api-no-render.onrender.com/api
```

Além disso, é recomendável validar visualmente o fluxo completo pelo frontend já publicado.

## 8. Problemas comuns

Um dos erros mais recorrentes nesse tipo de implantação é a inconsistência entre a URL esperada pelo frontend e a URL realmente exposta pelo backend. No projeto atual, isso costuma ocorrer quando a variável `VITE_API_BASE_URL` é configurada sem o prefixo `/api/v1`.

Outro problema comum é a conexão incorreta com o Neon, especialmente quando a `DATABASE_URL` é copiada sem o parâmetro `sslmode=require` ou quando o backend é publicado sem que as migrations tenham sido aplicadas.

Também pode haver lentidão inicial do backend em ambientes gratuitos do Render, já que esse tipo de serviço pode entrar em estado de inatividade após certo período sem requisições. Nesses casos, a primeira resposta pode demorar mais do que o esperado.

## 9. Segurança e boas práticas

As credenciais reais do projeto não devem ser versionadas no repositório. Arquivos `.env` com chaves válidas, tokens ou URLs sensíveis devem permanecer fora do controle de versão. Em documentos acadêmicos e exemplos públicos, o ideal é utilizar placeholders.

Também é recomendável utilizar um valor forte para `JWT_SECRET`, controlar o acesso ao painel das plataformas de deploy e manter as variáveis de ambiente separadas por contexto. O Neon já opera com conexão segura por SSL, e tanto Vercel quanto Render oferecem HTTPS automaticamente para os serviços publicados.

## 10. Considerações finais

O deployment do Coisas de Garagem deve ser compreendido a partir de dois cenários complementares. No desenvolvimento, a equipe trabalha localmente com Docker, PostgreSQL, NestJS e React/Vite, o que favorece testes e evolução incremental do projeto. Na produção, a arquitetura final prevista se apoia em Vercel, Render e Neon, refletindo uma separação mais madura entre interface, servidor e persistência.

Essa distinção é importante para a apresentação do projeto, pois mostra não apenas como o sistema é executado pela equipe durante a construção, mas também como ele foi pensado para ser implantado e demonstrado em um contexto mais próximo de uso real.
