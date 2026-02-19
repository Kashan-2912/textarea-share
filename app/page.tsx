"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Placeholder from "@tiptap/extension-placeholder";

import Strike from "@tiptap/extension-strike";

import Highlight from "@tiptap/extension-highlight";
import { CharacterCount } from "@tiptap/extension-character-count";

import { serializeToUrl, deserializeFromUrl } from "./lib/compression";
import { toMarkdown, toHtml, downloadFile, toPlainText } from "./lib/export";
import { ColorModal } from "./components/ColorModal";
import { Toolbar } from "./components/Toolbar";
import { StatusBar } from "./components/StatusBar";
import { EditorToolbar } from "./components/EditorToolbar";
import TargetCursor from "./components/TargetCursor";
import ElectricBorder from "./components/ElectricBorder";
import { convertSlateToTiptap } from "./lib/tiptap-migration";

/* -------------------- Constants -------------------- */

const LS_KEY = "textarea-share-hash";

/* -------------------- Page -------------------- */

export default function Home() {
  const [mounted, setMounted]           = useState(false);
  const [readOnly, setReadOnly]         = useState(false);
  const [color, setColor]               = useState("#000000");
  const [colorModalOpen, setColorModalOpen] = useState(false);
  const [pendingColor, setPendingColor] = useState("#000000");
  const [copied, setCopied]             = useState(false);
  const [copiedRO, setCopiedRO]         = useState(false);
  const [urlLen, setUrlLen]             = useState(0);
  const [dropdown, setDropdown]         = useState<{ x: number; y: number; visible: boolean }>(
    { x: 0, y: 0, visible: false }
  );
  const dropdownRef          = useRef<HTMLDivElement | null>(null);
  const [isDesktop, setIsDesktop] = useState(true);
  const [isSelectingMobile, setIsSelectingMobile] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Strike,
      Highlight,
      TextStyle,
      Color,
      Placeholder.configure({
        placeholder: "Start typing something beautiful...",
      }),
      CharacterCount,
    ],
    content: "",
    editable: !readOnly,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (!mounted) return;
      const json = editor.getJSON();
      const isEmpty = editor.isEmpty;

      if (isEmpty) {
        window.history.replaceState(null, "", window.location.pathname);
        try { localStorage.removeItem(LS_KEY); } catch {}
        setUrlLen(0);
        return;
      }

      const compressed = serializeToUrl(json as any);
      window.history.replaceState(null, "", `#${compressed}`);
      try { localStorage.setItem(LS_KEY, compressed); } catch {}
      setUrlLen(window.location.href.length);
    },
    onSelectionUpdate: ({ editor }) => {
      if (!isDesktop && isSelectingMobile && !editor.state.selection.empty) {
        try {
          const { from, to } = editor.state.selection;
          const start = editor.view.coordsAtPos(from);
          const end = editor.view.coordsAtPos(to);
          
          // Position the menu above the selection
          setDropdown({
            x: (start.left + end.left) / 2 - 75,
            y: Math.min(start.top, end.top) - 60,
            visible: true
          });
          setIsSelectingMobile(false);
        } catch (err) {
          console.error("Failed to position mobile menu", err);
        }
      }
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(media.matches);
    const listener = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

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
    if (!editor) return;

    // Read-only mode: ?view=1
    const params = new URLSearchParams(window.location.search);
    const isRO = params.get("view") === "1";
    if (isRO) {
      setReadOnly(true);
      editor.setEditable(false);
    }

    const urlHash = window.location.hash.slice(1);
    const hash    = urlHash || localStorage.getItem(LS_KEY) || "";

    if (hash) {
      try {
        const data = deserializeFromUrl(hash);
        if (data) {
          // Backward compatibility: If it's Slate data (array), convert it
          let finalContent = data;
          if (Array.isArray(data)) {
            finalContent = convertSlateToTiptap(data);
          }
          editor.commands.setContent(finalContent);
          
          if (!urlHash) window.history.replaceState(null, "", `#${hash}`);
        }
      } catch (err) {
        console.error("Migration/Load error:", err);
      }
    }
    setMounted(true);
  }, [editor]);

  /* ---------- formatting callbacks ---------- */
  const toggleFormat = useCallback(
    (format: string) => {
      if (!editor) return;
      if (format === "bold") editor.chain().focus().toggleBold().run();
      else if (format === "italic") editor.chain().focus().toggleItalic().run();
      else if (format === "underline") editor.chain().focus().toggleUnderline().run();
      else if (format === "h1") editor.chain().focus().toggleHeading({ level: 1 }).run();
      else if (format === "h2") editor.chain().focus().toggleHeading({ level: 2 }).run();
      else if (format === "h3") editor.chain().focus().toggleHeading({ level: 3 }).run();
    },
    [editor]
  );

  const resetFormat = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().unsetAllMarks().run();
  }, [editor]);


  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  const copyReadOnly = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("view", "1");
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopiedRO(true);
      setTimeout(() => setCopiedRO(false), 2500);
    });
  }, []);

  const closeDropdown = useCallback(
    () => setDropdown((d) => ({ ...d, visible: false })),
    []
  );

  /* ---------- render ---------- */
  return (
    <main className="pt-[72px] md:pt-[96px] px-4 pb-4 md:pb-16 max-w-[920px] mx-auto min-h-screen flex flex-col">
      <TargetCursor targetSelector=".target-button" />
      <Toolbar
        copied={copied}
        copiedRO={copiedRO}
        readOnly={readOnly}
        onCopy={copyLink}
        onCopyReadOnly={copyReadOnly}
        onExportTxt={()  => editor && downloadFile(toPlainText(editor.getJSON()), "share.txt",  "text/plain")}
        onExportMd={()   => editor && downloadFile(toMarkdown(editor.getJSON()),  "share.md",   "text/markdown")}
        onExportHtml={() => editor && downloadFile(toHtml(editor.getJSON()),      "share.html", "text/html")}
      />

      {mounted && editor && (
        <div className="relative">
          <ElectricBorder
            color="#a8e524"
            speed={0.2}
            chaos={0.08}
            borderRadius={10}
            disabled={!isDesktop}
            className="border border-[#2e2e2e] rounded-[10px] bg-[#0a0a0a] lg:border-none lg:bg-transparent"
            style={{ display: "block" }}
          >
            <style>{`
              .ProseMirror {
                outline: none !important;
                padding: 24px !important;
                max-height: 70vh !important;
                overflow-y: auto !important;
                -webkit-touch-callout: none !important;
                -webkit-tap-highlight-color: transparent !important;
              }
              /* Ensure the placeholder also follows padding */
              .ProseMirror p.is-editor-empty:first-child::before {
                left: 24px !important;
                top: 24px !important;
              }
            `}</style>

            {!readOnly && (
              <EditorToolbar 
                editor={editor} 
                currentColor={color}
                onOpenColorModal={() => { setPendingColor(color); setColorModalOpen(true); }}
              />
            )}

            <EditorContent 
              editor={editor} 
              className="touch-callout-none"
              onContextMenu={(e) => {
                if (readOnly) return;
                const { from, to } = editor.state.selection;
                if (from !== to) {
                  e.preventDefault();
                  setDropdown({ x: e.clientX, y: e.clientY, visible: true });
                }
              }}
            />
          </ElectricBorder>

          {/* Color picker modal */}
          <ColorModal
            open={colorModalOpen}
            pendingColor={pendingColor}
            onPendingColorChange={setPendingColor}
            onApply={() => {
              const hex = pendingColor;
              setColor(hex);
              editor.chain().focus().setColor(hex).run();
              setColorModalOpen(false);
              closeDropdown();
            }}
            onCancel={() => setColorModalOpen(false)}
          />
        </div>
      )}

      <StatusBar 
        editor={editor} 
        urlLen={urlLen} 
        readOnly={readOnly} 
      />
    </main>
  );
}
