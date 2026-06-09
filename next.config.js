/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  // Disable Turbopack warning and use Webpack for build
  turbopack: {},
  experimental: {
    cpus: 1,
  },
  
  // Disable static generation to avoid OOM
  output: 'standalone',

  outputFileTracingRoot: __dirname,

  // Minimal webpack config - disable all optimization
  webpack: (config, { isServer, dev }) => {
    // Disable optimization during build
    if (!dev) {
      config.optimization = {
        minimize: false,
        splitChunks: false,
        runtimeChunk: false,
      };
    }

    return config;
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

module.exports = nextConfig;
