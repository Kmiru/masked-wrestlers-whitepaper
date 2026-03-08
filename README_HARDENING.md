# Masked Wrestlers — Hardening Pack (Static Website, no build)

This pack adds:
- GitHub Actions CI checks (catalog invariants, markdown XSS scan, broken link scan)
- Secret scanning (gitleaks)
- Dependency review for GitHub Actions
- CODEOWNERS + SECURITY.md
- Security model + versioning policy docs

## How to install
Copy these folders/files into your repo root:
- `.github/`
- `scripts/`
- `docs/` (optional, but recommended)
- `SECURITY.md`
- `CODEOWNERS`

Then commit and push.

## One required step: catalog hash file
CI expects a `.sha256` file next to your catalog JSON, e.g.:

- `data/catalog.v1.json`
- `data/catalog.v1.sha256`

Generate it locally:
```bash
node scripts/hash-catalog.mjs data/catalog.v1.json
```

## GitHub UI settings (recommended)
See `docs/repo-hardening.md` for branch protection and security toggle guidance.






