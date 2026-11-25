import { education, experience, profile, projects } from "./data";
import { Icon } from "./icons";
import { Arrow, Footer, Nav, Section, type NavItem } from "./ui";
import { Travel } from "./travel/Travel";

const NAV: NavItem[] = [
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#education", label: "Education" },
  { href: "#travel", label: "Travel" },
  { href: "#contact", label: "Contact" },
];

export default function App() {
  return (
    <>
    <Nav items={NAV} />
    <main className="page" id="top">
      <header className="hero reveal">
        <div className="hero-text">
          <p className="eyebrow">{profile.location}</p>
          <h1 className="name">
            {profile.name.split(" ")[0]} <em>{profile.name.split(" ").slice(1).join(" ")}</em>
          </h1>
          <p className="tagline">{profile.tagline}</p>
          <p className="intro">{profile.intro}</p>
          <nav className="links">
            {profile.links.map((l) => {
              const external = !l.url.startsWith("mailto:");
              return (
                <a
                  key={l.label}
                  href={l.url}
                  {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                >
                  <Icon name={l.icon} />
                  {l.label}
                </a>
              );
            })}
          </nav>
        </div>
        <img
          className="portrait"
          src="/portrait.webp"
          alt={`Portrait of ${profile.name} with the Toronto skyline behind`}
          width={560}
          height={700}
          fetchPriority="high"
        />
      </header>

      <Section id="experience" label="Experience">
        <ul className="list">
          {experience.map((e) => (
            <li key={e.org} className="item exp">
              <div className="logos">
                {e.logos?.length ? (
                  e.logos.map((src) => (
                    <img key={src} className="logo" src={src} alt="" width={40} height={40} loading="lazy" />
                  ))
                ) : (
                  <span className="logo logo-fallback" aria-hidden="true">
                    {e.org.charAt(0)}
                  </span>
                )}
              </div>
              <div className="exp-body">
              <div className="item-head">
                <h3>
                  {e.url ? (
                    <a href={e.url} target="_blank" rel="noreferrer">
                      {e.role}
                      <Arrow />
                    </a>
                  ) : (
                    e.role
                  )}
                </h3>
                <span className="date">{e.period}</span>
              </div>
              <p className="org">{e.org}</p>
              {e.summary && <p className="summary">{e.summary}</p>}
              {e.prs && (
                <p className="prs">
                  <span>Pull requests</span>
                  {e.prs.numbers.map((n) => (
                    <a key={n} href={`https://github.com/${e.prs!.repo}/pull/${n}`} target="_blank" rel="noreferrer">
                      #{n}
                    </a>
                  ))}
                </p>
              )}
              </div>
            </li>
          ))}
        </ul>
        <p className="cta">
          Curious what I built in the Department of Computer Science?
          <a href="/contributions">See my featured pull requests</a>
        </p>
      </Section>

      <Section id="projects" label="Projects">
        <ul className="list projects">
          {projects.map((p) => (
            <li key={p.title}>
              <a className="project" href={p.url} target="_blank" rel="noreferrer">
                <div className="item-head">
                  <h3>
                    {p.title}
                    <Arrow />
                  </h3>
                </div>
                <p className="summary">{p.summary}</p>
                <p className="stack">{p.stack.join(" · ")}</p>
              </a>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="education" label="Education">
        <div className="item">
          <div className="item-head">
            <h3>{education.school}</h3>
            <span className="date">{education.period}</span>
          </div>
          <p className="org">{education.degree}</p>
          <ul className="notes">
            {education.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      </Section>

      <Travel />

      <Footer />
    </main>
    </>
  );
}
