-- ЛР 5. Схема каталога фильмов и сериалов.
-- genres        — публичный справочник жанров (читают все, изменять из браузера нельзя).
-- media_entries — личные записи пользователя; до ЛР 6 закрыты от клиентских ролей.

create table public.genres (
  id text primary key,
  name text not null unique,
  constraint genres_id_not_blank
    check (id = btrim(id) and id <> ''),
  constraint genres_name_not_blank
    check (name = btrim(name) and name <> '')
);

create table public.media_entries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  genre_id text not null references public.genres(id)
    on update cascade on delete restrict,
  title text not null,
  description text not null default '',
  kind text not null,
  status text not null,
  release_year integer not null,
  rating integer not null,
  favorite boolean not null default false,
  created_at timestamptz not null default now(),
  constraint media_entries_title_length
    check (char_length(btrim(title)) between 3 and 100),
  constraint media_entries_description_length
    check (char_length(description) <= 500),
  constraint media_entries_kind_allowed
    check (kind in ('movie', 'series')),
  constraint media_entries_status_allowed
    check (status in ('planned', 'watching', 'watched')),
  constraint media_entries_release_year_range
    check (release_year between 1888 and 2100),
  constraint media_entries_rating_range
    check (rating between 1 and 10)
);

-- Доступ: RLS на обеих таблицах, клиентские права сначала отзываем.
alter table public.genres enable row level security;
alter table public.media_entries enable row level security;

revoke all on table public.genres from anon, authenticated;
revoke all on table public.media_entries from anon, authenticated;

-- Справочник: только чтение для всех.
grant select on table public.genres to anon, authenticated;

create policy "genres are publicly readable"
on public.genres
for select
to anon, authenticated
using (true);

-- У media_entries в ЛР 5 нет ни прав, ни политик: браузер её не видит.
