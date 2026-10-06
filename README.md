# Moja online vizitka — Tymofii Mardachov

**Meno a krúžok:** Tymofii Mardachov — WEBTE1, krúžok Pondelok 9:00 (cvičenie Web technologies 1, K. Žáková, c137).

**Odkaz na školský server:** https://webte1.fei.stuba.sk/~xmardachov/

## O webe

Osobná vizitka na piatich podstránkach: profil, životopis, pracovné prostredie, rozvrh a mapa. Spája dve moje hlavné veci — programovanie (SQL, Python, tvorbu webu) a záľubu v cestovaní — čo sa odráža aj v slogane a v drobnom motíve dráhy letu v dizajne. Obsah je pravdivý: rozvrh, škola a kontakt sú reálne (telefón a adresa v platnom, ale vymyslenom formáte), fotografia je nahradená ilustráciou.

## Zdroje

- **Ilustrácie a monogram** (`img/monogram.svg`, `img/profile-illustration.svg`, `img/workspace-illustration.svg`, `img/og-cover.png`, `favicon.ico`) — vlastný návrh vytvorený s pomocou AI (Claude, Anthropic).
- **Mapové podklady** — dlaždice Esri World Street Map (`server.arcgisonline.com`), © [Esri](https://www.esri.com/) a prispievatelia.
- **Mapová knižnica** — [Leaflet](https://leafletjs.com/) 1.9.4 (načítaná z CDN unpkg, výhradne na `pages/map.html`).
- **Písmo** — [Inter](https://github.com/rsms/inter) (variabilný rez, `fonts/inter-variable.woff2`), licencia SIL Open Font License 1.1 — plné znenie v `fonts/inter-OFL-license.txt`.

## Použitie AI nástrojov

Pri tvorbe webu (návrh, HTML/CSS/JS kód, texty aj ilustrácie) som použil AI asistenta Claude (Anthropic); obsah aj kód som prešiel, viem ich vysvetliť a obhájiť, a informácia o použití AI sa vypisuje aj do konzoly prehliadača.

## Validita

HTML a CSS som validoval na validator.w3.org a jigsaw.w3.org — výstupy sú v priečinku `docs/`.
