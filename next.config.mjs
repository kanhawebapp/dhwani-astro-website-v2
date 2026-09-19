/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  images: {
    domains: [
      "json.astrologyapi.com",
      "dhwaniastro.com",
      "www.dhwaniastro.com",
      "staging.dhwaniastro.com",
    ],

    remotePatterns: [
      {
        protocol: "https",
        hostname: "dhwaniastro.com",
      },
      {
        protocol: "https",
        hostname: "www.dhwaniastro.com",
      },
      {
        protocol: "https",
        hostname: "staging.dhwaniastro.com",
      },
    ],
  },

  turbopack: {},
};

export default nextConfig;
