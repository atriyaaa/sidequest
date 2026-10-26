begin;

-- 1. Shared quest catalogue.
-- Everyone signed in can read it.
-- Only database administrators can change it.

create table public.quests (
  id text primary key,
  title text not null,
  xp integer not null check (xp > 0),
  created_at timestamptz not null default now()
);

insert into public.quests (id, title, xp)
values
  ('scenic-route', 'Take the scenic route', 50),
  ('table-for-one', 'A table for one', 40),
  ('collect-a-colour', 'Collect a colour', 40),
  ('little-sunshine', 'Send a little sunshine', 30),
  ('green-escape', 'A little green escape', 35),
  ('golden-hour', 'Catch the golden hour', 45);


-- 2. Each person's relationship with a quest.
-- One row per person, per quest.

create table public.quest_progress (
  user_id uuid not null
    default auth.uid()
    references auth.users(id) on delete cascade,

  quest_id text not null
    references public.quests(id),

  is_saved boolean not null default false,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),

  primary key (user_id, quest_id),

  constraint completion_requires_start
    check (
      completed_at is null
      or (
        started_at is not null
        and completed_at >= started_at
      )
    )
);


-- 3. Personal journal entries.
-- One memory per person, per quest.

create table public.journal_entries (
  user_id uuid not null default auth.uid(),
  quest_id text not null,

  body text not null
    check (
      char_length(btrim(body)) between 1 and 2000
    ),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  primary key (user_id, quest_id),

  foreign key (user_id, quest_id)
    references public.quest_progress(user_id, quest_id)
    on delete cascade
);


-- Keep journal edit timestamps accurate automatically.

create function public.set_journal_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger journal_updated_at
before update on public.journal_entries
for each row
execute function public.set_journal_updated_at();


-- 4. Enable database privacy rules on every table.

alter table public.quests enable row level security;
alter table public.quest_progress enable row level security;
alter table public.journal_entries enable row level security;


-- Remove automatic browser permissions before adding
-- only the permissions this app needs.

revoke all on table public.quests
  from public, anon, authenticated;

revoke all on table public.quest_progress
  from public, anon, authenticated;

revoke all on table public.journal_entries
  from public, anon, authenticated;


-- Signed-in people can read the shared catalogue.

grant select on table public.quests
  to authenticated;

create policy "Signed-in users can read quests"
on public.quests
for select
to authenticated
using (true);


-- People can read, create, and update their own progress.

grant select, insert, update
on table public.quest_progress
to authenticated;

create policy "Read own quest progress"
on public.quest_progress
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Create own quest progress"
on public.quest_progress
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Update own quest progress"
on public.quest_progress
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);


-- People can read, create, update, and delete
-- only their own journal entries.

grant select, insert, update, delete
on table public.journal_entries
to authenticated;

create policy "Read own journal entries"
on public.journal_entries
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Create own journal entries"
on public.journal_entries
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Update own journal entries"
on public.journal_entries
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Delete own journal entries"
on public.journal_entries
for delete
to authenticated
using ((select auth.uid()) = user_id);

commit;