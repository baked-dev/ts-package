#!/usr/bin/env node

import { JscConfig, JscTarget } from "@swc/core";
import { join } from "path";
import type { CompilerOptions } from "typescript";
import "./util/async-array";
import {
  BuildConfig,
  BuildFormatConfig,
  FullConfig,
  normalizeConfig,
  read,
} from "./util/config";
import { clear, sharedBase } from "./util/fs";
import { globs } from "./util/glob";
import { swcbuild } from "./util/swc-build";
import { loadTsconfig, tsbuild } from "./util/typescript";

export type { BuildConfig, BuildFormatConfig, FullConfig };

const buildFormat = async (
  name: string,
  {
    extension,
    types = true,
    sourcemaps = true,
    ...moduleConfig
  }: BuildFormatConfig,
  {
    sourcemaps: globalSourcemaps,
    types: gloalTypes,
    files,
    target,
    outDir,
    srcDir,
    jsc,
    tsConfig,
  }: {
    sourcemaps: boolean;
    types: boolean;
    files: string[];
    target: string;
    outDir: string;
    srcDir: string;
    jsc: JscConfig;
    tsConfig: CompilerOptions;
  }
) => {
  console.log(`[SWC][${name}] - Transpiling ${files.length} file(s)`);
  const promises: Promise<any>[] = [
    swcbuild(
      files,
      {
        module: moduleConfig,
        jsc: {
          ...jsc,
          target: target.toLowerCase() as JscTarget,
        },
        sourceMaps: sourcemaps !== false && globalSourcemaps !== false,
      },
      join(outDir, name),
      srcDir,
      extension
    ).then(() => {
      console.log(`[SWC][${name}] - Done transpiling ${files.length} file(s)`);
    }),
  ];
  if (types !== false && gloalTypes !== false) {
    console.log(`[TSC][${name}] - Emitting declarations`);
    promises.push(
      tsbuild(files, {
        ...tsConfig,
        outDir: join(outDir, name),
        emitDeclarationOnly: true,
        declarationMap: sourcemaps !== false && globalSourcemaps !== false,
        declaration: true,
        sourceMap: false,
      }).then(() => {
        console.log(`[TSC][${name}] - Done mitting declarations`);
      })
    );
  }
  return promises.done();
};

const build = async ({
  out: userOut,
  tsconfigPath,
  sourcemaps,
  types,
  formats,
  jsc,
}: FullConfig) => {
  const [
    tsConfig,
    fileNames,
    { compilerOptions: { target = "es3" } = {} } = {},
  ] = loadTsconfig(tsconfigPath);
  const outDir = userOut || tsConfig.outDir;
  if (!outDir) throw new Error("Could not determine out directory.");

  await clear(outDir);

  const files = await globs(fileNames);
  const srcDir = sharedBase(files);

  await Object.entries(formats)
    .map(async ([name, format]) => {
      return buildFormat(name, format, {
        files,
        jsc,
        tsConfig,
        sourcemaps,
        types,
        target,
        outDir,
        srcDir,
      });
    })
    .done();
};

const main = async (configPath?: string) => {
  const config = await read(configPath);
  const fullConfig = normalizeConfig(config);
  console.log(fullConfig);
  await build(fullConfig);
};

main(...process.argv.slice(2));
