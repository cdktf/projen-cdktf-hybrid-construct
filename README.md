# Projen-CDKTF-Hybrid-Construct

Projen template for CDKTF Constructs that should also be used as Terraform Modules.

## Usage

```bash
mkdir my-new-hybrid-construct
cd my-new-hybrid-construct
npx projen typescript
npm install projen-cdktf-hybrid-construct
```

Edit the `.projenrc.js`:

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

### Roadmap

- [ ] Add example folder
- [ ] Add dedicated file for HCL templates
- [ ] Remove release process inherited from the JSII project
- [ ] Add deployment scripts to Artifactory
- [ ] Add deployment scripts to Github Packages
- [ ] Add construct for managing multiple repos like this
