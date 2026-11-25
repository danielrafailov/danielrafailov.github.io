import { useEffect, useRef, useState, type FormEvent } from "react";
import { classmates, GROUP_MAX, GROUP_MIN, invite, me, type Student, type Version } from "./invite";
import { Tour, type TourStep } from "./Tour";

// A replica of the MarkUs student assignment page (app/views/assignments/
// show.html.erb and the invite dialog), before and after PR #8106. Markup,
// copy and styles follow MarkUs's MIT-licensed source; the logic is the port
// in ./invite.ts. Nothing here talks to a server.

type Flash = { type: "error" | "success"; messages: string[] } | null;
type TabState = { pending: Student[]; flash: Flash; emailed: Student[] | null };

const FRESH: TabState = { pending: [], flash: null, emailed: null };

const COPY = {
  before: {
    instructions: "Enter one or more student user names, separated by commas.",
    label: "User Names",
  },
  after: {
    instructions: "Enter one or more student user names and/or emails, separated by commas, spaces, or newlines.",
    label: "User names / Emails",
  },
} as const;

const BOB_EMAIL = "bob.smith@mail.utoronto.ca";
const MESSY_LIST = "nguyenal, BOB.SMITH@mail.utoronto.ca\nwongcar nguyenal";

function InviteDialog({
  version,
  value,
  setValue,
  onSubmit,
  onClose,
}: {
  version: Version;
  value: string;
  setValue: (v: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  const fieldRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  useEffect(() => {
    fieldRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="mk-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="markus-dialog" id="invite_dialog" role="dialog" aria-modal="true" aria-labelledby="mk-invite-title">
        <form onSubmit={submit} onReset={onClose}>
          <h2 id="mk-invite-title">Invite student(s)</h2>
          <p>{COPY[version].instructions}</p>
          <label htmlFor="invite_member">{COPY[version].label}</label>
          {version === "before" ? (
            <input
              ref={fieldRef}
              type="text"
              id="invite_member"
              required
              autoComplete="off"
              spellCheck={false}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          ) : (
            <textarea
              ref={fieldRef}
              id="invite_member"
              required
              autoComplete="off"
              spellCheck={false}
              rows={3}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          )}
          <section className="dialog-actions">
            <input type="submit" value="Invite student(s)" />
            <input type="reset" value="Cancel" />
          </section>
        </form>
      </aside>
    </div>
  );
}

type PageProps = {
  version: Version;
  state: TabState;
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  draft: string;
  setDraft: (v: string) => void;
  onSubmit: () => void;
  onCancelInvite: (s: Student) => void;
  onHideFlash: () => void;
};

function MarkusPage({ version, state, dialogOpen, setDialogOpen, draft, setDraft, onSubmit, onCancelInvite, onHideFlash }: PageProps) {
  const members = 1 + state.pending.length;

  return (
    <div className="mk">
      <header id="header">
        <img className="mk-logo" src="/markus/markus_logo.svg" alt="MarkUs" width={90} height={30} />
        <div id="course">
          <h1>CSC207: Software Design</h1>
        </div>
        <div id="user-info">
          <span className="dropdown">{me.name} ▼</span>
        </div>
      </header>
      <nav>
        <ul className="main">
          <li className="active">
            <a>Home</a>
          </li>
          <li>
            <a>Grades Summary</a>
          </li>
          <li>
            <a>Email Settings</a>
          </li>
        </ul>
        <ul className="sub">
          <li className="mk-dropdown">
            <span>A2 ▾</span>
          </li>
          <li className="active">
            <a>Assignments</a>
          </li>
          <li>
            <a>Submissions</a>
          </li>
        </ul>
      </nav>

      <section id="content">
        <div className="title_bar">
          <h1>A2: Group Project</h1>
        </div>

        {state.flash && (
          <div className={state.flash.type} role={state.flash.type === "error" ? "alert" : "status"} data-tour="flash">
            <button type="button" className="hide-flash" aria-label="Dismiss" onClick={onHideFlash}>
              ×
            </button>
            <span className="mk-flash-icon" aria-hidden="true">
              {state.flash.type === "error" ? "!" : "✓"}
            </span>
            <div className="flash-content">
              {state.flash.messages.map((m, i) => (
                <p key={i}>{m}</p>
              ))}
            </div>
          </div>
        )}

        <div className="pane-wrapper">
          <div className="pane block">
            <h2>Assignment information</h2>
            <div className="block-content">
              <p>
                Build a course-planning tool in groups of {GROUP_MIN} to {GROUP_MAX}. Form your group below before
                submitting.
              </p>
              <p>
                <strong>Due date</strong>: Friday, December 4, 2026, 11:59 PM
              </p>
            </div>
          </div>

          <div className="pane block">
            <h2>Group information</h2>
            <div className="block-content">
              <div data-tour="group">
                <h3>Your group</h3>
                {members < GROUP_MIN && (
                  <p className="warning">⚠ Your group does not have enough members, and you need to invite more students.</p>
                )}
                <ul>
                  <li>
                    <strong>{me.name} (inviter)</strong>
                  </li>
                  {state.pending.map((s) => (
                    <li key={s.user}>
                      <em>{s.name} (invited)</em>{" "}
                      <button type="button" className="delete inline-button" onClick={() => onCancelInvite(s)}>
                        Cancel invitation
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <h3>Group options</h3>
              {members < GROUP_MAX ? (
                <button type="button" id="invite-student" onClick={() => setDialogOpen(true)}>
                  Invite student(s)
                </button>
              ) : (
                <p>You may not invite any more students to your group.</p>
              )}
              <p>
                <button type="button" disabled title="Disabled in this replica">
                  Delete Group
                </button>
              </p>

              <h3>Policies</h3>
              <ul>
                <li>Students may form their own groups.</li>
                <li>
                  Each group must have between <strong>{GROUP_MIN}</strong> to <strong>{GROUP_MAX}</strong> members,
                  inclusive.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {dialogOpen && (
        <InviteDialog
          version={version}
          value={draft}
          setValue={setDraft}
          onClose={() => setDialogOpen(false)}
          onSubmit={onSubmit}
        />
      )}
    </div>
  );
}

/** Two tabs of the replica, each with its own group state, plus a guided tour. */
export function MarkusReplica() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [version, setVersion] = useState<Version>("after");
  const [tabs, setTabs] = useState<Record<Version, TabState>>({ before: FRESH, after: FRESH });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [tourStep, setTourStep] = useState<number | null>(null);
  const state = tabs[version];

  const patch = (v: Version, p: Partial<TabState>) => setTabs((t) => ({ ...t, [v]: { ...t[v], ...p } }));

  const submitInvite = (v: Version, value: string) => {
    setTabs((t) => {
      const r = invite(v, value, t[v].pending);
      const flash: Flash = r.errors.length
        ? { type: "error", messages: r.errors }
        : { type: "success", messages: ["Invitation(s) successful."] };
      return { ...t, [v]: { pending: r.pending, emailed: r.emailed, flash } };
    });
    setDialogOpen(false);
    setDraft("");
  };

  const switchTo = (v: Version) => {
    setVersion(v);
    setDialogOpen(false);
    setDraft("");
  };

  // The tour. Each step puts the page in the state it needs, so Back works.
  const steps: TourStep[] = [
    {
      target: ".mkr-window",
      title: "This is MarkUs",
      body: (
        <p>
          A replica of the page a student sees for a group assignment. You're signed in as {me.name}, and you need
          teammates. Let's invite one the old way first.
        </p>
      ),
      enter: () => {
        setTabs({ before: FRESH, after: FRESH });
        switchTo("before");
      },
    },
    {
      target: '[data-tour="tab-before"]',
      title: "Before my change",
      body: <p>This tab is MarkUs as it was before PR #8106. Students could only invite teammates by their exact user name.</p>,
      enter: () => switchTo("before"),
    },
    {
      target: "#invite-student",
      title: "Open the invite dialog",
      body: <p>Click Invite student(s), or press Next.</p>,
      enter: () => {
        switchTo("before");
        patch("before", FRESH);
      },
      next: () => setDialogOpen(true),
      done: () => version === "before" && dialogOpen,
    },
    {
      target: "#invite_dialog",
      placement: "outside",
      title: "Invite by email",
      body: (
        <p>
          You know your teammate Bob's email, not his user name. That's the usual case, so let's try{" "}
          <code>{BOB_EMAIL}</code>.
        </p>
      ),
      enter: () => {
        setVersion("before");
        setDialogOpen(true);
      },
      next: () => setDraft(BOB_EMAIL),
      nextLabel: "Type it for me",
      // If the visitor types and sends it themselves, skip "Send it" and show the result.
      done: () => version === "before" && !dialogOpen && tabs.before.flash !== null,
      doneNext: 5,
    },
    {
      target: '#invite_dialog input[type="submit"]',
      title: "Send it",
      body: <p>Press Invite student(s), or Next.</p>,
      enter: () => {
        setVersion("before");
        patch("before", FRESH);
        setDialogOpen(true);
        setDraft(BOB_EMAIL);
      },
      next: () => submitInvite("before", BOB_EMAIL),
      done: () => version === "before" && !dialogOpen && tabs.before.flash !== null,
    },
    {
      target: '[data-tour="flash"]',
      title: "Email doesn't work",
      body: (
        <p>
          The old code only looked students up by user name, so an email never matches. The student is stuck
          hunting for a teammate's user name.
        </p>
      ),
      enter: () => {
        switchTo("before");
        // Make sure an email invite failed here, whatever the visitor typed.
        const f = tabs.before.flash;
        const emailFailed = f?.type === "error" && f.messages.some((m) => m.includes("@"));
        if (!emailFailed) {
          patch("before", FRESH);
          submitInvite("before", BOB_EMAIL);
        }
      },
    },
    {
      target: '[data-tour="tab-after"]',
      title: "After my change",
      body: <p>Now the same page with PR #8106 merged.</p>,
      enter: () => {
        switchTo("after");
        patch("after", FRESH);
      },
    },
    {
      target: "#invite_dialog",
      placement: "outside",
      title: "A messy list",
      body: (
        <p>
          The field is now a text area for user names <em>and</em> emails. This list mixes a user name, Bob's email
          in capitals, a newline, a space, and a repeated name.
        </p>
      ),
      enter: () => {
        setVersion("after");
        patch("after", FRESH);
        setDialogOpen(true);
        setDraft(MESSY_LIST);
      },
      next: () => submitInvite("after", MESSY_LIST),
      nextLabel: "Invite them",
      done: () => version === "after" && !dialogOpen && tabs.after.flash !== null,
    },
    {
      target: '[data-tour="group"]',
      title: "Everyone's invited",
      body: (
        <p>
          Alice by user name, Bob by email in any case, Carol after the newline. The repeated <code>nguyenal</code> is
          skipped instead of raising an “already pending” error.
        </p>
      ),
      enter: () => {
        switchTo("after");
        if (!tabs.after.flash) submitInvite("after", MESSY_LIST);
      },
    },
    {
      target: ".mkr-mail",
      title: "And they get their emails",
      body: (
        <p>
          Invite emails now go to the students MarkUs actually invited. The old email loop looked each entry up by
          user name again, so anyone invited by email would have silently missed theirs.
        </p>
      ),
      enter: () => switchTo("after"),
    },
    {
      target: ".mkr-window",
      title: "Your turn",
      body: (
        <>
          <p>Switch tabs and invite anyone. Your classmates:</p>
          <ul className="tour-list">
            {classmates.map((s) => (
              <li key={s.user}>
                {s.name}: <code>{s.user}</code> or <code>{s.email.toLowerCase()}</code>
              </li>
            ))}
          </ul>
        </>
      ),
      enter: () => {
        setTabs({ before: FRESH, after: FRESH });
        switchTo("after");
      },
    },
  ];

  return (
    <div className="mkr" ref={rootRef}>
      <div className="mkr-head">
        <div className="mkr-switch">
          <span className="mkr-switch-label">MarkUs</span>
          <div className="seg" role="tablist" aria-label="MarkUs version">
            {(["before", "after"] as const).map((v) => (
              <button
                key={v}
                role="tab"
                data-tour={`tab-${v}`}
                aria-selected={version === v}
                aria-label={`MarkUs ${v} PR #8106`}
                className={version === v ? "on" : ""}
                onClick={() => switchTo(v)}
              >
                {v === "before" ? "Before" : "After"}
              </button>
            ))}
          </div>
          <span className="mkr-switch-label">#8106</span>
        </div>
        <button type="button" className="tour-start" onClick={() => setTourStep(0)}>
          <span aria-hidden="true">▶</span> Take tour
        </button>
      </div>

      <div className="mkr-window">
        <div className="mkr-chrome" aria-hidden="true">
          <span className="mkr-dots">
            <i />
            <i />
            <i />
          </span>
          <span className="mkr-url">markus.local/courses/1/assignments/2</span>
          <span className="mkr-label">Interactive replica</span>
        </div>
        <MarkusPage
          version={version}
          state={state}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          draft={draft}
          setDraft={setDraft}
          onSubmit={() => submitInvite(version, draft)}
          onCancelInvite={(s) =>
            patch(version, {
              pending: state.pending.filter((p) => p !== s),
              emailed: null,
              flash: { type: "success", messages: ["Member disinvited."] },
            })
          }
          onHideFlash={() => patch(version, { flash: null })}
        />
      </div>

      <div className="mkr-foot">
        <p className="mkr-mail" aria-live="polite">
          {state.emailed === null
            ? "Invite emails will show here."
            : state.emailed.length
              ? `Invite emails sent to ${state.emailed.map((s) => s.user).join(", ")}.`
              : "No invite emails sent: MarkUs only emails when every entry succeeds."}
        </p>
        <button type="button" className="linkish" onClick={() => patch(version, FRESH)}>
          Reset this tab
        </button>
      </div>

      <p className="mkr-credit">
        Built from <a href="https://github.com/MarkUsProject/Markus" target="_blank" rel="noreferrer">MarkUs</a>'s
        MIT-licensed templates and styles. Not a live system.
      </p>

      <Tour
        steps={steps}
        rootRef={rootRef}
        step={tourStep}
        setStep={setTourStep}
        deps={[version, dialogOpen, draft, tabs]}
      />
    </div>
  );
}
