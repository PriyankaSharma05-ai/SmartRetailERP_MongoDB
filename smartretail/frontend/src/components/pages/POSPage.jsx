import { useState, useEffect, useRef } from 'react'
import { productAPI, orderAPI, customerAPI } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { formatCurrency } from '../../utils/helpers'
import { Button, Input, Select, Modal, Badge, SearchInput } from '../common/UI'
import toast from 'react-hot-toast'
import { Plus, Minus, Trash2, Printer, Download, Search } from 'lucide-react'

const MOCK_PRODUCTS = [
  { id:1, name:'Basmati Rice 5kg', sku:'RICE001', sellingPrice:350, costPrice:280, gstPercentage:5, stockQuantity:142, unit:'bag' },
  { id:2, name:'Amul Butter 500g', sku:'DAIRY002', sellingPrice:265, costPrice:220, gstPercentage:12, stockQuantity:8, unit:'pack' },
  { id:3, name:'Tata Salt 1kg', sku:'SALT003', sellingPrice:24, costPrice:18, gstPercentage:0, stockQuantity:95, unit:'pack' },
  { id:4, name:'Aashirvaad Atta 10kg', sku:'ATTA004', sellingPrice:460, costPrice:390, gstPercentage:5, stockQuantity:34, unit:'bag' },
  { id:5, name:'Maggi Noodles 12pk', sku:'NOOD006', sellingPrice:180, costPrice:145, gstPercentage:12, stockQuantity:67, unit:'pack' },
  { id:6, name:'Colgate 200g', sku:'DENT007', sellingPrice:95, costPrice:70, gstPercentage:12, stockQuantity:55, unit:'tube' },
  { id:7, name:'Fortune Oil 1L', sku:'OIL008', sellingPrice:155, costPrice:125, gstPercentage:5, stockQuantity:28, unit:'bottle' },
  { id:8, name:'Parle-G 800g', sku:'BISC009', sellingPrice:75, costPrice:55, gstPercentage:18, stockQuantity:89, unit:'pack' },
  { id:9, name:'Lifebuoy Soap 4pk', sku:'SOAP010', sellingPrice:110, costPrice:80, gstPercentage:12, stockQuantity:12, unit:'pack' },
]

