# Agent Hermes — Distribution de Stepers





Moi poiint de vue use cases je vois les choses ainsi
Quelque choses de simple dans un premier temps qui me ferait un rapport PDF avec toute la
data, un recap des follow, impression et toute les stats
Les posts qui ont le plus performer
Reconnaitre des patterns
Voir la progression de la waitlist comprendre ce qui fait que elle ce remplis ou pas
Les pains point de mon ICP
Les DM 
Sourcing etc etc








## 1. Vision

Construire un agent Hermes qui analyse, chaque fin de week-end, la distribution de Stepers et prépare la semaine suivante.

L’agent doit réunir les données de contenu, de trafic, de conversion et de prospection pour répondre à quatre questions :

1. Qu’est-ce qui a fonctionné cette semaine ?
2. Qu’est-ce qui a moins bien fonctionné, et pourquoi ?
3. Quel est le principal frein à la croissance de Stepers ?
4. Quelles actions concrètes mener la semaine suivante ?

Le périmètre repose sur trois cas d’usage : **Weekly GTM Review**, **DM Intelligence** et **Prospect Finder hebdomadaire**.

**Principe central : l’IA analyse et suggère ; le fondateur décide et envoie les DM.**

## 2. Fonctionnement hebdomadaire

- **Fréquence souhaitée :** chaque fin de week-end, avec les résultats disponibles pour préparer le lundi.
- **Période analysée :** une semaine, avec des dates de début et de fin explicites et un fuseau horaire commun aux sources.
- **Comparaison :** semaine précédente et, lorsque l’historique le permet, tendance sur plusieurs semaines.
- **Sources envisagées :** X, conversations privées X, PostHog et source de référence des inscriptions à la waitlist.
- **Analyse :** Hermes collecte et prépare les données ; Claude identifie les enseignements, les patterns et les actions possibles.
- **Livrable cible :** un rapport complet, idéalement en PDF, accompagné d’un email de synthèse et de la liste des prospects à contacter.

Le mode d’accès à chaque source reste à définir : API, export ou autre connexion autorisée. Les métriques attendues ci-dessous constituent des besoins, sans présumer qu’elles seront toutes accessibles automatiquement.

## 3. Cas d’usage n° 1 — Weekly GTM Review

### Objectif

Comprendre la performance de la distribution de la semaine et relier, lorsque les données le permettent, les contenus publiés sur X aux visites de la landing page et aux inscriptions à la waitlist.

### Données à récupérer

**Pour tous les posts X publiés pendant la période :**

- Identifiant, lien, date et heure de publication.
- Texte, format et éventuel appel à l’action.
- Catégorie du post : par exemple build in public, problème utilisateur, démonstration produit, retour d’expérience, opinion ou annonce. Cette grille est à adapter aux contenus réels.
- Impressions.
- Engagements disponibles : likes, réponses, reposts, citations, favoris et clics, selon les données accessibles.
- Visites de profil attribuées au post, si disponibles ; sinon, conserver la métrique au niveau du compte.
- Présence d’un lien vers Stepers et paramètres de suivi éventuels.

**Depuis PostHog et la source de la waitlist :**

- Visiteurs uniques et sessions sur la landing page, présentés séparément.
- Sources de trafic, référents et paramètres UTM disponibles.
- Nouveaux inscrits à la waitlist, avec déduplication.
- Événements utiles du parcours : visite LP, clic sur le CTA, début de formulaire et inscription confirmée, si instrumentés.
- Conversion de la landing page et évolution par rapport aux semaines précédentes.

### Analyse attendue

- Bilan des volumes et de leur évolution : publications, impressions, engagements, visites de profil, visites LP et inscriptions.
- Identification des posts et catégories qui ont le mieux et le moins bien fonctionné.
- Distinction entre les contenus qui génèrent de la visibilité, des conversations, du trafic et des inscriptions.
- Recherche de corrélations possibles entre publication d’un post, hausse du trafic et nouveaux inscrits.
- Formulation d’hypothèses expliquant les résultats, avec les éléments qui les soutiennent et les données manquantes.
- Identification du **bottleneck principal** : visibilité, intérêt, passage vers la LP ou conversion en inscription.
- Recommandations concrètes pour la semaine suivante.

### Règles de lecture des métriques

- **Taux d’engagement :** engagements retenus / impressions × 100. Le rapport précise les interactions incluses et garde la même définition dans le temps.
- **Conversion LP :** visiteurs uniques de la LP ayant réalisé une inscription confirmée / visiteurs uniques de la LP, sur une fenêtre d’observation définie. Le rapprochement doit être possible et les inscriptions dédupliquées.
- Si seuls les totaux hebdomadaires sont disponibles, présenter le ratio inscriptions / visiteurs comme un indicateur approximatif, en signalant les éventuelles différences de population ou de période.
- Comparer les posts à âge comparable lorsque possible : un post publié dimanche a eu moins de temps pour accumuler des résultats qu’un post publié lundi.
- Ne pas attribuer une inscription à un post sans élément de suivi suffisant. Une hausse après une publication constitue une corrélation possible, pas une preuve de causalité.
- Une donnée indisponible doit être indiquée comme manquante, jamais remplacée par zéro.

