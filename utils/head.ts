import type { Link, Meta } from "@unhead/schema";

export function composeTitle(title?: string): string {
  if (!title) {
    return "Luonto";
  }
  return `${title} | Luonto`;
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
