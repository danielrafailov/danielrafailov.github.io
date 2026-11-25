import { useLayoutEffect, useRef, useState } from "react";
import { OLD_FILE, newTree, oldBlocks, sharedModules, type NewNode } from "./split1822";

const MAX_LINES = Math.max(...oldBlocks.map((b) => b.lines));

const allNodes = (nodes: NewNode[]): NewNode[] => nodes.flatMap((n) => [n, ...allNodes(n.children ?? [])]);
const fileFor = new Map([...allNodes(newTree), ...sharedModules].map((n) => [n.id, n.file]));

type Hover = { from?: number; to?: string } | null;

function TreeNodes({ nodes, hover, setHover }: { nodes: NewNode[]; hover: Hover; setHover: (h: Hover) => void }) {
  return (
    <ul>
      {nodes.map((n) => (
        <li key={n.id}>
          <div
            className={`st-node${n.isNew ? " is-new" : ""}${hover?.to === n.id ? " on" : ""}`}
            data-node={n.id}
            onMouseEnter={() => setHover({ to: n.id })}
            onMouseLeave={() => setHover(null)}
          >
            <span className="st-file">{n.file}</span>
            <span className="st-meta">
              {n.lines}
              {n.isNew && " · new"}
            </span>
            {n.usedBy && <span className="st-used">used by {n.usedBy}</span>}
          </div>
          {n.children && <TreeNodes nodes={n.children} hover={hover} setHover={setHover} />}
        </li>
      ))}
    </ul>
  );
}

/**
 * Before/after diagram for Courseography #1822: the old file's blocks on the
 * left, the new component tree on the right, joined by curves from each block
 * to the file it became. Removed blocks are struck through and have no curve.
 */
export function SplitTree() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [paths, setPaths] = useState<{ from: number; to: string; d: string }[]>([]);
  const [hover, setHover] = useState<Hover>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const draw = () => {
      // Curves only in the side-by-side layout.
      if (getComputedStyle(root).getPropertyValue("--st-wires").trim() !== "1") {
        setPaths([]);
        return;
      }
      const base = root.getBoundingClientRect();
      const next: typeof paths = [];
      oldBlocks.forEach((b, i) => {
        if (!b.to) return;
        const a = root.querySelector(`[data-block="${i}"]`)?.getBoundingClientRect();
        const z = root.querySelector(`[data-node="${b.to}"]`)?.getBoundingClientRect();
        if (!a || !z) return;
        const x1 = a.right - base.left;
        const y1 = a.top + a.height / 2 - base.top;
        const x2 = z.left - base.left;
        const y2 = z.top + Math.min(z.height / 2, 16) - base.top;
        const dx = (x2 - x1) / 2;
        next.push({ from: i, to: b.to, d: `M${x1} ${y1} C${x1 + dx} ${y1} ${x2 - dx} ${y2} ${x2} ${y2}` });
      });
      setPaths(next);
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(root);
    return () => ro.disconnect();
  }, []);

  // Phone version: the old file on top, opening down into the files it became.
  const created = oldBlocks.filter((b) => b.kind === "class" && b.to).map((b) => allNodes(newTree).find((n) => n.id === b.to)!);
  const removed = oldBlocks.filter((b) => !b.to);

  const lit = (from: number, to: string) => hover !== null && (hover.from === from || hover.to === to);

  return (
    <>
    <div className="split-mobile" aria-label={`${OLD_FILE.name} was split into ${created.length} components`}>
      <div className="stm-root">
        <span className="st-file">{OLD_FILE.name}</span>
        <span className="st-meta">{OLD_FILE.lines.toLocaleString("en-US")} lines · deleted</span>
      </div>
      <p className="stm-caption">split into {created.length} components</p>
      <ul className="stm-children">
        {created.map((n) => (
          <li key={n.id}>
            <span className="st-file">{n.file}</span>
            <span className="st-meta">{n.lines.replace(" lines", "")}</span>
          </li>
        ))}
      </ul>
      <div className="stm-removed">
        <p>Dead code removed</p>
        <p className="stm-removed-names">
          {removed.map((b) => (
            <s key={b.name}>{b.name}</s>
          ))}
        </p>
      </div>
    </div>
    <div className="split" ref={rootRef}>
      <svg className="st-wires" aria-hidden="true">
        {paths.map((p) => (
          <path key={p.from} d={p.d} className={lit(p.from, p.to) ? "on" : hover ? "dim" : ""} />
        ))}
      </svg>

      <div className="st-before">
        <p className="st-head">Before</p>
        <div className="st-file-box">
          <p className="st-file-title">
            <span className="st-file">{OLD_FILE.name}</span>
            <span className="st-meta">{OLD_FILE.lines.toLocaleString("en-US")} lines</span>
          </p>
          <ol className="st-blocks">
            {oldBlocks.map((b, i) => {
              const on = hover !== null && (hover.from === i || (b.to !== undefined && hover.to === b.to));
              return (
                <li
                  key={b.name}
                  data-block={i}
                  className={`st-block ${b.kind}${b.to ? "" : " is-removed"}${on ? " on" : ""}`}
                  onMouseEnter={() => setHover({ from: i })}
                  onMouseLeave={() => setHover(null)}
                >
                  <span className="st-bar" style={{ width: `${Math.max(4, (b.lines / MAX_LINES) * 100)}%` }} />
                  <span className="st-name">
                    {b.kind === "class" && <span className="st-kw">class </span>}
                    {b.kind === "function" && <span className="st-kw">function </span>}
                    {b.name}
                  </span>
                  <span className="st-meta">
                    {b.to ? `${b.lines} lines` : `removed: ${b.removedWhy}`}
                  </span>
                  {b.to && <span className="st-dest">→ {fileFor.get(b.to)}</span>}
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div className="st-after">
        <p className="st-head">After</p>
        <div className="st-tree">
          <TreeNodes nodes={newTree} hover={hover} setHover={setHover} />
        </div>
        <p className="st-head st-head-shared">Shared</p>
        <div className="st-tree st-shared">
          <TreeNodes nodes={sharedModules} hover={hover} setHover={setHover} />
        </div>
      </div>
    </div>
    </>
  );
}
