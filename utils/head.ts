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
      content: "__CSP_DIRECTIVES_META__",
    },
  ];
}

export function getCommonLink(): Link[] {
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
      defer: true,
      tagPosition: "bodyClose",
    },
  ];
}
