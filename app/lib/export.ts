import { Descendant, Text } from "slate";

/* ---------- leaf helpers ---------- */

function escapeHtml(t: string) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function leafToMd(leaf: any): string {
  let t: string = leaf.text ?? "";
  if (!t) return "";
  if (leaf.bold)      t = `**${t}**`;
  if (leaf.italic)    t = `_${t}_`;
  if (leaf.underline) t = `<u>${t}</u>`;
  return t;
}

function leafToHtml(leaf: any): string {
  let t = escapeHtml(leaf.text ?? "");
  if (leaf.bold)      t = `<strong>${t}</strong>`;
  if (leaf.italic)    t = `<em>${t}</em>`;
  if (leaf.underline) t = `<u>${t}</u>`;
  if (leaf.color)     t = `<span style="color:${leaf.color}">${t}</span>`;
  return t;
}

function childrenToMd(children: any[]): string {
  return (children ?? [])
    .map((c) => (Text.isText(c) ? leafToMd(c) : childrenToMd((c as any).children ?? [])))
    .join("");
}

function childrenToHtml(children: any[]): string {
  return (children ?? [])
    .map((c) => (Text.isText(c) ? leafToHtml(c) : childrenToHtml((c as any).children ?? [])))
    .join("");
}

/* ---------- public exports ---------- */

export function toMarkdown(nodes: Descendant[]): string {
  return nodes
    .map((node) => {
      const n = node as any;
      const c = childrenToMd(n.children ?? []);
      switch (n.type) {
        case "heading-one":   return `# ${c}`;
        case "heading-two":   return `## ${c}`;
        case "heading-three": return `### ${c}`;
        default:              return c;
      }
    })
    .join("\n");
}

export function toHtml(nodes: Descendant[]): string {
  const body = nodes
    .map((node) => {
      const n = node as any;
      const c = childrenToHtml(n.children ?? []);
      switch (n.type) {
        case "heading-one":   return `<h1>${c}</h1>`;
        case "heading-two":   return `<h2>${c}</h2>`;
        case "heading-three": return `<h3>${c}</h3>`;
        default:              return `<p>${c}</p>`;
      }
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Share·Pad Export</title>
<style>body{font-family:system-ui,sans-serif;line-height:1.7;max-width:800px;margin:40px auto;padding:0 20px;color:#111}</style>
</head>
<body>
${body}
</body>
</html>`;
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
