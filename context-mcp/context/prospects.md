# Prospects sourcés

> Registre des personnes déjà sourcées sur X, pour ne jamais les reproposer.
> Clé unique = `user_id` (stable même si le @handle change).
> Statuts : `proposé` → `contacté` → `répondu` (ou `ignoré`).

## Comment l'utiliser (directive pour Hermes)

- **Avant de proposer** un prospect : lis ce fichier (`get_context`) et **exclus**
  tout `user_id` déjà présent.
- **Après avoir proposé** : ajoute une ligne par prospect (`write_context`, mode
  `append`), en respectant exactement le format du tableau ci-dessous.
- **Mise à jour de statut** : quand Jordi contacte / reçoit une réponse, mets à
  jour la ligne (mode `overwrite` en conservant tout le reste).

## Registre

| Date | Compte | user_id | Score ICP | Statut | Note / angle |
|------|--------|---------|-----------|--------|--------------|
| 2026-09-12 | @DavidPreti | 2008489840015536131 | 9.5/10 | proposé | Preuve forte de SaaS en production et de revenus. Hypothèse : la multiplication des produits crée une vraie douleur de maintenance email. |
| 2026-09-12 | @adileviim | 1911363351776550912 | 9.2/10 | proposé | Très bon fit d’usage, mais produit déjà mature : probable stack existante à remplacer ou compléter. |
| 2026-09-12 | @JitendraKohar34 | 1435877727530274817 | 9.0/10 | proposé | Signal revenu + essai SaaS explicite. Bon terrain pour un cas d’usage trial conversion. |
| 2026-09-12 | @FemiBuilds | 1440830611510362121 | 8.8/10 | proposé | Fit fonctionnel fort. Hypothèse : le multi-rôle complexifie déjà les emails transactionnels et lifecycle. |
| 2026-09-12 | @AsvdCodes | 1284973073553293313 | 8.6/10 | proposé | Preuve SaaS claire; besoin email déduit du workflow de réception d’appels. |
| 2026-09-12 | @gazinurulhasan2 | 1241631886734012417 | 8.3/10 | proposé | Très accessible. Le chiffre de MRR est auto-déclaré; à valider en conversation. |
| 2026-09-12 | @verdaxxed | 1293979443770396677 | 8.1/10 | proposé | Très bon angle conceptuel. Besoin email inféré du SaaS collaboratif, pas exprimé directement. |
| 2026-09-12 | @AhyunBuilds | 2064137969133633536 | 7.9/10 | proposé | Très joignable, mais stade précoce : budget et volume utilisateurs encore inconnus. |
| 2026-09-12 | @bologabriele | 1822818294954414081 | 7.7/10 | proposé | Fit technique fort; traction et revenus non prouvés. |
| 2026-09-12 | @NuzairNuwais | 849439244053622787 | 7.2/10 | proposé | Hypothèse plus faible : contenu récent orienté hardware. À contacter après les 9 premiers et qualifier immédiatement. |
