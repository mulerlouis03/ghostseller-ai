# GhostSeller AI V41 FIX FULL WAITLIST LEADS

Correction :
- basé sur V40 complet stable,
- conserve dashboard, landing, Stripe, Supabase, OpenAI,
- ajoute waitlist sans casser Vercel.

Ajouts :
- formulaire waitlist sur `/landing`,
- capture nom, email, business,
- sauvegarde Supabase dans table `waitlist`,
- route `/api/waitlist/join`.

## Push

```bash
npm install
git add .
git commit -m "GhostSeller V41 Fix Full Waitlist Leads"
git push
```

## Supabase

Exécute `supabase/schema.sql`.

## Test

```txt
/api/health
```

Tu dois voir :

```txt
GhostSeller AI V41 FIX FULL WAITLIST LEADS
```
