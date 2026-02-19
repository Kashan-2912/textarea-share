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

// Longhand border props to avoid React shorthand/longhand conflict warning
const BTN_BASE = "cursor-pointer rounded-[5px] whitespace-nowrap leading-snug bg-transparent text-[#999] border border-[#2e2e2e] px-2 py-[3px] text-[11px] md:px-3 md:py-[5px] md:text-[13px]";

export function Toolbar({
  copied, copiedRO, readOnly,
  onCopy, onCopyReadOnly,
  onExportTxt, onExportMd, onExportHtml,
}: Props) {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-[800] flex flex-wrap items-center justify-between gap-[6px] bg-[#0f0f0f] border-b border-[#a8e524] px-3 py-[5px] md:px-5 md:py-[10px]"
    >
      {/* Left: brand + badge */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[#444] font-bold tracking-widest text-[11px] md:text-[13px]">
          SHARE·PAD
        </span>
        {readOnly && (
          <span className="bg-[#162016] text-[#5aac5a] text-[10px] md:text-[11px] px-2 py-[1px] rounded-full font-semibold">
            View only
          </span>
        )}
      </div>

      {/* Right: action buttons */}
      <div className="flex items-center gap-[5px] flex-wrap">
        <button onClick={onExportTxt}  className={BTN_BASE} title="Download as plain text">.txt</button>
        <button onClick={onExportMd}   className={BTN_BASE} title="Download as Markdown">.md</button>
        <button onClick={onExportHtml} className={BTN_BASE} title="Download as HTML">.html</button>

        <div className="w-px h-[14px] bg-[#2e2e2e] shrink-0" />

        {/* Share read-only */}
        <button
          onClick={onCopyReadOnly}
          title="Copy a view-only link"
          className={`${BTN_BASE} ${copiedRO ? "!bg-[#162016] !text-[#5aac5a] !border-[#2a5a2a]" : "!text-[#aaa]"}`}
        >
          {copiedRO ? "✓ Copied!" : "Share 🔒"}
        </button>

        {/* Copy editable link */}
        <button
          onClick={onCopy}
          title="Copy link to current content"
          className={`${BTN_BASE} ${
            copied
              ? "!bg-[#162016] !text-[#5aac5a] !border-[#2a5a2a]"
              : "!bg-[#131c2e] !text-[#6a9fd8] !border-[#1e3050]"
          }`}
        >
          {copied ? "✓ Copied!" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
