"use client";

import { useState, useEffect } from "react";
import { compress, decompress } from "../app/lib/index";

export default function Home() {
  const [text, setText] = useState("");

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

  return (
    <main style={{ padding: 40 }}>
      <h1>Live URL Compressor</h1>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type something..."
        style={{
          width: "100%",
          height: "300px",
          padding: "10px",
          fontSize: "16px",
        }}
      />
    </main>
  );
}
