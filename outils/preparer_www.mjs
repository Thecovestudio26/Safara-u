#!/usr/bin/env node
/**
 * Safarau Planner : préparation du dossier web pour Capacitor.
 *
 * Capacitor embarque les fichiers web depuis un seul dossier (webDir: "www",
 * voir capacitor.config.json). Ce script recopie l'application statique
 * (coquille, styles, scripts, icônes, manifest, service worker) dans www/
 * tel quel, sans transformation : rien n'est compilé, l'app est déjà
 * 100 % statique.
 *
 * Usage : npm run web   (ou : node outils/preparer_www.mjs)
 */
import { cpSync, rmSync, mkdirSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");
const cible = join(racine, "www");

/** Fichiers et dossiers copiés tels quels dans www/ */
const elements = [
  "index.html",
  "manifest.webmanifest",
  "sw.js",
  "css",
  "js",
  "img",
];

if (!existsSync(join(racine, "index.html"))) {
  console.error("index.html introuvable : lancez ce script depuis la racine du dépôt.");
  process.exit(1);
}

rmSync(cible, { recursive: true, force: true });
mkdirSync(cible, { recursive: true });

function taille(chemin) {
  if (statSync(chemin).isDirectory()) {
    return readdirSync(chemin).reduce((total, entree) => total + taille(join(chemin, entree)), 0);
  }
  return statSync(chemin).size;
}

let octets = 0;
for (const element of elements) {
  const source = join(racine, element);
  if (!existsSync(source)) {
    console.warn("  ignoré (absent) : " + element);
    continue;
  }
  cpSync(source, join(cible, element), { recursive: true });
  octets += taille(source);
  console.log("  copié : " + element);
}

console.log("www/ prêt pour Capacitor (" + elements.length + " entrées, "
  + Math.round(octets / 1024) + " Ko).");
console.log("Étape suivante : npx cap add android   (ou : npx cap add ios)");
