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

const LS_KEY = "textarea-share-hash";

export default function Home() {
  // Dropdown state
  const [dropdown, setDropdown] = useState<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });
  const [selection, setSelection] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Hide dropdown only if click is outside dropdown
  useEffect(() => {
    const hide = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdown((d) => ({ ...d, visible: false }));
      }
    };
    window.addEventListener("mousedown", hide);
    return () => window.removeEventListener("mousedown", hide);
  }, []);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  // initialValueRef is set once in the effect before Slate mounts.
  // Using a ref avoids the React batching race where setValue + setMounted
  // land in the same render, causing Slate to see EMPTY_VALUE on first mount.
  const initialValueRef = useRef<Descendant[]>(EMPTY_VALUE);
  const [value, setValue] = useState<Descendant[]>(EMPTY_VALUE);
  const [mounted, setMounted] = useState(false);
  const [color, setColor] = useState("#000000");
  const [colorModalOpen, setColorModalOpen] = useState(false);
  const [pendingColor, setPendingColor] = useState("#000000");

  /* -------------------- Load From URL -------------------- */

  useEffect(() => {
    // If URL has no hash, try restoring last session from localStorage
    const urlHash = window.location.hash.slice(1);
    const hash = urlHash || localStorage.getItem(LS_KEY) || "";
    if (hash) {
      try {
        const nodes = deserializeFromUrl(hash);
        if (nodes) {
          initialValueRef.current = nodes;
          setValue(nodes);
          // Reflect restored hash in the URL too
          if (!urlHash) window.history.replaceState(null, "", `#${hash}`);
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
        try { localStorage.removeItem(LS_KEY); } catch {}
        return;
      }
      const compressed = serializeToUrl(value);
      window.history.replaceState(null, "", `#${compressed}`);
      // Persist hash for session restore
      try { localStorage.setItem(LS_KEY, compressed); } catch {}
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

  const resetFormat = useCallback(() => {
    Transforms.setNodes(
      editor,
      { bold: undefined, italic: undefined, underline: undefined, color: undefined } as any,
      { match: (n) => Text.isText(n), split: true },
    );
  }, [editor]);

  return (
    <main style={{ padding: 40, maxWidth: 900, margin: "0 auto", position: "relative" }}>

      {/* Formatting dropdown will be shown on right-click selection */}

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
              background: "#0a0a0a",
              color: "#ededed",
            }}
            spellCheck
            autoFocus
            onContextMenu={(e) => {
              const sel = window.getSelection();
              if (sel && sel.toString().length > 0) {
                e.preventDefault();
                setDropdown({ x: e.clientX, y: e.clientY, visible: true });
                setSelection(editor.selection);
              }
            }}
          />
          {/* Dropdown menu */}
          {dropdown.visible && (
            <div
              ref={dropdownRef}
              style={{
                position: "fixed",
                left: dropdown.x,
                top: dropdown.y,
                background: "#222",
                color: "#fff",
                border: "1px solid #444",
                borderRadius: 6,
                zIndex: 1000,
                minWidth: 120,
                boxShadow: "0 2px 8px #0006",
                padding: 8,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <button style={{ background: "none", color: "#fff", border: "none", padding: 4, textAlign: "left", cursor: "pointer" }}
                onClick={() => {
                  toggleFormat("bold");
                  setDropdown((d) => ({ ...d, visible: false }));
                }}>
                Bold
              </button>
              <button style={{ background: "none", color: "#fff", border: "none", padding: 4, textAlign: "left", cursor: "pointer" }}
                onClick={() => {
                  toggleFormat("italic");
                  setDropdown((d) => ({ ...d, visible: false }));
                }}>
                Italic
              </button>
              <button style={{ background: "none", color: "#fff", border: "none", padding: 4, textAlign: "left", cursor: "pointer" }}
                onClick={() => {
                  toggleFormat("underline");
                  setDropdown((d) => ({ ...d, visible: false }));
                }}>
                Underline
              </button>
              {/* Color button → opens modal */}
              <button
                style={{ background: "none", color: "#fff", border: "none", padding: 4, textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                onClick={() => {
                  setPendingColor(color);
                  setColorModalOpen(true);
                }}
              >
                <span style={{ display: "inline-block", width: 16, height: 16, borderRadius: 3, background: color, border: "1px solid #666" }} />
                Color
              </button>
              {/* Divider */}
              <div style={{ height: 1, background: "#3a3a3a", margin: "2px 0" }} />
              {/* Reset formatting */}
              <button
                style={{ background: "none", color: "#f87171", border: "none", padding: 4, textAlign: "left", cursor: "pointer" }}
                onClick={() => {
                  resetFormat();
                  setDropdown((d) => ({ ...d, visible: false }));
                }}
              >
                Reset formatting
              </button>
            </div>
          )}

          {/* ── Color modal ── */}
          {colorModalOpen && (
            <div
              style={{
                position: "fixed", inset: 0,
                background: "rgba(0,0,0,0.55)",
                zIndex: 2000,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <div
                style={{
                  background: "#1e1e1e",
                  border: "1px solid #444",
                  borderRadius: 10,
                  padding: "24px 28px",
                  minWidth: 220,
                  boxShadow: "0 8px 32px #000a",
                  display: "flex", flexDirection: "column", gap: 16,
                }}
              >
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>Pick a color</span>
                  <button
                    onClick={() => setColorModalOpen(false)}
                    style={{ background: "none", border: "none", color: "#aaa", fontSize: 18, cursor: "pointer", lineHeight: 1 }}
                  >✕</button>
                </div>

                {/* Native color input */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <input
                    type="color"
                    value={pendingColor}
                    onChange={(e) => setPendingColor(e.target.value)}
                    style={{ width: 48, height: 48, border: "none", background: "none", cursor: "pointer", borderRadius: 6 }}
                  />
                  <span style={{ color: "#ccc", fontFamily: "monospace", fontSize: 14 }}>{pendingColor}</span>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button
                    onClick={() => setColorModalOpen(false)}
                    style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #555", background: "none", color: "#ccc", cursor: "pointer" }}
                  >Cancel</button>
                  <button
                    onClick={() => {
                      setColor(pendingColor);
                      Transforms.setNodes(
                        editor,
                        { color: pendingColor },
                        { match: (n) => Text.isText(n), split: true },
                      );
                      setColorModalOpen(false);
                      setDropdown((d) => ({ ...d, visible: false }));
                    }}
                    style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: "#4f8ef7", color: "#fff", cursor: "pointer", fontWeight: 600 }}
                  >Apply</button>
                </div>
              </div>
            </div>
          )}
        </Slate>
      )}

      {/* Bottom-left hint */}
      <div style={{
        position: "fixed", bottom: 14, left: 16,
        color: "#444", fontSize: 11, lineHeight: 1.5,
        pointerEvents: "none", userSelect: "none",
      }}>
        💡 Select text and <strong style={{ color: "#555" }}>right-click</strong> to bold, italic, underline, colorize, or reset formatting
      </div>
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
      match: (n: any) => n[format] === true,
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
