import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || "bene-curati-dev-secret-change-me",
    secureCookie: process.env.NODE_ENV === "production",
  })

  if (!token) {
    const login = req.nextUrl.clone()
    login.pathname = "/login"
    login.searchParams.set("from", pathname)
    return NextResponse.redirect(login)
  }

  if (pathname.startsWith("/admin") && token.role !== "ADMIN") {
    const dash = req.nextUrl.clone()
    dash.pathname = "/dashboard"
    return NextResponse.redirect(dash)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/curso",
    "/curso/:path*",
    "/aula",
    "/aula/:path*",
    "/avaliacoes",
    "/avaliacoes/:path*",
    "/certificado",
    "/certificado/:path*",
    "/conta",
    "/conta/:path*",
    "/admin",
    "/admin/:path*",
  ],
}
