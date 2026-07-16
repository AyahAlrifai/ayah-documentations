// ─────────────────────────────────────────────────────────────────────────────
// CV content shown on the /profile maze page (src/pages/profile.js).
// Everything on that page is generated from the data below — edit freely,
// nothing else needs to change. Add/remove a room and the maze will
// automatically resize and re-place it.
// ─────────────────────────────────────────────────────────────────────────────

export const person = {
  name: 'Ayah Alrefai',
  title: 'Software Developer',
  tagline: 'Senior Backend Developer building scalable systems with Java, Spring & microservices.',
};

export const contact = [
  { label: 'Phone', value: '+962 778 761 538', href: 'tel:+962778761538' },
  { label: 'Email', value: 'alrefayayah@gmail.com', href: 'mailto:alrefayayah@gmail.com' },
  { label: 'LinkedIn', value: 'ayah-alrefai-may1997', href: 'https://www.linkedin.com/in/ayah-alrefai-may1997/' },
  { label: 'GitHub', value: 'AyahAlrifai', href: 'https://github.com/AyahAlrifai' },
];

export const languages = [
  { name: 'Arabic', level: 'Native Speaker' },
  { name: 'English', level: 'Good' },
];

export const skills = [
  'Java', 'Spring & Spring Boot', 'OOP', 'AOP', 'Microservices',
  'Redis', 'RabbitMQ', 'Camunda', 'MySQL', 'Oracle', 'PostgreSQL',
  'Git', 'Swagger', 'Angular', 'JavaScript', 'HTML', 'CSS',
];

export const education = [
  {
    school: 'Jordan University of Science and Technology',
    degree: "Bachelor's in Computer Engineering",
    period: 'Sep 2015 – Jun 2020',
    detail: 'Excellent, GPA 3.93 / 4.0',
  },
];

export const certificates = [
  { name: 'OCA Certification — Oracle', detail: '1Z0-808 Java SE 8 Programmer' },
];

// Each entry becomes one explorable room, rendered both as a 3D interactive
// prop (see `prop` + `position`) and as a plain-text card in the accessible
// fallback view. `bullets: []` means the room renders one of the special
// sections above (skills / education / contact) instead of plain text.
// Wrap key words in **double asterisks** to render them bold.
//
// `prop` must be one of: 'altar' | 'vase' | 'chest' | 'bookshelf' | 'well' | 'mirror'
// `position` is an [x, 0, z] coordinate inside the 3D room (room spans roughly
// -9..9 on both axes; player starts around [0, 0, 9]).
export const rooms = [
  {
    id: 'digitinary',
    icon: '🏢',
    color: '#0859fc',
    title: 'Digitinary',
    subtitle: 'Senior Backend Developer',
    period: 'Sep 2023 – Now',
    prop: 'altar',
    position: [0, 0, -8],
    bullets: [
      'Leading the **backend team** — technical guidance and cross-team collaboration to keep projects aligned toward shared goals.',
      'Built scalable **notification microservices** (dynamic & static content, multi-channel delivery, API integration) using **RabbitMQ** for reliable, high-performance message queuing.',
      'Built a dynamic **Camunda** workflow engine adaptable to new processes with minimal code changes — currently drives maker-checker and customer onboarding workflows.',
      'Key contributor to an **Open Banking** adapter enabling transparent, accessible banking services.',
    ],
  },
  {
    id: 'blulogix',
    icon: '🏺',
    color: '#fc7dc7',
    title: 'BluLogix',
    subtitle: 'Full Stack Developer, Level 2',
    period: 'Dec 2022 – Sep 2023',
    prop: 'vase',
    position: [-6, 0, -3],
    bullets: [
      'Worked on an **e-commerce system** and broadband management platform.',
      'Documented API architecture with **Swagger**, deepening cross-team understanding of the business.',
    ],
  },
  {
    id: 'second-step',
    icon: '🗝️',
    color: '#6d9eff',
    title: 'Second Step for Software Development',
    subtitle: 'Junior Software Developer',
    period: 'Oct 2020 – Dec 2022',
    prop: 'chest',
    position: [6, 0, -3],
    bullets: [
      'Developed and maintained the **SIS Student Information System** & Student Portal (UAE) — surveys, certificate equivalency, health records, Sanadak project, attendance management — using **Java**, **GWT**, and CSS.',
      "Worked on the UAE's **Child Protection System**: data migration and abuse-case management components.",
    ],
  },
  {
    id: 'skills',
    icon: '📚',
    color: '#22c55e',
    title: 'Skills',
    subtitle: 'Tools & technologies',
    prop: 'bookshelf',
    position: [-7, 0, 3],
    bullets: [],
  },
  {
    id: 'education',
    icon: '🪣',
    color: '#f59e0b',
    title: 'Education & Certificates',
    subtitle: 'JUST · Computer Engineering',
    prop: 'well',
    position: [7, 0, 3],
    bullets: [],
  },
  {
    id: 'contact',
    icon: '🪞',
    color: '#ef4444',
    title: 'Get In Touch',
    subtitle: 'Languages: Arabic (Native) · English (Good)',
    prop: 'mirror',
    position: [0, 0, 6],
    bullets: [],
  },
];

export const playerStart = [0, 0, 9];
export const roomBounds = { minX: -9, maxX: 9, minZ: -9, maxZ: 9 };
