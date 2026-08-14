export type Project = {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  url: string;
  repo_url?: string | null;
  image_url?: string | null;
  category: string;
  market: string;
  tags: string[];
  featured: boolean;
  published: boolean;
  sort_order: number;
  accent: string;
};

export const fallbackProjects: Project[] = [
  {
    id: "marc-portfolio",
    title: "Full-stack systems portfolio",
    eyebrow: "Personal platform · 2026",
    description:
      "A proof-led portfolio that connects interface craft, systems thinking, deployment, documentation, and operations work.",
    url: "https://portfolio-marc-mendoza.onrender.com/",
    repo_url: "https://github.com/Necko0204/portfolioMarcMendoza",
    image_url: "/projects/portfolio.png",
    category: "Portfolio",
    market: "Philippines",
    tags: ["React", "TypeScript", "Systems"],
    featured: true,
    published: true,
    sort_order: 1,
    accent: "lime",
  },
  {
    id: "valorant-coaching",
    title: "Necko’s Coaching Hub",
    eyebrow: "Gaming product · Independent",
    description:
      "A conversion-focused coaching experience turning a competitive gaming background into a clear, bookable service.",
    url: "https://valo-coaching-necko.onrender.com/",
    image_url: "/projects/valorant.png",
    category: "Product site",
    market: "Global",
    tags: ["React", "UI/UX", "Conversion"],
    featured: true,
    published: true,
    sort_order: 2,
    accent: "coral",
  },
  {
    id: "kingstore",
    title: "King Abang Gadget Repair",
    eyebrow: "Client work · Local business",
    description:
      "A polished service and reservation site that makes device repair feel dependable, transparent, and easy to book.",
    url: "https://kingstore-kry3.onrender.com/",
    repo_url: "https://github.com/Necko0204/KingStore",
    image_url: "/projects/kingstore.png",
    category: "Client site",
    market: "Philippines",
    tags: ["TypeScript", "Booking", "Responsive"],
    featured: true,
    published: true,
    sort_order: 3,
    accent: "blue",
  },
  {
    id: "skilltest-indonesia",
    title: "SkillTest Indonesia",
    eyebrow: "Client platform · Indonesia",
    description:
      "A live business platform built and maintained across frontend, Firebase services, deployment, and technical handover.",
    url: "https://skilltestindonesia.com/",
    repo_url: "https://github.com/fyujidenzo-hub/skilltestindonesia",
    image_url: "/projects/skilltest.png",
    category: "Web platform",
    market: "Indonesia",
    tags: ["React", "Firebase", "Production"],
    featured: true,
    published: true,
    sort_order: 4,
    accent: "violet",
  },
  {
    id: "mitra-test",
    title: "Mitra Test Indonesia",
    eyebrow: "Client system · Indonesia",
    description:
      "A production authentication entry point for an Indonesian client system, delivered for real operational use.",
    url: "https://mitratestindonesia.com/login",
    image_url: "/projects/mitratest.png",
    category: "Client system",
    market: "Indonesia",
    tags: ["Authentication", "Client work", "Production"],
    featured: false,
    published: true,
    sort_order: 5,
    accent: "yellow",
  },
  {
    id: "hshr-school",
    title: "Holy Spirit School of Imus",
    eyebrow: "OJT project · Education",
    description:
      "A school-facing web experience and ERP-style project developed with PHP, MySQL, Bootstrap, and team leadership.",
    url: "https://hshr.onrender.com/landing_page",
    repo_url: "https://github.com/Necko0204/HSHR",
    image_url: "/projects/hshr.png",
    category: "OJT system",
    market: "Philippines",
    tags: ["PHP", "MySQL", "Team lead"],
    featured: false,
    published: true,
    sort_order: 6,
    accent: "blue",
  },
  {
    id: "fitness-one-pager",
    title: "Daily Grind Athletics",
    eyebrow: "One-pager · Concept",
    description:
      "An assertive fitness landing page exploring premium art direction, editorial rhythm, and high-energy conversion design.",
    url: "https://one-pager-portfolio-fitness.vercel.app/",
    image_url: "/projects/fitness.png",
    category: "One-pager",
    market: "Concept",
    tags: ["Art direction", "Motion", "Landing page"],
    featured: false,
    published: true,
    sort_order: 7,
    accent: "coral",
  },
  {
    id: "parttime-hub",
    title: "Part Time Hub Indonesia",
    eyebrow: "One-pager · Indonesia",
    description:
      "A focused Indonesian opportunity platform presented through a direct, responsive, single-page experience.",
    url: "https://parttimehubindonesia.com/",
    image_url: "/projects/parttimehub.png",
    category: "One-pager",
    market: "Indonesia",
    tags: ["Responsive", "Localized", "Launch"],
    featured: false,
    published: true,
    sort_order: 8,
    accent: "lime",
  },
];
