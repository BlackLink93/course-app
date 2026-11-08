import type { MediaDraft, MediaItem } from '../types/media'
import { supabase } from '../lib/supabase'

// Строка таблицы media_entries: имена столбцов PostgreSQL (snake_case).
type MediaRow = {
    id: string
    owner_id: string
    genre_id: string
    title: string
    description: string
    kind: MediaItem['kind']
    status: MediaItem['status']
    release_year: number
    rating: number
    favorite: boolean
    created_at: string
}

const mediaColumns =
    'id, owner_id, genre_id, title, description, kind, status, release_year, rating, favorite, created_at'

// Строка БД → запись интерфейса (camelCase и привычные поля genre, year).
function fromRow(row: MediaRow): MediaItem {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        kind: row.kind,
        status: row.status,
        year: row.release_year,
        rating: row.rating,
        genre: row.genre_id,
        favorite: row.favorite,
    }
}

// Черновик → объект для записи. Без id, owner_id и created_at:
// их задаёт база (owner_id = auth.uid() по умолчанию).
function toWrite(draft: MediaDraft) {
    return {
        genre_id: draft.genre,
        title: draft.title.trim(),
        description: draft.description.trim(),
        kind: draft.kind,
        status: draft.status,
        release_year: draft.year,
        rating: draft.rating,
        favorite: draft.favorite,
    }
}

export async function getMediaEntries(): Promise<MediaItem[]> {
    // Условие владельца добавляет RLS; отдельный фильтр owner_id не нужен.
    const { data, error } = await supabase
        .from('media_entries')
        .select(mediaColumns)
        .order('created_at', { ascending: false })
        .overrideTypes<MediaRow[], { merge: false }>()

    if (error) throw new Error(`Не удалось загрузить записи: ${error.message}`)
    return data.map(fromRow)
}

export async function createMediaEntry(draft: MediaDraft): Promise<MediaItem> {
    const { data, error } = await supabase
        .from('media_entries')
        .insert(toWrite(draft))
        .select(mediaColumns)
        .single()
        .overrideTypes<MediaRow, { merge: false }>()

    if (error) throw new Error(`Не удалось создать запись: ${error.message}`)
    return fromRow(data)
}

export async function updateMediaEntry(id: string, draft: MediaDraft): Promise<void> {
    const { error } = await supabase
        .from('media_entries')
        .update(toWrite(draft))
        .eq('id', id)

    if (error) throw new Error(`Не удалось изменить запись: ${error.message}`)
}

export async function deleteMediaEntry(id: string): Promise<void> {
    const { error } = await supabase
        .from('media_entries')
        .delete()
        .eq('id', id)

    if (error) throw new Error(`Не удалось удалить запись: ${error.message}`)
}
