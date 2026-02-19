"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createEditor, Transforms, Text, Descendant, Editor } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import { withHistory } from "slate-history";

import { withMarkdownShortcuts } from "./lib/markdown-shortcuts";
import { serializeToUrl, deserializeFromUrl, toPlainText } from "./lib/compression";
import { toMarkdown, downloadFile } from "./lib/export";
import { FormattingDropdown } from "./components/FormattingDropdown";
import { ColorModal } from "./components/ColorModal";
import { Toolbar } from "./components/Toolbar";
import { StatusBar } from "./components/StatusBar";
import { EditorLeaf } from "./components/EditorLeaf";
import { EditorElement } from "./components/EditorElement";

/* -------------------- Constants -------------------- */

const LS_KEY = "textarea-share-hash";

const EMPTY_VALUE: Descendant[] = [
  { type: "paragraph", children: [{ text: "" }] } as any,
];

function isFormatActive(editor: any, format: string) {
  const [match] = Array.from(
    editor.nodes({ match: (n: any) => n[format] === true, universal: true })
  );
  return !!match;
}

/* -------------------- Page -------------------- */

export default function Home() {
  const editor = useMemo(
    () => withMarkdownShortcuts(withHistory(withReact(createEditor()))),
    []
  );

  const initialValueRef = useRef<Descendant[]>(EMPTY_VALUE);
  const [value, setValue]               = useState<Descendant[]>(EMPTY_VALUE);
  const [mounted, setMounted]           = useState(false);
  const [readOnly, setReadOnly]         = useState(false);
  const [color, setColor]               = useState("#000000");
  const [colorModalOpen, setColorModalOpen] = useState(false);
  const [pendingColor, setPendingColor] = useState("#000000");
  const [copied, setCopied]             = useState(false);
  const [urlLen, setUrlLen]             = useState(0);
  const [dropdown, setDropdown]         = useState<{ x: number; y: number; visible: boolean }>(
    { x: 0, y: 0, visible: false }
  );
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  /* ---------- close dropdown on outside click ---------- */
  useEffect(() => {
    const hide = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdown((d) => ({ ...d, visible: false }));
      }
    };
    window.addEventListener("mousedown", hide);
    return () => window.removeEventListener("mousedown", hide);
  }, []);

  /* ---------- mount: load from URL hash / localStorage ---------- */
  useEffect(() => {
    // Read-only mode: ?view=1
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "1") setReadOnly(true);

    const urlHash = window.location.hash.slice(1);
    const hash    = urlHash || localStorage.getItem(LS_KEY) || "";
    if (hash) {
      try {
        const nodes = deserializeFromUrl(hash);
        if (nodes) {
          initialValueRef.current = nodes;
          setValue(nodes);
          if (!urlHash) window.history.replaceState(null, "", `#${hash}`);
        }
      } catch { /* corrupt hash — ignore */ }
    }
    setMounted(true);
  }, []);

  /* ---------- save to URL + localStorage on every change ---------- */
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
        setUrlLen(0);
        return;
      }

      const compressed = serializeToUrl(value);
      window.history.replaceState(null, "", `#${compressed}`);
      try { localStorage.setItem(LS_KEY, compressed); } catch {}
      setUrlLen(window.location.href.length);
    } catch { /* never break UI */ }
  }, [value, mounted]);

  /* ---------- formatting callbacks ---------- */
  const toggleFormat = useCallback(
    (format: string) => {
      const isActive = isFormatActive(editor, format);
      Transforms.setNodes(
        editor,
        { [format]: isActive ? undefined : true } as any,
        { match: (n: any) => Text.isText(n), split: true }
      );
    },
    [editor]
  );

  const resetFormat = useCallback(() => {
    Transforms.setNodes(
      editor,
      { bold: undefined, italic: undefined, underline: undefined, color: undefined } as any,
      { match: (n: any) => Text.isText(n), split: true }
    );
  }, [editor]);

  const setHeading = useCallback(
    (type: string) => {
      Transforms.setNodes(editor, { type } as any, {
        match: (n: any) => Editor.isBlock(editor, n),
      });
    },
    [editor]
  );

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  const closeDropdown = useCallback(
    () => setDropdown((d) => ({ ...d, visible: false })),
    []
  );

  /* ---------- renderers (stable refs) ---------- */
  const renderLeaf    = useCallback((props: any) => <EditorLeaf {...props} />,    []);
  const renderElement = useCallback((props: any) => <EditorElement {...props} />, []);

  /* ---------- render ---------- */
  return (
    <main style={{ padding: "80px 40px 60px", maxWidth: 920, margin: "0 auto" }}>
      <Toolbar
        copied={copied}
        readOnly={readOnly}
        onCopy={copyLink}
        onExportTxt={() => downloadFile(toPlainText(value), "share.txt", "text/plain")}
        onExportMd={()  => downloadFile(toMarkdown(value),  "share.md",  "text/markdown")}
      />

      {mounted && (
        <Slate
          editor={editor}
          initialValue={initialValueRef.current}
          onChange={(newValue) => { if (Array.isArray(newValue)) setValue(newValue); }}
        >
          <Editable
            readOnly={readOnly}
            renderLeaf={renderLeaf}
            renderElement={renderElement}
            style={{
              maxHeight: "80vh",
              minHeight: 220,
              overflowY: "auto",
              padding: 16,
              border: "1px solid #2a2a2a",
              borderRadius: 10,
              background: "#0a0a0a",
              color: "#ededed",
              lineHeight: 1.75,
              fontSize: 15,
              outline: "none",
            }}
            spellCheck
            autoFocus={!readOnly}
            onContextMenu={(e) => {
              if (readOnly) return;
              const sel = window.getSelection();
              if (sel && sel.toString().length > 0) {
                e.preventDefault();
                setDropdown({ x: e.clientX, y: e.clientY, visible: true });
              }
            }}
          />

          {/* Right-click formatting dropdown */}
          {!readOnly && dropdown.visible && (
            <FormattingDropdown
              ref={dropdownRef}
              x={dropdown.x}
              y={dropdown.y}
              color={color}
              onToggleFormat={(f) => { toggleFormat(f); closeDropdown(); }}
              onOpenColorModal={() => { setPendingColor(color); setColorModalOpen(true); }}
              onSetHeading={(t) => { setHeading(t); closeDropdown(); }}
              onResetFormat={() => { resetFormat(); closeDropdown(); }}
            />
          )}

          {/* Color picker modal */}
          <ColorModal
            open={colorModalOpen}
            pendingColor={pendingColor}
            onPendingColorChange={setPendingColor}
            onApply={() => {
              setColor(pendingColor);
              Transforms.setNodes(editor, { color: pendingColor } as any, {
                match: (n: any) => Text.isText(n),
                split: true,
              });
              setColorModalOpen(false);
              closeDropdown();
            }}
            onCancel={() => setColorModalOpen(false)}
          />
        </Slate>
      )}

      <StatusBar value={value} urlLen={urlLen} readOnly={readOnly} />
    </main>
  );
}
