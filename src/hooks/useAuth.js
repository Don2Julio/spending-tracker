import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [session, setSession] = useState(undefined) // undefined = still loading

  useEffect(() => {
    // Check if we're in the middle of an OAuth callback (code in URL)
    // If so, don't call getSession() yet — wait for onAuthStateChange to fire
    // after the PKCE code exchange completes. Calling getSession() too early
    // returns null and flashes the login screen.
    const hasOAuthCode = new URLSearchParams(window.location.search).has('code')

    // Always set up the listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      // Clean up the code param from the URL after successful exchange
      if (session && hasOAuthCode) {
        window.history.replaceState({}, '', window.location.pathname)
      }
    })

    if (!hasOAuthCode) {
      // No OAuth flow in progress — safe to check session immediately
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
