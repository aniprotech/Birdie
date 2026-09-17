# Gate C security, privacy and operations

Status date: 17 September 2026

## Implemented source controls

- Optional TOTP multi-factor authentication for administrator accounts. MFA secrets are encrypted with AES-256-GCM and are never returned after setup.
- Five-minute MFA login challenges and six-digit authenticator verification with clock-drift tolerance.
- Named device sessions with IP, user agent, creation, last-active, expiry and MFA-verification timestamps.
- Individual session revocation, sign-out-other-devices and ten-minute recent-authentication checks for sensitive operations.
- Tenant-scoped retention policies for care records, audit records, finance records and inactive accounts.
- Recorded export, correction and erasure requests with controlled status and decision reasons.
- Legal holds block approval and execution of erasure requests until formally released.
- Approved exports produce a scoped machine-readable package. Approved erasure pseudonymises direct identifiers, revokes sessions and MFA, and retains required care, audit and finance records.
- PostgreSQL plus upload backup tooling produces a checksum manifest. Restore tooling refuses the source database and verifies the checksum before a staging restore.
- Readiness output identifies the configured storage mode.

## Production configuration

```text
STORAGE_MODE=filesystem
MFA_ENCRYPTION_KEY=REPLACE_WITH_A_SEPARATE_32_OR_MORE_CHARACTER_RANDOM_SECRET
BACKUP_DIR=/durable-backups
PG_DUMP_BIN=pg_dump
PG_RESTORE_BIN=pg_restore
```

Filesystem uploads remain suitable only for a single instance with an attached persistent Railway volume. Before horizontal scaling, migrate uploads to private object storage and change the storage adapter. Enable versioning, encryption at rest, lifecycle retention and access logging on that bucket.

Keep `MFA_ENCRYPTION_KEY` stable and separate from `JWT_SECRET`. Rotating it requires a controlled MFA re-enrolment plan. When omitted, the application temporarily falls back to `JWT_SECRET` for compatibility.

## Backup schedule

Run `npm run backup` at least daily from a protected job with encrypted durable storage. Retain daily, weekly and monthly copies according to the approved policy. Run `npm run restore:drill` only against an isolated staging database, record duration and sample record checks, then destroy the restored environment.

## Threat model summary

| Threat | Implemented control | Required external evidence |
| --- | --- | --- |
| Stolen login link | Single use, 15-minute expiry, optional MFA | MFA adoption report |
| Stolen session token | 24-hour expiry, server-side revocation, device list | Browser/mobile secure-storage review |
| Cross-tenant data access | Agency-scoped queries and automated tests | Independent penetration test |
| Privileged misuse | Recent-auth checks and auditable privacy decisions | Quarterly access review |
| Data loss | Automated backup/restore tooling and checksums | Timed staging restore record |
| File disclosure | Authenticated five-minute download tickets | Private durable storage migration |
| Improper erasure | Approval workflow and legal holds | Privacy-owner acceptance |

## Release blockers outside source control

- Configure persistent private storage or an approved object-storage provider.
- Schedule encrypted off-platform backups and complete a timed staging restoration drill.
- Commission dependency review and independent penetration testing; remediate findings.
- Confirm retention periods, erasure/pseudonymisation rules and legal-hold ownership with the privacy lead.
- Exercise the incident response plan with named technical, privacy, clinical and communications owners.
