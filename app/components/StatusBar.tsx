

interface Props {
  editor: any;
  urlLen: number;
  readOnly: boolean;
}

export function StatusBar({ editor, urlLen, readOnly }: Props) {
  const charCount = editor?.storage?.characterCount?.characters() ?? 0;
  const wordCount = editor?.storage?.characterCount?.words() ?? 0;

  const urlSafe    = urlLen === 0 || urlLen < 1500;
  const urlWarn    = urlLen >= 1500 && urlLen < 2000;
  const urlDanger  = urlLen >= 2000;
  const urlColor   = urlDanger ? "#f87171" : urlWarn ? "#f5a623" : "#555";
  const urlLabel   = urlDanger
    ? `🔴 URL: ${urlLen} chars — very long!`
    : urlWarn
    ? `⚠️ URL: ${urlLen} chars — getting long`
    : urlLen > 0
    ? `URL: ${urlLen} chars`
    : null;

  return (
    <>
      {/* Bottom-left hint */}
      {!readOnly && (
        <div style={{
          position: "fixed", bottom: 10, left: 12,
          color: "#3a3a3a",
          pointerEvents: "none", userSelect: "none",
        }}
        className="md:max-w-full max-w-50 md:text-sm text-[9px]"
        >
          - Select text &amp; <strong style={{ color: "#a8e524" }}>right-click</strong> to format. <br />- <strong style={{ color: "#a8e524" }}>Share 🔒</strong> to share read-only version.
        </div>
      )}

      {/* Bottom-right stats */}
      <div style={{
        position: "fixed", bottom: 10, right: 12,
        display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2,
        pointerEvents: "none", userSelect: "none",
      }}
      className="md:text-sm text-[9px]"
      >
        <span style={{ color: "#444" }}>
          {wordCount} {wordCount === 1 ? "word" : "words"} · {charCount} {charCount === 1 ? "char" : "chars"}
        </span>
        {urlLabel && (
          <span style={{ color: urlColor }}>{urlLabel}</span>
        )}
      </div>
    </>
  );
}
