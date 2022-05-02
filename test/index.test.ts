import { HybridModule } from "../src/index";
import { synthSnapshot } from "./helper";

describe("HybridModule", () => {
  it("snapshot", () => {
    const project = new HybridModule({
      name: "my-module",
      author: "Daniel Schmidt",
      repository: "github.com/DanielMSchmidt/my-module",
      defaultReleaseBranch: "main",
      authorAddress: "danielmschmidt92@gmail.com",
      repositoryUrl: "github.com/DanielMSchmidt/my-module",
      terraformExamplesFolder: "terraform",
      terraformProvider: "aws",
      terraformProviderAwsConfig: {
        region: "eu-central-1",
        requiredProviderVersion: "3.74",
      },
      projectId: "test-project",
    });

    const out = synthSnapshot(project);

    const ignoredFiles = [".projen", "example"];
    Object.entries(out).forEach(([path, content]) => {
      if (ignoredFiles.some((file) => path.indexOf(file) !== -1)) {
        return;
      }
      expect(content).toMatchSnapshot(path);
    });
  });
});
