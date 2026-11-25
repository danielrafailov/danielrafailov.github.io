import type { ReactNode } from "react";

// A tiny regex highlighter: enough colour to make diffs readable, not a parser.
// Each rule is [token class, pattern]; the first rule to match at a position wins.
type Rules = [string, string][];

const RULES: Record<string, Rules> = {
  ruby: [
    ["com", String.raw`#(?!\{).*$`],
    ["str", String.raw`'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|\/\[,\\s\]\+\/`],
    ["sym", String.raw`:\w+[?!]?|\b\w+:(?!:)`],
    ["ivar", String.raw`@\w+`],
    ["kw", String.raw`\b(?:if|else|elsif|end|do|unless|return|raise|begin|rescue|true|false|nil|def)\b`],
    ["const", String.raw`\b[A-Z]\w*`],
  ],
  js: [
    ["com", String.raw`\/\/.*$|\/\*\*?.*$|^\s*\*.*$`],
    ["str", String.raw`'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|\x60(?:[^\x60\\]|\\.)*\x60`],
    [
      "kw",
      String.raw`\b(?:import|from|export|const|let|var|return|if|else|function|class|extends|new|this|interface|type|true|false|null|undefined|super)\b`,
    ],
    ["const", String.raw`\b[A-Z]\w*`],
  ],
  haskell: [
    ["com", String.raw`--.*$`],
    ["str", String.raw`"(?:[^"\\]|\\.)*"`],
    ["kw", String.raw`\b(?:module|where|import|qualified|as|let|in|if|then|else|do|case|of|return)\b`],
    ["const", String.raw`\b[A-Z]\w*`],
  ],
};

const COMPILED = Object.fromEntries(
  Object.entries(RULES).map(([lang, rules]) => [
    lang,
    { re: new RegExp(rules.map(([, p]) => `(${p})`).join("|"), "g"), kinds: rules.map(([k]) => k) },
  ]),
);

export function langFor(path: string) {
  if (/\.(rb|erb)$/.test(path)) return "ruby";
  if (/\.hs$/.test(path)) return "haskell";
  return "js";
}

export function highlight(code: string, lang: string): ReactNode[] {
  const { re, kinds } = COMPILED[lang] ?? COMPILED.js;
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of code.matchAll(re)) {
    const i = m.index ?? 0;
    if (i > last) out.push(code.slice(last, i));
    const group = m.findIndex((g, gi) => gi > 0 && g !== undefined);
    out.push(
      <span key={i} className={`tok-${kinds[group - 1]}`}>
        {m[0]}
      </span>,
    );
    last = i + m[0].length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}
