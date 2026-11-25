import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";

/**
 * A small guided tour in the style of react-joyride: a spotlight on one
 * element at a time and a card that explains it. Steps can put the page in
 * the state they need (`enter`), do something when the visitor presses Next
 * (`next`), and move on by themselves once the visitor does the step on their
 * own (`done`).
 */
export type TourStep = {
  /** CSS selector, looked up inside the tour's root element. */
  target: string;
  title: string;
  body: ReactNode;
  enter?: () => void;
  next?: () => void;
  done?: () => boolean;
  /** Step to jump to when `done` fires, if not simply the next one. */
  doneNext?: number;
  nextLabel?: string;
  /**
   * Where the card goes. By default it sits below the target, or inside it
   * when the target is large. "outside" keeps it clear of the target (above
   * it if there's room, otherwise below), for things the visitor must use.
   */
  placement?: "auto" | "outside";
};

type Rect = { top: number; left: number; width: number; height: number; step: number };

const PAD = 6;
const CARD_WIDTH = 320;
const NAV_HEIGHT = 64; // the site's sticky nav

export function Tour({
  steps,
  rootRef,
  step,
  setStep,
  deps,
}: {
  steps: TourStep[];
  rootRef: RefObject<HTMLElement | null>;
  step: number | null;
  setStep: (s: number | null) => void;
  /** Values that change the page; the spotlight re-measures when they do. */
  deps: unknown[];
}) {
  const [rect, setRect] = useState<Rect | null>(null);
  const [rootWidth, setRootWidth] = useState(0);
  const [cardHeight, setCardHeight] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  // Where the card is going (root coordinates). The card animates there, so
  // its on-screen position lags behind; scrolling must use the destination.
  const cardTopRef = useRef(0);
  const current = step === null ? null : steps[step];

  // Put the page into this step's state.
  useEffect(() => {
    current?.enter?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Move on once the visitor has done the step themselves. Skip the check in
  // the same pass the step is entered, before `enter` has reset the page;
  // otherwise going Back to such a step would bounce straight forward.
  const checkedStep = useRef<number | null>(null);
  useEffect(() => {
    if (checkedStep.current !== step) {
      checkedStep.current = step;
      return;
    }
    if (step !== null && current?.done?.() && step < steps.length - 1) setStep(current.doneNext ?? step + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, ...deps]);

  const measure = useCallback(() => {
    const root = rootRef.current;
    if (!root || !current) return;
    const el = root.querySelector(current.target);
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    const base = root.getBoundingClientRect();
    setRootWidth(base.width);
    setRect({ top: r.top - base.top, left: r.left - base.left, width: r.width, height: r.height, step: step ?? -1 });
  }, [rootRef, current, step]);

  useLayoutEffect(() => {
    if (step === null) return;
    measure();
    // Elements like the dialog appear a frame after the state change.
    const frame = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, measure, ...deps]);

  useEffect(() => {
    if (step === null) return;
    const root = rootRef.current;
    const ro = new ResizeObserver(measure);
    if (root) ro.observe(root);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [step, measure, rootRef]);

  // Keep the spotlight and its card on screen: exactly once per step, the
  // first time that step's target has been measured.
  const scrolledFor = useRef<number | null>(null);
  useEffect(() => {
    if (step === null) {
      scrolledFor.current = null;
      return;
    }
    if (!rect || rect.step !== step || scrolledFor.current === step) return;
    const root = rootRef.current;
    const card = cardRef.current;
    if (!root || !card) return;
    scrolledFor.current = step;
    const base = root.getBoundingClientRect();
    const cardTop = base.top + cardTopRef.current;
    const cardBottom = cardTop + card.offsetHeight;
    const top = Math.min(base.top + rect.top, cardTop) - PAD;
    const bottom = Math.max(base.top + rect.top + rect.height, cardBottom) + PAD;
    const viewH = window.innerHeight;
    if (top >= NAV_HEIGHT + 8 && bottom <= viewH - 8) return;
    const span = bottom - top;
    const room = viewH - NAV_HEIGHT;
    const delta = span > room - 16 ? top - NAV_HEIGHT - 16 : top - (NAV_HEIGHT + (room - span) / 2);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollBy({ top: delta, behavior: reduce ? "auto" : "smooth" });
  }, [step, rect, rootRef]);

  useEffect(() => {
    if (step === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.querySelector("#invite_dialog")) setStep(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, setStep]);

  // Card height decides whether it fits above the target.
  useLayoutEffect(() => {
    const h = cardRef.current?.offsetHeight ?? 0;
    if (h && Math.abs(h - cardHeight) > 1) setCardHeight(h);
  }, [step, rect, rootWidth, cardHeight]);

  if (step === null || !current) return null;

  const last = step === steps.length - 1;
  const outside = current.placement === "outside";
  const big = rect !== null && rect.height > 280 && !outside;
  const width = Math.min(CARD_WIDTH, Math.max(rootWidth - 16, 240));
  const GAP = PAD + 12;
  const roomAbove = rect ? rect.top - GAP - cardHeight : 0;
  const cardTop = !rect
    ? 16
    : big
      ? rect.top + 16
      : outside && roomAbove >= 0
        ? roomAbove
        : rect.top + rect.height + GAP;
  cardTopRef.current = cardTop;
  const cardLeft = rect
    ? Math.max(8, Math.min(big ? rect.left + 16 : rect.left, rootWidth - width - 8))
    : 8;

  const goNext = () => {
    current.next?.();
    setStep(last ? null : step + 1);
  };

  return (
    <div className="tour" aria-live="polite">
      {rect && (
        <div
          className="tour-spot"
          style={{ top: rect.top - PAD, left: rect.left - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2 }}
          aria-hidden="true"
        />
      )}
      <div
        ref={cardRef}
        className={`tour-card${big ? " inside" : ""}`}
        role="dialog"
        aria-label={`Tour step ${step + 1} of ${steps.length}: ${current.title}`}
        style={{ top: cardTop, left: cardLeft, width }}
      >
        <p className="tour-count">
          {step + 1} / {steps.length}
        </p>
        <h4>{current.title}</h4>
        <div className="tour-body">{current.body}</div>
        <div className="tour-actions">
          <button type="button" className="tour-skip" onClick={() => setStep(null)}>
            {last ? "Close" : "Skip tour"}
          </button>
          <span>
            {step > 0 && (
              <button type="button" className="tour-back" onClick={() => setStep(step - 1)}>
                Back
              </button>
            )}
            <button type="button" className="tour-next" onClick={goNext} autoFocus>
              {current.nextLabel ?? (last ? "Finish" : "Next")}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
