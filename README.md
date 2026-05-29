# GhostSeller AI V92 TIKTOK CONNECT OAUTH

Basé sur V91 clean dashboard.

## Ajouts
- Connexion officielle TikTok OAuth v2,
- stockage token côté serveur,
- refresh token,
- statut compte TikTok,
- déconnexion,
- upload draft depuis URL en mode safe.

## Variables Vercel

À mettre sur Preview + Production :

```txt
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
TIKTOK_REDIRECT_URI=https://TON-DOMAINE.vercel.app/api/tiktok-connect/callback
TIKTOK_SCOPES=user.info.basic,video.upload
APP_URL=https://TON-DOMAINE.vercel.app
```

Pour Direct Post, il faudra remplacer/ajouter le scope :
```txt
video.publish
```

## Supabase

Exécute :

```txt
supabase/V92_TIKTOK_CONNECT_OAUTH.sql
```

## Push test

```bash
git checkout -b v92-test
npm install
git add .
git commit -m "GhostSeller V92 TikTok Connect OAuth"
git push -u origin v92-test
```

## Test

```txt
/api/health
/api/tiktok-connect/config
```

## Important
TikTok exige une app Developer enregistrée et l'approbation Content Posting API pour `video.upload` ou `video.publish`.
