/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Enable React strict mode for additional development warnings
  serverExternalPackages: ['@supabase/supabase-js'], // External packages to exclude from server bundles (moved from experimental)
  images: {
    domains: [
      'vbhwudyvjpgtbzvybxrx.supabase.co', // Supabase storage domain for images
      'lh3.googleusercontent.com', // Google user content domain (for Google OAuth avatars)
      'avatars.githubusercontent.com', // GitHub avatars domain (for GitHub OAuth)
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Configure webpack fallbacks for client-side builds
      config.resolve.fallback = {
        fs: false, // File system module - not needed in browser
        net: false, // Networking module - not needed in browser
        tls: false, // TLS module - not needed in browser
        '@react-native-async-storage/async-storage': false, // React Native module - not needed in web
        'pino-pretty': false, // Logging formatter - optional dependency
        crypto: false, // Crypto module - browser provides native implementation
        stream: false, // Stream module - browser provides native implementation
      };
    }
    return config; // Return the modified webpack configuration
  },
}

module.exports = nextConfig; // Export the configuration object
