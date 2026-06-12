import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    console.log('[Auth] URL on load:', window.location.href)
    console.log('[Auth] Search params:', window.location.search)
    console.log('[Auth] Hash:', window.location.hash)

    const isOAuthCallback =
      window.location.search.includes('code=') ||
      window.location.hash.includes('access_token=')

    console.log('[Auth] Is OAuth callback?', isOAuthCallback)

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Auth] onAuthStateChange event:', event, '| session:', session?.user?.email ?? null)

      if (event === 'INITIAL_SESSION' && !session && isOAuthCallback) {
        console.log('[Auth] Suppressing null INITIAL_SESSION during OAuth — waiting for SIGNED_IN')
        return
      }

      setSession(session)

      if (event === 'SIGNED_IN') {
        window.history.replaceState({}, '', window.location.pathname)
      }
    })

    // Safety net — stop loading after 10s no matter what
    const timeout = setTimeout(() => {
      console.log('[Auth] Timeout hit — forcing session to null')
      setSession(prev => prev === undefined ? null : prev)
    }, 10000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const signInWithGoogle = async () => {
    console.log('[Auth] Starting Google sign-in, redirectTo:', window.location.origin)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return {
    session,
    user: session?.user ?? null,
    loading: session === undefined,
    signInWithGoogle,
    signOut,
  }
}
