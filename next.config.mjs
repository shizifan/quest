/** @type {import('next').NextConfig} */
const nextConfig = {
  // Phaser uses browser globals; disable SSR for game pages
  reactStrictMode: false,
}

export default nextConfig
