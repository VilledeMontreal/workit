/*
 * Copyright (c) 2026 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const requestedVersion = process.argv[2];
const isDryRun = process.argv.includes('--dry-run');
const versionMatch = /^(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)$/.exec(requestedVersion ?? '');

if (!versionMatch) {
  throw new Error(`Version must use the <semver> format; received ${requestedVersion ?? '<empty>'}`);
}

const releaseVersion = versionMatch[1];
const rootDirectory = resolve(fileURLToPath(new URL('..', import.meta.url)));
const rootPackage = JSON.parse(await readFile(resolve(rootDirectory, 'package.json'), 'utf8'));
const workspacePaths = rootPackage.workspaces.filter((workspace) => workspace.startsWith('./packages/'));
const packages = await Promise.all(
  workspacePaths.map(async (workspace) => {
    const packageFile = resolve(rootDirectory, workspace, 'package.json');
    const source = await readFile(packageFile, 'utf8');
    return {
      workspace,
      packageFile,
      indentation: source.includes('\n\t"') ? '\t' : '  ',
      definition: JSON.parse(source),
    };
  }),
);
const publishablePackages = packages.filter(({ definition }) => definition.private !== true);
const packageNames = new Set(publishablePackages.map(({ definition }) => definition.name));

for (const { definition } of publishablePackages) {
  definition.version = releaseVersion;
  for (const dependencyType of ['dependencies', 'peerDependencies', 'optionalDependencies']) {
    for (const dependencyName of Object.keys(definition[dependencyType] ?? {})) {
      if (packageNames.has(dependencyName)) {
        definition[dependencyType][dependencyName] = `^${releaseVersion}`;
      }
    }
  }
}

const lockFile = resolve(rootDirectory, 'package-lock.json');
const lockDefinition = JSON.parse(await readFile(lockFile, 'utf8'));
for (const { workspace } of publishablePackages) {
  const lockPackage = lockDefinition.packages[workspace.replace(/^\.\//, '')];
  if (!lockPackage) {
    throw new Error(`Missing ${workspace} entry in package-lock.json`);
  }
  lockPackage.version = releaseVersion;
  for (const dependencyType of ['dependencies', 'peerDependencies', 'optionalDependencies']) {
    for (const dependencyName of Object.keys(lockPackage[dependencyType] ?? {})) {
      if (packageNames.has(dependencyName)) {
        lockPackage[dependencyType][dependencyName] = `^${releaseVersion}`;
      }
    }
  }
}

if (!isDryRun) {
  await Promise.all([
    ...publishablePackages.map(({ packageFile, indentation, definition }) =>
      writeFile(packageFile, `${JSON.stringify(definition, null, indentation)}\n`),
    ),
    writeFile(lockFile, `${JSON.stringify(lockDefinition, null, 2)}\n`),
  ]);
}

const action = isDryRun ? 'Would update' : 'Updated';
console.log(`${action} ${publishablePackages.length} packages and internal dependencies to ${releaseVersion}.`);
