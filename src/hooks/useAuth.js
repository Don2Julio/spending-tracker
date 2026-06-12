import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [session, setSession] = useState(undefined) // undefined = still loading

  useEffect(() => {
    const hasOAuthCode = window.location.search.includes('code=')
    let exchangeTimeout

    // If we're mid-OAuth-exchange, keep the loading spinner up to 8 seconds
    // so we don't flash the login screen while supabase-js exchanges the code
    if (hasOAuthCode) {
      exchangeTimeout = setTimeout(() => {
        // Exchange took too long — give up and show login
        setSession(prev => prev === undefined ? null : prev)
        window.history.replaceState({}, '', window.location.pathname)
      }, 8000)
    }

    // supabase-js handles the PKCE code exchange automatically.
    // onAuthStateChange fires:
    //   INITIAL_SESSION → current session (or null if not yet logged in)
    //   SIGNED_IN       → after the OAuth code exchange completes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Ignore the initial null session if we're still waiting on a code exchange
      if (event === 'INITIAL_SESSION' && session === null && hasOAuthCode) {
        return
      }

      clearTimeout(exchangeTimeout)
      setSession(session)

      // Clean ?code=... from the address bar after successful sign-in
      if (event === 'SIGNED_IN') {
        window.history.replaceState({}, '', window.location.pathname)
      }
    })

    return () => {
      subscription.unsubscribe()
      clearTimeout(exchangeTimeout)
    }
  }, [])

  const signInWithGoogle = async () => {
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
