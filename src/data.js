export const profile = {
  name: 'Kaushal Panchal',
  role: 'Product Engineer',
  location: 'Bangalore, India',
  email: 'krdpanchal@gmail.com',
  phone: '+91 8699916710',
  linkedin: 'https://linkedin.com/in/kaushal-panchal-a20220172',
  github: 'https://github.com/Kaushal-Panchal',
  tagline: 'I build AI stuff that actually ships.',
}

export const stats = [
  { v: '5', l: 'Years shipping' },
  { v: '3', l: 'Fortune 500 rollouts' },
  { v: '5-6', l: 'Engineers led' },
  { v: '$1M', l: 'Payments processed' },
]

export const abilities = [
  {
    id: 'ai',
    code: '01',
    name: 'AI Systems',
    tag: 'Signature move',
    color: '#2FD8FF',
    level: 95,
    years: '3 yrs',
    blurb:
      'Agents that actually do the job. One planner chain fans out to 20+ workers at once, every one of them grounded in what the engine can really run, so nothing ships that cannot execute.',
    stack: ['Multi agent chains', 'OpenRouter', 'Provider failover', 'SSE streaming', 'Runtime grounding', 'Human in the loop', 'RAG', 'ElevenLabs'],
    proof:
      'Built VrseBuilder Studio. Someone describes a training brief in plain English and gets back a fully playable VR experience. No code, no engineers.',
  },
  {
    id: 'threed',
    code: '02',
    name: 'Real-Time 3D',
    tag: 'The fun one',
    color: '#E23B3B',
    level: 88,
    years: '5 yrs',
    blurb:
      'The web as a place, not a page. Shaders, instancing, scroll rigs, XR content pipelines. Built to hold 60fps on a laptop, not a render farm.',
    stack: ['React Three Fiber', 'three.js', 'GLSL', 'WebGL', 'Instancing', 'Meta Quest', 'Panorama tours'],
    proof:
      'Turned the Godrej MHE build into a reusable 3D web SDK that made the next two apps fast, plus VTP, a 3D tour tool, and 3D sites for Grasim Liva.',
  },
  {
    id: 'interface',
    code: '03',
    name: 'Interface Craft',
    tag: 'Everyday carry',
    color: '#F5B841',
    level: 92,
    years: '5 yrs',
    blurb:
      'Making a hard system feel obvious. Streaming agent output, chat that edits VR, dashboards thick with data. If a non technical expert trusts what they see, it worked.',
    stack: ['React', 'State architecture', 'Tailwind', 'Material UI', 'Design systems', 'Motion'],
    proof:
      'Shipped a chat agent where enterprise clients reshape VR content in real time, just by asking. Precise edits, zero engineers in the loop.',
  },
  {
    id: 'infra',
    code: '04',
    name: 'Systems & Infra',
    tag: 'Load bearing',
    color: '#8B7BFF',
    level: 85,
    years: '5 yrs',
    blurb:
      'Worker pools, real time transport, and deploys that survive somebody else’s security team. Fully on prem when that is what it takes.',
    stack: ['Node.js', 'Express', 'REST', 'MongoDB', 'Supabase', 'AWS', 'Docker', 'Nginx', 'WebSockets'],
    proof:
      'Owned AWS and Docker end to end at Mulya, then ran on prem VrseBuilder rollouts inside AstraZeneca, Amazon and JSW.',
  },
  {
    id: 'product',
    code: '05',
    name: 'Product & Delivery',
    tag: 'Ultimate',
    color: '#FF5C8A',
    level: 90,
    years: '3 yrs',
    blurb:
      'Sitting next to the CEO and CTO deciding what gets built, then walking 5 to 6 people through it without dropping the thread.',
    stack: ['Roadmap', 'Team leadership', 'Enterprise delivery', 'Analytics', 'Partner tooling'],
    proof:
      'Pushed AutoVRse from services to product, and shipped Pulse so partners could see what was working without asking an engineer.',
  },
]

export const origin = [
  {
    id: 'autovrse',
    org: 'AutoVRse',
    title: 'Lead Engineer, AI Products',
    period: '2023 - now',
    place: 'Bangalore',
    line: 'Built VrseBuilder Studio and its agent pipeline, shipped Pulse analytics, and put Amazon’s safety training on Quest in US facilities. Leading 5 to 6 people.',
  },
  {
    id: 'mulya',
    org: 'Mulya',
    title: 'Software Developer',
    period: '2022 - 2023',
    place: 'Remote',
    line: 'Led the whole remittance platform. Cashfree payments, invoicing, AWS and Docker. Got it to 100 active users and $1M moved.',
  },
  {
    id: 'flipstack',
    org: 'Flipstack',
    title: 'SDE Intern',
    period: '2021 - 2022',
    place: 'Remote',
    line: 'Sole dev on a live delivery tracking dashboard. MERN, Docker, Nginx, WebSockets. Plus two more full stack apps shipped.',
  },
  {
    id: 'lpu',
    org: 'Lovely Professional University',
    title: 'B.Tech, Computer Science',
    period: '2018 - 2022',
    place: 'Punjab',
    line: 'Where the 3D habit started. CGPA 7.8.',
  },
]

export const missions = [
  {
    id: 'vrsebuilder',
    name: 'VrseBuilder Studio',
    org: 'AutoVRse',
    year: '2023',
    metric: '20+ agents at once',
    line: 'Plain English brief in, playable VR experience out. One gateway across four model providers with automatic failover.',
    accent: '#2FD8FF',
  },
  {
    id: 'agent',
    name: 'Conversational Edit Agent',
    org: 'AutoVRse',
    year: '2024',
    metric: 'Edits by chat',
    line: 'Clients reshape VR content by talking to it. Real time, precise, no engineers involved.',
    accent: '#F5B841',
  },
  {
    id: 'pulse',
    name: 'Pulse',
    org: 'AutoVRse',
    year: '2024',
    metric: 'Live telemetry',
    line: 'Partner analytics on every deployed module. Completion, time per step, where people keep failing.',
    accent: '#FF5C8A',
  },
  {
    id: 'amazon',
    name: 'Warehouse Safety VR',
    org: 'Amazon',
    year: '2024',
    metric: 'Live in US sites',
    line: 'Amazon’s warehouse safety training, shipped on Meta Quest into real facilities.',
    accent: '#E23B3B',
  },
  {
    id: 'mulya',
    name: 'Mulya',
    org: 'Fintech',
    year: '2022',
    metric: '$1M processed',
    line: 'Remittance for Indian freelancers. Payments, invoices, infra, all of it.',
    accent: '#8B7BFF',
  },
  {
    id: 'sdk',
    name: '3D Web SDK & VTP',
    org: 'AutoVRse',
    year: '2023',
    metric: '2 apps accelerated',
    line: 'A panorama tour tool and a reusable R3F kit pulled out of a client build.',
    accent: '#F4EEE6',
  },
]

export const tabs = [
  { id: 'powers', label: 'Powers' },
  { id: 'origin', label: 'Origin' },
  { id: 'missions', label: 'Missions' },
  { id: 'signal', label: 'Signal' },
]
