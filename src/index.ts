import { FileBase, IResolver, Project, SampleDir, YamlFile } from "projen";
import { ConstructLibrary, ConstructLibraryOptions } from "projen/lib/cdk";

type TerraformProviderAwsConfig = {
  region: string;
  requiredProviderVersion: string;
};

type TerraformProviderAzureConfig = {
  location: string;
  requiredProviderVersion: string;
  resourceGroupName: string;
};

type HybridModuleOptions = ConstructLibraryOptions & {
  cdktfVersion?: string;
  constructVersion?: string;
  repository: string;
  author: string;
  terraformExamplesFolder: string;
  terraformProvider: string;
  terraformProviderAwsConfig?: TerraformProviderAwsConfig;
  terraformProviderAzureConfig?: TerraformProviderAzureConfig;
  // Run pre-commit hooks using local binaries / not at all
  documentationPrecommitHook?: boolean;
  documentationPrecommitHookOptions?: {
    version?: string; // Get the latest from: https://github.com/antonbabenko/pre-commit-terraform/releases
    disableFormatHook?: boolean;
    disableDocsHook?: boolean;
  };
  additionalPrecommitHooks?: Record<string, any>[];
};

const defaults = {
  prettier: true,
  projenrcTs: true,
  defaultReleaseBranch: "main",
};

const constructSrcCode = `
import { Construct } from "constructs";

export interface MyConstructOptions {
  readonly propertyA: string;
}

export class MyConstruct extends Construct {
  constructor(scope: Construct, id: string, public config: MyConstructOptions) {
    super(scope, id);
  }
}
`;

const moduleSrcCode = `
import { App } from "cdktf";
import { Construct } from "constructs";
import { TFModuleStack } from "cdktf-tf-module-stack";
import { MyConstruct } from "./index";

class MyAwesomeModule extends TFModuleStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new MyConstruct(this, "my-construct", {
      propertyA: "valueA",
    });
  }
}

const app = new App();
// This is the name the module can be found under. 
// We expect a "my-awesome-module.md" file in this directory.
// The README.md file will be generated from this file.
new MyAwesomeModule(app, "my-awesome-module");
app.synth();
`;

const terraformAwsMainSrcCode = `
terraform {
  # Limit provider version (some modules are not compatible with aws 4.x)
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> __requiredProviderVersion__"
    }
  }
  # Terraform binary version constraint
  required_version = "~> 1.1.0"
}


provider "aws" {
  region = "__region__"
}
`;

const terraformAzureMainSrcCode = `
# Configure the Azure provider
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> __requiredProviderVersion__"
    }
  }

  required_version = ">= 1.1.0"
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "rg" {
  name     = "__resourceGroupName__"
  location = "__location__"
}
`;

const terraformMainSrcCodeMap: { [key: string]: { srcCode: string } } = {
  aws: {
    srcCode: terraformAwsMainSrcCode,
  },
  azure: {
    srcCode: terraformAzureMainSrcCode,
  },
};

const terraformReadmeDocs = `
# Please add here some pure HCL tests for your modules in order to test HCL Interoperability

Examples:

module "my_awesome_test" {
  source = "../modules/my-awesome-modules"
  ...variables...
}
    `;

class ScriptFile extends FileBase {
  constructor(project: Project, path: string, private content: string) {
    super(project, path, {
      executable: true,
    });
  }

  protected synthesizeContent(_: IResolver): string | undefined {
    return this.content;
  }
}

