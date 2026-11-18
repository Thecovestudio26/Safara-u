// Le tableau de bord : l'état de la journée en quelques secondes,
// sans surcharge. Chaque bloc peut être masqué depuis les réglages.

import { formatHeure, prieres } from "../horaires.js";
import {
  esc, sourtouLigne, barreHTML, videHTML, dateISO, selectVillesHTML,
} from "../base.js";
import { icone } from "../icone.js";

function blocHTML(etat, cle, titre, contenu) {
  if (etat.sections && !etat.sections.includes(cle)) return "";
  return `
    <section class="carte" aria-labelledby="${cle}-titre">
      ${sourtouLigne(titre)}
      ${contenu}
    </section>`;
}

export function vueAccueil(etat) {
  const maintenant = new Date();
  const dateFr = maintenant.toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  let hegire = "";
  try {
    hegire = new Intl.DateTimeFormat("fr-FR-u-ca-islamic-umalqura",
      { day: "numeric", month: "long", year: "numeric" }).format(maintenant);
  } catch (_e) { /* calendrier hégirien indisponible sur ce navigateur */ }

  const aujourdhui = dateISO();
  const tachesOuvertes = etat.taches.filter((t) => !t.fait);
  const prioritaires = [...tachesOuvertes]
    .sort((a, b) => (b.prio === "haute") - (a.prio === "haute") || (b.prio === "normale") - (a.prio === "normale"))
    .slice(0, 3);
  const tachesEcheance = tachesOuvertes.filter((t) => t.echeance && t.echeance <= aujourdhui);
  const prochainesRendezVous = [...etat.evenements]
    .filter((e) => e.date >= aujourdhui)
    .sort((a, b) => (a.date + (a.heure ?? "")).localeCompare(b.date + (b.heure ?? "")))
    .slice(0, 2);
  const coranJour = etat.coran.filter(Boolean).length;
  const coranFait = etat.coranJournal.includes(aujourdhui);
  const objectivelyVisibles = etat.objectifs.slice(0, 2);
  const habitudes = [
    { id: "eau", texte: "Hydratation", nombre: etat.routines.eau ?? 0, cible: etat.hydratationCible },
  ];
  const habitudesFaites = habitudes.filter((h) => h.nombre >= h.cible).length;
  const faites = prieres.filter((p) => etat.prieres[p.cle]).length;

  const reperes = prieres.map((p) => {
    const faite = !!etat.prieres[p.cle];
    return `
      <span class="repere">
        <button type="button" class="case-priere${faite ? " fait" : ""}"
          data-action="cocher-priere" data-priere="${p.cle}"
          aria-pressed="${faite}" aria-label="Marquer ${p.nom} comme faite${faite ? " (faite)" : ""}">✓</button>
        <span>${p.nom} <b class="${faite ? "fait" : ""}">${formatHeure(etat.horaires[p.cle])}</b></span>
      </span>`;
  }).join("");

  return `
    <div class="entete-page">
      <p class="sourtou-ligne">${esc(dateFr)}${hegire ? " · " + esc(hegire) : ""}</p>
      <h2 class="salutation">As-salām 'alaykum</h2>
      <p style="margin:0.3rem 0 0.8rem">
        ${selectVillesHTML(etat.villes, etat.ville, "ville-accueil")}
      </p>
    </div>

    <section class="carte" aria-label="Prochaine prière">
      <div class="prochaine-priere">
        <div>
          ${sourtouLigne("Prochaine prière")}
          <span class="nom-priere"><span class="grand" id="prochaine-nom">${etat.prochaine.nom}</span></span>
          <span class="texte-petit">
            ${etat.prochaine.cle === "fajr" && faites === 0 ? "première du jour" : "à l'heure indiquée"}
          </span>
        </div>
        <div style="text-align:right">
          <span class="decompte" id="decompte" aria-live="polite">${etat.decompte}</span>
          <span class="decompte-sous">${etat.prochaine.heure}</span>
        </div>
      </div>
      <div class="reperes-prieres">${reperes}</div>
      ${barreHTML(faites, 5, "Prières accomplies")}
    </section>

    ${blocHTML(etat, "coran", "Lecture du Coran", `
      <p class="serif" style="margin:0 0 0.5rem;font-size:1.05rem">
        ${coranFait ? "Lecture du jour accomplie, mabrouk." : `${coranJour}${coranJour === 1 ? "er" : "e"} jour sur le programme de 30`}
      </p>
      ${barreHTML(coranJour, 30, etat.coranJournal.length + " jour(s) de lecture enregistrés au total")}
      <p style="margin:0.6rem 0 0">${boutonVoirModule("coran", "Ouvrir le programme")}</p>
    `)}

    ${blocHTML(etat, "taches", "Aujourd'hui", `
      ${tachesEcheance.length ? `<p class="texte-petit" style="margin:0 0 0.3rem">
        ${tachesEcheance.length} tâche(s) arrivée(s) à échéance</p>` : ""}
      ${prioritaires.length ? prioritaires.map((t) => `
        <div class="ligne">
          <button type="button" class="case-cocher" data-action="basculer-tache"
            data-id="${t.id}" aria-pressed="false" aria-label="Terminer « ${esc(t.texte)} »">✓</button>
          <div class="principale"><b>${esc(t.texte)}</b>
            <small>${t.echeance ? "échéance " + esc(t.echeance) : esc(t.prio)}</small></div>
          <span class="etiquette etiquette-${t.prio}">${t.prio}</span>
        </div>`).join("")
      : videHTML("Rien d'urgent aujourd'hui", "Ajoute une tâche quand quelque chose arrive à l'esprit.")}
      ${tachesOuvertes.length > 3 ? `<p style="margin:0.4rem 0 0">${boutonVoirModule("taches", "Voir les " + tachesOuvertes.length + " tâches ouvertes")}</p>` : ""}
    `)}

    ${prochainesRendezVous.length ? blocHTML(etat, "agenda", "À venir", prochainesRendezVous.map((ev) => `
      <div class="ligne">
        <div class="principale"><b>${esc(ev.titre)}</b>
          <small>${new Date(ev.date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
          ${ev.heure ? " · " + esc(ev.heure) : ""}</small></div>
      </div>`).join("")) : ""}

    ${blocHTML(etat, "habitudes", "Habitudes", `
      <div class="ligne" style="border-bottom:none">
        <div class="principale"><b>Hydratation</b>
          <small>${habitudes[0].nombre} / ${habitudes[0].cible} verres</small></div>
        <div class="rangee-gouttes" style="margin:0">
          ${gouttesHTML(habitudes[0].nombre, habitudes[0].cible)}
        </div>
      </div>
      <p style="margin:0.4rem 0 0">${boutonVoirModule("bienetre", habitudesFaites ? "Habitudes tenues, ma sha' Allah" : "Ouvrir mes routines")}</p>
    `)}

    ${objectivelyVisibles.length ? blocHTML(etat, "objectifs", "Objectifs en cours", objectivelyVisibles.map((o) => `
      <div style="margin-bottom:0.7rem">
        <p style="margin:0 0 0.25rem;font-size:0.9rem">${esc(o.titre)}
          ${o.rythme ? `<span class="etiquette" style="margin-left:0.3rem">${esc(o.rythme)}</span>` : ""}</p>
        ${barreHTML(o.avancement, o.etapes, o.avancement + " / " + o.etapes + " étapes")}
      </div>`).join("")) : ""}
  `;
}

function gouttesHTML(nombre, cible) {
  return Array.from({ length: cible }, (_, i) => `
    <button type="button" class="goutte${i < nombre ? " pleine" : ""}"
      data-action="${i < nombre ? "retirer-eau" : "ajouter-eau"}" data-valeur="${i < nombre ? i : i}"
      aria-label="${i < nombre ? "Retirer un verre" : "Ajouter un verre"}">
      ${icone("eau", 13)}
    </button>`).join("");
}

function boutonVoirModule(module, texte) {
  return `<button type="button" class="bouton-texte" data-onglet="${module}">${esc(texte)}</button>`;
}
