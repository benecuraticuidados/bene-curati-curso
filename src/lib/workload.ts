export const HORAS_TEORICAS = 204
export const HORAS_PRATICAS = 6
export const HORAS_TOTAL = HORAS_TEORICAS + HORAS_PRATICAS

export function cargaHorariaTexto() {
  return `${HORAS_TOTAL} horas (${HORAS_TEORICAS}h teóricas + ${HORAS_PRATICAS}h práticas)`
}
