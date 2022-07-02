import { JscConfig, ModuleConfig } from "@swc/core";
import { exists } from "./fs";
import { join } from "path";
import { register } from "ts-node";

export type BuildFormatConfig = {
  sourcemaps?: boolean;
  extension: string;
  types?: boolean;
} & ModuleConfig;

export const defaultFormats: Record<string, BuildFormatConfig> = {
  cjs: {
    type: "commonjs",
    extension: ".cjs",
  },
  esm: {
    type: "es6",
    extension: ".mjs",
  },
};

const defaultJsc: JscConfig = {
  parser: {
    syntax: "typescript",
    dynamicImport: true,
  },
};

export interface BuildConfig {
  tsconfigPath?: string;
  out?: string;
  sourcemaps?: boolean;
  types?: boolean;
  formats?: Record<string, BuildFormatConfig>;
  jsc?: JscConfig;
}

const configFiles = ["build.config.ts", "build.config.js"] as const;

export const read = async (path?: string): Promise<BuildConfig> => {
  register({ transpileOnly: true });
  try {
    if (path) {
      const config = require(path) as { default: BuildConfig } | BuildConfig;
      return "default" in config ? config.default : config;
    }
    const [tsExists, jsExists] = await configFiles
      .map(async (file) => {
        return (await exists(join(process.cwd(), file)))
          ? join(process.cwd(), file)
          : undefined;
      })
      .done();
    if (!tsExists && !jsExists) return {};
    const config = require(tsExists ? tsExists : jsExists!) as
      | { default: BuildConfig }
      | BuildConfig;
    return "default" in config ? config.default : config;
  } catch (e) {
    // console.log(e);
    return {};
  }
};

export interface FullConfig {
  tsconfigPath?: string;
  out?: string;
  sourcemaps: boolean;
  types: boolean;
  formats: Record<string, BuildFormatConfig>;
  jsc: JscConfig;
}

export const normalizeConfig = (config: BuildConfig): FullConfig => {
  return {
    out: config.out,
    tsconfigPath: config.tsconfigPath,
    sourcemaps: config.sourcemaps === false ? false : true,
    types: config.types === false ? false : true,
    jsc: config.jsc || defaultJsc,
    formats: config.formats || defaultFormats,
  };
};
