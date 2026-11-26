// Copy deck, rendered exactly as written in docs/design/04-spec.md section 3.

export const meta = {
  title: 'Kaushal Panchal, Product Engineer',
  description: 'I build AI products end to end, from the first prompt to the on-prem rollout.',
  headAlt: 'Stylised 3D head of Kaushal wearing pixel-art sunglasses',
}

export const identity = {
  first: 'Kaushal',
  last: 'Panchal',
  name: 'Kaushal Panchal',
  cls: 'Product Engineer',
  clsMerged: 'Product Engineer, 5 yrs XP',
  pitch: 'I build AI products end to end, from the first prompt to the on-prem rollout.',
  rank: 'Now: Lead Engineer, AI Products at AutoVRse',
  chips: ['5 yrs XP', 'Leads 5-6 engineers', 'Bangalore, India'],
  xp: '5 yrs XP',
}

export const abilityCopy = {
  label: 'Abilities',
  hint: 'Press 1-4',
  groupName: 'Abilities. Press 1 to 4 to pick one.',
}

export const abilities = [
  {
    id: 'ai',
    name: 'AI Systems',
    chip: 'AI',
    tab: 'Signature move',
    color: 'var(--a-ai)',
    hex: '#3FE8FF',
    oneLiner: 'Multi-agent AI that does real work, not demos.',
    receipt: '20+ AI workers in parallel',
    detail:
      'A planner chain fans out to 20+ workers at once. Auto failover across OpenAI, Anthropic, Gemini and Azure. A grounding layer so the model only outputs what the engine can actually run.',
    tags: ['Multi-agent orchestration', 'OpenRouter', 'Provider failover', 'SSE streaming', 'Runtime grounding', 'Human-in-the-loop', 'ElevenLabs', 'Flux'],
    missions: ['vrse', 'rollouts'],
  },
  {
    id: '3d',
    name: 'Real-time 3D',
    chip: '3D',
    tab: null,
    color: 'var(--a-3d)',
    hex: '#FF5FAE',
    oneLiner: '3D on the web and in VR, built to ship.',
    receipt: '1 SDK, 2 production apps',
    detail:
      '3D websites, a 3D panorama tour tool, a reusable 3D web SDK, and VR training on Meta Quest. Yes, this page counts.',
    tags: ['React-Three-Fiber', '3D web SDK', 'Panorama tours', 'Meta Quest', 'MERN'],
    missions: ['sdk', 'rollouts'],
  },
  {
    id: 'stack',
    name: 'Full-stack',
    chip: 'Full-stack',
    tab: null,
    color: 'var(--a-stack)',
    hex: '#B6F23A',
    oneLiner: 'Front to back, plus the servers it runs on.',
    receipt: '$1M in transactions',
    detail:
      'React and Node apps with the plumbing done right. Concurrent worker pipelines, real-time WebSockets, and the AWS, Docker and Nginx setup to run it all.',
    tags: ['React', 'Node.js', 'Express', 'MongoDB', 'Supabase', 'AWS', 'Docker', 'Nginx', 'WebSockets', 'Tailwind'],
    missions: ['mulya', 'vrse'],
  },
  {
    id: 'lead',
    name: 'Product Lead',
    chip: 'Lead',
    tab: null,
    color: 'var(--a-lead)',
    hex: '#FFB020',
    oneLiner: 'Roadmap, team and client. Handled.',
    receipt: 'Leads 5-6 engineers',
    detail:
      'Works directly with the CEO and CTO, owns the roadmap, and embeds with client IT and security teams. Built Pulse, a dashboard that lets partners improve their own modules from real usage data.',
    tags: ['Roadmap ownership', 'Team lead', 'On-prem delivery', 'Analytics dashboards', 'Partner tooling'],
    missions: ['rollouts', 'mulya'],
  },
]

export const missionCopy = { label: 'Missions cleared' }

export const missions = [
  {
    id: 'vrse',
    name: 'VrseBuilder Studio',
    number: '20+',
    label: 'AI workers in parallel',
    oneLiner: 'Type a training brief in plain words. Get a playable VR experience back. No code.',
    detail:
      'A 4-agent planning chain, 4 model providers with auto failover, live streaming, and a chat agent that edits the VR content in real time.',
  },
  {
    id: 'rollouts',
    name: 'Enterprise Rollouts',
    number: '3',
    label: 'on-prem enterprise rollouts',
    oneLiner: 'AstraZeneca, Amazon and JSW. Embedded with their IT and security teams.',
    detail: "Shipped Amazon's warehouse safety training on Meta Quest into US facilities.",
  },
  {
    id: 'sdk',
    name: '3D Web SDK',
    number: '2',
    label: 'production apps sped up',
    oneLiner: 'Turned the Godrej MHE project into a reusable 3D web SDK.',
    detail: 'Also built 3D websites and VTP, a 3D panorama tour tool, for clients like Grasim Liva.',
  },
  {
    id: 'mulya',
    name: 'Mulya',
    number: '$1M',
    label: 'in transactions',
    oneLiner: 'Built a remittance platform for Indian freelancers, end to end. 100 active users.',
    detail: 'Cashfree payments, invoice PDFs, and the AWS and Docker setup. All of it.',
  },
]

// Which abilities link to each mission (derived from the ability table).
export const missionAbilities = Object.fromEntries(
  missions.map((m) => [m.id, abilities.map((a, i) => (a.missions.includes(m.id) ? i : -1)).filter((i) => i >= 0)])
)

export const career = {
  label: 'Career',
  button: 'Full career',
  now: 'Now',
  origin: 'B.Tech, Computer Science, Lovely Professional University, 2018 to 2022',
  summary: 'Now at AutoVRse. Before: Mulya, Flipstack.',
  summaryShort: 'Now at AutoVRse. Leads 5-6 engineers.',
  entries: [
    { company: 'AutoVRse', role: 'Lead Engineer, AI Products', dates: '2023 to now', oneLiner: 'Drove the shift from services to product. Leads 5-6 engineers.', now: true },
    { company: 'Mulya', role: 'Software Developer', dates: '2022 to 2023', oneLiner: 'Led the fintech remittance platform. $1M in transactions.' },
    { company: 'Flipstack Technologies', role: 'SDE Intern', dates: '2021 to 2022', oneLiner: 'Sole dev on a real-time delivery tracking dashboard. Shipped 2 more full-stack apps.' },
  ],
}

export const contact = {
  teamUp: 'Team up',
  email: 'krdpanchal@gmail.com',
  emailBtn: 'Email',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  mailto: 'mailto:krdpanchal@gmail.com',
  linkedinHref: 'https://linkedin.com/in/kaushal-panchal-a20220172',
  githubHref: 'https://github.com/Kaushal-Panchal',
  toast: 'Email copied. Talk soon.',
}

export const system = {
  loading: 'Loading hero',
  drag: 'Drag to spin',
  pokes: ['Deal with it.', 'Still not taking them off.', 'Okay, okay. Email me.'],
  close: 'Close',
  poke: 'Poke the hero',
  toneWord: 'SHIP IT.',
}
