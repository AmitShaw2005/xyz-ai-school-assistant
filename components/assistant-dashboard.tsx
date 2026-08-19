'use client'

import { useMemo, useState } from 'react'
import {
  Activity,
  ArrowUp,
  BarChart3,
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
  ClipboardCheck,
  Headphones,
  Languages,
  Mic,
  MoreHorizontal,
  Paperclip,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
  Volume2,
  Waves,
  X,
} from 'lucide-react'

type Role = 'Student' | 'Parent' | 'Teacher' | 'Principal'
type Message = { from: 'ai' | 'user'; text: string; tool?: string; tone?: 'success' | 'warning' }

const roles: Record<Role, { name: string; detail: string; initials: string; color: string; suggestions: string[]; metric: string; metricLabel: string }> = {
  Student: { name: 'Aarav Mehta', detail: 'Class 10-A · Student', initials: 'AM', color: 'bg-[#0d9488]', suggestions: ['What is my attendance?', 'Show my upcoming exams', 'Help me plan my study time'], metric: '92.4%', metricLabel: 'Your attendance' },
  Parent: { name: 'Priya Mehta', detail: 'Parent of Aarav & Anaya', initials: 'PM', color: 'bg-[#e07a5f]', suggestions: ["How much attendance does my child have?", 'What are the upcoming PTM dates?', 'I want to talk to my child’s teacher'], metric: '92.4%', metricLabel: 'Aarav’s attendance' },
  Teacher: { name: 'Rohan Kapoor', detail: 'Class teacher · 10-A', initials: 'RK', color: 'bg-[#6366f1]', suggestions: ['Mark Rahul absent today.', 'Show my class attendance', 'Draft a note for parents'], metric: '94.1%', metricLabel: 'Class attendance' },
  Principal: { name: 'Dr. Meera Rao', detail: 'School Principal', initials: 'MR', color: 'bg-[#b7791f]', suggestions: ['What is the overall attendance?', 'Show attendance by class', 'Contact school management'], metric: '91.8%', metricLabel: 'School attendance' },
}

const seeded: Record<Role, Message[]> = {
  Student: [{ from: 'ai', text: 'Good morning, Aarav. I’m here to help with your school day. What would you like to know?' }],
  Parent: [{ from: 'ai', text: 'Hello Priya. I can help you stay close to Aarav and Anaya’s school journey. How can I help today?' }],
  Teacher: [{ from: 'ai', text: 'Good morning, Rohan. I’m ready to help you with your class and attendance tasks.' }],
  Principal: [{ from: 'ai', text: 'Good morning, Dr. Rao. I can surface clear, useful insights for your school today.' }],
}

function Avatar({ role, speaking }: { role: Role; speaking: boolean }) {
  const person = roles[role]
  return <div className={`avatar-orb ${speaking ? 'avatar-speaking' : ''}`} aria-label={`${role} assistant avatar`}><div className="avatar-face"><span className="avatar-eye left" /><span className="avatar-eye right" /><span className={`avatar-mouth ${speaking ? 'mouth-open' : ''}`} /></div><div className="avatar-aura" /><span className="avatar-sparkle">✦</span><span className="avatar-label">{person.initials}</span></div>
}

