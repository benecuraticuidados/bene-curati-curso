const DEFAULT_FROM = "Bene Curati Cuidados <nao-responda@benecurati.com.br>"

export async function sendEmail(params: {
  to: string
  subject: string
  text: string
  html?: string
}) {
  const key = process.env.RESEND_API_KEY
  if (!key) return { ok: false, reason: "missing_key" as const }

  const from = process.env.EMAIL_FROM || DEFAULT_FROM
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html || params.text.replace(/\n/g, "<br/>"),
    }),
  })

  if (!res.ok) {
    return { ok: false, reason: "provider_error" as const, status: res.status }
  }
  return { ok: true as const }
}

export function passwordResetEmail(link: string) {
  const text = `Olá,\n\nRecebemos um pedido para redefinir a senha da sua conta Bene Curati Cuidados.\n\nUse este link (válido por 1 hora):\n${link}\n\nSe você não pediu isso, ignore este e-mail.\n\nBene Curati Cuidados`
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
    <div style="background:#5b1320;color:#fff;padding:16px 20px;border-radius:8px 8px 0 0">
      <strong>Bene Curati Cuidados</strong>
    </div>
    <div style="border:1px solid #eedde1;border-top:0;padding:20px;border-radius:0 0 8px 8px">
      <p>Recebemos um pedido para redefinir a senha da sua conta.</p>
      <p>
        <a href="${link}" style="display:inline-block;background:#5b1320;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">
          Redefinir senha
        </a>
      </p>
      <p style="font-size:13px;color:#555">O link vale por 1 hora. Se você não pediu isso, ignore este e-mail.</p>
    </div>
  </div>`
  return { text, html }
}
