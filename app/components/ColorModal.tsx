interface Props {
  open: boolean;
  pendingColor: string;
  onPendingColorChange: (c: string) => void;
  onApply: () => void;
  onCancel: () => void;
}

export function ColorModal({ open, pendingColor, onPendingColorChange, onApply, onCancel }: Props) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.6)",
        zIndex: 2000,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#1e1e1e", border: "1px solid #444", borderRadius: 10,
          padding: "24px 28px", minWidth: 220, boxShadow: "0 8px 32px #000a",
          display: "flex", flexDirection: "column", gap: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>Pick a color</span>
          <button onClick={onCancel} style={{ background: "none", border: "none", color: "#aaa", fontSize: 18, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <input
            type="color"
            value={pendingColor}
            onChange={(e) => onPendingColorChange(e.target.value)}
            style={{ width: 48, height: 48, border: "none", background: "none", cursor: "pointer", borderRadius: 6 }}
          />
          <span style={{ color: "#ccc", fontFamily: "monospace", fontSize: 14 }}>{pendingColor}</span>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #555", background: "none", color: "#ccc", cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={onApply} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: "#4f8ef7", color: "#fff", cursor: "pointer", fontWeight: 600 }}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
