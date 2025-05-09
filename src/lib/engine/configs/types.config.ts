type AvailableTargets = "es2022";

type TargetsMatrix = "";

interface RootBuildConfig {
  target: AvailableTargets;
  external: string[];
  entry: string | "index";
  features: string[];
}

export interface BuildOptions extends RootBuildConfig {
  divides: ReadonlyPartial<["public", "private", "internal", "classes"]>;
  crypto: {
    path: string;
    modules: ReadonlyPartial<string[]>;
  }
}

// absolutely not ready
