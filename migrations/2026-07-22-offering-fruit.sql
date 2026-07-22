-- Add "fruit" (a basket of fruit) to the allowed offering types.
-- Run in the Supabase SQL Editor (originalbotanica-membership project).

alter table public.ancestor_offerings
  drop constraint if exists ancestor_offerings_offering_type_check;

alter table public.ancestor_offerings
  add constraint ancestor_offerings_offering_type_check
  check (offering_type in ('water', 'flowers', 'coffee', 'fruit', 'ancestor_money'));
