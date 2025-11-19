import { useEffect, useRef, useState } from 'react'

export default function RestaurantDashboard({ token, user }) {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [restaurants, setRestaurants] = useState([])
  const [selected, setSelected] = useState('')
  const [orders, setOrders] = useState([])
  const [connected, setConnected] = useState(false)
  const evtSourceRef = useRef(null)

  useEffect(() => {
    // load restaurants that exist; in demo a restaurant is auto-created for restaurant users on first login
    fetch(`${baseUrl}/restaurants`).then(r=>r.json()).then(setRestaurants)
  }, [baseUrl])

  useEffect(() => {
    if (!selected) return
    // initial load of existing orders
    fetch(`${baseUrl}/orders?restaurant_id=${selected}`).then(r=>r.json()).then(setOrders)

    // open SSE
    const url = `${baseUrl}/restaurants/${selected}/orders/stream?token=${encodeURIComponent(token)}`
    const ev = new EventSource(url)
    ev.onopen = () => setConnected(true)
    ev.onerror = () => setConnected(false)
    ev.onmessage = (e) => {
      if (!e.data) return
      try { const payload = JSON.parse(e.data)
        if (payload.type === 'new_order') {
          // refresh orders list on new order
          fetch(`${baseUrl}/orders?restaurant_id=${selected}`).then(r=>r.json()).then(setOrders)
        }
        if (payload.type === 'status_changed') {
          setOrders(prev => prev.map(o => o.id === payload.order_id ? { ...o, status: payload.status } : o))
        }
      } catch {}
    }
    evtSourceRef.current = ev
    return () => { ev.close(); evtSourceRef.current = null; setConnected(false) }
  }, [selected, baseUrl, token])

  const updateStatus = async (orderId, status) => {
    const res = await fetch(`${baseUrl}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status })
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(data.detail || 'Failed to update')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm text-white/80 mb-2">Manage restaurant</label>
        <select value={selected} onChange={(e)=>setSelected(e.target.value)} className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white">
          <option value="" disabled>Select...</option>
          {restaurants.map(r=> <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        {selected && <p className="text-xs text-blue-300 mt-1">Live connection: {connected? 'connected' : 'disconnected'}</p>}
      </div>

      {selected && (
        <div className="space-y-4">
          <h3 className="text-white font-semibold">Incoming orders</h3>
          <div className="space-y-3">
            {orders.map(o => (
              <div key={o.id} className="p-4 rounded border border-slate-700 bg-slate-800/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Order #{o.id.slice(-5)}</p>
                    <p className="text-blue-200 text-sm">Items: {o.items.reduce((s,i)=>s+i.quantity,0)} • ${(o.total_cents/100).toFixed(2)}</p>
                    <p className="text-blue-300 text-xs">Status: {o.status}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {['accepted','preparing','ready','completed','cancelled'].map(s => (
                      <button key={s} onClick={()=>updateStatus(o.id, s)} className="px-2 py-1 rounded bg-slate-700 text-white hover:bg-slate-600 text-xs">{s}</button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="text-blue-200">No orders yet.</p>}
          </div>
        </div>
      )}
    </div>
  )
}
