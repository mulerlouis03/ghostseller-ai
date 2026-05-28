# GhostSeller AI V72 CREDITS QUOTAS LIMITS ENFORCEMENT

V72 applique réellement les crédits et quotas par plan.

## Ajouts
- table usage_counters,
- endpoint `/api/usage/me`,
- blocage si crédits insuffisants,
- limites posts/leads/projects,
- dashboard usage,
- reset usage owner/admin,
- coûts IA par action.

## Coûts actuels
- Content generation : 3 crédits
- Creative campaign : 2 crédits
- Video pipeline : 4 crédits
- Opportunity campaign : 3 crédits

## Push

```bash
npm install
git add .
git commit -m "GhostSeller V72 Credits Quotas Limits Enforcement"
git push
```

## Supabase

Exécute :
```txt
supabase/V72_USAGE_LIMITS.sql
```

## Test

```txt
/api/health
/api/usage/me
```

Tu dois voir :
```txt
GhostSeller AI V72 CREDITS QUOTAS LIMITS ENFORCEMENT
```
