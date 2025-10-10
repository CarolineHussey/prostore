import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Temporarily ignore ESLint errors during production build due to Typescript errors not thrown in local build (namely: findMany - "Error fetching latest products: Error [PrismaClientKnownRequestError]: Invalid prisma.product.findMany() invocation:)"
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        port: "",
      },
    ],
  },
};

export default nextConfig;
