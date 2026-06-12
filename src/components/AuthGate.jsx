export default function AuthGate({ onSignIn, loading }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: '#0a0a0a' }}
    >
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-4">
        <img
          src="/apple-touch-icon.png"
          alt="Spending Tracker"
          className="rounded-2xl"
          style={{ width: 88, height: 88 }}
        />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">Spending Tracker</h1>
          <p className="text-sm mt-1" style={{ color: '#555' }}>
            Track budgets across all your devices
          </p>
        </div>
      </div>

      {/* Sign-in card */}
      <div
        className="w-full max-w-xs rounded-2xl p-6 flex flex-col gap-4"
        style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
      >
        <button
          onClick={onSignIn}
          disabled={loading}
          className="flex items-center justify-center gap-3 w-full py-3 rounded-xl text-sm font-medium transition-opacity"
          style={{
            backgroundColor: '#fff',
            color: '#111',
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {/* Google "G" logo */}
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
          </svg>
          {loading ? 'Signing in…' : 'Continue with Google'}
        </button>

        <p className="text-center text-xs" style={{ color: '#444' }}>
          Your data syncs automatically across all devices
        </p>
      </div>

      <p className="mt-8 text-xs" style={{ color: '#333' }}>
        Your spending data is private and only visible to you
      </p>
    </div>
  )
}
