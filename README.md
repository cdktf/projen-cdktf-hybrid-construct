# Projen-CDKTF-Hybrid-Construct

Projen template for CDKTF Constructs that should also be used as Terraform Modules.

## Usage

```bash
mkdir my-new-hybrid-construct
cd my-new-hybrid-construct
npx projen typescript
npm install projen-cdktf-hybrid-construct
```

Edit the `.projenrc.ts`:

### `HybridModule`

If you want to write a CDKTF construct and also publish it as a Terraform Module you can use the `HybridModule` template.

```js
const { HybridModule } = require("projen-cdktf-hybrid-construct");

const project = new HybridModule({
  defaultReleaseBranch: "main",
  // The name of the module & repository need to start with terraform-cdk-
  name: "terraform-cdk-my-new-hybrid-construct",
  repositoryUrl:
    "github.com/DanielMSchmidt/terraform-cdk-my-new-hybrid-construct",

  author: "Daniel Schmidt",
  authorAddress: "danielmschmidt92@gmail.com",

  // If enabled an example folder with terraform code will be created
  terraformExamples: {
    enabled: true,
    folder: "terraform",
    // The configuration to add to the example terraform file
    providerConfig: `
        terraform {
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

  // If enabled a constructs example folder will be created
  constructExamples: {
    enabled: true,
    folder: "construct-examples",
  },
});
project.synth();
```

### `TerraformModule`

If you want to republish an existing Terraform module as a CDKTF construct or if you want to repackage them with an easier to use API you can use the `TerraformModule` template.

```js
const { HybridModule } = require("projen-cdktf-hybrid-construct");

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
      source: "terraform-aws-modules/eks/aws//modules/eks-managed-node-group",
      version: "~> 18.0",
    },
  ],
});

project.synth();
```

### Roadmap

- [x] Add dedicated file for HCL templates
- [x] Add example folder
- [x] Add `terraform` example folder
- [x] [Auto-generate parts of the docs](https://github.com/terraform-aws-modules/terraform-aws-eks/blob/e90c877a741ab3cc4215376a70f7bcc360b6a3d2/.github/workflows/pre-commit.yml)
- [x] Add example folder to project using this
- [x] Add testing strategy
- [ ] Add deployment scripts to Artifactory
- [ ] Add deployment scripts to Github Packages
- [x] Add construct / option / docs to publish existing module as construct
- [ ] Add construct for managing multiple repos like this
- [ ] Add option to manager projen template to bootstrap cdktf app that deploys Artifactory?
