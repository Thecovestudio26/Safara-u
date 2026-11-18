// Adhkār : compteurs du jour, objectifs personnalisables.
// Les références citées sont des hadiths célèbres ; aucune ne spécifie
// de numéro de hadith, pour éviter toute approximation.

import { esc, sourtouLigne, videHTML, barreHTML, bouton } from "../base.js";
import { icone } from "../icone.js";

// Dhikr fixes, connus de tous, avec leur source usuelle.
const DHIKR_FIXES = [
  { id: "subhanallah", texte: "سُبْحَانَ الله", latin: "Subhân Allâh", cible: 33,
    source: "Gloire à Allah. Répété 33 fois après chaque prière, avec Alhamdulillâh et Allâhu akbar." },
  { id: "alhamdulillah", texte: "الحَمْدُ لله", latin: "Alhamdu lillâh", cible: 33,
    source: "Louange à Allah. Même séquence de 33, rapportée par Muslim." },
  { id: "allahuakbar", texte: "اللهُ أَكْبَر", latin: "Allâhu akbar", cible: 34,
    source: "Allah est le plus grand. Complète la séquence à 100, rapportée par Muslim." },
  { id: "istighfar", texte: "أَسْتَغْفِرُ الله", latin: "Astaghfirullâh", cible: 100,
    source: "Je demande pardon à Allah. Le Prophète ﷺ en faisait sa dette envers Allah (rapporté par al-Bukhârî)." },
  { id: "tahlil", texte: "لا إِلٰهَ إِلَّا الله", latin: "Lâ ilâha illâ Allâh", cible: 100,
    source: "Il n'y a de divinité qu'Allah. Le meilleur dhikr selon un hadith rapporté par at-Tirmidhî." },
  { id: "salawat", texte: "صَلَّى اللهُ عَلَيْهِ وَسَلَّم", latin: "Sallâ Allâhu 'alayhi wa sallam", cible: 100,
    source: "Prier sur le Prophète ﷺ : une salawat vaut dix en retour, selon un hadith rapporté par Muslim." },
];

export function vueDhikr(etat) {
  const compteurs = etat.dhikr; // compteurs du jour : {id: n}
  const liste = [...DHIKR_FIXES, ...etat.dhikrPerso];

  const bloc = (d) => {
    const n = compteurs[d.id] ?? 0;
    const fini = n >= d.cible;
    return `
    <article class="dhikr-bloc${fini ? " termine" : ""}">
      <p class="arabe">${esc(d.texte)}</p>
      <p class="dhikr-latin">${esc(d.latin)}</p>
      ${d.source ? `<p class="texte-petit">${esc(d.source)}</p>` : ""}
      <div class="dhikr-commandes">
        <button type="button" class="dhikr-compteur" data-action="compter-dhikr"
          data-id="${esc(d.id)}" aria-label="Compter un « ${esc(d.latin)} » de plus (${n} sur ${d.cible})">${n}</button>
        <small class="texte-petit">objectif : ${d.cible} fois</small>
        ${n > 0 ? bouton({
          action: "reinitialiser-dhikr", id: d.id, style: "texte",
          texte: "Recommencer", libelleAria: `Remettre le compteur « ${d.latin} » à zéro`,
        }) : ""}
      </div>
      ${barreHTML(n, d.cible, "")}
    </article>`;
  };

  const persos = etat.dhikrPerso.length
    ? etat.dhikrPerso.map((d) => bloc(d)).join("")
    : videHTML("Place pour tes dhikr", "Un dhikr récurrent que les listes classiques ne contiennent pas ? Ajoute-le ici.");

  return `
    <div class="entete-page">
      <p class="sourtou-ligne">Rappel</p>
      <h2>Adhkār</h2>
      <p>Les compteurs reviennent à zéro chaque nuit</p>
    </div>

    <section class="grille-dhikr">
      ${DHIKR_FIXES.map(bloc).join("")}
    </section>

    <section class="carte">
      ${sourtouLigne("Mes dhikr personnels")}
      ${persos}
      <form class="formulaire" data-module="dhikr">
        <input type="text" class="champ" id="dhikr-perso-texte" placeholder="Invocation (arabe ou français)"
          aria-label="Texte du dhikr personnel">
        <select class="champ champ-tres-large" id="dhikr-perso-cible" aria-label="Objectif de répétitions">
          ${[10, 33, 100, 313, 1000].map((v) => `<option value="${v}"${v === 100 ? " selected" : ""}>${v} fois</option>`).join("")}
        </select>
        <button type="button" class="bouton" data-action="ajouter-dhikr-perso">Ajouter</button>
      </form>
      ${etat.dhikrPerso.map((d) => `
        <div class="ligne">
          <div class="principale"><b>${esc(d.latin || d.texte)}</b><small>objectif : ${d.cible} fois</small></div>
          <button type="button" class="action-iconique danger" data-action="supprimer-dhikr-perso"
            data-id="${d.id}" aria-label="Supprimer « ${esc(d.latin || d.texte)} »">${icone("poubelle", 15)}</button>
        </div>`).join("")}
    </section>
  `;
}
