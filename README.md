# GhostSeller AI V77 SOCIAL CONNECTORS STABLE

V77 prépare les connexions réseaux sociaux officielles.

## Ajouts
- Meta / Instagram / Facebook connector,
- TikTok connector,
- LinkedIn connector,
- WhatsApp Business connector,
- OAuth URL builder,
- comptes connectés,
- queue de publication,
- callback OAuth safe,
- mode sécurisé sans publication réelle tant que les APIs ne sont pas approuvées.

## Important

Cette version ne publie pas encore réellement sur les réseaux.
Elle prépare la connexion propre et évite de casser la production.

## Variables Vercel

```txt
META_APP_ID
META_APP_SECRET
META_REDIRECT_URI

TIKTOK_CLIENT_KEY
TIKTOK_CLIENT_SECRET
TIKTOK_REDIRECT_URI

LINKEDIN_CLIENT_ID
LINKEDIN_CLIENT_SECRET
LINKEDIN_REDIRECT_URI

WHATSAPP_TOKEN
WHATSAPP_PHONE_NUMBER_ID
WHATSAPP_BUSINESS_ACCOUNT_ID
```

## Push

```bash
npm install
git add .
git commit -m "GhostSeller V77 Social Connectors Stable"
git push
```

## Supabase

Exécute :
```txt
supabase/V77_SOCIAL_CONNECTORS.sql
```

## Test

```txt
/api/health
/api/social/status
```

Tu dois voir :
```txt
GhostSeller AI V77 SOCIAL CONNECTORS STABLE
```
