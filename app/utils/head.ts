import type { Link, Meta, Script } from "@unhead/schema";

export const UNHEAD_TITLE_TEMPLATE = "%s %separator Luonto";

export function getCommonTemplateParams(): Record<string, string> {
  return {
    separator: "|",
  };
}

export function getCommonMeta(): Meta[] {
  return [
    {
      name: "charset",
      content: "utf-8",
    },
    {
      name: "theme-color",
      content: "#3fe6ae",
    },
    {
      "http-equiv": "content-security-policy",
      content:
        "default-src 'self'; base-uri 'self'; block-all-mixed-content; connect-src 'self' api.nature.global cloudflareinsights.com static.cloudflareinsights.com; img-src 'self' data:; object-src 'none'; script-src 'self' static.cloudflareinsights.com 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
    },
  ];
}

export function getCommonLink(noAPI = false): Link[] {
  return [
    {
      rel: "icon",
      type: "image/svg+xml",
      href: "/favicon.svg",
    },
    {
      rel: "apple-touch-icon",
      href: "/apple-touch-icon.png",
    },
    {
      rel: "manifest",
      href: "/manifest.webmanifest",
    },
    ...(noAPI
      ? []
      : [
          {
            rel: "dns-prefetch",
            href: "https://api.nature.global/",
          },
        ]),
    {
      rel: "dns-prefetch",
      href: "https://cloudflareinsights.com/",
    },
    {
      rel: "preconnect",
      href: "https://static.cloudflareinsights.com/",
      crossorigin: "anonymous",
    },
  ];
}

export function getCommonScript(): Script[] {
  if (process.env.NODE_ENV === "development") {
    return [];
  }

  return [
    {
      key: "cloudflare-web-analytics",
      src: "https://static.cloudflareinsights.com/beacon.min.js?token=df8f7f632be64a348ead49ebce1b609e",
      crossorigin: "anonymous",
      defer: true,
      tagPosition: "bodyClose",
    },
  ];
}
