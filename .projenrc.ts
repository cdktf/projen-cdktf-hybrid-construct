/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { JsiiProject } from "projen/lib/cdk";
import { JobStep } from "projen/lib/github/workflows-model";
import { NpmAccess, UpgradeDependenciesSchedule } from "projen/lib/javascript";
import { AutoApprove } from "./projenrc/auto-approve";
import { Automerge } from "./projenrc/automerge";
import { CustomizedLicense } from "./projenrc/customized-license";
import { UpgradeCDKTF } from "./projenrc/upgrade-cdktf";
import { UpgradeJSIIAndTypeScript } from "./projenrc/upgrade-jsii-typescript";
import { UpgradeProjen } from "./projenrc/upgrade-projen";

const name = "projen-cdktf-hybrid-construct";
const constructsVersion = "10.3.0";
/** JSII and TS should always use the same major/minor version range */
const typescriptVersion = "~5.7.0";
const projenVersion = "0.88.0";

const githubActionPinnedVersions = {
  "actions/checkout": "11bd71901bbe5b1630ceea73d27597364c9af683", // v4.2.2
  "actions/download-artifact": "95815c38cf2ff2164869cbab79da8d1f422bc89e", // v4.2.1
  "actions/github-script": "60a0d83039c74a4aee543508d2ffcb1c3799cdea", // v7.0.1
  "actions/setup-node": "cdca7365b2dadb8aad0a33bc7601856ffabcc48e", // v4.3.0
  "actions/upload-artifact": "ea165f8d65b6e75b540449e92b4886f43607fa02", // v4.6.2
  "amannn/action-semantic-pull-request":
    "0723387faaf9b38adef4775cd42cfd5155ed6017", // v5.5.3
  "hashicorp/setup-copywrite": "32638da2d4e81d56a0764aa1547882fc4d209636", // v1.1.3
  "hashicorp/setup-terraform": "b9cd54a3c349d3f38e8881555d616ced269862dd", // v3.1.2
  "peter-evans/create-pull-request": "271a8d0340265f705b14b6d32b9829c1cb33d45e", // v7.0.8
};

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
  mergify: false,
  depsUpgradeOptions: {
    workflowOptions: {
      labels: ["auto-approve", "automerge", "dependencies"],
      schedule: UpgradeDependenciesSchedule.WEEKLY,
    },
  },
  gitignore: [".idea/"],
  workflowGitIdentity: {
    name: "team-tf-cdk",
    email: "github-team-tf-cdk@hashicorp.com",
  },
  typescriptVersion,
  jsiiVersion: typescriptVersion,
  pullRequestTemplate: false,
  // Necessary due to this bug: https://github.com/projen/projen/issues/3950#issuecomment-2483442005
  // If this bug gets fixed, the below `eslintOptions` section should be able to be removed
  eslintOptions: {
    fileExtensions: [],
    dirs: ["src", "test", "projenrc", ".projenrc.ts"],
  },
});
project.tsconfig?.exclude?.push("src/exampleCode/**");
project.tsconfig?.exclude?.push("example/**");
project.tsconfig?.exclude?.push("examples/**");

project.addPeerDeps(
  `projen@>= ${projenVersion}`,
  `constructs@>= ${constructsVersion}`
);
project.addBundledDeps("change-case");
project.addDevDeps(
  "fs-extra",
  "glob",
  `projen@${projenVersion}`,
  `constructs@${constructsVersion}`,
  "@types/fs-extra",
  "@types/glob",
  "@types/change-case",
  "ts-node@10.9.1",
  "comment-json"
);
// This gets rid of the following error during the build » package » package-all » package:js step:
// Error: Conflicting versions of constructs in type system: previously loaded 10.3.0, trying to load 10.4.2
// It is not clear why the above error occurs; none of our other Projen projects have this problem
project.package.addPackageResolutions(`constructs@${constructsVersion}`);

new CustomizedLicense(project);
new AutoApprove(project);
new Automerge(project);
new UpgradeCDKTF(project);
new UpgradeJSIIAndTypeScript(project, typescriptVersion);
new UpgradeProjen(project);

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

project.addTask("upgrade:hybrid", {
  exec: "yarn projen upgrade",
  cwd: "./examples/hybrid-module",
});
project.addTask("upgrade:terraform", {
  exec: "yarn projen upgrade",
  cwd: "./examples/terraform-module",
});
project.removeTask("post-upgrade");
const upgradeTask = project.addTask("post-upgrade", {
  description: "Runs after upgrading dependencies",
  exec: "yarn compile",
});
upgradeTask.exec("yarn projen upgrade:hybrid");
upgradeTask.exec("yarn projen upgrade:terraform");

project.testTask.exec("yarn buildExample");

project.addPackageIgnore("scripts");
project.addPackageIgnore("examples");
project.addPackageIgnore("projenrc");
project.addPackageIgnore("/.projenrc.ts");

project.addPackageIgnore(".copywrite.hcl");
// Run copywrite tool to add copyright headers to all files
project.buildWorkflow?.addPostBuildSteps(
  {
    name: "Setup Copywrite tool",
    uses: "hashicorp/setup-copywrite",
  },
  { name: "Add headers using Copywrite tool", run: "copywrite headers" }
);

const setupTerraformStep = {
  name: "Setup Terraform",
  uses: "hashicorp/setup-terraform",
  with: {
    terraform_wrapper: false,
  },
};
const buildSteps = (project.buildWorkflow as any).preBuildSteps as JobStep[];
const releaseSteps = (project.release as any).defaultBranch.workflow.jobs
  .release.steps;
buildSteps.push(setupTerraformStep);
releaseSteps.splice(1, 0, setupTerraformStep);

// Use pinned versions of github actions
Object.entries(githubActionPinnedVersions).forEach(([action, sha]) => {
  project.github?.actions.set(action, `${action}@${sha}`);
});

const releaseWorkflow = project.tryFindObjectFile(
  ".github/workflows/release.yml"
);
releaseWorkflow?.addOverride("on.push", {
  branches: ["main"],
  "paths-ignore": [
    // don't do a release if the change was only to these files/directories
    "examples/**",
    ".github/ISSUE_TEMPLATE/**",
    ".github/CODEOWNERS",
    ".github/dependabot.yml",
    ".github/**/*.md",
  ],
});

project.synth();
