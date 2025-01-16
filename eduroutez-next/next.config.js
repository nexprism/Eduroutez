/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
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
        protocol: 'https',
        hostname: 'api.slingacademy.com',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: ''
      },
      {
        hostname: 'localhost'
      },
      {
        hostname: 'coupon.nexprism.in'
      }
    ]
  },
  transpilePackages: ['geist']
};

module.exports = nextConfig;