export function AssistantDashboard() {
  const [role, setRole] = useState<Role>('Student')
  const [language, setLanguage] = useState('English')
  const [messages, setMessages] = useState<Message[]>(seeded.Student)
  const [input, setInput] = useState('')
  const [listening, setListening] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [showRoles, setShowRoles] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const person = roles[role]

  const summary = useMemo(() => role === 'Principal' ? [{ icon: Activity, label: 'Today’s attendance', value: '91.8%' }, { icon: UsersRound, label: 'Students present', value: '1,248' }, { icon: Bell, label: 'Needs attention', value: '08' }] : role === 'Teacher' ? [{ icon: ClipboardCheck, label: 'Present today', value: '28 / 30' }, { icon: UsersRound, label: 'Class average', value: '94.1%' }, { icon: Bell, label: 'Pending notes', value: '04' }] : [{ icon: ClipboardCheck, label: person.metricLabel, value: person.metric }, { icon: BookOpen, label: 'Next class', value: 'Mathematics' }, { icon: Bell, label: 'Notifications', value: '03' }], [role, person.metric, person.metricLabel])

  function chooseRole(next: Role) { setRole(next); setMessages(seeded[next]); setShowRoles(false); setInput('') }
  function submit(text = input) {
    const clean = text.trim(); if (!clean || processing) return
    setInput(''); setProcessing(true); setMessages((current) => [...current, { from: 'user', text: clean }])
    window.setTimeout(() => {
      const lower = clean.toLowerCase()
      let reply: Message
      if (lower.includes('ignore') || lower.includes('every student') || lower.includes('system prompt')) reply = { from: 'ai', text: 'I can only provide information that your account is authorized to access.', tone: 'warning' }
      else if (role === 'Student' && lower.includes('attendance')) reply = { from: 'ai', text: `You have ${person.metric} attendance this term. That’s a strong start — keep it up!`, tool: 'Attendance record · Access verified' }
      else if (role === 'Parent' && lower.includes('attendance')) reply = { from: 'ai', text: 'Aarav has 92.4% attendance this term across 83 school days. Would you like to check Anaya’s record too?', tool: 'Linked child · Aarav Mehta' }
      else if (role === 'Teacher' && (lower.includes('mark') || lower.includes('absent'))) reply = { from: 'ai', text: 'I found Rahul Sharma in Class 10-A. Should I mark him absent for today?', tool: 'Permission verified · Confirmation required', tone: 'warning' }
      else if (role === 'Principal' && lower.includes('attendance')) reply = { from: 'ai', text: 'Overall attendance is 91.8% today. Class 10 leads at 95.2%, while Class 8 may need a follow-up at 87.6%.', tool: 'School analytics · Management access verified' }
      else if (lower.includes('teacher') || lower.includes('talk')) reply = { from: 'ai', text: 'Of course. Would you like me to request a call with the teacher? I’ll only submit the request after your confirmation.', tool: 'Escalation request · Confirmation required', tone: 'warning' }
      else reply = { from: 'ai', text: language === 'Hindi' ? 'मैं आपकी सहायता के लिए यहाँ हूँ। कृपया अपना प्रश्न बताएं।' : `I’m here to help, ${person.name.split(' ')[0]}. You can ask me about attendance, classes, or support.` }
      setMessages((current) => [...current, reply]); setProcessing(false)
    }, 850)
  }
  function voice() { if (listening) { setListening(false); setProcessing(true); window.setTimeout(() => { setProcessing(false); submit(role === 'Parent' ? 'How much attendance does my child have?' : 'What is my attendance?') }, 650) } else setListening(true) }

  return <main className="min-h-screen bg-[#f7f8f6] text-[#14242e]">
    <header className="flex h-[76px] items-center justify-between border-b border-[#dfe7e4] bg-[#fbfcfa] px-5 md:px-10">
      <div className="flex items-center gap-3"><div className="brand-mark"><Waves size={20} /></div><div><p className="font-mono text-[10px] font-bold uppercase tracking-[.24em] text-[#6a7d7a]">XYZ AI</p><h1 className="font-serif text-[19px] font-semibold tracking-tight">School assistant</h1></div></div>
      <div className="flex items-center gap-3"><div className="hidden items-center gap-2 rounded-full border border-[#dfe7e4] bg-white px-3 py-2 text-xs text-[#5c706e] md:flex"><Languages size={14} /><select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-transparent outline-none"><option>English</option><option>Hindi</option><option>Tamil</option><option>Telugu</option><option>Marathi</option></select></div><button className="icon-button" aria-label="Notifications"><Bell size={18} /></button><div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white ${person.color}`}>{person.initials}</div></div>
    </header>
    <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-6 px-5 py-6 md:px-10 lg:grid-cols-[240px_minmax(0,1fr)_280px]">
      <aside className="hidden lg:block"><div className="mb-8"><p className="eyebrow">Your workspace</p><button onClick={() => setShowRoles(!showRoles)} className="role-switch"><span className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold text-white ${person.color}`}>{person.initials}</span><span className="min-w-0 flex-1 text-left"><b className="block truncate text-sm">{person.name}</b><small>{person.detail}</small></span><ChevronDown size={16} /></button>{showRoles && <div className="role-menu">{(Object.keys(roles) as Role[]).map((item) => <button key={item} onClick={() => chooseRole(item)} className={item === role ? 'active' : ''}><UserRound size={15} />{item}<span>{item === role ? <Check size={14} /> : null}</span></button>)}</div>}</div><nav className="space-y-1"><a className="nav-item active"><Sparkles size={17} />Assistant</a><a className="nav-item"><BarChart3 size={17} />My insights</a><a className="nav-item"><BookOpen size={17} />School resources</a></nav><div className="mt-16 rounded-2xl bg-[#e5f1ed] p-4"><ShieldCheck size={19} className="mb-3 text-[#0d9488]" /><p className="text-sm font-semibold">Private by design</p><p className="mt-1 text-xs leading-5 text-[#5c706e]">Your school data is only shown to people with permission.</p></div></aside>
      <section className="min-w-0"><div className="mb-5 flex items-end justify-between"><div><p className="eyebrow">{role} dashboard</p><h2 className="font-serif text-3xl font-semibold tracking-tight md:text-[38px]">How can I help today?</h2></div><button className="more-button" onClick={() => setShowMore(!showMore)} aria-label="More options"><MoreHorizontal size={20} /></button></div>{showMore && <div className="mb-4 flex justify-end"><div className="rounded-xl border border-[#dfe7e4] bg-white p-2 text-xs shadow-sm"><button className="block px-3 py-2 text-left hover:text-[#0d9488]">Download conversation</button><button className="block px-3 py-2 text-left hover:text-[#0d9488]">Clear conversation</button></div></div>}
        <div className="chat-panel"><div className="flex items-center justify-between border-b border-[#e7eeeb] px-5 py-4"><div className="flex items-center gap-3"><div className="relative"><span className="block h-2.5 w-2.5 rounded-full bg-[#27b39f]" /><span className="online-ping" /></div><div><p className="text-sm font-semibold">XYZ Assistant</p><p className="text-xs text-[#78908b]">Online · ready to help</p></div></div><button className="rounded-full p-2 text-[#78908b] hover:bg-[#f0f5f2]" aria-label="Audio settings"><Volume2 size={17} /></button></div><div className="chat-messages">{messages.map((message, index) => <div key={index} className={`message-row ${message.from === 'user' ? 'user-row' : ''}`}><div className={`message-avatar ${message.from === 'user' ? person.color : 'ai-avatar'}`}>{message.from === 'user' ? person.initials : <Sparkles size={15} />}</div><div className="max-w-[82%]"><div className={`message-bubble ${message.from === 'user' ? 'user-bubble' : ''} ${message.tone === 'warning' ? 'warning-bubble' : ''}`}>{message.text}</div>{message.tool && <p className="tool-note"><ShieldCheck size={12} />{message.tool}</p>}</div></div>)}{processing && <div className="message-row"><div className="message-avatar ai-avatar"><Sparkles size={15} /></div><div className="status-card"><span className="status-dot" />{listening ? 'Listening for your question…' : 'Checking school data…'}</div></div>}</div><div className="suggestions">{person.suggestions.map((suggestion) => <button key={suggestion} onClick={() => submit(suggestion)}>{suggestion}</button>)}</div><div className="composer"><button aria-label="Attach a file" className="composer-icon"><Paperclip size={18} /></button><input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) submit() }} placeholder="Ask anything about school…" /><button onClick={voice} aria-label={listening ? 'Stop listening' : 'Start voice conversation'} className={`voice-button ${listening ? 'listening' : ''}`}><Mic size={18} /></button><button onClick={() => submit()} aria-label="Send message" className="send-button"><ArrowUp size={18} /></button></div></div></section>
      <aside className="space-y-4"><div className="avatar-card"><div className="flex items-start justify-between"><div><p className="eyebrow">Your assistant</p><h3 className="mt-1 font-serif text-xl font-semibold">Always here.</h3></div><button aria-label="Help" className="text-[#78908b]"><CircleHelp size={18} /></button></div><div className="flex justify-center py-5"><Avatar role={role} speaking={listening || processing} /></div><div className="flex items-center justify-center gap-2 text-xs text-[#6e8580]"><span className="h-1.5 w-1.5 rounded-full bg-[#27b39f]" />{listening ? 'Listening' : processing ? 'Thinking' : 'Ready when you are'}</div></div><div className="summary-card"><div className="mb-4 flex items-center justify-between"><p className="eyebrow">At a glance</p><Activity size={17} className="text-[#0d9488]" /></div>{summary.map(({ icon: Icon, label, value }) => <div key={label} className="summary-row"><span className="flex items-center gap-2 text-xs text-[#718783]"><Icon size={15} />{label}</span><strong>{value}</strong></div>)}</div><div className="support-card"><div className="flex items-center gap-2"><PhoneCall size={17} className="text-[#0d9488]" /><p className="text-sm font-semibold">Need a human?</p></div><p className="mt-2 text-xs leading-5 text-[#70827e]">I can help you request a conversation with your school team.</p><button className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#b9d6ce] bg-white py-2.5 text-xs font-semibold text-[#17675f] hover:bg-[#edf8f5]"><Headphones size={14} />Request support</button></div></aside>
    </div>
    <div className="fixed bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full border border-[#dce8e3] bg-white/90 px-4 py-2 text-[10px] text-[#718783] shadow-lg backdrop-blur-sm">Demo workspace · {role} access · Data is simulated</div>
  </main>
}
