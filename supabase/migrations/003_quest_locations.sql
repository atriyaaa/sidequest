begin;

-- Each personal quest record can have an optional location.

alter table public.quest_progress
  add column city_id bigint,
  add column city_name text,
  add column city_region text,
  add column city_country text,
  add column city_latitude double precision,
  add column city_longitude double precision;


-- Keep the location complete when one is attached.
-- Existing quests can keep all location fields empty.

alter table public.quest_progress
add constraint quest_location_is_complete
check (
  (
    city_id is null
    and city_name is null
    and city_region is null
    and city_country is null
    and city_latitude is null
    and city_longitude is null
  )
  or
  (
    city_id is not null
    and city_name is not null
    and char_length(btrim(city_name)) > 0
    and city_region is not null
    and city_country is not null
    and city_latitude is not null
    and city_longitude is not null
    and city_latitude between -90 and 90
    and city_longitude between -180 and 180
  )
);

commit;