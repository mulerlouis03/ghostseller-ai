# GhostSeller AI V94 STRIPE BILLING READY

Basé sur V93 stable.

## Ajouts
- Stripe Billing API `/api/billing`
- Plans Starter / Pro / Agency
- Checkout Stripe
- Customer Portal
- Subscription status
- Webhook billing
- Tables Supabase billing

## Variables Vercel

```txt
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_STARTER=
STRIPE_PRICE_PRO=
STRIPE_PRICE_AGENCY=
APP_URL=https://ghostseller-ai.vercel.app
```

## Supabase

Exécute :

```txt
supabase/V94_STRIPE_BILLING_READY.sql
```

## Commandes

```bash
npm install
git add .
git commit -m "GhostSeller V94 Stripe Billing Ready"
git push
```

## Tests

```txt
/api/health
/api/billing/plans
/api/billing/status
```

## Stripe Dashboard

Créer 3 produits/prix mensuels :
- Starter 9,99€/mois
- Pro 29,99€/mois
- Agency 79,99€/mois

Copier les Price IDs dans Vercel :
- STRIPE_PRICE_STARTER
- STRIPE_PRICE_PRO
- STRIPE_PRICE_AGENCY
