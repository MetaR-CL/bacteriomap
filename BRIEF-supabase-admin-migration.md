# Migration AdminScreen → Supabase

Branche : `claude/setup-vite-migration-7PkS5` — PR #3

---

## Ce qui a été fait

### 1. Migration SQL 003 (`supabase/migrations/003_bacteria_editor_schema.sql`)

- Renommage colonne `o2` → `atmosphere`
- Ajout colonnes `tests_rapides jsonb default '[]'` et `antibiogramme jsonb default '[]'` sur `bacterio_bacteria`
- Migration `milieux` de `text[]` vers `jsonb [{name, note, primary}]` en deux temps (contrainte PostgreSQL : pas de sous-requête dans `USING`)
- Ajout colonne `label text` sur `bacterio_zones` (nom d'affichage éditable, distinct du slug `name`)

À appliquer manuellement dans le dashboard Supabase SQL Editor (ou via `supabase db push`).

---

### 2. Hook `src/hooks/useAdminBacteria.js`

- `load()` : `select('*, bacterio_images(*)')` trié par nom
- `upsert(row)` : strip la relation `bacterio_images` avant envoi, update par `id` si présent, sinon upsert sur conflict `name`
- `remove(id)` : suppression bactérie
- `uploadImage(bacteriaId, file)` : upload dans le bucket Supabase Storage `bacteriomap-images` sous `bacteria/{id}/{timestamp}.{ext}`, puis insert dans `bacterio_images`
- `deleteImage(imageId, imageUrl)` : suppression Storage (best-effort) + suppression `bacterio_images`

**Bucket à créer manuellement** dans le dashboard Supabase : `bacteriomap-images` (public).

---

### 3. Hook `src/hooks/useAdminSystems.js`

- `load()` : `select('*, bacterio_zones(*)')` trié par position
- `updateSystem(id, patch)` : update champ(s) système
- `insertSystem(payload)` : auto-slug (accents → ASCII), position = max + 1, couleur par défaut `#888888`
- `upsertZone(zone)` : upsert sur conflict `slug`
- `removeZone(id)` : suppression zone

---

### 4. `src/modules/bacteriomap/AdminScreen.jsx` — réécriture BacteriaEditor & ChaptersEditor

#### BacteriaEditor — 11 sections éditables

| Section | Champs |
|---|---|
| Identité | name, slug, gram (select), morpho (select), atmosphere (select), freq (select), urgence (checkbox), bsl3 (checkbox), declaration (checkbox) |
| Tests rapides fixes | catalase, oxydase, coagulase, sporulation (BoolSelect 3 états : null / vrai / faux) |
| Tests rapides dynamiques | `tests_rapides` jsonb `[{name, result}]` — ajout/suppression lignes |
| Milieux de culture | `milieux` jsonb `[{name, note, primary}]` — ajout/suppression, flag primaire |
| Identification | `identif` texte libre |
| Résistances | `resist_nat` et `resist_acq` text[] — tags éditables |
| Virulence | `virulence` text[] — tags |
| Clinique | `antibio` texte libre |
| Antibiogramme | `antibiogramme` jsonb `[{ab, sens}]` — tableau antibiotique/sensibilité |
| Commentaire | `descr` texte libre |
| Zones associées | Checkboxes groupées par système → `zone_ids integer[]` |
| Images | Liste `bacterio_images`, upload fichier, suppression |

**Pattern de sauvegarde :**
- Texte libre → `onBlur`
- Select / checkbox / tag → immédiat
- `draftRef` (useRef + useEffect) pour éviter les closures obsolètes dans les callbacks async
- Bannière rouge en cas d'erreur Supabase

#### ChaptersEditor

- Édition du `label` de chaque zone (fallback sur `name` pour l'affichage)
- Formulaire inline d'ajout de système (name, slug optionnel, color)
- Suppression de zone

#### Éditeurs inchangés

QuizEditor, MetaEditor, ImagesEditor, SettingsEditor, PaletteEditor — **non modifiés**.

---

### 5. `src/modules/bacteriomap/shared.jsx`

`gramColor()` accepte désormais les deux formats :
- Anciens symboles : `'+'`, `'−'`, `'F'`
- Valeurs Supabase : `'positif'`, `'negatif'`, `'aucun'`

---

## Contraintes importantes

- Les champs `jsonb` (`milieux`, `tests_rapides`, `resist_acq`, `resist_nat`, `virulence`, `antibiogramme`) reçoivent directement des arrays JS — **pas de `JSON.stringify()`**.
- Le mot de passe admin reste en `localStorage` côté client.
- `ADMIN_KEYS` ne contient plus `bacteria` ni `systems` (migrés vers Supabase).

---

## Build

```
npm run build  →  ✓ 0 erreur, 0 warning
```
