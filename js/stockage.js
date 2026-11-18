// Couche de persistance. Toutes les données restent dans le navigateur,
// via localStorage : l'application ne lance aucune requête réseau et
// ne dépose aucun cookie. Voir CONFIDENTIALITE.md pour le détail.

const PREFIXE = "planner:";

export function lire(cle, defaut) {
  try {
    const brut = localStorage.getItem(PREFIXE + cle);
    return brut === null ? defaut : JSON.parse(brut);
  } catch (_e) {
    // Stockage indisponible (mode privé strict, etc.) : l'appli
    // continue de fonctionner, simplement sans rien garder.
    return defaut;
  }
}

export function ecrire(cle, valeur) {
  try {
    localStorage.setItem(PREFIXE + cle, JSON.stringify(valeur));
  } catch (_e) {
    // Quota atteint ou écriture bloquée : on ignore, rien de critique.
  }
}

// Regroupe tout ce qui nous appartient, pour le bouton « exporter mes
// données » des réglages (droit à la portabilité, RGPD).
export function toutExporter() {
  const donnees = {};
  for (let i = 0; i < localStorage.length; i++) {
    const cle = localStorage.key(i);
    if (cle === null || !cle.startsWith(PREFIXE)) continue;
    try {
      donnees[cle.slice(PREFIXE.length)] = JSON.parse(localStorage.getItem(cle) ?? "null");
    } catch (_e) {
      // clé illisible : on passe simplement à la suivante
    }
  }
  return donnees;
}

// Effacement intégral (droit à l'effacement).
export function toutEffacer() {
  const aVirer = [];
  for (let i = 0; i < localStorage.length; i++) {
    const cle = localStorage.key(i);
    if (cle && cle.startsWith(PREFIXE)) aVirer.push(cle);
  }
  for (const cle of aVirer) localStorage.removeItem(cle);
}

// Les données du jour (prières, dhikr, routines) sont préfixées par la
// date. On supprime celles des jours passés pour ne pas encombrer le
// stockage au fil du temps.
export function nettoyerLesJoursPasses(aujourdhui) {
  const aVirer = [];
  for (let i = 0; i < localStorage.length; i++) {
    const cle = localStorage.key(i);
    if (cle && cle.startsWith(PREFIXE + "jour:")) {
      const morceaux = cle.split(":");
      if (morceaux.length < 3 || morceaux[1] !== aujourdhui) aVirer.push(cle);
    }
  }
  for (const cle of aVirer) localStorage.removeItem(cle);
}
