// Bien-être : habitudes quotidiennes, hydratation, petites routines
// de self-care. Tout ce qui est coché ici se réinitialise à minuit.

import { esc, sourtouLigne, barreHTML, bouton, dateISO, texteJoli } from "../base.js";
import { icone } from "../icone.js";

// Habitudes proposées : libre à l'utilisatrice de n'en suivre que
// certaines (le cocher/décocher du jour reste sans conséquence).
export const HABITUDES = [
  { cle: "sport", nom: "Bouger 20 minutes", conseil: "Marche, étirements, natation : l'important est la régularité." },
  { cle: "soin", nom: "Self-care", conseil: "Soin de la peau, moment calme, lecture : un geste pour soi." },
  { cle: "lecture", nom: "Lecture", conseil: "Quelques pages valent mieux qu'une bibliothèque ignorée." },
  { cle: "menage", nom: "Ménage léger", conseil: "Dix minutes par jour évitent le grand nettoyage du samedi." },
  { cle: "sommeil", nom: "Coucher tôt", conseil: "Une heure perdue le soir se paie au fajr." },
];

function gouttesHTML(nombre, cible) {
  return Array.from({ length: cible }, (_, i) => `
    <button type="button" class="goutte${i < nombre ? " pleine" : ""}"
      data-action="${i < nombre ? "retirer-eau" : "ajouter-eau"}" data-valeur="${i}"
      aria-label="${i < nombre ? "Retirer" : "Ajouter"} un verre d'eau">
      ${icone("eau", 13)}
    </button>`).join("");
}

export function vueBienetre(etat) {
  const aujourdhui = dateISO();
  const faitesCeJour = HABITUDES.filter((h) => etat.routines.habitudes?.[h.cle]);

  return `
    <div class="entete-page">
      <p class="sourtou-ligne">${esc(texteJoli(aujourdhui))}</p>
      <h2>Bien-être</h2>
      <p>${faitesCeJour.length} habitude(s) tenue(s) aujourd'hui</p>
    </div>

    <section class="carte">
      ${sourtouLigne("Hydratation")}
      <div class="ligne">
        <div class="principale"><b>${etat.routines.eau ?? 0} verre(s) aujourd'hui</b>
          <small>objectif : ${etat.hydratationCible} verres</small></div>
        <div class="rangee-gouttes">
          ${gouttesHTML(etat.routines.eau ?? 0, etat.hydratationCible)}
        </div>
      </div>
      <div class="formulaire mini">
        <label for="hydratation-cible" class="texte-petit">Objectif quotidien</label>
        <select class="champ champ-tres-large" id="hydratation-cible" aria-label="Objectif de verres d'eau par jour">
          ${[6, 8, 10].map((v) => `<option value="${v}"${v === etat.hydratationCible ? " selected" : ""}>${v} verres</option>`).join("")}
        </select>
        ${bouton({ action: "definir-hydratation", texte: "Enregistrer" })}
      </div>
    </section>

    <section class="carte">
      ${sourtouLigne("Habitudes du jour")}
      ${HABITUDES.map((h) => {
        const faite = !!etat.routines.habitudes?.[h.cle];
        return `
        <div class="ligne${faite ? " fait" : ""}">
          <button type="button" class="case-cocher${faite ? " fait" : ""}" data-action="basculer-habitude"
            data-valeur="${h.cle}" aria-pressed="${faite}" aria-label="${faite ? "Décocher" : "Cocher"} « ${esc(h.nom)} »">✓</button>
          <div class="principale"><b>${esc(h.nom)}</b><small>${esc(h.conseil)}</small></div>
        </div>`;
      }).join("")}
      ${barreHTML(faitesCeJour.length, HABITUDES.length, "")}
    </section>

    <section class="carte">
      ${sourtouLigne("Rituel du soir")}
      <p class="texte-petit" style="margin:0 0 0.5rem">
        Avant de dormir, trois petites questions suffisent. Les réponses se notent dans le journal.
      </p>
      <button type="button" class="bouton-texte" data-onglet="journal">Ouvrir mon journal</button>
      <div class="serif" style="margin-top:0.8rem;font-size:1.02rem;line-height:1.7">
        « Seigneur, c'est par Toi que nous sommes entrés dans la soirée… » — l'invocation du soir,
        à dire avant le coucher.
      </div>
      <p class="texte-petit" style="margin-top:0.4rem">
        La formule complète figure dans les recueils d'invocations (Hisn al-Muslim entre autres).
      </p>
    </section>
  `;
}
