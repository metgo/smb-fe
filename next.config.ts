import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.weatherapi.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        port: "",
        pathname: "/**",
      },
      // {
      //   protocol:"https",
      //   hostname: "storage.googleapis.com",
      //   pathname:"/**"
      // }
    ],
  },
};

export default nextConfig;
