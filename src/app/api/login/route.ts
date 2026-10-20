import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { encode } from "next-auth/jwt"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

const SOCORROS = "curso-socorros-01"

async function resolveCourse(courseKey?: string | null) {
  if (!courseKey) return null
  if (courseKey === "socorros") {
    return prisma.course.findUnique({ where: { id: SOCORROS } })
  }
  return prisma.course.findFirst({
    where: { isPublished: true, id: { not: SOCORROS } },
    orderBy: { createdAt: "asc" },
  })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = String(body?.email || "").toLowerCase().trim()
    const password = String(body?.password || "")
    const courseKey = String(body?.course || "")

    if (!email || !password) {
      return NextResponse.json({ error: "Informe e-mail e senha." }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.isActive) {
      return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 })
    }

    if (courseKey) {
      const course = await resolveCourse(courseKey)
      if (course) {
        const already = await prisma.enrollment.findUnique({
          where: { userId_courseId: { userId: user.id, courseId: course.id } },
        })
        if (!already) {
          await prisma.enrollment.create({
            data: { userId: user.id, courseId: course.id, status: "ACTIVE" },
          })
        }
      }
    }

    const secret = process.env.NEXTAUTH_SECRET || "bene-curati-dev-secret-change-me"
    const maxAge = 30 * 24 * 60 * 60
    const token = await encode({
      token: { id: user.id, sub: user.id, email: user.email, name: user.name, role: user.role },
      secret,
      maxAge,
    })

    const isHttps = (process.env.NEXTAUTH_URL || "").startsWith("https://") || process.env.VERCEL === "1"
    const cookieName = isHttps ? "__Secure-next-auth.session-token" : "next-auth.session-token"

    const res = NextResponse.json({ ok: true, role: user.role, name: user.name })
    res.cookies.set(cookieName, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: isHttps,
      maxAge,
    })
    return res
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json({ error: "Erro ao entrar. Tente novamente." }, { status: 500 })
  }
                   }
