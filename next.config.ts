import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Imágenes de piezas (mock con picsum; luego Supabase Storage / CDN del cliente)
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
