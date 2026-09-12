# Stepers — ICP

> Dernière révision : 2026-09-12

## Buyer principal

Le **buyer principal est le SaaS founder**.

C'est un point important : le développeur ou le marketeur peut utiliser Stepers au quotidien, mais ce n'est pas nécessairement lui que le positionnement et l'acquisition cherchent à convaincre en premier.

Historiquement, l'ICP était déjà défini ainsi : le SaaS founder achète Stepers, tandis qu'un développeur, un marketeur ou les deux peuvent ensuite l'utiliser.

## SaaS ciblé

La priorité actuelle est un founder qui possède déjà un SaaS suffisamment avancé pour que les problématiques suivantes commencent à devenir importantes :

- il a déjà des utilisateurs ou du trafic ;
- idéalement, il commence déjà à générer du revenu ;
- il possède plusieurs moments importants dans son lifecycle utilisateur ;
- il doit envoyer des emails transactionnels ou comportementaux ;
- il commence à avoir besoin de structurer ce système plutôt que d'ajouter des appels API au cas par cas.

Ce n'est donc pas prioritairement quelqu'un qui vient juste d'avoir une idée de SaaS sans utilisateurs.

La cible est plutôt le founder qui commence à se demander :

**"J'ai déjà des utilisateurs qui entrent dans mon produit. Comment est-ce que je les active, les convertis et les fais revenir ?"**

## Profil typique

Exemple représentatif :

Un founder possède un SaaS qui génère déjà du trafic et éventuellement ses premiers revenus.

Il utilise aujourd'hui Resend, Postmark, SES ou une infrastructure similaire.

Ses emails sont progressivement répartis dans son code :

- email de bienvenue ;
- reset password ;
- trial ending ;
- utilisateur inactif ;
- failed payment ;
- onboarding ;
- différents cron jobs et conditions.

Au début cela fonctionne.

Puis il veut ajouter de nouvelles séquences, comprendre les performances, modifier les emails rapidement ou déléguer cette partie.

Il réalise alors que son système est techniquement fonctionnel mais difficile à gérer et à optimiser.

**C'est à ce moment que Stepers devient particulièrement pertinent.**

## Problèmes de l'ICP

Les problèmes importants ne sont donc pas uniquement "je veux envoyer un email".

Ils sont plutôt :

- mon activation est faible ;
- certains utilisateurs n'atteignent jamais l'aha moment ;
- mes trials ne convertissent pas assez ;
- mes utilisateurs deviennent inactifs et je ne fais rien ;
- mes emails sont dispersés dans mon code ;
- je ne sais pas réellement quels emails fonctionnent ;
- modifier ma stratégie email demande du développement ;
- je n'ai aucune vue globale de mon lifecycle ;
- je sais que je devrais faire davantage d'emails comportementaux mais je repousse leur implémentation à cause de la complexité.

## Ce que l'ICP n'est pas

Stepers n'est pas prioritairement destiné :

- aux e-commerces ;
- aux créateurs/newsletters ;
- aux entreprises cherchant principalement du cold email ;
- aux marketeurs généralistes sans contexte SaaS ;
- aux développeurs cherchant uniquement une API d'envoi extrêmement bas niveau.

Le produit peut être utilisé par un développeur ou un marketeur, mais **le problème auquel Stepers répond est celui du founder qui veut que le système email de son SaaS contribue réellement au produit et au revenu sans devenir une infrastructure à maintenir.**

## Résumé ICP en une phrase

**SaaS founder ayant déjà des utilisateurs et idéalement du revenu, qui utilise ou doit mettre en place des emails lifecycle et transactionnels et veut transformer une infrastructure dispersée et technique en un système centralisé, visible et optimisable.**
