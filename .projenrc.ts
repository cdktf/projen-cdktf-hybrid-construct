/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { JsiiProject } from "projen/lib/cdk";
import { NpmAccess, UpgradeDependenciesSchedule } from "projen/lib/javascript";
import { AutoApprove } from "./projenrc/auto-approve";
import { Automerge } from "./projenrc/automerge";
import { CustomizedLicense } from "./projenrc/customized-license";
import { UpgradeCDKTF } from "./projenrc/upgrade-cdktf";

const name = "projen-cdktf-hybrid-construct";

const githubActionPinnedVersions = {
  "actions/checkout": "c85c95e3d7251135ab7dc9ce3241c5835cc595a9", // v3.5.3
  "actions/download-artifact": "9bc31d5ccc31df68ecc42ccf4149144866c47d8a", // v3.0.2
  "actions/setup-node": "64ed1c7eab4cce3362f8c340dee64e5eaeef8f7c", // v3.6.0
  "actions/upload-artifact": "0b7f8abb1508181956e8e162db84b466c27e18ce", // v3.1.2
  "amannn/action-semantic-pull-request":
    "c3cd5d1ea3580753008872425915e343e351ab54", // v5.2.0
  "peter-evans/create-pull-request": "284f54f989303d2699d373481a0cfa13ad5a6666", // v5.0.1
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
  jsiiVersion: "^5.1.0",
  pullRequestTemplate: false,
});
project.tsconfig?.exclude?.push("src/exampleCode/**");
project.tsconfig?.exclude?.push("example/**");
project.tsconfig?.exclude?.push("examples/**");

project.addPeerDeps("projen@>= 0.72.18");
project.addBundledDeps("change-case");
project.addDevDeps(
  "fs-extra",
  "glob",
  "projen@^0.72.18",
  "@types/fs-extra",
  "@types/glob",
  "@types/change-case",
  "ts-node@10.9.1",
  "jsii-docgen@^9.0.0",
  "comment-json"
);

new CustomizedLicense(project);
new AutoApprove(project);
new Automerge(project);
new UpgradeCDKTF(project);

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

project.addTask("upgrade:hybrid", {
  exec: "yarn projen upgrade",
  cwd: "./examples/hybrid-module",
});
project.addTask("upgrade:terraform", {
  exec: "yarn projen upgrade",
  cwd: "./examples/terraform-module",
});
project.removeTask("post-upgrade");
project.addTask("post-upgrade", {
  description: "Runs after upgrading dependencies",
  exec: "yarn projen upgrade:hybrid && yarn projen upgrade:terraform",
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

// Use pinned versions of github actions
Object.entries(githubActionPinnedVersions).forEach(([action, sha]) => {
  project.github?.actions.set(action, `${action}@${sha}`);
});

project.synth();
