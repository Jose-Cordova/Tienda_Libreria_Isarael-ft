export const paises = [
  // ========== AMÉRICA DEL NORTE ==========
  { nombre: 'Canadá', iso: 'ca', codigo: '+1', regex: /^\d{10}$/, mask: '(999) 999-9999', placeholder: '(123) 456-7890', ejemplo: '1234567890' },
  { nombre: 'Estados Unidos', iso: 'us', codigo: '+1', regex: /^\d{10}$/, mask: '(999) 999-9999', placeholder: '(555) 123-4567', ejemplo: '5551234567' },
  { nombre: 'México', iso: 'mx', codigo: '+52', regex: /^\d{10}$/, mask: '99 9999 9999', placeholder: '55 1234 5678', ejemplo: '5512345678' },

  // ========== AMÉRICA CENTRAL ==========
  { nombre: 'Belice', iso: 'bz', codigo: '+501', regex: /^\d{7}$/, mask: '999-9999', placeholder: '123-4567', ejemplo: '1234567' },
  { nombre: 'Costa Rica', iso: 'cr', codigo: '+506', regex: /^\d{8}$/, mask: '9999 9999', placeholder: '1234 5678', ejemplo: '12345678' },
  { nombre: 'El Salvador', iso: 'sv', codigo: '+503', regex: /^[2-7]\d{7}$/, mask: '9999 9999', placeholder: '7280 2112', ejemplo: '71234567' },
  { nombre: 'Guatemala', iso: 'gt', codigo: '+502', regex: /^\d{8}$/, mask: '9999 9999', placeholder: '1234 5678', ejemplo: '12345678' },
  { nombre: 'Honduras', iso: 'hn', codigo: '+504', regex: /^\d{8}$/, mask: '9999 9999', placeholder: '1234 5678', ejemplo: '12345678' },
  { nombre: 'Nicaragua', iso: 'ni', codigo: '+505', regex: /^\d{8}$/, mask: '9999 9999', placeholder: '1234 5678', ejemplo: '12345678' },
  { nombre: 'Panamá', iso: 'pa', codigo: '+507', regex: /^\d{8}$/, mask: '9999-9999', placeholder: '1234-5678', ejemplo: '12345678' },

  // ========== CARIBE ==========
  { nombre: 'Antigua y Barbuda', iso: 'ag', codigo: '+1-268', regex: /^\d{7}$/, mask: '999-9999', placeholder: '123-4567', ejemplo: '1234567' },
  { nombre: 'Bahamas', iso: 'bs', codigo: '+1-242', regex: /^\d{7}$/, mask: '999-9999', placeholder: '123-4567', ejemplo: '1234567' },
  { nombre: 'Barbados', iso: 'bb', codigo: '+1-246', regex: /^\d{7}$/, mask: '999-9999', placeholder: '123-4567', ejemplo: '1234567' },
  { nombre: 'Cuba', iso: 'cu', codigo: '+53', regex: /^\d{8}$/, mask: '9 999 9999', placeholder: '5 123 4567', ejemplo: '51234567' },
  { nombre: 'Dominica', iso: 'dm', codigo: '+1-767', regex: /^\d{7}$/, mask: '999-9999', placeholder: '123-4567', ejemplo: '1234567' },
  { nombre: 'Granada', iso: 'gd', codigo: '+1-473', regex: /^\d{7}$/, mask: '999-9999', placeholder: '123-4567', ejemplo: '1234567' },
  { nombre: 'Haití', iso: 'ht', codigo: '+509', regex: /^\d{8}$/, mask: '99 99 9999', placeholder: '12 34 5678', ejemplo: '12345678' },
  { nombre: 'Jamaica', iso: 'jm', codigo: '+1-876', regex: /^\d{7}$/, mask: '999-9999', placeholder: '123-4567', ejemplo: '1234567' },
  { nombre: 'República Dominicana', iso: 'do', codigo: '+1-809', regex: /^\d{10}$/, mask: '(999) 999-9999', placeholder: '(809) 123-4567', ejemplo: '8091234567' },
  { nombre: 'San Cristóbal y Nieves', iso: 'kn', codigo: '+1-869', regex: /^\d{7}$/, mask: '999-9999', placeholder: '123-4567', ejemplo: '1234567' },
  { nombre: 'San Vicente y las Granadinas', iso: 'vc', codigo: '+1-784', regex: /^\d{7}$/, mask: '999-9999', placeholder: '123-4567', ejemplo: '1234567' },
  { nombre: 'Santa Lucía', iso: 'lc', codigo: '+1-758', regex: /^\d{7}$/, mask: '999-9999', placeholder: '123-4567', ejemplo: '1234567' },
  { nombre: 'Trinidad y Tobago', iso: 'tt', codigo: '+1-868', regex: /^\d{7}$/, mask: '999-9999', placeholder: '123-4567', ejemplo: '1234567' },

  // ========== AMÉRICA DEL SUR ==========
  { nombre: 'Argentina', iso: 'ar', codigo: '+54', regex: /^\d{10}$/, mask: '99 9999-9999', placeholder: '11 1234-5678', ejemplo: '1112345678' },
  { nombre: 'Bolivia', iso: 'bo', codigo: '+591', regex: /^\d{8}$/, mask: '9 999 9999', placeholder: '7 123 4567', ejemplo: '71234567' },
  { nombre: 'Brasil', iso: 'br', codigo: '+55', regex: /^\d{11}$/, mask: '(99) 99999-9999', placeholder: '(11) 91234-5678', ejemplo: '11912345678' },
  { nombre: 'Chile', iso: 'cl', codigo: '+56', regex: /^\d{9}$/, mask: '9 9999 9999', placeholder: '9 1234 5678', ejemplo: '912345678' },
  { nombre: 'Colombia', iso: 'co', codigo: '+57', regex: /^\d{10}$/, mask: '999 999 9999', placeholder: '321 123 4567', ejemplo: '3211234567' },
  { nombre: 'Ecuador', iso: 'ec', codigo: '+593', regex: /^\d{9}$/, mask: '99 999 9999', placeholder: '99 123 4567', ejemplo: '991234567' },
  { nombre: 'Guyana', iso: 'gy', codigo: '+592', regex: /^\d{7}$/, mask: '999 9999', placeholder: '123 4567', ejemplo: '1234567' },
  { nombre: 'Paraguay', iso: 'py', codigo: '+595', regex: /^\d{9}$/, mask: '999 999 999', placeholder: '981 123 456', ejemplo: '981123456' },
  { nombre: 'Perú', iso: 'pe', codigo: '+51', regex: /^\d{9}$/, mask: '999 999 999', placeholder: '912 345 678', ejemplo: '912345678' },
  { nombre: 'Surinam', iso: 'sr', codigo: '+597', regex: /^\d{7}$/, mask: '999-9999', placeholder: '123-4567', ejemplo: '1234567' },
  { nombre: 'Uruguay', iso: 'uy', codigo: '+598', regex: /^\d{8}$/, mask: '9999 9999', placeholder: '9123 4567', ejemplo: '91234567' },
  { nombre: 'Venezuela', iso: 've', codigo: '+58', regex: /^\d{10}$/, mask: '999 999 9999', placeholder: '412 123 4567', ejemplo: '4121234567' },

  // ========== EXTRAS (Europa y Asia) ==========
  { nombre: 'España', iso: 'es', codigo: '+34', regex: /^\d{9}$/, mask: '999 99 99 99', placeholder: '612 34 56 78', ejemplo: '612345678' },
  { nombre: 'Francia', iso: 'fr', codigo: '+33', regex: /^\d{9}$/, mask: '9 99 99 99 99', placeholder: '6 12 34 56 78', ejemplo: '612345678' },
  { nombre: 'Reino Unido', iso: 'gb', codigo: '+44', regex: /^\d{10}$/, mask: '9999 999999', placeholder: '7911 123456', ejemplo: '7911123456' },
  { nombre: 'China', iso: 'cn', codigo: '+86', regex: /^\d{11}$/, mask: '999 9999 9999', placeholder: '131 1234 5678', ejemplo: '13112345678' },
  { nombre: 'Corea del Norte', iso: 'kp', codigo: '+850', regex: /^\d{8,10}$/, mask: '99 999 9999', placeholder: '12 345 678', ejemplo: '12345678' },
  { nombre: 'Corea del Sur', iso: 'kr', codigo: '+82', regex: /^\d{9,10}$/, mask: '99-9999-9999', placeholder: '10-1234-5678', ejemplo: '1012345678' },
  { nombre: 'Japón', iso: 'jp', codigo: '+81', regex: /^\d{10}$/, mask: '090-9999-9999', placeholder: '090-1234-5678', ejemplo: '09012345678' }
];
