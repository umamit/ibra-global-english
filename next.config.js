
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,

  // Next.js 16 memakai Turbopack secara default untuk `next dev` dan `next build`.
  turbopack: {},

  outputFileTracingRoot: __dirname,

  // Catatan: blok webpack() di bawah HANYA dipakai bila build dijalankan dengan
  // bundler Webpack (mis. `next build --webpack`). Pada build Turbopack default,
  // konfigurasi ini diabaikan. Pengaturan memori build sebenarnya dikendalikan
  // lewat NODE_OPTIONS=--max-old-space-size pada script "build" di package.json.
  webpack: (config, { isServer }) => {
    config.optimization.minimize = true;

    // Reduce memory during build
    if (!isServer) {
      config.optimization.splitChunks.chunks = 'all';
      config.optimization.runtimeChunk = 'single';
    }

    return config;
  },

  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/array/:path*",
        destination: "https://us-assets.i.posthog.com/array/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },

  // Headers configuration for security and CSP against XSS
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Link',
            value: '</.well-known/api-catalog>; rel="api-catalog"'
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), geolocation=()'
          }
        ]
      }
    ];
  },

  // Image optimization
  images: {
    loader: 'custom',
    loaderFile: './src/utils/cloudinaryLoader.js',
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uszukipvrvjrgrikxfwh.supabase.co',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
