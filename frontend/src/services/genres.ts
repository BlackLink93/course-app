import type { Genre } from '../types/genre'
import { supabase } from '../lib/supabase'

function isGenre(value: unknown): value is Genre {
    if (typeof value !== 'object' || value === null) return false
    return (
        'id' in value && typeof value.id === 'string' &&
        value.id.trim().length > 0 && value.id === value.id.trim() &&
        'name' in value && typeof value.name === 'string' &&
        value.name.trim().length > 0
    )
}

export function parseGenres(value: unknown): Genre[] {
    if (!Array.isArray(value) || !value.every(isGenre)) {
        throw new Error('Неверная структура справочника жанров.')
    }
    const genres: Genre[] = value
    const ids = new Set(genres.map((genre) => genre.id))
    if (ids.size !== genres.length) {
        throw new Error('В справочнике повторяются идентификаторы.')
    }
    return genres
}

export async function getGenres(signal: AbortSignal): Promise<Genre[]> {
    const { data, error } = await supabase
        .from('genres')
        .select('id, name')
        .order('name')
        .abortSignal(signal)

    if (signal.aborted) {
        throw new DOMException('Запрос отменён', 'AbortError')
    }
    if (error) {
        throw new Error(`Не удалось загрузить жанры: ${error.message}`)
    }
    return parseGenres(data)
}
