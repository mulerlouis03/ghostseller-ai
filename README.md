# GhostSeller AI V80 PUBLIC LAUNCH PRODUCTION READY

V80 est la version de lancement public.

## Ajouts
- page `/launch`,
- Public Launchpad,
- checklist production,
- launch score,
- statut public,
- launch analytics basique,
- go-live notes,
- tracking page view launch,
- préparation lancement réel.

## Variables Vercel

```txt
PUBLIC_LAUNCH=false
BETA_OPEN=true
APP_URL=https://your-domain.com
```

Quand tout est prêt :

```txt
PUBLIC_LAUNCH=true
```

## Push

```bash
npm install
git add .
git commit -m "GhostSeller V80 Public Launch Production Ready"
git push
```

## Supabase

Exécute :
```txt
supabase/V80_PUBLIC_LAUNCH.sql
```

## Test

```txt
/api/health
/api/launchpad/status
/launch
```

Tu dois voir :
```txt
GhostSeller AI V80 PUBLIC LAUNCH PRODUCTION READY
```
