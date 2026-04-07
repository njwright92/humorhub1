const ALLOWED_TAGS = new Set([
  "a",
  "b",
  "br",
  "em",
  "i",
  "li",
  "ol",
  "p",
  "strong",
  "ul",
]);

const SELF_CLOSING_TAGS = new Set(["br"]);
const TAG_PATTERN = /<\/?([a-z0-9-]+)([^<>]*)>/gi;
const HREF_PATTERN = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toSafeHref(attributes: string) {
  const match = attributes.match(HREF_PATTERN);
  const href = match?.[1] ?? match?.[2] ?? match?.[3];
  if (!href) return undefined;

  const trimmedHref = href.trim();
  if (trimmedHref.length === 0) return undefined;

  if (
    trimmedHref.startsWith("/") ||
    trimmedHref.startsWith("#") ||
    trimmedHref.startsWith("?")
  ) {
    return trimmedHref;
  }

  try {
    const url = new URL(trimmedHref);
    return ["http:", "https:", "mailto:", "tel:"].includes(url.protocol)
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

export function sanitizeHtml(html: string) {
  if (typeof html !== "string" || html.length === 0) return "";

  const source = html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "");

  let sanitized = "";
  let lastIndex = 0;

  for (const match of source.matchAll(TAG_PATTERN)) {
    const [fullMatch, rawTagName, rawAttributes = ""] = match;
    const tagName = rawTagName.toLowerCase();
    const startIndex = match.index ?? 0;

    sanitized += escapeHtml(source.slice(lastIndex, startIndex));
    lastIndex = startIndex + fullMatch.length;

    if (!ALLOWED_TAGS.has(tagName)) continue;

    const isClosingTag = fullMatch.startsWith("</");
    if (isClosingTag) {
      if (!SELF_CLOSING_TAGS.has(tagName)) {
        sanitized += `</${tagName}>`;
      }
      continue;
    }

    if (tagName === "a") {
      const safeHref = toSafeHref(rawAttributes);
      if (!safeHref) continue;

      sanitized += `<a href="${escapeHtml(
        safeHref,
      )}" target="_blank" rel="noopener noreferrer">`;
      continue;
    }

    sanitized += SELF_CLOSING_TAGS.has(tagName)
      ? `<${tagName}>`
      : `<${tagName}>`;
  }

  sanitized += escapeHtml(source.slice(lastIndex));
  return sanitized;
}
