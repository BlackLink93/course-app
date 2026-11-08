-- ЛР 6. Личные записи доступны только их владельцу.
-- Миграцию ЛР 5 (202611082300_initial_schema.sql) не изменяем.

-- Владелец новой строки по умолчанию — текущий пользователь сессии.
alter table public.media_entries
  alter column owner_id set default auth.uid();

-- anon по-прежнему не получает ничего; authenticated — четыре операции.
revoke all on table public.media_entries from anon, authenticated;
grant select, insert, update, delete
  on table public.media_entries to authenticated;

create policy "media_entries select own"
on public.media_entries for select to authenticated
using ((select auth.uid()) is not null
  and (select auth.uid()) = owner_id);

create policy "media_entries insert own"
on public.media_entries for insert to authenticated
with check ((select auth.uid()) is not null
  and (select auth.uid()) = owner_id);

-- USING защищает исходную строку, WITH CHECK не даёт передать её другому владельцу.
create policy "media_entries update own"
on public.media_entries for update to authenticated
using ((select auth.uid()) is not null
  and (select auth.uid()) = owner_id)
with check ((select auth.uid()) is not null
  and (select auth.uid()) = owner_id);

create policy "media_entries delete own"
on public.media_entries for delete to authenticated
using ((select auth.uid()) is not null
  and (select auth.uid()) = owner_id);

-- Справочник genres сохраняет публичный SELECT из ЛР 5.
