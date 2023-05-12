import { IResolver, License } from "projen";
import { JsiiProject } from "projen/lib/cdk";
import { JobStep } from "projen/lib/github/workflows-model";
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

const setSafeDirectory = {
  name: "Set git config safe.directory",
  run: "git config --global --add safe.directory $(pwd)",
};
const ensureCorrectUser = {
  name: "Ensure correct user",
  run: `chown -R root /__w/${name}`,
};

const buildSteps = (project.buildWorkflow as any).preBuildSteps as JobStep[];
const releaseSteps = (project.release as any).defaultBranch.workflow.jobs
  .release.steps;
const { upgrade, pr } = (project.upgradeWorkflow as any).workflows[0].jobs;

buildSteps.push(setSafeDirectory);
buildSteps.push(ensureCorrectUser);
releaseSteps.splice(1, 0, setSafeDirectory);
releaseSteps.splice(1, 0, ensureCorrectUser);
upgrade.steps.splice(1, 0, setSafeDirectory);
pr.steps.splice(1, 0, setSafeDirectory);

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
    uses: "hashicorp/setup-copywrite@867a1a2a064a0626db322392806428f7dc59cb3e", // v1.1.2
  },
  { name: "Add headers using Copywrite tool", run: "copywrite headers" }
);

project.synth();
