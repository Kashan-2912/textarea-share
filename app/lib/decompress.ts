import LZString from "lz-string";

export const decompress = (encoded : string) : string => {
  const decompressed = LZString.decompressFromEncodedURIComponent(encoded);
  return decompressed;
}