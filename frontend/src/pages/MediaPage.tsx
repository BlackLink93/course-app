import { useState } from 'react'
import { Link } from 'react-router'
import { MediaCard } from '../components/MediaCard'
import type { MediaItem, WatchStatus } from '../types/media'

type MediaPageProps = { items: MediaItem[] }

export function MediaPage({ items }: MediaPageProps) {
    const [status, setStatus] = useState<WatchStatus | 'all'>('all')

    const visibleItems = items.filter((item) =>
        status === 'all' || item.status === status
    )

    return (
        <section>
            <h1>Мои фильмы и сериалы</h1>
            <Link to="/media/new">Добавить запись</Link>

            <div className="filter">
                <label htmlFor="status-filter">Статус просмотра</label>
                <select id="status-filter" value={status} onChange={(e) => {
                    const value = e.target.value
                    if (value === 'all' || value === 'planned' || value === 'watching' || value === 'watched') {
                        setStatus(value)
                    }
                }}>
                    <option value="all">Все</option>
                    <option value="planned">Запланировано</option>
                    <option value="watching">Смотрю</option>
                    <option value="watched">Просмотрено</option>
                </select>
                <button type="button" onClick={() => setStatus('all')}>Сбросить фильтр</button>
            </div>

            {items.length === 0 ? (
                <p>Записей пока нет.</p>
            ) : visibleItems.length === 0 ? (
                <p>Нет записей с таким статусом.</p>
            ) : (
                <div className="media-list">
                    {visibleItems.map((item) => (
                        <MediaCard key={item.id} item={item} />
                    ))}
                </div>
            )}
        </section>
    )
}