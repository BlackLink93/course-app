import { Link } from 'react-router'
import { MediaCard } from '../components/MediaCard'
import { mediaItems } from '../data/media'

export function MediaPage() {
    return (
        <section>
            <h1>Мои фильмы и сериалы</h1>
            <Link to="/media/new">Добавить запись</Link>
            {mediaItems.length === 0 ? (
                <p>Записей пока нет.</p>
            ) : (
                <div className="media-list">
                    {mediaItems.map((item) => (
                        <MediaCard key={item.id} item={item} />
                    ))}
                </div>
            )}
        </section>
    )
}