import LZString from "lz-string";

export const compress = (text : string) : string => {
  return LZString.compressToEncodedURIComponent(text);
}

