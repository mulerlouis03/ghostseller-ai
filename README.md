# GhostSeller AI V69 LANGUAGE CONTROL FIX

V69 corrige le problème de langue bloquée.

## Ajouts
- vrai bouton langue dans le dashboard,
- modal langue réouvrable à tout moment,
- dropdown langue,
- changement immédiat sans refresh,
- reset langue,
- détection navigateur,
- synchronisation dashboard + landing,
- header X-GhostSeller-Language pour les futurs prompts IA.

## Important

Si tu avais choisi anglais avant, clique sur :
```txt
🌍 English
```
puis choisis :
```txt
🇫🇷 Français
```

Ou va dans :
```txt
🌍 Langue
```
et clique Réinitialiser.

## Push

```bash
npm install
git add .
git commit -m "GhostSeller V69 Language Control Fix"
git push
```

## Test

```txt
/api/health
```

Tu dois voir :
```txt
GhostSeller AI V69 LANGUAGE CONTROL FIX
```
