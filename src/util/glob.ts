import { promisify } from "util";
import _glob from "glob";
import "./async-array";

export const glob = promisify(_glob);

export const globs = async (patterns: string[]) =>
  (await patterns.map(async (pattern) => glob(pattern)).done()).flat();
