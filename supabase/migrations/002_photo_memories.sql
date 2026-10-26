begin;

-- 1. Create private storage for journal photos.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'journal-photos',
  'journal-photos',
  false,
  5242880,
  array[
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
);


-- 2. Store the photo's path alongside its journal entry.
--
-- Example path:
-- USER_ID/QUEST_ID/UNIQUE_FILENAME.jpg

alter table public.journal_entries
add column photo_path text;


-- A journal entry can only reference a photo inside
-- that person's folder and that quest's subfolder.

alter table public.journal_entries
add constraint journal_photo_path_matches_owner
check (
  photo_path is null
  or (
    split_part(photo_path, '/', 1) = user_id::text
    and split_part(photo_path, '/', 2) = quest_id
    and split_part(photo_path, '/', 3) <> ''
    and array_length(string_to_array(photo_path, '/'), 1) = 3
  )
);


-- 3. Allow people to upload into their own folder.

create policy "Upload own journal photos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'journal-photos'
  and (storage.foldername(name))[1] =
    (select auth.uid())::text
);


-- 4. Allow people to view their own photos.

create policy "Read own journal photos"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'journal-photos'
  and (storage.foldername(name))[1] =
    (select auth.uid())::text
);


-- 5. Allow people to remove their own photos.

create policy "Delete own journal photos"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'journal-photos'
  and (storage.foldername(name))[1] =
    (select auth.uid())::text
);

commit;