/** @type {import('next').NextConfig} */
const nextConfig = {
  // TypeScript hatalarını görmezden gel ve derlemeyi tamamla
  typescript: {
    ignoreBuildErrors: true,
  },
  // ESLint / linting hatalarını görmezden gel
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Varsa diğer mevcut ayarların (images vb.) burada kalabilir
};

module.exports = nextConfig;