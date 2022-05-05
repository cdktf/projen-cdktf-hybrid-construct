import { JsonFile, SampleDir, TextFile } from "projen";
import { ConstructLibrary, ConstructLibraryOptions } from "projen/lib/cdk";
import { v4 as uuid } from "uuid";

import { defaults } from "./defaults";

export interface TerraformVersionConstraint {
  // name of the module
  readonly name: string;
  // path / url / registry identifier for the module
  readonly source: string;
  // version constraint (https://www.terraform.io/docs/language/providers/requirements.html#version-constraints)
  readonly version: string;
}

export interface TerraformModuleOptions extends ConstructLibraryOptions {
  readonly cdktfVersion?: string;
  readonly constructVersion?: string;

  readonly terraformProviders?: TerraformVersionConstraint[];
  readonly terraformModules: TerraformVersionConstraint[];

  // Defaulted to a uuid string as cdktf would
  readonly projectId?: string;
}

/**
 * Terraform Modules republished as CDKTF Constructs
 *
 * @pjid terraform-module
 */
export class TerraformModule extends ConstructLibrary {
  constructor(options: TerraformModuleOptions) {
    super({
      ...defaults,
      ...options,
      eslintOptions: Object.assign({}, options.eslintOptions, {
        lintProjenRc: false,
      }),
      postBuildSteps: [],
    });
    const constructVersion = options.constructVersion || "^10.0.107";
    const cdktfVersion = options.cdktfVersion || "^0.10.1";

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
      marker: true,
      lines: [
        ...(options.terraformModules || []).map(
          (tfModule) => `export * from "./.gen/modules/${tfModule.name}";`
        ),
        "",
      ],
    });

    new JsonFile(this, `${this.srcdir}/cdktf.json`, {
      committed: true,
      obj: {
        language: "typescript",
        app: "npx ts-node index.ts",
        terraformProviders: options.terraformProviders || [],
        terraformModules: options.terraformModules,
        projectId: options.projectId || uuid(),
      },
    });

    this.preCompileTask.exec(`cdktf get`, { cwd: this.srcdir });
  }
}
