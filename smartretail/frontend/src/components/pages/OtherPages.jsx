// ── InventoryPage ─────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { productAPI, supplierAPI, customerAPI, orderAPI, reportAPI } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { formatCurrency, formatDate, formatDateTime, orderStatusColor, paymentModeColor, exportToCSV } from '../../utils/helpers'
import { Button, Input, Select, Modal, Badge, SearchInput, Card, PageHeader, Table, AlertBanner, Spinner } from '../common/UI'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, Download, RefreshCw, TrendingUp, Package, Users, Truck } from 'lucide-react'

// ─── MOCK DATA (fallback when backend not running) ────────────────────────────
const MOCK_PRODUCTS = [
  { id:1, name:'Basmati Rice 5kg', sku:'RICE001', categoryName:'Grains', supplierName:'AgroFresh', costPrice:280, sellingPrice:350, gstPercentage:5, stockQuantity:142, minQuantity:20, unit:'bag', marginPct:20, stockStatus:'IN_STOCK', isActive:true },
  { id:2, name:'Amul Butter 500g', sku:'DAIRY002', categoryName:'Dairy', supplierName:'Amul', costPrice:220, sellingPrice:265, gstPercentage:12, stockQuantity:8, minQuantity:15, unit:'pack', marginPct:17, stockStatus:'LOW_STOCK', isActive:true },
  { id:3, name:'Tata Salt 1kg', sku:'SALT003', categoryName:'Spices', supplierName:'Tata', costPrice:18, sellingPrice:24, gstPercentage:0, stockQuantity:95, minQuantity:30, unit:'pack', marginPct:25, stockStatus:'IN_STOCK', isActive:true },
  { id:4, name:'Aashirvaad Atta 10kg', sku:'ATTA004', categoryName:'Grains', supplierName:'ITC', costPrice:390, sellingPrice:460, gstPercentage:5, stockQuantity:34, minQuantity:10, unit:'bag', marginPct:15, stockStatus:'IN_STOCK', isActive:true },
  { id:5, name:'Surf Excel 1kg', sku:'DETG005', categoryName:'Household', supplierName:'HUL', costPrice:185, sellingPrice:230, gstPercentage:18, stockQuantity:0, minQuantity:20, unit:'pack', marginPct:20, stockStatus:'OUT_OF_STOCK', isActive:true },
  { id:6, name:'Maggi Noodles 12pk', sku:'NOOD006', categoryName:'Instant Food', supplierName:'Nestle', costPrice:145, sellingPrice:180, gstPercentage:12, stockQuantity:67, minQuantity:25, unit:'pack', marginPct:19, stockStatus:'IN_STOCK', isActive:true },
  { id:7, name:'Colgate 200g', sku:'DENT007', categoryName:'Personal Care', supplierName:'Colgate', costPrice:70, sellingPrice:95, gstPercentage:12, stockQuantity:55, minQuantity:30, unit:'tube', marginPct:26, stockStatus:'IN_STOCK', isActive:true },
  { id:8, name:'Fortune Oil 1L', sku:'OIL008', categoryName:'Cooking Oil', supplierName:'Fortune', costPrice:125, sellingPrice:155, gstPercentage:5, stockQuantity:28, minQuantity:20, unit:'bottle', marginPct:19, stockStatus:'IN_STOCK', isActive:true },
  { id:9, name:'Parle-G 800g', sku:'BISC009', categoryName:'Biscuits', supplierName:'Parle', costPrice:55, sellingPrice:75, gstPercentage:18, stockQuantity:89, minQuantity:40, unit:'pack', marginPct:27, stockStatus:'IN_STOCK', isActive:true },
  { id:10, name:'Lifebuoy Soap 4pk', sku:'SOAP010', categoryName:'Personal Care', supplierName:'HUL', costPrice:80, sellingPrice:110, gstPercentage:12, stockQuantity:12, minQuantity:25, unit:'pack', marginPct:27, stockStatus:'LOW_STOCK', isActive:true },
]
const MOCK_ORDERS = [
  { id:1, invoiceNumber:'INV-2025-0001', customerName:'Priya Sharma', totalAmount:909, paidAmount:909, dueAmount:0, paymentMode:'UPI', status:'COMPLETED', orderDate:'2025-07-10T10:30:00', items:[] },
  { id:2, invoiceNumber:'INV-2025-0002', customerName:'Walk-in', totalAmount:489, paidAmount:489, dueAmount:0, paymentMode:'CASH', status:'COMPLETED', orderDate:'2025-07-10T11:15:00', items:[] },
  { id:3, invoiceNumber:'INV-2025-0003', customerName:'Rahul Kumar', totalAmount:1264, paidAmount:1000, dueAmount:264, paymentMode:'CARD', status:'PARTIAL', orderDate:'2025-07-10T14:00:00', items:[] },
  { id:4, invoiceNumber:'INV-2025-0004', customerName:'Anita Singh', totalAmount:616, paidAmount:616, dueAmount:0, paymentMode:'CASH', status:'COMPLETED', orderDate:'2025-07-09T09:30:00', items:[] },
  { id:5, invoiceNumber:'INV-2025-0005', customerName:'Walk-in', totalAmount:222, paidAmount:222, dueAmount:0, paymentMode:'UPI', status:'COMPLETED', orderDate:'2025-07-09T16:45:00', items:[] },
]
const MOCK_CUSTOMERS = [
  { id:1, name:'Priya Sharma', phone:'9876543210', email:'priya@gmail.com', address:'123 MG Road, Delhi', loyaltyPoints:1245, totalOrders:28, totalSpent:12450 },
  { id:2, name:'Rahul Kumar', phone:'9123456789', email:'rahul@gmail.com', address:'45 Park Street, Mumbai', loyaltyPoints:689, totalOrders:15, totalSpent:6890 },
  { id:3, name:'Anita Singh', phone:'9988776655', email:'anita@gmail.com', address:'78 Anna Nagar, Chennai', loyaltyPoints:1920, totalOrders:42, totalSpent:19200 },
  { id:4, name:'Mohammed Ali', phone:'9871234567', email:'mali@gmail.com', address:'12 Banjara Hills, Hyderabad', loyaltyPoints:340, totalOrders:9, totalSpent:3400 },
]
const MOCK_SUPPLIERS = [
  { id:1, name:'AgroFresh Distributors', contactName:'Ramesh Gupta', phone:'9811223344', email:'agrofresh@biz.com', city:'Ludhiana', balanceDue:24500, status:'ACTIVE' },
  { id:2, name:'Amul Cooperative', contactName:'Suresh Patel', phone:'9922334455', email:'amul@coop.com', city:'Anand', balanceDue:0, status:'ACTIVE' },
  { id:3, name:'ITC Distribution', contactName:'Vikram Roy', phone:'9933445566', email:'itc@dist.com', city:'Kolkata', balanceDue:8900, status:'ACTIVE' },
  { id:4, name:'HUL Supply Chain', contactName:'Preet Kaur', phone:'9944556677', email:'hul@sc.com', city:'Mumbai', balanceDue:15200, status:'INACTIVE' },
]

