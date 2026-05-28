# GhostSeller AI V73 SYSTEM EMAILS ONBOARDING

V73 ajoute la couche emails système + onboarding bêta.

## Ajouts
- welcome email,
- email logs,
- notification center,
- onboarding checklist,
- email simulation mode si Resend n'est pas configuré,
- support futur Resend,
- preferred_language utilisateur.

## Variables Vercel optionnelles

```txt
RESEND_API_KEY
EMAIL_FROM
```

Sans ces variables, les emails sont simulés et enregistrés dans `email_logs`.

## Push

```bash
npm install
git add .
git commit -m "GhostSeller V73 System Emails Onboarding"
git push
```

## Supabase

Exécute :
```txt
supabase/V73_SYSTEM_EMAILS_ONBOARDING.sql
```

## Test

```txt
/api/health
/api/emails/status
/api/beta/checklist
```

Tu dois voir :
```txt
GhostSeller AI V73 SYSTEM EMAILS ONBOARDING
```
