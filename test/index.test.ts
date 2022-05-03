import { HybridModule } from "../src/index";
import { synthSnapshot } from "./helper";

describe("HybridModule", () => {
  it("snapshot", () => {
    const project = new HybridModule({
      name: "my-module",
      author: "Daniel Schmidt",
      defaultReleaseBranch: "main",
      authorAddress: "danielmschmidt92@gmail.com",
      repositoryUrl: "github.com/DanielMSchmidt/my-module",
      terraformExamples: {
        enabled: true,
        folder: "terraform",
        providerConfig: `
        terraform {
          # Limit provider version (some modules are not compatible with aws 4.x)
          required_providers {
            aws = {
              source  = "hashicorp/aws"
              version = "~> 3.74"
            }
          }
          # Terraform binary version constraint
          required_version = "~> 1.1.0"
        }
        
        
        provider "aws" {
          region = "eu-central-1"
        }
        `,
      },
      constructExamples: {
        enabled: true,
        folder: "construct-examples",
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
