import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router'
import type { ItemsLoad, MediaItem } from '../types/media'
import { useGenres } from '../hooks/useGenres'
import { ItemsStatus } from '../components/ItemsStatus'

type MediaDetailsPageProps = {
    items: MediaItem[]
    load: ItemsLoad
    onRetry: () => void
    onDelete: (id: string) => Promise<void>
}

const kindLabels: Record<string, string> = {
    movie: 'Фильм',
    series: 'Сериал',
}

const statusLabels: Record<string, string> = {
    planned: 'Запланировано',
    watching: 'Смотрю',
    watched: 'Просмотрено',
}

export function MediaDetailsPage({ items, load, onRetry, onDelete }: MediaDetailsPageProps) {
    const { id } = useParams()
    const navigate = useNavigate()
    const { load: genresLoad } = useGenres()
    const [deleting, setDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState('')

    // Пока список не загружен, нельзя говорить «запись не найдена».
    if (load.status !== 'success') {
        return (
            <section>
                <ItemsStatus load={load} onRetry={onRetry} />
            </section>
        )
    }

    const item = items.find((media) => media.id === id)

    // Чужая запись скрыта RLS и выглядит так же, как несуществующая.
    if (!item) {
        return (
            <section>
                <h1>Запись не найдена</h1>
                <p>Такой записи нет в каталоге.</p>
                <Link to="/media">К списку записей</Link>
            </section>
        )
    }

    const genreName = genresLoad.status === 'success'
        ? genresLoad.data.find((genre) => genre.id === item.genre)?.name
        : undefined

    async function handleDelete(target: MediaItem) {
        if (deleting) return
        if (!window.confirm(`Удалить запись «${target.title}»?`)) return

        setDeleting(true)
        setDeleteError('')
        try {
            await onDelete(target.id)
            navigate('/media', { replace: true })
        } catch (error: unknown) {
            setDeleteError(error instanceof Error
                ? error.message : 'Не удалось удалить запись.')
            setDeleting(false)
        }
    }

    return (
        <section>
            <h1>{item.title}</h1>
            <p>{item.description}</p>
            <p>Тип: {kindLabels[item.kind]}</p>
            <p>Год выхода: {item.year}</p>
            <p>Жанр: {genreName ?? item.genre}</p>
            <p>Статус просмотра: {statusLabels[item.status]}</p>
            <p>Оценка: {item.rating} из 10</p>
            <p>В избранном: {item.favorite ? 'да' : 'нет'}</p>

            {deleteError && <p role="alert">{deleteError}</p>}

            <div className="actions">
                <Link to={`/media/${item.id}/edit`}>Редактировать</Link>

                <button type="button" disabled={deleting}
                    onClick={() => void handleDelete(item)}>
                    {deleting ? 'Удаляем…' : 'Удалить'}
                </button>

                <Link to="/media">К списку записей</Link>
            </div>
        </section>
    )
}
