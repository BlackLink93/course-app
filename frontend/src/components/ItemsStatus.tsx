import type { ItemsLoad } from '../types/media'

type ItemsStatusProps = {
    load: ItemsLoad
    onRetry: () => void
}

// Общее сообщение о загрузке личного списка для страниц списка, записи и редактирования.
export function ItemsStatus({ load, onRetry }: ItemsStatusProps) {
    if (load.status === 'error') {
        return (
            <div className="load-error">
                <p role="alert">{load.message}</p>
                <button type="button" onClick={onRetry}>Повторить</button>
            </div>
        )
    }
    if (load.status === 'success') return null
    return <p role="status">Загружаем записи…</p>
}
