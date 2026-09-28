import { Link } from 'react-router'

export function NewMediaPage() {
    return (
        <section>
            <h1>Добавление записи</h1>
            <p>Форма добавления фильма или сериала появится в следующей работе.</p>
            <Link to="/media">К списку записей</Link>
        </section>
    )
}