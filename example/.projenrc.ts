import { HybridModule } from "../lib";

const project = new HybridModule({
  name: "my-module",
  author: "Daniel Schmidt",
  repository: "github.com/DanielMSchmidt/my-module",
  defaultReleaseBranch: "main",
  authorAddress: "danielmschmidt92@gmail.com",
  repositoryUrl: "github.com/DanielMSchmidt/my-module",
  outdir: ".",
  terraformExamplesFolder: "terraform",
  terraformProvider: "aws",
  terraformProviderAwsConfig: {
    region: "eu-central-1",
    requiredProviderVersion: "3.74",
  },
  projectId: "my-project-id",
});
project.gitignore.addPatterns("lib/");
project.synth();
