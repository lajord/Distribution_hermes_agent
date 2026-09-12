---
name: weekly-content-review
description: Génère un rapport d'analyse simple, rapide et facile à lire des performances de création de contenu sur X et de leur impact sur le funnel LP → Waitlist, sur une période donnée (par défaut la dernière semaine, ou plusieurs semaines si Jordi le précise). Prisme central de tout le rapport : "Qu'est-ce que je dois faire pour remplir ma waitlist davantage ?". À utiliser quand Jordi demande un bilan de contenu, un rapport hebdo, une analyse de ses performances X ou du funnel.
---

# Weekly Content Review — Bilan contenu & KPIs

## Objectif

Produire un **rapport court, clair et actionnable** qui répond à une seule question :

> **Qu'est-ce que Jordi doit faire pour augmenter les inscriptions à la waitlist ?**

Le levier d'entrée est le **contenu X** ; le résultat visé est le **trafic LP** et surtout le **taux de conversion trafic → inscription waitlist**. Tout le rapport sert ce prisme.

## Avant de commencer

1. **Lis le contexte** via le MCP `context` :
   - `list_context`, puis `get_context` sur `directive.md`, `funnel-kpis.md`, `icp.md`, `hypotheses.md` (et `company.md` si besoin).
   - Tu y trouves : les 2 KPIs (trafic LP + conversion), l'objectif (100 inscrits < 1 mois), l'ICP, les hypothèses en cours et les règles de travail.
