import { NavLink, Outlet } from 'react-router'

export function AppLayout() {
    return (
        <div className="app">
            <header>
                <p className="app-title">Каталог фильмов и сериалов</p>
                <nav aria-label="Основная навигация">
                    <NavLink to="/media" end>Каталог</NavLink>
                    <NavLink to="/media/new">Добавить</NavLink>
                </nav>
            </header>
            <main><Outlet /></main>
        </div>
    )
}