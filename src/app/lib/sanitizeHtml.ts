const EVENT_HANDLER_PATTERN = /^on/i;
const JAVASCRIPT_PROTOCOL = /^javascript:/i;

export function sanitizeHtml(html: string) {
  if (typeof window === "undefined") return html;

  const doc = new DOMParser().parseFromString(html, "text/html");

  doc.querySelectorAll("script,style").forEach((node) => node.remove());
  doc.querySelectorAll("*").forEach((node) => {
    Array.from(node.attributes).forEach((attr) => {
      const name = attr.name;
      const value = attr.value.trim();

      if (EVENT_HANDLER_PATTERN.test(name) || name === "style") {
        node.removeAttribute(name);
        return;
      }

      if (
        (name === "href" || name === "src") &&
        JAVASCRIPT_PROTOCOL.test(value)
      ) {
        node.removeAttribute(name);
      }
    });
  });

  return doc.body.innerHTML;
}
