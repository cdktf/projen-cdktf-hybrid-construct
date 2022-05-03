import { HybridModule } from "../lib";

const project = new HybridModule({
  name: "my-module",
  author: "Daniel Schmidt",
  repository: "github.com/DanielMSchmidt/my-module",
  defaultReleaseBranch: "main",
  authorAddress: "danielmschmidt92@gmail.com",
  repositoryUrl: "github.com/DanielMSchmidt/my-module",
  outdir: ".",
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
  projectId: "my-project-id",
});
project.gitignore.addPatterns("lib/");
project.synth();
