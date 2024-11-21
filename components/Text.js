function Text({ title }) {
  if (!title) {
    return null;
  }
  return title.map((value) => {
    const {
      annotations: { bold, code, color, italic, strikethrough, underline },
      text,
    } = value;

    return (
      <span
        className={[
          bold ? "font-bold" : "",
          code ? "font-mono bg-gray-200 p-1 rounded" : "",
          italic ? "italic" : "",
          strikethrough ? "line-through" : "",
          underline ? "underline" : "",
          color !== "default" ? `text-${color}` : "",
        ].join(" ")}
        key={text.content}
      >
        {text.link ? <a href={text.link.url}>{text.content}</a> : text.content}
      </span>
    );
  });
}

export default Text;
