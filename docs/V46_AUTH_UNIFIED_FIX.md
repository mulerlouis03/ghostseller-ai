# GhostSeller AI V46 - Auth Unified Fix

Problème corrigé :
GhostSeller utilisait deux systèmes :
1. table `users`
2. Supabase Authentication Users

V46 synchronise les deux :
- inscription crée Supabase Auth + table users,
- login accepte table users ou Supabase Auth,
- reset password Supabase met aussi à jour `users.password_hash`,
- owner access reste stable.

## Après déploiement

1. Recrée si nécessaire ton compte depuis GhostSeller.
2. Fais un reset password si besoin.
3. Exécute dans Supabase SQL Editor :

```sql
update users
set role='owner', plan='Pro', credits=9999
where email='ghostseller.ai@gmail.com';
```

## Test

- Créer compte
- Connexion
- Mot de passe oublié
- Reset password
- Connexion avec nouveau mot de passe
