# 🦠 Bacteriomap

Atlas interactif de microbiologie clinique pour la formation des techniciens
en analyses biomédicales (TAB) — développé au sein de l'Institut de
Microbiologie du CHUV, Lausanne.

**[→ Accéder à l'application](https://metar-cl.github.io/bacteriomap/)**

## À propos

Bacteriomap organise le contenu de formation en bactériologie autour d'une
navigation anatomique : systèmes → zones → pathologies → germes. Chaque fiche
bactérienne rassemble Gram, tests d'identification rapides, milieux de
culture, résistances, signification clinique et antibiogramme.

Premier module d'une plateforme plus large de l'Institut de Microbiologie du
CHUV — des modules virologie et parasitologie sont prévus selon la même
architecture.

## Fonctionnalités

- Navigation Système → Zone → Pathologie → Germe, avec flore commensale
  distincte des pathogènes
- Fiches germes complètes : identification, milieux, résistances, virulence,
  clinique, antibiogramme
- Comparaison colorisée entre germes (identique / différent)
- Quiz de formation avec cas cliniques
- Interface d'administration complète (CRUD systèmes, zones, pathologies,
  bactéries, milieux, quiz) avec prévisualisation live et autosave
- Progressive Web App (installable, hors-ligne partiel)
- Design éditorial dédié : fond crème, typographies serif/mono, palette par
  système anatomique

## Stack technique

- **Frontend** : React + Vite
- **Backend** : Supabase (PostgreSQL, Storage, Auth)
- **Déploiement** : GitHub Pages + GitHub Actions (CI/CD, keep-alive, backup
  automatique quotidien du contenu)
- Compatible Microsoft Edge (contrainte réseau CHUV)

## Architecture

Toutes les tables Supabase sont préfixées `bacterio_`. L'app publique lit ses
données via une couche d'accès unique (`src/shared/dataSource.js`), pensée
pour permettre à terme un fonctionnement sans dépendance externe (export JSON
canonique versionné dans `/backups/`).

## Contexte

Projet développé et maintenu en interne au CHUV, avec assistance IA pour le
développement. Budget infrastructure limité aux offres gratuites (Supabase
free tier, GitHub Pages).

## Auteur

Institut de Microbiologie CHUV
