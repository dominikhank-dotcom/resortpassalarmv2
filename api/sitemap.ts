
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

  const siteUrl = process.env.VITE_SITE_URL || 'https://resortpassalarm.com';
  const lastMod = new Date().toISOString().split('T')[0];

  // Statische Seiten
  const staticPages = [
    '',
    '/affiliate-info',
    '/user-signup',
    '/affiliate-signup',
    '/imprint',
    '/privacy',
    '/terms',
    '/revocation'
  ];

  let blogUrls: string[] = [];
  try {
    // Abfrage der Blog-Artikel aus Supabase
    // Ich nehme an, die Tabelle heißt 'blog_posts' und hat eine Spalte 'slug'
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('is_published', true);

    if (posts) {
      blogUrls = posts.map(post => `/blog/${post.slug}`);
    }
  } catch (e) {
    console.error("Sitemap: Fehler beim Laden der Blogartikel", e);
  }

  const allPages = [...staticPages, ...blogUrls];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${allPages.map(path => `
        <url>
          <loc>${siteUrl}${path}</loc>
          <lastmod>${lastMod}</lastmod>
          <changefreq>${path === '' ? 'daily' : 'weekly'}</changefreq>
          <priority>${path === '' ? '1.0' : '0.7'}</priority>
        </url>
      `).join('')}
    </urlset>`;

  res.status(200).send(sitemap.trim());
}
