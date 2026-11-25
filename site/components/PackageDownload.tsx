import React, { useEffect, useRef, useState } from 'react';
import type { PluginZip } from './types';
import { formatBytes } from './format';

interface Props {
  zip: PluginZip;
  text: {
    download: string;
    testing: string;
    selected: (source: string, latencyMs?: number) => string;
    manualMirrors: string;
    siteLink: string;
    githubRaw: string;
    jsdelivr: string;
  };
}

const PROBE_TIMEOUT_MS = 2500;

export function PackageDownload({ zip, text }: Props) {
  const probe = useRef<AbortController | null>(null);
  const [testing, setTesting] = useState(false);
  const [selected, setSelected] = useState<{ label: string; latencyMs?: number } | null>(null);
  const site = { label: text.siteLink, url: zip.siteRelative };
  const sources = [
    site,
    { label: text.githubRaw, url: zip.githubRaw },
    { label: text.jsdelivr, url: zip.jsdelivr },
  ];

  useEffect(() => () => {
    probe.current?.abort();
    probe.current = null;
  }, []);

  async function selectSource(event: React.MouseEvent<HTMLAnchorElement>) {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (process.env.NODE_ENV === 'development') return;
    event.preventDefault();
    if (probe.current) return;

    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
    probe.current = controller;
    setTesting(true);
    setSelected(null);

    let chosen: { label: string; url: string; latencyMs?: number } = site;
    try {
      chosen = await Promise.any(sources.map(async (source) => {
        // All three hosts serve the same manifest. Compare response latency without fetching a ZIP.
        const start = performance.now();
        const packageUrl = new URL(source.url, window.location.href);
        const manifest = new URL('../manifest.json', packageUrl);
        const response = await fetch(manifest, {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Mirror returned ${response.status}`);
        const latencyMs = Math.max(1, Math.round(performance.now() - start));
        return { ...source, latencyMs };
      }));
    } catch {
      // The local download remains available when every probe fails or times out.
    } finally {
      window.clearTimeout(timer);
    }

    if (probe.current !== controller) return;
    probe.current = null;
    controller.abort();
    setTesting(false);
    setSelected({ label: chosen.label, latencyMs: chosen.latencyMs });
    const link = document.createElement('a');
    link.href = chosen.url;
    link.download = zip.filename;
    document.body.append(link);
    link.click();
    link.remove();
  }

  return (
    <aside className={`cp-download ${testing ? 'is-probing' : ''}`} aria-label={text.download}>
      <a
        className="cp-download-btn"
        href={site.url}
        download={zip.filename}
        onClick={selectSource}
        aria-busy={testing}
      >
        {testing ? (
          <svg
            aria-hidden="true"
            className="cp-spin"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        ) : (
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        )}
        <span>{testing ? text.testing : `${text.download} (${formatBytes(zip.size)})`}</span>
        {testing && <span className="cp-probe-bar" aria-hidden="true" />}
      </a>

      <div className="cp-mirrors-caption">
        <span>{text.manualMirrors}</span>
        {testing && <span className="cp-probe-dots" aria-hidden="true"><i /><i /><i /></span>}
      </div>
      <div className="cp-download-mirrors">
        {sources.map((source) => (
          <a
            key={source.url}
            href={source.url}
            download={zip.filename}
            className={`cp-mirror-link ${testing ? 'probing' : ''} ${selected?.label === source.label ? 'selected' : ''}`}
          >
            {source.label}
          </a>
        ))}
      </div>

      <p className="cp-download-status" role="status">
        {testing
          ? text.testing
          : selected
            ? text.selected(selected.label, selected.latencyMs)
            : ''}
      </p>
    </aside>
  );
}
