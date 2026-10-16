// Solo la comparación elimina espacios; el nombre que se guarda conserva su formato.
export const normalizarNombreCatalogo = nombre => String(nombre ?? '')
  .normalize('NFKC')
  .toLocaleLowerCase('es')
  .replace(/\s+/gu, '')

export async function validarNombreCatalogoDisponible({ nombre, listar, entidad, omitirId = null }) {
  const nombreNormalizado = normalizarNombreCatalogo(nombre)
  if (!nombreNormalizado) return

  // Consultar sin filtros y sin cambiar el listado/paginación que está viendo el usuario.
  let ultimaPagina = 1
  for (let page = 1; page <= ultimaPagina; page++) {
    const { data } = await listar({ page, per_page: 100 })
    const registros = Array.isArray(data) ? data : data.data
    const duplicado = registros.some(registro =>
      (omitirId === null || String(registro.id) !== String(omitirId)) &&
      normalizarNombreCatalogo(registro.nombre) === nombreNormalizado
    )
    if (duplicado) {
      const mensaje = `${entidad} ya existente.`
      const error = new Error(mensaje)
      // Mismo contrato de validación que los errores 422 manejados por los formularios.
      error.response = { status: 422, data: { message: mensaje, errors: { nombre: [mensaje] } } }
      throw error
    }
    ultimaPagina = Array.isArray(data) ? 1 : Number(data.last_page || 1)
  }
}
