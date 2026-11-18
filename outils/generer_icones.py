#!/usr/bin/env python3
"""Générateur des icônes PNG de Safarau Planner.

Dessine le logo (cercle chocolat + arc champagne sur fond ivoire) en
PNG valide, sans dépendance externe : zlib et struct de la bibliothèque
standard suffisent.

Usage :
    python3 outils/generer_icones.py

Produit :
    img/icone-192.png           (icône « any »)
    img/icone-512.png
    img/icone-1024.png          (grande icône, notamment l'AppIcon Xcode)
    img/icone-masquable-192.png (icône maskable, zone de sécurité)
    img/icone-masquable-512.png

Les PNG ne sont pas versionnés : régénérés par cette commande, ils se
commitent ensuite avec `git add img/*.png`.
"""

import math
import struct
import zlib
from pathlib import Path

IVOIRE = (248, 245, 239, 255)
CHOCOLAT = (73, 53, 47, 255)
CHAMPAGNE = (182, 154, 114, 255)


def echantillon(px, py, S, echelle):
    cx = cy = S / 2
    r_cercle = 12.4 / 32 * S * echelle
    r_arc = 7.6 / 32 * S * echelle
    ep_cercle = 1.4 / 32 * S * echelle
    ep_arc = 2.2 / 32 * S * echelle

    dx, dy = px - cx, py - cy
    d = math.hypot(dx, dy)
    if abs(d - r_cercle) <= ep_cercle / 2:
        return CHOCOLAT
    if d <= r_arc + ep_arc / 2 and px >= cx:
        if abs(d - r_arc) <= ep_arc / 2:
            return CHAMPAGNE
        haut = (py - cy) < -r_arc + ep_arc / 2
        bas = (py - cy) > r_arc - ep_arc / 2
        if (haut or bas) and abs(px - cx) < ep_arc / 2 + 0.5:
            return CHAMPAGNE
    return IVOIRE


def ecrire_png(nom, taille, echelle):
    S = taille
    sous = [(0.25, 0.25), (0.75, 0.25), (0.25, 0.75), (0.75, 0.75)]
    brut = bytearray()
    for y in range(S):
        brut += b"\x00"
        for x in range(S):
            ar = ag = ab = 0
            for ox, oy in sous:
                c = echantillon(x + ox, y + oy, S, echelle)
                ar += c[0]
                ag += c[1]
                ab += c[2]
            brut += bytes((ar // 4, ag // 4, ab // 4, 255))

    def bloc(ype, donnees):
        return (struct.pack(">I", len(donnees)) + ype + donnees
                + struct.pack(">I", zlib.crc32(ype + donnees) & 0xFFFFFFFF))

    png = b"\x89PNG\r\n\x1a\n"
    png += bloc(b"IHDR", struct.pack(">IIBBBBB", S, S, 8, 6, 0, 0, 0))
    png += bloc(b"IDAT", zlib.compress(bytes(brut), 9))
    png += bloc(b"IEND", b"")
    chemin = Path(__file__).resolve().parent.parent / "img" / nom
    chemin.parent.mkdir(parents=True, exist_ok=True)
    chemin.write_bytes(png)
    print(f"{chemin} : {len(png)} octets")


if __name__ == "__main__":
    ecrire_png("icone-192.png", 192, 0.78)
    ecrire_png("icone-512.png", 512, 0.78)
    ecrire_png("icone-1024.png", 1024, 0.78)
    ecrire_png("icone-masquable-192.png", 192, 0.62)
    ecrire_png("icone-masquable-512.png", 512, 0.62)
    print("Icônes générées. Ajoutez-les au dépôt : git add img/*.png")
