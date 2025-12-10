# The Future of Terraform CDK

## Sunset Notice

Terraform CDK (CDKTF) will sunset and be archived on December 10, 2025. HashiCorp, an IBM Company, will no longer maintain or develop the project after that date. Unfortunately, Terraform CDK did not find product-market fit at scale. HashiCorp, an IBM Company, has chosen to focus its investments on Terraform core and its broader ecosystem.

As of December 10, 2025, Terraform CDK will be archived on GitHub, and the documentation will reflect its deprecated status. The archived code will remain available on GitHub, but it will be read-only. No further updates, fixes, or improvements (including compatibility updates) will be made.

You will be able to continue to use Terraform CDK at your own risk. Terraform CDK is licensed under the Mozilla Public License (MPL). HashiCorp, an IBM Company, does not apply any additional restrictions. We encourage community forks if there’s interest in continuing development independently.

## Migration to HCL

You can use the following command to generate Terraform-compatible .tf files directly from your Terraform CDK project:

`cdktf synth --hcl`

This will produce readable HCL configuration files, making it easier to migrate away from Terraform CDK. After running the command, you can use standard Terraform CLI commands (`terraform init`, `terraform plan`, `terraform apply`) to continue managing your infrastructure. Please note that while this helps bootstrap your configuration, you may still need to review and adjust the generated files for clarity, organization, or best practices.

### Note on AWS CDK

If your infrastructure is defined in Terraform CDK but also tightly integrated with AWS CDK, you may find it more consistent to migrate directly to the AWS CDK ecosystem. If you are not using AWS CDK, we highly recommend migrating to standard Terraform and HCL for long-term support and ecosystem alignment.

## FAQ

Q: Is CDKTF still being developed?

A: No. CDKTF will sunset and be archived on December 10, 2025. HashiCorp, an IBM Company, will no longer maintain or develop the project after that date.

Q: Why is CDKTF being sunset?

A: CDKTF did not find product-market fit at scale. We’ve chosen to focus our investments on Terraform core and its broader ecosystem.

Q: Will CDKTF be removed from GitHub?

A: CDKTF will be archived on GitHub, and documentation will reflect its deprecated status.

Q: Can I still use CDKTF after it's sunset?

A: Yes, the archived code will remain available on GitHub, but it will be read-only. No further updates, fixes, or improvements will be made.

Q: Will CDKTF continue to support new versions of Terraform or providers?

A: No. Compatibility updates will not be made after the EOL date.

Q: Can I fork CDKTF and maintain it myself?

A: Yes. CDKTF is open source, and we encourage community forks if there’s interest in continuing development independently.

Q: Can I keep using CDKTF?

A: You may continue to use it at your own risk. HashiCorp, an IBM Company, will no longer be maintaining it.

Q: Is there a migration tool?

A: You can use the following command to generate Terraform-compatible .tf files directly from your CDKTF project:

`cdktf synth --hcl`

This will produce readable HCL configuration files, making it easier to migrate away from CDKTF. After running the command, you can use standard Terraform CLI commands (terraform init, terraform plan, terraform apply) to continue managing your infrastructure. Please note that while this helps bootstrap your configuration, you may still need to review and adjust the generated files for clarity, organization, or best practices.

Q: What migration guidance can we provide to customers?

A: For users looking to migrate away from CDKTF:

If your infrastructure is defined in CDKTF but also tightly integrated with AWS CDK, you may find it more consistent to migrate directly to the AWS CDK ecosystem.

If you are not using AWS CDK, we highly recommend migrating to standard Terraform and HCL for long-term support and ecosystem alignment.

---

# Projen-CDKTF-Hybrid-Construct

