# Security Notice

Effective date: 2026-05-01

- Telegram initData signature validation is mandatory.
- TLS is required between app and database in production.
- Session tokens are stored hashed (SHA-256).
- API has rate limiting and DTO validation.
- Security-critical events are captured in security audit logs.
- Backups, incident response and rollback procedures are required before production scale rollout.
