/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { HybridModule } from "../../lib";

const project = new HybridModule({
  prettier: true,
  projenrcTs: true,
  defaultReleaseBranch: "main",
  name: "my-module",
  author: "Daniel Schmidt",
  authorAddress: "danielmschmidt92@gmail.com",
  repositoryUrl: "github.com/DanielMSchmidt/my-module",
  cdktfVersion: "0.20.0",
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
      required_version = ">= 1.2.0"
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
