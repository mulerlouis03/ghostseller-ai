# GhostSeller AI V42 SECURITY OWNER

V42 sécurise GhostSeller avant publication.

Ajouts :
- rôle propriétaire `owner`,
- route `/api/security/status`,
- route `/api/security/owner`,
- headers de sécurité,
- rate limit API,
- réduction limite JSON,
- désactivation du mode test abonnement en production,
- préparation Stripe webhook,
- fichier `supabase/make_owner.sql`.

## Push

```bash
npm install
git add .
git commit -m "GhostSeller V42 Security Owner"
git push
```

## Après déploiement

1. Supabase SQL Editor :
```sql
update users set role='owner' where email='mulerlouis03@gmail.com';
update users set role='owner' where email='ghostseller.ai@gmail.com';
```

2. Vérifie :
```txt
/api/health
/api/security/status
/api/security/owner
```

## Stripe webhook plus tard

Ajoute dans Vercel :
```txt
STRIPE_WEBHOOK_SECRET
```

Endpoint Stripe :
```txt
https://ghostseller-ai.vercel.app/api/billing/webhook
```
