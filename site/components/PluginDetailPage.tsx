import React from 'react';
import type { PluginData } from './types';
import PluginDetail from './PluginDetail';

interface Props {
  id: string;
  lang?: 'en' | 'zh';
  plugins: PluginData[];
  ReadmeEn?: React.ComponentType;
  ReadmeZh?: React.ComponentType;
}

export default function PluginDetailPage({ id, lang = 'en', plugins, ReadmeEn, ReadmeZh }: Props) {
  const plugin = plugins.find((p) => p.id.toLowerCase() === id.toLowerCase());
  if (!plugin) {
    return (
      <div className="cp-detail">
        <div className="cp-empty" style={{ paddingTop: 80 }}>
          Plugin not found: <strong>{id}</strong>
        </div>
      </div>
    );
  }
  return <PluginDetail plugin={plugin} lang={lang} ReadmeEn={ReadmeEn} ReadmeZh={ReadmeZh} />;
}
