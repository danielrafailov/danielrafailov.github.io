// A JavaScript port of how MarkUs handled the "Invite student(s)" form before
// and after PR #8106, run against a made-up class. It mirrors
// GroupsController#invite_member, Grouping#invite and Grouping#can_invite?
// (checks in the same order), minus the database.

export type Student = { user: string; email: string; name: string };

/** The dummy student who is signed in and owns the group. */
export const me: Student = { user: "leejor", email: "jordan.lee@mail.utoronto.ca", name: "Jordan Lee" };

export const classmates: Student[] = [
  { user: "nguyenal", email: "Alice.Nguyen@mail.utoronto.ca", name: "Alice Nguyen" },
  { user: "smithbo", email: "bob.smith@mail.utoronto.ca", name: "Bob Smith" },
  { user: "wongcar", email: "carol.wong@mail.utoronto.ca", name: "Carol Wong" },
  { user: "pateldev", email: "dev.patel@mail.utoronto.ca", name: "Dev Patel" },
];

const course = [me, ...classmates];

export const GROUP_MIN = 2;
export const GROUP_MAX = 4;

export type Version = "before" | "after";

export type InviteResult = {
  /** Students now pending, in invitation order. */
  pending: Student[];
  errors: string[];
  /** Who received an invite email. MarkUs only sends them when there were no errors. */
  emailed: Student[];
};

// Ruby's String#split drops trailing empty strings; JavaScript's doesn't.
function rubySplit(input: string, sep: string | RegExp) {
  const parts = input.split(sep);
  while (parts.length && parts[parts.length - 1] === "") parts.pop();
  return parts;
}

/** Grouping#can_invite?, for the checks that apply to this demo. Returns an error or null. */
function cannotInvite(student: Student, pending: Student[]): string | null {
  if (student === me) return "You cannot invite yourself to your own group.";
  if (1 + pending.length >= GROUP_MAX) return `Could not invite ${student.user}: group maximum has been reached.`;
  if (pending.includes(student)) {
    return `Could not invite ${student.user}: this student already has a pending invitation for this group.`;
  }
  return null;
}

export function invite(version: Version, input: string, alreadyPending: Student[]): InviteResult {
  const pending = [...alreadyPending];
  const errors: string[] = [];

  if (version === "before") {
    // to_invite = params[:invite_member].split(',')
    const tokens = rubySplit(input, ",");
    for (const raw of tokens) {
      const m = raw.trim();
      const student = course.find((s) => s.user === m);
      if (!student) {
        errors.push(`No student '${m}' could be found.`);
        continue;
      }
      const err = cannotInvite(student, pending);
      if (err) errors.push(err);
      else pending.push(student);
    }
    // The old controller re-looked-up every entry by user name to send emails.
    const emailed = errors.length
      ? []
      : tokens
          .map((t) => course.find((s) => s.user === t.trim()))
          .filter((s): s is Student => Boolean(s) && s !== me);
    return { pending, errors, emailed };
  }

  // to_invite = params[:invite_member].to_s.split(/[,\s]+/).compact_blank
  const tokens = rubySplit(input, /[,\s]+/).filter((t) => t !== "");
  if (tokens.length === 0) {
    return { pending, errors: ["You need to enter at least one user name or email."], emailed: [] };
  }
  const invited: Student[] = [];
  for (const raw of tokens) {
    const m = raw.trim();
    const isEmail = m.includes("@");
    const student = isEmail
      ? course.find((s) => s.email.toLowerCase() === m.toLowerCase())
      : course.find((s) => s.user === m);
    if (!student) {
      errors.push(
        isEmail
          ? `No student with email '${m}' could be found.`
          : `No student with user name '${m}' could be found.`,
      );
      continue;
    }
    if (invited.includes(student)) continue; // already_invited: a repeat is a no-op
    const err = cannotInvite(student, pending);
    if (err) errors.push(err);
    else {
      pending.push(student);
      invited.push(student);
    }
  }
  const unique = [...new Set(errors)]; // errors = errors.uniq
  return { pending, errors: unique, emailed: unique.length ? [] : invited };
}
