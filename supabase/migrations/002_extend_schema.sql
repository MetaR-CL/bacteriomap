-- Add display fields to bacterio_systems
alter table bacterio_systems
  add column if not exists short text,
  add column if not exists subtitle text,
  add column if not exists hue integer,
  add column if not exists tint text,
  add column if not exists deep text;

-- Add display fields to bacterio_zones
alter table bacterio_zones
  add column if not exists n integer default 0,
  add column if not exists flora integer default 0,
  add column if not exists descr text;

-- Add clinical/display fields to bacterio_bacteria
alter table bacterio_bacteria
  add column if not exists shape text,
  add column if not exists freq text,
  add column if not exists o2 text,
  add column if not exists urgence boolean default false,
  add column if not exists declaration boolean default false,
  add column if not exists bsl3 boolean default false,
  add column if not exists identif text,
  add column if not exists antibio text,
  add column if not exists resist_nat text[],
  add column if not exists resist_acq text[],
  add column if not exists virulence text[];

-- Unique constraint on bacteria name enables upsert by name
alter table bacterio_bacteria
  add constraint bacterio_bacteria_name_key unique (name);
