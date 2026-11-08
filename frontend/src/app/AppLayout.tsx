import { useState } from 'react'
import { NavLink, Outlet } from 'react-router'
import type { AuthState } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export function AppLayout({ auth }: { auth: AuthState }) {
    const [signOutError, setSignOutError] = useState('')
    const [signingOut, setSigningOut] = useState(false)

    async function handleSignOut() {
        setSigningOut(true)
        setSignOutError('')
        try {
            // local — выход только из текущего браузера. Подписка useAuth
            // получит SIGNED_OUT, и личный список сразу исчезнет.
            const { error } = await supabase.auth.signOut({ scope: 'local' })
            if (error) throw error
        } catch (error: unknown) {
            setSignOutError(error instanceof Error
                ? error.message : 'Не удалось выйти.')
        } finally {
            setSigningOut(false)
        }
    }

    return (
        <div className="app">
            <header>
                <p className="app-title">Каталог фильмов и сериалов</p>
                {auth.status === 'authenticated' && (
                    <nav aria-label="Основная навигация">
                        <NavLink to="/media" end>Каталог</NavLink>
                        <NavLink to="/media/new">Добавить</NavLink>
                    </nav>
                )}
                {auth.status === 'authenticated' && (
                    <div className="user-bar">
                        <span>{auth.session.user.email}</span>
                        <button type="button" onClick={handleSignOut} disabled={signingOut}>
                            Выйти
                        </button>
                    </div>
                )}
                {auth.status === 'guest' && (
                    <nav aria-label="Вход">
                        <NavLink to="/auth">Войти</NavLink>
                    </nav>
                )}
            </header>

            {signOutError && <p role="alert" className="notice">{signOutError}</p>}

            <main><Outlet /></main>
        </div>
    )
}
