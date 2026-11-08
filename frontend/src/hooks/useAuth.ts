import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export type AuthState =
    | { status: 'checking' }
    | { status: 'guest' }
    | { status: 'authenticated'; session: Session }

function fromSession(session: Session | null): AuthState {
    return session
        ? { status: 'authenticated', session }
        : { status: 'guest' }
}

export function useAuth(): AuthState {
    const [auth, setAuth] = useState<AuthState>({ status: 'checking' })

    useEffect(() => {
        let active = true

        // Подписка сообщает о входе, выходе и обновлении токена.
        // Callback синхронный: он только переносит сессию в React.
        const { data: { subscription } } = supabase.auth
            .onAuthStateChange((_event, session) => {
                if (active) setAuth(fromSession(session))
            })

        // Восстановление сессии браузера при открытии приложения.
        // Если событие уже изменило состояние, поздний ответ его не перезаписывает.
        void supabase.auth.getSession().then(({ data, error }) => {
            if (!active) return
            setAuth((current) => current.status === 'checking'
                ? (error ? { status: 'guest' } : fromSession(data.session))
                : current)
        })

        return () => {
            active = false
            subscription.unsubscribe()
        }
    }, [])

    return auth
}
