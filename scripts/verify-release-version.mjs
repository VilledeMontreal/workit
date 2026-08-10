/*
 * Copyright (c) 2026 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const releaseTag = process.argv[2];
const tagMatch = /^v(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)$/.exec(releaseTag ?? '');

if (!tagMatch) {
  throw new Error(`Release tag must use the v<semver> format; received ${releaseTag ?? '<empty>'}`);
}

const releaseVersion = tagMatch[1];
const rootDirectory = resolve(fileURLToPath(new URL('..', import.meta.url)));
const rootPackage = JSON.parse(await readFile(resolve(rootDirectory, 'package.json'), 'utf8'));
const packageFiles = rootPackage.workspaces
  .filter((workspace) => workspace.startsWith('./packages/'))
  .map((workspace) => resolve(rootDirectory, workspace, 'package.json'));
const packages = await Promise.all(
  packageFiles.map(async (packageFile) => JSON.parse(await readFile(packageFile, 'utf8'))),
);
const publishablePackages = packages.filter((packageDefinition) => packageDefinition.private !== true);
const packageNames = new Set(publishablePackages.map((packageDefinition) => packageDefinition.name));
const errors = [];

for (const packageDefinition of publishablePackages) {
  if (packageDefinition.version !== releaseVersion) {
    errors.push(`${packageDefinition.name} has version ${packageDefinition.version}; expected ${releaseVersion}`);
  }

  for (const dependencyType of ['dependencies', 'peerDependencies', 'optionalDependencies']) {
    for (const [dependencyName, dependencyVersion] of Object.entries(packageDefinition[dependencyType] ?? {})) {
      if (packageNames.has(dependencyName) && dependencyVersion !== `^${releaseVersion}`) {
        errors.push(
          `${packageDefinition.name} declares ${dependencyName}@${dependencyVersion}; expected ^${releaseVersion}`,
        );
      }
    }
  }
}

if (errors.length > 0) {
  throw new Error(`Release version validation failed:\n- ${errors.join('\n- ')}`);
}

console.log(`Validated ${publishablePackages.length} packages for release ${releaseTag}.`);
