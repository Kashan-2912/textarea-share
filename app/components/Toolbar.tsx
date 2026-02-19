interface Props {
  copied: boolean;
  copiedRO: boolean;
  readOnly: boolean;
  onCopy: () => void;
  onCopyReadOnly: () => void;
  onExportTxt: () => void;
  onExportMd: () => void;
  onExportHtml: () => void;
}

// Use longhand border props to avoid React "shorthand/longhand conflict" warning
const BTN: React.CSSProperties = {
  background: "#1e1e1e",
  color: "#ccc",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "#333",
  borderRadius: 6,
  padding: "5px 12px",
  cursor: "pointer",
  fontSize: 12,
};

export function Toolbar({
  copied, copiedRO, readOnly,
  onCopy, onCopyReadOnly,
  onExportTxt, onExportMd, onExportHtml,
}: Props) {
  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, right: 0,
        background: "#111", borderBottom: "1px solid #222",
        padding: "8px 20px", display: "flex",
        alignItems: "center", justifyContent: "space-between", zIndex: 800,
      }}
    >
      {/* Left: branding + badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ color: "#555", fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>
          SHARE·PAD
        </span>
        {readOnly && (
          <span style={{
            background: "#1a3a1a", color: "#6fcf70",
            fontSize: 11, padding: "2px 8px", borderRadius: 10, fontWeight: 600,
          }}>
            View only
          </span>
        )}
      </div>

      {/* Right: actions */}
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <button onClick={onExportTxt}  style={BTN} title="Download as plain text">.txt</button>
        <button onClick={onExportMd}   style={BTN} title="Download as Markdown">.md</button>
        <button onClick={onExportHtml} style={BTN} title="Download as HTML">.html</button>

        <div style={{ width: 1, height: 18, background: "#333", margin: "0 2px" }} />

        {/* Share read-only link */}
        <button
          onClick={onCopyReadOnly}
          title="Copy a read-only share link"
          style={{
            ...BTN,
            ...(copiedRO
              ? { background: "#1a3a1a", color: "#6fcf70", borderColor: "#2e6b2e" }
              : {}),
          }}
        >
          {copiedRO ? "✓ Read-only link copied!" : "Share (view only)"}
        </button>

        {/* Copy current link */}
        <button
          onClick={onCopy}
          title="Copy link to current content"
          style={{
            ...BTN,
            ...(copied
              ? { background: "#1a3a1a", color: "#6fcf70", borderColor: "#2e6b2e" }
              : { background: "#1a2a4a", color: "#7aadff", borderColor: "#2a4a8a" }),
          }}
        >
          {copied ? "✓ Copied!" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
