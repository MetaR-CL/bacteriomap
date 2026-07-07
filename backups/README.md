# Backups

Ce dossier contient des exports JSON canoniques de tout le contenu éditorial de Bacteriomap.

## Format (`version: 1`)

```json
{
  "version": 1,
  "exported_at": "2025-01-01T03:00:00Z",
  "systems":           [...],   // bacterio_systems
  "zones":             [...],   // bacterio_zones
  "bacteria":          [...],   // bacterio_bacteria (inclut milieux, antibiogramme, etc.)
  "images":            [...],   // bacterio_images (champ url = URL Storage publique)
  "milieux":           [...],   // bacterio_milieux (catalogue des milieux de culture)
  "pathologies":       [...],   // bacterio_pathologies
  "pathologie_germes": [...],   // bacterio_pathologie_germes (liaison pathologie ↔ bactérie)
  "zone_bacteria":     [...],   // bacterio_zone_bacteria (liaison zone ↔ bactérie + ordre)
  "system_bacteria":   [...],   // bacterio_system_bacteria (liaison système ↔ bactérie sans zone)
  "quiz":              [...]    // bacterio_quiz
}
```

## Fichiers

| Fichier | Contenu |
|---|---|
| `latest.json` | Dernier export (écrasé à chaque run) |
| `YYYY-MM-DD.json` | Copie horodatée — une par jour, conservée dans l'historique Git |

## Automatisation

Le workflow `.github/workflows/backup.yml` s'exécute chaque jour à 3h UTC via l'API REST
Supabase (clé anon, RLS publique) et commite le résultat ici. Chaque commit constitue
un point de restauration.

L'export peut aussi être déclenché manuellement :
- Depuis GitHub Actions → "Backup Content" → "Run workflow"
- Depuis l'interface admin → Tableau de bord → "Exporter les données"