2. **Détermine la période** :
   - Défaut : les **7 derniers jours** (fin = aujourd'hui).
   - Si Jordi précise (« sur 3 semaines », « depuis le 1er », « ce mois-ci »), utilise sa période.
   - Prépare aussi la **période précédente équivalente** pour comparer (N vs N-1).
3. **Lis le rapport de la semaine précédente** s'il existe (dossier `reports/`) :
   - Récupère sa **stratégie / ses recommandations** pour pouvoir vérifier si elles
     ont été appliquées cette semaine et avec quel effet.
   - S'il n'y en a pas (première fois), note-le et saute la partie « suivi des
     recommandations ».

## Collecte des données

### X (via `x-analytics`)
- `get_posts` sur la période : texte, dates, impressions, engagement (likes, reposts, réponses, citations, bookmarks), et — pour les posts récents du compte — **clics sur lien** et **visites de profil** (métriques privées).
- `get_account_stats` : followers actuels.
- Fais de même sur la période précédente pour la comparaison.

### LP + Waitlist (via `posthog`)
- **Trafic LP** sur la période (visites, sources de trafic).
- **Inscriptions waitlist** sur la période.
- **Taux de conversion** trafic → inscription.
- Même chose sur la période précédente.

## Analyse

1. **Comprendre ce que Jordi a fait** : catégorise les posts par **thème**, **format** (thread, one-liner, build-in-public, question, etc.) et **angle**. Compte le volume.
2. **Repérer les patterns** : quels thèmes / formats / angles ont généré le plus d'impressions → clics → visites LP → inscriptions ?
3. **Corréler X → LP → Waitlist** : rapproche les pics de trafic LP et d'inscriptions des posts publiés. 
   - ⚠️ **Corrélation ≠ causalité.** Présente ces liens comme des **hypothèses**, jamais comme des certitudes (règle `directive.md` : distinguer faits et hypothèses).
4. **Confronter aux hypothèses existantes** (`hypotheses.md`) : est-ce qu'un signal confirme, infirme ou fait évoluer une hypothèse ?
5. **Suivi du rapport précédent** : compare ce que Jordi a fait cette semaine à la stratégie recommandée la semaine dernière. A-t-il appliqué les recos ? Avec quel effet sur les KPIs ? Dis-le franchement.

## Le rapport (format imposé : simple et rapide à lire)

**Génère un vrai rapport** (document lisible), pas juste une réponse en vrac.

**Illustre ce que tu dis.** Chaque affirmation importante doit être appuyée :
par un chiffre, un exemple concret (post cité), ou un **graphique quand c'est
possible et pertinent** (évolution du trafic LP, des inscriptions, du taux de
conversion, comparaison N vs N-1, top posts…). N'ajoute pas de visuel décoratif :
un graphique seulement s'il rend une idée plus claire ou plus rapide à saisir.
Si tu ne peux pas produire de vrai graphique, utilise une visualisation simple
en texte (mini-tableau, barres ASCII) plutôt que rien.

Structure exacte, dans cet ordre, court et scannable :

### 1. Bilan de la semaine (simple)
Ouverture courte et claire, pour voir d'un coup d'œil la semaine :
- **TL;DR** (3-5 lignes) : chiffres clés + conclusion principale.
- **Ce que Jordi a fait cette semaine** : volume de posts, thèmes/formats principaux.
- **Résultats vs semaine dernière** : les KPIs en bref (↑/↓/=).
- **Suivi des recommandations précédentes** : est-ce que Jordi a appliqué la
  stratégie du dernier rapport ? Si oui, quel effet ? Si non, dis-le franchement.
  (Sauter cette ligne s'il n'y a pas de rapport précédent.)

### 2. Les KPIs
Tableau simple, période vs période précédente :
- Trafic LP
- Inscriptions waitlist
- Taux de conversion trafic → waitlist
- (Contexte : impressions X, followers)
Indique la tendance (↑/↓/=) et où on en est vs l'objectif **100 inscrits**.

### 3. Ce qui a marché / ce qui n'a pas marché
- Top posts (et **pourquoi** ils ont marché, hypothèse).
- Posts faibles (et hypothèse sur le pourquoi).
- Patterns de thèmes / formats / angles.

### 4. Corrélation avec le funnel
Ce que le contenu semble avoir produit côté LP et inscriptions — en **hypothèses prudentes**.

### 5. Ce que je te dis franchement
1 à 3 points directs : ce qui n'est pas clair, ce qui n'avance pas, un angle que Jordi ne voit peut-être pas. Sans complaisance (rôle CMO / associé).

### 6. Stratégie de la semaine (paragraphe simple, SANS graphique)
La fin du rapport, en **texte clair** — pas de tableau ni de graphique ici, juste
ton analyse de CMO. Explique la stratégie que tu recommandes, en te basant sur ce
que le **volume** a révélé :
- **Ce qui fonctionne → on en fait PLUS** : si un thème/format/angle a marché,
  dis-le clairement et recommande d'en faire davantage la semaine suivante **pour
  valider l'hypothèse** (un truc marche → on le confirme la semaine d'après).
- **Ce qui ne fonctionne pas → on change** : abandonne, ou teste autre chose.
- **Propose du neuf** : des **idées de posts concrètes**, des angles créatifs, des
  formats à tester. Ose sortir des sentiers battus.
- Termine par **la stratégie recommandée pour cette semaine**, en un paragraphe
  simple, direct et motivant, qui tienne dans le temps de Jordi (~2h matin + 2h soir).

## Style

- **Straight to the point.** Simple, rapide à lire, zéro blabla. Pas de jargon inutile.
- **Faits vs hypothèses** toujours distingués.
- **Honnête** : si la data est insuffisante ou incertaine (ex. métriques privées seulement sur posts récents, couverture timeline limitée), dis-le au lieu d'inventer.
- Chiffres arrondis et lisibles.

## Après le rapport

1. **Sauvegarde le rapport** dans `reports/AAAA-MM-JJ-weekly-content-review/`
   (avec les données brutes utilisées). C'est indispensable : la semaine suivante
   relira ce rapport pour vérifier le **suivi des recommandations**.
2. Propose à Jordi de **consigner les apprentissages** dans `hypotheses.md` via
   `write_context` (mode append) : nouvelle hypothèse, ou data/preuve rattachée à
   une hypothèse existante. Ne le fais qu'après son accord, en suivant les règles
   de `directive.md`.
