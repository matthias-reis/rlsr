import type { PackageAfterDetermineVersion } from '../../types';

/**
 * Identifies and returns the a map containing packages flagged to be released only
 */
export const getReleasablePackages = (
  packages: Record<string, PackageAfterDetermineVersion>
): Record<string, PackageAfterDetermineVersion> =>
  Object.keys(packages).reduce((accumulator, packageName) => {
    const currentPackage = packages![packageName];

    return {
      ...accumulator,
      ...(currentPackage.incrementedVersion
        ? {
            [packageName]: currentPackage,
          }
        : {}),
    };
  }, {} as Record<string, PackageAfterDetermineVersion>);
