---
name: prospect-finder
description: Source des prospects X à contacter pour Stepers, à partir de l'ICP et du contexte business. Analyse l'ICP, cherche sur X via plusieurs angles, qualifie chaque candidat, et livre une liste de 20 à 50 profils atteignables, actifs et avec une PREUVE d'intérêt, déjà dédupliqués contre prospects.md. À utiliser quand Jordi demande du sourcing, une liste de prospects, des comptes à prospecter ou du prospecting.
---

# Prospect Finder — Sourcing X pour Stepers

## Objectif

Livrer une liste de **20 à 50 prospects X** que Jordi peut aller contacter, chacun
avec une **preuve concrète** qu'il pourrait être intéressé par Stepers. Qualité
avant quantité : mieux vaut 20 prospects solides que 50 douteux.

## Avant de commencer

1. **Lis le contexte** (MCP `context`) : `get_context` sur `icp.md`, `company.md`,
   `directive.md`, `hypotheses.md`. Comprends **en profondeur** qui est l'ICP, ses
   pain points, sa stack (Resend/Postmark/SES), et ce que ça implique pour la
   recherche.
2. **Lis `prospects.md`** (`get_context`) : récupère tous les `user_id` déjà
   sourcés pour les **exclure**. On ne repropose jamais quelqu'un.

## Les critères (filtres obligatoires)

Un candidat n'est retenu que s'il **passe TOUS ces filtres** :

### 1. Atteignable
- **Pas un gros compte.** Un profil à plusieurs milliers d'abonnés est inutile :
  peu joignable, peu susceptible de répondre. Privilégie des comptes à **audience
  modeste** (indicativement **< ~3 000 abonnés**, seuil ajustable). Écarte d'emblée
  les grosses audiences.
- **Joignable.** L'API ne dit pas si les DM sont ouverts ; utilise comme proxy :
  compte de taille raisonnable + qui interagit (réponses, conversations).

### 2. Actif
- Le compte doit avoir une **activité récente** : au moins des posts dans les
  **~30 derniers jours** (vérifie via `get_user_context`). Un compte dormant est
  écarté.

### 3. Match ICP
- Correspond à l'ICP de `icp.md` : **SaaS founder** (buyer principal), idéalement
  avec des utilisateurs / du revenu, concerné par les emails lifecycle &
  transactionnels. Écarte les hors-cible (e-commerce, newsletters, cold email,
  marketeurs sans contexte SaaS).

### 4. Preuve d'intérêt (CONDITION NON NÉGOCIABLE)
- Il faut une **preuve concrète** que la personne pourrait vouloir Stepers.
  **Pas de preuve → pas dans la liste.** Exemples de preuves, de la plus forte à
  la plus faible :
  1. exprime explicitement un **pain point** de l'ICP (galère d'onboarding, churn,
     trials qui ne convertissent pas, emails éparpillés dans le code…) ;
  2. **utilise / mentionne un concurrent** ou une stack email (Resend, Postmark,
     SES, Loops, Customer.io…) ;
  3. **construit un SaaS** avec des besoins email évidents.
- Chaque preuve doit être **citable** (tweet cité, extrait de bio). Ne jamais
  inventer une preuve.

## Stratégie de recherche (multi-angles)

À partir de l'ICP, dérive des mots-clés/signaux, puis combine les angles :

1. **Par contenu** — `search_tweets` sur les **pain points** et la **stack** de
   l'ICP (ex. `(onboarding OR churn OR "trial") email saas -is:retweet`,
   `resend OR postmark "email" founder`). C'est l'angle principal : il donne
   directement la preuve d'intérêt.
2. **Par followers de concurrents** — `get_followers` sur Resend, Loops,
   Customer.io, Postmark… un vivier déjà concerné par l'email/SaaS.
3. **Par engagement** — `get_tweet_engagers` sur des tweets pertinents (les tiens
   ou ceux d'un concurrent) : likers/reposters = intérêt démontré.

Tu peux **formuler des hypothèses** dans ta recherche (tester un segment, un
mot-clé, un angle). Quand une piste repose sur une hypothèse plutôt que sur une
preuve directe, **note-le dans la colonne Note / angle**.

## Qualification & scoring

Pour chaque candidat retenu par les angles :
1. `get_user_context` → vérifie **taille**, **activité récente**, **match ICP**,
   et récupère la **preuve** (post/bio à citer).
2. Applique les 4 filtres ci-dessus. Un échec = écarté.
3. Vérifie qu'il n'est pas déjà dans `prospects.md`.
4. Attribue un **Score ICP /10** avec une **raison courte**, basé sur : force de la
   preuve d'intérêt + fit ICP + atteignabilité.

## Livrable

Une liste de **20 à 50 prospects**, du meilleur score au moins bon. Pour chacun :

- **Compte** : @handle + lien X (`https://x.com/handle`) + `user_id`.
- **Score ICP /10** + raison.
- **Preuve d'intérêt** : le signal concret, **cité** (tweet/bio).
- **Pain point / sujet** identifié.
- **Angle d'approche** + **DM suggéré** (court, personnalisé, à son image — Jordi
  enverra lui-même).
- **Note / angle** : hypothèses de recherche, contexte utile, follow-up éventuel.

Présentation **simple et scannable** (tableau ou liste claire). Straight to the
point.

## Après le livrable

1. **Enregistre les prospects proposés dans `prospects.md`** via `write_context`
   (mode `append`), une ligne par prospect au format exact du tableau
   (Date | Compte | user_id | Score ICP | Statut = `proposé` | Note / angle).
   C'est ce qui évite les doublons la prochaine fois.
2. Si le sourcing révèle un signal marché intéressant (un pain point qui revient,
   un segment qui réagit), propose de l'ajouter à `hypotheses.md`.

## Règles

- **Preuve obligatoire.** Aucun prospect sans preuve citable. Dans le doute, écarte.
- **Faits vs hypothèses** toujours distingués (les hypothèses vont dans Note / angle).
- **Aucun envoi automatique.** Tu suggères les DM, Jordi les envoie.
- **Respecte le temps de Jordi** : liste directement exploitable, pas de tri à
  refaire de son côté.
