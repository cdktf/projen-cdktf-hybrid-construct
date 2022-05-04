import { TerraformModule, publishToRegistries } from "../src/index";
import { expectSnapshot, expectSnapshotOnly } from "./helper";

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

    expectSnapshot(project);
  });

  it("can be released", () => {
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
      ...publishToRegistries({
        name: "my-module",
        namespace: "dschmidt",
        registries: ["npm", "nuget", "maven", "pypi"],
      }),
    });
    expectSnapshotOnly(project, [".github/workflows/release.yml"]);
  });
});
