export function convertSlateToTiptap(slateNodes: any[]): any {
  if (!Array.isArray(slateNodes)) return null;

  const content = slateNodes.map((node) => {
    if (node.type === "paragraph" || !node.type) {
      return {
        type: "paragraph",
        content: node.children?.map(convertLeaf) || [],
      };
    }

    if (node.type.startsWith("heading-")) {
      const level = parseInt(node.type.split("-")[1]) || 1;
      return {
        type: "heading",
        attrs: { level },
        content: node.children?.map(convertLeaf) || [],
      };
    }

    return {
      type: "paragraph",
      content: node.children?.map(convertLeaf) || [],
    };
  });

  return {
    type: "doc",
    content,
  };
}

function convertLeaf(leaf: any) {
  if (leaf.text === undefined) return { type: "text", text: "" };

  const marks: any[] = [];
  if (leaf.bold) marks.push({ type: "bold" });
  if (leaf.italic) marks.push({ type: "italic" });
  if (leaf.underline) marks.push({ type: "underline" });
  if (leaf.color) {
    marks.push({
      type: "textStyle",
      attrs: { color: leaf.color },
    });
  }

  return {
    type: "text",
    text: leaf.text,
    ...(marks.length > 0 ? { marks } : {}),
  };
}
