# Installer V27 Admin Module

1. Copie `server/modules/admin` dans ton projet CORE V26.

2. Dans `server.js`, ajoute avec les imports :

```js
import { adminRouter } from "./server/modules/admin/routes.js";
```

3. Dans `server.js`, ajoute avec les app.use :

```js
app.use("/api/admin", adminRouter);
```

4. Dans Supabase SQL Editor, exécute `supabase/v27_admin.sql`.

Remplace `TON_EMAIL` par ton email.

5. Terminal :

```bash
git add .
git commit -m "GhostSeller V27 admin module"
git push
```