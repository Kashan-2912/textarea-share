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

// Use longhand border props — avoids React shorthand/longhand conflict warning
const BTN: React.CSSProperties = {
  background: "transparent",
  color: "#999",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "#2e2e2e",
  borderRadius: 5,
  padding: "3px 8px",
  cursor: "pointer",
  fontSize: 11,
  whiteSpace: "nowrap",
  lineHeight: 1.5,
};

const SEP = (
  <div style={{ width: 1, height: 14, background: "#2e2e2e", flexShrink: 0 }} />
);

export function Toolbar({
  copied, copiedRO, readOnly,
  onCopy, onCopyReadOnly,
  onExportTxt, onExportMd, onExportHtml,
}: Props) {
  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, right: 0,
        background: "#0f0f0f",
        borderBottom: "1px solid #1e1e1e",
        padding: "5px 12px",
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 6,
        zIndex: 800,
        minHeight: 36,
      }}
    >
      {/* Left: brand + badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
        <span style={{ color: "#444", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em" }}>
          SHARE·PAD
        </span>
        {readOnly && (
          <span style={{
            background: "#162016", color: "#5aac5a",
            fontSize: 10, padding: "1px 6px", borderRadius: 8, fontWeight: 600,
          }}>
            View only
          </span>
        )}
      </div>

      {/* Right: action buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
        {/* Export group */}
        <button onClick={onExportTxt}  style={BTN} title="Download as plain text">.txt</button>
        <button onClick={onExportMd}   style={BTN} title="Download as Markdown">.md</button>
        <button onClick={onExportHtml} style={BTN} title="Download as HTML">.html</button>

        {SEP}

        {/* Share read-only */}
        <button
          onClick={onCopyReadOnly}
          title="Copy a view-only link"
          style={{
            ...BTN,
            ...(copiedRO
              ? { background: "#162016", color: "#5aac5a", borderColor: "#2a5a2a" }
              : { color: "#aaa" }),
          }}
        >
          {copiedRO ? "✓ Copied!" : "Share 🔒"}
        </button>

        {/* Copy editable link */}
        <button
          onClick={onCopy}
          title="Copy link to current content"
          style={{
            ...BTN,
            ...(copied
              ? { background: "#162016", color: "#5aac5a", borderColor: "#2a5a2a" }
              : { background: "#131c2e", color: "#6a9fd8", borderColor: "#1e3050" }),
          }}
        >
          {copied ? "✓ Copied!" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
