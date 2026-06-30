import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@fulltime/ui'],
  experimental: {
    extensionAlias: {
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
    },
  },
}

export default nextConfig
