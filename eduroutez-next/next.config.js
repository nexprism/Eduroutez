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
    domains: ['eduroutez-3.onrender.com', 'utfs.io', 'eduroutez.nexprism.in', 'localhost', 'coupon.nexprism.in', 'admin.eduroutez.com'],

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
      },
      {
        protocol: 'https',
        hostname: 'admin.eduroutez.com',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'eduroutez.com',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'api.eduroutez.com',
        port: ''
      }
    ]
  },
  transpilePackages: ['geist']
};

module.exports = nextConfig;
