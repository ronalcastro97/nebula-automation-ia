/**
 * Nebula Automation IA — Receptor del formulario de contacto.
 *
 * Se pega en Extensiones > Apps Script de la hoja de Google Sheets
 * y se implementa como "Aplicación web" (acceso: Cualquier usuario).
 * Cada envío del formulario agrega una fila a la pestaña "Contactos".
 */

const SHEET_NAME = 'Contactos';
const HEADERS = ['Fecha', 'Nombre', 'Email', 'Empresa', 'Servicio', 'Mensaje', 'Origen'];
const MAX_LEN = 2000;

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const p = (e && e.parameter) || {};

    const nombre = clean(p.nombre);
    const email = clean(p.email);
    const mensaje = clean(p.mensaje);
    if (!nombre || !email || !mensaje || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return json({ ok: false, error: 'Datos incompletos o email inválido' });
    }

    getSheet().appendRow([
      new Date(),
      nombre,
      email,
      clean(p.empresa),
      clean(p.servicio),
      mensaje,
      clean(p.origen),
    ]);

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Permite comprobar en el navegador que la Web App está activa.
function doGet() {
  return json({ ok: true, servicio: 'Nebula formulario de contacto' });
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

// Recorta el texto y evita que un valor como "=FORMULA()" se ejecute en la hoja.
function clean(v) {
  let s = String(v == null ? '' : v).trim().slice(0, MAX_LEN);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
