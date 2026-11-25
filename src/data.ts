export const profile = {
  name: "Daniel Rafailov",
  tagline: "Software engineer, Computer Science and Mathematics student",
  intro:
    "I'm a fourth-year Computer Science Specialist and Mathematics Major at the University of Toronto. I build full-stack web apps and native iOS apps, and contribute to open-source tools used by thousands of U of T students.",
  location: "Toronto, ON",
  email: "danielrafailov7@gmail.com",
  links: [
    { label: "GitHub", url: "https://github.com/danielrafailov", icon: "github" },
    { label: "LinkedIn", url: "https://linkedin.com/in/daniel-rafailov", icon: "linkedin" },
    { label: "Resume", url: "/Daniel_Rafailov_Resume.pdf", icon: "resume" },
    { label: "Email", url: "mailto:danielrafailov7@gmail.com", icon: "email" },
  ] as const,
};

export type Experience = {
  role: string;
  org: string;
  period: string;
  summary?: string;
  url?: string;
  logos?: string[];
  prs?: { repo: string; numbers: number[] };
};

export const experience: Experience[] = [
  {
    role: "Software Developer Intern",
    org: "Courseography · U of T Computer Science",
    logos: ["/logos/uoft-cs.webp"],
    period: "Sept 2026 — Present",
    summary:
      "Migrating the graph viewer and editor to React on a Haskell + GraphViz backend for an academic planner used by thousands of students. Set up CI with Tasty, HLint and pre-commit hooks.",
    url: "https://github.com/Courseography/courseography",
    prs: {
      repo: "Courseography/courseography",
      numbers: [1829, 1828, 1827, 1822, 1815, 1812, 1810, 1808, 1803],
    },
  },
  {
    role: "UX & Strategy Consultant",
    org: "Autinerary · Riipen Labs",
    logos: ["/logos/autinerary.webp"],
    period: "Sept 2026",
    summary:
      "Designing accessible user journeys for a platform centralizing neurodivergent resources, services and community.",
  },
  {
    role: "Software Developer Intern",
    org: "MarkUs · U of T Computer Science",
    logos: ["/logos/uoft-cs.webp"],
    period: "May — Aug 2026",
    summary:
      "Shipped Rails + React features for an assignment and autotesting platform used across the university, and stabilized CI by fixing flaky, non-deterministic tests in Jest and RSpec.",
    url: "https://github.com/MarkUsProject/Markus/pulls?q=is%3Apr+author%3Adanielrafailov+is%3Aclosed",
    prs: {
      repo: "MarkUsProject/Markus",
      numbers: [8106, 8068, 8037, 8019, 8003, 7993, 7971, 7964, 7958, 7947],
    },
  },
];

export type Project = {
  title: string;
  summary: string;
  stack: string[];
  url: string;
};

export const projects: Project[] = [
  {
    title: "SigmaStream",
    summary:
      "A native iOS and Apple TV streaming suite with a concurrent multi-provider backend and AI voice search.",
    stack: ["SwiftUI", "tvOS", "Node.js", "Python"],
    url: "https://github.com/danielrafailov/SigmaStream",
  },
  {
    title: "PointForge",
    summary:
      "A full-stack loyalty app for earning and redeeming reward points, with JWT auth and role-based permissions.",
    stack: ["React", "Express", "Prisma"],
    url: "https://github.com/Alex-Bangu/PointForge",
  },
  {
    title: "Dr. Mario in MIPS",
    summary:
      "The full game in bare-metal MIPS assembly: bitmap graphics, collisions and keyboard interrupts, no libraries.",
    stack: ["MIPS", "Assembly"],
    url: "https://github.com/danielrafailov/DrMario",
  },
];

export const education = {
  school: "University of Toronto",
  degree: "HBSc, Computer Science Specialist & Mathematics Major",
  period: "Sept 2023 — Sept 2027",
  notes: [
    "CGPA 3.45 / 4.0",
    "Dean's List, 2024",
    "6th place, U of T CTF 2026",
    "$3,000 Special Admission Scholarship",
  ],
};
