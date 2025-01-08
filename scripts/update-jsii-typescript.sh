#!/bin/bash
# Copyright (c) HashiCorp, Inc.
# SPDX-License-Identifier: MPL-2.0

set -ex

PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE:-$0}")/.." && pwd)
NEW_VERSION=$1

if [ -z "$NEW_VERSION" ]; then
  echo "Usage: $0 <typescript-version>"
  exit 1
fi

echo "Updating JSII & TypeScript version to $NEW_VERSION"
yarn
sed -i "s/typescriptVersion = \".*\";/typescriptVersion = \"~$NEW_VERSION\";/" "$PROJECT_ROOT/.projenrc.ts"
CI=0 npx projen
sed -i "s/typescriptVersion: \".*\",/typescriptVersion: \"~$NEW_VERSION\",/" "$PROJECT_ROOT/src/hybrid-module.ts"
sed -i "s/jsiiVersion: \".*\",/jsiiVersion: \"~$NEW_VERSION\",/" "$PROJECT_ROOT/src/hybrid-module.ts"
sed -i "s/typescriptVersion: \".*\",/typescriptVersion: \"~$NEW_VERSION\",/" "$PROJECT_ROOT/src/terraform-module.ts"
sed -i "s/jsiiVersion: \".*\",/jsiiVersion: \"~$NEW_VERSION\",/" "$PROJECT_ROOT/src/terraform-module.ts"
CI=0 npx projen build

echo "Done"
