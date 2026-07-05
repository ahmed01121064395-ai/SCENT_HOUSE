/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configured for optimal performance
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
