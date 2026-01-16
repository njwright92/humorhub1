const EVENT_HANDLER_PATTERN = /^on/i;
const JAVASCRIPT_PROTOCOL = /^javascript:/i;

export function sanitizeHtml(html: string) {
  if (typeof window === "undefined") {
    let cleaned = html;
    cleaned = cleaned.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
    cleaned = cleaned.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "");
    cleaned = cleaned.replace(/\son\w+\s*=\s*(['"]).*?\1/gi, "");
    cleaned = cleaned.replace(/\sstyle\s*=\s*(['"]).*?\1/gi, "");
    cleaned = cleaned.replace(
      /\s(href|src)\s*=\s*(['"])\s*javascript:[^'"]*\2/gi,
      ""
    );
    return cleaned;
  }

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
