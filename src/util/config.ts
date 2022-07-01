import { JscConfig, ModuleConfig } from "@swc/core";
import { exists } from "./fs";
import { join, resolve } from "path";
import type { PackageJson } from "types-package-json";
import { CompilerOptions } from "typescript";

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

export interface BuildConfig {
  tsconfigPath?: string;
  out?: string;
  sourcemaps?: boolean;
  types?: boolean;
  formats?: Record<string, BuildFormatConfig>;
  jsc?: JscConfig;
  main?: string;
}

const configFiles = ["build.config.ts", "build.config.js"] as const;

export const read = async (path?: string): Promise<BuildConfig> => {
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
  if (!tsExists && !jsExists)
    return {
      formats: defaultFormats,
    };
  const config = require(tsExists ? tsExists : jsExists!) as
    | { default: BuildConfig }
    | BuildConfig;
  return "default" in config ? config.default : config;
};

interface ValidateError {
  message: string;
  path: string;
  fix: (pkg: any) => any;
}

export const importPackageJson = async () => {
  const packageJsonPath = resolve(process.cwd(), `package.json`);
  return import(packageJsonPath) as Partial<PackageJson> & {
    exports?: string | { import?: string; require?: string };
  };
};
