import { useState } from 'react'
import type { FormEvent } from 'react'
import type { MediaDraft } from '../types/media'
import { useGenres } from '../hooks/useGenres'

// Первый сохранившийся фильм снят в 1888 году. Верхняя граница оставляет
// запас для анонсированных фильмов, которые ещё не вышли.
const minYear = 1888
const maxYear = new Date().getFullYear() + 5
const maxDescriptionLength = 500

// Оставляет в строке только цифры и обрезает её до нужной длины.
function onlyDigits(value: string, maxLength: number): string {
    return value.replace(/\D/g, '').slice(0, maxLength)
}

type Field = 'title' | 'year' | 'rating' | 'description'
type FieldErrors = Partial<Record<Field, string>>

type MediaFormProps = {
    initialValues: MediaDraft
    onSave: (draft: MediaDraft) => void
    onCancel: () => void
}

export function MediaForm(props: MediaFormProps) {
    const [draft, setDraft] = useState(() => ({ ...props.initialValues }))
    const [error, setError] = useState('')
    // Год и оценку храним как текст, пока человек печатает: иначе пустое поле
    // превращается в 0 и его нельзя стереть. В число переводим при сохранении.
    const [yearText, setYearText] = useState(() => String(props.initialValues.year))
    const [ratingText, setRatingText] = useState(() => String(props.initialValues.rating))
    const { load, retry } = useGenres()
    const genres = load.status === 'success' ? load.data : []
    const selectedGenreExists = genres.some((genre) => genre.id === draft.genre)
    const canSave = load.status === 'success' && selectedGenreExists

    // Поле показывает ошибку после того, как из него ушли, или после попытки
    // сохранить. Так сообщения не появляются, пока человек ещё ничего не ввёл.
    const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({})
    const [submitted, setSubmitted] = useState(false)

    function validate(): FieldErrors {
        const errors: FieldErrors = {}

        const title = draft.title.trim()
        if (title === '') {
            errors.title = 'Укажите название.'
        } else if (title.length < 3 || title.length > 100) {
            errors.title = 'Название должно содержать от 3 до 100 символов.'
        }

        const yearValue = yearText.trim()
        if (yearValue === '') {
            errors.year = 'Укажите год выхода.'
        } else if (!/^\d{4}$/.test(yearValue)) {
            errors.year = 'Год выхода должен состоять из четырёх цифр.'
        } else if (Number(yearValue) < minYear || Number(yearValue) > maxYear) {
            errors.year = `Год выхода должен быть от ${minYear} до ${maxYear}.`
        }

        const ratingValue = ratingText.trim()
        if (ratingValue === '') {
            errors.rating = 'Укажите оценку.'
        } else if (!/^\d+$/.test(ratingValue) ||
            Number(ratingValue) < 1 || Number(ratingValue) > 10) {
            errors.rating = 'Оценка должна быть целым числом от 1 до 10.'
        }

        if (draft.description.trim().length > maxDescriptionLength) {
            errors.description =
                `Описание должно быть не длиннее ${maxDescriptionLength} символов.`
        }

        return errors
    }

    const fieldErrors = validate()

    function shownError(field: Field): string | undefined {
        return touched[field] || submitted ? fieldErrors[field] : undefined
    }

    function markTouched(field: Field) {
        setTouched((current) => ({ ...current, [field]: true }))
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (!canSave) {
            setError('Дождитесь справочника и выберите доступный жанр.')
            return
        }

        setSubmitted(true)
        if (Object.keys(fieldErrors).length > 0) {
            setError('Заполните обязательные поля и исправьте ошибки, отмеченные выше.')
            return
        }

        setError('')
        props.onSave({
            ...draft,
            title: draft.title.trim(),
            description: draft.description.trim(),
            year: Number(yearText.trim()),
            rating: Number(ratingText.trim()),
        })
    }

    return (
        <form onSubmit={handleSubmit} noValidate>
            <p className="form-note">
                Поля, отмеченные <span className="required-mark">*</span>, обязательны для заполнения.
            </p>

            <label htmlFor="media-title">
                Название <span className="required-mark">*</span>
            </label>
            <input id="media-title" value={draft.title} required maxLength={100}
                aria-invalid={shownError('title') ? true : undefined}
                aria-describedby={shownError('title') ? 'media-title-error' : undefined}
                onBlur={() => markTouched('title')}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
            {shownError('title') && (
                <p id="media-title-error" className="field-error">{shownError('title')}</p>
            )}

            <label htmlFor="media-description">Описание</label>
            <textarea id="media-description" value={draft.description}
                maxLength={maxDescriptionLength}
                aria-invalid={shownError('description') ? true : undefined}
                aria-describedby={shownError('description') ? 'media-description-error' : undefined}
                onBlur={() => markTouched('description')}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
            {shownError('description') && (
                <p id="media-description-error" className="field-error">
                    {shownError('description')}
                </p>
            )}

            <label htmlFor="media-kind">
                Тип <span className="required-mark">*</span>
            </label>
            <select id="media-kind" value={draft.kind} onChange={(e) => {
                const kind = e.target.value
                if (kind === 'movie' || kind === 'series') {
                    setDraft({ ...draft, kind })
                }
            }}>
                <option value="movie">Фильм</option>
                <option value="series">Сериал</option>
            </select>

            <label htmlFor="media-status">
                Статус просмотра <span className="required-mark">*</span>
            </label>
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

            <label htmlFor="media-year">
                Год выхода <span className="required-mark">*</span>
            </label>
            <input id="media-year" type="text" inputMode="numeric" value={yearText} required
                maxLength={4} placeholder="Например, 2014"
                aria-invalid={shownError('year') ? true : undefined}
                aria-describedby={shownError('year') ? 'media-year-error' : undefined}
                onBlur={() => markTouched('year')}
                onChange={(e) => setYearText(onlyDigits(e.target.value, 4))}
            />
            {shownError('year') && (
                <p id="media-year-error" className="field-error">{shownError('year')}</p>
            )}

            <label htmlFor="media-rating">
                Оценка <span className="required-mark">*</span>
            </label>
            <input id="media-rating" type="text" inputMode="numeric" value={ratingText} required
                maxLength={2} placeholder="От 1 до 10"
                aria-invalid={shownError('rating') ? true : undefined}
                aria-describedby={shownError('rating') ? 'media-rating-error' : undefined}
                onBlur={() => markTouched('rating')}
                onChange={(e) => setRatingText(onlyDigits(e.target.value, 2))}
            />
            {shownError('rating') && (
                <p id="media-rating-error" className="field-error">{shownError('rating')}</p>
            )}

            <label htmlFor="media-genre">
                Жанр <span className="required-mark">*</span>
            </label>
            <select id="media-genre" value={draft.genre} required
                disabled={load.status !== 'success' || genres.length === 0}
                onChange={(e) => setDraft({ ...draft, genre: e.target.value })}>
                <option value="">Выберите жанр</option>
                {draft.genre !== '' && !selectedGenreExists && (
                    <option value={draft.genre} disabled>
                        Текущий код: {draft.genre} — выберите доступный жанр
                    </option>
                )}
                {genres.map((genre) => (
                    <option key={genre.id} value={genre.id}>{genre.name}</option>
                ))}
            </select>

            {load.status === 'success' && (
                // Кнопка видна только после успешной загрузки. Нажатие переводит
                // справочник в loading, и на это время кнопка скрывается — так повторный
                // запрос нельзя запустить, пока идёт предыдущий.
                <button type="button" onClick={retry}>
                    Обновить справочник
                </button>
            )}
            {load.status === 'success' && genres.length > 0 && draft.genre === '' && (
                <p className="field-error">
                    Выберите жанр — без него кнопка «Сохранить» недоступна.
                </p>
            )}
            {load.status === 'loading' && (
                <p role="status">Загружаем жанры…</p>
            )}
            {load.status === 'error' && (
                <div>
                    <p role="alert">{load.message}</p>
                    <button type="button" onClick={retry}>Повторить</button>
                </div>
            )}
            {load.status === 'success' && genres.length === 0 && (
                <div>
                    <p role="status">Жанров пока нет. Сохранение недоступно.</p>
                    <button type="button" onClick={retry}>Повторить</button>
                </div>
            )}
            {load.status === 'success' && genres.length > 0 &&
                draft.genre !== '' && !selectedGenreExists && (
                <p role="status">
                    Жанра с кодом «{draft.genre}» нет в справочнике. Выберите доступный жанр.
                </p>
            )}

            <label htmlFor="media-favorite">В избранном</label>
            <input id="media-favorite" type="checkbox" checked={draft.favorite}
                onChange={(e) => setDraft({ ...draft, favorite: e.target.checked })}
            />

            {error && <p role="alert">{error}</p>}

            <button type="submit" disabled={!canSave}>Сохранить</button>
            <button type="button" onClick={props.onCancel}>Отмена</button>
        </form>
    )
}

