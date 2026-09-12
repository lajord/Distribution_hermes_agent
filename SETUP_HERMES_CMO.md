# Setup Hermes — Agent CMO pour Stepers

Objectif : un agent qui agit comme un **CMO**. Deux missions hebdomadaires,
livrées automatiquement chaque week-end (rapport PDF + email) :

1. **Weekly GTM Review** — analyse de l'approche X de la semaine, patterns, KPIs
   du funnel `X → LP → Waitlist`, insights, ce qui marche / ne marche pas, et
   franc-parler quand le positionnement / message n'est pas clair.
2. **Prospect Finder** — liste d'au moins 20 comptes X à prospecter, basée sur
   l'ICP et des hypothèses testées chaque semaine.

Le funnel de référence : **X (contenu) → LP (trafic) → Waitlist (inscriptions)**.

---

## Vue d'ensemble : les 5 blocs à mettre en place

| Bloc | Quoi | État |
|------|------|------|
| 1. Contexte business | Ce que l'agent doit "savoir" pour raisonner en CMO | à créer (docs) |
| 2. Sources de données | Brancher chaque étape du funnel | X fait, reste à faire |
| 3. Stockage / historique | Comparer semaine N vs N-1, éviter les doublons de prospects | à créer |
| 4. Skills (comportement) | Dire à l'agent quoi faire et comment | à créer |
| 5. Automatisation + livraison | Planifier, générer le PDF, envoyer l'email | à créer |

---

## Bloc 1 — Contexte business (le "cerveau" du CMO)

Sans ça l'agent ne peut ni analyser ni sourcer correctement. Ce sont des
documents markdown qu'on écrit une fois et qu'on met à jour. **C'est la priorité.**

- **`business/context.md`** — c'est quoi Stepers, le produit, la proposition de
  valeur, le stade actuel (pré-launch / waitlist), l'objectif du trimestre.
- **`business/icp.md`** — le profil client idéal, le plus concret possible :
  - Rôles / personas cibles (ex. founder early-stage, indie hacker, ops…).
  - **Signaux détectables sur X** : mots-clés de bio, taille d'audience, type
    d'activité, sujets qu'ils postent, pain points exprimés.
  - Anti-signaux (qui exclure).
  - → Sert **directement** au Prospect Finder et à l'analyse d'audience.
- **`business/messaging.md`** — positionnement, angles, promesses testées,
  ton de voix. Sert à juger si un post est "clair" ou non.
- **`business/hypotheses.md`** — hypothèses GTM en cours (ex. "les posts
  problème > solution convertissent mieux", "le segment X répond plus"). L'agent
  les teste, les valide/invalide et en propose de nouvelles chaque semaine.

> Décision à prendre : ces docs, on les remplit ensemble maintenant, ou tu me
> donnes des notes brutes que je structure.

---

## Bloc 2 — Sources de données (brancher le funnel)

| Étape du funnel | Donnée | Source | État |
|-----------------|--------|--------|------|
| X (contenu) | posts, impressions, engagement, visites profil | **x-analytics-mcp** | ✅ codé (à build/auth) |
| LP (trafic) | visites, sources, comportement | **PostHog MCP** | ✅ branché |
| Waitlist (inscriptions) | inscrits, taux de conversion LP→waitlist | **PostHog** (event/pageview) | ✅ via PostHog |

**Décision prise** : pas de Google Sheets MCP. L'inscription à la waitlist est vue
par PostHog, donc PostHog couvre **trafic LP + inscriptions**. Le funnel entier
est mesurable avec seulement 2 MCP (x-analytics + PostHog).

À vérifier une fois : l'inscription doit être **identifiable dans PostHog** —
soit un **event custom** (`waitlist_signed_up`), soit un **pageview de page de
confirmation** (`/thank-you`). Sinon, ajouter ce signal côté LP.

---

## Bloc 3 — Stockage / historique (le socle des deux use cases)

C'est ce qui manque le plus et qui débloque tout le reste. Il faut une petite
**base locale** qui conserve :

- **Snapshots hebdo des KPIs** : posts + stats datées, trafic LP, inscriptions,
  taux de conversion. → permet la comparaison **semaine N vs N-1**.
- **Prospects proposés & contactés** : pour ne **jamais reproposer** le même
  compte et suivre l'état (proposé / contacté / répondu). → indispensable au
  Prospect Finder.
- **Historique des hypothèses** et de leurs résultats.

Décision à prendre : quelle base. Options simples pour du local :
- **SQLite** (fichier local, robuste, requêtable) — recommandé.
- **Google Sheets** (visuel, éditable à la main, moins robuste).
- Un mix : SQLite pour l'historique KPI + Sheet pour la liste prospects lisible.

À définir ensemble : **quelles tables, quelles clés uniques** (ex. `post_id`,
`user_id` X, `iso_week`) pour éviter les doublons et comparer proprement.

---

## Bloc 4 — Skills (le comportement de l'agent)

Les skills disent à l'agent **quoi faire, avec quelles données, et quel format
de sortie**. Un skill = un dossier avec des instructions. À créer :

- **`skill: weekly-gtm-review`**
  - Récupère posts + stats de la semaine (X MCP), trafic LP (PostHog),
    inscriptions (waitlist), + semaine N-1 depuis le stockage.
  - Produit : bilan vs semaine passée, ce qui a marché / pas marché, patterns
    (quels sujets/formats/angles corrèlent avec visites profil → LP → inscrits),
    **bottleneck principal**, hypothèses, et **franc-parler** quand le message
    n'est pas clair. Recommandations concrètes pour la semaine suivante.
- **`skill: prospect-finder`**
  - Lit l'ICP + hypothèses. Cherche des comptes (`search_users`,
    `get_user_context`), filtre les déjà-proposés (stockage).
  - Produit une liste de **20 à 50 prospects** : profil + lien, **score ICP /10
    + raison**, signaux détectés, pain point, **angle d'approche + DM suggéré**,
    follow-up éventuel. (IA suggère → tu envoies. Aucun envoi auto.)
  - Écrit les prospects proposés dans le stockage.
