
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use a unique, stable build ID to prevent "TypeError: Cannot read properties of undefined (reading 'call')" 
  // which occurs during client-side hydration mismatches in the Studio environment.
  generateBuildId: async () => {
    return 'hustlespark-v10-prod-' + Date.now();
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
