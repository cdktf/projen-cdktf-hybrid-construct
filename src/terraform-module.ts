import { ConstructLibrary, ConstructLibraryOptions } from "projen/lib/cdk";

const defaults = {
  prettier: true,
  projenrcTs: true,
  defaultReleaseBranch: "main",
};

type HybridModuleOptions = ConstructLibraryOptions & {
  cdktfVersion?: string;
  constructVersion?: string;

  terraformModules: {
    // name of the module
    name: string;
    // path / url / registry identifier for the module
    source: string;
    // version constraint (https://www.terraform.io/docs/language/providers/requirements.html#version-constraints)
    version: string;
  }[];
  // Defaulted to a uuid string as cdktf would
  projectId?: string;
};

export class HybridModule extends ConstructLibrary {
  constructor(config: HybridModuleOptions) {
    super({
      ...defaults,
      ...config,
      sampleCode: false,
      eslintOptions: Object.assign({}, config.eslintOptions, {
        lintProjenRc: false,
      }),
      postBuildSteps: [],
    });
    const constructVersion = config.constructVersion || "^10.0.25";
    const cdktfVersion = config.cdktfVersion || "^0.9.4";

    this.addPeerDeps(`constructs@${constructVersion}`, `cdktf@${cdktfVersion}`);
    this.addDevDeps(`cdktf-cli@${cdktfVersion}`, "ts-node");
    this.addKeywords("cdktf", "cdktf-hybrid");
  }
}
