GHOSTSELLER AI V151 — MULTI-SCENE CINEMATIC ENGINE

Ce ZIP est intégré au projet.

Modifications principales :
- public/clean-app.js : moteur V151 ajouté et activé automatiquement.
- public/clean-app.css : style V151 ajouté.
- server/modules/creative/routes.js : endpoint /api/creative/v151-image ajouté.

Ce que V151 corrige :
- Facebook, Instagram, TikTok, WhatsApp et Story n'utilisent plus la même image.
- Chaque réseau reçoit un prompt image différent.
- Les prompts sont en anglais, photoréalistes et cinématiques.
- Negative prompt strict : cartoon, vector art, flat design, illustration interdits.
- Bouton "Créer vraie image IA" branché sur OpenAI Images.

Important :
Ajoute OPENAI_API_KEY dans les variables d'environnement pour générer les vraies images.
Sans cette clé, le système affichera les prompts mais ne pourra pas créer l'image automatiquement.
