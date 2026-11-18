# Audit technique et UX — Safarau Planner v1

Document de travail, phase 1 de la refonte. Il décrit l'état de l'application
avant intervention, les problèmes identifiés et la conduite tenue pour chacun.

## 1. Structure auditée

- `index.html` — coquille unique, navigation par onglets
- `css/style.css` — feuille unique
- `js/horaires.js` — calcul des horaires de prière
- `js/stockage.js` — persistance `localStorage`
- `js/vues.js`, `js/app.js` — rendu et logique applicative

## 2. Diagnostic

### Identité visuelle
- Palette rose omniprésente, dégradés décoratifs, effets de transparence
  (`backdrop-filter` sans préfixe iOS) : rendu « template généré », pas
  de vraie direction artistique.
- Emojis utilisés comme icônes de navigation : incohérents visuellement,
  rendus différents selon la plateforme, mal exposés aux lecteurs d'écran.
- Aucun logo : marque absente de l'interface.

### Architecture / robustesse
- Pas de séparation vues / logique : tout le rendu est piloté depuis
  `app.js`/`vues.js`, difficile à maintenir ou tester.
- Aucun test automatisable (rendu monolithique au runtime navigateur).
- Bascule de minuit non gérée : les données « du jour » se bloquent sur la
  date de chargement de la page ; décompte de la prochaine prière faux
  après minuit.
- Méthode de calcul des horaires non paramétrable (une seule convention),
  pas d'école pour le 'Asr, ville figée en dur.

### Fonctionnalités incomplètes
- Agenda : liste plate d'événements, pas de calendrier mensuel, pas de
  vue semaine/jour, aucune édition ni suppression unitaire.
- Tâches : pas de catégories, pas de filtres, retards non signalés.
- Budget : figé sur le mois courant, pas de navigation entre mois, pas
  d'épargne ni de bilan.
- Repas/courses : pas de lien recettes → menu → liste de courses.
- Import de sauvegarde absent alors que l'export existe (asymétrie
  dangereuse : on peut exporter, pas restaurer).
- Adhkār : compteurs non réinitialisés par jour, pas de dhikr perso.
- Aucun module : objectifs, journal, recettes, défis, bien-être structuré.

### Confidentialité / installation
- Aucun PWA (manifest, service worker, icônes), donc pas installable.
- Document de confidentialité inexistant.

## 3. Décisions prises (et leur conduite)

| Problème | Décision |
| --- | --- |
| Emojis de navigation | Remplacés par un jeu d'icônes vectorielles maison (une grille unique, `js/icone.js`) |
| Look « template IA » | Design system complet : palette imposée (chocolat/ivoire/taupe/champagne), typographie serif éditoriale + sans-serif système, aucun dégradé |
| Logo absent | Marque typographique SVG dessinée (cercle + arc), déclinée en icônes PWA |
| Bascule minuit | Traitée dans `app.js` (tic/seconde, rechargement des clés du jour + nettoyage des jours révolus) |
| Horaires non réglables | 5 méthodes (MWL, UOIF, ISNA, Égypte, Karachi) + école du 'Asr, 22 villes |
| Agenda rudimentaire | Vues mois/semaine/jour, ajout, édition, suppression, tâches du jour |
| Budget figé | Navigation par mois, écritures datées, enveloppes d'épargne, bilan libre |
| Sauvegarde asymétrique | Import JSON avec allowlist (aucune clé inconnue acceptée) + tests |
| Pas de PWA | `manifest.webmanifest`, service worker versionné, icônes 192/512 + masquables |
| Aucun test | Suites Node : rendu, stockage, intégration (voir `tests/`) |

## 4. Ce qui a été conservé

Toutes les fonctionnalités de la v1 sont conservées, améliorées sur place :
horaires de prière (moteur `horaires.js` enrichi), suivi des cinq prières,
programme Coran 30 jours, export des données, clés `localStorage`
compatibles avec la v1 (aucune donnée utilisateur perdue à la mise à jour).
La suppression complète des données ne se fait que sur demande explicite,
en deux temps, depuis les Réglages.
