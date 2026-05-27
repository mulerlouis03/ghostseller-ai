# GhostSeller AI V46 AUTH UNIFIED FIX

V46 corrige le conflit entre `users` et Supabase Auth.

Ajouts :
- inscription synchronisée Supabase Auth + users,
- login fiable,
- reset password synchronisé,
- owner access stable,
- fini les comptes désynchronisés.

## Push

```bash
npm install
git add .
git commit -m "GhostSeller V46 Auth Unified Fix"
git push
```

## Test

```txt
/api/health
```

Tu dois voir :

```txt
GhostSeller AI V46 AUTH UNIFIED FIX
```
