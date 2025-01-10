#!/bin/bash
# Copyright (c) HashiCorp, Inc.
# SPDX-License-Identifier: MPL-2.0

set -ex

PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE:-$0}")/.." && pwd)
CDKTF_VERSION=$1
CONSTRUCTS_VERSION=$2

if [ -z "$CDKTF_VERSION" ]; then
  echo "Usage: $0 <cdktf-version> <constructs-version>"
  exit 1
fi
if [ -z "$CONSTRUCTS_VERSION" ]; then
  echo "Usage: $0 <cdktf-version> <constructs-version>"
  exit 1
fi

echo "Updating self to constructs version $CONSTRUCTS_VERSION"
yarn
sed -i "s/constructsVersion = \".*\";/constructsVersion = \"$CONSTRUCTS_VERSION\";/" "$PROJECT_ROOT/.projenrc.ts"

echo "Updating /src to cdktf version $CDKTF_VERSION"
find ./src -type f -name "*.ts" -print0 | xargs -0 sed -i "s/const cdktfVersion = options.cdktfVersion || \".*\"/const cdktfVersion = options.cdktfVersion || \"$CDKTF_VERSION\"/"
# @TODO This is a hack and will stop working when CDKTF goes 1.0
find ./src -type f -name "*.ts" -print0 | xargs -0 sed -i "s/@default \"0\..*\"/@default \"$CDKTF_VERSION\"/"

echo "Updating /src to constructs version $CONSTRUCTS_VERSION"
find ./src -type f -name "*.ts" -print0 | xargs -0 sed -i "s/const constructVersion = options.constructVersion || \".*\"/const constructVersion = options.constructVersion || \"$CONSTRUCTS_VERSION\"/"
# @TODO This is also a hack ... but it works
find ./src -type f -name "*.ts" -print0 | xargs -0 sed -i "s/@default \"^.*\"/@default \"^$CONSTRUCTS_VERSION\"/"

echo "Updating README"
sed -i 's/`cdktf` >= .*/`cdktf` >= '"$CDKTF_VERSION"'/' "$PROJECT_ROOT/README.md"
sed -i 's/`constructs` >= .*/`constructs` >= '"$CONSTRUCTS_VERSION"'/' "$PROJECT_ROOT/README.md"

npx projen build

echo "Updating examples"
# Loop through all examples and update the cdktf version
for example in $(find "$PROJECT_ROOT/examples" -mindepth 1 -maxdepth 1 -type d); do
  echo "Updating example $example"
  cd "$example"
  yarn
  sed -i "s/cdktfVersion: \".*\",/cdktfVersion: \"$CDKTF_VERSION\",/" ./.projenrc.ts
  CI=0 npx projen
done

echo "Done"
