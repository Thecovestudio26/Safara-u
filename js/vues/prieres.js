// Prières : horaires du jour, suivi des cinq prières, ville et
// rappel que la mosquée reste la référence.

import { formatHeure, prieres } from "../horaires.js";
import { esc, sourtouLigne, barreHTML, selectVillesHTML } from "../base.js";
import { icone } from "../icone.js";

export function vuePrieres(etat) {
  const faites = prieres.filter((p) => etat.prieres[p.cle]).length;
  const lignes = prieres.map((p, i) => {
    const faite = !!etat.prieres[p.cle];
    return `
      <div class="ligne${faite ? " fait" : ""}">
        <button type="button" class="case-cocher${faite ? " fait" : ""}"
          data-action="cocher-priere" data-priere="${p.cle}"
          aria-pressed="${faite}" aria-label="Marquer ${p.nom} comme faite">✓</button>
        <div class="principale"><b>${p.nom}</b>
          <small class="arabe">${p.arabe}</small></div>
        <strong class="teletypee nombre">${formatHeure(etat.horaires[p.cle])}</strong>
      </div>`;
  }).join("");

  return `
    <div class="entete-page">
      <p class="sourtou-ligne">Ibādah</p>
      <h2>Les cinq prières</h2>
      <p>${esc(etat.villes[etat.ville].nom)} · ${esc(etat.methodeChoisie.nom)} ·
        Fajr ${etat.methodeChoisie.fajr}° · Icha ${etat.methodeChoisie.icha}°</p>
    </div>

    <section class="carte">
      ${sourtouLigne("Aujourd'hui")}
      ${lignes}
      ${barreHTML(faites, 5, "Prières accomplies")}
    </section>

    <section class="carte">
      ${sourtouLigne("Prochaine prière")}
      <p style="margin:0.2rem 0 0" class="serif" >
        <span id="prochaine-nom">${etat.prochaine.nom}</span>
        <span class="decompte" id="decompte" style="margin-left:0.6rem" aria-live="polite">${etat.decompte}</span>
      </p>
      <p class="texte-petit" style="margin:0.4rem 0 0">
        ${icone("lieu", 12)}
        ${selectVillesHTML(etat.villes, etat.ville, "ville-prieres")}
        <button type="button" class="bouton-texte" data-onglet="reglages">Méthode de calcul…</button>
      </p>
      <p class="texte-petit" style="margin:0.7rem 0 0">
        Les horaires sont calculés sur l'appareil, méthode des angles. Aux hautes
        latitudes en été, Fajr ou Icha peuvent afficher « --:-- » quand le soleil
        ne descend jamais assez bas : suivez alors votre mosquée, c'est de toute
        façon la référence pour la prière en groupe.
      </p>
    </section>`;
}
