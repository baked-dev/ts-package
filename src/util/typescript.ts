import {
  CompilerOptions,
  createProgram,
  findConfigFile,
  parseJsonConfigFileContent,
  readConfigFile,
  sys,
} from "typescript";
import AsyncTask from "./async-task";

export const loadTsconfig = (
  path = findConfigFile(process.cwd(), sys.fileExists, "tsconfig.json")
): [CompilerOptions, string[], any] => {
  if (!path) throw new Error("tsconfig not found");
  const { config } = readConfigFile(path, sys.readFile);
  const { options, fileNames } = parseJsonConfigFileContent(config, sys, "./");
  return [options, fileNames, config];
};

const buildTask = new AsyncTask(
  async (files: string[], config: CompilerOptions) => {
    createProgram(files, config).emit();
  },
  __filename
);

export const tsbuild = buildTask.run.bind(buildTask);
