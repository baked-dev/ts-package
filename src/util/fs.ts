import { mkdir, readdir, remove, stat, writeFile } from "fs-extra";
import { join, sep } from "path";
import "./async-array";

export const clear = async (dir: string) => {
  try {
    await stat(dir);
  } catch {
    await mkdir(dir);
  }
  const entries = await readdir(dir);
  return (await entries.map((entry) => remove(join(dir, entry))).done()).length;
};

export const exists = async (file: string) => {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
};

export const safeWrite = async (path: string, data: any) => {
  const parts = path.split(sep);
  const filename = parts.pop();
  if (!(await exists(join(...parts))))
    await mkdir(join(...parts), { recursive: true });
  return writeFile(join(...parts, filename!), data);
};

export const sharedBase = (files: string[]) => {
  return join(
    ...files.reduce((acc: string[], file) => {
      const parts = file.split("/");
      if (!acc.length) return parts;
      const matches: string[] = [];
      for (const idx in parts) {
        if (parts[idx] === acc[idx]) matches.push(parts[idx]);
        else break;
      }
      return matches;
    }, [])
  );
};
