/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://app.synccrm.ca https://*.synccrm.ca;",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
