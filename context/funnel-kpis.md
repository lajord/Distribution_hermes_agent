# Stepers — Funnel & KPIs

> Dernière révision : 2026-09-12

## Le funnel

L'acquisition actuelle repose sur un funnel en trois étapes :

```
X (contenu)  →  Landing Page (trafic)  →  Waitlist (inscriptions)
```

- **X** : les posts génèrent de la visibilité (impressions, engagement) et
  amènent des gens à cliquer vers la landing page.
- **Landing Page (LP)** : les visiteurs découvrent Stepers et décident, ou non,
  de s'inscrire.
- **Waitlist** : le visiteur s'inscrit. C'est la conversion finale recherchée à
  ce stade.

## Sources de mesure

| Étape | Mesuré par | Statut |
|-------|-----------|--------|
| X | `x-analytics` MCP | ✅ (à build/auth) |
| LP (trafic) | PostHog MCP | ✅ branché |
| Waitlist (inscriptions) | PostHog (event/pageview d'inscription) | ✅ via PostHog |

## KPIs

Les deux KPIs qui comptent :

1. **Trafic sur la LP** — nombre de visites de la landing page (PostHog).
2. **Taux de conversion trafic → waitlist** — inscrits rapportés aux visiteurs
   de la LP (PostHog).

## Objectifs

**Objectif GTM unique : 100 inscrits sur la waitlist, le plus rapidement
possible — de l'ordre de quelques semaines, moins d'un mois.**

C'est le seul objectif GTM à ce stade.
