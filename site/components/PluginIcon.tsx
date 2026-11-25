import React, { useState } from 'react';
import type { PluginSummary } from './types';

interface Props {
  plugin: Pick<PluginSummary, 'icon' | 'name'>;
  variant: 'card' | 'detail' | 'stage' | 'rail';
  alt?: string;
}

export default function PluginIcon({ plugin, variant, alt = '' }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const className = `cp-${variant}-icon`;
  const { icon, name } = plugin;

  if (icon && icon !== failedSrc) {
    return (
      <img
        src={icon}
        alt={alt}
        className={className}
        onError={() => setFailedSrc(icon)}
      />
    );
  }
  return (
    <div className={`${className}-placeholder`} aria-hidden={alt ? undefined : true}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
