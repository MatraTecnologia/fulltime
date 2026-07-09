import type { CertTemplate } from './certificate-renderer.js'

const INK = '#1a2b4a'
const GOLD = '#8a6d3b'

export const DEFAULT_TEMPLATE: CertTemplate = {
  pageSize: 'A4_LANDSCAPE',
  background: null,
  backgroundColor: '#fbfaf7',
  elements: [
    { id: 'title', type: 'text', x: 0, y: 30, w: 297, h: 20, text: 'CERTIFICADO',
      style: { fontFamily: 'Playfair Display', fontSize: 46, fontWeight: 700, color: INK, letterSpacing: 8 } },
    { id: 'subtitle', type: 'text', x: 0, y: 54, w: 297, h: 10, text: 'DE CONCLUSÃO',
      style: { fontFamily: 'Montserrat', fontSize: 14, fontWeight: 600, color: GOLD, letterSpacing: 6 } },
    { id: 'pre', type: 'text', x: 0, y: 76, w: 297, h: 8, text: 'Certificamos que',
      style: { fontFamily: 'Lora', fontSize: 14, italic: true, color: '#555555' } },
    { id: 'name', type: 'dynamic', binding: 'studentName', x: 20, y: 82, w: 257, h: 26,
      style: { fontFamily: 'Great Vibes', fontSize: 54, color: INK } },
    { id: 'body', type: 'dynamic', text: 'concluiu com êxito o curso', x: 0, y: 114, w: 297, h: 8,
      style: { fontFamily: 'Lora', fontSize: 14, italic: true, color: '#555555' } },
    { id: 'course', type: 'dynamic', binding: 'courseTitle', x: 20, y: 122, w: 257, h: 12,
      style: { fontFamily: 'Montserrat', fontSize: 22, fontWeight: 700, color: INK } },
    { id: 'hours', type: 'dynamic', text: 'Carga horária: {{courseDurationHours}} horas', x: 0, y: 137, w: 297, h: 7,
      style: { fontFamily: 'Inter', fontSize: 11, color: '#777777' } },
    { id: 'date', type: 'dynamic', text: 'Emitido em {{issueDate}}', x: 30, y: 176, w: 100, h: 7,
      style: { fontFamily: 'Inter', fontSize: 11, color: '#555555' } },
    { id: 'instructor', type: 'dynamic', binding: 'instructorName', x: 167, y: 172, w: 100, h: 8,
      style: { fontFamily: 'Montserrat', fontSize: 13, fontWeight: 600, color: INK } },
    { id: 'instructor-label', type: 'text', x: 167, y: 181, w: 100, h: 6, text: 'Instrutor(a)',
      style: { fontFamily: 'Inter', fontSize: 9, color: '#999999' } },
    { id: 'code', type: 'dynamic', text: 'Código de verificação: {{code}}', x: 20, y: 198, w: 150, h: 6,
      style: { fontFamily: 'Inter', fontSize: 8, color: '#aaaaaa', align: 'left' } },
    { id: 'qr', type: 'qrcode', binding: 'verifyUrl', x: 262, y: 12, w: 23, h: 23 },
  ],
}
