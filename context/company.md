# Stepers — Le business

> Dernière révision : 2026-09-12

**Stepers** est un SaaS d'emailing conçu spécifiquement pour les **SaaS founders**.

Le produit couvre principalement deux catégories d'emails :

- les **emails lifecycle** : onboarding, activation, trial, inactivité, réactivation, churn, failed payment, etc.
- les **emails transactionnels** : reset password, confirmation, notifications produit, etc.

L'objectif de Stepers n'est pas simplement d'envoyer des emails. Il est de donner au founder **un endroit unique pour structurer, envoyer, comprendre et améliorer tout le système email de son SaaS**.

Aujourd'hui, beaucoup de SaaS assemblent cette couche avec du code, Resend/Postmark/SES, des cron jobs, des events dispersés et différentes logiques métier. Cela fonctionne techniquement, mais devient vite difficile à visualiser, maintenir et optimiser.

Stepers veut supprimer cette complexité.

## Proposition de valeur

Le principe historique du produit reste :

**Se concentrer sur le "quoi" plutôt que sur le "comment".**

Le founder devrait pouvoir réfléchir à :

- Quel email dois-je envoyer ?
- À quel utilisateur ?
- À quel moment ?
- Quelle séquence dois-je construire ?
- Qu'est-ce qui fonctionne ?
- Qu'est-ce que je dois améliorer ?

… plutôt que de perdre du temps sur :

- comment connecter les events ;
- où placer la logique dans le code ;
- comment gérer les cron jobs ;
- comment construire le workflow ;
- comment suivre les performances ;
- comment maintenir tout le système dans le temps.

C'était déjà le cœur de Sparkly avant son renommage en Stepers.

## Produit

Stepers tend actuellement vers une architecture où les emails deviennent des objets visibles et réutilisables dans le produit.

Un email peut être créé et géré dans Stepers puis utilisé :

- dans un **workflow** ;
- directement via **API** pour du transactionnel.

Les workflows permettent ensuite de construire les automatisations lifecycle autour des events du SaaS.

La philosophie importante est que **rien d'important ne doit vivre uniquement "en sous-marin" dans le code** : le founder doit pouvoir voir ses emails, ses automatisations, pourquoi ils partent et comment ils performent.

L'agent IA est une composante centrale de la vision produit. À terme, il doit comprendre le contexte du SaaS et aider à :

- créer les emails ;
- créer ou modifier les workflows ;
- analyser les performances ;
- identifier les emails manquants ;
- proposer des optimisations.

L'IA n'est donc pas seulement un générateur de copy : l'objectif est qu'elle agisse comme une couche d'intelligence au-dessus du système email.

## Positionnement

Stepers se positionne principalement comme une alternative plus simple et plus accessible à des outils comme :

**Loops, Customer.io, Userlist, Encharge**, ainsi qu'à une approche plus technique basée sur **Resend/Postmark + logique maison**.

Les concurrents directs/adjacents déjà identifiés incluent également Dreamlit AI, Brew et Sequenzy.

Le positionnement recherché n'est pas :

> "un Mailchimp pour tout le monde"

ni :

> "un simple outil d'envoi d'emails".

Stepers est construit autour des **besoins spécifiques d'un SaaS et de ses événements produit**.

Le produit doit être suffisamment simple pour qu'un founder ou un profil non technique puisse comprendre et gérer la logique, tout en donnant suffisamment de profondeur à un développeur lorsqu'il veut aller plus loin.

## Principe important

> Directive pour Hermes.

Le positionnement actuel ne doit pas être considéré comme définitivement validé.

Hermes doit utiliser :

- les discussions avec des founders ;
- les DM ;
- les calls ;
- les objections ;
- les performances des contenus ;
- les inscriptions ;
- les comportements utilisateurs ;

pour confirmer, invalider ou faire évoluer ces hypothèses.

L'objectif n'est pas de défendre le positionnement actuel, mais de trouver progressivement le problème et la proposition de valeur qui résonnent le plus fortement auprès de l'ICP.

## Résultat recherché pour le client

Stepers doit permettre à un SaaS de transformer ses événements produit en communications pertinentes afin d'améliorer notamment :

- l'activation ;
- la conversion trial → paid ;
- la rétention ;
- la réactivation ;
- le churn ;
- plus globalement le revenu généré par les utilisateurs déjà acquis.

La vision est donc plus large que "envoyer des emails" :

**Stepers devient la couche qui relie les événements du produit à la stratégie email du SaaS.**
