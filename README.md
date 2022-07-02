# @baked-dev/ts-package

No config setup to package npm packages written in ts. Uses swc to transpile and tsc to emit types. Transpiles into both es-modules and cjs-modules.

## Config
By default it reads the tsconfig.json in the package root to determine inputs and oudDir. If you want to customize the behaviour, put a `build.config.ts` or `build.config.js` in the package root.

```ts
import type { BuildConfig } from "@baked-dev/ts-package";

const config: BuildConfig = {
  out: "dist",
};

export default config;
```

### BuildConfig Interface
```ts
interface BuildConfig {
  tsconfigPath?: string;  // specify path to tsconfig
  out?: string; // override / specify outDir
  sourcemaps?: boolean; // emit sourcemapts
  types?: boolean;  // emit types
  formats?: Record<string, BuildFormatConfig>;  // output formats
  jsc?: JscConfig;  // jsc config passed to swc
}
```

