/** @type {import('next').NextConfig} */
const nextConfig = {
  // Gera um servidor Node.js auto-contido em .next/standalone para imagens Docker enxutas
  output: 'standalone',
}

export default nextConfig
