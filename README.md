# GhostSeller AI V39 META INSTAGRAM CONNECT

Pack V38/V39 :
- préparation Meta Developer,
- routes OAuth Instagram,
- page Instagram Connect,
- stockage Supabase des connexions sociales,
- base technique pour V40 publication automatique.

## Push
```bash
npm install
git add .
git commit -m "GhostSeller V39 Meta Instagram Connect"
git push
```

## Après déploiement
1. Exécute `supabase/schema.sql`
2. Ajoute dans Vercel :
```txt
META_APP_ID
META_APP_SECRET
META_REDIRECT_URI=https://ghostseller-ai.vercel.app/api/meta/callback
```
3. Redéploie
4. `/api/health` doit afficher `meta:true`
