export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>https://mentorship-app-one.vercel.app/</loc>
      <priority>1.0</priority>
      <changefreq>daily</changefreq>
    </url>
    <url>
      <loc>https://mentorship-app-one.vercel.app/about</loc>
      <priority>0.8</priority>
      <changefreq>monthly</changefreq>
    </url>
    <url>
      <loc>https://mentorship-app-one.vercel.app/contact</loc>
      <priority>0.8</priority>
      <changefreq>monthly</changefreq>
    </url>
    <url>
      <loc>https://mentorship-app-one.vercel.app/dashboard</loc>
      <priority>0.7</priority>
      <changefreq>weekly</changefreq>
    </url>
  </urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
