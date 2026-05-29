# GhostSeller AI V88 DASHBOARD UX TIKTOK LAUNCH

Basé sur V87 validé.

## Objectif
- Remanier le dashboard,
- regrouper les modules,
- réduire le menu interminable,
- mettre TikTok Launch Mode en priorité.

## Ajouts
- menu groupé automatiquement,
- Launch Center,
- accès rapide TikTok Engine / Automation / Acquisition / Stripe,
- route `/api/tiktok-launch/tonight-plan`.

## Push test

```bash
git checkout -b v88-test
npm install
git add .
git commit -m "GhostSeller V88 Dashboard UX TikTok Launch"
git push -u origin v88-test
```

## Test

```txt
/api/health
/api/tiktok-launch/tonight-plan
```
