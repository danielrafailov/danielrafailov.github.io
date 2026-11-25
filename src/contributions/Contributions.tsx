import { useEffect } from "react";
import { Footer, Nav, type NavItem } from "../ui";
import { diffs } from "./diffs";
import { DiffViewer } from "./DiffViewer";
import { featuredPRs, type FeaturedPR } from "./prs";
import { SplitTree } from "./SplitTree";
import { MarkusReplica } from "./MarkusReplica";

const NAV: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "#markus", label: "MarkUs" },
  { href: "#courseography", label: "Courseography" },
];

const fmt = (n: number) => n.toLocaleString("en-US");

function PullRequest({ pr, sectionId }: { pr: FeaturedPR; sectionId?: string }) {
  const url = `https://github.com/${pr.repo}/pull/${pr.number}`;
  return (
    <article id={sectionId} className="section featured reveal" aria-labelledby={`${pr.id}-title`}>
      <h2 className="section-label">{pr.project}</h2>
      <div className="section-body">
        <p className="featured-eyebrow">
          <a href={url} target="_blank" rel="noreferrer">
            PR #{pr.number}
          </a>{" "}
          · Merged {pr.merged}
        </p>
        <h3 className="featured-title" id={`${pr.id}-title`}>
          {pr.title}
        </h3>
        <p className="summary">{pr.summary}</p>
        <p className="stack featured-stats">
          <span className="plus">+{fmt(pr.added)}</span> <span className="minus">−{fmt(pr.removed)}</span> ·{" "}
          {pr.files} files{pr.extra ? ` · ${pr.extra}` : ""} · {pr.tech}
        </p>
        {pr.excerptNote && (
          // The diagram's hover hint only applies to the desktop version.
          <p className={`excerpt-note${pr.visual ? " hide-on-phone" : ""}`}>{pr.excerptNote}</p>
        )}
      </div>

      <div className="featured-wide">
        {pr.visual === "split-1822" ? (
          <SplitTree />
        ) : (
          <DiffViewer files={diffs[String(pr.number)]} notes={pr.notes} />
        )}
        {pr.demo && <MarkusReplica />}
      </div>
    </article>
  );
}

export default function Contributions() {
  useEffect(() => {
    document.title = "Featured pull requests · Daniel Rafailov";
  }, []);

  const firstOf = (project: FeaturedPR["project"]) => featuredPRs.find((p) => p.project === project)?.id;

  return (
    <>
      <Nav items={NAV} />
      <main className="page" id="top">
        <header className="page-head reveal">
          <h1 className="page-title">Featured pull requests</h1>
          <p className="intro">
            Selected contributions from my internships in the University of Toronto Department of Computer Science,
            under Prof. David Liu. Each one shows the merged diff, with numbered notes on what changed and why. Hover a
            note to highlight its lines.
          </p>
        </header>

        {featuredPRs.map((pr) => (
          <PullRequest
            key={pr.id}
            pr={pr}
            sectionId={
              pr.id === firstOf("MarkUs") ? "markus" : pr.id === firstOf("Courseography") ? "courseography" : undefined
            }
          />
        ))}

        <Footer />
      </main>
    </>
  );
}
