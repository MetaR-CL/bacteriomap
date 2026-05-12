-- Systèmes anatomiques
create table bacterio_systems (
  id serial primary key,
  name text not null,
  slug text unique not null,
  color text not null,
  icon text,
  position integer default 0
);

-- Zones (sous-systèmes optionnels)
create table bacterio_zones (
  id serial primary key,
  system_id integer references bacterio_systems(id) on delete cascade,
  name text not null,
  slug text unique not null,
  position integer default 0
);

-- Bactéries
create table bacterio_bacteria (
  id serial primary key,
  name text not null,
  type text not null check (type in ('bacterie','levure','moisissure')),
  gram text check (gram in ('positif','negatif','variable','aucun')),
  morphology text,
  catalase boolean,
  oxydase boolean,
  coagulase boolean,
  sporulation boolean,
  milieux text[],
  resistances text[],
  clinical_info text,
  populations_risque text,
  commentaire text,
  zone_ids integer[],
  created_at timestamptz default now()
);

-- Images des bactéries
create table bacterio_images (
  id serial primary key,
  bacteria_id integer references bacterio_bacteria(id) on delete cascade,
  url text not null,
  caption text,
  position integer default 0
);

-- Quiz — cas cliniques
create table bacterio_quiz (
  id serial primary key,
  title text not null,
  scenario text not null,
  question text not null,
  options jsonb not null,
  correct_index integer not null,
  explanation text,
  zone_ids integer[],
  created_at timestamptz default now()
);
