# GhostSeller AI V113 OWNER BILLING EXCLUSION

## Corrigé
- Ton compte owner n'apparaît plus dans la liste utilisateurs.
- Ton compte owner n'est plus compté comme client payant.
- Ton compte owner n'est plus compté dans les abonnés actifs.

## Important prélèvement 9€
Si Stripe prélève 9€, c'est qu'un abonnement Stripe Starter existe vraiment.
Cette version corrige l'affichage GhostSeller, mais n'annule pas Stripe.

Pour arrêter le prélèvement :
Stripe Dashboard -> Customers -> cherche ton email -> Subscriptions -> Cancel subscription.

## Push
npm install
git add .
git commit -m "GhostSeller V113 Owner Billing Exclusion"
git push
