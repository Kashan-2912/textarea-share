"use client";

import { useState } from "react";
import Logo from "./Logo";

interface Props {
  copied: boolean;
  copiedRO: boolean;
  readOnly: boolean;
  onCopy: () => void;
  onCopyReadOnly: () => void;
  onExportTxt: () => void;
  onExportMd: () => void;
  onExportHtml: () => void;
  // onSelectMode?: () => void;
}

// Longhand border props to avoid React shorthand/longhand conflict warning
const BTN_BASE = "target-button cursor-pointer rounded-[5px] whitespace-nowrap leading-snug bg-transparent text-[#999] border border-[#2e2e2e] px-2 py-[3px] text-[11px] md:px-3 md:py-[5px] md:text-[13px] hover:text-[#fff] hover:border-[#555] transition-colors";

export function Toolbar({
  copied, copiedRO, readOnly,
  onCopy, onCopyReadOnly,
  onExportTxt, onExportMd, onExportHtml,
}: Props) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 z-[800] flex flex-wrap items-center justify-between gap-[6px] bg-[#0f0f0f] border-b border-[#a8e524] px-3 py-[5px] md:px-5 md:py-[10px]"
      >
        {/* Left: brand + badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-[#a8e524] font-bold tracking-widest text-[11px] md:text-[13px]">
              SHARE·PAD
            </span>
          </div>
          {readOnly && (
            <span className="bg-[#162016] text-[#5aac5a] text-[10px] md:text-[11px] px-2 py-[1px] rounded-full font-semibold">
              View only
            </span>
          )}
        </div>

        {/* Desktop: action buttons */}
        <div className="hidden md:flex items-center gap-[5px] flex-wrap">
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
        
        {/* Mobile: Action/Select Buttons */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setShowMobileMenu(true)}
            className={`${BTN_BASE} !text-[#a8e524] !border-[#a8e524] font-semibold`}
          >
            Share / Export
          </button>
        </div>
      </div>

      {/* Mobile Modal */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 z-[900] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
          onClick={() => setShowMobileMenu(false)}
        >
          <div 
            className="bg-[#0f0f0f] border-t sm:border border-[#a8e524] w-full sm:max-w-sm rounded-t-xl sm:rounded-xl p-6 space-y-5 animate-in slide-in-from-bottom duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[#a8e524] font-bold text-lg tracking-wide">Share & Export</h3>
              <button onClick={() => setShowMobileMenu(false)} className="text-[#666] hover:text-white">✕</button>
            </div>
            
            <div className="space-y-3">
              <p className="text-[#666] text-xs uppercase font-bold tracking-wider">Share Link</p>
              <button 
                onClick={() => { onCopy(); setTimeout(() => setShowMobileMenu(false), 500); }} 
                className={`w-full p-3 rounded-lg border text-left flex justify-between items-center ${
                  copied 
                    ? "bg-[#162016] border-[#5aac5a] text-[#5aac5a]" 
                    : "bg-[#131c2e] border-[#1e3050] text-[#6a9fd8]"
                }`}
              >
                <span>Copy Editable Link</span>
                {copied && <span>✓</span>}
              </button>

              <button 
                onClick={() => { onCopyReadOnly(); setTimeout(() => setShowMobileMenu(false), 500); }}
                className={`w-full p-3 rounded-lg border text-left flex justify-between items-center ${
                  copiedRO 
                    ? "bg-[#162016] border-[#5aac5a] text-[#5aac5a]" 
                    : "bg-[#111] border-[#333] text-[#aaa]"
                }`}
              >
                <span>Copy Read-Only Link (🔒)</span>
                {copiedRO && <span>✓</span>}
              </button>
            </div>

            <div className="space-y-3 pt-2">
              <p className="text-[#666] text-xs uppercase font-bold tracking-wider">Download</p>
              <div className="grid grid-cols-3 gap-3">
                <button onClick={onExportTxt}  className={`${BTN_BASE} !py-2 !text-center flex justify-center`}>.txt</button>
                <button onClick={onExportMd}   className={`${BTN_BASE} !py-2 !text-center flex justify-center`}>.md</button>
                <button onClick={onExportHtml} className={`${BTN_BASE} !py-2 !text-center flex justify-center`}>.html</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
