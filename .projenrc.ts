import { JsiiProject } from "projen/lib/cdk";
import { NpmAccess } from "projen/lib/javascript";

const name = "projen-cdktf-hybrid-construct";
const project = new JsiiProject({
  defaultReleaseBranch: "main",
  name,
  repositoryUrl: `https://github.com/DanielMSchmidt/${name}.git`,
  author: "Daniel Schmidt",
  authorAddress: "danielmschmidt92@gmail.com",
  packageName: name,
  prettier: true,
  projenrcTs: true,
  description:
    "Projen template for CDKTF Constructs that should also be used as Terraform Modules.",
  license: "MIT",
  copyrightOwner: "Daniel Schmidt",

  release: true,
  releaseToNpm: true,
  npmAccess: NpmAccess.PUBLIC,
  autoApproveUpgrades: true,
  autoApproveOptions: {
    label: "auto-approve",
    allowedUsernames: ["DanielMSchmidt", "github-bot"],
  },
  gitignore: [".idea/"],
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
project.synth();
