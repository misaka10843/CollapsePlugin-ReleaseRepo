import { useHead, usePage } from '@rspress/core/runtime';
import type { SeoMetadata } from '../scripts/seo';

export default function PageSeo() {
  const { page } = usePage();
  const { seo } = page as typeof page & { seo?: SeoMetadata };

  useHead(seo ? {
      title: seo.title,
      link: [
        { rel: 'canonical', href: seo.canonical },
        ...seo.alternates.map(({ hreflang, href }) => ({ key: hreflang, rel: 'alternate', hreflang, href })),
      ],
      meta: [
        { property: 'og:title', content: seo.title },
        { property: 'og:url', content: seo.canonical },
        { property: 'og:site_name', content: seo.siteName },
        { property: 'og:locale', content: seo.locale },
        ...(seo.alternateLocale ? [{ property: 'og:locale:alternate', content: seo.alternateLocale }] : []),
        { name: 'twitter:card', content: 'summary' },
      ],
  } : {
    meta: page.pageType === '404' ? [{ name: 'robots', content: 'noindex' }] : [],
  });

  return null;
}
