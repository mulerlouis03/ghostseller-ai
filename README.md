# GhostSeller AI V107 MOBILE USER STABLE

## Corrections principales
- Mobile utilisateur stabilisé.
- Plus de scroll horizontal.
- Menu mobile avec bouton ☰.
- Boutons Accueil / Créer contenu / Vidéo / TikTok / Leads / WhatsApp replacés dans un menu coulissant.
- Feedback utilisateur corrigé.
- Message clair si le retour ne peut pas être envoyé.
- Page Mon compte plus utilisable sur téléphone.

## Supabase
Si la table feedback n'existe pas encore, exécuter :
supabase/V107_FEEDBACK_AND_MOBILE.sql

## Déploiement
npm install
git add .
git commit -m "GhostSeller V107 Mobile User Stable"
git push

## Tests
https://ghostseller-ai.vercel.app
https://ghostseller-ai.vercel.app/api/health
