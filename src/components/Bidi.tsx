import { Fragment, type ReactNode } from "react";

// Wraps runs of Latin text (B1, CEFR, IELTS, A1–A2) in <bdi>, so English inside Persian
// reads the right way round. Harmless in English pages.
const latinRun = /[A-Za-z][A-Za-z0-9@.+–-]*(?:\s+[A-Za-z][A-Za-z0-9@.+–-]*)*/g;

export function Bidi({ children }: { children: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of children.matchAll(latinRun)) {
    if (match.index > last) parts.push(children.slice(last, match.index));
    parts.push(<bdi key={match.index}>{match[0]}</bdi>);
    last = match.index + match[0].length;
  }
  if (last < children.length) parts.push(children.slice(last));
  return <Fragment>{parts}</Fragment>;
}
