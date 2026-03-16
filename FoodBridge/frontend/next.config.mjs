/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const rawBackendUrl = process.env.BACKEND_URL || "http://localhost:4000";
    const backendUrl = (() => {
      const trimmed = String(rawBackendUrl || "").trim().replace(/\/+$/, "");
      if (!trimmed) return "http://localhost:4000";
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
      return `https://${trimmed}`;
    })();

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