// ── INVENTORY PAGE ─────────────────────────────────────────────────────────────
export function InventoryPage() {
  const [products, setProducts] = useState(MOCK_PRODUCTS)
  const [search, setSearch]     = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [modal, setModal]       = useState(false)
  const [editProd, setEditProd] = useState(null)
  const [loading, setLoading]   = useState(false)
  const { storeId }             = useAuthStore()
  const emptyForm = { name:'', sku:'', categoryId:'', supplierId:'', storeId, costPrice:'', sellingPrice:'', mrp:'', gstPercentage:'5', unit:'pack', imageUrl:'', minQuantity:'10' }
  const [form, setForm]         = useState(emptyForm)

  useEffect(() => {
    productAPI.getAll(storeId).then(r => setProducts(r.data.data)).catch(() => {})
  }, [])

  const categories = ['All', ...new Set(products.map(p => p.categoryName).filter(Boolean))]
  const filtered   = products.filter(p =>
    p.isActive !== false &&
    (catFilter === 'All' || p.categoryName === catFilter) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase()))
  )

  const openAdd  = () => { setEditProd(null); setForm(emptyForm); setModal(true) }
  const openEdit = (p) => { setEditProd(p); setForm({ ...p, categoryId: p.categoryId||'', supplierId: p.supplierId||'', storeId }); setModal(true) }

  const save = async () => {
    if (!form.name || !form.sellingPrice || !form.costPrice) { toast.error('Fill required fields'); return }
    if (parseFloat(form.sellingPrice) < parseFloat(form.costPrice)) { toast.error('⚠ Selling price below cost price — loss!'); return }
    setLoading(true)
    try {
      if (editProd) {
        await productAPI.update(editProd.id, form)
        setProducts(ps => ps.map(p => p.id === editProd.id ? { ...p, ...form, sellingPrice: parseFloat(form.sellingPrice), costPrice: parseFloat(form.costPrice) } : p))
        toast.success('Product updated!')
      } else {
        await productAPI.create(form)
        setProducts(ps => [...ps, { ...form, id: Date.now(), sellingPrice: parseFloat(form.sellingPrice), costPrice: parseFloat(form.costPrice), stockQuantity: 0, stockStatus: 'OUT_OF_STOCK', isActive: true }])
        toast.success('Product created!')
      }
    } catch {
      // offline fallback
      if (editProd) {
        setProducts(ps => ps.map(p => p.id === editProd.id ? { ...p, ...form, sellingPrice: parseFloat(form.sellingPrice), costPrice: parseFloat(form.costPrice) } : p))
      } else {
        setProducts(ps => [...ps, { ...form, id: Date.now(), sellingPrice: parseFloat(form.sellingPrice), costPrice: parseFloat(form.costPrice), stockQuantity: 0, stockStatus: 'OUT_OF_STOCK', isActive: true }])
      }
      toast.success(editProd ? 'Product updated!' : 'Product created!')
    }
    setLoading(false)
    setModal(false)
  }

  const del = async (id) => {
    if (!confirm('Delete this product?')) return
    try { await productAPI.delete(id) } catch {}
    setProducts(ps => ps.filter(p => p.id !== id))
    toast.success('Product deleted')
  }

  const stockBadge = (status) => {
    if (status === 'OUT_OF_STOCK') return <span className="badge bg-rose-500/20 text-rose-400">Out of Stock</span>
    if (status === 'LOW_STOCK')    return <span className="badge bg-amber-500/20 text-amber-400">Low Stock</span>
    return <span className="badge bg-emerald-500/20 text-emerald-400">In Stock</span>
  }

  return (
    <div className="space-y-4">
      <PageHeader title="📦 Inventory Management" subtitle={`${products.length} products · ${products.filter(p=>p.stockStatus==='OUT_OF_STOCK').length} out of stock`}
        actions={<>
          <Button variant="ghost" onClick={() => exportToCSV(products.map(({name,sku,stockQuantity,sellingPrice,costPrice})=>({name,sku,stockQuantity,sellingPrice,costPrice})), 'inventory')}><Download size={14}/>Export</Button>
          <Button onClick={openAdd}><Plus size={14}/>Add Product</Button>
        </>} />

      {/* Filters */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="flex-1 min-w-48"><SearchInput value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." /></div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${catFilter===c ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-slate-700">
              {['Product','SKU','Category','Cost','Price','Margin','GST','Stock','Status',''].map(h => (
                <th key={h} className="text-left text-xs text-slate-500 font-bold uppercase tracking-wide px-4 py-3 whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-slate-800 hover:bg-slate-900/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-slate-200">{p.name}</div>
                    <div className="text-xs text-slate-500">{p.supplierName}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 font-mono">{p.sku}</td>
                  <td className="px-4 py-3"><span className="badge bg-indigo-500/20 text-indigo-400">{p.categoryName}</span></td>
                  <td className="px-4 py-3 text-sm text-slate-400">₹{p.costPrice}</td>
                  <td className="px-4 py-3 text-sm font-bold text-emerald-400">₹{p.sellingPrice}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-700 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${Math.min(100, p.marginPct||0)}%` }} />
                      </div>
                      <span className="text-xs text-slate-400">{p.marginPct?.toFixed(0)||0}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{p.gstPercentage}%</td>
                  <td className="px-4 py-3">
                    <div className={`text-sm font-bold ${p.stockQuantity===0 ? 'text-rose-400' : p.stockStatus==='LOW_STOCK' ? 'text-amber-400' : 'text-slate-200'}`}>{p.stockQuantity}</div>
                    <div className="text-xs text-slate-600">min: {p.minQuantity}</div>
                  </td>
                  <td className="px-4 py-3">{stockBadge(p.stockStatus)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="text-slate-400 hover:text-indigo-400 transition-colors"><Edit size={14}/></button>
                      <button onClick={() => del(p.id)} className="text-slate-400 hover:text-rose-400 transition-colors"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-slate-500">
              <div className="text-5xl mb-3">📦</div>
              <div className="font-semibold">No products found</div>
            </div>
          )}
        </div>
      </Card>

      {/* Add/Edit Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editProd ? 'Edit Product' : 'Add New Product'} maxWidth="max-w-2xl">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><Input label="Product Name *" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Basmati Rice 5kg"/></div>
          <Input label="SKU" value={form.sku||''} onChange={e => setForm(f=>({...f,sku:e.target.value}))} placeholder="e.g. RICE001"/>
          <Select label="GST %" value={form.gstPercentage||'5'} onChange={e => setForm(f=>({...f,gstPercentage:e.target.value}))}
            options={['0','5','12','18','28'].map(v=>({value:v,label:`${v}%`}))}/>
          <Input label="Cost Price (₹) *" value={form.costPrice||''} onChange={e => setForm(f=>({...f,costPrice:e.target.value}))} type="number"/>
          <Input label="Selling Price (₹) *" value={form.sellingPrice||''} onChange={e => setForm(f=>({...f,sellingPrice:e.target.value}))} type="number"/>
          <Input label="MRP (₹)" value={form.mrp||''} onChange={e => setForm(f=>({...f,mrp:e.target.value}))} type="number"/>
          <Input label="Min Stock Alert" value={form.minQuantity||'10'} onChange={e => setForm(f=>({...f,minQuantity:e.target.value}))} type="number"/>
          <Select label="Unit" value={form.unit||'pack'} onChange={e => setForm(f=>({...f,unit:e.target.value}))}
            options={['piece','pack','bag','bottle','box','kg','litre','tube'].map(v=>({value:v,label:v}))}/>
          <Input label="Category" value={form.categoryName||''} onChange={e => setForm(f=>({...f,categoryName:e.target.value}))} placeholder="e.g. Grains"/>
        </div>
        {form.sellingPrice && form.costPrice && parseFloat(form.sellingPrice) < parseFloat(form.costPrice) && (
          <AlertBanner type="error" className="mt-4">⚠ Selling price is below cost price — this will result in a loss!</AlertBanner>
        )}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
          <Button variant="success" loading={loading} onClick={save}>💾 Save Product</Button>
        </div>
      </Modal>
    </div>
  )
}

// ── ORDERS PAGE ────────────────────────────────────────────────────────────────
export function OrdersPage() {
  const [orders, setOrders]   = useState(MOCK_ORDERS)
  const [search, setSearch]   = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const { storeId }           = useAuthStore()

  useEffect(() => {
    orderAPI.getByStore(storeId).then(r => setOrders(r.data.data)).catch(()=>{})
  }, [])

  const filtered = orders.filter(o =>
    (statusFilter === 'All' || o.status === statusFilter) &&
    (o.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
     o.customerName?.toLowerCase().includes(search.toLowerCase()))
  )

  const totalRev = orders.reduce((a,o) => a + (o.totalAmount||0), 0)

  return (
    <div className="space-y-4">
      <PageHeader title="🧾 Orders" subtitle={`${orders.length} total orders · ${formatCurrency(totalRev)} revenue`}
        actions={<>
          <Button variant="ghost" onClick={() => exportToCSV(orders.map(({invoiceNumber,customerName,totalAmount,status,paymentMode})=>({invoiceNumber,customerName,totalAmount,status,paymentMode})),'orders')}><Download size={14}/>Export</Button>
        </>}/>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label:'Total Orders', value:orders.length, color:'text-indigo-400' },
          { label:'Completed',    value:orders.filter(o=>o.status==='COMPLETED').length, color:'text-emerald-400' },
          { label:'Partial',      value:orders.filter(o=>o.status==='PARTIAL').length, color:'text-amber-400' },
          { label:'Revenue',      value:formatCurrency(totalRev), color:'text-emerald-400' },
        ].map(k => (
          <Card key={k.label} className="py-4">
            <div className="text-xs text-slate-500 font-bold uppercase">{k.label}</div>
            <div className={`text-xl font-black mt-1 ${k.color}`}>{k.value}</div>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="flex-1"><SearchInput value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search invoice or customer..."/></div>
        {['All','COMPLETED','PARTIAL','CANCELLED'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${statusFilter===s ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
            {s}
          </button>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-slate-700">
              {['Invoice','Date','Customer','Items','Total','Paid','Due','Mode','Status',''].map(h => (
                <th key={h} className="text-left text-xs text-slate-500 font-bold uppercase px-4 py-3 whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id} className="border-b border-slate-800 hover:bg-slate-900/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-indigo-400 font-bold">{o.invoiceNumber}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{formatDate(o.orderDate)}</td>
                  <td className="px-4 py-3 text-sm text-slate-200">{o.customerName||'Walk-in'}</td>
                  <td className="px-4 py-3 text-sm text-slate-400 text-center">{o.items?.length||'—'}</td>
                  <td className="px-4 py-3 text-sm font-bold text-slate-100">₹{o.totalAmount?.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-emerald-400">₹{o.paidAmount?.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm">
                    {o.dueAmount > 0
                      ? <span className="text-rose-400 font-bold">₹{o.dueAmount.toFixed(2)}</span>
                      : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="px-4 py-3"><span className={`badge ${paymentModeColor(o.paymentMode)}`}>{o.paymentMode}</span></td>
                  <td className="px-4 py-3"><span className={`badge ${orderStatusColor(o.status)}`}>{o.status}</span></td>
                  <td className="px-4 py-3"><Button variant="ghost" size="sm" onClick={() => toast('Reprinting...','info')}>🖨</Button></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="py-16 text-center text-slate-500">
                  <div className="text-5xl mb-2">🧾</div><div>No orders found</div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ── CUSTOMERS PAGE ─────────────────────────────────────────────────────────────
export function CustomersPage() {
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS)
  const [search, setSearch]       = useState('')
  const [modal, setModal]         = useState(false)
  const [form, setForm]           = useState({ name:'', phone:'', email:'', address:'', city:'' })

  useEffect(() => {
    customerAPI.getAll().then(r => setCustomers(r.data.data)).catch(()=>{})
  },[])

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search)
  )

  const create = async () => {
    if (!form.name || !form.phone) { toast.error('Name and phone required'); return }
    try {
      const res = await customerAPI.create(form)
      setCustomers(cs => [...cs, res.data.data])
    } catch {
      setCustomers(cs => [...cs, { ...form, id: Date.now(), loyaltyPoints:0, totalOrders:0, totalSpent:0 }])
    }
    toast.success('Customer added!')
    setModal(false); setForm({ name:'', phone:'', email:'', address:'', city:'' })
  }

  return (
    <div className="space-y-4">
      <PageHeader title="👥 Customers" subtitle={`${customers.length} registered customers`}
        actions={<Button onClick={() => setModal(true)}><Plus size={14}/>Add Customer</Button>}/>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label:'Total Customers', value:customers.length, color:'text-indigo-400' },
          { label:'Total Revenue',   value:formatCurrency(customers.reduce((a,c)=>a+(c.totalSpent||0),0)), color:'text-emerald-400' },
          { label:'Avg Loyalty Pts', value:Math.round(customers.reduce((a,c)=>a+(c.loyaltyPoints||0),0)/Math.max(1,customers.length)), color:'text-amber-400' },
        ].map(k => (
          <Card key={k.label}><div className="text-xs text-slate-500 font-bold uppercase">{k.label}</div><div className={`text-xl font-black mt-1 ${k.color}`}>{k.value}</div></Card>
        ))}
      </div>
      <div className="flex gap-3">
        <div className="flex-1"><SearchInput value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or phone..."/></div>
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(c => (
          <Card key={c.id}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-lg font-black text-indigo-400">
                {c.name.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-slate-100">{c.name}</div>
                <div className="text-xs text-slate-500">{c.phone}</div>
              </div>
            </div>
            <div className="space-y-1.5 text-sm">
              {c.email && <div className="flex gap-2 text-slate-400"><span>📧</span><span className="truncate">{c.email}</span></div>}
              {c.address && <div className="flex gap-2 text-slate-400"><span>📍</span><span className="truncate">{c.address}</span></div>}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-700">
                <div className="text-center"><div className="text-xs text-slate-500">Orders</div><div className="font-bold text-slate-200">{c.totalOrders||0}</div></div>
                <div className="text-center"><div className="text-xs text-slate-500">Spent</div><div className="font-bold text-emerald-400 text-xs">{formatCurrency(c.totalSpent||0)}</div></div>
                <div className="text-center"><div className="text-xs text-slate-500">Points</div><div className="font-bold text-amber-400">{c.loyaltyPoints||0}</div></div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="ghost" size="sm" className="flex-1 justify-center" onClick={() => toast('SMS sent! 📱','success')}>📱 SMS</Button>
              <Button variant="outline" size="sm" className="flex-1 justify-center" onClick={() => toast('History loaded','info')}>History</Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Add New Customer">
        <div className="space-y-4">
          <Input label="Full Name *" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
          <Input label="Phone *" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/>
          <Input label="Email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/>
          <Input label="Address" value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))}/>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
            <Button variant="success" onClick={create}>💾 Save Customer</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ── SUPPLIERS PAGE ─────────────────────────────────────────────────────────────
export function SuppliersPage() {
  const [suppliers, setSuppliers] = useState(MOCK_SUPPLIERS)
  const [search, setSearch]       = useState('')
  const [modal, setModal]         = useState(false)
  const [form, setForm]           = useState({ name:'', contactName:'', phone:'', email:'', city:'', gstNumber:'' })

  useEffect(() => { supplierAPI.getAll().then(r => setSuppliers(r.data.data)).catch(()=>{}) },[])

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.contactName?.toLowerCase().includes(search.toLowerCase())
  )

  const create = async () => {
    if (!form.name) { toast.error('Supplier name required'); return }
    try {
      const res = await supplierAPI.create(form)
      setSuppliers(ss => [...ss, res.data.data])
    } catch {
      setSuppliers(ss => [...ss, { ...form, id: Date.now(), balanceDue:0, status:'ACTIVE' }])
    }
    toast.success('Supplier added!'); setModal(false)
  }

  const recordPayment = async (id, balance) => {
    const amt = prompt(`Enter payment amount (Max: ₹${balance}):`)
    if (!amt || isNaN(amt)) return
    try {
      await supplierAPI.recordPayment(id, parseFloat(amt))
      setSuppliers(ss => ss.map(s => s.id===id ? { ...s, balanceDue: Math.max(0, s.balanceDue - parseFloat(amt)) } : s))
    } catch {
      setSuppliers(ss => ss.map(s => s.id===id ? { ...s, balanceDue: Math.max(0, s.balanceDue - parseFloat(amt)) } : s))
    }
    toast.success(`Payment of ₹${amt} recorded!`)
  }

  return (
    <div className="space-y-4">
      <PageHeader title="🚚 Suppliers" subtitle={`${suppliers.length} suppliers · ${formatCurrency(suppliers.reduce((a,s)=>a+(s.balanceDue||0),0))} total due`}
        actions={<Button onClick={() => setModal(true)}><Plus size={14}/>Add Supplier</Button>}/>
      <SearchInput value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search suppliers..."/>
      <div className="grid grid-cols-2 gap-4">
        {filtered.map(s => (
          <Card key={s.id}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="font-bold text-slate-100 text-base">{s.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">Contact: {s.contactName}</div>
              </div>
              <span className={`badge ${s.status==='ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>{s.status}</span>
            </div>
            <div className="space-y-1.5">
              {[['📞', s.phone], ['📧', s.email], ['📍', s.city], ['🏷', s.gstNumber||'—']].map(([icon,val]) => (
                <div key={icon} className="flex gap-2 text-sm text-slate-400"><span>{icon}</span><span>{val}</span></div>
              ))}
              <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-700">
                <div>
                  <div className="text-xs text-slate-500">Balance Due</div>
                  <div className={`text-base font-black ${s.balanceDue > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{formatCurrency(s.balanceDue||0)}</div>
                </div>
                <div className="flex gap-2">
                  {s.balanceDue > 0 && (
                    <Button variant="warning" size="sm" onClick={() => recordPayment(s.id, s.balanceDue)}>Pay Now</Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => toast('New PO created!','success')}>New PO</Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Add Supplier">
        <div className="space-y-4">
          <Input label="Company Name *" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
          <Input label="Contact Person" value={form.contactName} onChange={e=>setForm(f=>({...f,contactName:e.target.value}))}/>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Phone" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/>
            <Input label="Email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/>
            <Input label="City" value={form.city} onChange={e=>setForm(f=>({...f,city:e.target.value}))}/>
            <Input label="GST Number" value={form.gstNumber} onChange={e=>setForm(f=>({...f,gstNumber:e.target.value}))}/>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
            <Button variant="success" onClick={create}>💾 Save Supplier</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ── REPORTS PAGE ───────────────────────────────────────────────────────────────
const COLORS = ['#6366f1','#10b981','#f59e0b','#f43f5e','#3b82f6']
const WEEKLY = [
  { date:'Mon', revenue:8420, profit:2200 }, { date:'Tue', revenue:11200, profit:3100 },
  { date:'Wed', revenue:9800, profit:2650 }, { date:'Thu', revenue:13400, profit:3900 },
  { date:'Fri', revenue:15600, profit:4800 }, { date:'Sat', revenue:18900, profit:5600 },
  { date:'Sun', revenue:12300, profit:3400 },
]
const TOP_PRODS = [
  { name:'Basmati Rice 5kg', qty:142, revenue:49700 },
  { name:'Maggi Noodles 12pk', qty:89, revenue:16020 },
  { name:'Parle-G 800g', qty:124, revenue:9300 },
  { name:'Colgate 200g', qty:78, revenue:7410 },
  { name:'Aashirvaad Atta 10kg', qty:45, revenue:20700 },
]

export function ReportsPage() {
  const [dateRange, setDateRange] = useState('week')
  const { storeId } = useAuthStore()

  return (
    <div className="space-y-4">
      <PageHeader title="📊 Reports & Analytics" subtitle="Business intelligence and financial reports"
        actions={<>
          <Button variant="ghost" onClick={() => toast('Exported to Excel!','success')}><Download size={14}/>Excel</Button>
          <Button variant="ghost" onClick={() => toast('PDF generated!','success')}><Download size={14}/>PDF</Button>
          {['week','month','year'].map(r => (
            <button key={r} onClick={() => setDateRange(r)}
              className={`px-3 py-2 rounded-lg text-xs font-bold capitalize transition-all ${dateRange===r ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
              {r}
            </button>
          ))}
        </>}/>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label:'Total Revenue', value:formatCurrency(89620), color:'text-emerald-400' },
          { label:'Gross Profit',  value:formatCurrency(21050), color:'text-indigo-400' },
          { label:'Total Orders',  value:'255', color:'text-blue-400' },
          { label:'Loss Items',    value:'0', color:'text-rose-400' },
        ].map(k => (
          <Card key={k.label}><div className="text-xs text-slate-500 font-bold uppercase">{k.label}</div><div className={`text-2xl font-black mt-1 ${k.color}`}>{k.value}</div></Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <h3 className="font-bold text-slate-100 mb-4">📈 Daily Revenue vs Profit</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={WEEKLY}>
              <XAxis dataKey="date" tick={{ fill:'#64748b', fontSize:11 }}/>
              <YAxis tick={{ fill:'#64748b', fontSize:11 }} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`}/>
              <Tooltip formatter={v => formatCurrency(v)} contentStyle={{ background:'#1e293b', border:'1px solid #334155', borderRadius:8 }}/>
              <Bar dataKey="revenue" fill="#6366f1" radius={[4,4,0,0]}/>
              <Bar dataKey="profit"  fill="#10b981" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="font-bold text-slate-100 mb-4">🏆 Top Selling Products</h3>
          <div className="space-y-3">
            {TOP_PRODS.map((p,i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-400 text-xs font-black flex items-center justify-center flex-shrink-0">
                  {i+1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-slate-200 font-medium truncate">{p.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full" style={{ width:`${(p.qty/142)*100}%`, background: COLORS[i] }}/>
                    </div>
                    <span className="text-xs text-slate-500">{p.qty} units</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-emerald-400 flex-shrink-0">{formatCurrency(p.revenue)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700"><h3 className="font-bold text-slate-100">Order Summary</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-slate-700">
              {['Invoice','Customer','Total','Profit','Margin','Mode','Status'].map(h => (
                <th key={h} className="text-left text-xs text-slate-500 font-bold uppercase px-4 py-3">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {MOCK_ORDERS.map(o => (
                <tr key={o.id} className="border-b border-slate-800 hover:bg-slate-900/50">
                  <td className="px-4 py-3 text-xs font-mono text-indigo-400 font-bold">{o.invoiceNumber}</td>
                  <td className="px-4 py-3 text-sm text-slate-200">{o.customerName}</td>
                  <td className="px-4 py-3 text-sm font-bold text-slate-100">₹{o.totalAmount}</td>
                  <td className="px-4 py-3 text-sm text-emerald-400">₹{Math.round(o.totalAmount*0.22)}</td>
                  <td className="px-4 py-3"><span className="badge bg-emerald-500/20 text-emerald-400">22%</span></td>
                  <td className="px-4 py-3"><span className={`badge ${paymentModeColor(o.paymentMode)}`}>{o.paymentMode}</span></td>
                  <td className="px-4 py-3"><span className={`badge ${orderStatusColor(o.status)}`}>{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ── SETTINGS PAGE ──────────────────────────────────────────────────────────────
export function SettingsPage() {
  const [storeName, setStoreName] = useState('SmartRetail Store')
  const [gst, setGst]             = useState('27AADCB2230M1ZT')
  const [phone, setPhone]         = useState('9999999999')
  const [email, setEmail]         = useState('store@smartretail.com')

  return (
    <div className="space-y-4 max-w-2xl">
      <PageHeader title="⚙️ Settings" subtitle="Configure your store and system preferences"/>

      {[
        { title:'🏪 Store Information', fields:[
          { label:'Store Name', value:storeName, onChange:setStoreName },
          { label:'GST Number', value:gst, onChange:setGst },
          { label:'Phone', value:phone, onChange:setPhone },
          { label:'Email', value:email, onChange:setEmail },
        ]},
        { title:'👤 Account & Users', fields:[
          { label:'Admin Username', value:'admin', onChange:()=>{} },
          { label:'Admin Email', value:'admin@smartretail.com', onChange:()=>{} },
        ]},
        { title:'🔔 Notifications', fields:[
          { label:'Alert Email', value:'admin@smartretail.com', onChange:()=>{} },
          { label:'Low Stock Threshold', value:'10', onChange:()=>{} },
        ]},
      ].map(section => (
        <Card key={section.title}>
          <h3 className="font-bold text-slate-100 mb-4">{section.title}</h3>
          <div className="grid grid-cols-2 gap-4">
            {section.fields.map(f => (
              <Input key={f.label} label={f.label} value={f.value} onChange={e=>f.onChange(e.target.value)}/>
            ))}
          </div>
          <Button variant="primary" size="sm" className="mt-4" onClick={() => toast('Settings saved!','success')}>💾 Save Changes</Button>
        </Card>
      ))}

      <Card>
        <h3 className="font-bold text-slate-100 mb-4">🔒 Security & Data</h3>
        <div className="flex gap-3 flex-wrap">
          <Button variant="ghost" onClick={() => toast('Backup created!','success')}>💾 Backup Data</Button>
          <Button variant="ghost" onClick={() => toast('Audit log exported','info')}>📋 Audit Log</Button>
          <Button variant="ghost" onClick={() => toast('Report sent!','success')}>📧 Email Report</Button>
          <Button variant="danger" onClick={() => { if(confirm('Force logout all users?')) toast('All sessions cleared','warn') }}>🔓 Force Logout All</Button>
        </div>
      </Card>
    </div>
  )
}
