import { TerraformModule } from "../src/index";
import { synthSnapshot } from "./helper";

describe("TerraformModule", () => {
  it("snapshot", () => {
    const project = new TerraformModule({
      name: "my-module",
      author: "Daniel Schmidt",
      authorAddress: "danielmschmidt92@gmail.com",
      repositoryUrl: "github.com/DanielMSchmidt/my-module",
      terraformModules: [
        {
          name: "eks",
          source: "terraform-aws-modules/eks/aws",
          version: "~> 18.0",
        },
        {
          name: "eks-managed-nodegroup",
          source:
            "terraform-aws-modules/eks/aws//modules/eks-managed-node-group",
          version: "~> 18.0",
        },
      ],
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
