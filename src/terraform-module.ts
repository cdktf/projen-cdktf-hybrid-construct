import { JsonFile, SampleDir, TextFile } from "projen";
import { ConstructLibrary } from "projen/lib/cdk";
import { v4 as uuid } from "uuid";

import { defaults, Options } from "./defaults";

export type TerraformVersionConstraint = {
  // name of the module
  name: string;
  // path / url / registry identifier for the module
  source: string;
  // version constraint (https://www.terraform.io/docs/language/providers/requirements.html#version-constraints)
  version: string;
};

type TerraformModuleOptions = Options & {
  cdktfVersion?: string;
  constructVersion?: string;

  terraformProviders?: TerraformVersionConstraint[];
  terraformModules: TerraformVersionConstraint[];

  // Defaulted to a uuid string as cdktf would
  projectId?: string;
};

export class TerraformModule extends ConstructLibrary {
  constructor(config: TerraformModuleOptions) {
    super({
      ...defaults,
      ...config,
      eslintOptions: Object.assign({}, config.eslintOptions, {
        lintProjenRc: false,
      }),
      postBuildSteps: [],
    });
    const constructVersion = config.constructVersion || "^10.0.107";
    const cdktfVersion = config.cdktfVersion || "^0.10.1";

    const constructSrcCode = `
// Re-Export module bindings
export * from "./terraformModules";

// Add your custom constructs here
`;

    const constructTestCode = `
// import { Testing } from "cdktf";
// import "cdktf/lib/testing/adapters/jest";

// To learn more about testing see cdk.tf/testing
describe("MyModule", () => {
  it.todo("should be tested")
});
`;

    this.addPeerDeps(`constructs@${constructVersion}`, `cdktf@${cdktfVersion}`);
    this.addDevDeps(`cdktf-cli@${cdktfVersion}`, "ts-node");
    this.addKeywords("cdktf", "cdktf-hybrid");

    new SampleDir(this, this.srcdir, {
      files: {
        "index.ts": constructSrcCode.trim(),
        "__tests__/index-test.ts": constructTestCode.trim(),
      },
    });
    new TextFile(this, `${this.srcdir}/terraformModules.ts`, {
      committed: true,
      lines: config.terraformModules.map(
        (tfModule) => `export * from "./.gen/modules/${tfModule.name}";`
      ),
    });

    new JsonFile(this, `${this.srcdir}/cdktf.json`, {
      committed: true,
      obj: {
        language: "typescript",
        app: "npx ts-node index.ts",
        terraformProviders: config.terraformProviders || [],
        terraformModules: config.terraformModules,
        projectId: config.projectId || uuid(),
      },
    });

    this.preCompileTask.exec(`cdktf get`, { cwd: this.srcdir });
  }
}
