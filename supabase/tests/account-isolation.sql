begin;

-- Pick an existing memory with an uploaded photo.
-- Its owner becomes our first test identity.

do $$
declare
  memory_owner uuid;
  memory_quest text;
  memory_photo text;
  other_identity uuid;
begin
  select
    journal.user_id,
    journal.quest_id,
    journal.photo_path
  into
    memory_owner,
    memory_quest,
    memory_photo
  from public.journal_entries as journal
  join storage.objects as photo
    on photo.bucket_id = 'journal-photos'
    and photo.name = journal.photo_path
  where journal.photo_path is not null
  limit 1;

  if memory_owner is null then
    raise exception
      'Preparation needed: save a journal entry with an uploaded photo first.';
  end if;

  if not exists (
    select 1
    from storage.buckets
    where id = 'journal-photos'
      and public = false
  ) then
    raise exception
      'Privacy check failed: journal-photos must be a private bucket.';
  end if;

  other_identity := gen_random_uuid();

  -- Save identifiers only for this transaction.
  perform set_config(
    'sidequest.test_owner',
    memory_owner::text,
    true
  );

  perform set_config(
    'sidequest.test_quest',
    memory_quest,
    true
  );

  perform set_config(
    'sidequest.test_photo',
    memory_photo,
    true
  );

  perform set_config(
    'sidequest.test_other',
    other_identity::text,
    true
  );

  -- Simulate the owner being signed in.
  perform set_config(
    'request.jwt.claim.sub',
    memory_owner::text,
    true
  );

  perform set_config(
    'request.jwt.claims',
    jsonb_build_object(
      'sub', memory_owner,
      'role', 'authenticated'
    )::text,
    true
  );
end;
$$;


-- Use the same database role as a signed-in visitor.
set local role authenticated;


-- CHECK 1:
-- The owner can read their progress, journal entry,
-- and photo's storage record.

do $$
declare
  owner_id uuid :=
    current_setting('sidequest.test_owner')::uuid;

  quest text :=
    current_setting('sidequest.test_quest');

  photo_path text :=
    current_setting('sidequest.test_photo');
begin
  if auth.uid() is distinct from owner_id then
    raise exception 'Test setup failed: owner identity was not applied.';
  end if;

  if not exists (
    select 1
    from public.quest_progress
    where user_id = owner_id
      and quest_id = quest
  ) then
    raise exception 'Owner cannot read their quest progress.';
  end if;

  if not exists (
    select 1
    from public.journal_entries
    where user_id = owner_id
      and quest_id = quest
  ) then
    raise exception 'Owner cannot read their journal entry.';
  end if;

  if not exists (
    select 1
    from storage.objects
    where bucket_id = 'journal-photos'
      and name = photo_path
  ) then
    raise exception 'Owner cannot read their photo storage record.';
  end if;
end;
$$;


-- Switch to a different simulated signed-in identity.
-- This doesn't create an account or send an email.

select set_config(
  'request.jwt.claim.sub',
  current_setting('sidequest.test_other'),
  true
);

select set_config(
  'request.jwt.claims',
  jsonb_build_object(
    'sub', current_setting('sidequest.test_other'),
    'role', 'authenticated'
  )::text,
  true
);


-- CHECK 2:
-- Another identity cannot read the owner's private records.

do $$
declare
  owner_id uuid :=
    current_setting('sidequest.test_owner')::uuid;

  photo_path text :=
    current_setting('sidequest.test_photo');
begin
  if auth.uid() is distinct from
    current_setting('sidequest.test_other')::uuid
  then
    raise exception 'Test setup failed: second identity was not applied.';
  end if;

  if exists (
    select 1
    from public.quest_progress
    where user_id = owner_id
  ) then
    raise exception 'Privacy failure: another identity can read progress.';
  end if;

  if exists (
    select 1
    from public.journal_entries
    where user_id = owner_id
  ) then
    raise exception 'Privacy failure: another identity can read journal entries.';
  end if;

  if exists (
    select 1
    from storage.objects
    where bucket_id = 'journal-photos'
      and name = photo_path
  ) then
    raise exception 'Privacy failure: another identity can read photo metadata.';
  end if;
end;
$$;


-- CHECK 3:
-- Another identity cannot insert progress using the owner's ID.

do $$
declare
  rejected boolean := false;
begin
  begin
    insert into public.quest_progress (
      user_id,
      quest_id
    )
    values (
      current_setting('sidequest.test_owner')::uuid,
      current_setting('sidequest.test_quest')
    );
  exception
    when insufficient_privilege then
      rejected := true;
  end;

  if not rejected then
    raise exception
      'Privacy failure: inserting another person''s progress was not rejected.';
  end if;
end;
$$;


-- CHECK 4:
-- Another identity cannot update the owner's progress.

do $$
declare
  changed_rows integer;
begin
  update public.quest_progress
  set is_saved = not is_saved
  where user_id =
    current_setting('sidequest.test_owner')::uuid
    and quest_id =
    current_setting('sidequest.test_quest');

  get diagnostics changed_rows = row_count;

  if changed_rows <> 0 then
    raise exception
      'Privacy failure: another identity updated the owner''s progress.';
  end if;
end;
$$;


-- CHECK 5:
-- Another identity cannot update or delete the owner's memory.

do $$
declare
  changed_rows integer;
begin
  update public.journal_entries
  set body = 'Temporary isolation test'
  where user_id =
    current_setting('sidequest.test_owner')::uuid
    and quest_id =
    current_setting('sidequest.test_quest');

  get diagnostics changed_rows = row_count;

  if changed_rows <> 0 then
    raise exception
      'Privacy failure: another identity updated the owner''s memory.';
  end if;

  delete from public.journal_entries
  where user_id =
    current_setting('sidequest.test_owner')::uuid
    and quest_id =
    current_setting('sidequest.test_quest');

  get diagnostics changed_rows = row_count;

  if changed_rows <> 0 then
    raise exception
      'Privacy failure: another identity deleted the owner''s memory.';
  end if;
end;
$$;


-- Return to the SQL Editor's original role.
reset role;

-- Undo all test changes and temporary identity settings.
rollback;