// Expresión regular única para correos electrónicos (la misma que App\Rules\CorreoValido en el backend)
export const REGEX_CORREO = /^[A-Za-z0-9]+([._%+-][A-Za-z0-9]+)*@[A-Za-z0-9]+(-[A-Za-z0-9]+)*(\.[A-Za-z0-9]+(-[A-Za-z0-9]+)*)*\.[A-Za-z]{2,}$/

export const MENSAJE_CORREO_INVALIDO = 'El correo electrónico no es válido. Ej: nombre@dominio.com'

export const esCorreoValido = (valor) => REGEX_CORREO.test((valor || '').trim())
