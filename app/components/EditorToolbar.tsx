"use client";

import { useState, useEffect } from "react";
import { Editor } from "@tiptap/react";
import { 
  Bold, Italic, Underline, Strikethrough, Code, 
  RotateCcw, RotateCw, List, ListOrdered, 
  Quote, Minus, Type, Eraser, Baseline,
  Highlighter, Palette
} from "lucide-react";

interface Props {
  editor: Editor | null;
  onOpenColorModal: () => void;
  currentColor: string;
}

export function EditorToolbar({ editor, onOpenColorModal, currentColor }: Props) {
  const [, setUpdateCount] = useState(0);

  useEffect(() => {
    if (!editor) return;
    const onTransaction = () => setUpdateCount((c) => (c + 1) % 1000000);
    editor.on("transaction", onTransaction);
    return () => {
      editor.off("transaction", onTransaction);
    };
  }, [editor]);

  if (!editor) return null;

  const btnClass = (isActive: boolean) => 
    `p-1.5 rounded-md transition-all duration-200 flex items-center justify-center border ${
      isActive 
        ? "bg-[#a8e524] text-black border-[#a8e524]" 
        : "bg-transparent text-[#999] border-transparent hover:border-[#444] hover:text-white"
    }`;

  const groupClass = "flex items-center gap-1 border-r border-[#2e2e2e] pr-2 mr-2 last:border-0 last:pr-0 last:mr-0";

  return (
    <div className="flex flex-wrap items-center bg-[#111] border-b border-[#2e2e2e] p-1.5 mb-0 rounded-t-[10px] overflow-x-auto scrollbar-hide">
      {/* History */}
      <div className={groupClass}>
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className={`${btnClass(false)} disabled:opacity-30 disabled:cursor-not-allowed`}
          title="Undo"
        >
          <RotateCcw size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className={`${btnClass(false)} disabled:opacity-30 disabled:cursor-not-allowed`}
          title="Redo"
        >
          <RotateCw size={16} />
        </button>
      </div>

      {/* Basic Formatting */}
      <div className={groupClass}>
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={btnClass(editor.isActive("bold"))}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={btnClass(editor.isActive("italic"))}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={btnClass(editor.isActive("underline"))}
          title="Underline"
        >
          <Underline size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={btnClass(editor.isActive("strike"))}
          title="Strikethrough"
        >
          <Strikethrough size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={btnClass(editor.isActive("code"))}
          title="Code"
        >
          <Code size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={btnClass(editor.isActive("highlight"))}
          title="Highlight"
        >
          <Highlighter size={16} />
        </button>
        <button
          onClick={onOpenColorModal}
          className={btnClass(false)}
          title="Text Color"
        >
          <div className="flex items-center gap-1">
            <Palette size={16} />
            <div 
              className="w-2.5 h-2.5 rounded-full border border-white/20" 
              style={{ backgroundColor: currentColor }} 
            />
          </div>
        </button>
      </div>

      {/* Headings */}
      <div className={groupClass}>
        <button
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={btnClass(editor.isActive("paragraph"))}
          title="Paragraph"
        >
          <Type size={16} />
        </button>
      </div>

      {/* Utilities */}
      <div className={groupClass}>
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className={btnClass(false)}
          title="Horizontal Rule"
        >
          <Minus size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
          className={btnClass(false)}
          title="Clear Marks"
        >
          <Eraser size={16} />
        </button>
      </div>
    </div>
  );
}
