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
  name: "my-new-hybrid-construct",

  // All options available in the Projen Typescript template
  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();
```

### Requirements

- `terraform`
- `node`
- `cdktf-cli`
- [`terraform-docs`](https://terraform-docs.io/user-guide/installation/) or docker

### Roadmap

- [x] Add dedicated file for HCL templates
- [x] Add example folder
- [x] Add `terraform` example folder
- [x] [Auto-generate parts of the docs](https://github.com/terraform-aws-modules/terraform-aws-eks/blob/e90c877a741ab3cc4215376a70f7bcc360b6a3d2/.github/workflows/pre-commit.yml)
- [ ] Add testing strategy
- [ ] Add deployment scripts to Artifactory
- [ ] Add deployment scripts to Github Packages
- [ ] Add construct / option / docs to publish existing module as construct
- [ ] Add construct for managing multiple repos like this
- [ ] Add option to manager projen template to bootstrap cdktf app that deploys Artifactory?