export class HybridModule extends ConstructLibrary {
  constructor(config: HybridModuleOptions) {
    super({
      ...defaults,
      ...config,
      sampleCode: false,
      eslintOptions: Object.assign({}, config.eslintOptions, {
        lintProjenRc: false,
      }),
    });
    const constructVersion = config.constructVersion || "^10.0.25";
    const cdktfVersion = config.cdktfVersion || "^0.9.4";

    this.addPeerDeps(`constructs@${constructVersion}`, `cdktf@${cdktfVersion}`);
    this.addDevDeps(`cdktf-cli@${cdktfVersion}`, "ts-node");
    this.addKeywords("cdktf", "cdktf-hybrid");
    this.setScript("terraform:test", "./scripts/tf-module-test.sh");

    // Module Entrypoint
    this.addDeps("cdktf-tf-module-stack");
    const moduleDocs = `
# My Awesome Module

## Usage

\`\`\`hcl
module "eks_managed_node_group" {
  source = "${
    config.repository
      ?.replace("https://github.com/", "")
      .replace("http://github.com/", "")
      .replace("github.com/", "") || "my-github-repo"
  }//modules/my-awesome-module"

}
\`\`\`
    `;

    new SampleDir(this, this.srcdir, {
      files: {
        "index.ts": constructSrcCode.trim(),
        "tfModules.ts": moduleSrcCode.trim(),
        "my-awesome-module.md": moduleDocs.trim(),
        "cdktf.json": JSON.stringify(
          {
            language: "typescript",
            app: "npx ts-node tfModules.ts",
            terraformProviders: ["hashicorp/null@3.1.1"], // We need at least a provider for get to succeed
            terraformModules: [],
            output: "modules",
          },
          null,
          2
        ),
      },
    });

    // Retrieve correct TF main stuff
    let mainTfFile =
      terraformMainSrcCodeMap[config.terraformProvider].srcCode.trim();

    let configProperty: any = {};
    switch (config.terraformProvider) {
      case "aws": {
        configProperty = config.terraformProviderAwsConfig;
        break;
      }
      case "azure": {
        configProperty = config.terraformProviderAzureConfig;
        break;
      }
      default: {
        throw new Error(
          "Need to define correctly a Provider, only [aws,azure,gcp] allowed"
        );
      }
    }

    Object.keys(configProperty).forEach((key: string) => {
      mainTfFile = mainTfFile.replace(`__${key}__`, configProperty[key]);
    });

    new SampleDir(this, config.terraformExamplesFolder, {
      files: {
        "main.tf": mainTfFile,
        "README.md": terraformReadmeDocs.trim(),
      },
    });

    this.gitignore.addPatterns("src/.gen", "src/cdktf.out", "src/modules");
    this.gitignore.addPatterns(
      `${config.terraformExamplesFolder}/.terraform`,
      `${config.terraformExamplesFolder}/.terraform.lock.hcl`
    );
    this.compileTask.prependExec("cdktf get", {
      cwd: this.srcdir,
    });
    this.compileTask.exec("cdktf synth", {
      cwd: this.srcdir,
      name: "Synthesize module HCL",
    });

    new ScriptFile(
      this,
      "scripts/copy-modules.sh",
      `
#!/bin/bash
# This script is created by projen, do not edit it directly.
set -e

SCRIPTPATH="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"

# check if the module folder has been generated as expected
MODULES_FOLDER=$( cd -- "$SCRIPTPATH/../src/modules/stacks" >/dev/null 2>&1 ; pwd -P )
SRC_FOLDER=$( cd -- "$SCRIPTPATH/../src/" >/dev/null 2>&1 ; pwd -P )
TARGET_FOLDER="$SCRIPTPATH/../modules"

if [ ! -d "$MODULES_FOLDER" ]; then
  echo "Expected module folder to exist at $MODULES_FOLDER"
  exit 1
fi

cd "$MODULES_FOLDER"
for d in */ ; do
    [ -L "\${d%/}" ] && continue

    dirname="\${d%/}"


    # Check if everything is in place
    if [ ! -f "$MODULES_FOLDER/$dirname/cdk.tf.json" ]; then
      echo "Expected code for $dirname at cdk.tf.json to exist at $MODULES_FOLDER/$dirname"
      exit 1
    fi

    if [ ! -f "$SRC_FOLDER/$dirname.md" ]; then
      echo "Expected Documentation for $dirname at $dirname.md to exist at $SRC_FOLDER/$dirname.md"
      exit 1
    fi

    # Copy module and readme together
    echo "Copying Code and README for module $dirname"
    mkdir -p "$TARGET_FOLDER"
    mkdir -p "$TARGET_FOLDER/$dirname"
    cp "$MODULES_FOLDER/$dirname/cdk.tf.json" "$TARGET_FOLDER/$dirname/cdk.tf.json"
    cp "$SRC_FOLDER/$dirname.md" "$TARGET_FOLDER/$dirname/README.md"
done
`.trim()
    );
    this.compileTask.exec("./scripts/copy-modules.sh", {
      name: "Copy HCL Modules",
    });

    // ignore dist in tests
    this.jest?.addIgnorePattern("dist");

    new ScriptFile(
      this,
      "./scripts/tf-module-test.sh",
      `
#!/bin/bash
# This script is created by projen, do not edit it directly.
set -e

terraform -chdir=terraform init --upgrade
terraform -chdir=terraform fmt
terraform -chdir=terraform validate
terraform -chdir=terraform plan     
        `
    );

    this.testTask.exec("./scripts/tf-module-test.sh");
    this.jest?.addIgnorePattern("terraform");

    // Pre-commit hooks
    if (config.documentationPrecommitHook !== false) {
      const { additionalPrecommitHooks, documentationPrecommitHookOptions } =
        config;
      const {
        version = "v1.70.1",
        disableDocsHook = false,
        disableFormatHook = false,
      } = documentationPrecommitHookOptions || {};

      new YamlFile(this, ".pre-commit-config.yml", {
        committed: true,
        obj: {
          repos: [
            {
              repo: "git://github.com/antonbabenko/pre-commit-terraform",
              rev: version,
              hooks: [
                disableFormatHook ? null : { id: "terraform_fmt" },
                disableDocsHook ? null : { id: "terraform_docs" },
              ].filter((item) => item !== null),
            },
            ...(additionalPrecommitHooks ?? []),
          ],
        },
      });

      this.tasks.addTask("precommit", {
        description: "Runs precommit hooks",
        exec: "pre-commit install",
      });
    }
  }
}
