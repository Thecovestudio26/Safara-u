// Repas : planification hebdomadaire en trois moments, reliée aux
// recettes (« planifier ce plat ») et à la liste de courses.

import {
  esc, sourtouLigne, videHTML, JOURS, MOMENTS_REPAS, bouton,
} from "../base.js";
import { icone } from "../icone.js";

function titreRecette(etat, plat) {
  if (!plat) return "";
  const recette = plat.recette && etat.recettes.find((r) => r.id === plat.recette);
  return recette ? ` · ${esc(recette.titre)}` : "";
}

function formRepasHTML(etat, prefusion) {
  // prefusion : recette choisie depuis le module Recettes, à caser dans le menu.
  const recette = prefusion ? etat.recettes.find((r) => r.id === prefusion) : null;
  if (!recette) return "";
  return `
    <div class="planification-annonce">
      <div>
        ${sourtouLigne("Planifier une recette")}
        <p class="serif" style="margin:0.2rem 0 0.5rem;font-size:1.05rem">${esc(recette.titre)}</p>
      </div>
      <form class="formulaire" data-module="repas">
        <select class="champ champ-large" id="repas-jour" aria-label="Jour">
          ${JOURS.map((j, i) => `<option value="${i}">${j}</option>`).join("")}
        </select>
        <select class="champ champ-large" id="repas-moment" aria-label="Moment">
          ${MOMENTS_REPAS.map((m) => `<option value="${esc(m)}">${esc(m)}</option>`).join("")}
        </select>
        <button type="button" class="bouton" data-action="planifier-recette-valider"
          data-id="${esc(recette.id)}">Planifier</button>
        <button type="button" class="bouton bouton-discret" data-action="annuler-planification">Annuler</button>
      </form>
    </div>`;
}

export function vueRepas(etat) {
  const parJour = (jour, moment) =>
    etat.repas.filter((r) => r.jour === jour && r.moment === moment);

  const menuJour = (jour) => `
    <div class="menu-jour">
      <p class="sourtou-ligne">${JOURS[jour]}</p>
      ${MOMENTS_REPAS.map((moment) => {
        const plats = parJour(jour, moment);
        return `
          <div class="menu-moment">
            <small>${moment}</small>
            ${plats.length
              ? plats.map((p) => `
                <div class="ligne">
                  <div class="principale"><b>${esc(p.plat)}</b>${titreRecette(etat, p) ? `<small>${titreRecette(etat, p).slice(3)}</small>` : ""}</div>
                  ${p.recette
                    ? bouton({
                      action: "courses-depuis-recette", id: p.recette, petit: true,
                      texte: "Ingrédients", libelleAria: `Ajouter les ingrédients de ${p.plat} à la liste de courses`,
                    })
                    : ""}
                  <button type="button" class="action-iconique danger" data-action="supprimer-repas"
                    data-id="${p.id}" aria-label="Retirer « ${esc(p.plat)} » du menu">${icone("poubelle", 15)}</button>
                </div>`).join("")
              : `<p class="texte-petit" style="margin:0">—</p>`}
          </div>`;
      }).join("")}
    </div>`;

  const coursesRestantes = etat.courses.filter((c) => !c.fait);

  return `
    <div class="entete-page">
      <p class="sourtou-ligne">Cuisine</p>
      <h2>Repas &amp; courses</h2>
      <p>${etat.repas.length} plat(s) planifié(s) · ${coursesRestantes.length} article(s) à acheter</p>
    </div>

    <section class="carte">
      ${formRepasHTML(etat, etat.planification)}

      <form class="formulaire" data-module="repas">
        <select class="champ champ-tres-large" id="nouveau-repas-jour" aria-label="Jour">
          ${JOURS.map((j, i) => `<option value="${i}"${i === (new Date().getDay() + 6) % 7 ? " selected" : ""}>${j}</option>`).join("")}
        </select>
        <select class="champ champ-tres-large" id="nouveau-repas-moment" aria-label="Moment du repas">
          ${MOMENTS_REPAS.map((m) => `<option value="${esc(m)}">${esc(m)}</option>`).join("")}
        </select>
        <input type="text" class="champ" id="nouveau-repas-plat" placeholder="Plat du moment"
          aria-label="Nom du plat">
        <button type="button" class="bouton" data-action="ajouter-repas">Planifier</button>
      </form>
    </section>

    <section class="carte">
      ${sourtouLigne("Menu de la semaine")}
      ${etat.repas.length
        ? `<div class="grille-menus">${JOURS.map((_, j) => menuJour(j)).join("")}</div>`
        : videHTML("Une semaine à remplir",
          "Note un plat par moment de la journée, ou planifie directement depuis tes recettes.")}
    </section>

    <section class="carte">
      <div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:0.4rem">
        ${sourtouLigne("Liste de courses")}
        ${etat.courses.length
          ? bouton({ action: "vider-courses-faites", petit: true, texte: "Retirer les articles cochés" })
          : ""}
      </div>
      <form class="formulaire" data-module="repas">
        <input type="text" class="champ" id="nouveau-course" placeholder="Ajouter un article"
          aria-label="Article à acheter">
        <button type="button" class="bouton" data-action="ajouter-course">Ajouter</button>
      </form>
      ${etat.courses.length
        ? etat.courses.map((c) => `
          <div class="ligne${c.fait ? " fait" : ""}">
            <button type="button" class="case-cocher${c.fait ? " fait" : ""}" data-action="basculer-course"
              data-id="${c.id}" aria-pressed="${c.fait}" aria-label="${c.fait ? "Remettre" : "Cocher"} « ${esc(c.texte)} »">✓</button>
            <div class="principale"><b>${esc(c.texte)}</b></div>
            <button type="button" class="action-iconique danger" data-action="supprimer-course"
              data-id="${c.id}" aria-label="Supprimer « ${esc(c.texte)} »">${icone("poubelle", 15)}</button>
          </div>`).join("")
        : videHTML("Liste vide", "Ajoute les articles au fil de la semaine, coche-les en magasin.")}
    </section>
  `;
}
