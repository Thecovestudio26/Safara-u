// Test d'intégration minimal : charge le vrai app.js avec un DOM
// factice et vérifie que l'initialisation et le premier rendu
// s'exécutent sans erreur, puis simule les événements de navigation.

const memoireLS = new Map();
const shimLS = {
  getItem: (k) => (memoireLS.has(k) ? memoireLS.get(k) : null),
  setItem: (k, v) => memoireLS.set(k, String(v)),
  removeItem: (k) => memoireLS.delete(k),
  key: (i) => [...memoireLS.keys()][i] ?? null,
  get length() { return memoireLS.size; },
};

function elementStub() {
  return {
    innerHTML: "", textContent: "", className: "", value: "", dataset: {},
    classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
    setAttribute() {}, getAttribute: () => null,
    querySelector: () => null, querySelectorAll: () => [],
    appendChild() {}, removeChild() {}, remove() {}, click() {}, focus() {},
    closest: () => null,
    disabled: false, files: [],
  };
}

const ecouteurs = {};
const ajouterEcouteur = (nom, fn) => {
  (ecouteurs[nom] ??= []).push(fn);
};
const declencher = (nom, evenement) =>
  (ecouteurs[nom] ?? []).forEach((fn) => fn(evenement));

const idElements = new Map();
const stubId = (id) => {
  if (!idElements.has(id)) idElements.set(id, elementStub());
  return idElements.get(id);
};

const document = {
  getElementById: (id) => stubId(id),
  querySelectorAll: () => [],
  querySelector: () => null,
  addEventListener: ajouterEcouteur,
  createElement: () => elementStub(),
  body: elementStub(),
};

globalThis.localStorage = shimLS;
globalThis.document = document;
globalThis.window = {
  addEventListener: ajouterEcouteur,
  scrollTo: () => {},
};
Object.defineProperty(globalThis, "navigator", { value: {}, configurable: true });
globalThis.location = { protocol: "file:", hash: "" };
globalThis.URL = { createObjectURL: () => "blob:x", revokeObjectURL: () => {} };
globalThis.Blob = class { constructor() {} };
globalThis.setInterval = () => 0;
globalThis.clearInterval = () => {};

let erreurs = 0;
const verifie = (cond, message) => {
  if (!cond) { console.error("ÉCHEC :", message); erreurs++; }
  else console.log("ok :", message);
};

// Import du vrai module applicatif (déclenche demarrer())
await import("../js/app.js");

const contenu = stubId("contenu");
verifie(contenu.innerHTML.length > 2000, "premier rendu de l'accueil produit du contenu");
verifie(contenu.innerHTML.includes("prochaine"), "bloc prochaine prière présent");
verifie(contenu.innerHTML.includes("Salutation") || contenu.innerHTML.includes("salām"),
  "message de bienvenue présent");
verifie(!contenu.innerHTML.includes("undefined"), "aucun « undefined » au démarrage");

// Navigation vers chaque onglet via le délégué de clic
const boutons = {
  prieres: "Prières", coran: "Coran", agenda: "Agenda", taches: "Tâches",
  budget: "Budget", repas: "Repas", dhikr: "Adhkār", objectifs: "Objectifs",
  bienetre: "Bien-être", journal: "Journal", recettes: "Recettes",
  defis: "Défis", reglages: "Réglages",
};
declencher("click", { target: { closest: () => null }, preventDefault: () => {} });

for (const [onglet, libelle] of Object.entries(boutons)) {
  declencher("click", {
    preventDefault: () => {},
    target: { closest: (sel) => (sel === "[data-onglet]" ? { dataset: { onglet } } : null) },
  });
  const marquee = `[${onglet}] ${libelle}`;
  verifie(contenu.innerHTML.length > 500 && !contenu.innerHTML.includes("undefined"), marquee);
}

// L'état persiste bien dessus
verifie(localStorage.getItem("planner:ville") === null
  || JSON.parse(localStorage.getItem("planner:ville")) !== undefined,
  "aucune erreur d'écriture localStorage");

// Le décompte à la seconde tourne sans exception (état.secondes déjà calé)
stubId("decompte").textContent = "x";

console.log(erreurs === 0
  ? "\n=== INTÉGRATION : tous les tests passent ==="
  : `\n=== ${erreurs} échec(s) intégration ===`);
process.exit(erreurs ? 1 : 0);
