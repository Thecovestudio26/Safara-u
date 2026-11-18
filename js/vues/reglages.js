// Réglages : calcul des prières, contenu du tableau de bord,
// données (export, import, effacement), installation.

import { esc, sourtouLigne, bouton } from "../base.js";
import { villes, methodes, ecolesAsr } from "../horaires.js";
import { icone } from "../icone.js";

// Sections du tableau de bord, dans l'ordre d'affichage.
export const SECTIONS_DASHBOARD = [
  { cle: "coran", nom: "Lecture du Coran" },
  { cle: "taches", nom: "Tâches du jour" },
  { cle: "agenda", nom: "Rendez-vous à venir" },
  { cle: "habitudes", nom: "Habitudes" },
  { cle: "objectifs", nom: "Objectifs en cours" },
];

function champSelect({ identifiant, reglage, valeur, libelle, options }) {
  return `
    <div class="rangee-reglage">
      <label for="${identifiant}">${libelle}</label>
      <select class="champ champ-large" id="${identifiant}" data-reglage="${reglage}">
        ${options}
      </select>
    </div>`;
}

export function vueReglages(etat) {
  const optionsVilles = villes.map((v, i) =>
    `<option value="${i}"${i === etat.ville ? " selected" : ""}>${esc(v.nom)}</option>`).join("");
  const optionsMethodes = methodes.map((m) =>
    `<option value="${esc(m.id)}"${m.id === etat.methode ? " selected" : ""}>${esc(m.nom)} (Fajr ${m.fajr}° · Icha ${m.icha}°)</option>`).join("");
  const optionsAsr = ecolesAsr.map((e, i) =>
    `<option value="${i}"${i === etat.asr ? " selected" : ""}>${esc(e.nom)}</option>`).join("");

  return `
    <div class="entete-page">
      <p class="sourtou-ligne">L'atelier</p>
      <h2>Réglages</h2>
      <p>Ta ville, tes préférences, tes données : tout est entre tes mains</p>
    </div>

    <section class="carte">
      ${sourtouLigne("Horaires de prière")}
      ${champSelect({ identifiant: "reglage-ville", reglage: "ville", libelle: "Ville",
        options: optionsVilles })}
      <p class="texte-petit" style="margin:0.2rem 0 0.8rem">
        ${villes[etat.ville]
          ? `latitude ${villes[etat.ville].lat}°, longitude ${villes[etat.ville].lng}°`
          : ""}
      </p>

      ${champSelect({ identifiant: "reglage-methode", reglage: "methode", libelle: "Méthode de calcul",
        options: optionsMethodes })}
      ${champSelect({ identifiant: "reglage-asr", reglage: "asr", libelle: "École pour le 'Asr",
        options: optionsAsr })}
      <p class="texte-petit" style="margin:0.5rem 0 0">
        La méthode UOIF (12° / 12°) convient à la plupart des villes d'Europe.
        En cas de doute, demande à ta mosquée locale.
      </p>
    </section>

    <section class="carte">
      ${sourtouLigne("Tableau de bord")}
      <p class="texte-petit" style="margin:0.2rem 0 0.6rem">Choisis les blocs affichés sur l'accueil.</p>
      ${SECTIONS_DASHBOARD.map((s) => `
        <label class="ligne selectionnable" for="section-${s.cle}">
          <input type="checkbox" id="section-${s.cle}" data-reglage="section" value="${s.cle}"
            ${etat.sections.includes(s.cle) ? "checked" : ""}>
          <span class="principale"><b>${esc(s.nom)}</b></span>
        </label>`).join("")}
    </section>

    <section class="carte">
      ${sourtouLigne("Mes données")}
      <p class="texte-petit" style="margin:0.2rem 0 0.6rem">
        Tout est conservé uniquement sur cet appareil. La sauvegarde sert au
        changement de téléphone ou à la copie de sécurité.
      </p>
      <div class="rangee-boutons">
        ${bouton({ action: "exporter-donnees", texte: "Exporter mes données" })}
        <label class="bouton bouton-discret" for="import-fichier" style="margin:0">
          ${icone("importer", 15)} Restaurer une sauvegarde
        </label>
        <input type="file" id="import-fichier" accept="application/json,.json" hidden
          data-reglage="import">
      </div>
    </section>

    <section class="carte">
      ${sourtouLigne("Installer Safarau")}
      ${etat.installationPossible
        ? `<p class="texte-petit" style="margin:0.2rem 0 0.6rem">
            Ajoute l'application à ton écran d'accueil : elle s'ouvrira
            comme une vraie application et fonctionnera hors ligne.
          </p>
          ${bouton({ action: "installer-pwa", texte: "Installer l'application" })}`
        : `<p class="texte-petit" style="margin:0.2rem 0 0">
            ${etat.installationImpossibleRaison
              || "Depuis le navigateur : « Ajouter à l'écran d'accueil » (iOS) ou le menu d'installation (Android et ordinateur)."}
          </p>`}
    </section>

    <section class="carte danger-zone">
      ${sourtouLigne("Effacement définitif")}
      ${etat.confirmationEffacement ? `
        <p class="texte-alerte" style="margin:0.2rem 0 0.6rem">
          Toutes tes données (prières, journal, budget, recettes…) seront supprimées
          de cet appareil, sans possibilité de retour. Pense à exporter avant.
        </p>
        <div class="rangee-boutons">
          ${bouton({ action: "confirmer-effacement", style: "danger", texte: "Oui, tout effacer" })}
          ${bouton({ action: "annuler-effacement", style: "discret", texte: "Non, garder mes données" })}
        </div>`
        : bouton({ action: "demander-effacement", style: "danger", texte: "Effacer toutes mes données" })}
    </section>

    <section class="carte">
      ${sourtouLigne("À propos")}
      <p class="texte-petit" style="margin:0.2rem 0 0">
        Safarau Planner, The Cove Studio. Les horaires de prière sont calculés
        localement à titre indicatif : vérifie toujours auprès de ta mosquée.
        Aucune donnée ne quitte cet appareil. ${icone("bloquee", 12)}
      </p>
    </section>
  `;
}
