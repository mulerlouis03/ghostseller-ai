# GhostSeller AI V42 Security Checklist

## 1. Propriétaire Supabase
Dans Supabase → SQL Editor, exécute :

```sql
update users set role='owner' where email='mulerlouis03@gmail.com';
update users set role='owner' where email='ghostseller.ai@gmail.com';
```

ou exécute :
`supabase/make_owner.sql`

## 2. Variables Vercel obligatoires

Vercel → Settings → Environment Variables :

```txt
JWT_SECRET
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
STRIPE_SECRET_KEY
STRIPE_STARTER_PRICE_ID
STRIPE_PRO_PRICE_ID
APP_URL
```

## 3. Stripe sécurité

À ajouter plus tard pour webhook réel :

```txt
STRIPE_WEBHOOK_SECRET
```

Stripe Dashboard → Developers → Webhooks → Add endpoint :

```txt
https://ghostseller-ai.vercel.app/api/billing/webhook
```

Événements :
- checkout.session.completed

## 4. Test après déploiement

```txt
/api/health
/api/security/status
/api/security/owner
```

`/api/security/owner` doit confirmer ton accès propriétaire.

## 5. Protection ajoutée

- Headers sécurité
- Rate limit API
- Role owner
- Mode demo-upgrade désactivé en production
- Limite JSON réduite à 1mb
