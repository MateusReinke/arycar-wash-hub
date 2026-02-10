# ARYCAR Wash Hub

Este repositório contém:
- **frontend** (Lovable/React)
- **backend** (NestJS + Prisma) scaffold
- **infra** (Docker Compose: Postgres + MinIO + Backend + Frontend)

## Regras de segurança
- NÃO commitar arquivos `.env` (somente `.env.example`).
- Compose usa `env_file` para carregar variáveis.

## Subir tudo (infra)
1) Copie o env:
- `copy infra\.env.example infra\.env` (Windows)
- Edite `infra\.env` e troque `CHANGE_ME`

2) Suba:
- `cd infra`
- `docker compose up -d`

## Criar tabelas (Prisma Migrate)
O banco sobe vazio. Crie as tabelas com migrations:

Produção:
- `docker compose exec backend npx prisma migrate deploy`

Dev:
- `docker compose exec backend npx prisma migrate dev`

## Rodar seed
- `docker compose exec backend npx prisma db seed`

## URLs
- Frontend: http://localhost:3000
- API: http://localhost:4000/api
- Swagger: http://localhost:4000/api/docs
- MinIO Console: http://localhost:9001

## Storage (MinIO)
A API deve gerar URLs assinadas para preview/download (presigned URLs).

