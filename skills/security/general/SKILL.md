---
name: general
description: Security review checklist covering OWASP top 10, input validation, secrets management, and auth patterns.
metadata:
  domain: security
  id: security/general
  concept: security
  language: general
  category: security
  version: 1.0.0
  tags: [owasp, security, injection, xss, auth, secrets]
---

# Security Checklist

## Input Validation
- Validate all inputs at system boundaries: API endpoints, CLI args, file uploads, env vars.
- Use allowlists, not denylists, for permitted values.
- Reject oversized inputs (prevent DoS via resource exhaustion).
- Validate content type, not just file extension.

## Injection Prevention
- **SQL**: parameterized queries only. Never concatenate user input into SQL strings.
- **Command injection**: never pass user input to `exec`, `spawn`, or shell commands unsanitized.
- **Path traversal**: normalize and validate file paths. Reject `../` sequences.
- **LDAP/XPath/NoSQL**: use parameterized queries where available.

## Authentication & Authorization
- Deny by default: if no explicit permission grant, deny the request.
- Validate JWTs: signature, `exp`, `iss`, `aud` claims.
- Use short-lived access tokens (15 min) + refresh tokens.
- Never roll your own crypto — use established, audited libraries.
- Rate-limit login and sensitive endpoints.

## Secrets Management
- Never hardcode secrets in source code or config files.
- Use environment variables or a secrets manager (Vault, AWS Secrets Manager, GCP Secret Manager).
- Scan commits for secrets with `git-secrets`, `truffleHog`, or `gitleaks` in CI.
- Rotate leaked secrets immediately — assume they are compromised.

## Output Encoding
- Encode for the context: HTML entities for HTML, URL encoding for URLs.
- Use framework-provided escaping — never write your own.
- Set `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options` headers.

## Error Handling
- Never expose stack traces or internal details to end users.
- Log full errors server-side with correlation IDs; return generic messages to clients.

## Dependencies
- Audit regularly: `npm audit`, `pip-audit`, `trivy`, `OWASP Dependency-Check`.
- Pin versions in production. Review changelogs before upgrading.
- Remove unused dependencies.
