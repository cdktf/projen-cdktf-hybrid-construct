const { HybridModule } = require("../lib");

const project = new HybridModule({
  name: "my-module",
  author: "Daniel Schmidt",
  repository: "github.com/DanielMSchmidt/my-module",
  defaultReleaseBranch: "main",
  authorAddress: "danielmschmidt92@gmail.com",
  repositoryUrl: "github.com/DanielMSchmidt/my-module",
});
project.synth();
