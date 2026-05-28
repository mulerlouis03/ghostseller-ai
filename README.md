# GhostSeller AI V71 PRICING STRIPE PLANS CLEAN

V71 prépare la partie commerciale.

## Ajouts
- pricing page propre,
- plans Free / Starter / Pro / Agency,
- endpoint `/api/billing/plans`,
- checkout Stripe structuré,
- variables Stripe documentées,
- table billing_events,
- colonnes subscription user.

## Variables Vercel à ajouter

```txt
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_STARTER
STRIPE_PRICE_PRO
STRIPE_PRICE_AGENCY
APP_URL
```

## Push

```bash
npm install
git add .
git commit -m "GhostSeller V71 Pricing Stripe Plans Clean"
git push
```

## Supabase

Exécute :
```txt
supabase/V71_PRICING_PLANS.sql
```

## Test

```txt
/api/health
/api/billing/plans
```

Tu dois voir :
```txt
GhostSeller AI V71 PRICING STRIPE PLANS CLEAN
```
