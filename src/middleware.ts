export { default } from "next-auth/middleware"

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/curso/:path*",
    "/aula/:path*",
    "/avaliacoes/:path*",
    "/certificado/:path*",
    "/admin/:path*",
  ],
}
