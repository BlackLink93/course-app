import type { Genre } from '../types/genre'

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

const genresUrl = `${import.meta.env.BASE_URL}demo/genres.json`

export async function getGenres(signal: AbortSignal): Promise<Genre[]> {
    const response = await fetch(genresUrl, {
        signal,
        cache: 'no-store',
    })
    if (!response.ok) {
        throw new Error(`Не удалось загрузить жанры: HTTP ${response.status}`)
    }
    const value: unknown = await response.json()
    return parseGenres(value)
}
