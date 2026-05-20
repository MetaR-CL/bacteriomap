-- Milieux de culture referential table
create table if not exists bacterio_milieux (
  id         serial primary key,
  name       text    not null unique,
  category   text    not null default 'Gélose',
  selective  boolean not null default false,
  created_at timestamptz default now()
);

-- Seed common culture media
insert into bacterio_milieux (name, category, selective) values
  ('Gélose Columbia + 5% sang de mouton', 'Gélose', false),
  ('Gélose au sang cuit (chocolat)', 'Gélose', false),
  ('Gélose MacConkey', 'Gélose', true),
  ('Gélose Sabouraud', 'Gélose', true),
  ('Gélose Mueller-Hinton', 'Gélose', false),
  ('Gélose CLED', 'Gélose', false),
  ('Gélose Hektoen', 'Gélose', true),
  ('Gélose Chapman (MSA)', 'Gélose', true),
  ('Bouillon thioglycolate', 'Bouillon', false),
  ('Bouillon BHI', 'Bouillon', false),
  ('Gélose chromogène', 'Chromogène', false),
  ('Milieu de transport Amies', 'Transport', false),
  ('Eau peptonée tamponée', 'Enrichissement', false)
on conflict (name) do nothing;
