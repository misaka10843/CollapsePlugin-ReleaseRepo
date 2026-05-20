export interface PluginAsset {
  path: string;
  size: number;
  /** Absolute URL via GitHub Raw (for speed test + fallback) */
  githubRaw: string;
  /** Absolute URL via jsDelivr CDN */
  jsdelivr: string;
  /** Relative path on this site, e.g. /Arknights/Arknights.dll */
  siteRelative: string;
}

export interface PluginZip {
  filename: string;
  version: string;
  size: number;
  githubRaw: string;
  jsdelivr: string;
}

export interface PluginRelease {
  version: string;
  name: string;
  date: string;
  body: string;
  url: string;
}

export interface PluginData {
  id: string;
  name: string;
  author: string;
  description: string;
  version: string;
  standardVersion: string;
  createdAt: string;
  updatedAt: string;
  icon: string | null;
  mainLibrary: string;
  /** Latest zip from build/ — used by the download button */
  latestZip: PluginZip | null;
  /** Non-build assets hosted on this site */
  assets: PluginAsset[];
  releases: PluginRelease[];
  announcement?: string | null;
}
