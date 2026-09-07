# Plan Hermes — Distribution Stepers

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
