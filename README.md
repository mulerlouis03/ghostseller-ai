# GhostSeller AI V78 REVENUE SYSTEM STABLE

V78 prépare la collecte de revenus réels.

## Ajouts
- Stripe checkout stable,
- Stripe webhook `/api/stripe/webhook`,
- activation automatique des plans,
- customer portal,
- statut abonnement,
- billing events,
- activation manuelle owner/admin.

## Variables Vercel

```txt
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_STARTER
STRIPE_PRICE_PRO
STRIPE_PRICE_AGENCY
APP_URL
```

## Stripe Webhook URL

Dans Stripe Dashboard > Developers > Webhooks :

```txt
https://TON-DOMAINE.vercel.app/api/stripe/webhook
```

Events à cocher :

```txt
checkout.session.completed
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
```

## Push

```bash
npm install
git add .
git commit -m "GhostSeller V78 Revenue System Stable"
git push
```

## Supabase

Exécute :
```txt
supabase/V78_REVENUE_SYSTEM.sql
```

## Test

```txt
/api/health
/api/revenue/status
```

Tu dois voir :
```txt
GhostSeller AI V78 REVENUE SYSTEM STABLE
```
