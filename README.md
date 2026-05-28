# GhostSeller AI V75 VERCEL CRASH HOTFIX

Ce hotfix corrige l'écran Vercel "Something went wrong" après V74/V75.

## Ce qui est corrigé
- admin route sécurisée,
- import admin non dupliqué,
- routes admin défensives,
- crash évité si certaines tables Supabase n'existent pas encore,
- health V75 hotfix.

## Push

```bash
npm install
git add .
git commit -m "GhostSeller V75 Vercel Crash Hotfix"
git push
```

## Test

```txt
/api/health
```

Tu dois voir :
```txt
GhostSeller AI V75 VERCEL CRASH HOTFIX
```

Ensuite teste :
```txt
/api/admin/status
```
en étant connecté owner.
