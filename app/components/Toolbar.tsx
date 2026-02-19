import { Descendant } from "slate";

interface Props {
  copied: boolean;
  readOnly: boolean;
  onCopy: () => void;
  onExportTxt: () => void;
  onExportMd: () => void;
}

const BTN: React.CSSProperties = {
  background: "#1e1e1e", color: "#ccc", border: "1px solid #333",
  borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 12,
};

export function Toolbar({ copied, readOnly, onCopy, onExportTxt, onExportMd }: Props) {
  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, right: 0,
        background: "#111", borderBottom: "1px solid #222",
        padding: "8px 20px", display: "flex",
        alignItems: "center", justifyContent: "space-between", zIndex: 800,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ color: "#555", fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>SHARE·PAD</span>
        {readOnly && (
          <span style={{
            background: "#1a3a1a", color: "#6fcf70",
            fontSize: 11, padding: "2px 8px", borderRadius: 10, fontWeight: 600,
          }}>
            View only
          </span>
        )}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onExportTxt} style={BTN} title="Download as plain text">.txt</button>
        <button onClick={onExportMd}  style={BTN} title="Download as Markdown">.md</button>
        <button
          onClick={onCopy}
          style={{
            ...BTN,
            ...(copied
              ? { background: "#1a3a1a", color: "#6fcf70", borderColor: "#2e6b2e" }
              : {}),
          }}
        >
          {copied ? "✓ Copied!" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
