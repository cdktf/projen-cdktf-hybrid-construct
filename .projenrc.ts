import { typescript } from "projen";
import { NpmAccess } from "projen/lib/javascript";

const name = "projen-cdktf-hybrid-construct";
const project = new typescript.TypeScriptProject({
  defaultReleaseBranch: "main",
  name,
  packageName: name,
  prettier: true,
  projenrcTs: true,
  description:
    "Projen template for CDKTF Constructs that should also be used as Terraform Modules.",
  license: "MIT",
  copyrightOwner: "Daniel Schmidt",

  deps: ["projen", "@types/uuid", "uuid"],
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
  gitignore: [".idea/"],
});
project.tsconfig?.exclude?.push("src/exampleCode/**");
project.tsconfig?.exclude?.push("example/**");
project.addTask("buildExample", {
  exec: "git clean -dfx . && rm -rf lib modules src && yarn && yarn projen && yarn && yarn build",
  cwd: "./example",
  env: {
    // We don't want a project id to be created
    CHECKPOINT_DISABLE: "true",
  },
});

project.testTask.exec("yarn buildExample");
project.synth();
