import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Pagamento simulado desativado. Use /api/payments/checkout. O certificado só é liberado após confirmação do gateway ou emissão manual registrada pelo administrador.",
    },
    { status: 410 }
  )
}
