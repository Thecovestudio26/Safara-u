// Service worker Safarau Planner : préchargement complet de
// l'application pour un fonctionnement hors ligne. Le cache ne
// contient que les fichiers de l'app, jamais les données saisies
// (celles-ci vivent dans localStorage, sur l'appareil uniquement).

const VERSION = "safarau-1.0.0";
const NOM_CACHE = "safarau-" + VERSION;

const RESSOURCES = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/app.js",
  "./js/base.js",
  "./js/horaires.js",
  "./js/icone.js",
  "./js/stockage.js",
  "./js/vues/accueil.js",
  "./js/vues/prieres.js",
  "./js/vues/coran.js",
  "./js/vues/agenda.js",
  "./js/vues/taches.js",
  "./js/vues/repas.js",
  "./js/vues/budget.js",
  "./js/vues/dhikr.js",
  "./js/vues/objectifs.js",
  "./js/vues/bienetre.js",
  "./js/vues/journal.js",
  "./js/vues/recettes.js",
  "./js/vues/defis.js",
  "./js/vues/reglages.js",
  "./manifest.webmanifest",
  "./img/icone.svg",
  "./img/icone-192.png",
  "./img/icone-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(NOM_CACHE).then((cache) =>
      // Mise en cache fichier par fichier : une ressource manquante
      // (ex. icône PNG pas encore générée) ne casse pas l'installation.
      Promise.allSettled(RESSOURCES.map((r) => cache.add(r)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((noms) => Promise.all(
        noms.filter((n) => n.startsWith("safarau-") && n !== NOM_CACHE)
          .map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

// Cache d'abord, réseau ensuite (l'app est pensée hors ligne en
// priorité ; une nouvelle version est récupérée au rechargement).
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then((reponse) => {
      if (reponse) return reponse;
      return fetch(e.request).catch(() => {
        // Navigation hors ligne vers la page en cache.
        if (e.request.mode === "navigate") return caches.match("./index.html");
      });
    })
  );
});
