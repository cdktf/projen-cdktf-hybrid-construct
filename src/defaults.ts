/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { ConstructLibraryOptions } from "projen/lib/cdk";

const defaultOptions = {
  prettier: true,
  projenrcTs: true,
  defaultReleaseBranch: "main",
  sampleCode: false,
  mergify: false,
  jsiiVersion: ">=5.1.0",
};
// Ensure they match the parent option
export const defaults: Pick<
  ConstructLibraryOptions,
  keyof typeof defaultOptions
> = defaultOptions;
