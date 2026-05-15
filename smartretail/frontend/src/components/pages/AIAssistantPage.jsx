import { useState, useEffect, useRef } from 'react'
import { Card, Button, Badge, PageHeader } from '../common/UI'
import { Bot, Send, Zap, TrendingUp, AlertTriangle, Users, ShoppingBag } from 'lucide-react'
import toast from 'react-hot-toast'

const SYSTEM_PROMPT = `You are an AI business assistant embedded in SmartRetail ERP — a retail management system used by Indian grocery and general stores.

Current Store Data:
- Products: Basmati Rice (stock:142), Amul Butter (stock:8, LOW), Surf Excel (stock:0, OUT), Maggi Noodles (stock:67), Colgate (stock:55), Lifebuoy Soap (stock:12, LOW)
- Today's Revenue: ₹18,450 | Orders: 42 | Profit: ₹4,820
- Weekly Sales: Mon ₹8,420 → Sat ₹18,900 (peak)
- Top Customers: Anita Singh (₹19,200 spent), Priya Sharma (₹12,450), Rahul Kumar (₹6,890)
- Pending Due: ₹264 from Rahul Kumar
- Supplier Dues: AgroFresh ₹24,500, HUL ₹15,200, ITC ₹8,900
- Low Stock: Amul Butter (8 left, min 15), Lifebuoy Soap (12 left, min 25)
- Out of Stock: Surf Excel 1kg

Be a retail business consultant. Give concise, actionable insights. Use Indian context (₹, GST, UPI). Use emojis. Format lists with bullets. Keep answers focused and practical.`

const QUICK_PROMPTS = [
  { icon:'📊', text:'What are today\'s top selling products?' },
  { icon:'📦', text:'Which items need immediate restocking?' },
  { icon:'💰', text:'Generate a daily business summary' },
  { icon:'📉', text:'Why might sales have dropped on Monday?' },
  { icon:'💡', text:'Suggest pricing improvements for better margins' },
  { icon:'👥', text:'Who are my most valuable customers?' },
  { icon:'🔮', text:'Predict next week\'s sales trend' },
  { icon:'🏪', text:'How can I increase average order value?' },
]

const AI_INSIGHTS = [
  {
    icon:'🔮', title:'Sales Forecast',
    body:'Based on weekly trends, Saturday sales projected at ₹21,000+ next week — 11% above average. Stock up on Grains and Dairy categories to avoid stockouts.',
    action:'Set Reorder Alert', color:'indigo'
  },
  {
    icon:'⚠️', title:'Critical Stock Alert',
    body:'Surf Excel has been out of stock for 3+ days. Estimated lost revenue: ₹2,300. Recommended: Order 50 units from HUL Supply Chain immediately.',
    action:'Create Purchase Order', color:'red'
  },
  {
    icon:'💡', title:'Pricing Opportunity',
    body:'Amul Butter margin is only 17% vs your 22% store average. Raising SP from ₹265 to ₹278 could add ₹1,950/month without affecting demand.',
    action:'Update Price', color:'yellow'
  },
  {
    icon:'👥', title:'Customer Engagement',
    body:'Anita Singh (top customer, ₹19,200 spent) hasn\'t visited in 5 days. Send a personalized loyalty offer to re-engage.',
    action:'Send Offer SMS', color:'green'
  },
]

