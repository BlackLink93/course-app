import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import type { AuthState } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

type AuthMode = 'signIn' | 'signUp'

// Правило учебного проекта: пароль не короче 8 символов.
const minPasswordLength = 8

// Адрес, с которого пользователя перенаправили на вход (его передаёт RequireAuth).
function getReturnPath(state: unknown): string {
    if (typeof state === 'object' && state !== null && 'from' in state &&
        typeof state.from === 'string' && state.from.startsWith('/') &&
        state.from !== '/auth') {
        return state.from
    }
    return '/media'
}

export function AuthPage({ auth }: { auth: AuthState }) {
    const navigate = useNavigate()
    const location = useLocation()
    const returnPath = getReturnPath(location.state)

    const [mode, setMode] = useState<AuthMode>('signIn')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [pending, setPending] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    if (auth.status === 'checking') {
        return <p role="status">Проверяем сессию…</p>
    }
    if (auth.status === 'authenticated') {
        return <Navigate to={returnPath} replace />
    }

    function switchMode(next: AuthMode) {
        setMode(next)
        setError('')
        setMessage('')
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (pending) return

        const trimmedEmail = email.trim()
        if (trimmedEmail === '') {
            setError('Укажите email.')
            return
        }
        if (password === '') {
            setError('Укажите пароль.')
            return
        }
        if (mode === 'signUp' && password.length < minPasswordLength) {
            setError(`Пароль должен содержать не меньше ${minPasswordLength} символов.`)
            return
        }

        setPending(true)
        setError('')
        setMessage('')
        try {
            if (mode === 'signUp') {
                const { data, error } = await supabase.auth.signUp({
                    email: trimmedEmail,
                    password,
                    options: { emailRedirectTo: window.location.origin },
                })
                if (error) throw error
                if (data.session) {
                    navigate(returnPath, { replace: true })
                } else {
                    // Подтверждение email включено: сессии ещё нет.
                    setPassword('')
                    setMessage('Проверьте почту и подтвердите регистрацию. ' +
                        'После подтверждения войдите с этим email и паролем.')
                    setMode('signIn')
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email: trimmedEmail,
                    password,
                })
                if (error) throw error
                navigate(returnPath, { replace: true })
            }
        } catch (error: unknown) {
            // Email не очищаем, чтобы пользователь мог исправить только пароль.
            setError(error instanceof Error
                ? error.message : 'Не удалось выполнить запрос.')
        } finally {
            setPending(false)
        }
    }

    return (
        <section>
            <h1>{mode === 'signIn' ? 'Вход' : 'Регистрация'}</h1>

            <div className="auth-modes" role="group" aria-label="Режим">
                <button type="button" aria-pressed={mode === 'signIn'}
                    disabled={pending} onClick={() => switchMode('signIn')}>
                    Вход
                </button>
                <button type="button" aria-pressed={mode === 'signUp'}
                    disabled={pending} onClick={() => switchMode('signUp')}>
                    Регистрация
                </button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
                <label htmlFor="auth-email">Email</label>
                <input id="auth-email" type="email" autoComplete="email" required
                    value={email} onChange={(e) => setEmail(e.target.value)}
                />

                <label htmlFor="auth-password">Пароль</label>
                <input id="auth-password" type="password" required
                    autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                />
                {mode === 'signUp' && (
                    <p className="form-note">Не меньше {minPasswordLength} символов.</p>
                )}

                {error && <p role="alert">{error}</p>}
                {message && <p role="status" className="auth-message">{message}</p>}

                <button type="submit" disabled={pending}>
                    {pending
                        ? 'Отправляем…'
                        : mode === 'signIn' ? 'Войти' : 'Зарегистрироваться'}
                </button>
            </form>
        </section>
    )
}
