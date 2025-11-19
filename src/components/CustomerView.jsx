import { useEffect, useMemo, useState } from 'react'

export default function CustomerView({ token, user }) {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [restaurants, setRestaurants] = useState([])
  const [selected, setSelected] = useState(null)
  const [menu, setMenu] = useState([])
  const [placing, setPlacing] = useState(false)
  const [note, setNote] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch(`${baseUrl}/restaurants`).then(r=>r.json()).then(setRestaurants)
  }, [baseUrl])

  useEffect(() => {
    if (!selected) return
    fetch(`${baseUrl}/restaurants/${selected}/menu`).then(r=>r.json()).then(setMenu)
  }, [selected, baseUrl])

  const totalCents = useMemo(() => menu.reduce((sum, m) => sum + (m.qty||0) * m.price_cents, 0), [menu])

  const placeOrder = async () => {
    setPlacing(true)
    setMessage('')
    try {
      const items = menu.filter(m=>m.qty>0).map(m=>({ item_id: m.id, name: m.name, quantity: m.qty, unit_price_cents: m.price_cents }))
      const res = await fetch(`${baseUrl}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ restaurant_id: selected, items, note })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed to place order')
      setMessage('Order placed!')
    } catch (e) {
      setMessage(e.message)
    } finally { setPlacing(false) }
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm text-white/80 mb-2">Choose a restaurant</label>
        <select value={selected||''} onChange={(e)=>setSelected(e.target.value)} className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white">
          <option value="" disabled>Select...</option>
          {restaurants.map(r=> <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </div>

      {selected && (
        <div className="space-y-4">
          <h3 className="text-white font-semibold">Menu</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {menu.map(item => (
              <div key={item.id} className="p-4 rounded border border-slate-700 bg-slate-800/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{item.name}</p>
                    <p className="text-blue-200 text-sm">${(item.price_cents/100).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={()=>setMenu(m=>m.map(x=>x.id===item.id?{...x, qty: Math.max(0,(x.qty||0)-1)}:x))} className="px-2 py-1 rounded bg-slate-700 text-white">-</button>
                    <span className="text-white min-w-[2ch] text-center">{item.qty||0}</span>
                    <button onClick={()=>setMenu(m=>m.map(x=>x.id===item.id?{...x, qty: (x.qty||0)+1}:x))} className="px-2 py-1 rounded bg-blue-600 text-white">+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm text-white/80 mb-1">Note</label>
            <input value={note} onChange={(e)=>setNote(e.target.value)} className="w-full px-3 py-2 rounded bg-slate-800/80 border border-slate-700 text-white" placeholder="Any instructions?" />
          </div>

          <div className="flex items-center justify-between text-white">
            <p>Total</p>
            <p className="font-semibold">${(totalCents/100).toFixed(2)}</p>
          </div>
          <button onClick={placeOrder} disabled={placing || totalCents===0} className="w-full py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50">{placing? 'Placing...' : 'Place Order'}</button>
          {message && <p className="text-blue-200">{message}</p>}
        </div>
      )}
    </div>
  )
}
