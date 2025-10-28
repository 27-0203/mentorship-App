/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://mentorship-app-one.vercel.app/",
  generateRobotsTxt: true, // (optional)
  sitemapSize: 7000,
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/google:verification(.+).html',
        destination: '/api/verify-google',
      },
    ]
  },
}

module.exports = nextConfig