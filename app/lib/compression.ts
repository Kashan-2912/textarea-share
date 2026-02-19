import LZString from "lz-string";

export function compress(text: string): string {
  return LZString.compressToEncodedURIComponent(text);
}

export function decompress(text: string): string | null {
  return LZString.decompressFromEncodedURIComponent(text);
}

export function hasFormatting(nodes: any): boolean {
  if (nodes?.type === "doc") {
    return (nodes.content ?? []).some((n: any) => {
      if (n.type !== "paragraph") return true;
      return (n.content ?? []).some((c: any) => (c.marks?.length ?? 0) > 0);
    });
  }
  if (Array.isArray(nodes)) {
    for (const node of nodes) {
      const n = node as any;
      if (n.text !== undefined) {
        if (n.bold || n.italic || n.underline || n.color) return true;
      } else {
        if (n.type && n.type !== "paragraph") return true;
        if (n.children && hasFormatting(n.children)) return true;
      }
    }
  }
  return false;
}

export function toPlainText(nodes: any): string {
  if (nodes?.type === "doc") {
    return (nodes.content ?? [])
      .map((n: any) => {
        return (n.content ?? []).map((c: any) => c.text ?? "").join("");
      })
      .join("\n");
  }
  if (Array.isArray(nodes)) {
    return nodes
      .map((n) =>
        (n as any).text !== undefined
          ? (n as any).text
          : (n as any).children
          ? toPlainText((n as any).children)
          : ""
      )
      .join("\n");
  }
  return "";
}

export function fromPlainText(text: string): any {
  // Return Tiptap format by default for new content
  return {
    type: "doc",
    content: text.split("\n").map((line) => ({
      type: "paragraph",
      content: line ? [{ type: "text", text: line }] : [],
    })),
  };
}

export function serializeToUrl(nodes: any): string {
  if (hasFormatting(nodes)) {
    return compress("r:" + JSON.stringify(nodes));
  }
  return compress(toPlainText(nodes));
}

export function deserializeFromUrl(hash: string): any | null {
  const raw = decompress(hash);
  if (!raw) return null;
  if (raw.startsWith("r:")) {
    try {
      return JSON.parse(raw.slice(2));
    } catch { return null; }
  }
  return fromPlainText(raw);
}
