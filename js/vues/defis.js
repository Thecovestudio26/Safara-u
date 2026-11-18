// Défis de 7, 21 ou 30 jours : un jour coché par jour, pas de
// rattrapage possible, pour que la chaîne reste honnête.

import { esc, sourtouLigne, videHTML, barreHTML, dateISO } from "../base.js";
import { icone } from "../icone.js";

const DUREES = [7, 21, 30];

function grilleDefi(defi) {
  const faits = defi.jours?.length ?? 0;
  return `
    <div class="grille-defi">
      ${Array.from({ length: defi.duree }, (_, i) => {
        const coche = i < faits;
        const actif = i === faits && faits < defi.duree;
        return `
        <button type="button" class="case-defi${coche ? " coche" : ""}"
          aria-pressed="${coche}" ${actif ? `data-action="cocher-jour-defi" data-id="${defi.id}"` : 'disabled=""'}
          aria-label="Jour ${i + 1}${coche ? ", validé" : actif ? ", à valider aujourd'hui" : ""}">
          <span>${i + 1}</span>
        </button>`;
      }).join("")}
    </div>`;
}

export function vueDefis(etat) {
  const aujourdhui = dateISO();
  return `
    <div class="entete-page">
      <p class="sourtou-ligne">Un pas par jour</p>
      <h2>Défis</h2>
      <p>${etat.defis.filter((d) => d.jours?.includes(aujourdhui)).length} défi(s) tenu(s) aujourd'hui</p>
    </div>

    <section class="carte">
      ${sourtouLigne("Nouveau défi")}
      <form class="formulaire" data-module="defis">
        <input type="text" class="champ" id="defi-titre"
          placeholder="Ex. Coran chaque matin pendant 30 jours" aria-label="Intitulé du défi">
        <select class="champ champ-tres-large" id="defi-duree" aria-label="Durée du défi">
          ${DUREES.map((d) => `<option value="${d}">${d} jours</option>`).join("")}
        </select>
        <button type="button" class="bouton" data-action="ajouter-defi">Commencer</button>
      </form>
      <p class="texte-petit" style="margin:0.5rem 0 0">
        Le défi commence le jour de sa création ; seul le jour en cours peut être coché.
      </p>
    </section>

    <section class="carte">
      ${sourtouLigne("En cours")}
      ${etat.defis.length ? etat.defis.map((d) => `
        <article class="ligne-defi">
          <header style="display:flex;justify-content:space-between;align-items:baseline;gap:0.5rem;flex-wrap:wrap">
            <b class="serif" style="font-size:1.02rem">${esc(d.titre)}</b>
            <span style="display:flex;gap:0.3rem;align-items:center">
              <span class="etiquette">${d.jours?.length ?? 0} / ${d.duree} jours</span>
              <button type="button" class="action-iconique danger" data-action="supprimer-defi"
                data-id="${d.id}" aria-label="Abandonner et supprimer « ${esc(d.titre)} »">${icone("poubelle", 15)}</button>
            </span>
          </header>
          ${grilleDefi(d)}
          ${barreHTML(d.jours?.length ?? 0, d.duree, "")}
        </article>`).join("")
        : videHTML("Aucun défi en cours",
          "21 jours suffisent souvent à installer une habitude. Pourquoi pas aujourd'hui ?")}
    </section>
  `;
}
