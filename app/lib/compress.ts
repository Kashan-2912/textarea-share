import Pako from "pako";

export const compress = (text : string) : string => {
  const compressed = Pako.deflate(text);
  return btoa(String.fromCharCode(...compressed)); // binary (Uint8) to ASCII
}

