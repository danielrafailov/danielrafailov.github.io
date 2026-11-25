// How Courseography PR #1822 broke react_modal.js.jsx apart. Line counts are
// measured from the merged diff (`gh pr diff 1822`); old spans include the
// blank line after each block.

export type OldBlock = {
  name: string;
  kind: "class" | "function" | "constants";
  lines: number;
  /** id of the new node this block became; absent when it was removed. */
  to?: string;
  removedWhy?: string;
};

export type NewNode = {
  id: string;
  file: string;
  lines: string;
  usedBy?: string;
  children?: NewNode[];
  isNew?: boolean;
};

export const OLD_FILE = { name: "react_modal.js.jsx", lines: 1009 };

export const oldBlocks: OldBlock[] = [
  { name: "DAY_TO_INT, COURSE_CODE_REGEX", kind: "constants", lines: 10, to: "course" },
  { name: "ModalContent", kind: "class", lines: 10, removedWhy: "only wrapped Description" },
  { name: "CourseModal", kind: "class", lines: 241, to: "course" },
  { name: "Description", kind: "class", lines: 157, to: "description" },
  { name: "FocusModal", kind: "class", lines: 48, to: "focus" },
  { name: "Video", kind: "class", lines: 32, removedWhy: "only used in commented-out code" },
  { name: "MapModal", kind: "class", lines: 193, to: "map" },
  { name: "MapSidebar", kind: "class", lines: 34, to: "sidebar" },
  { name: "DayBox", kind: "class", lines: 98, to: "daybox" },
  { name: "CampusMap", kind: "class", lines: 145, to: "campus" },
  { name: "formatCourseName", kind: "function", lines: 24, removedWhy: "never called" },
  { name: "convertTimeToString", kind: "function", lines: 9, to: "utils" },
];

export const newTree: NewNode[] = [
  {
    id: "course",
    file: "CourseModal.tsx",
    lines: "265 lines",
    usedBy: "Graph.js, course_panel",
    children: [{ id: "description", file: "Description.tsx", lines: "152 lines" }],
  },
  { id: "focus", file: "FocusModal.tsx", lines: "65 lines", usedBy: "FocusTab.tsx" },
  {
    id: "map",
    file: "MapModal.tsx",
    lines: "212 lines",
    usedBy: "calendar.js.jsx",
    children: [
      {
        id: "sidebar",
        file: "MapSidebar.tsx",
        lines: "60 lines",
        children: [{ id: "daybox", file: "DayBox.tsx", lines: "117 lines" }],
      },
      { id: "campus", file: "CampusMap.tsx", lines: "162 lines" },
    ],
  },
];

export const sharedModules: NewNode[] = [
  { id: "utils", file: "utils.ts", lines: "+11 −13, existing" },
  { id: "types", file: "types.ts", lines: "201 lines", isNew: true },
];
