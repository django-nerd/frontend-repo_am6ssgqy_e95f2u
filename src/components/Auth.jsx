import { useState } from 'react'

export default function Auth({ onAuthed }) {
  const [email, setEmail] = useState('demo@example.com')
  const [name, setName] = useState('Demo User')
  const [role, setRole] = useState('customer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const signInDemo = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${baseUrl}/auth/demo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, role })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Sign-in failed')
      localStorage.setItem('token', data.token)
      onAuthed({ token: data.token, user: data.user })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={signInDemo} className="space-y-4">
      <div>
        <label className="block text-sm text-white/80 mb-1">Name</label>
        <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full px-3 py-2 rounded bg-slate-800/80 border border-slate-700 text-white" />
      </div>
      <div>
        <label className="block text-sm text-white/80 mb-1">Email</label>
        <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full px-3 py-2 rounded bg-slate-800/80 border border-slate-700 text-white" />
      </div>
      <div>
        <label className="block text-sm text-white/80 mb-1">Role</label>
        <select value={role} onChange={(e)=>setRole(e.target.value)} className="w-full px-3 py-2 rounded bg-slate-800/80 border border-slate-700 text-white">
          <option value="customer">Customer</option>
          <option value="restaurant">Restaurant</option>
        </select>
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button disabled={loading} className="w-full py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold disabled:opacity-50">
        {loading ? 'Signing in...' : 'Continue'}
      </button>
    </form>
  )
}
