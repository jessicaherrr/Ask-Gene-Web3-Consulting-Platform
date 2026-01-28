/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@supabase/supabase-js'],
  
  // Fix images configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vbhwudyvjpgtbzvybxrx.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
  
  // Configure Turbopack - add empty object to satisfy Next.js
  // In Next.js 16+, turbopack is a top-level key, not under experimental
  turbopack: {
    // Empty configuration - this tells Next.js we accept the default Turbopack behavior
  },
  
  // Webpack configuration will be ignored when Turbopack is enabled
  // But we keep it for compatibility
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        '@react-native-async-storage/async-storage': false,
        'pino-pretty': false,
        crypto: false,
        stream: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig;
