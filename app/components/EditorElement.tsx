const H_BASE: React.CSSProperties = { color: "#ededed", margin: "0 0 6px", lineHeight: 1.3 };

export function EditorElement({ attributes, children, element }: any) {
  switch (element.type) {
    case "heading-one":
      return <h1 {...attributes} style={{ ...H_BASE, fontSize: 30, fontWeight: 700 }}>{children}</h1>;
    case "heading-two":
      return <h2 {...attributes} style={{ ...H_BASE, fontSize: 23, fontWeight: 600 }}>{children}</h2>;
    case "heading-three":
      return <h3 {...attributes} style={{ ...H_BASE, fontSize: 18, fontWeight: 600 }}>{children}</h3>;
    default:
      return <p {...attributes} style={{ margin: "0 0 2px" }}>{children}</p>;
  }
}
