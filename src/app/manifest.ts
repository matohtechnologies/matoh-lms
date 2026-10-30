import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PT. Matoh Technologies Indonesia",
    short_name: "Matoh Tech",
    description:
      "Platform Resmi Pelatihan & Pembelajaran Digital Terapan — Make You Ready Digital (SK Kemenkumham: AHU-064920.AH.01.30.Tahun 2024)",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0e7485",
    icons: [
      {
        src: "/images/matoh-logo-v2.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/matoh-logo-v2.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
