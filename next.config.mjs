/** @type {import('next').NextConfig} */
const nextConfig = {
  // REMOVE output: 'export' - this is causing the main error
  eslint: {
    ignoreDuringBuilds: true, // This ignores ESLint errors
  },
  typescript: {
    ignoreBuildErrors: true, // This ignores TypeScript errors
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig