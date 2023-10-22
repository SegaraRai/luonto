import { readdir, readFile, writeFile } from "node:fs/promises";
import { type Config, optimize } from "svgo";

interface Icon {
  name: string;
  body: string;
  width: number;
  height: number;
}

const config: Config = {
  multipass: true,
  floatPrecision: 2,
  plugins: [
    {
      name: "preset-default",
      params: {
        floatPrecision: 2,
        overrides: {
          removeViewBox: false,
        },
      },
    },
    {
      name: "removeAttrs",
      params: {
        attrs: ["(style)"],
      },
    },
    {
      name: "mergePaths",
      params: {
        force: true,
        floatPrecision: 2,
      },
    },
  ],
};

const icons: Icon[] = [];

for (const file of await readdir("icons")) {
  const name = file.match(/^luonto-([^.]+)\.svg$/)?.[1];
  if (!name) {
    continue;
  }

  const content = await readFile(`icons/${file}`, "utf-8");
  const { data } = await optimize(content, config);

  const [, width, height] = data.match(/viewBox="0 0 (\d+) (\d+)"/) ?? [];
  if (!width || !height) {
    throw new Error(`Failed to parse viewBox of ${file}`);
  }

  const body = data
    .replace(/<svg[^>]+>/, "")
    .replace(/<\/svg>/, "")
    .replace(/<path /, '$&fill="currentColor" ')
    .trim();

  icons.push({
    name,
    body,
    width: Number(width),
    height: Number(height),
  });
}

icons.sort((a, b) => a.name.localeCompare(b.name));

await writeFile(
  "luonto-icons.json",
  JSON.stringify(
    Object.fromEntries(icons.map(({ name, ...rest }) => [name, rest])),
    null,
    2
  ) + "\n"
);
