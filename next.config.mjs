/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  outputFileTracingIncludes: {
    "/api/certificado/pdf": [
      "./public/templates/certificado-matriz-cuidador.pdf",
      "./public/templates/certificado-matriz-socorros.pdf",
    ],
  },
};

export default nextConfig;