![Status: Tech Preview](https://img.shields.io/badge/status-experimental-EAAA32) [![Releases](https://img.shields.io/github/release/cdktf/projen-cdktf-hybrid-construct.svg)](https://github.com/cdktf/projen-cdktf-hybrid-construct/releases)
[![LICENSE](https://img.shields.io/github/license/cdktf/projen-cdktf-hybrid-construct.svg)](https://github.com/cdktf/projen-cdktf-hybrid-construct/blob/main/LICENSE)
[![build](https://github.com/cdktf/projen-cdktf-hybrid-construct/actions/workflows/build.yml/badge.svg)](https://github.com/cdktf/projen-cdktf-hybrid-construct/actions/workflows/build.yml)

Projen template for CDKTF Constructs that should also be used as Terraform Modules and for republishing Terraform Modules as Constructs.

_projen-cdktf-hybrid-construct_ is in technical preview, which means it's a community supported project. It still requires extensive testing and polishing to mature into a HashiCorp officially supported project. Please [file issues](https://github.com/cdktf/projen-cdktf-hybrid-construct/issues/new/choose) generously and detail your experience while using the library. We welcome your feedback.

By using the software in this repository, you acknowledge that: 
* _projen-cdktf-hybrid-construct_ is still in development, may change, and has not been released as a commercial product by HashiCorp and is not currently supported in any way by HashiCorp.
* _projen-cdktf-hybrid-construct_ is provided on an "as-is" basis, and may include bugs, errors, or other issues.
* _projen-cdktf-hybrid-construct_ is NOT INTENDED FOR PRODUCTION USE, use of the Software may result in unexpected results, loss of data, or other unexpected results, and HashiCorp disclaims any and all liability resulting from use of _projen-cdktf-hybrid-construct_.
* HashiCorp reserves all rights to make all decisions about the features, functionality and commercial release (or non-release) of _projen-cdktf-hybrid-construct_, at any time and without any obligation or liability whatsoever.

## Compatibility

- `cdktf` >= 0.21.0
- `constructs` >= 10.4.2
- `projen` >= 0.88.0

## Usage

### `HybridModule`

If you want to write a CDKTF construct and also publish it as a Terraform Module you can use the `HybridModule` template.

You can initialize such a project using `npx projen new --from projen-cdktf-hybrid-construct hybrid-module`.

A configuration might look like this:

```js
const { HybridModule } = require("projen-cdktf-hybrid-construct");

const project = new HybridModule({
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
          required_version = ">= 1.2.0"
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

You can initialize such a project using `npx projen new --from projen-cdktf-hybrid-construct terraform-module`.

A configutation might look like this:

```js
const { TerraformModule } = require("projen-cdktf-hybrid-construct");

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

## Publishing

### Open Source

We have a helper method for easy configuration, but there are still some manual steps required.

```js
const {
  HybridModule,
  publishToRegistries,
} = require("projen-cdktf-hybrid-construct");

const project = new HybridModule({
  // ... all the other options
  ...publishToRegistries({
    name: "my-new-hybrid-construct",
    namespace: "my-org",
    registries: ["npm", "pypi", "nuget", "maven"],
  }),
});
```

#### Terraform

1. [Sign in at the registry](https://registry.terraform.io/sign-in)
2. [Select your repository](https://registry.terraform.io/github/create) and create the module

Please make sure your repository name starts with `terraform-cdk-`.

#### npm (Typescript)

1. Create an account at [npmjs.com](https://npmjs.com/)
2. Create an [automation token](https://docs.npmjs.com/creating-and-viewing-access-tokens) on npm
3. Create a [GitHub Action Secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository) with the name `NPM_TOKEN` and the value of the token

#### pypi (Python)

1. Create an account at [pypi.org](https://pypi.org/)
2. Create an [API token](https://pypi.org/help/#apitoken) on pypi
3. Create a [GitHub Action Secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository) with the name `TWINE_USERNAME` and the value `__token__` and a second one with the name `TWINE_PASSWORD` and the value of the token
4. Set the `publishToPypi` section in the options of `HybridModule` or `TerraformModule` (or use the helper mentioned above)

```js
const name = "name-of-my-hybrid-construct";
new HybridModule({
  name,
  // ... other options
  publishToPypi: {
    distName: name,
    module: name.replace(/-/g, "_"),
  },
});
```

#### Maven (Java)

1. [Create a Sonatype account and repository](https://central.sonatype.org/publish/publish-guide/#introduction)
2. Create [GitHub Action Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository) to configure maven:
   - `MAVEN_USERNAME`
   - `MAVEN_PASSWORD`
   - `MAVEN_STAGING_PROFILE_ID`
   - `MAVEN_GPG_PRIVATE_KEY_PASSPHRASE`
   - `MAVEN_GPG_PRIVATE_KEY_PASSPHRASE`
3. Setup the `publishToMaven` section in the options of `HybridModule` or `TerraformModule` (or use the helper mentioned above)

```js
const githubNamespace = "my-org";
const name = "name-of-my-hybrid-construct";
new HybridModule({
  name,
  // ... other options
  publishToMaven: {
    javaPackage: name.replace(/-/g, "_"),
    mavenGroupId: `com.${githubNamespace}`,
    mavenArtifactId: name,
  },
});
```

#### NuGet (C#)

1. [Create a NuGet account](https://www.nuget.org/users/account/LogOn) (you might need to create a Microsoft Account if you don't have one)
2. [Create API keys](https://docs.microsoft.com/en-us/nuget/nuget-org/publish-a-package#create-api-keys)
3. Create a [GitHub Action Secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository) with the name `NUGET_API_KEY` and the value of the token
4. Setup the `publishToNuget` section in the options of `HybridModule` or `TerraformModule` (or use the helper mentioned above)

```js
const githubNamespace = "my-org";
const name = "name-of-my-hybrid-construct";

new HybridModule({
  name,
  // ... other options
  publishToNuget: {
    dotNetNamespace: `MyOrg.NameOfMyHybridConstruct`,
    packageId: `MyOrg.NameOfMyHybridConstruct`,
  },
});
```

### Github Packages

We have a helper method for easy configuration, no extra steps needed:

```js
const {
  HybridModule,
  publishToGithubPackages,
} = require("projen-cdktf-hybrid-construct");

const project = new HybridModule({
  // ... all the other options
  ...publishToGithubPackages({
    name: "my-new-hybrid-construct",
    namespace: "my-org",
    registries: ["npm", "maven"], // pypi and nuget are not yet supported
  }),
});
```

### Artifactory

We have a helper method for easy configuration, but there are also some manual steps required.

```js
const {
  HybridModule,
  publishToGithubPackages,
} = require("projen-cdktf-hybrid-construct");

const project = new HybridModule({
  // ... all the other options
  ...publishToGithubPackages({
    name: "my-new-hybrid-construct",
    namespace: "my-org",
    registries: ["npm", "pypi", "nuget"], // maven is currently not supported, PRs welcome
    artifactoryApiUrl: "https://artifactory.my-org.com/api/",
    artifactoryRepository: "my-repo", // needs to be the same across all registries, defaults to namespace so "my-org" in this case
  }),
});
```

#### Terraform

You can find more information about publishing Terraform Modules to Artifactory [here](https://www.jfrog.com/confluence/display/JFROG/Terraform+Registry#TerraformRegistry-SettingupaLocalModule/ProviderRegistry).

#### npm (Typescript)

1. [Create a virtual npm registry](https://www.jfrog.com/confluence/display/JFROG/npm+Registry#npmRegistry-VirtualnpmRegistry)
2. [Authenticate against artifactory to get a token](https://www.jfrog.com/confluence/display/JFROG/npm+Registry#npmRegistry-AuthenticatingthenpmClient)
3. Create a [GitHub Action Secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository) with the name `NPM_TOKEN` and the value of the token

#### pypi (Python)

1. Create a [local repository](https://www.jfrog.com/confluence/display/JFROG/PyPI+Repositories#PyPIRepositories-LocalRepositories)
2. Create a [GitHub Action Secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository) with the name `TWINE_USERNAME` and the artifactory user name and a second one with the name `TWINE_PASSWORD` and the artifactory password
