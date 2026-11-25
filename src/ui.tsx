import { useEffect, useRef, useState, type ReactNode } from "react";
import { profile } from "./data";
import { Icon } from "./icons";

export type NavItem = { href: string; label: string };

/** Sticky top nav. In-page "#id" links highlight while their section is on screen. */
export function Nav({ items }: { items: NavItem[] }) {
  const [active, setActive] = useState("");

  useEffect(() => {
    const ids = items.filter((i) => i.href.startsWith("#")).map((i) => i.href.slice(1));
    const targets = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    targets.forEach((t) => observer.observe(t));

    // The footer is short, so treat reaching the bottom of the page as "Contact".
    const onScroll = () => {
      if (ids.includes("contact") && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        setActive("contact");
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [items]);

  // Phones get a hamburger button and a sidebar instead of the link row.
  const [open, setOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawerRef.current?.querySelector("a")?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    // Close if the window grows past phone width while open.
    const mq = window.matchMedia("(min-width: 641px)");
    const onWide = () => mq.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onWide);
    const burger = burgerRef.current;
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onWide);
      burger?.focus({ preventScroll: true });
    };
  }, [open]);

  const isActive = (n: NavItem) => Boolean(active) && n.href === `#${active}`;

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <ul className="nav-links">
            {items.map((n) => (
              <li key={n.href}>
                <a href={n.href} className={isActive(n) ? "is-active" : undefined}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
          <button
            ref={burgerRef}
            type="button"
            className={`burger${open ? " is-open" : ""}`}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="drawer"
            onClick={() => setOpen((o) => !o)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      <div className={`drawer-backdrop${open ? " is-open" : ""}`} onClick={() => setOpen(false)} aria-hidden="true" />
      <div
        ref={drawerRef}
        id="drawer"
        className={`drawer${open ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!open}
      >
        <button type="button" className="drawer-close" aria-label="Close menu" onClick={() => setOpen(false)}>
          ×
        </button>
        <ul className="drawer-links">
          {items.map((n) => (
            <li key={n.href}>
              <a href={n.href} className={isActive(n) ? "is-active" : undefined} onClick={() => setOpen(false)}>
                {n.label}
              </a>
            </li>
          ))}
        </ul>
        <ul className="drawer-social">
          {profile.links.map((l) => (
            <li key={l.label}>
              <a
                href={l.url}
                {...(l.url.startsWith("mailto:") ? {} : { target: "_blank", rel: "noreferrer" })}
                onClick={() => setOpen(false)}
              >
                <Icon name={l.icon} />
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export function Section({ id, label, children }: { id?: string; label: string; children: ReactNode }) {
  return (
    <section id={id} className="section reveal">
      <h2 className="section-label">{label}</h2>
      <div className="section-body">{children}</div>
    </section>
  );
}

export function Arrow() {
  return (
    <svg className="arrow" viewBox="0 0 12 12" aria-hidden="true">
      <path
        d="M3.5 8.5l5-5M4.5 3.5h4v4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Footer() {
  return (
    <footer id="contact" className="footer reveal">
      <p>
        Say hello at <a href={`mailto:${profile.email}`}>{profile.email}</a>
      </p>
      <p className="date">
        © {new Date().getFullYear()} {profile.name}
      </p>
    </footer>
  );
}
