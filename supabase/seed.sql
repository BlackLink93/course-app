-- Справочник жанров. Те же id, что в public/demo/genres.json из ЛР 4.
insert into public.genres (id, name)
values
  ('sci-fi', 'Фантастика'),
  ('drama', 'Драма'),
  ('thriller', 'Триллер'),
  ('comedy', 'Комедия'),
  ('crime', 'Криминал'),
  ('animation', 'Анимация')
on conflict (id) do update
set name = excluded.name;
