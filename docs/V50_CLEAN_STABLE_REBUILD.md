# GhostSeller AI V50 - Clean Stable Rebuild

Objectif :
1. Nettoyer le frontend
2. Stabiliser l'auth
3. Refaire un dashboard fiable
4. Garder Meta en pause

Après déploiement :
- tester /api/health
- créer/connexion compte
- remettre owner dans Supabase
- tester dashboard
- tester /landing

SQL owner :
```sql
update users
set role='owner', access_status='approved', plan='Pro', credits=9999
where email='ghostseller.ai@gmail.com';
```
