import { useNavigate } from 'react-router'
import { MediaForm } from '../components/MediaForm'
import type { MediaDraft } from '../types/media'

type NewMediaPageProps = {
    onCreate: (draft: MediaDraft) => Promise<string>
}

const emptyMedia: MediaDraft = {
    title: '',
    description: '',
    kind: 'movie',
    status: 'planned',
    year: 2026,
    rating: 1,
    genre: '',
    favorite: false,
}

export function NewMediaPage({ onCreate }: NewMediaPageProps) {
    const navigate = useNavigate()

    // Ошибку создания перехватит форма и покажет рядом с кнопкой,
    // а введённые значения останутся на месте.
    async function handleSave(draft: MediaDraft) {
        const id = await onCreate(draft)
        navigate(`/media/${id}`)
    }

    return (
        <section>
            <h1>Добавление записи</h1>
            <MediaForm
                initialValues={emptyMedia}
                onSave={handleSave}
                onCancel={() => navigate('/media')}
            />
        </section>
    )
}
