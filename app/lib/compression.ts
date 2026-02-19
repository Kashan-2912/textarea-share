import LZString from "lz-string";
import { Descendant, Text } from "slate";

export function compress(text: string): string {
  return LZString.compressToEncodedURIComponent(text);
}

export function decompress(text: string): string | null {
  return LZString.decompressFromEncodedURIComponent(text);
}

export function hasFormatting(nodes: Descendant[]): boolean {
  for (const node of nodes) {
    const n = node as any;
    if (Text.isText(node)) {
      if (n.bold || n.italic || n.underline || n.color) return true;
    } else {
      if (n.type && n.type !== "paragraph") return true; // headings etc.
      if (n.children && hasFormatting(n.children)) return true;
    }
  }
  return false;
}

export function toPlainText(nodes: Descendant[]): string {
  return nodes
    .map((n) =>
      Text.isText(n)
        ? n.text
        : (n as any).children
        ? toPlainText((n as any).children)
        : ""
    )
    .join("\n");
}

export function fromPlainText(text: string): Descendant[] {
  return text.split("\n").map((line) => ({
    type: "paragraph",
    children: [{ text: line }],
  }));
}

export function serializeToUrl(nodes: Descendant[]): string {
  if (hasFormatting(nodes)) {
    return compress("r:" + JSON.stringify(nodes));
  }
  return compress(toPlainText(nodes));
}

export function deserializeFromUrl(hash: string): Descendant[] | null {
  const raw = decompress(hash);
  if (!raw) return null;
  if (raw.startsWith("r:")) {
    const parsed = JSON.parse(raw.slice(2));
    return Array.isArray(parsed) ? parsed : null;
  }
  return fromPlainText(raw);
}
