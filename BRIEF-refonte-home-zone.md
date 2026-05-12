# Brief refonte — Home + Zone (Bacteriomap 2.0)

> Pour Claude Code. Cohérent avec la refonte de `editorial-sheet.jsx` déjà livrée (carrousel + sommaire sticky + meta-bar sticky + body 14 px).

## Fichiers à éditer

- **`editorial-home.jsx`** — page d'accueil / table des matières
- **`editorial-zone.jsx`** — page chapitre + sous-zones + planche bactéries

Ne pas toucher : `shared.jsx`, `editorial-data.jsx`, `editorial-main.jsx`, `editorial-sheet.jsx`, `tweaks-panel.jsx`, le HTML.

## Esprit (rappel)

- Atlas livre. Newsreader serif + IBM Plex Mono. Pas de pleine largeur.
- Colonne lecture **max ~1100 px**, centrée (`maxWidth:1100, margin:'0 auto'`).
- Densité quotidienne : voir plus en un coup d'œil, moins de marges grasses.
- Palette apothicaire chapitre = **discrète** sur tout sauf l'entête (filet 3 px) et le numéro/marqueur de chapitre.
- Tokens dans `T.*` (cf. `editorial-data.jsx`). Palette chapitre : `window.getSystemPalette(systemId).accent`.

## Tokens de densité à respecter (issus de `editorial-sheet.jsx`)

| Élément | Avant | Cible |
|---|---|---|
| H1 hero | 120–160 px | **64–88 px** |
| Padding hero V | 56–68 px | **24–32 px** |
| Body texte | 15–16 px | **13.5–14 px** |
| Section title | 22 px | **18 px** |
| Running head | conserver 10 px mono | idem, **filet 3 px accent** |
| Padding latéral page | 56 px | **48 px**, contenu wrap dans `maxWidth:1100` |
| Ligne de séparation entre items | `padding:'22px 0'` | **`10–12px 0`** |

---

## 1. `editorial-home.jsx` — refonte

### Structure cible (top → bottom)

