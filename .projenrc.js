const path = require("path");
const { typescript } = require("projen");
const { NpmAccess } = require("projen/lib/javascript");

const name = "projen-cdktf-hybrid-construct";
const project = new typescript.TypeScriptProject({
  defaultReleaseBranch: "main",
  name,
  packageName: name,
  prettier: true,
  description:
    "Projen template for CDKTF Constructs that should also be used as Terraform Modules.",
  license: "MIT",
  copyrightOwner: "Daniel Schmidt",

  deps: ["projen"],
  devDeps: ["fs-extra", "glob", "@types/fs-extra", "@types/glob"],

  release: true,
  releaseToNpm: true,
  npmAccess: NpmAccess.PUBLIC,
  autoApproveUpgrades: true,
  autoApproveProjenUpgrades: true,
  autoApproveOptions: {
    label: "auto-approve",
    allowedUsernames: ["DanielMSchmidt", "github-bot"],
  },
});
project.tsconfig.exclude.push("src/exampleCode/**");
project.tsconfig.exclude.push("example/**");

project.addTask("buildExample", {
  exec: "yarn projen && yarn && yarn build",
  cwd: path.resolve(__dirname, "example"),
});
project.buildWorkflow.addPostBuildSteps({
  id: "build-example",
  name: "Build Example",
  run: "yarn buildExample",
});
project.synth();
