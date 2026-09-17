import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST() {
  const res = NextResponse.json({ ok: true })
  const expired = {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: true,
    maxAge: 0,
  }
  res.cookies.set("__Secure-next-auth.session-token", "", expired)
  res.cookies.set("next-auth.session-token", "", { ...expired, secure: false })
  return res
}
