import { useState, useCallback } from 'react';
import type { PluginData } from './types';

/** Measure download speed (bytes/ms) for a given URL; returns Infinity on error/timeout */
async function measureSpeed(url: string): Promise<number> {
  const start = performance.now();
  try {
    const res = await fetch(url, {
      cache: 'no-store',
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return Infinity;
    const buf = await res.arrayBuffer();
    const elapsed = performance.now() - start;
    return buf.byteLength / elapsed;
  } catch {
    return Infinity;
  }
}

export type SpeedStatus = 'idle' | 'testing' | 'done' | 'error';

export function useDownload(plugin: PluginData) {
  const [status, setStatus] = useState<SpeedStatus>('idle');
  /** Raw mirror label, e.g. "GitHub Raw" — i18n done by caller */
  const [bestLabel, setBestLabel] = useState('');

  const triggerDownload = useCallback(async () => {
    if (!plugin.latestZip) return;

    setStatus('testing');

    const { filename, githubRaw, jsdelivr } = plugin.latestZip;

    const candidates: { label: string; url: string }[] = [
      { label: 'GitHub Raw', url: githubRaw },
      {
        label: 'jsDelivr (fastly)',
        url: jsdelivr.replace('cdn.jsdelivr.net', 'fastly.jsdelivr.net'),
      },
      { label: 'jsDelivr', url: jsdelivr },
    ];

    const results = await Promise.all(
      candidates.map(async (c) => ({
        ...c,
        speed: await measureSpeed(c.url),
      }))
    );

    const best = results.reduce((a, b) => (a.speed < b.speed ? a : b));

    if (best.speed === Infinity) {
      setStatus('error');
      setBestLabel('');
      return;
    }

    setStatus('done');
    setBestLabel(best.label);

    const a = document.createElement('a');
    a.href = best.url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [plugin]);

  return { status, bestLabel, triggerDownload };
}
