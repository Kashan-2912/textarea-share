export function EditorLeaf({ attributes, children, leaf }: any) {
  if (leaf.bold)      children = <strong>{children}</strong>;
  if (leaf.italic)    children = <em>{children}</em>;
  if (leaf.underline) children = <u>{children}</u>;
  if (leaf.color)     children = <span style={{ color: leaf.color }}>{children}</span>;
  return <span {...attributes}>{children}</span>;
}
