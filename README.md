# GhostSeller AI V99 CLEAN PUBLIC BETA

## Objectif
Nettoyer complètement l’interface publique avant d’envoyer le lien à des testeurs.

## Ce qui est nettoyé
- Aucun OpenAI visible côté client.
- Aucun Supabase visible côté client.
- Aucun Stripe visible côté client.
- Aucun OAuth visible côté client.
- Suppression de V52 Access Control.
- Suppression des références Vxx visibles.
- Déconnexion masquée avant connexion.
- Dashboard utilisateur simple.
- Owner Console séparée.

## Commandes
npm install
git add .
git commit -m "GhostSeller V99 Clean Public Beta"
git push

## Lien à envoyer
https://ghostseller-ai.vercel.app

## Tests
/api/health
/api/billing/plans
