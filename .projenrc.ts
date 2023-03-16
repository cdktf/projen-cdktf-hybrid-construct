import { IResolver, License } from "projen";
import { JsiiProject } from "projen/lib/cdk";
import { NpmAccess } from "projen/lib/javascript";
import { TypeScriptProject } from "projen/lib/typescript";

const SPDX = "MPL-2.0";

class CustomizedLicense extends License {
  constructor(project: TypeScriptProject) {
    super(project, { spdx: SPDX });

    project.addFields({ license: SPDX });
  }

  synthesizeContent(resolver: IResolver) {
    return (
      "Copyright (c) 2022 HashiCorp, Inc.\n\n" +
      super.synthesizeContent(resolver)
    );
  }
}

const name = "projen-cdktf-hybrid-construct";
const project = new JsiiProject({
  defaultReleaseBranch: "main",
  name,
  repositoryUrl: `https://github.com/cdktf/${name}.git`,
  author: "HashiCorp",
  authorAddress: "https://hashicorp.com",
  authorOrganization: true,
  packageName: name,
  prettier: true,
  projenrcTs: true,
  description:
    "Projen template for CDKTF Constructs that should also be used as Terraform Modules.",
  licensed: false,
  release: true,
  releaseToNpm: true,
  npmAccess: NpmAccess.PUBLIC,
  autoApproveUpgrades: true,
  autoApproveOptions: {
    label: "auto-approve",
    allowedUsernames: ["DanielMSchmidt", "github-bot"],
  },
  gitignore: [".idea/"],
  workflowGitIdentity: {
    name: "team-tf-cdk",
    email: "github-team-tf-cdk@hashicorp.com",
  },
});
project.tsconfig?.exclude?.push("src/exampleCode/**");
project.tsconfig?.exclude?.push("example/**");
project.tsconfig?.exclude?.push("examples/**");

project.addPeerDeps("projen@>= 0.63.25");
project.addBundledDeps("change-case");
project.addDevDeps(
  "fs-extra",
  "glob",
  "projen@0.63.25",
  "@types/fs-extra",
  "@types/glob",
  "@types/change-case",
  "ts-node@10.9.1"
);

new CustomizedLicense(project);

project.addPackageIgnore("examples");

project.addTask("buildExample", {
  exec: "yarn buildExample:hybrid && yarn buildExample:terraform",
});
project.addTask("buildExample:hybrid", {
  exec: "git clean -dfx . && rm -rf lib modules src terraform construct-examples && yarn && yarn projen && yarn && yarn build",
  cwd: "./examples/hybrid-module",
});

project.addTask("buildExample:terraform", {
  exec: "git clean -dfx . && rm -rf lib modules src terraform construct-examples && yarn && yarn projen && yarn && yarn build",
  cwd: "./examples/terraform-module",
});

project.testTask.exec("yarn buildExample");

// Run copywrite tool to add copyright headers to all files
project.buildWorkflow?.addPostBuildSteps(
  {
    name: "Setup Copywrite tool",
    uses: "hashicorp/setup-copywrite@3ace06ad72e6ec679ea8572457b17dbc3960b8ce", // v1.0.0
    with: { token: "${{ secrets.GITHUB_TOKEN }}" },
  },
  { name: "Add headers using Copywrite tool", run: "copywrite headers" }
);

project.synth();
