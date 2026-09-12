# Plan Hermes — Distribution Stepers


Hermes → utilise les MCP → raisonne avec Claude → suit ton skill → génère le rapport → l’envoie.



## V1 implementee : MCP X local

`x-analytics-mcp/` contient les cinq tools en lecture seule : `get_posts`,
`get_account_stats`, `get_dms`, `search_users`, `get_user_context`.
L'analyse et les scores restent dans Hermes et ses skills. La DB, le backend de
rapports, le PDF et l'email decrits plus bas sont des evolutions ulterieures.

### Lancement

Depuis `x-analytics-mcp/` :

```powershell
npm ci
npm run build
npm start
```

Pour le client MCP d'Hermes : commande `node`, argument unique = chemin absolu de
`x-analytics-mcp/dist/index.js`, transport stdio. stdout est reserve au protocole.

### Authentification

Renseigner `X_CLIENT_ID` et, pour un client confidentiel, `X_CLIENT_SECRET` dans
le `.env` du serveur ou le `.env` parent. Declarer exactement
`http://localhost:8080/callback` dans la configuration OAuth 2.0 de X.
Depuis `x-analytics-mcp/`, lancer `npm run auth` : le navigateur s'ouvre sur X,
vous autorisez l'application, puis le callback local echange le code PKCE contre
les tokens. Scopes : `tweet.read users.read dm.read offline.access`.
Le script expire apres cinq minutes sans callback et verifie le parametre `state`.
Les tokens ne sont pas affiches : ils sont sauvegardes dans `x-analytics-mcp/.env`
avec `X_TOKEN_EXPIRES_AT` (timestamp Unix en millisecondes), en preservant les
autres variables. Le serveur callback s'arrete ensuite. Redemarrer le MCP Hermes
apres une nouvelle autorisation. `npm run auth` n'est pas le serveur MCP.
La variable existante `API_X` n'est pas utilisee implicitement : une cle API ou
un token app-only ne donne pas acces aux DM et aux metriques privees.
Le MCP renouvelle le token a la demande avant expiration, sauvegarde les tokens
renouveles et retente une seule fois un appel X apres une erreur 401.
Les refresh concurrents sont regroupes dans un meme processus. Utiliser une seule
instance MCP avec ce fichier de tokens et l'arreter avant une nouvelle autorisation.
Un refresh refuse necessite `npm run auth`. Ne pas injecter d'anciens tokens via
l'environnement d'Hermes : ils seraient prioritaires sur les tokens sauvegardes.
Reference : [OAuth PKCE X](https://docs.x.com/fundamentals/authentication/oauth-2-0/user-access-token).

Priorite : environnement du processus, `.env` du serveur, `.env` parent.
Les valeurs vides des fichiers ne masquent pas les valeurs du fichier parent.
Le chargement est independant du repertoire de lancement du client MCP.
Le `.env` racine reste localement present mais est retire du suivi Git ; cela
ne retire pas les anciennes valeurs eventuellement presentes dans l'historique.

### Contrat et limites

- Fournir `username` ou `user_id`, pas les deux. Sans identifiant : compte connecte.
- Dates ISO 8601 avec fuseau, debut inclus et fin exclue.
- `get_posts.max_results` : plafond total, defaut 100, maximum 3200, pagination
  automatique. Reponses et reposts inclus ; `include_replies=false` exclut les reponses.
- Les metriques sont cumulees a `observed_at`, pas limitees aux interactions de
  la periode demandee. Les metriques privees sont enrichies separement pour les
  posts recents du compte connecte. Les valeurs manquantes restent `null`.
- `get_account_stats` : etat actuel uniquement, aucun historique simule.
- `get_dms` : plafond de messages correspondant aux filtres (defaut 100, maximum
  5000), maximum 50 pages parcourues. `participant_id` est un ID numerique que
  Hermes peut recuperer via les tools de profil. Les participants sont les IDs
  observes, pas une liste exhaustive des membres d'un groupe.
- Verifier `meta.truncated`, `errors` et `warnings`. L'absence de troncature locale
  ne garantit pas un historique exhaustif au-dela de ce que X expose.
  Le `next_token` des posts/DM est informatif ; la V1 n'expose pas d'input de reprise.
- `search_users` retourne une page et `next_cursor`, a transmettre dans `cursor`.
  Recherche de profils uniquement, sans scoring.
- Erreurs HTTP explicites, delai reseau de 30 secondes ; seul un 401 declenche un
  refresh suivi d'une unique nouvelle tentative. Pas de retry des autres erreurs.

References : [timelines X](https://docs.x.com/x-api/posts/timelines/integrate),
[metriques X](https://docs.x.com/x-api/fundamentals/metrics),
[DM X](https://docs.x.com/x-api/direct-messages/lookup/integrate),
[recherche utilisateurs](https://docs.x.com/x-api/users/search-users),
[SDK MCP v1](https://ts.sdk.modelcontextprotocol.io/server).
X documente une fenetre de 30 jours pour les DM et les metriques privees.
Les droits effectifs restent a verifier avec le compte et son acces API.

Validation locale : compilation TypeScript, tests sur API simulee (pagination,
dates, metriques privees, filtres DM, curseur de recherche, erreurs HTTP) et
handshake MCP stdio avec verification des cinq tools. Aucun appel reel a X.
`npm test` verifie aussi le PKCE, le callback local, les states invalides, le refus,
l'expiration du flux, la sauvegarde, la rotation et la concurrence du refresh,
ainsi que la reprise apres 401, avec des tokens fictifs et un fichier temporaire.

---

## 1. Applications tierces prévues

Hermes utilisera ces applications via les connexions MCP ou tools retenus pour le backend :

- **X** : posts, statistiques, DM et recherche de prospects.
- **PostHog** : trafic de la landing page et conversion.
- **Outil waitlist / DB existante** : nouvelles inscriptions ; nom à préciser.
- **Claude** : analyses, identification des patterns et suggestions.
- **Google Sheets** : liste des prospects.
- **Service email à choisir** : envoi du rapport.

## 2. Connexions MCP / tools à mettre en place

L’approche privilégie les MCP existants. Pour chaque connexion, choisir le MCP/tool et vérifier qu’il couvre les besoins ci-dessous.

- **X MCP** : posts, statistiques, lecture des DM et recherche de profils.
- **PostHog MCP** : visites LP et données de conversion.
- **Google Sheets MCP/tool** : lire et enregistrer la liste des prospects.
- **DB MCP/tool** : lire les inscriptions de la waitlist et accéder au stockage de l’historique de l’agent.
- **Email MCP/tool** : envoyer la synthèse et le rapport.

La génération du PDF reste une fonction à prévoir dans le backend.

## 3. Cas d’usage

### Weekly GTM Review

**Données :** tous les posts de la semaine, leurs catégories, impressions, engagements et visites de profil disponibles ; données PostHog, visites LP, nouveaux inscrits waitlist et conversion LP.

**Résultat :**

- Bilan de la semaine et comparaison avec la précédente.
- Ce qui a marché et ce qui n’a pas marché.
- Corrélations possibles entre posts, trafic et inscriptions, sans les présenter comme des certitudes.
- Hypothèses, bottleneck principal et actions recommandées pour la semaine suivante.

**Connexions utilisées :** X MCP, PostHog MCP et DB MCP/tool.

### DM Intelligence

**Données :** DM de la semaine et historique utile des conversations.

**Résultat :**

- Nouvelles conversations, personnes contactées et taux de réponse.
- Conversations qualifiées, founders et profils ICP contactés.
- Objections récurrentes, problèmes exprimés et mots utilisés par les prospects.
- Signaux d’intérêt pour Stepers et patterns détectés par Claude.
- Personnes à relancer et follow-ups suggérés.

**Connexions utilisées :** X MCP pour les DM et DB MCP/tool pour l’historique.

**IA suggère → toi tu envoies. Aucun envoi automatique de DM.**

### Prospect Finder hebdomadaire

**Données :** profils X et publications pertinentes, selon l’ICP de Stepers à définir ensemble.

**Résultat :** une liste de 20 à 50 prospects pertinents pour le lundi, selon les profils trouvés, avec pour chacun :

- Profil et lien X.
- Score ICP /10 et raison du score.
- Signaux détectés et sujet / pain point.
- Angle d’approche et DM suggéré.
- Éventuel follow-up.

**Connexions utilisées :** X MCP, Google Sheets MCP/tool et DB MCP/tool pour identifier les prospects déjà proposés ou contactés.

### Livraison hebdomadaire

Chaque fin de week-end, réunir les trois analyses dans un **rapport complet PDF + email**.

**Moyens utilisés :** génération PDF dans le backend et Email MCP/tool pour l’envoi.

## 4. Stockage / historique

Avant la première exécution complète, mettre en place une **base de données locale**, accessible via le DB MCP/tool retenu, pour conserver :

- Les prospects déjà proposés et les personnes réellement contactées.
- Les DM historiques.
- Les posts, leurs statistiques datées et les indicateurs hebdomadaires de trafic, d’inscription et de conversion.

Définir ensemble **quelles données stocker, où les stocker et leurs identifiants uniques** pour éviter les doublons et comparer la semaine N à la semaine N-1. Le choix de la base reste à faire.

## 5. Ordre de travail

1. Choisir, configurer et vérifier les connexions MCP/tools en local.
2. Mettre en place le stockage et construire le backend qui utilise ces connexions pour les trois cas d’usage.
3. Vérifier une première exécution complète avec le rapport PDF et l’email.
4. Brancher Hermes en couche finale pour déclencher le traitement chaque fin de week-end.

Hermes est déjà installé. Tout le développement démarre en local ; le VPS viendra plus tard.
