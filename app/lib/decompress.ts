import Pako from "pako";

export const decompress = (encoded : string) : string => {
  const binary = atob(encoded); // ASCII to binary (Uint8), needs further conversion (to binary)

  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0)); // binary string to Uint8
  return Pako.inflate(bytes, { to: "string" }); // decompress and convert to string
}