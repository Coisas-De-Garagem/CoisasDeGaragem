# Implantacao do Coisas de Garagem

A implantacao atual usa Easypanel, PostgreSQL e MinIO na VPS.

O procedimento atualizado esta em [DEPLOYMENT-EASYPANEL.md](DEPLOYMENT-EASYPANEL.md).

- Projeto: `harz`.
- Servicos: `cdg-postgres`, `cdg-minio`, `cdg-backend` e `cdg-frontend`.
- Porta interna do backend: 3000.
- Porta interna do frontend: 8080.
- CI/CD: `.github/workflows/ci.yml`, com verificacoes de PR e deploy apos merge na `master`.

Antes do deploy automatico, configurar os secrets `CDG_BACKEND_DEPLOY_URL` e
`CDG_FRONTEND_DEPLOY_URL`. Desconectar as integracoes externas de hospedagem
anteriores no respectivo provedor, para que nao continuem fazendo deploys.
