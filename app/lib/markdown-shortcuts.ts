import { Editor, Text, Transforms } from "slate";

export function withMarkdownShortcuts(editor: any) {
  const { insertText } = editor;

  editor.insertText = (text: string) => {
    insertText(text);

    if (!editor.selection) return;

    const above = Editor.above(editor, {
      match: (n: any) => Editor.isBlock(editor, n),
    });
    if (!above) return;
    const [block, blockPath] = above as any;

    // Only handle single-leaf blocks (no mixed formatting)
    const children = (block as any).children;
    if (!children || children.length !== 1 || !Text.isText(children[0])) return;

    const fullText = (children[0] as any).text as string;

    // **bold**
    const boldMatch = /\*\*([^*\n]+)\*\*$/.exec(fullText);
    if (boldMatch) {
      applyInline(editor, blockPath, fullText, boldMatch, "bold");
      return;
    }

    // _italic_
    const italicMatch = /_([^_\n]+)_$/.exec(fullText);
    if (italicMatch) {
      applyInline(editor, blockPath, fullText, italicMatch, "italic");
    }
  };

  return editor;
}

function applyInline(
  editor: any,
  blockPath: number[],
  fullText: string,
  match: RegExpExecArray,
  format: string
) {
  const matchStart = match.index!;
  const innerText = match[1];
  const leafPath = [...blockPath, 0];

  // Select and delete the full matched range (markers + text)
  Transforms.select(editor, {
    anchor: { path: leafPath, offset: matchStart },
    focus:  { path: leafPath, offset: fullText.length },
  });
  Transforms.delete(editor);

  // Insert inner text at cursor (which is now at matchStart)
  Transforms.insertText(editor, innerText);

  // Select the freshly inserted text and apply formatting
  Transforms.select(editor, {
    anchor: { path: leafPath, offset: matchStart },
    focus:  { path: leafPath, offset: matchStart + innerText.length },
  });
  Transforms.setNodes(editor, { [format]: true } as any, {
    match: (n: any) => Text.isText(n),
    split: true,
  });

  // Move cursor to end of formatted text
  Transforms.collapse(editor, { edge: "end" });
}
