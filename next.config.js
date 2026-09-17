/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Derlemede TypeScript hatalarını yoksayar ve build'i bitirir
    ignoreBuildErrors: true,
  },
  eslint: {
    // Derlemede ESLint hatalarını yoksayar
    ignoreDuringBuilds: true,
  },
  // Varsa mevcut diğer ayarların...
};

module.exports = nextConfig; // veya export default nextConfig;