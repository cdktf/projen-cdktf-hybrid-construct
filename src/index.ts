import { FileBase, IResolver, Project, SampleDir } from "projen";
import { ConstructLibrary, ConstructLibraryOptions } from "projen/lib/cdk";

type HybridModuleOptions = ConstructLibraryOptions & {
  cdktfVersion?: string;
  constructVersion?: string;
  repository: string;
  author: string;
};

const defaults = {
  prettier: true,
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
    super({ ...defaults, ...config, sampleCode: false });
    const constructVersion = config.constructVersion || "^10.0.25";
    const cdktfVersion = config.cdktfVersion || "^0.9.4";

    this.addPeerDeps(`constructs@${constructVersion}`, `cdktf@${cdktfVersion}`);
    this.addDevDeps(`cdktf-cli@${cdktfVersion}`, "ts-node");
    this.addKeywords("cdktf", "cdktf-hybrid");

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

    this.gitignore.addPatterns("src/.gen", "src/cdktf.out", "src/modules");
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
  }
}
