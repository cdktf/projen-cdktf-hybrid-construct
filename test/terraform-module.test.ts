import { defaults } from "../src/defaults";
import {
  TerraformModule,
  publishToRegistries,
  publishToGithubPackages,
} from "../src/index";
import { expectSnapshot, expectSnapshotOnly } from "./helper";

describe("TerraformModule", () => {
  it("snapshot", () => {
    const project = new TerraformModule({
      ...defaults,
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
      ...defaults,
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

  it("can be released to github packages", () => {
    const project = new TerraformModule({
      ...defaults,
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
      ...publishToGithubPackages({
        name: "my-module",
        namespace: "dschmidt",
        registries: ["npm", "maven"],
      }),
    });
    expectSnapshotOnly(project, [".github/workflows/release.yml"]);
  });
});
