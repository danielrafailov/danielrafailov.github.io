import { pageZoom } from "../zoom";
import { Fragment, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import type { DiffFile, DiffLine } from "./diffs";
import { highlight, langFor } from "./highlight";

/**
 * A note pinned to lines of one file. `lines` are new-file line numbers, or
 * old-file numbers when `side` is "old" (for removed code). The numbered marker
 * sits on the first line; the rest highlight while the note is hovered.
 */
export type Note = { lines: number[]; side?: "old"; text: string };

// Wide enough for a notes column beside the code; below this, notes go inline.
// Effective width >= 1240px; only zoomed windows get there (1240 x 1.75).
const RAIL_QUERY = "(min-width: 2170px)";
const PHONE_QUERY = "(max-width: 640px)";

/** Split a line into its indentation (in columns) and the code after it. */
function splitIndent(s: string) {
  const lead = s.match(/^[ \t]*/)?.[0] ?? "";
  return { indent: lead.replace(/\t/g, "  ").length, code: s.slice(lead.length) };
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

function stats(file: DiffFile) {
  let add = 0;
  let del = 0;
  for (const h of file.hunks) {
    for (const l of h.lines) {
      if (l.t === "+") add++;
      else if (l.t === "-") del++;
    }
  }
  return { add, del };
}

const NO_NOTES: Note[] = [];

// Distance from a note's top edge to the middle of its first line of text.
const NOTE_ANCHOR = 20;

const lineNo = (l: DiffLine, side?: "old") =>
  side === "old" ? (l.t === "+" ? undefined : l.o) : l.t === "-" ? undefined : l.n;

type NoteProps = {
  note: Note;
  index: number;
  shown: boolean;
  focused: boolean;
  setFocus: (n: number | null) => void;
};

/**
 * A note with its connector: one numbered badge sits on the line that joins
 * the note to the code it describes. The wire is drawn by CSS ("rail" runs
 * across the gap beside the code, "inline" drops down from the line above).
 */
function NoteUnit({ note, index, shown, focused, setFocus, layout }: NoteProps & { layout: "rail" | "inline" }) {
  return (
    <div className={`note-unit ${layout}${shown ? " is-in" : ""}${focused ? " on" : ""}`}>
      <span className="wire wire-a" aria-hidden="true" />
      <span className="wire wire-b" aria-hidden="true" />
      <span className="marker wire-badge" aria-hidden="true">
        {index + 1}
      </span>
      <div
        className="callout"
        tabIndex={0}
        aria-label={`Note ${index + 1}: ${note.text}`}
        onMouseEnter={() => setFocus(index)}
        onMouseLeave={() => setFocus(null)}
        onFocus={() => setFocus(index)}
        onBlur={() => setFocus(null)}
      >
        {note.text}
      </div>
    </div>
  );
}

/** File tabs and the diff for the selected file, with notes beside or under their lines. */
export function DiffViewer({ files, notes }: { files: DiffFile[]; notes: Record<string, Note[]> }) {
  const [tab, setTab] = useState(0);
  const [focus, setFocus] = useState<number | null>(null);
  // Notes that have faded in, keyed "path#index" so switching tabs needs no reset.
  const [shown, setShown] = useState<Set<string>>(new Set());
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const rail = useMediaQuery(RAIL_QUERY);
  const phone = useMediaQuery(PHONE_QUERY);
  // Wrapping long lines beats sideways scrolling on a narrow screen.
  const [wrap, setWrap] = useState(() => window.matchMedia(PHONE_QUERY).matches);
  // On phones the code starts collapsed so visitors can skip past it.
  const [codeOpen, setCodeOpen] = useState(() => !window.matchMedia(PHONE_QUERY).matches);
  const showCode = !phone || codeOpen;
  const viewerRef = useRef<HTMLDivElement>(null);

  const file = files[tab];
  const fileNotes = notes[file.path] ?? NO_NOTES;
  const lang = langFor(file.path);

  const boxRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const markerRows = useRef(new Map<number, HTMLTableRowElement>());
  const railNotes = useRef(new Map<number, HTMLDivElement>());

  // Fade each note in once its marked line scrolls into view.
  useEffect(() => {
    if (reduceMotion) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const seen = entries
          .filter((e) => e.isIntersecting)
          .map((e) => `${file.path}#${(e.target as HTMLElement).dataset.note}`);
        if (seen.length) setShown((prev) => new Set([...prev, ...seen]));
      },
      { rootMargin: "0px 0px -18% 0px" },
    );
    markerRows.current.forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, [file.path, rail, reduceMotion, showCode]);

  // Long files scroll inside their box: start each tab at its first note.
  useLayoutEffect(() => {
    const box = boxRef.current;
    const first = markerRows.current.get(0);
    if (!box) return;
    box.scrollTop = 0;
    if (first) {
      // Only jump when the first note would start out of view, and leave some
      // lines above it for context.
      const offset = (first.getBoundingClientRect().top - box.getBoundingClientRect().top) / pageZoom();
      if (offset > box.clientHeight - 120) box.scrollTop = Math.max(0, offset - 140);
    }
    box.scrollLeft = 0;
  }, [tab, showCode]);

  // Inline notes are pinned to the visible width of the box while the code
  // scrolls sideways under them. Expose the horizontal scroll as --sx so the
  // wire can stay attached to its line and stretch to reach the note.
  useEffect(() => {
    const box = boxRef.current;
    if (!box || rail) return;
    let frame = 0;
    const update = () => box.style.setProperty("--sx", `${box.scrollLeft}px`);
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    box.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      box.removeEventListener("scroll", onScroll);
    };
  }, [rail, tab, showCode]);

  // In the side column, line each note up with its marked line, pushing
  // notes down where they would overlap.
  useLayoutEffect(() => {
    if (!rail) return;
    let frame = 0;
    const place = () => {
      const railEl = railRef.current;
      const box = boxRef.current;
      if (!railEl || !box) return;
      const z = pageZoom();
      const boxRect = box.getBoundingClientRect();
      railEl.style.height = `${boxRect.height / z}px`;
      let floor = 0;
      fileNotes.forEach((_, i) => {
        const row = markerRows.current.get(i);
        const el = railNotes.current.get(i);
        if (!row || !el) return;
        const rowRect = row.getBoundingClientRect();
        // Hide notes whose line is scrolled out of the box.
        const visible = rowRect.bottom > boxRect.top + 8 && rowRect.top < boxRect.bottom - 8;
        el.classList.toggle("is-out", !visible);
        if (!visible) return;
        const rowY = (rowRect.top + rowRect.height / 2 - boxRect.top) / z;
        const top = Math.max(rowY - NOTE_ANCHOR, floor);
        el.style.top = `${top}px`;
        // How far the note was pushed below its line; the connector spans it.
        el.style.setProperty("--dy", `${top + NOTE_ANCHOR - rowY}px`);
        floor = top + el.offsetHeight + 12;
      });
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(place);
    };
    place();
    const box = boxRef.current;
    box?.addEventListener("scroll", schedule, { passive: true });
    const ro = new ResizeObserver(schedule);
    if (tableRef.current) ro.observe(tableRef.current);
    if (box) ro.observe(box);
    return () => {
      cancelAnimationFrame(frame);
      box?.removeEventListener("scroll", schedule);
      ro.disconnect();
    };
  }, [rail, tab, fileNotes, showCode]);

  const totals = files.reduce(
    (acc, f) => {
      const { add, del } = stats(f);
      return { add: acc.add + add, del: acc.del + del };
    },
    { add: 0, del: 0 },
  );
  const hideCode = () => {
    setCodeOpen(false);
    setFocus(null);
    // Collapsing from the bottom shrinks the page above you; bring the
    // section's start back into view so reading can continue from there.
    requestAnimationFrame(() => {
      const el = viewerRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      const z = pageZoom();
      if (top < 64 * z) window.scrollBy({ top: top - 80 * z });
    });
  };

  const focusNote = focus === null ? null : fileNotes[focus];
  const isFocused = (l: DiffLine) => {
    if (!focusNote) return false;
    const n = lineNo(l, focusNote.side);
    return n !== undefined && focusNote.lines.includes(n);
  };
  const markerFor = (l: DiffLine) => fileNotes.findIndex((n) => lineNo(l, n.side) === n.lines[0]);

  if (!showCode) {
    return (
      <div className="diff-viewer" ref={viewerRef}>
        <p className="code-toggle-line">
          <button type="button" className="code-toggle" aria-expanded={false} onClick={() => setCodeOpen(true)}>
            Show code ▾
          </button>
          <span className="code-toggle-meta">
            {files.length} {files.length === 1 ? "file" : "files"} · <span className="plus">+{totals.add}</span>{" "}
            <span className="minus">−{totals.del}</span>
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className={`diff-viewer${rail ? " has-rail" : ""}`} ref={viewerRef}>
      {phone && (
        <p className="code-toggle-line">
          <button type="button" className="code-toggle" aria-expanded={true} onClick={hideCode}>
            Hide code ▴
          </button>
        </p>
      )}
      <div className="diff-toolbar">
      <div className="tabs" role="tablist" aria-label="Changed files">
        {files.map((f, i) => {
          const { add, del } = stats(f);
          return (
            <button
              key={f.path}
              role="tab"
              aria-selected={i === tab}
              className={i === tab ? "on" : ""}
              title={f.path}
              onClick={() => {
                setTab(i);
                setFocus(null);
                markerRows.current.clear();
                railNotes.current.clear();
              }}
            >
              {f.path.split("/").pop()}
              {add > 0 && <span className="plus">+{add}</span>}
              {del > 0 && <span className="minus">−{del}</span>}
            </button>
          );
        })}
      </div>
      {phone && (
        <button type="button" className={`wrap-toggle${wrap ? " on" : ""}`} aria-pressed={wrap} onClick={() => setWrap((w) => !w)}>
          <span className="wrap-switch" aria-hidden="true" />
          Wrap lines
        </button>
      )}
      </div>

      <div className="diff-body">
        <div className={`diff${phone && wrap ? " is-wrap" : ""}`} ref={boxRef} role="region" aria-label={`Changes to ${file.path}`} tabIndex={0}>
          <table ref={tableRef}>
            <tbody>
              {file.hunks.map((h, hi) => (
                <Fragment key={hi}>
                  <tr className="hunk">
                    <td colSpan={5}>@@ {h.context}</td>
                  </tr>
                  {h.lines.map((l, li) => {
                    const kind = l.t === "+" ? "add" : l.t === "-" ? "del" : "ctx";
                    const focused = isFocused(l);
                    const marker = markerFor(l);
                    return (
                      <Fragment key={li}>
                        <tr
                          className={`dl ${kind}${marker >= 0 ? " is-marked" : ""}${focused ? " is-focus" : ""}${focusNote && !focused ? " is-dim" : ""}`}
                          data-note={marker >= 0 ? marker : undefined}
                          ref={(el) => {
                            if (marker < 0) return;
                            if (el) markerRows.current.set(marker, el);
                            else markerRows.current.delete(marker);
                          }}
                        >
                          {!rail && <td className="dl-note" />}
                          {phone ? (
                            // One number column on phones: the new line, or the old one if removed.
                            <td className="dl-num">{l.n ?? l.o ?? ""}</td>
                          ) : (
                            <>
                              <td className="dl-num">{l.o ?? ""}</td>
                              <td className="dl-num">{l.n ?? ""}</td>
                            </>
                          )}
                          <td className="dl-sign" aria-hidden="true">
                            {l.t === " " ? "" : l.t === "-" ? "−" : "+"}
                          </td>
                          <td className="dl-code" style={{ "--indent": `${splitIndent(l.s).indent}ch` } as CSSProperties}>
                            <span className="sr-only">
                              {l.t === "+" ? "Added: " : l.t === "-" ? "Removed: " : ""}
                            </span>
                            {highlight(splitIndent(l.s).code, lang)}
                          </td>
                        </tr>
                        {!rail && marker >= 0 && (
                          <tr className="note-row">
                            <td colSpan={5}>
                              <NoteUnit
                                layout="inline"
                                note={fileNotes[marker]}
                                index={marker}
                                shown={reduceMotion || shown.has(`${file.path}#${marker}`)}
                                focused={focus === marker}
                                setFocus={setFocus}
                              />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {rail && (
          <div className="rail" ref={railRef} aria-label="Notes">
            {fileNotes.map((n, i) => (
              <div
                key={`${tab}-${i}`}
                className="rail-slot"
                ref={(el) => {
                  if (el) railNotes.current.set(i, el);
                  else railNotes.current.delete(i);
                }}
              >
                <NoteUnit
                  layout="rail"
                  note={n}
                  index={i}
                  shown={reduceMotion || shown.has(`${file.path}#${i}`)}
                  focused={focus === i}
                  setFocus={setFocus}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      {phone && (
        <p className="code-toggle-line code-toggle-bottom">
          <button type="button" className="code-toggle" onClick={hideCode}>
            Hide code ▴
          </button>
        </p>
      )}
    </div>
  );
}
