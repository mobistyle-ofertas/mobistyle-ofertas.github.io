const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://mobistyle-ofertas.github.io';

function generateSitemap() {
  try {
    const baseData = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/base.json'), 'utf8'));
    const newsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/news.json'), 'utf8'));

    const staticRoutes = [
      '',
      '/noticias',
    ];

    const categoryRoutes = baseData.categories.map(cat => `/category/${cat.id}`);
    const modelRoutes = baseData.models.map(model => `/model/${model.id}`);
    const newsRoutes = newsData.map(news => `/noticia/${news.id}`);

    const allRoutes = [
      ...staticRoutes,
      ...categoryRoutes,
      ...modelRoutes,
      ...newsRoutes,
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(route => `  <url>
    <loc>${BASE_URL}${route}</loc>
    <changefreq>weekly</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;

    fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), sitemap);
    console.log('Sitemap generated successfully in public/sitemap.xml');
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }
}

generateSitemap();
