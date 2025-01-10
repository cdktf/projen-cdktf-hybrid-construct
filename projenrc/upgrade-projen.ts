/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { javascript } from "projen";
import { JobPermission } from "projen/lib/github/workflows-model";

/**
 * Runs monthly to upgrade Projen. Since Projen is a peer dependency for this
 * project, it's not updated through the usual upgrade-main workflow.
 */
export class UpgradeProjen {
  constructor(project: javascript.NodeProject) {
    const workflow = project.github?.addWorkflow("upgrade-projen");
    if (!workflow) throw new Error("no workflow defined");

    workflow.on({
      schedule: [{ cron: "13 2 10 */2 *" }], // Runs every other month
      workflowDispatch: {}, // allow manual triggering
    });

    (workflow.concurrency as any) = {
      group: "${{ github.workflow }}-${{ github.ref }}",
    };

    workflow.addJobs({
      upgrade: {
        name: "Upgrade Projen",
        runsOn: ["ubuntu-latest"],
        steps: [
          {
            name: "Checkout",
            uses: "actions/checkout@v3",
          },
          {
            name: "Setup Terraform",
            uses: "hashicorp/setup-terraform",
            with: {
              terraform_wrapper: false,
            },
          },
          {
            name: "Setup Node.js",
            uses: "actions/setup-node@v3",
          },
          {
            name: "Install",
            run: "yarn install",
          },
          {
            name: "Get latest Projen version",
            id: "latest_version",
            run: [
              `NEW_VERSION=$(yarn info projen --json | jq -r '.data.version')`,
              `NEW_VERSION_SHORT=$(cut -d "." -f 1,2 <<< "$NEW_VERSION")`,
              `echo "value=$NEW_VERSION" >> $GITHUB_OUTPUT`,
              `echo "short=$NEW_VERSION_SHORT" >> $GITHUB_OUTPUT`,
            ].join("\n"),
            // IMPORTANT: the above behavior changed in Yarn 2+; `yarn info` instead gives the version of the installed package
            // If/when we upgrade we'll likely want to switch to `yarn npm info`: https://yarnpkg.com/cli/npm/info
          },
          {
            name: "Run upgrade script",
            run: "scripts/update-projen.sh ${{ steps.latest_version.outputs.value }}",
          },
          {
            name: "Create Pull Request",
            uses: "peter-evans/create-pull-request@v3",
            with: {
              "commit-message":
                "chore(deps)!: increase minimum required version of Projen to ${{ steps.latest_version.outputs.short }}",
              branch:
                "auto/upgrade-projen-${{ steps.latest_version.outputs.short }}",
              base: "main",
              title:
                "chore(deps)!: increase minimum required version of Projen to ${{ steps.latest_version.outputs.short }}",
              body: [
                "This PR increases the version of Projen to `>= ${{ steps.latest_version.outputs.value }}`, ",
                "which is currently the latest version available. This script runs once per month.",
              ].join(" "),
              labels: "auto-approve,automerge,automated",
              token: "${{ secrets.PROJEN_GITHUB_TOKEN }}",
              author: "team-tf-cdk <github-team-tf-cdk@hashicorp.com>",
              committer: "team-tf-cdk <github-team-tf-cdk@hashicorp.com>",
              signoff: true,
              "delete-branch": true,
            },
          },
        ],
        env: {
          CI: "true",
          CHECKPOINT_DISABLE: "1",
        },
        permissions: {
          contents: JobPermission.READ,
        },
      },
    });
  }
}
