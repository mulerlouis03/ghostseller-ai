GhostSeller AI V152 — REAL IMAGE HOTFIX

Correction du problème V151:
- Les rectangles flous/abstraits ne sont plus présentés comme des images finales.
- Chaque carte affiche un aperçu provisoire clair.
- Bouton "Créer toutes les images IA" pour générer les vraies images automatiquement.
- Chaque réseau a un prompt photoréaliste différent.
- L’image réelle remplace l’aperçu seulement quand OpenAI renvoie une URL.

À configurer dans Vercel/Render:
OPENAI_API_KEY=sk-...

Test:
1. Déployer.
2. Entrer une campagne.
3. Cliquer "Créer toutes les images IA".
4. Vérifier que les cartes remplacent les aperçus par de vraies photos.
