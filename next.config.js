const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

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

  // Headers configuration for security and CSP against XSS
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [

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

// Wrap with Sentry
module.exports = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Source map upload auth token
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Upload wider set of client source files for better stack trace resolution
  widenClientFileUpload: true,

  // Create a proxy API route to bypass ad-blockers
  tunnelRoute: "/monitoring",

  // Suppress non-CI output
  silent: !process.env.CI,

  // Upload source maps only in production
  sourcemaps: {
    disable: process.env.NODE_ENV !== "production",
  },
});
