# Maintenance Guide

This document is intended for maintainers of this repository and outlines how to perform various maintenance-related activities, including descriptions of what processes are currently automated and which are not (yet).

This repository contains extensive GitHub Actions [workflows](https://github.com/cdktf/projen-cdktf-hybrid-construct/tree/main/.github/workflows) that automate as much of the project's lifecycle as possible. The project is built using [Projen](https://projen.io/) and as such **these workflows should not be edited directly**. Their sources can be found in the [`.projenrc/`](https://github.com/cdktf/projen-cdktf-hybrid-construct/tree/main/projenrc) directory, and new workflows are added to the project in [`.projenrc.ts`](https://github.com/cdktf/projen-cdktf-hybrid-construct/blob/main/.projenrc.ts).

This project is considered experimental, and does not offer any support or maintenance guarantees.


## Prerequisites & Gotchas

This projects works a little bit differently than our other construct libraries and there are a couple of quirks worth calling attention to:

- This library generates two custom Projen templates, the source of which lives in [`src/hybrid-module.ts`](https://github.com/cdktf/projen-cdktf-hybrid-construct/blob/main/src/hybrid-module.ts) and [`src/terraform-module.ts`](https://github.com/cdktf/projen-cdktf-hybrid-construct/blob/main/src/terraform-module.ts). Depending on what type of maintenance you're doing, you may also need to make changes to these Projen configurations _in addition to_ making changes to [`.projenrc.ts`](https://github.com/cdktf/projen-cdktf-hybrid-construct/blob/main/.projenrc.ts) like you're probably used to by now.
- Because of the above, you typically need to run `npx projen build` in addition to `npx projen` when making changes.
- All builds require an active Docker container to be running. If you're doing local development, you'll want to have Docker Desktop open in the background (if that's not something you normally have set up), otherwise the builds will fail.


## Security & Dependency Management

Dependency upgrades (for security purposes as well as a best practice) can be divided into three categories: fully-automated, semi-automated, and not automated.

### Fully Automated

The following Actions exist to automate various dependency upgrades:

- [upgrade-jsii-typescript](https://github.com/cdktf/projen-cdktf-hybrid-construct/actions/workflows/upgrade-jsii-typescript.yml): This is a custom workflow (source [here](https://github.com/cdktf/projen-cdktf-hybrid-construct/blob/main/projenrc/upgrade-jsii-typescript.ts)) that checks the [JSII support timeline](https://github.com/aws/jsii-compiler/blob/main/README.md#gear-maintenance--support) daily via [this](https://github.com/cdktf/projen-cdktf-hybrid-construct/blob/main/scripts/check-jsii-versions.js) script to see if the current version is less than 30 days away from EOS, and if so, creates a PR upgrading to the next supported version. The code for the upgrade itself lives in [this](https://github.com/cdktf/projen-cdktf-hybrid-construct/blob/main/scripts/update-jsii-typescript.sh) script. This process is 100% automated; as long as the build succeeds and any tests pass, the PR will be automatically merged without any human intervention.
  - This workflow can also be manually triggered, optionally taking a hard-coded JSII/TypeScript version as input in case we ever want to upgrade to a newer version without waiting until the old one is less than 30 days away from EOS.
- [upgrade-main](https://github.com/cdktf/projen-cdktf-hybrid-construct/actions/workflows/upgrade-main.yml): This is a Projen built-in/default workflow that handles automated dependency updates. It currently runs on a weekly basis, which can be configured [here](https://github.com/cdktf/projen-cdktf-hybrid-construct/blob/4ea42f59370a23fbdc5d3acd6f3a08a7f6dfd254/.projenrc.ts#L54). This process is 100% automated; as long as the build succeeds and any tests pass, the PR that is generated will be automatically merged without any human intervention.
- [upgrade-projen](https://github.com/cdktf/projen-cdktf-hybrid-construct/actions/workflows/upgrade-projen.yml): This is a custom workflow (source [here](https://github.com/cdktf/projen-cdktf-hybrid-construct/blob/main/projenrc/upgrade-projen.ts)) that updates Projen itself. Because Projen is a peer dependency for this project, the `upgrade-main` workflow above will _never_ increment its version. This custom workflow currently runs every other month because we needed to find the delicate balance between not falling too far behind on Projen updates (because otherwise upgrading Projen can become a painful process), while respecting that doing so is technically a breaking change for any consumers of this library (because they may be forced to upgrade their version of Projen used), so we don't want to do it too often. The code for the upgrade itself lives in [this](https://github.com/cdktf/projen-cdktf-hybrid-construct/blob/main/scripts/update-projen.sh) script.

Dependabot is also [configured](https://github.com/cdktf/projen-cdktf-hybrid-construct/blob/main/.github/dependabot.yml) to check for new security updates daily and, if found, make changes to the lockfile only. This is because Dependabot can sometimes address security issues in dependencies more quickly than Projen due to its atomic nature. While you could tweak the Dependabot settings, note that Projen and Dependabot do not generally play nicely together; in particular, Dependabot cannot make changes to `package.json` because Projen would just override these changes (hence the reason why Dependabot is currently limited to lockfile-only). If you wanted to fully automate dependency management using Dependabot, you would want to disable Projen's [automatic updates](https://projen.io/docs/api/typescript#projen.typescript.TypeScriptProjectOptions.property.depsUpgrade).

### Semi-Automated

The following Actions either need to be manually triggered or require significant manual effort as part of the upgrade process:

- [upgrade-cdktf](https://github.com/cdktf/projen-cdktf-hybrid-construct/actions/workflows/upgrade-cdktf.yml): This is a custom workflow (source [here](https://github.com/cdktf/projen-cdktf-hybrid-construct/blob/main/projenrc/upgrade-cdktf.ts)) that runs four times a day and checks whether there is a new minor version of CDKTF itself (e.g. `0.19`, `0.20`, `0.21`, etc.), using the latest version published to npm as the source of truth. If a new version is found, it runs [this](https://github.com/cdktf/projen-cdktf-hybrid-construct/blob/main/scripts/update-cdktf.sh) script to update the CDKTF version in all the right places, and then it creates a draft PR. The reason for the draft status is because a few steps related to the upgrade cannot be automated and must be done manually by an engineer; these are outlined step-by-step in the PR body. Once the steps are completed, the PR can be marked as ready for review & approved in order to complete the upgrade.

### Not Automated

- **GitHub Actions version pinning**: Because this project leverages Projen, HashiCorp Security's [tsccr-helper](https://github.com/hashicorp/security-tsccr?tab=readme-ov-file#tsccr-helper-cli) CLI and other tooling cannot be used to manage/upgrade GitHub Actions versions. Instead, we have consolidated all of the versions into a single [object](https://github.com/cdktf/projen-cdktf-hybrid-construct/blob/4ea42f59370a23fbdc5d3acd6f3a08a7f6dfd254/.projenrc.ts#L21-L32) in code that must be manually updated. Historically, one of the maintainers has followed these manual steps on a roughly monthly basis:
  1. Look up the latest supported versions [here](https://github.com/hashicorp/security-tsccr/tree/main/components/github_actions)
  2. Update the [object](https://github.com/cdktf/projen-cdktf-hybrid-construct/blob/4ea42f59370a23fbdc5d3acd6f3a08a7f6dfd254/.projenrc.ts#L21-L32)
  3. Run `npx projen`
  4. Create a new PR with the title `chore(deps): update pinned versions of GitHub Actions`

Also worth noting: Unlike many of our other Projen-based projects, this one does not have a script that automatically upgrades Node.js because this library does not enforce a `minNodeVersion`. If we did at some point want to start enforcing a `minNodeVersion`, we should copy over the `upgrade-node` script that our other Projen projects use.


## Releasing

Releases are fully automated by Projen and require no manual intervention whatsoever. In general, this repository is configured to publish a new release for each pull request that gets merged. The only way to force it to create one release that combines multiple merged PRs is to ensure that all of these PRs get merged into `main` at exactly the same time. The new version number is automatically calculated by Projen using [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) and [Semantic Versioning](https://semver.org/).

If you wanted to change the logic that governs when releases are triggered (such as running them on a schedule, or only for certain types of commits), see Projen's [documentation](https://projen.io/docs/publishing/releases-and-versioning) on this subject.

### Package Managers

This library is currently published to these package managers:

- **npm**: The package is called [projen-cdktf-hybrid-construct](https://www.npmjs.com/package/projen-cdktf-hybrid-construct), and publishing is done using an access token associated with the shared [cdktf-team](https://www.npmjs.com/~cdktf-team) account. Credentials to access this account can be found in the CDK for Terraform Team 1Password Vault.
