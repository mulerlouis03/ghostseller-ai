# Stripe V29

Dans Vercel → Settings → Environment Variables, ajoute :

STRIPE_SECRET_KEY
STRIPE_STARTER_PRICE_ID
STRIPE_PRO_PRICE_ID
APP_URL

APP_URL :
https://ghostseller-ai.vercel.app

Les PRICE ID se trouvent dans Stripe → Products → Pricing.
Ils commencent par `price_`.

Le mode test fonctionne même sans Stripe.
