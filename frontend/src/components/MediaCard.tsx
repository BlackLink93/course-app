import { Link } from 'react-router'
import type { MediaItem } from '../types/media'

type MediaCardProps = { item: MediaItem }

const kindLabels: Record<string, string> = {
    movie: 'Фильм',
    series: 'Сериал',
}

const statusLabels: Record<string, string> = {
    planned: 'Запланировано',
    watching: 'Смотрю',
    watched: 'Просмотрено',
}

export function MediaCard({ item }: MediaCardProps) {
    return (
        <article className="media-card">
            <h2>
                <Link to={`/media/${item.id}`}>{item.title}</Link>
            </h2>
            <p>{item.description}</p>
            <p>{kindLabels[item.kind]}, {item.year}</p>
            <p>Статус: {statusLabels[item.status]}</p>
            <p>Оценка: {item.rating} из 10</p>
        </article>
    )
}