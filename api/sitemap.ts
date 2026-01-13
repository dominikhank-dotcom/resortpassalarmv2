
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/xml');

  try {
    // Basis-URL ermitteln (Standard: resortpassalarm.com)
    const baseUrl = process.env.VITE_SITE_URL || 'https://resortpassalarm.com';
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

    // 1. Statische Seiten definieren
    const staticPages = [
      '',
      '/blog',
      '/imprint',
      '/privacy',
      '/terms',
      '/revocation',
      '/affiliate-info'
    ];

    // 2. Dynamische Blogartikel aus Supabase laden
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug, updated_at');

    const blogUrls = (posts || []).map(post => ({
      url: `/blog/${post.slug}`,
      lastmod: post.updated_at ? new Date(post.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    }));

    // 3. XML generieren
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(page => `
  <url>
    <loc>${cleanBaseUrl}${page}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
  ${blogUrls.map(item => `
  <url>
    <loc>${cleanBaseUrl}${item.url}</loc>
    <lastmod>${item.lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('')}
</urlset>`;

    return res.status(200).send(sitemap);
  } catch (error: any) {
    console.error("Sitemap Error:", error);
    return res.status(500).send('Error generating sitemap');
  }
}
