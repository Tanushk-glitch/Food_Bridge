/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:4000";

    return [
      {
        source: "/api/donations/:path*",
        destination: `${backendUrl}/api/donations/:path*`,
      },
      {
        source: "/api/delivery/:path*",
        destination: `${backendUrl}/api/delivery/:path*`,
      },
      {
        source: "/api/auth/request-otp",
        destination: `${backendUrl}/api/auth/request-otp`,
      },
      {
        source: "/api/auth/verify-otp",
        destination: `${backendUrl}/api/auth/verify-otp`,
      },
    ];
  },
};

export default nextConfig;
