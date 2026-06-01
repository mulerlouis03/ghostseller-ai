# GhostSeller AI V127 FULL PRO

Version complète avec correction 404 Vercel.

## Installation
```bash
npm install
npm run dev
```

## Déploiement
```bash
git add .
git commit -m "GhostSeller AI V127 FULL PRO"
git push origin main
```

## Routes
- `/`
- `/create-content` fonctionne grâce au rewrite SPA
- `/api/health`
- `/api/generate`

## Variable Vercel
Ajoute `OPENAI_API_KEY` dans Vercel. Si la clé est absente, l'app utilise un fallback local.
