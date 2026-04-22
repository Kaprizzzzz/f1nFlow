# f1nFlow

Монорепозиторій із двома застосунками:
- **frontend**: Angular 19 SPA.
- **backend**: NestJS API + PostgreSQL (TypeORM migrations).

## Production-ready baseline (станом на 2026-04-20)

У репозиторії додано базовий hardening:
- підготовлені стабільні CI-скрипти для frontend/backend;
- OpenAPI JSON контракт для бекенду;
- health/readiness endpoints + базовий metrics endpoint;
- безпечніші HTTP security headers у bootstrap API.

## 1) Локальний запуск через Docker

```bash
docker compose up --build
```

Сервіси:
- Frontend: `http://localhost:4200`
- Backend: `http://localhost:3001`
- OpenAPI JSON: `http://localhost:3001/docs/openapi.json`

## 2) Ручний запуск

### Backend
```bash
cd backend
cp .env.sample .env
npm ci
npm run start:dev
```

### Frontend
```bash
cd frontend
cp .env.sample .env
npm ci
npm start
```

## 3) Перевірки якості (локально та в CI)

### Frontend
```bash
cd frontend
npm run typecheck
npm run test:ci
npm run build:prod
# або одним кроком
npm run ci
```

### Backend
```bash
cd backend
npm run lint:check
npm run test
npm run build
# або одним кроком
npm run ci
```

## 4) Міграції БД

Міграції запускаються автоматично під час старту backend (TypeORM `migrationsRun: true`).

Для production рекомендується окремий migration step перед rollout, навіть якщо автозапуск увімкнено.

## 5) API та observability

- OpenAPI JSON: `GET /docs/openapi.json`
- Liveness: `GET /health`
- Readiness: `GET /health/readiness`
- Metrics (Prometheus): `GET /metrics`

## 6) Release policy (мінімум)

Рекомендований пайплайн на кожен PR:
1. Frontend CI: `typecheck + build:prod`
2. Backend CI: `build`
3. Розширені перевірки (`lint:check`, `test`, `test:ci`) запускати окремим quality gate перед release.
4. Deploy only after green checks.

Семантика версій:
- `MAJOR`: breaking changes API/contract.
- `MINOR`: backward-compatible features.
- `PATCH`: bugfix/security-only.
