export type MediaKind = 'movie' | 'series'
export type WatchStatus = 'planned' | 'watching' | 'watched'

export type MediaItem = {
    id: string
    title: string
    description: string
    kind: MediaKind
    status: WatchStatus
    year: number
    rating: number
    genre: string // id жанра из таблицы genres в Supabase (в БД — genre_id)
    favorite: boolean
}
export type MediaDraft = Omit<MediaItem, 'id'>

// Состояние загрузки личного списка из Supabase.
export type ItemsLoad =
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'success' }
