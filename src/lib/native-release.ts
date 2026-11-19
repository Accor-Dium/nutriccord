import { GITHUB_REPO } from '@/constants/app';
import { compareSemver, parseSemver } from '@/lib/semver';

export interface NativeRelease {
  version: string; // sin la "v", p. ej. "0.3.0"
  apkUrl: string;
  pageUrl: string;
}

interface GitHubAsset {
  name: string;
  browser_download_url: string;
}

interface GitHubRelease {
  tag_name: string;
  draft: boolean;
  html_url: string;
  assets: GitHubAsset[];
}

/**
 * Busca en GitHub Releases la versión más reciente que trae un APK adjunto.
 * Solo las versiones con cambios nativos llevan APK (las demás llegan por OTA),
 * así que esta es la última versión que requiere reinstalar la app.
 */
export async function fetchLatestNativeRelease(): Promise<NativeRelease | null> {
  const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases?per_page=30`, {
    headers: { Accept: 'application/vnd.github+json' },
  });
  if (!response.ok) throw new Error(`GitHub respondió ${response.status}`);
  const releases = (await response.json()) as GitHubRelease[];

  let latest: NativeRelease | null = null;
  for (const release of releases) {
    if (release.draft || !parseSemver(release.tag_name)) continue;
    const apk = release.assets.find((asset) => asset.name.toLowerCase().endsWith('.apk'));
    if (!apk) continue;
    const version = release.tag_name.replace(/^v/, '');
    if (!latest || compareSemver(version, latest.version) > 0) {
      latest = { version, apkUrl: apk.browser_download_url, pageUrl: release.html_url };
    }
  }
  return latest;
}
