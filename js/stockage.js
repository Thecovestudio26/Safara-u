// Couche de persistance. Toutes les données restent dans le navigateur,
// via localStorage : l'application n'effectue aucune requête réseau et
// ne dépose aucun cookie. Voir CONFIDENTIALITE.md pour le détail.

const PREFIXE = "planner:";

export function lire(cle, defaut) {
  try {
    const brut = localStorage.getItem(PREFIXE + cle);
    return brut === null ? defaut : JSON.parse(brut);
  } catch (_e) {
    // Stockage indisponible (navigateur en mode strict, etc.) :
    // l'application continue de fonctionner, sans rien garder.
    return defaut;
  }
}

export function ecrire(cle, valeur) {
  try {
    localStorage.setItem(PREFIXE + cle, JSON.stringify(valeur));
  } catch (_e) {
    // Quota atteint ou écriture bloquée : rien de critique.
  }
}

// Regroupe tout ce qui appartient à l'application : sert au bouton
// « exporter mes données » (droit à la portabilité, RGPD).
export function toutExporter() {
  const donnees = {};
  for (let i = 0; i < localStorage.length; i++) {
    const cle = localStorage.key(i);
    if (cle === null || !cle.startsWith(PREFIXE)) continue;
    try {
      donnees[cle.slice(PREFIXE.length)] = JSON.parse(localStorage.getItem(cle) ?? "null");
    } catch (_e) {
      // clé illisible : on passe à la suivante
    }
  }
  return donnees;
}

// Restaure une sauvegarde JSON (export préalable). La structure est
// validée clé par clé : tout ce qui n'est pas reconnu est ignoré,
// jamais de suppression aveugle des données existantes.
// Renvoie le nombre de clés importées, ou -1 si le fichier est invalide.
export function restaurerSauvegarde(objet) {
  if (typeof objet !== "object" || objet === null || Array.isArray(objet)) return -1;
  const clesAutorisees = [
    "ville", "methode", "asr", "coran", "coran:journal", "evenements", "taches", "repas",
    "courses", "budget", "objectifs", "epargne", "journal", "recettes",
    "defis", "bilans", "sections", "hydratation-cible", "dhikr-perso",
  ];
  let compteur = 0;
  for (const [cle, valeur] of Object.entries(objet)) {
    if (!clesAutorisees.includes(cle)) continue;
    ecrire(cle, valeur);
    compteur++;
  }
  // Les clés quotidiennes (jour:AAAA-MM-JJ:xxx) sont restaurées aussi,
  // elles portent leur date dans leur nom.
  for (const cle of Object.keys(objet)) {
    if (!/^jour:\d{4}-\d{2}-\d{2}:[\w-]+$/.test(cle)) continue;
    if (cle.split(":").length !== 3) continue;
    ecrire(cle, objet[cle]);
    compteur++;
  }
  return compteur;
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
// date. On supprime celles des jours révolus pour ne pas encombrer le
// stockage au fil du temps — mais jamais les jours à venir.
export function nettoyerLesJoursPasses(aujourdhui) {
  const aVirer = [];
  for (let i = 0; i < localStorage.length; i++) {
    const cleBrute = localStorage.key(i);
    if (cleBrute && cleBrute.startsWith(PREFIXE + "jour:")) {
      // cleBrute = "planner:jour:AAAA-MM-JJ:suffixe"
      const segments = cleBrute.slice(PREFIXE.length).split(":");
      const dateConservee = segments[1];
      if (dateConservee !== undefined && dateConservee < aujourdhui) aVirer.push(cleBrute);
    }
  }
  for (const cle of aVirer) localStorage.removeItem(cle);
}
