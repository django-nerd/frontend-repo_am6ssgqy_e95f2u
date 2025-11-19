import { useEffect, useState } from 'react'
import Auth from './components/Auth'
import CustomerView from './components/CustomerView'
import RestaurantDashboard from './components/RestaurantDashboard'

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      // we don't store user object persistently in demo; keep minimal session
      setSession({ token })
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="relative min-h-screen p-6 md:p-10">
        <header className="max-w-5xl mx-auto flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <img src="/flame-icon.svg" alt="Flames" className="w-10 h-10" />
            <div>
              <h1 className="text-2xl font-bold text-white">Restaurant Orders</h1>
              <p className="text-sm text-blue-300/70">Customers place orders • Restaurants manage in real time</p>
            </div>
          </div>
          {session ? (
            <button onClick={()=>{ localStorage.removeItem('token'); setSession(null) }} className="px-3 py-1.5 rounded bg-slate-800 border border-slate-700 text-white">Sign out</button>
          ) : null}
        </header>

        <main className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          {!session ? (
            <div className="md:col-span-2 bg-slate-800/50 backdrop-blur border border-blue-500/20 rounded-2xl p-6">
              <h2 className="text-white text-xl font-semibold mb-4">Sign in to continue</h2>
              <Auth onAuthed={(s)=>setSession(s)} />
              <p className="text-blue-200/70 text-sm mt-3">Tip: choose "Restaurant" to open the live management view; choose "Customer" to place an order.</p>
            </div>
          ) : (
            <>
              <section className="bg-slate-800/50 backdrop-blur border border-blue-500/20 rounded-2xl p-6">
                <h2 className="text-white text-lg font-semibold mb-4">Customer</h2>
                <CustomerView token={session.token} user={session.user} />
              </section>
              <section className="bg-slate-800/50 backdrop-blur border border-blue-500/20 rounded-2xl p-6">
                <h2 className="text-white text-lg font-semibold mb-4">Restaurant Dashboard</h2>
                <RestaurantDashboard token={session.token} user={session.user} />
              </section>
            </>
          )}
        </main>

        <footer className="max-w-5xl mx-auto mt-10 text-center text-blue-300/60 text-sm">
          Built with real-time updates via SSE. This is a demo; authentication uses a simple token-based flow.
        </footer>
      </div>
    </div>
  )
}

export default App
