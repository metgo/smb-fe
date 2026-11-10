import DOMPurify from "dompurify";

export function sanitizeHtml(html: string = ""): string {
  if (!html) return "";
  if (typeof window === "undefined") return html;
  return styleHtmlLinks(DOMPurify.sanitize(html, { ADD_ATTR: ["target"] }));
}

/**
 * Backend content often stores anchors with a scheme-less href (e.g. `google.com`),
 * which the browser resolves as a relative path and 404s. This prefixes `https://`
 * to any anchor href that is not already absolute, root-relative, a hash, or a
 * mailto/tel link. Run it before sanitizeHtml.
 */
export function normalizeAnchorHrefs(html: string = ""): string {
  if (!html) return "";
  return html.replace(
    /(<a\b[^>]*\bhref=["'])(?!https?:\/\/|\/\/|\/|#|mailto:|tel:)([^"']+)(["'])/gi,
    (_match, pre, url, post) => `${pre}https://${url}${post}`,
  );
}

/**
 * Strips all HTML tags/entities from a string and collapses whitespace.
 * For places that need a short plain-text preview (card teasers, meta tags)
 * where rendering markup — or a nested <a> inside a card link — is not wanted.
 */
export function stripHtmlToText(html: string = ""): string {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Normalizes anchor tags inside an HTML string:
 *  - renders every link as a pill-shaped button so it reads as a call to action
 *  - makes the anchor an inline-block with RTL direction so it flows
 *    correctly inside our Hebrew (RTL) content
 *  - opens every link in a new tab (adds target="_blank" + safe rel)
 *
 * If the string contains no link, the original string is returned untouched.
 * Preserves any existing inline styles / attributes on the <a> tag.
 *
 * @param html - Raw HTML string
 * @returns HTML string with normalized anchors, or the original string if no link found
 */
export function styleHtmlLinks(html: string = ""): string {
  if (!html) return "";

  // Bail early when there is nothing to style
  if (!/<a\b[^>]*>/i.test(html)) return html;

  // Button-like styling. Inline styles (not classes) because this HTML is
  // injected via dangerouslySetInnerHTML and isn't processed by Tailwind.
  // display:inline-block is also what lets `direction` take effect on an <a>.
  const linkStyle =
    [
      "display: inline-block",
      "unicode-bidi: embed",
      "text-decoration: none",
      "padding: 4px 10px",
      "margin: 4px 0",
      "border-radius: 999px",
      "background-color: var(--color-brand-primary, #0d9488)",
      "color: #ffffff",
      "font-weight: 600",
      "font-size: 0.875rem",
      "line-height: 1.25rem",
      "box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15)",
      "transition: opacity 0.2s",
    ].join("; ") + ";";

  return html.replace(/<a\b([^>]*)>/gi, (_match, rawAttrs: string) => {
    let attrs = rawAttrs;

    // Merge our style into an existing style attribute, or add a new one
    if (/style\s*=\s*"/i.test(attrs)) {
      attrs = attrs.replace(
        /style\s*=\s*"([^"]*)"/i,
        (_m, existing: string) =>
          `style="${existing.replace(/;?\s*$/, "; ")}${linkStyle}"`,
      );
    } else {
      attrs = `${attrs} style="${linkStyle}"`;
    }

    // Force open-in-new-tab
    if (/\btarget\s*=/i.test(attrs)) {
      attrs = attrs.replace(/target\s*=\s*"[^"]*"/i, 'target="_blank"');
    } else {
      attrs = `${attrs} target="_blank"`;
    }

    // Security: prevent the opened page from accessing window.opener
    if (/\brel\s*=/i.test(attrs)) {
      attrs = attrs.replace(/rel\s*=\s*"([^"]*)"/i, (_m, existing: string) => {
        const rels = new Set(existing.split(/\s+/).filter(Boolean));
        rels.add("noopener");
        rels.add("noreferrer");
        return `rel="${Array.from(rels).join(" ")}"`;
      });
    } else {
      attrs = `${attrs} rel="noopener noreferrer"`;
    }

    return `<a${attrs}>`;
  });
}