### Sortie attendue

1. Synthèse de la semaine.
2. Tableau des indicateurs et de leurs évolutions.
3. Posts et catégories les plus et les moins performants, selon l’objectif mesuré.
4. Ce qui a marché et ce qui n’a pas marché.
5. Corrélations possibles entre posts, trafic et inscriptions.
6. Hypothèses et niveau de confiance associé.
7. Bottleneck principal et justification.
8. Trois à cinq actions prioritaires, avec un résultat attendu et un indicateur de suivi.

## 4. Cas d’usage n° 2 — DM Intelligence

### Objectif

Analyser les DM de la semaine pour comprendre la qualité de la prospection, apprendre des échanges et détecter des patterns difficiles à voir conversation par conversation.

### Données à récupérer

- Conversations démarrées ou actives pendant la période, avec leur historique utile.
- Personnes contactées et lien vers leur profil X.
- Origine de la conversation : démarche sortante ou message entrant.
- Date du premier contact, réponses reçues et dernier échange.
- Messages échangés et contexte nécessaire à leur compréhension.
- Statut de la conversation : sans réponse, en cours, qualifiée, à relancer, close ou refus explicite.
- Informations permettant d’évaluer l’adéquation avec l’ICP de Stepers, lorsqu’elles sont connues.

### Indicateurs attendus

- Nombre de nouvelles conversations, en distinguant entrant et sortant.
- Nombre de personnes contactées, sans compter plusieurs fois une même personne.
- Taux de réponse aux prises de contact sortantes.
- Nombre et proportion de conversations réellement qualifiées.
- Nombre de founders contactés et nombre de profils correspondant à l’ICP, présentés séparément.
- Nombre de signaux d’intérêt pour Stepers.
- Nombre de personnes pertinentes à relancer.

**Définition proposée du taux de réponse :** personnes ayant répondu / personnes ayant reçu un premier message sortant dans la cohorte observée. Afficher le délai d’observation et distinguer les contacts trop récents pour conclure ; ne pas mélanger les réponses à d’anciennes conversations avec les nouvelles prises de contact.

**Définition proposée d’une conversation qualifiée :** échange avec un profil correspondant à l’ICP et apportant un signal concret sur un besoin, un problème ou un intérêt pertinent pour Stepers. Une réponse de politesse ne suffit pas. Les critères définitifs devront être adaptés à l’ICP.

### Analyse attendue par Claude

- Objections récurrentes.
- Problèmes et besoins qui reviennent dans plusieurs échanges.
- Mots et expressions réellement utilisés par les prospects.
- Signaux d’intérêt pour Stepers, en distinguant curiosité, problème reconnu et intention explicite de poursuivre.
- Angles d’approche qui semblent déclencher des réponses utiles.
- Raisons possibles des conversations qui stagnent.
- Différences entre segments de prospects.
- Patterns transversaux que le fondateur ne voit pas forcément au fil des conversations.

Chaque pattern doit être étayé par des exemples et le nombre de conversations concernées. Les citations doivent être fidèles aux messages ; les interprétations doivent être présentées comme telles.

### Sortie attendue

1. Bilan chiffré de la prospection et des conversations.
2. Principaux enseignements sur l’ICP, les besoins et les objections.
3. Extraits représentatifs du vocabulaire des prospects.
4. Conversations les plus prometteuses et raison de leur qualification.
5. Liste des personnes à relancer, avec contexte, motif et priorité.
6. Brouillons de follow-up personnalisés, à relire et envoyer manuellement.

### Limite d’automatisation

**IA suggère → le fondateur envoie.**

L’agent ne doit ni envoyer automatiquement des DM, ni déclencher des relances automatiques, ni lancer des campagnes massives. Un refus explicite doit exclure la personne des suggestions de relance.

## 5. Cas d’usage n° 3 — Prospect Finder hebdomadaire

### Objectif

Préparer chaque fin de semaine une liste de nouveaux profils X pertinents pour Stepers, afin de commencer le lundi avec des prospects déjà étudiés et des angles d’approche concrets.

### Volume cible

**20 à 50 nouveaux profils par semaine**, selon le nombre de profils réellement pertinents trouvés. Si moins de profils répondent aux critères, livrer une liste plus courte et expliquer pourquoi.

### Signaux à rechercher

