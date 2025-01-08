#!/bin/bash
# Copyright (c) HashiCorp, Inc.
# SPDX-License-Identifier: MPL-2.0

set -ex

PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE:-$0}")/.." && pwd)
NEW_VERSION=$1

if [ -z "$NEW_VERSION" ]; then
  echo "Usage: $0 <projen-version>"
  exit 1
fi

echo "Updating Projen version to $NEW_VERSION"
yarn
sed -i "s/projenVersion = \".*\";/projenVersion = \"$NEW_VERSION\";/" "$PROJECT_ROOT/.projenrc.ts"
CI=0 npx projen
CI=0 npx projen build

echo "Updating README"
sed -i 's/`projen` >= .*/`projen` >= '"$CDKTF_VERSION"'/' "$PROJECT_ROOT/README.md"

echo "Done"
