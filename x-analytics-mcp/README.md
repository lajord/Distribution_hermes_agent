# x-analytics-mcp

Serveur MCP local (lecture seule) pour l'API X, à brancher sur Hermes.
Expose 5 tools : `get_posts`, `get_account_stats`, `get_dms`, `search_users`, `get_user_context`.

## Prérequis

- Node.js >= 20
- Une app X (developer.x.com) configurée en **OAuth 2.0** avec l'URL de callback
  **exacte** : `http://localhost:8080/callback`

## Lancer le MCP — 4 étapes

### 1. Installer les dépendances

```powershell
cd "c:\Users\Jordi\Desktop\Distribution Stepers agent\x-analytics-mcp"
npm ci
```

### 2. Renseigner les identifiants OAuth

Créer un fichier `.env` dans ce dossier avec au minimum :

```
X_CLIENT_ID=ton_client_id
X_CLIENT_SECRET=ton_client_secret   # uniquement si app confidentielle
```

### 3. Compiler puis connecter ton compte X

```powershell
npm run build
npm run auth
```

`npm run auth` ouvre le navigateur sur X → tu autorises l'app → le callback local
échange le code et **sauvegarde les tokens dans `.env`** (`X_ACCESS_TOKEN`,
`X_REFRESH_TOKEN`, `X_TOKEN_EXPIRES_AT`). Les tokens ne sont pas affichés.
Scopes demandés : `tweet.read users.read dm.read offline.access`.
Le flux expire après 5 minutes sans callback.

### 4. Démarrer le serveur (test manuel, optionnel)

```powershell
npm start
```

Le serveur communique en **stdio** (stdout réservé au protocole MCP).
En usage réel, ce n'est pas toi qui le lances : **Hermes le démarre lui-même**
via la config ci-dessous.

## Brancher sur Hermes

Ajouter cette entrée à la config MCP d'Hermes, puis redémarrer son MCP :

```json
{
  "mcpServers": {
    "x-analytics": {
      "command": "node",
      "args": [
        "c:\\Users\\Jordi\\Desktop\\Distribution Stepers agent\\x-analytics-mcp\\dist\\index.js"
      ]
    }
  }
}
```

- `command: "node"`, **un seul argument** = chemin absolu de `dist/index.js`.
- Sous Windows en JSON : double antislash `\\`, ou slashs simples `/`.
- Le nom `"x-analytics"` est libre.

## Vérifier / dépanner

```powershell
npm test    # tests OAuth + pagination sur API simulée (aucun appel réel à X)
npm run check   # vérification TypeScript sans émettre
```

- **`dist/index.js` introuvable** → relancer `npm run build`.
- **Refresh token refusé / 401 persistant** → relancer `npm run auth`.
- **`localhost:8080` occupé** → libérer le port avant `npm run auth`.
- Utiliser **une seule** instance du MCP avec ce `.env`, et l'arrêter avant une
  nouvelle autorisation.
- Ne pas injecter d'anciens tokens via l'environnement d'Hermes : ils
  prendraient le dessus sur les tokens sauvegardés.

## Notes

- Le token est renouvelé automatiquement avant expiration ; un 401 déclenche un
  refresh + une seule nouvelle tentative.
- Limites API X : couverture de timeline partielle, métriques cumulées à
  `observed_at`, DM et métriques privées sur une fenêtre ~30 jours. Toujours
  inspecter `meta.truncated`, `errors` et `warnings` dans les réponses.
