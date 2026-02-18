"use client";

import pako from "pako";
import { useState, useEffect } from "react";

function compress(text : string) : string {
  const compressed = pako.deflate(text);
  return btoa(String.fromCharCode(...compressed)); // binary (Uint8) to ASCII
}

function decompress(encoded : string) : string{
  const binary = atob(encoded); // ASCII to binary (Uint8), needs further conversion (to binary)

  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0)); // binary string to Uint8
  return pako.inflate(bytes, { to: "string" }); // decompress and convert to string
}

export default function Home() {
  const [text, setText] = useState("");

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
