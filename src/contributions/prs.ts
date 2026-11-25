import type { Note } from "./DiffViewer";

export type FeaturedPR = {
  id: string;
  project: "MarkUs" | "Courseography";
  repo: string;
  number: number;
  title: string;
  merged: string;
  added: number;
  removed: number;
  files: number;
  extra?: string;
  tech: string;
  summary: string;
  excerptNote?: string;
  notes: Record<string, Note[]>;
  demo?: boolean;
  /** Show a diagram instead of a code diff. */
  visual?: "split-1822";
};

export const featuredPRs: FeaturedPR[] = [
  {
    id: "markus-8106",
    project: "MarkUs",
    repo: "MarkUsProject/Markus",
    number: 8106,
    title: "Group invitations by email",
    merged: "Aug 8, 2026",
    added: 218,
    removed: 31,
    files: 19,
    extra: "167 lines of new tests",
    tech: "Ruby on Rails",
    summary:
      "To form a group for an assignment, students had to type each teammate's exact, case-sensitive user name, separated by commas, when a teammate's email is far easier to know. I added case-insensitive email invites, accepted commas, spaces or newlines, and made repeated entries harmless.",
    demo: true,
    notes: {
      "app/models/grouping.rb": [
        {
          lines: [327, 328, 329, 330, 331, 332],
          text: "Anything containing “@” is treated as an email and matched case-insensitively with lower(users.email). User names stay exact.",
        },
        {
          lines: [335, 336, 337, 338, 339],
          text: "Separate “user name not found” and “email not found” errors, so a student knows exactly which entry was wrong.",
        },
        {
          lines: [341, 343, 320],
          text: "A Set of students already invited in this request makes a repeated entry a no-op, instead of an “already pending” error.",
        },
        {
          lines: [349, 321, 322, 323],
          text: "invite now returns the students it actually invited alongside the errors, and fails fast on empty input.",
        },
      ],
      "app/controllers/groups_controller.rb": [
        {
          lines: [491],
          text: "Split on commas, spaces or newlines. compact_blank drops the empty entries left by doubled separators.",
        },
        { lines: [493], text: "The same bad entry typed twice now produces one error message, not two." },
        {
          lines: [495, 496, 498],
          text: "Invite emails go to the students invite() returned. The old loop re-queried each entry by user name, so anyone invited by email would have silently missed their notification.",
        },
      ],
      "app/views/assignments/show.html.erb": [
        { lines: [234], text: "The label now reads “User names / Emails”, from a new translation key." },
        { lines: [235], text: "A single-line text field became a text area, so a whole list can be pasted in." },
        { lines: [238], text: "Opts the submit button out of Rails’ automatic disable-on-submit." },
      ],
    },
  },
  {
    id: "markus-8068",
    project: "MarkUs",
    repo: "MarkUsProject/Markus",
    number: 8068,
    title: "Groups tab tables refactor",
    merged: "Jul 25, 2026",
    added: 367,
    removed: 326,
    files: 5,
    tech: "React · TanStack Table",
    summary:
      "The Groups tab's student and group tables still ran on react-table v6. I migrated them to TanStack Table v8, covering column definitions, row selection, sorting and the Assigned, Valid and Extension filters, and updated the tests for the new table UI.",
    excerptNote: "Three excerpts from groups_manager.jsx.",
    notes: {
      "app/javascript/Components/groups_manager.jsx": [
        {
          lines: [204, 207, 210, 215, 216],
          text: "Selection comes from the v8 table's getSelectedRows() instead of reaching into the old selection wrapper's internal state.",
        },
        {
          lines: [453, 454],
          text: "createColumnHelper gives every column a typed accessor, and the wrapped RawGroupsTable becomes a plain GroupsTable.",
        },
        {
          lines: [458, 459],
          text: "Filtering and selection become explicit table state, with inactive groups hidden by a default column filter.",
        },
        {
          lines: [463, 464, 465, 466, 467, 468],
          text: "v6 column options map onto v8: width → size, resizable → enableResizing, and styling moves under meta.",
        },
        {
          lines: [476, 479, 482],
          text: "Cell renderers read through props.getValue() and props.row.original instead of v6's row.value.",
        },
        {
          lines: [490, 491, 492, 493],
          text: "v6's Filter + filterMethod pair becomes meta.filterVariant + filterFn, so the shared v8 filter components can render it.",
        },
      ],
    },
  },
  {
    id: "courseography-1822",
    project: "Courseography",
    repo: "Courseography/courseography",
    number: 1822,
    title: "Legacy modals into typed components",
    merged: "Oct 31, 2026",
    added: 1279,
    removed: 1041,
    files: 22,
    tech: "React · TypeScript",
    summary:
      "react_modal.js.jsx was a 1,009-line file of class components. I split it into seven functional TypeScript components (CampusMap, CourseModal, DayBox, Description, FocusModal, MapModal and MapSidebar) with typed props and a shared types module, and removed dead code along the way.",
    excerptNote: "Hover a block or file to trace where it went. Struck-through blocks were dead code and removed.",
    visual: "split-1822",
    notes: {},
  },
];
