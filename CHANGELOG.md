# Journal des versions

## 1.0.0 — refonte « premium » (novembre 2026)

Révision complète de l'application : identité visuelle, architecture,
fonctionnalités, mode hors ligne et jeux de tests.

### Identité
- Nouvelle direction artistique « quiet luxury » : chocolat #49352F,
  ivoire #F8F5EF, taupe #A69788, champagne #B69A72 ; aucun dégradé,
  aucune icône emoji, aucun effet de verre.
- Marque typographique SVG (cercle + arc), déclinée en icônes PWA
  (192, 512, masquables).
- Icônes vectorielles maison sur grille 24 unique (`js/icone.js`).

### Architecture
- Vues séparées par module (`js/vues/`), orchestrateur unique (`js/app.js`),
  briques partagées (`js/base.js`).
- Bascule de minuit gérée : rechargement automatique des données du jour.
- Compteur de la prochaine prière actualisé chaque seconde, sans re-rendu.

### Fonctionnalités
- **Prières** : 22 villes, 5 méthodes de calcul, école du 'Asr réglable.
- **Coran** : programme 30 jours avec limites usuelles des juz, historique.
- **Agenda** : vues mois / semaine / jour, événements créables, modifiables,
  supprimables ; tâches à échéance affichées sur leur journée.
- **Tâches** : priorités, catégories, échéances, retards, filtres.
- **Repas & courses** : menu de la semaine, liste interactive, liens
  recettes → menu / ingrédients → courses.
- **Budget** : navigation par mois, écritures datées, répartition visuelle,
  enveloppes d'épargne, bilan mensuel libre.
- **Adhkār** : 6 compteurs journaliers (remis à zéro chaque nuit) +
  dhikr personnels avec objectif.
- **Nouveaux modules** : objectifs, bien-être (hydratation, habitudes),
  journal avec gratitude, recettes, défis 7/21/30 jours.
- **Réglages** : contenu du tableau de bord personnalisable, export JSON,
  restauration, effacement en deux temps, installation PWA.

### Hors ligne et respect de la vie privée
- PWA installable : `manifest.webmanifest`, service worker versionné,
  mode hors ligne complet, icônes adaptatives.
- Aucune requête réseau, aucun cookie, aucun traceur ; données 100 %
  locales. Document `CONFIDENTIALITE.md` ajouté.

### Qualité
- Suites de tests Node ajoutées (`tests/`) : rendu des 14 vues (états
  remplis, vides, édition), stockage (export/import/effacement/nettoyage),
  intégration (démarrage + navigation).
- Compatibilité des clés `localStorage` avec la v1 : aucune donnée perdue
  lors de la mise à jour.
