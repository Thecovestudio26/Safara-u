// Coran : programme de lecture sur 30 jours avec le juz du jour, le
// détail des sourates couvertes par chaque juz, et un historique des
// jours réellement accomplis.

import { esc, sourtouLigne, barreHTML, videHTML, dateISO, MOIS_COURTS } from "../base.js";
import { icone } from "../icone.js";

// Limites usuelles des 30 juz (début / fin), pour situer sa lecture.
const limitesJuz = [
  ["Al-Fātiha 1 – Al-Baqara 141"],
  ["Al-Baqara 142 – Al-Baqara 252"],
  ["Al-Baqara 253 – Āl-'Imrān 92"],
  ["Āl-'Imrān 93 – An-Nisā' 23"],
  ["An-Nisā' 24 – An-Nisā' 147"],
  ["An-Nisā' 148 – Al-Mā'ida 81"],
  ["Al-Mā'ida 82 – Al-An'ām 110"],
  ["Al-An'ām 111 – Al-A'rāf 87"],
  ["Al-A'rāf 88 – Al-Anfāl 40"],
  ["Al-Anfāl 41 – At-Tawba 92"],
  ["At-Tawba 93 – Hūd 5"],
  ["Hūd 6 – Yūsuf 52"],
  ["Yūsuf 53 – Ibrāhīm 52"],
  ["Al-Hijr 1 – An-Nahl 128"],
  ["Al-Isrā' 1 – Al-Kahf 74"],
  ["Al-Kahf 75 – Tā-Hā 135"],
  ["Al-Anbiyā' 1 – Al-Hajj 78"],
  ["Al-Mu'minūn 1 – Al-Furqān 20"],
  ["Al-Furqān 21 – An-Naml 55"],
  ["An-Naml 56 – Al-'Ankabūt 45"],
  ["Al-'Ankabūt 46 – Al-Ahzāb 30"],
  ["Al-Ahzāb 31 – Yā-Sīn 27"],
  ["Yā-Sīn 28 – Az-Zumar 31"],
  ["Az-Zumar 32 – Fussilat 46"],
  ["Fussilat 47 – Al-Jāthiya 37"],
  ["Al-Ahqāf 1 – Adh-Dhāriyāt 30"],
  ["Adh-Dhāriyāt 31 – Al-Hadīd 29"],
  ["Al-Mujādala 1 – At-Tahrīm 12"],
  ["Al-Mulk 1 – Al-Mursalāt 50"],
  ["An-Naba' 1 – An-Nās 6"],
];

export function vueCoran(etat) {
  const joursLus = etat.coran.filter(Boolean).length;
  const aujourdhui = dateISO();
  const jourProgramme = Math.min(30, joursLus + 1);
  const luAujourdhui = etat.coranJournal.includes(aujourdhui);
  const ceMois = etat.coranJournal.filter((j) => j.slice(0, 7) === aujourdhui.slice(0, 7));

  const cellules = etat.coran.map((lu, i) => `
    <button type="button" class="cellule-juz${lu ? " lu" : ""}"
      data-action="basculer-jour-coran" data-jour="${i}"
      aria-pressed="${lu}" aria-label="Juz ${i + 1}${lu ? ", lu" : ""}">
      <b>Jour ${i + 1}</b>
      <small>Juz ${i + 1} · ${esc(limitesJuz[i])}</small>
    </button>`).join("");

  return `
    <div class="entete-page">
      <p class="sourtou-ligne">Lecture</p>
      <h2>Coran — programme de 30 jours</h2>
      <p>Un juz par jour pour traverser le Coran en un mois, à ton rythme.</p>
    </div>

    <section class="carte">
      <div style="display:flex;flex-wrap:wrap;gap:0.8rem;align-items:center;justify-content:space-between">
        <div>
          ${sourtouLigne("Aujourd'hui")}
          <p class="serif" style="margin:0.2rem 0;font-size:1.25rem">
            Jour ${jourProgramme} · Juz ${jourProgramme}
          </p>
          <p class="texte-petit" style="margin:0">${esc(limitesJuz[jourProgramme - 1])}</p>
        </div>
        <button type="button" class="bouton${luAujourdhui ? "-discret" : ""}"
          data-action="cocher-lecture-jour" ${luAujourdhui ? "disabled" : ""}>
          ${luAujourdhui ? "Lecture du jour notée" : "Marquer la lecture du jour"}
        </button>
      </div>
    </section>

    <section class="carte">
      ${sourtouLigne("Progression du programme")}
      ${barreHTML(joursLus, 30, joursLus + " jour(s) validés")}
      <p style="margin:0.7rem 0 0">
        <button type="button" class="bouton bouton-discret bouton-mini" data-action="reinitialiser-coran">
          Recommencer les 30 jours
        </button>
      </p>
    </section>

    <section class="carte">
      ${sourtouLigne("Historique")}
      ${ceMois.length || etat.coranJournal.length ? `
        <p class="texte-petit" style="margin:0">
          ${etat.coranJournal.length} jour(s) de lecture enregistrés au total,
          dont ${ceMois.length} ce mois-ci
          (${MOIS_COURTS[new Date().getMonth()]})
        </p>` : videHTML("Aucune lecture enregistrée", "Coche un jour du programme quand il est lu.")}
    </section>

    <section class="carte">
      ${sourtouLigne("Les 30 jours")}
      <div class="grille-jours">${cellules}</div>
    </section>
  `;
}