const BASKET_ANALYSIS = [
  { prod:'Basmati Rice 5kg', also:['Fortune Oil 1L','Tata Salt 1kg','Aashirvaad Atta'], conf:'87%' },
  { prod:'Maggi Noodles 12pk', also:['Colgate 200g','Lifebuoy Soap','Amul Butter'], conf:'72%' },
  { prod:'Amul Butter 500g', also:['Parle-G 800g','Tata Salt 1kg','Fortune Oil'], conf:'65%' },
]

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([
    {
      role:'assistant',
      content:`👋 Hello! I'm your **AI Business Assistant** for SmartRetail ERP.\n\nI have access to your live store data and can help with:\n\n• 📊 Sales analysis & revenue insights\n• 📦 Inventory recommendations & reorder alerts\n• 💰 Profit/loss summaries & pricing advice\n• 🔮 Business trend predictions\n• 👥 Customer behavior insights\n• 💡 Smart business suggestions\n\nAsk me anything about your store!`
    }
  ])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('chat')
  const bottomRef             = useRef()

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages, loading])

  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    setMessages(m => [...m, { role:'user', content:msg }])
    setLoading(true)

    try {
      const history = messages.map(m => ({ role:m.role, content:m.content }))
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [
              ...history.map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }]
              })),
              { role: 'user', parts: [{ text: msg }] }
            ],
            generationConfig: { temperature: 0.7, maxOutputTokens: 512 }
          })
        }
      )
      const data = await response.json()
      console.log('Gemini response:', data)
      if (!response.ok) {
        throw new Error(data.error?.message || 'API request failed')
      }
      const replyText = data.candidates[0].content.parts[0].text
      setMessages(m => [...m, { role:'assistant', content:replyText }])
    } catch(err){
        console.log('Gemini Error:', err)
      setMessages(m => [...m, { role:'assistant', content:`⚠️ Error : ${err.message}` }])
    }
    setLoading(false)
  }

  const renderMessage = (text) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**'))
        return <strong key={i} className="text-slate-100 block">{line.slice(2,-2)}</strong>
      if (line.startsWith('• ') || line.startsWith('- '))
        return <div key={i} className="flex gap-2 leading-relaxed"><span className="text-indigo-400 flex-shrink-0">•</span><span>{line.slice(2)}</span></div>
      if (line === '')
        return <div key={i} className="h-2"/>
      return <div key={i} className="leading-relaxed">{line}</div>
    })
  }

  return (
    <div className="space-y-4">
      <PageHeader title="🤖 AI Business Assistant" subtitle="Powered by Gemini · Real-time insights for your store"/>

      {/* Tabs */}
      <div className="flex gap-2">
        {[{ id:'chat', label:'💬 AI Chat' }, { id:'insights', label:'📊 Auto Insights' }, { id:'basket', label:'🛒 Basket Analysis' }].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab===t.id ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── CHAT TAB ─────────────────────────────────────────── */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-4 gap-4" style={{ height:'calc(100vh - 240px)' }}>
          <div className="col-span-3 flex flex-col bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            {/* Chat header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-700">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center"><Bot size={16} className="text-indigo-400"/></div>
              <div>
                <div className="text-sm font-bold text-slate-100">AI Business Assistant</div>
                <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"/><span className="text-xs text-emerald-400">Online · Gemini 1.5 Flash</span></div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role==='user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                    m.role==='user'
                      ? 'bg-indigo-500 text-white rounded-br-sm'
                      : 'bg-slate-900 border border-slate-700 text-slate-300 rounded-bl-sm'
                  }`} style={{ lineHeight:'1.6' }}>
                    {renderMessage(m.content)}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-900 border border-slate-700 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full bg-indigo-500"
                        style={{ animation:`bounceDot 1.2s ${i*0.2}s infinite` }}/>
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef}/>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-700 flex gap-3">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key==='Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask about sales, inventory, profit, customers..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 outline-none"
              />
              <Button onClick={() => sendMessage()} disabled={!input.trim() || loading} variant="primary" className="px-4">
                <Send size={15}/>
              </Button>
            </div>
          </div>

          {/* Quick prompts */}
          <div className="flex flex-col gap-2">
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider px-1">Quick Questions</div>
            <div className="space-y-2 overflow-y-auto">
              {QUICK_PROMPTS.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q.text)}
                  className="w-full text-left bg-slate-800 border border-slate-700 hover:border-indigo-500 rounded-xl p-3 text-sm text-slate-400 hover:text-slate-200 transition-all">
                  <span className="mr-2">{q.icon}</span>{q.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── INSIGHTS TAB ─────────────────────────────────────── */}
      {activeTab === 'insights' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {AI_INSIGHTS.map((ins, i) => (
              <Card key={i}>
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">{ins.icon}</span>
                  <div>
                    <div className="font-bold text-slate-100">{ins.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">AI Generated · Just now</div>
                  </div>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">{ins.body}</p>
                <Button variant="outline" size="sm" onClick={() => toast(`${ins.action} done!`, 'success')}>
                  {ins.action} →
                </Button>
              </Card>
            ))}
          </div>

          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Zap size={18} className="text-amber-400"/>
              <h3 className="font-bold text-slate-100">📋 AI Daily Business Summary</h3>
            </div>
            <div className="bg-slate-900 rounded-xl p-5 border border-slate-700 text-sm text-slate-300 leading-relaxed space-y-3">
              <p><strong className="text-slate-100">📅 July 10, 2025 — End of Day Report</strong></p>
              <p>Today was a <strong className="text-emerald-400">strong sales day</strong> with ₹18,450 revenue from 42 orders — up 18% from yesterday's ₹15,632.</p>
              <p>🏆 <strong className="text-slate-100">Best performers:</strong> Basmati Rice (24 units), Maggi Noodles (18 units), Parle-G (31 units)</p>
              <p>⚠️ <strong className="text-amber-400">Attention needed:</strong> Surf Excel is out of stock (3rd consecutive day, est. loss ₹690/day). Amul Butter and Lifebuoy Soap critically low.</p>
              <p>💰 <strong className="text-slate-100">Financial:</strong> Gross profit ₹4,820 (26.1% margin). Pending collection: ₹264 from Rahul Kumar.</p>
              <p>💡 <strong className="text-slate-100">Recommendation:</strong> Place purchase order with HUL for Surf Excel & Lifebuoy Soap tomorrow morning.</p>
            </div>
          </Card>
        </div>
      )}

      {/* ── BASKET ANALYSIS TAB ──────────────────────────────── */}
      {activeTab === 'basket' && (
        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-2 mb-2">
              <ShoppingBag size={18} className="text-indigo-400"/>
              <h3 className="font-bold text-slate-100">Smart Basket Analysis</h3>
            </div>
            <p className="text-sm text-slate-400 mb-6">AI-powered "Customers who bought X also buy Y" — use this for cross-selling and store layout optimization.</p>
            <div className="grid grid-cols-3 gap-4">
              {BASKET_ANALYSIS.map((r, i) => (
                <div key={i} className="bg-slate-900 rounded-xl p-4 border border-slate-700">
                  <div className="text-xs text-slate-500 mb-1">Customers buying</div>
                  <div className="text-sm font-bold text-indigo-400 mb-3">{r.prod}</div>
                  <div className="text-xs text-slate-500 mb-2">also frequently buy:</div>
                  <div className="space-y-1.5 mb-3">
                    {r.also.map(a => (
                      <div key={a} className="flex items-center gap-2 text-xs text-slate-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"/>
                        {a}
                      </div>
                    ))}
                  </div>
                  <span className="badge bg-emerald-500/20 text-emerald-400">{r.conf} confidence</span>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <h3 className="font-bold text-slate-100 mb-4">🎯 "Why Sales Dropped?" Analyzer</h3>
              <div className="bg-slate-900 rounded-xl p-4 border border-slate-700 text-sm text-slate-300 space-y-2">
                <p className="text-amber-400 font-bold">Monday sales were ₹8,420 (lowest this week)</p>
                <p className="text-slate-400">Possible reasons identified:</p>
                <div className="space-y-1.5 pl-2">
                  {['Monday is typically a slower retail day in India','Surf Excel out-of-stock since Sunday — key item','No promotional activity on this day','Weather data: Heavy rain recorded (reduced footfall)'].map((r,i) => (
                    <div key={i} className="flex gap-2 text-xs"><span className="text-rose-400">→</span><span>{r}</span></div>
                  ))}
                </div>
              </div>
            </Card>
            <Card>
              <h3 className="font-bold text-slate-100 mb-4">🤖 Auto-Restock Suggestions</h3>
              <div className="space-y-3">
                {[
                  { name:'Surf Excel 1kg', qty:50, supplier:'HUL', urgency:'URGENT', cost:'₹9,250' },
                  { name:'Amul Butter 500g', qty:30, supplier:'Amul', urgency:'HIGH', cost:'₹6,600' },
                  { name:'Lifebuoy Soap 4pk', qty:40, supplier:'HUL', urgency:'HIGH', cost:'₹3,200' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-700">
                    <div>
                      <div className="text-sm font-semibold text-slate-200">{item.name}</div>
                      <div className="text-xs text-slate-500">Order {item.qty} units from {item.supplier}</div>
                    </div>
                    <div className="text-right">
                      <span className={`badge ${item.urgency==='URGENT' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'} mb-1`}>{item.urgency}</span>
                      <div className="text-xs text-slate-400">{item.cost}</div>
                    </div>
                  </div>
                ))}
                <Button variant="primary" className="w-full justify-center" onClick={() => toast('Purchase orders created!','success')}>
                  Create All Purchase Orders
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}