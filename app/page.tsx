"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createEditor, Transforms, Text, Descendant } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import { withHistory } from "slate-history";
import LZString from "lz-string";

/* -------------------- Initial Value -------------------- */

const EMPTY_VALUE: Descendant[] = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];

/* -------------------- Compression -------------------- */

function compress(text: string) {
  return LZString.compressToEncodedURIComponent(text);
}

function decompress(text: string) {
  return LZString.decompressFromEncodedURIComponent(text);
}

/** Returns true if the Slate value has any rich formatting (bold, italic, underline, color) */
function hasFormatting(nodes: Descendant[]): boolean {
  for (const node of nodes) {
    if (Text.isText(node)) {
      const n = node as any;
      if (n.bold || n.italic || n.underline || n.color) return true;
    } else if ((node as any).children) {
      if (hasFormatting((node as any).children)) return true;
    }
  }
  return false;
}

/** Extract plain text from Slate nodes (paragraphs joined by newlines) */
function toPlainText(nodes: Descendant[]): string {
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

/** Convert plain text back to Slate value */
function fromPlainText(text: string): Descendant[] {
  return text.split("\n").map((line) => ({
    type: "paragraph",
    children: [{ text: line }],
  }));
}

/** Serialize Slate value to a compact URL string */
function serializeToUrl(nodes: Descendant[]): string {
  if (hasFormatting(nodes)) {
    // Prefix with "r:" to signal rich JSON
    return compress("r:" + JSON.stringify(nodes));
  }
  return compress(toPlainText(nodes));
}

/** Deserialize URL string back to Slate value */
function deserializeFromUrl(hash: string): Descendant[] | null {
  const raw = decompress(hash);
  if (!raw) return null;
  if (raw.startsWith("r:")) {
    const parsed = JSON.parse(raw.slice(2));
    return Array.isArray(parsed) ? parsed : null;
  }
  return fromPlainText(raw);
}

export default function Home() {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  // initialValueRef is set once in the effect before Slate mounts.
  // Using a ref avoids the React batching race where setValue + setMounted
  // land in the same render, causing Slate to see EMPTY_VALUE on first mount.
  const initialValueRef = useRef<Descendant[]>(EMPTY_VALUE);
  const [value, setValue] = useState<Descendant[]>(EMPTY_VALUE);
  const [mounted, setMounted] = useState(false);
  const [color, setColor] = useState("#000000");

  /* -------------------- Load From URL -------------------- */

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      try {
        const nodes = deserializeFromUrl(hash);
        if (nodes) {
          // Set ref synchronously — Slate will read this on its first render.
          initialValueRef.current = nodes;
          setValue(nodes);
        }
      } catch {
        // ignore bad hash
      }
    }
    setMounted(true);
  }, []);

  /* -------------------- Save To URL -------------------- */

  useEffect(() => {
    if (!mounted) return;
    try {
      const isEmpty =
        !Array.isArray(value) ||
        value.length === 0 ||
        (value.length === 1 &&
          (value[0] as any).type === "paragraph" &&
          (value[0] as any).children?.length === 1 &&
          (value[0] as any).children[0].text === "");

      if (isEmpty) {
        window.history.replaceState(null, "", window.location.pathname);
        return;
      }
      const compressed = serializeToUrl(value);
      window.history.replaceState(null, "", `#${compressed}`);
    } catch {
      // never break UI
    }
  }, [value, mounted]);

  /* -------------------- Formatting -------------------- */

  const toggleFormat = useCallback(
    (format: string) => {
      const isActive = isFormatActive(editor, format);

      Transforms.setNodes(
        editor,
        { [format]: isActive ? undefined : true },
        { match: (n) => Text.isText(n), split: true },
      );
    },
    [editor],
  );

  const applyColor = useCallback(() => {
    Transforms.setNodes(
      editor,
      { color },
      { match: (n) => Text.isText(n), split: true },
    );
  }, [editor, color]);

  return (
    <main style={{ padding: 40, maxWidth: 900, margin: "0 auto" }}>
      <h1>Live URL Compressor</h1>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <Btn
          onClick={() => toggleFormat("bold")}
          style={{ fontWeight: "bold" }}
        >
          B
        </Btn>
        <Btn
          onClick={() => toggleFormat("italic")}
          style={{ fontStyle: "italic" }}
        >
          I
        </Btn>
        <Btn
          onClick={() => toggleFormat("underline")}
          style={{ textDecoration: "underline" }}
        >
          U
        </Btn>

        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />

        <Btn onClick={applyColor} style={{ background: color, color: "#fff" }}>
          A
        </Btn>
      </div>

        {mounted && (
          <Slate
            editor={editor}
            initialValue={initialValueRef.current}
            onChange={(newValue) => {
              if (Array.isArray(newValue)) {
                setValue(newValue);
              }
            }}
          >
          <Editable
            renderLeaf={(props) => <Leaf {...props} />}
            style={{
              minHeight: 300,
              padding: 12,
              border: "1px solid #ccc",
              borderRadius: 8,
            }}
            spellCheck
            autoFocus
          />
        </Slate>
        )}
    </main>
  );
}

/* -------------------- Button -------------------- */

function Btn({
  children,
  onClick,
  style,
}: {
  children: React.ReactNode;
  onClick: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      style={{
        border: "1px solid #ccc",
        borderRadius: 4,
        padding: "4px 8px",
        cursor: "pointer",
        background: "#fff",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

/* -------------------- Helpers -------------------- */

function isFormatActive(editor: any, format: string) {
  const [match] = Array.from(
    editor.nodes({
      match: (n) => n[format] === true,
      universal: true,
    }),
  );
  return !!match;
}

function Leaf({ attributes, children, leaf }: any) {
  if (leaf.bold) children = <strong>{children}</strong>;
  if (leaf.italic) children = <em>{children}</em>;
  if (leaf.underline) children = <u>{children}</u>;
  if (leaf.color)
    children = <span style={{ color: leaf.color }}>{children}</span>;

  return <span {...attributes}>{children}</span>;
}
