# GhostSeller AI V76 REAL AI ENGINE STABLE

V76 branche un vrai moteur IA stable.

## Ajouts
- endpoint `/api/ai/status`,
- endpoint `/api/ai/generate`,
- endpoint `/api/ai/creative-directions`,
- OpenAI prêt,
- fallback stable si OPENAI_API_KEY absent,
- mémoire utilisateur utilisée dans les prompts,
- génération multi-format : hook, scènes, caption, WhatsApp, hashtags, CTA,
- consommation crédits.

## Variables Vercel

```txt
OPENAI_API_KEY
OPENAI_MODEL=gpt-4o-mini
```

## Push

```bash
npm install
git add .
git commit -m "GhostSeller V76 Real AI Engine Stable"
git push
```

## Supabase

Exécute :
```txt
supabase/V76_REAL_AI_ENGINE.sql
```

## Test

```txt
/api/health
/api/ai/status
```

Tu dois voir :
```txt
GhostSeller AI V76 REAL AI ENGINE STABLE
```
