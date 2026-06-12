import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    // With implicit flow, supabase-js detects #access_token in the URL hash
    // and fires INITIAL_SESSION with the session already set — no manual
    // code exchange needed.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      // Clean the hash from the address bar after sign-in
      if (event === 'SIGNED_IN' && window.location.hash.includes('access_token')) {
        window.history.replaceState({}, '', window.location.pathname)
      }
    })

    // Safety fallback — stop loading after 5s if onAuthStateChange never fires
    const timeout = setTimeout(() => {
      setSession(prev => prev === undefined ? null : prev)
    }, 5000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
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
