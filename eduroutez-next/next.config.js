/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  rules: {
    'react/no-unescaped-entities': 'off',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'eduroutez.nexprism.in',
        port: ''
      },
      {
        hostname: 'localhost'
      },
      {
        hostname: 'coupon.nexprism.in'
      },
      {
        protocol: 'https',
        hostname: 'eduroutez-3.onrender.com',
        port: ''
      }
    ]
  },
  transpilePackages: ['geist']
};

module.exports = nextConfig;
