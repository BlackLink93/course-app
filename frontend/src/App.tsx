import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { AppLayout } from './app/AppLayout'
import { RequireAuth } from './app/RequireAuth'
import { useAuth } from './hooks/useAuth'
import { AuthPage } from './pages/AuthPage'
import { MediaPage } from './pages/MediaPage'
import { MediaDetailsPage } from './pages/MediaDetailsPage'
import { NewMediaPage } from './pages/NewMediaPage'
import { EditMediaPage } from './pages/EditMediaPage'
import { NotFoundPage } from './pages/NotFoundPage'
import {
    createMediaEntry,
    deleteMediaEntry,
    getMediaEntries,
    updateMediaEntry,
} from './services/media'
import type { ItemsLoad, MediaDraft, MediaItem } from './types/media'
import './App.css'

// Результат загрузки помечен ключом «пользователь + номер попытки».
// Показываем его, только если ключ совпадает с текущим. Поэтому после выхода
// или входа другим аккаунтом список сразу становится пустым и не мелькают
// записи предыдущего пользователя.
type ItemsResult =
    | { key: string; status: 'success'; items: MediaItem[] }
    | { key: string; status: 'error'; message: string }

export default function App() {
    const auth = useAuth()
    const userId = auth.status === 'authenticated' ? auth.session.user.id : null

    const [attempt, setAttempt] = useState(0)
    const [result, setResult] = useState<ItemsResult | null>(null)
    const requestKey = userId ? `${userId}:${attempt}` : null

    // Первая загрузка списка и повтор после ошибки. Для гостя запросов нет.
    useEffect(() => {
        if (!userId) return
        const key = `${userId}:${attempt}`
        let active = true

        getMediaEntries()
            .then((items) => {
                if (active) setResult({ key, status: 'success', items })
            })
            .catch((error: unknown) => {
                if (!active) return
                setResult({
                    key,
                    status: 'error',
                    message: error instanceof Error
                        ? error.message : 'Не удалось загрузить записи.',
                })
            })

        return () => {
            active = false
            // Выход, смена аккаунта или новая попытка: прежний список
            // сразу удаляется из состояния.
            setResult(null)
        }
    }, [userId, attempt])

    const current = result !== null && result.key === requestKey ? result : null
    const items = current?.status === 'success' ? current.items : []
    const itemsLoad: ItemsLoad = current === null
        ? { status: 'loading' }
        : current.status === 'success'
            ? { status: 'success' }
            : { status: 'error', message: current.message }

    function retryItems() {
        setAttempt((value) => value + 1)
    }

    // Повторная загрузка после создания, изменения или удаления.
    // Ошибка повторной загрузки не отменяет уже выполненную операцию,
    // поэтому показывается как ошибка списка, а не формы.
    async function refreshItems() {
        if (!requestKey) return
        try {
            const fresh = await getMediaEntries()
            setResult({ key: requestKey, status: 'success', items: fresh })
        } catch (error: unknown) {
            setResult({
                key: requestKey,
                status: 'error',
                message: error instanceof Error
                    ? error.message : 'Не удалось загрузить записи.',
            })
        }
    }

    async function createItem(draft: MediaDraft): Promise<string> {
        const created = await createMediaEntry(draft)
        await refreshItems()
        return created.id
    }

    async function updateItem(id: string, draft: MediaDraft): Promise<void> {
        await updateMediaEntry(id, draft)
        await refreshItems()
    }

    async function deleteItem(id: string): Promise<void> {
        await deleteMediaEntry(id)
        await refreshItems()
    }

    return (
        <Routes>
            <Route element={<AppLayout auth={auth} />}>
                <Route index element={<Navigate to="/media" replace />} />
                <Route path="auth" element={<AuthPage auth={auth} />} />

                <Route element={<RequireAuth auth={auth} />}>
                    <Route path="media" element={
                        <MediaPage items={items} load={itemsLoad} onRetry={retryItems} />
                    } />
                    <Route path="media/new" element={<NewMediaPage onCreate={createItem} />} />
                    <Route path="media/:id" element={
                        <MediaDetailsPage items={items} load={itemsLoad}
                            onRetry={retryItems} onDelete={deleteItem} />
                    } />
                    <Route path="media/:id/edit" element={
                        <EditMediaPage items={items} load={itemsLoad}
                            onRetry={retryItems} onUpdate={updateItem} />
                    } />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    )
}
