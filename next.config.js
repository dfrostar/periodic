/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    esmExternals: 'loose',
  },
  output: 'export', // For static site generation for Vercel deployment
  images: {
    unoptimized: true, // Required for static export
  },
  webpack: (config) => {
    // Important for Three.js and React Three Fiber
    config.resolve.alias = {
      ...config.resolve.alias,
      'three': require.resolve('three'),
    };
    
    return config;
  }
};

module.exports = nextConfig;
