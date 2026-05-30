# GhostSeller AI V106.1 BETA FEEDBACK BUTTON

## Ajout
- Bouton “💬 Donner mon avis” dans la bannière bêta utilisateur.
- Le bouton envoie l'utilisateur vers Mon compte → Donner un retour.
- Les retours sont envoyés vers /api/feedback.
- Les retours sont stockés dans Supabase table feedback.
- Les retours sont visibles dans Owner Console → Retours.

## Supabase
Si ce n'est pas déjà fait, exécuter :
supabase/V105_PLATFORM_STABILIZATION.sql

ou :
supabase/V106_1_FEEDBACK_BUTTON_NOTE.sql

## Déploiement
npm install
git add .
git commit -m "GhostSeller V106.1 Beta Feedback Button"
git push

## Où voir les retours ?
https://ghostseller-ai.vercel.app/owner/
Puis onglet : Retours
