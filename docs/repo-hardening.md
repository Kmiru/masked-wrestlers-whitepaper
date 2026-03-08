# Repo Hardening Checklist (GitHub UI)

## Branch protection (main)
Settings → Branches → Branch protection rules:
- Require pull request reviews (>= 1)
- Require status checks to pass (CI)
- Require conversation resolution
- Restrict who can push to matching branches
- (Optional) Require signed commits

## Security settings
Settings → Security:
- Enable Secret scanning + Push protection
- Enable Dependabot alerts + security updates
- Enable Code scanning (CodeQL) when code is added

## Operational discipline
- No secrets committed to repo, ever.
- All external links published via website must be verified and consistent.
- Treat `data/` and `.github/` changes as high risk (review required).
