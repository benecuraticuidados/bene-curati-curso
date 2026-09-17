import NextAuth from "next-auth"
import { NextRequest } from "next/server"
import { authOptions } from "@/lib/auth"

function syncAuthUrl(req: NextRequest) {
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    ""
  const proto = req.headers.get("x-forwarded-proto") || "https"
  if (host) {
    process.env.NEXTAUTH_URL = `${proto}://${host}`
  }
}

async function handler(req: NextRequest, context: { params: { nextauth: string[] } }) {
  syncAuthUrl(req)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (NextAuth(authOptions) as any)(req, context)
}

export { handler as GET, handler as POST }
