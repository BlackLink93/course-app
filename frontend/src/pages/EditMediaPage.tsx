import { Link, useParams, useNavigate } from 'react-router'
import { MediaForm } from '../components/MediaForm'
import type { MediaItem, MediaDraft } from '../types/media'

type EditMediaPageProps = {
    items: MediaItem[]
    onUpdate: (id: string, draft: MediaDraft) => void
}

export function EditMediaPage({ items, onUpdate }: EditMediaPageProps) {
    const { id } = useParams()
    const navigate = useNavigate()
    const item = items.find((media) => media.id === id)

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
                onSave={(draft) => {
                    onUpdate(item.id, draft)
                    navigate(`/media/${item.id}`)
                }}
                onCancel={() => navigate(`/media/${item.id}`)}
            />
        </section>
    )
}