- **`skill: report-format`** (transverse) — le gabarit du rapport final : la
  structure, le ton "CMO", ce qui va dans le PDF.

---

## Bloc 5 — Automatisation + livraison

- **Génération du rapport PDF** : réunir GTM Review + Prospect Finder dans un
  document. (Choix technique : markdown → PDF, ou HTML → PDF.)
- **Envoi email** : service à choisir (Resend, un SMTP, Gmail API…).
- **Planification** : déclenchement automatique **chaque fin de week-end**
  (dimanche soir). Peut se faire via un agent programmé (routine cron) qui
  lance les deux skills puis génère et envoie le rapport.

Décisions à prendre : format PDF, service email.

---

## Ordre de travail recommandé

1. **Contexte business** (Bloc 1) — surtout `icp.md` : rien de sérieux n'est
   possible sans ça, et ça débloque le Prospect Finder tout de suite.
2. **Finir la V1 du X MCP** : `npm ci` + `build` + `auth` (déjà codé, jamais lancé).
3. **Stockage** (Bloc 3) : choisir SQLite/Sheet + définir les tables et clés.
4. **Skill prospect-finder** (le use case "super important") — livrable dès que
   1 + 2 + 3 sont là, même sans PostHog.
5. **Brancher PostHog + waitlist** (Bloc 2) pour compléter le funnel.
6. **Skill weekly-gtm-review** (a besoin du funnel complet + historique).
7. **PDF + email + planification** (Bloc 5) : la couche livraison.

> Le Prospect Finder peut tourner **avant** que tout le funnel soit branché : il
> ne dépend que de l'ICP + X MCP + stockage. On peut donc livrer de la valeur vite.

---

## Décisions déjà prises

- **Waitlist** : mesurée **via PostHog** (l'inscription est un event/pageview
  vu par PostHog). Pas de Google Sheets MCP. Funnel = 2 MCP seulement.
- **PostHog MCP** : ✅ branché et connecté (endpoint EU).
- **Stockage historique** : **SQLite** (fichier local).
- **Contexte business** : ce n'est **pas** qu'un `icp.md`. C'est un vrai brief
  CMO (produit, marché, positionnement, ICP, messaging, hypothèses, objectifs).
  À travailler ensemble comme un chantier à part entière, plus tard.

## Décisions encore en attente

- **LP analytics** : PostHog, ou autre chose ?
- **Service email** pour l'envoi du rapport.
- **Format PDF** : markdown→PDF ou HTML→PDF.
