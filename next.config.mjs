import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  eslint: {
    ignoreDuringBuilds: true,
  },

  // 🔑 REQUIRED for GitHub Pages
  output: 'export',

  // 🔑 REQUIRED so next/image doesn't break
  images: {
    unoptimized: true,
  },
};

export default withBundleAnalyzer(nextConfig);
