export interface PluginAsset {
  path: string;
  size: number;
  /** Absolute URL via GitHub Raw */
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
  siteRelative: string;
  githubRaw: string;
  jsdelivr: string;
}

export interface PluginRelease {
  version: string;
  name: string;
  date: string;
  bodyHtml: string;
  url: string;
}

export interface PluginSummary {
  id: string;
  name: string;
  author: string;
  description: string;
  version: string;
  standardVersion: string;
  createdAt: string;
  updatedAt: string;
  icon: string | null;
}

export interface PluginData extends PluginSummary {
  mainLibrary: string;
  /** Current installable package from build/ */
  latestZip: PluginZip;
  /** Non-build assets hosted on this site */
  assets: PluginAsset[];
  releases: PluginRelease[];
  readmes: { en: string; zh: string };
  repoUrl?: string;
  releasesUrl?: string;
  announcement?: string | null;
}
