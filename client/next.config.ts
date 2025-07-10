// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.freepik.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "**.firebaseapp.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "i.imgur.com" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "cdn.pixabay.com" },
      { protocol: "https", hostname: "unavatar.io" },
      { protocol: "https", hostname: "www.gravatar.com" },
      { protocol: "https", hostname: "placekitten.com" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "via.placeholder.com" },
    ],
  },
};

export default nextConfig;
