import type { Module, PackageAfterDetermineVersion } from '../types';

import { logger } from '../helpers/logger';
import { clone } from 'ramda';
import semver from 'semver';
import { green, red, yellow, white } from 'chalk';

const mapLevelToColour: Record<
  PackageAfterDetermineVersion['determinedIncrementLevel'],
  [
    'major' | 'minor' | 'patch' | 'misc',
    typeof green | typeof red | typeof yellow
  ]
> = {
  '-1': ['misc', white],
  0: ['patch', green],
  1: ['minor', yellow],
  2: ['major', red],
};

const { error, log } = logger('determine Version (1)');

export const determineVersion: Module = (env) => {
  if (!env.packages) {
    const errorMessage = 'missing "packages" on env object.';
    error(errorMessage);
    throw new Error(errorMessage);
  }

  log('analyse packages');

  const clonePackages = clone(env.packages);

  const incrementLevels: semver.ReleaseType[] = ['patch', 'minor', 'major'];

  Object.keys(clonePackages).forEach((packageName) => {
    const {
      determinedIncrementLevel,
      packageJson: { version },
    } = clonePackages[packageName];

    // Only process packages flagged to be incremented
    if (determinedIncrementLevel === -1) {
      return;
    }

    const parsedVersion: semver.SemVer | null = semver.parse(version);
    if (!parsedVersion) {
      const errorMessage = `Invalid version "${version}" for package "${packageName}"`;
      error(errorMessage);
      throw new Error(errorMessage);
    }

    // obatin the new version number
    const incrementedVersion = semver.inc(
      parsedVersion,
      incrementLevels[determinedIncrementLevel]
    );

    if (!incrementedVersion) {
      const errorMessage = `version "${version}" cannot be increased to "${incrementLevels[determinedIncrementLevel]}" for package "${packageName}"`;
      error(errorMessage);
      throw new Error(errorMessage);
    }

    const incrementedVersionPackage: PackageAfterDetermineVersion = {
      ...clonePackages[packageName],
      incrementedVersion,
    };

    const [incrementLevel, incrementColor] =
      mapLevelToColour[determinedIncrementLevel];
    log(
      `${packageName} flagged to get a ${incrementColor(
        incrementLevel
      )} release ${white(`${version} -> ${incrementedVersion}`)}`
    );

    clonePackages[packageName] = incrementedVersionPackage;
  });

  return { ...env, packages: clonePackages };
};
