import { useState } from 'react'
import type { FormEvent } from 'react'
import type { MediaDraft } from '../types/media'

type MediaFormProps = {
    initialValues: MediaDraft
    onSave: (draft: MediaDraft) => void
    onCancel: () => void
}

export function MediaForm(props: MediaFormProps) {
    const [draft, setDraft] = useState(() => ({ ...props.initialValues }))
    const [error, setError] = useState('')

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const title = draft.title.trim()
        if (title.length < 3 || title.length > 100) {
            setError('Название должно содержать от 3 до 100 символов.')
            return
        }
        if (!draft.year) {
            setError('Укажите год выхода.')
            return
        }
        if (draft.rating < 1 || draft.rating > 10) {
            setError('Оценка должна быть от 1 до 10.')
            return
        }

        setError('')
        props.onSave({ ...draft, title })
    }

    return (
        <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="media-title">Название</label>
            <input id="media-title" value={draft.title} required
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />

            <label htmlFor="media-description">Описание</label>
            <textarea id="media-description" value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />

            <label htmlFor="media-kind">Тип</label>
            <select id="media-kind" value={draft.kind} onChange={(e) => {
                const kind = e.target.value
                if (kind === 'movie' || kind === 'series') {
                    setDraft({ ...draft, kind })
                }
            }}>
                <option value="movie">Фильм</option>
                <option value="series">Сериал</option>
            </select>

            <label htmlFor="media-status">Статус просмотра</label>
            <select id="media-status" value={draft.status} onChange={(e) => {
                const status = e.target.value
                if (status === 'planned' || status === 'watching' || status === 'watched') {
                    setDraft({ ...draft, status })
                }
            }}>
                <option value="planned">Запланировано</option>
                <option value="watching">Смотрю</option>
                <option value="watched">Просмотрено</option>
            </select>

            <label htmlFor="media-year">Год выхода</label>
            <input id="media-year" type="number" value={draft.year} required
                onChange={(e) => setDraft({ ...draft, year: Number(e.target.value) })}
            />

            <label htmlFor="media-rating">Оценка</label>
            <input id="media-rating" type="number" value={draft.rating}
                onChange={(e) => setDraft({ ...draft, rating: Number(e.target.value) })}
            />

            <label htmlFor="media-genre">Жанр</label>
            <input id="media-genre" value={draft.genre}
                onChange={(e) => setDraft({ ...draft, genre: e.target.value })}
            />

            <label htmlFor="media-favorite">В избранном</label>
            <input id="media-favorite" type="checkbox" checked={draft.favorite}
                onChange={(e) => setDraft({ ...draft, favorite: e.target.checked })}
            />

            {error && <p role="alert">{error}</p>}

            <button type="submit">Сохранить</button>
            <button type="button" onClick={props.onCancel}>Отмена</button>
        </form>
    )
}

