// ─────────────────────────────────────────────────────────────────────────────
// Pure CV content shown on the /profile page. This file has no idea the page
// is a 3D game — it's just data. The game structure (rooms, puzzles, which
// section belongs to which room) lives in src/data/hexaMaze.js and references
// each section here by `id`. Edit freely — nothing else needs to change.
// Wrap key words in **double asterisks** to render them bold.
// ─────────────────────────────────────────────────────────────────────────────

export const person = {
  name: 'Ayah Alrefai',
  title: 'Senior Backend Engineer',
  tagline: 'Senior Backend Engineer building enterprise banking systems with Java, Spring Boot & microservices.',
};

export const contact = [
  { label: 'Phone', value: '+962 77 876 1538', href: 'tel:+962778761538' },
  { label: 'Email', value: 'alrefayayah@gmail.com', href: 'mailto:alrefayayah@gmail.com' },
  { label: 'LinkedIn', value: 'ayah-alrefai-may1997', href: 'https://www.linkedin.com/in/ayah-alrefai-may1997/' },
  { label: 'GitHub', value: 'AyahAlrifai', href: 'https://github.com/AyahAlrifai' },
];

export const languages = [
  { name: 'Arabic', level: 'Native' },
  { name: 'English', level: 'Professional Working Proficiency' },
];

export const skills = [
  'Java', 'Spring Boot', 'Spring Framework', 'Spring Security', 'Spring Data JPA', 'Hibernate',
  'Microservices', 'REST APIs', 'Distributed Systems', 'Event-Driven Architecture',
  'RabbitMQ', 'Camunda BPM', 'Keycloak', 'OAuth2', 'JWT',
  'PostgreSQL', 'SQL Server', 'Oracle', 'MySQL', 'H2', 'Redis',
  'JUnit', 'Mockito', 'Docker', 'Git', 'Maven', 'SonarQube', 'Swagger/OpenAPI', 'JasperReports',
];

export const education = [
  {
    school: 'Jordan University of Science and Technology',
    degree: 'Bachelor of Computer Engineering',
    period: 'Sep 2015 – Jun 2020',
    detail: 'Excellent, GPA 3.93 / 4.0',
  },
];

export const certificates = [
  { name: 'Oracle Certified Associate (OCA)', detail: 'Java SE 8 Programmer — 1Z0-808' },
];

// One entry per CV section. `bullets: []` means the section renders one of
// the special blocks above (skills / education / contact) instead of plain
// bullet text — see RoomBody in profile.js.
export const cvSections = [
  {
    id: 'digitinary',
    icon: '🏢',
    color: '#ef4444',
    title: 'Digitinary',
    subtitle: 'Senior Backend Engineer',
    period: 'Sep 2023 – Present',
    bullets: [
      'Leading a **backend engineering team** of up to four developers — planning sprint work, assigning tasks, reviewing technical solutions, conducting code reviews, and mentoring junior engineers.',
      'Designed and built **17+ production-ready microservices** from scratch using **Java** and **Spring Boot**, including RESTful APIs and scalable schemas for enterprise banking services.',
      'Designed and implemented an internal **Microservice Generator** and **MultiExecPro** tooling to standardize scaffolding, shared libraries, and multi-service development workflows.',
      'Delivered core banking platform services — Lead, Loan, HR, Tenant & User Management, Reporting, Notifications, Customer Onboarding, and Maker-Checker workflows.',
      'Designed configurable **Camunda BPM** workflows and a centralized multi-channel notification platform (Email/SMS/Push) over **RabbitMQ**.',
      'Implemented enterprise authentication with **Keycloak** — custom authenticators, protocol mappers, multi-tenant authorization, and **JWT** customization — plus Open Banking adapter integrations.',
      'Maintained high code quality through thorough unit/integration testing and **SonarQube**, while shipping production hotfixes and performance improvements.',
    ],
  },
  {
    id: 'blulogix',
    icon: '🏺',
    color: '#ef4444',
    title: 'BluLogix',
    subtitle: 'Full Stack Developer II',
    period: 'Dec 2022 – Sep 2023',
    bullets: [
      'Built features for a **telecommunications e-commerce platform** serving US broadband providers.',
      'Implemented **ZIP code-based pricing logic** for broadband bundles.',
      'Developed backend services with **Spring Framework** and frontend components with **Angular**.',
      'Designed and documented REST APIs with **Swagger/OpenAPI**, working with **Oracle Database** in an Agile environment.',
    ],
  },
  {
    id: 'second-step',
    icon: '🗝️',
    color: '#ef4444',
    title: 'Second Step for Software Development',
    subtitle: 'Software Developer',
    period: 'Oct 2020 – Dec 2022',
    bullets: [
      'Developed enterprise modules for **Student Information Systems** and Student Portals used by educational institutions in the UAE.',
      'Delivered Surveys, Attendance Management, Certificate Equivalency, Health Records, and administrative service modules.',
      "Contributed to the UAE's **Child Protection System** — data migration and abuse-case management components.",
      'Worked extensively with a proprietary framework built on **Google Web Toolkit (GWT)**.',
      "Self-learned **Angular** and became the team's technical reference during the company's frontend transition.",
      "Selected for the company's **Innovation Lab** initiative, contributing to internal innovation projects and knowledge sharing.",
    ],
  },
  {
    id: 'skills',
    icon: '📚',
    color: '#ef4444',
    title: 'Skills',
    subtitle: 'Tools & technologies',
    bullets: [],
  },
  {
    id: 'education',
    icon: '🎓',
    color: '#ef4444',
    title: 'Education & Certificates',
    subtitle: 'JUST · Computer Engineering',
    bullets: [],
  },
  {
    id: 'contact',
    icon: '📞',
    color: '#ef4444',
    title: 'Get In Touch',
    subtitle: 'Languages: Arabic (Native) · English (Professional Working Proficiency)',
    bullets: [],
  },
];
