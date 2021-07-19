import semver from 'semver';

import type { Module, PackageAfterDetermineVersion } from '../../types';

import { logger } from '../../helpers/logger';
import { getReleasablePackages } from './get-releasable-packages';
import { clone } from 'ramda';

const { error, log } = logger('[analysis] adapt dependencies');

export const adaptDependencies: Module = (env) => {
  if (!env.packages) {
    const errorMessage = 'missing "packages" on env object.';
    error(errorMessage);
    throw new Error(errorMessage);
  }
  const clonePackages = clone(
    env.packages as Record<string, PackageAfterDetermineVersion>
  );

  log('analyse affected packages');
  const releasablePackages = getReleasablePackages(clonePackages);
  log(
    `${Object.keys(releasablePackages).length} packages marked to be released`
  );

  Object.keys(releasablePackages).forEach((packageName) => {
    const currentPackage = releasablePackages[packageName];
    currentPackage.dependingOnThis.forEach((dependingPackage) => {
      // Only process related packages if their given dependency range won't cover the releasable package's new version
      if (
        semver.satisfies(
          currentPackage.incrementedVersion,
          dependingPackage.ownPackageRange
        )
      ) {
        return;
      }
      const relatedPackage = clonePackages[dependingPackage.name];

      // Make sure the related package is flagged to get at least a patch release
      if (relatedPackage.determinedIncrementLevel === -1) {
        relatedPackage.determinedIncrementLevel++;
      }
      // Add Message
      const text = `fix: dependency ${packageName} has changed from ${currentPackage.packageJson.version} to ${currentPackage.incrementedVersion}`;
      log(text);
      relatedPackage.relatedMessages.push({
        date: new Date().toISOString(),
        text,
        level: 'patch',
      });

      // Adapt ranges to include the releasable package's new version
      // @TODO: repeat for dependingPackage's "dependsOn" entry?
      const lowerVersionLimit = '';
      const upperVersionLimit = '';
      dependingPackage.ownPackageRange = `>=${lowerVersionLimit} <${upperVersionLimit}`;
    });
  });

  return { ...env, packages: clonePackages };
};
