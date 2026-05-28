# GhostSeller AI V51 ONBOARDING ACCESS LIMITS

V51 ajoute :
- onboarding utilisateur,
- accès limité propre,
- limites Free / Starter / Pro,
- lancement contrôlé,
- Meta toujours en pause.

## Push

```bash
npm install
git add .
git commit -m "GhostSeller V51 Onboarding Access Limits"
git push
```

## Après déploiement

Exécute dans Supabase SQL Editor :

```txt
supabase/V51_OWNER_AND_LIMITS.sql
```

## Test

```txt
/api/health
```

Tu dois voir :

```txt
GhostSeller AI V51 ONBOARDING ACCESS LIMITS
```
