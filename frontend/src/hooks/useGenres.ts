import { useEffect, useState } from 'react'
import type { Genre } from '../types/genre'
import { getGenres } from '../services/genres'

type GenresLoad =
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'success'; data: Genre[] }

export function useGenres() {
    const [load, setLoad] = useState<GenresLoad>({ status: 'loading' })
    const [attempt, setAttempt] = useState(0)

    useEffect(() => {
        const controller = new AbortController()
        let active = true

        // Состояние loading здесь не выставляем: при первом запуске оно уже
        // начальное, а при повторе его заранее ставит retry(). Синхронный
        // setState в теле эффекта запрещает правило react-hooks/set-state-in-effect.
        getGenres(controller.signal)
            .then((data) => {
                if (active) setLoad({ status: 'success', data })
            })
            .catch((error: unknown) => {
                if (!active) return
                const message = error instanceof Error
                    ? error.message : 'Не удалось загрузить справочник.'
                setLoad({ status: 'error', message })
            })

        return () => {
            active = false
            controller.abort()
        }
    }, [attempt])

    function retry() {
        setLoad({ status: 'loading' })
        setAttempt((current) => current + 1)
    }

    return { load, retry }
}
