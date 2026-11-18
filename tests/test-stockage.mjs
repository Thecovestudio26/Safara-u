// Test de stockage.js avec un shim localStorage.

const memoire = new Map();
globalThis.localStorage = {
  getItem: (k) => (memoire.has(k) ? memoire.get(k) : null),
  setItem: (k, v) => memoire.set(k, String(v)),
  removeItem: (k) => memoire.delete(k),
  key: (i) => [...memoire.keys()][i],
  get length() { return memoire.size; },
};

const { lire, ecrire, toutExporter, toutEffacer, restaurerSauvegarde, nettoyerLesJoursPasses } =
  await import("../js/stockage.js");

let erreurs = 0;
const verifie = (cond, message) => {
  if (!cond) { console.error("ÉCHEC :", message); erreurs++; }
};

// Écriture / lecture
ecrire("ville", 3);
verifie(lire("ville", 0) === 3, "lire/ecrire ville");

// Valeurs inaccessibles → défaut
memoire.set("planner:corrupt", "{invalide");
verifie(lire("corrupt", "défaut") === "défaut", "JSON invalide renvoie le défaut");

// Export
ecrire("taches", [{ id: "a", texte: "x", fait: false }]);
ecrire("jour:2026-11-19:prieres", { fajr: true });
const export1 = toutExporter();
verifie(export1.ville === 3, "export contient la ville");
verifie(export1["jour:2026-11-19:prieres"].fajr === true, "export contient le jour");
verifie(!("corrupt" in export1), "clé corrompue ignorée à l'export");
verifie(Object.keys(export1).every((k) => k.startsWith("planner:") === false),
  "clés exportées débarrassées du préfixe");

// Restauration : allowlist
const nb = restaurerSauvegarde({
  ville: 7,
  taches: [{ id: "b", texte: "y", fait: true }],
  "coran:journal": ["2026-11-18"],
  "jour:2026-11-20:prieres": { fajr: false },
  "jour:2026-11-19:dhikr": { subhanallah: 4 },
  cleInconnue: "à ignorer",
  "jour:mal:formé": { x: 1 },
});
verifie(lire("ville", 0) === 7, "restauration ville");
verifie(lire("taches", [])[0].id === "b", "restauration taches");
verifie(lire("coran:journal", []).includes("2026-11-18"), "restauration coran:journal (allowlist)");
verifie(lire("jour:2026-11-20:prieres", null) !== null, "restauration jour futur");
verifie(lire("jour:2026-11-19:dhikr", null) !== null, "restauration dhikr du jour");
verifie(nb >= 5, "compteur de clés restaurées cohérent");
verifie(lire("cleInconnue", null) === null, "clé non autorisée ignorée");
verifie(lire("jour:mal:formé", null) === null, "clé de jour mal formée ignorée");

// Restaurer un fichier invalide ne casse rien
verifie(restaurerSauvegarde(null) === -1, "restauration null refusée");
verifie(restaurerSauvegarde([1, 2]) === -1, "restauration tableau refusée");

// Nettoyage des jours passés
ecrire("jour:2026-11-17:prieres", { fajr: true });
ecrire("jour:2026-11-18:dhikr", { x: 1 });
ecrire("jour:2026-11-19:routines", { eau: 2 });
ecrire("jour:2026-11-21:prieres", { fajr: true }); // jour à venir : garder
nettoyerLesJoursPasses("2026-11-19");
verifie(lire("jour:2026-11-17:prieres", null) === null, "jour ancien supprimé");
verifie(lire("jour:2026-11-18:dhikr", null) === null, "jour veille supprimé");
verifie(lire("jour:2026-11-19:routines", null) !== null, "jour courant conservé");
verifie(lire("jour:2026-11-21:prieres", null) !== null, "jour futur conservé");

// Effacement complet : uniquement le préfixe planner:
ecrire("ville", 1);
memoire.set("autre-app:valeur", "42");
toutEffacer();
verifie(lire("ville", "absent") === "absent", "toutEffacer vide les clés planner");
verifie(memoire.get("autre-app:valeur") === "42", "les clés hors préfixe sont intactes");

console.log(erreurs === 0
  ? "=== STOCKAGE : tous les tests passent ==="
  : `=== ${erreurs} échec(s) stockage ===`);
process.exit(erreurs ? 1 : 0);