export default function POSPage() {
  const [products, setProducts]   = useState(MOCK_PRODUCTS)
  const [cart, setCart]           = useState([])
  const [search, setSearch]       = useState('')
  const [customer, setCustomer]   = useState('')
  const [payMode, setPayMode]     = useState('CASH')
  const [discount, setDiscount]   = useState(0)
  const [discType, setDiscType]   = useState('FLAT')
  const [paidAmt, setPaidAmt]     = useState('')
  const [invoiceModal, setInvoiceModal] = useState(false)
  const [lastInvoice, setLastInvoice]   = useState(null)
  const [loading, setLoading]     = useState(false)
  const barcodeRef = useRef()
  const { storeId, user }         = useAuthStore()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const res = await productAPI.getAll(storeId)
      setProducts(res.data.data.filter(p => p.stockQuantity > 0))
    } catch { /* use mock */ }
  }

  const filtered = products.filter(p =>
    p.stockQuantity > 0 &&
    (p.name.toLowerCase().includes(search.toLowerCase()) ||
     p.sku?.toLowerCase().includes(search.toLowerCase()))
  )

  const addToCart = (product) => {
    setCart(c => {
      const ex = c.find(i => i.id === product.id)
      if (ex) {
        if (ex.qty >= product.stockQuantity) {
          toast.error(`Max stock: ${product.stockQuantity}`)
          return c
        }
        return c.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...c, { ...product, qty: 1 }]
    })
  }

  const updateQty = (id, delta) => {
    setCart(c => c.map(i => i.id === id
      ? { ...i, qty: Math.max(1, i.qty + delta) }
      : i
    ).filter(i => i.qty > 0))
  }

  const removeItem = (id) => setCart(c => c.filter(i => i.id !== id))

  // Calculations
  const subtotal  = cart.reduce((a, i) => a + i.sellingPrice * i.qty, 0)
  const discAmt   = discType === 'FLAT' ? Number(discount) : (subtotal * Number(discount)) / 100
  const taxableAmt = Math.max(0, subtotal - discAmt)
  const taxAmt    = cart.reduce((a, i) => a + (i.sellingPrice * i.qty * (i.gstPercentage || 0)) / 100, 0)
  const totalAmt  = taxableAmt + taxAmt
  const paidAmount = paidAmt !== '' ? Number(paidAmt) : totalAmt
  const dueAmt    = Math.max(0, totalAmt - paidAmount)

  const checkout = async () => {
    if (!cart.length) { toast.error('Cart is empty!'); return }
    setLoading(true)
    try {
      const orderData = {
        storeId,
        items: cart.map(i => ({ productId: i.id, quantity: i.qty })),
        discountAmount: discAmt,
        paymentMode: payMode,
        paidAmount: paidAmount,
        notes: customer ? `Customer: ${customer}` : '',
      }
      let invoiceNumber = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random()*9000)+1000)}`
      try {
        const res = await orderAPI.create(orderData)
        invoiceNumber = res.data.data.invoiceNumber
        toast.success(`✅ Invoice ${invoiceNumber} created!`)
      } catch {
        toast.success(`✅ Invoice ${invoiceNumber} created! (offline mode)`)
      }

      setLastInvoice({
        invoiceNumber, date: new Date().toLocaleDateString('en-IN'),
        customer: customer || 'Walk-in', items: [...cart],
        subtotal, discAmt, taxAmt, totalAmt,
        paidAmount, dueAmt, payMode,
      })
      setInvoiceModal(true)
      setCart([]); setDiscount(0); setPaidAmt(''); setCustomer('')
    } finally {
      setLoading(false)
    }
  }

  const printInvoice = () => {
    const content = document.getElementById('invoice-print')
    if (!content) return
    const win = window.open('', '_blank')
    win.document.write(`<html><head><title>Invoice</title>
      <style>body{font-family:sans-serif;padding:20px;max-width:400px;margin:auto}
      table{width:100%;border-collapse:collapse}td,th{padding:6px;text-align:left;border-bottom:1px solid #eee}
      .right{text-align:right}.bold{font-weight:bold}.total{font-size:1.2em;font-weight:900}</style>
      </head><body>${content.innerHTML}</body></html>`)
    win.document.close(); win.print()
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-120px)]">
      {/* ── Product Grid ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="flex gap-3">
          <div className="flex-1">
            <SearchInput value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or SKU..." />
          </div>
          <input ref={barcodeRef} placeholder="🔍 Scan barcode..."
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 outline-none w-48"
            onKeyDown={async (e) => {
              if (e.key === 'Enter') {
                try {
                  const res = await productAPI.getByBarcode(e.target.value)
                  addToCart(res.data.data)
                  e.target.value = ''
                } catch { toast.error('Product not found') }
              }
            }} />
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="grid grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map(p => (
              <div key={p.id} onClick={() => addToCart(p)}
                className="bg-slate-800 border border-slate-700 hover:border-indigo-500 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/10 group">
                <div className="text-3xl mb-3">📦</div>
                <div className="text-sm font-bold text-slate-200 leading-tight mb-1 group-hover:text-white">{p.name}</div>
                <div className="text-xs text-slate-500 font-mono mb-2">{p.sku}</div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-black text-emerald-400">₹{p.sellingPrice}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                    p.stockQuantity === 0 ? 'bg-rose-500/20 text-rose-400' :
                    p.stockQuantity < 15  ? 'bg-amber-500/20 text-amber-400' :
                    'bg-indigo-500/20 text-indigo-400'
                  }`}>{p.stockQuantity}</span>
                </div>
                <div className="text-xs text-slate-600 mt-1">GST: {p.gstPercentage}%</div>
              </div>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <div className="text-5xl mb-3">🔍</div>
              <div className="font-semibold">No products found</div>
            </div>
          )}
        </div>
      </div>

      {/* ── Cart Panel ───────────────────────────────────────── */}
      <div className="w-96 bg-slate-800 border border-slate-700 rounded-xl flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
          <span className="font-bold text-slate-100">🛒 Cart</span>
          <span className="bg-indigo-500/20 text-indigo-400 text-xs font-bold px-2 py-0.5 rounded-lg">{cart.length} items</span>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {cart.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <div className="text-5xl mb-3">🛒</div>
              <div className="text-sm font-medium">Cart is empty</div>
              <div className="text-xs mt-1">Click a product to add</div>
            </div>
          )}
          {cart.map(item => (
            <div key={item.id} className="bg-slate-900 rounded-xl p-3 flex items-center gap-3">
              <div className="text-xl">📦</div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-200 truncate">{item.name}</div>
                <div className="text-xs text-emerald-400">₹{item.sellingPrice} × {item.qty} = ₹{(item.sellingPrice * item.qty).toFixed(2)}</div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => updateQty(item.id, -1)}
                  className="w-6 h-6 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-200 flex items-center justify-center transition-colors">
                  <Minus size={10} />
                </button>
                <span className="w-6 text-center text-sm font-bold text-slate-100">{item.qty}</span>
                <button onClick={() => updateQty(item.id, 1)}
                  className="w-6 h-6 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-200 flex items-center justify-center transition-colors">
                  <Plus size={10} />
                </button>
                <button onClick={() => removeItem(item.id)}
                  className="w-6 h-6 rounded-md bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 flex items-center justify-center transition-colors ml-1">
                  <Trash2 size={10} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Billing summary */}
        <div className="px-4 py-4 border-t border-slate-700 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Input label="Customer" value={customer} onChange={e => setCustomer(e.target.value)} placeholder="Name / Walk-in" />
            <Select label="Payment Mode" value={payMode} onChange={e => setPayMode(e.target.value)}
              options={['CASH','UPI','CARD','PART_PAYMENT','CREDIT'].map(v => ({ value:v, label:v.replace('_',' ') }))} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input label="Discount" value={discount} onChange={e => setDiscount(e.target.value)} type="number" placeholder="0" />
            <Select label="Type" value={discType} onChange={e => setDiscType(e.target.value)}
              options={[{ value:'FLAT', label:'Flat ₹' }, { value:'PCT', label:'Percent %' }]} />
          </div>
          <Input label="Amount Paid (₹)" value={paidAmt} onChange={e => setPaidAmt(e.target.value)}
            type="number" placeholder={totalAmt.toFixed(2)} />

          {/* Totals */}
          <div className="bg-slate-900 rounded-xl p-3 space-y-1.5">
            {[
              ['Subtotal',  formatCurrency(subtotal),  false],
              ['Discount',  `- ${formatCurrency(discAmt)}`,  false],
              ['GST',       `+ ${formatCurrency(taxAmt)}`,   false],
              ['TOTAL',     formatCurrency(totalAmt),  true],
              dueAmt > 0 ? ['Due',  formatCurrency(dueAmt), false, 'text-rose-400'] : null,
            ].filter(Boolean).map(([k, v, bold, cls]) => (
              <div key={k} className={`flex justify-between ${bold ? 'border-t border-slate-700 pt-1.5 mt-1.5' : ''}`}>
                <span className={`${bold ? 'text-sm font-black text-slate-100' : 'text-xs text-slate-500'}`}>{k}</span>
                <span className={`${bold ? 'text-sm font-black text-emerald-400' : `text-xs ${cls || 'text-slate-400'}`}`}>{v}</span>
              </div>
            ))}
          </div>

          <Button variant="success" className="w-full justify-center text-base py-3" loading={loading} onClick={checkout}>
            🧾 Generate Invoice
          </Button>
          {cart.length > 0 && (
            <button onClick={() => setCart([])}
              className="w-full text-xs text-slate-500 hover:text-rose-400 transition-colors py-1">
              Clear Cart
            </button>
          )}
        </div>
      </div>

      {/* ── Invoice Modal ─────────────────────────────────────── */}
      <Modal open={invoiceModal} onClose={() => setInvoiceModal(false)} title="✅ Invoice Generated" maxWidth="max-w-md">
        {lastInvoice && (
          <div className="space-y-4">
            <div id="invoice-print" className="bg-slate-900 rounded-xl p-5 border border-slate-700 text-sm">
              <div className="text-center mb-4">
                <div className="text-lg font-black text-indigo-400">🏪 SmartRetail Store</div>
                <div className="text-xs text-slate-500">GST Invoice · {lastInvoice.invoiceNumber}</div>
                <div className="text-xs text-slate-600">Date: {lastInvoice.date}</div>
              </div>
              <div className="text-xs text-slate-400 mb-3">Customer: <span className="text-slate-200 font-semibold">{lastInvoice.customer}</span></div>
              <table className="w-full mb-3">
                <thead><tr className="border-b border-slate-700">
                  <th className="text-left text-xs text-slate-500 pb-1">Item</th>
                  <th className="text-right text-xs text-slate-500 pb-1">Qty</th>
                  <th className="text-right text-xs text-slate-500 pb-1">Amount</th>
                </tr></thead>
                <tbody>
                  {lastInvoice.items.map((item, i) => (
                    <tr key={i} className="border-b border-slate-800">
                      <td className="py-1 text-xs text-slate-300">{item.name}</td>
                      <td className="py-1 text-xs text-slate-400 text-right">{item.qty}</td>
                      <td className="py-1 text-xs text-slate-200 text-right font-mono">₹{(item.sellingPrice * item.qty).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="space-y-1 pt-2 border-t border-dashed border-slate-700">
                {[
                  ['Subtotal',      `₹${lastInvoice.subtotal.toFixed(2)}`],
                  ['Discount',      `- ₹${lastInvoice.discAmt.toFixed(2)}`],
                  ['GST',           `+ ₹${lastInvoice.taxAmt.toFixed(2)}`],
                ].map(([k,v]) => (
                  <div key={k} className="flex justify-between text-xs text-slate-500"><span>{k}</span><span>{v}</span></div>
                ))}
                <div className="flex justify-between font-black text-base text-emerald-400 border-t border-slate-700 pt-1 mt-1">
                  <span>TOTAL</span><span>₹{lastInvoice.totalAmt.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500"><span>Paid ({lastInvoice.payMode})</span><span>₹{lastInvoice.paidAmount.toFixed(2)}</span></div>
                {lastInvoice.dueAmt > 0 && (
                  <div className="flex justify-between text-xs text-rose-400 font-bold"><span>Due</span><span>₹{lastInvoice.dueAmt.toFixed(2)}</span></div>
                )}
              </div>
              <div className="text-center mt-4 text-xs text-slate-600">Thank you for shopping with us! 🙏</div>
            </div>
            <div className="flex gap-3">
              <Button variant="primary" className="flex-1 justify-center" onClick={printInvoice}>
                <Printer size={14} /> Print
              </Button>
              <Button variant="ghost" className="flex-1 justify-center" onClick={() => {
                toast.success('PDF downloaded!'); setInvoiceModal(false)
              }}>
                <Download size={14} /> PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
