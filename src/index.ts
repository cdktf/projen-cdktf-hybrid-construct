import { ConstructLibrary, ConstructLibraryOptions } from "projen/lib/cdk";

type HybridModuleOptions = ConstructLibraryOptions & {
  cdktfVersion?: string;
  constructVersion?: string;
};

const defaults = {
  prettier: true,
  defaultReleaseBranch: "main",
};

export class HybridModule extends ConstructLibrary {
  constructor(config: HybridModuleOptions) {
    super({ ...defaults, ...config });
    const constructVersion = config.constructVersion || "^10.0.25";
    const cdktfVersion = config.cdktfVersion || "^0.9.4";

    this.addPeerDeps(`constructs@${constructVersion}`, `cdktf@${cdktfVersion}`);
    this.addKeywords("cdktf", "cdktf-hybrid");

    // ignore dist in tests
    this.jest?.addIgnorePattern("dist");
  }
}
