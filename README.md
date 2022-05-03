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

### Roadmap

- [x] Add dedicated file for HCL templates
- [x] Add example folder
- [x] Add `terraform` example folder
- [x] [Auto-generate parts of the docs](https://github.com/terraform-aws-modules/terraform-aws-eks/blob/e90c877a741ab3cc4215376a70f7bcc360b6a3d2/.github/workflows/pre-commit.yml)
- [x] Add example folder to project using this
- [x] Add testing strategy
- [ ] Add deployment scripts to Artifactory
- [ ] Add deployment scripts to Github Packages
- [ ] Add construct / option / docs to publish existing module as construct
- [ ] Add construct for managing multiple repos like this
- [ ] Add option to manager projen template to bootstrap cdktf app that deploys Artifactory?
