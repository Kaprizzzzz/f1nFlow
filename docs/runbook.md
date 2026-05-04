# Production Runbook Baseline

## Before deploy
1. Run migrations.
2. Run backend tests and frontend build.
3. Validate env vars and secrets are present.

## During deploy
1. Use rolling deployment.
2. Healthcheck new pods/containers.
3. Monitor error rate and latency for 30 min.

## Rollback
1. Revert container tag.
2. Restore DB snapshot if migration introduced data corruption.

## Backups
- Nightly full backup.
- WAL/point-in-time recovery enabled.
