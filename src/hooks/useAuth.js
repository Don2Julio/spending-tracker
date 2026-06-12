import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [session, setSession] = useState(undefined) // undefined = still loading

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    // Check if we're returning from a Google OAuth redirect (?code=xxx in URL)
    const code = new URLSearchParams(window.location.search).get('code')

    if (code) {
      // Explicitly exchange the OAuth code for a session
      supabase.auth.exchangeCodeForSession(code)
        .then(({ error }) => {
          if (error) {
            console.error('Auth exchange error:', error.message)
            setSession(null)
          }
          // Clean the URL — remove ?code from address bar
          window.history.replaceState({}, '', window.location.pathname)
        })
    } else {
      // No OAuth flow — just check if user is already logged in
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(current => current === undefined ? session : current)
      })
    }

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
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
