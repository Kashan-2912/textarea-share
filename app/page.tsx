"use client";


import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { compress, decompress } from "../app/lib/index";

export default function Home() {
  const [text, setText] = useState("");
  const [color, setColor] = useState("#000000");

  // runs on first render, decompresses text from URL
  useEffect(() => {
     const hash = window.location.hash.slice(1); // remove the '#' character
     const decoded = decompress(hash)


     // eslint-disable-next-line react-hooks/set-state-in-effect
     setText(decoded);
  }, []);

  // runs everytime the text in URL changes
  useEffect(() => {
    if(!text){
      window.history.replaceState(null, "", "#");
      return;
    }

    const compressed = compress(text);
    window.history.replaceState(null, "", `#${compressed}`);
  }, [text]);

  // Ref for textarea
  const textareaRef = useRef(null);

  // Helper to wrap selected text
  const applyMarkdown = (syntaxStart, syntaxEnd = syntaxStart) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = text.slice(0, start);
    const selected = text.slice(start, end);
    const after = text.slice(end);
    setText(before + syntaxStart + selected + syntaxEnd + after);
    // Restore selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + syntaxStart.length,
        end + syntaxStart.length + selected.length
      );
    }, 0);
  };

  return (
    <main style={{ padding: 40 }}>
      <h1>Live URL Compressor</h1>
      <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
        <button
          type="button"
          title="Bold"
          onClick={() => applyMarkdown("**", "**")}
          style={{ fontWeight: "bold", marginRight: 4 }}
        >
          B
        </button>
        <button
          type="button"
          title="Italic"
          onClick={() => applyMarkdown("*", "*")}
          style={{ fontStyle: "italic", marginRight: 4 }}
        >
          I
        </button>
        <button
          type="button"
          title="Underline (Markdown syntax)"
          onClick={() => applyMarkdown("<u>", "</u>")}
          style={{ textDecoration: "underline", marginRight: 4 }}
        >
          U
        </button>
        {/* Color Picker */}
        <input
          type="color"
          value={color}
          onChange={e => setColor(e.target.value)}
          title="Pick text color"
          style={{ width: 28, height: 28, border: "none", background: "none", cursor: "pointer" }}
        />
        <button
          type="button"
          title="Apply color to selected text"
          onClick={() => applyMarkdown(`<span style=\"color: ${color}\">`, "</span>")}
          style={{ border: "1px solid #ccc", borderRadius: 4, padding: "2px 8px", background: color, color: "#fff", fontWeight: "bold", cursor: "pointer" }}
        >
          A
        </button>
      </div>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type something... (Markdown supported)"
        style={{
          width: "100%",
          height: "300px",
          padding: "10px",
          fontSize: "16px",
        }}
      />
      <div style={{ marginTop: 32 }}>
        <h2>Markdown Preview</h2>
        <div style={{
          border: "1px solid #ccc",
          borderRadius: 8,
          padding: 16,
          minHeight: 100,
          background: "#fafafa"
        }}>
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>{text}</ReactMarkdown>
        </div>
      </div>
    </main>
  );
}
