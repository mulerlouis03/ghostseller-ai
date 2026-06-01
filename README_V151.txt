GHOSTSELLER AI V151 — MULTI-SCENE CINEMATIC ENGINE

Ce ZIP est une vraie intégration dans le projet :
- public/clean-app.js : moteur V151 ajouté et activé automatiquement
- public/clean-app.css : style V151 ajouté
- server/modules/creative/routes.js : endpoint /api/creative/v151-image ajouté

Ce que V151 corrige :
- plus une seule image répétée partout
- Facebook, Instagram, TikTok, WhatsApp et Story reçoivent chacun une scène différente
- prompts DALL-E 3 en anglais, photoréalistes et cinématiques
- negative prompt strict contre cartoon/vector/flat design
- bouton "Créer vraie image IA" pour générer automatiquement l'image via OpenAI

Important :
Pour que le bouton "Créer vraie image IA" fonctionne, ajoute OPENAI_API_KEY dans Vercel/Render.
Sans clé OpenAI, l'outil affiche les prompts mais ne peut pas créer l'image réelle.
