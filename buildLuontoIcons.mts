import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { type Config, optimize } from "svgo";

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

await mkdir("icons/build/luonto", { recursive: true });

for (const file of await readdir("icons/src")) {
  const name = file.match(/^luonto-([^.]+)\.svg$/)?.[1];
  if (!name) {
    continue;
  }

  const content = await readFile(`icons/src/${file}`, "utf-8");
  const { data } = optimize(content, config);

  const [, width, height] = data.match(/viewBox="0 0 (\d+) (\d+)"/) ?? [];
  if (!width || !height) {
    throw new Error(`Failed to parse viewBox of ${file}`);
  }

  const body = data
    .replace(/<svg[^>]+>/, "")
    .replace(/<\/svg>/, "")
    .replace(/<path /, '$&fill="currentColor" ')
    .trim();

  await writeFile(
    `icons/build/luonto/${name}.svg`,
    `<svg viewBox="0 0 ${width} ${height}">${body}</svg>`
  );
}
