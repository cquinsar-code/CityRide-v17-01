/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Permite compilar aunque haya errores de tipo
    ignoreBuildErrors: true,
  },
  images: {
    // Desactiva la optimización de imágenes para desarrollo o entornos sin configuración de Image Optimization
    unoptimized: true,
  },
  experimental: {
    // Habilita el soporte para appDir y React Server Components
    appDir: true,
  },
}

export default nextConfig
