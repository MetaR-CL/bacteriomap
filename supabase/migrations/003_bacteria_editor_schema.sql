-- Rename o2 → atmosphere
alter table bacterio_bacteria rename column o2 to atmosphere;

-- Add missing jsonb columns
alter table bacterio_bacteria
  add column if not exists tests_rapides jsonb default '[]',
  add column if not exists antibiogramme jsonb default '[]';

-- Step 1: cast text[] → jsonb (produces a JSON string-array)
alter table bacterio_bacteria
  alter column milieux type jsonb
  using to_jsonb(milieux);

-- Step 2: convert each string element to {name, note, primary} object
update bacterio_bacteria
set milieux = (
  select jsonb_agg(jsonb_build_object('name', val, 'note', '', 'primary', false))
  from jsonb_array_elements_text(milieux) as val
)
where milieux is not null and jsonb_typeof(milieux) = 'array';

-- Null rows become empty array
update bacterio_bacteria
set milieux = '[]'::jsonb
where milieux is null;

-- Add display label to zones
alter table bacterio_zones
  add column if not exists label text;