- Correspondance avec l’ICP défini pour Stepers.
- Rôle, activité, contexte et stade du projet, lorsque ces informations sont publiques.
- Publications évoquant un problème auquel Stepers répond.
- Recherche d’une solution, questions, frustrations ou limites d’une méthode actuelle.
- Activité récente sur X et possibilité d’une approche contextualisée.
- Point de contact pertinent : post, discussion ou besoin exprimé.

### Fiche attendue pour chaque prospect

| Champ | Contenu attendu |
| --- | --- |
| Profil | Nom, handle et lien X |
| Contexte | Rôle, projet et informations pertinentes vérifiées |
| Score ICP | Note sur 10 |
| Justification | Raisons concrètes du score et informations manquantes |
| Signaux détectés | Observations, liens sources et dates |
| Sujet / pain point | Problème ou sujet pertinent pour engager la discussion |
| Angle d’approche | Pourquoi et comment commencer une conversation avec cette personne |
| DM suggéré | Brouillon court, personnalisé et fondé sur un élément réel |
| Follow-up éventuel | Proposition conditionnelle à adapter au contexte après le premier contact |
| Priorité | Ordre de contact recommandé |

### Grille de score proposée, à valider avec l’ICP

- **Adéquation du profil à la cible : 0 à 4 points.**
- **Pertinence du problème exprimé pour Stepers : 0 à 3 points.**
- **Signal d’intérêt ou de recherche d’une solution : 0 à 2 points.**
- **Actualité du signal : 0 à 1 point.**

Le score total est sur 10. Il s’appuie sur des éléments observables et ne représente pas une probabilité de conversion. Une information inconnue doit être signalée, sans inventer de besoin ou d’intention.

### Règles de sélection

- Dédupliquer la liste avec les prospects déjà proposés et les personnes déjà contactées.
- Traiter les contacts existants à relancer dans DM Intelligence.
- Justifier chaque qualification par des sources vérifiables.
- Ne pas considérer le nombre d’abonnés comme une preuve d’adéquation à l’ICP.
- Ne pas inventer une familiarité, un échange passé ou un intérêt pour Stepers dans les messages suggérés.
- Laisser tous les messages au stade de brouillon pour envoi manuel.

### Sortie attendue

Une liste priorisée de 20 à 50 prospects qualifiés lorsque les résultats le permettent, accompagnée d’une synthèse des segments et problèmes repérés.

## 6. Rapport hebdomadaire consolidé

### Structure proposée du PDF

1. **Synthèse exécutive :** faits marquants, apprentissage principal et bottleneck.
2. **Weekly GTM Review :** performances X, trafic LP, waitlist et conversion.
3. **DM Intelligence :** qualité des échanges, objections, vocabulaire et relances proposées.
4. **Prospect Finder :** liste priorisée et fiches des nouveaux profils.
5. **Lecture croisée :** liens possibles entre contenus performants, problèmes exprimés en DM et segments à prospecter.
6. **Plan de la semaine suivante :** trois à cinq actions classées par priorité.
7. **Annexes :** sources, période analysée, définitions des métriques et limites des données.

### Email de synthèse envisagé

- Objet : « Stepers — Rapport distribution — semaine du [date] au [date] ».
- Quelques chiffres clés et enseignements.
- Bottleneck principal.
- Actions prioritaires pour la semaine suivante.
- PDF joint ou lien vers le rapport complet et la liste des prospects.

Le destinataire, le canal d’envoi et l’horaire seront définis lors de la mise en place de l’agent.

## 7. Informations à définir avant l’implémentation

- Proposition de valeur de Stepers et problèmes que le produit résout.
- Définition de l’ICP : rôles, types de projets, stade, langue et exclusions éventuelles.
- Comptes X à analyser et accès disponibles aux statistiques et aux DM.
- Projet PostHog, URL de la landing page et événements déjà instrumentés.
- Source de référence des inscriptions confirmées à la waitlist.
- Catégories de posts à utiliser.
- Historique des prospects et des prises de contact pour éviter les doublons.
- Jour et heure d’exécution, fuseau horaire et heure de clôture de la période analysée.
- Emplacement des rapports et destinataire de l’email.
- Données de DM à conserver et niveau de détail à inclure dans le PDF.

## 8. Critères de réussite

- Le rapport couvre les trois cas d’usage chaque semaine et signale toute source indisponible.
- Les chiffres sont traçables et comparés sur des bases cohérentes.
- Les observations, hypothèses et recommandations sont clairement distinguées.
- Les analyses font ressortir des apprentissages utiles, au-delà d’une simple liste de statistiques.
- Le bottleneck est justifié ; si les données ne permettent pas de trancher, cette incertitude est explicite.
- Les actions proposées sont concrètes, priorisées et mesurables.
- Les prospects sont nouveaux, sourcés et qualifiés selon une grille explicite.
- Les DM et follow-ups restent des suggestions à envoyer manuellement.
- Le lundi, le fondateur dispose d’un bilan exploitable et d’un plan d’action pour sa distribution.
