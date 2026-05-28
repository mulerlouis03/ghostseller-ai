# GhostSeller AI V39 - Meta Instagram Connect

Pré-requis :
- Instagram compte professionnel
- Page Facebook GhostSeller AI
- Instagram lié à la page Facebook
- Compte Meta Developer

Meta Developer :
1. Va sur https://developers.facebook.com/
2. Crée une application type Entreprise
3. Ajoute Facebook Login
4. Ajoute Instagram Graph API
5. Dans OAuth Redirect URI, mets :
https://ghostseller-ai.vercel.app/api/meta/callback

Vercel variables :
META_APP_ID
META_APP_SECRET
META_REDIRECT_URI=https://ghostseller-ai.vercel.app/api/meta/callback

Supabase :
Exécute supabase/schema.sql

Test :
/api/health doit afficher "meta": true
