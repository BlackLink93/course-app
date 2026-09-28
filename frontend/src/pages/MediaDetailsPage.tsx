import { Link, useParams } from 'react-router'
import { mediaItems } from '../data/media'

const kindLabels: Record<string, string> = {
    movie: 'Фильм',
    series: 'Сериал',
}

const statusLabels: Record<string, string> = {
    planned: 'Запланировано',
    watching: 'Смотрю',
    watched: 'Просмотрено',
}

export function MediaDetailsPage() {
    const { id } = useParams()
    const item = mediaItems.find((media) => media.id === id)

    if (!item) {
        return (
            <section>
                <h1>Запись не найдена</h1>
                <p>Такой записи нет в каталоге.</p>
                <Link to="/media">К списку записей</Link>
            </section>
        )
    }

    return (
        <section>
            <h1>{item.title}</h1>
            <p>{item.description}</p>
            <p>Тип: {kindLabels[item.kind]}</p>
            <p>Год выхода: {item.year}</p>
            <p>Жанр: {item.genre}</p>
            <p>Статус просмотра: {statusLabels[item.status]}</p>
            <p>Оценка: {item.rating} из 10</p>
            <p>В избранном: {item.favorite ? 'да' : 'нет'}</p>
            <Link to="/media">К списку записей</Link>
        </section>
    )
}
