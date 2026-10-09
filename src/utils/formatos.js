//Formato de moneda con separador de miles: 9999999 -> "9,999,999.00"
export const formatoMoneda = (valor) =>
  (Number(valor) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
