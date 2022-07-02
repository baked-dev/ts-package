import { Options, transformFile } from "@swc/core";
import { mkdir, stat } from "fs-extra";
import { join, relative } from "path";
import "./async-array";
import { safeWrite } from "./fs";

type ReplaceParams = Parameters<typeof String["prototype"]["replace"]>;

const replaceESMImports = (extension: string): ReplaceParams => [
  /import.*"\.\/.*";$/gm,
  (match) => {
    return match.replace(/";$/, extension + '";');
  },
];

const replaceCJSRequires = (extension: string): ReplaceParams => [
  /require\("\.\/.*"\)/gm,
  (match) => {
    return match.replace(/\"\)$/, extension + '")');
  },
];

export const swcbuild = async (
  files: string[],
  config: Options,
  outDir: string,
  srcDir: string,
  extension: string
) => {
  try {
    await stat(outDir);
  } catch {
    await mkdir(outDir);
  }
  return files
    .map(async (file) => {
      return transformFile(file, {
        ...config,
        sourceMaps: true,
      }).then(({ code, map }) => [
        safeWrite(
          join(outDir, relative(srcDir, file)).replace(/.ts$/, extension),
          code
            .replace(...replaceESMImports(extension))
            .replace(...replaceCJSRequires(extension))
        ),
        safeWrite(
          join(outDir, relative(srcDir, file)).replace(/.ts$/, ".js.map"),
          map
        ),
      ]);
    })
    .done();
};
