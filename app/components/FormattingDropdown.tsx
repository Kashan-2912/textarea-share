import { forwardRef } from "react";

interface Props {
  x: number;
  y: number;
  color: string;
  onToggleFormat: (f: string) => void;
  onOpenColorModal: () => void;
  onResetFormat: () => void;
}

const BTN: React.CSSProperties = {
  background: "none", color: "#ddd", border: "none",
  padding: "6px 10px", textAlign: "left", cursor: "pointer",
  fontSize: 13, width: "100%", borderRadius: 4,
};

const DIVIDER = <div style={{ height: 1, background: "#2e2e2e", margin: "3px 0" }} />;

export const FormattingDropdown = forwardRef<HTMLDivElement, Props>(
  ({ x, y, color, onToggleFormat, onOpenColorModal, onResetFormat }, ref) => (
    <div
      ref={ref}
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: "fixed", left: x, top: y,
        background: "#1c1c1c", border: "1px solid #3a3a3a",
        borderRadius: 8, zIndex: 1000, minWidth: 155,
        boxShadow: "0 6px 24px #000a", padding: 4,
        display: "flex", flexDirection: "column",
      }}
    >
      <button style={BTN} onClick={() => onToggleFormat("bold")}>
        <strong>B</strong>&nbsp; Bold
      </button>
      <button style={{ ...BTN, fontStyle: "italic" }} onClick={() => onToggleFormat("italic")}>
        <em>I</em>&nbsp; Italic
      </button>
      <button style={{ ...BTN, textDecoration: "underline" }} onClick={() => onToggleFormat("underline")}>
        U&nbsp; Underline
      </button>
      <button style={{ ...BTN, display: "flex", alignItems: "center", gap: 8 }} onClick={onOpenColorModal}>
        <span style={{ width: 13, height: 13, borderRadius: 3, background: color, border: "1px solid #555", flexShrink: 0, display: "inline-block" }} />
        Color
      </button>

      {DIVIDER}

      <button style={{ ...BTN, color: "#f87171" }} onClick={onResetFormat}>
        ↺ Reset formatting
      </button>
    </div>
  )
);

FormattingDropdown.displayName = "FormattingDropdown";
