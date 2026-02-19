import { Descendant, Text } from "slate";

function leafToMd(leaf: any): string {
  let t: string = leaf.text ?? "";
  if (!t) return "";
  if (leaf.bold) t = `**${t}**`;
  if (leaf.italic) t = `_${t}_`;
  if (leaf.underline) t = `<u>${t}</u>`;
  return t;
}

function childrenToMd(children: any[]): string {
  return (children ?? [])
    .map((child) =>
      Text.isText(child) ? leafToMd(child) : childrenToMd((child as any).children ?? [])
    )
    .join("");
}

export function toMarkdown(nodes: Descendant[]): string {
  return nodes
    .map((node) => {
      const n = node as any;
      const content = childrenToMd(n.children ?? []);
      switch (n.type) {
        case "heading-one":   return `# ${content}`;
        case "heading-two":   return `## ${content}`;
        case "heading-three": return `### ${content}`;
        default:              return content;
      }
    })
    .join("\n");
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
