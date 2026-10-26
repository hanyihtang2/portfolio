import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

interface RouteEntry {
  path: string;
  lastmod?: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
}

export const GET: APIRoute = async () => {
  const siteUrl = 'https://hanyihtang2.github.io/portfolio';
  const projects = await getCollection('projects');

  // Static site routes
  const staticRoutes: RouteEntry[] = [
    { path: '', changefreq: 'weekly', priority: '1.0' },
    { path: '/projects', changefreq: 'weekly', priority: '0.9' },
    { path: '/resume', changefreq: 'monthly', priority: '0.8' },
    { path: '/learning', changefreq: 'weekly', priority: '0.8' },
    { path: '/contact', changefreq: 'yearly', priority: '0.5' },
  ];

  // Dynamic project & roadmap routes from content collections
  const projectRoutes: RouteEntry[] = projects.flatMap((p) => {
    const lastMod = p.data.publishDate.toISOString().split('T')[0];
    return [
      {
        path: `/projects/${p.id}`,
        lastmod: lastMod,
        changefreq: 'monthly',
        priority: '0.8',
      },
      {
        path: `/projects/${p.id}/roadmap`,
        lastmod: lastMod,
        changefreq: 'monthly',
        priority: '0.7',
      },
    ];
  });

  const today = new Date().toISOString().split('T')[0];
  const allRoutes: RouteEntry[] = [...staticRoutes, ...projectRoutes];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(
    (route) => `  <url>
    <loc>${siteUrl}${route.path}</loc>
    <lastmod>${route.lastmod || today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`.trim();

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};

