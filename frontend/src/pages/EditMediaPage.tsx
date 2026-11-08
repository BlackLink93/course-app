import { Link, useParams, useNavigate } from 'react-router'
import { MediaForm } from '../components/MediaForm'
import { ItemsStatus } from '../components/ItemsStatus'
import type { ItemsLoad, MediaItem, MediaDraft } from '../types/media'

type EditMediaPageProps = {
    items: MediaItem[]
    load: ItemsLoad
    onRetry: () => void
    onUpdate: (id: string, draft: MediaDraft) => Promise<void>
}

export function EditMediaPage({ items, load, onRetry, onUpdate }: EditMediaPageProps) {
    const { id } = useParams()
    const navigate = useNavigate()

    // Пока список не загружен, нельзя говорить «запись не найдена».
    if (load.status !== 'success') {
        return (
            <section>
                <h1>Редактирование записи</h1>
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

    const initialValues: MediaDraft = {
        title: item.title,
        description: item.description,
        kind: item.kind,
        status: item.status,
        year: item.year,
        rating: item.rating,
        genre: item.genre,
        favorite: item.favorite,
    }

    return (
        <section>
            <h1>Редактирование записи</h1>
            <MediaForm
                key={item.id}
                initialValues={initialValues}
                onSave={async (draft) => {
                    await onUpdate(item.id, draft)
                    navigate(`/media/${item.id}`)
                }}
                onCancel={() => navigate(`/media/${item.id}`)}
            />
        </section>
    )
}