1. **Running head** (10 px mono, `borderBottom: 3px solid var(--accent)` neutre = ocre par défaut)
   - Gauche : *Bacteriomap* italique + « ATLAS DE MICROBIOLOGIE CLINIQUE · CHUV LAUSANNE »
   - Droite : ÉDITION 2026 · p. 001
   - **Ajouter** champ recherche compact à droite (input 220 px, border `0.5px solid var(--rule)`, placeholder « Chercher une bactérie… » — non fonctionnel pour l'instant, juste UI)
2. **Hero compressé** (`padding: 28px 48px 18px`, fond `T.paper`)
   - Eyebrow mono 10 px ocre `ATLAS DE MICROBIOLOGIE CLINIQUE`
   - h1 ~72 px (au lieu de 160), `Bacteriomap.` (italique sur "Bacterio", ocre sur ".")
   - Subtitle italique 16 px max-width 720 px (au lieu de 22 px / 680)
3. **Sticky meta-bar** (nouveau, copie l'idée de la fiche)
   - `position:sticky; top:0`, fond paper, borderBottom rule
   - 4–5 cellules data-grid : `TOTAL 108 bact.` · `10 CHAPITRES` · `48 SYNDROMES` · `MAJ 12.05.2026`
   - +1 cartouche encre à droite (style `T.qrBg`) : « Récemment consulté · *S. pneumoniae* » (placeholder, lit `localStorage.getItem('bm-recent')` si dispo)
4. **TOC dense** — remplacer les 2 grosses colonnes par **liste data-grid à 1 colonne**, plus tabulaire :
   - Wrap dans `maxWidth:1100`
   - Header de liste mono 9 px : `CH. — SYSTÈME — SUJETS — N — P.`
   - Chaque ligne = 1 chapitre : `[III] [ORL] [Oreilles · Nez · Gorge · Sinus] [n=8] [p.067]`
   - Hauteur ligne **40–44 px** au lieu de 88+ px. Border-left 3 px palette chapitre au hover seulement (transparent par défaut).
   - Romain en mono 11 px à gauche, nom de système serif 19 px italic, subtitle ink3 italic 12.5 px, `n=` mono 10 px, page mono 10 px aligné droite.
   - Hover : fond `T.bgSoft`, border-left 3 px accent palette, `paddingLeft +6px` (transition 120 ms).
5. **Annexes** — 2 cartes plus compactes (même grille `1fr 1fr`, padding/40 → /20), Quiz + Atelier. Garder le `borderLeft:3px solid` (ocre / ink2) tout le temps (pas seulement hover).
6. **Footer légende** — inchangé visuellement mais réduire padding à `10px 48px`. Conserver pastilles Gram+/Gram−/Fongique/†.

### Détails UX

- Sticky meta-bar doit rester visible quand on scroll dans la TOC.
- TOC cliquable → `navigate('zone', { systemId })` (déjà en place, garder).
- Pas de TOC à 2 colonnes : 1 seule colonne tabulaire centrée à 1100 px. **C'est le gros changement de densité.** On voit les 10 chapitres + annexes + footer sans scroller en 1366×768.
- Ajouter prop `data-screen-label="Accueil"` sur le root (déjà géré dans `editorial-main.jsx`).

---

## 2. `editorial-zone.jsx` — refonte

### Structure cible

1. **Running head** identique à la fiche : `borderBottom: 3px solid palette.accent`, `← TABLE DES MATIÈRES` à gauche, nom système italique + page à droite. Boutons mono `↳ COMPARER` et `⎙ IMPRIMER` à droite.
2. **Chapter opener compressé** (`padding: 24px 48px 16px`)
   - Eyebrow mono 10 px accent + filet 24 px : `[—] III · ORL`
   - h1 **56 px** italique (au lieu de 120 px), `{sys.label}` avec `.` accent
   - Subtitle italique 15 px (au lieu de 22 px) : `{sys.subtitle}.`
   - Wrap dans `maxWidth:1100`
3. **Sticky meta-bar** (nouveau)
   - 4–5 cellules : `PATHOGÈNES n={total}` · `SOUS-ZONES {subs.length}` · `URGENCES {count}` · `DÉCL. OBL. {count}` · cartouche encre droite : « Le plus fréquent · *{nom}* »
   - `position:sticky; top:0; z-index:50`
4. **Body** — passer de **sidebar 230 px + plate** à **sommaire sticky à gauche (140 px) + plate centrée**, dans un wrap `maxWidth:1100`.
   - Sommaire sticky `top:88` exactement comme la fiche, liste des sous-zones en `§a / §b / …`, marker bord gauche 2 px accent sur active. Scroll-spy optionnel mais agréable.
   - **Filtres** Gram+/Gram−/F/† : déplacer en barre horizontale collée au sticky meta-bar **OU** en tête de la plate. Garder le style `padding:'3px 8px'`, mono 9 px.
   - Sous-zone titre : `§ A · PATHOGÈNES — Gorge.` en serif 24 px (au lieu de 36 px).
5. **Grille bactéries** — passer de `repeat(3, 1fr) gap 0 32px` à **`repeat(4, 1fr) gap 14px`** pour densifier. Vignettes plus petites :
   - Image box `height: 120 px` (au lieu de 148)
   - Nom italique 15 px (au lieu de 19)
   - shape mono 9.5 px (au lieu de 10)
   - meta row mono 9 px inchangée
   - `paddingBottom:14, marginBottom:14` (au lieu de 28/28)
   - `borderBottom:'1px solid var(--ruleSoft)'` conservé
   - Click → `navigate('sheet', { bacteriaId, systemId })`
6. **Flore commensale** — passer de `repeat(4, 1fr)` à `repeat(6, 1fr)` (très compact), gap `10px 18px`. Border-left 2 px green. Affiché seulement si filtre = 'all' (déjà le cas).
7. **Navigation chapitre suivant/précédent** — déplacer du fond de sidebar vers un footer `padding:14px 48px, borderTop`, layout `← prev | • • • | next →`, mono 10 px.

### Détails UX

- Click sur sous-zone → `setActiveSub(s.id)` (déjà en place).
- Le filtre actuel : conserver le state `useState('all')`.
- Garder `data-screen-label="Zone {systemId}"`.

---

## Tokens à ajouter (si manquants dans `editorial-data.jsx`)

Aucun. Tout est déjà disponible :
- `T.bg, T.bgSoft, T.paper, T.ink, T.ink2, T.ink3, T.rule, T.ruleSoft, T.ocre, T.red, T.green, T.blue, T.violet, T.rose`
- `T.qrBg, T.qrInk, T.qrMute, T.qrRule` (cartouche encre 1ʳᵉ intention)
- `T.serif, T.sans, T.mono`
- `window.getSystemPalette(systemId)` → `{ accent, tint, deep, name }`

## Patterns à copier de `editorial-sheet.jsx`

1. **Running head avec filet 3 px chapitre**
   ```jsx
   <div style={{ padding:'10px 48px', borderBottom:`3px solid ${accent}`, display:'flex', alignItems:'center', fontFamily:T.mono, fontSize:10, color:T.ink3, letterSpacing:'0.14em', background:T.paper }}>
   ```

2. **Sticky meta-bar**
   ```jsx
   <div style={{ position:'sticky', top:0, zIndex:50, background:T.paper, borderBottom:`1px solid ${T.rule}` }}>
     <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:`repeat(N, 1fr) 220px` }}>
       {/* cells */}
     </div>
   </div>
   ```
   Chaque cellule : `padding:'10px 12px'`, borderLeft ruleSoft entre, label mono 8.5 px ink3 letter-spaced, valeur serif 20 px fw 500.

3. **Cartouche encre à droite**
   ```jsx
   <div style={{ background:T.qrBg, color:T.qrInk, padding:'10px 14px' }}>…</div>
   ```

4. **Sommaire sticky scroll-spy** (cf. `SheetScreen` lignes ~210–230) — IntersectionObserver sur les anchors.

5. **Section title compact**
   ```jsx
   <div style={{ display:'grid', gridTemplateColumns:'42px 1fr auto', padding:'18px 0 8px', borderBottom:`1px solid ${T.rule}`, marginBottom:12, scrollMarginTop:96 }}>
   ```

## Hiérarchie typographique unifiée (à respecter strictement sur les 3 pages)

| Rôle | Famille | Taille | Style |
|---|---|---|---|
| Running head | mono | 10 | letter-spacing 0.14em |
| Page eyebrow | mono | 10 | letter-spacing 0.20em, accent color |
| H1 hero | serif | 64–72 (home), 56 (zone), 56–62 (sheet) | italic 500 |
| Subtitle hero | serif italic | 15–16 | ink2 |
| Section § | mono / serif | 10 / 18 | accent / 500 |
| Body | serif | 14 | line-height 1.6 |
| Meta-bar label | mono | 8.5 | letter-spacing 0.14em, ink3 |
| Meta-bar value | serif | 20 | fw 500 |
| Vignette nom | serif italic | 15 | fw 500 |
| Vignette shape | mono | 9.5 | ink3 |
| Vignette meta | mono | 9 | letter-spacing 0.06em |
| Footer | mono | 10 | ink2 |

## Tests d'acceptation (par fichier)

### Home
- [ ] Hero ≤ 220 px de hauteur (running head + hero + meta-bar).
- [ ] 10 chapitres visibles **+** 2 annexes **+** footer en 1366×768 sans scroller.
- [ ] Meta-bar reste collée en haut au scroll.
- [ ] Click chapitre → zone du bon systemId.
- [ ] Pas d'erreur console.

### Zone (test sur ORL)
- [ ] Chapter opener ≤ 180 px.
- [ ] Meta-bar sticky reste visible.
- [ ] 4 sous-zones cliquables en sommaire latéral, active highlighted.
- [ ] Grid 4 colonnes affiche 8 vignettes ORL.
- [ ] Filtres G+/G−/F/† fonctionnent.
- [ ] Click vignette → fiche bactérie.
- [ ] Filet 3 px chapitre = palette ORL (`#2d6a6f` vert-de-gris).

## Ordre de travail recommandé

1. Refonte `editorial-home.jsx` (plus simple).
2. Refonte `editorial-zone.jsx` en copiant les patterns du sheet + home.
3. Tester en navigant home → zone ORL → fiche → retour.
4. Tester chaque autre chapitre rapidement (couleurs apothicaire qui changent).

## Notes

- Le HTML principal `Bacteriomap Editorial.html` charge ces JSX via `<script type="text/babel" src>` — pas besoin de toucher au HTML.
- L'erreur React initiale (doublons inlinés) est déjà corrigée.
- `editorial-sheet.jsx` est le **canon stylistique** : si un doute, calque sur lui.
