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
    genre: string
    favorite: boolean
}