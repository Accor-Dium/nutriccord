/** Utilidades SemVer mínimas (sin dependencias) para comparar versiones de la app. */

const SEMVER = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/;

export interface ParsedSemver {
  major: number;
  minor: number;
  patch: number;
  prerelease: string | null;
}

export function parseSemver(version: string): ParsedSemver | null {
  const match = SEMVER.exec(version.trim());
  if (!match) return null;
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: match[4] ?? null,
  };
}

/**
 * Compara dos versiones SemVer. Devuelve 1 si a > b, -1 si a < b, 0 si son iguales.
 * Una versión con prerelease (1.0.0-beta) es menor que la misma sin prerelease (1.0.0).
 * Versiones inválidas se consideran iguales (0) para no disparar avisos falsos.
 */
export function compareSemver(a: string, b: string): number {
  const pa = parseSemver(a);
  const pb = parseSemver(b);
  if (!pa || !pb) return 0;
  for (const key of ['major', 'minor', 'patch'] as const) {
    if (pa[key] !== pb[key]) return pa[key] > pb[key] ? 1 : -1;
  }
  if (pa.prerelease === pb.prerelease) return 0;
  if (pa.prerelease === null) return 1;
  if (pb.prerelease === null) return -1;
  return pa.prerelease > pb.prerelease ? 1 : -1;
}
