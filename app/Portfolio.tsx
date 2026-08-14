"use client";

import { useEffect, useMemo, useState } from "react";
import { fallbackProjects, type Project } from "./data";
import { getSupabase } from "./lib/supabase";

const filters = ["All", "Client work", "Web platform", "One-pager"];

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <span aria-hidden="true">{diagonal ? "↗" : "→"}</span>;
}

function safeHttpUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function ProjectVisual({ project }: { project: Project }) {
  const projectUrl = safeHttpUrl(project.url);

  return (
      <div className={`project-visual accent-${project.accent}`}>
      {project.image_url ? (
        <img src={project.image_url} alt={`${project.title} website preview`} />
      ) : (
        <div className="project-fallback" aria-hidden="true">
          <span>{project.market}</span>
          <strong>{project.title.split(" ").slice(0, 2).join(" ")}</strong>
          <i>LIVE / 0{project.sort_order}</i>
        </div>
      )}
      <div className="window-chrome">
        <span />
        <span />
        <span />
        <small>{projectUrl ? new URL(projectUrl).hostname : "Unavailable"}</small>
      </div>
      <span className="live-chip">Open live project <Arrow diagonal /></span>
    </div>
  );
}

export default function Portfolio() {
  const [projects, setProjects] = useState<Project[]>(fallbackProjects);
  const [activeFilter, setActiveFilter] = useState("All");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const client = getSupabase();
    if (!client) return;

    client
      .from("projects")
      .select("*")
      .eq("published", true)
      .order("sort_order")
      .then(({ data, error }) => {
        if (!error && data?.length) setProjects(data as Project[]);
      });
  }, []);

  const visibleProjects = useMemo(() => {
    if (activeFilter === "All") return projects;
    if (activeFilter === "Client work") {
      return projects.filter((project) =>
        ["Client site", "Client system", "OJT system"].includes(project.category),
      );
    }
    return projects.filter((project) => project.category === activeFilter);
  }, [activeFilter, projects]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <main>
      <nav className="site-nav" aria-label="Main navigation">
        <a className="brand" href="#top" aria-label="Marc Mendoza home">
          MM<span>®</span>
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="nav-links"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
        <div className={menuOpen ? "nav-links open" : "nav-links"} id="nav-links">
          <a href="#work" onClick={closeMenu}>Work</a>
          <a href="#about" onClick={closeMenu}>About</a>
          <a href="https://github.com/Necko0204" target="_blank" rel="noreferrer">
            GitHub <Arrow diagonal />
          </a>
          <a className="nav-cta" href="#contact" onClick={closeMenu}>Start a project</a>
        </div>
      </nav>

      <header className="hero" id="top">
        <div className="hero-kicker reveal">
          <span className="status-dot" /> Available for select projects &amp; full-time roles
        </div>
        <h1 className="hero-title">
          <span>FULL-STACK</span>
          <span className="title-shift">DEVELOPER WHO</span>
          <span className="outline-row">SHIPS <em>REAL WORK.</em></span>
        </h1>
        <div className="hero-badge" aria-hidden="true">
          <span>Build log</span>
          <strong>08</strong>
          <small>Live products and counting</small>
        </div>
        <div className="hero-lower">
          <p>
            I turn ambitious ideas into polished interfaces, dependable systems,
            and live products employers and clients can actually inspect.
          </p>
          <a className="circle-link" href="#work" aria-label="Explore selected work">
            <span>See the<br />evidence</span>
            <Arrow />
          </a>
        </div>
        <div className="hero-stats" aria-label="Portfolio statistics">
          <div><strong>08</strong><span>Live launches</span></div>
          <div><strong>02</strong><span>Markets served</span></div>
          <div><strong>∞</strong><span>Ideas in motion</span></div>
          <p>Based in Cavite, Philippines<br />Working beyond borders.</p>
        </div>
      </header>

      <section className="marquee" aria-label="Capabilities">
        <div>
          React + TypeScript <i>✦</i> Full-stack systems <i>✦</i> UI with intent <i>✦</i>
          React + TypeScript <i>✦</i> Full-stack systems <i>✦</i> UI with intent <i>✦</i>
        </div>
      </section>

      <section className="work-section" id="work">
        <div className="section-heading">
          <div>
            <span className="section-index">01 / SELECTED EVIDENCE</span>
            <h2>A growing body<br /><em>of shipped work.</em></h2>
          </div>
          <p>
            Client systems, independent products, and focused one-pagers. Every
            project below is live, inspectable, and built for a real purpose.
          </p>
        </div>

        <div className="filter-row" role="group" aria-label="Filter portfolio projects">
          {filters.map((filter) => (
            <button
              type="button"
              key={filter}
              className={activeFilter === filter ? "active" : ""}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="projects-grid">
          {visibleProjects.map((project, index) => (
            <article
              className={`project-card ${project.featured ? "featured" : ""}`}
              key={project.id}
            >
              <a href={safeHttpUrl(project.url) || "#work"} target="_blank" rel="noopener noreferrer" aria-label={`Open ${project.title}`}>
                <ProjectVisual project={project} />
              </a>
              <div className="project-meta">
                <div className="project-number">{String(index + 1).padStart(2, "0")}</div>
                <div className="project-copy">
                  <span>{project.eyebrow}</span>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <ul aria-label="Technologies and skills">
                    {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
                  </ul>
                </div>
                <a className="project-link" href={safeHttpUrl(project.url) || "#work"} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${project.title}`}>
                  <Arrow diagonal />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="section-index light">02 / THE BUILDER</div>
        <div className="about-grid">
          <h2>CREATIVE<br />ENOUGH TO<br /><em>STAND OUT.</em><br />TECHNICAL<br />ENOUGH TO<br /><span>SHIP IT.</span></h2>
          <div className="about-copy">
            <p className="lead">
              I care about the whole journey—from the first rough idea to the
              final live URL someone can actually use.
            </p>
            <p>
              My work spans React, TypeScript, PHP, SQL, Firebase, admin
              workflows, deployment, and client handover. I move comfortably
              between visual detail and operational logic.
            </p>
            <div className="capability-list">
              {["Interface design", "Frontend development", "Backend systems", "Admin workflows", "Deployment", "Technical handover"].map((item, index) => (
                <div key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}<Arrow /></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="github-proof">
        <div>
          <span className="section-index">03 / OPEN SOURCE RECEIPTS</span>
          <h2>THE WORK<br />BEHIND<br /><em>THE WORK.</em></h2>
        </div>
        <div className="github-panel">
          <img src="/projects/github.png" alt="Marc Mendoza's GitHub profile preview" />
          <div>
            <strong>Necko0204</strong>
            <span>11 public repositories · TypeScript, PHP, full-stack builds</span>
            <a href="https://github.com/Necko0204" target="_blank" rel="noreferrer">
              Inspect the code <Arrow diagonal />
            </a>
          </div>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <span className="section-index">04 / LET’S MAKE SOMETHING USEFUL</span>
        <h2>GOT A PROJECT<br />THAT NEEDS<br /><em>A BUILDER?</em></h2>
        <div className="contact-row">
          <p>
            Tell me what you’re trying to launch, improve, or untangle.<br />
            I’ll tell you how I can help.
          </p>
          <div>
            <a href="mailto:mendoza.marcangelo28@gmail.com">Email me <Arrow /></a>
            <a href="https://wa.me/639602161734" target="_blank" rel="noreferrer">WhatsApp <Arrow diagonal /></a>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-brand">MARC<br />MENDOZA<span>®</span></div>
        <div>
          <span>Full-stack developer</span>
          <span>© 2026</span>
        </div>
      </footer>
    </main>
  );
}
