/**
 * Nebula Automation IA — Receptor del formulario de contacto + CRM en Google Sheets.
 *
 * Se pega en Extensiones > Apps Script de la hoja de Google Sheets
 * y se implementa como "Aplicación web" (acceso: Cualquier usuario).
 *
 * - Cada envío del formulario agrega una fila a la pestaña "Contactos"
 *   con estado "Pendiente de revisar".
 * - Al cambiar el Estado, se actualiza sola la columna "Última actualización".
 * - Menú "Nebula" en la hoja: aplicar formato profesional y actualizar el resumen.
 */

const SHEET_NAME = 'Contactos';
const SUMMARY_NAME = 'Resumen';
const HEADERS = [
  'Fecha', 'Nombre', 'Email', 'Empresa', 'Servicio', 'Mensaje', 'Origen',
  'Estado', 'Notas', 'Última actualización',
];
const COL = { FECHA: 1, MENSAJE: 6, ESTADO: 8, NOTAS: 9, ACTUALIZADO: 10 };
const WIDTHS = [140, 170, 230, 170, 200, 380, 200, 180, 280, 160];

const ESTADOS = ['Pendiente de revisar', 'En proceso', 'Finalizado'];
const ESTADO_COLORES = {
  'Pendiente de revisar': { bg: '#fef3c7', fg: '#92400e' },
  'En proceso':           { bg: '#dbeafe', fg: '#1e40af' },
  'Finalizado':           { bg: '#dcfce7', fg: '#166534' },
};

const BRAND = { header: '#2e1065', headerText: '#ffffff', stripe: '#f5f3ff', accent: '#7c3aed' };
const MAX_LEN = 2000;

/* ───────────────────────── Formulario web ───────────────────────── */

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

    const ahora = new Date();
    getSheet().appendRow([
      ahora,
      nombre,
      email,
      clean(p.empresa),
      clean(p.servicio),
      mensaje,
      clean(p.origen),
      ESTADOS[0],
      '',
      ahora,
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

/* ───────────────────────── Automatizaciones en la hoja ───────────────────────── */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Nebula')
    .addItem('Aplicar formato profesional', 'configurarHoja')
    .addItem('Actualizar resumen', 'crearResumen')
    .addToUi();
}

// Al cambiar el Estado (o las Notas) se registra la fecha de la última actualización.
function onEdit(e) {
  const r = e.range;
  const sh = r.getSheet();
  if (sh.getName() !== SHEET_NAME || r.getRow() < 2) return;
  const c1 = r.getColumn();
  const c2 = r.getLastColumn();
  const tocaEstado = c1 <= COL.ESTADO && c2 >= COL.ESTADO;
  const tocaNotas = c1 <= COL.NOTAS && c2 >= COL.NOTAS;
  if (!tocaEstado && !tocaNotas) return;
  sh.getRange(r.getRow(), COL.ACTUALIZADO, r.getNumRows(), 1).setValue(new Date());
}

/* ───────────────────────── Formato profesional ───────────────────────── */

function configurarHoja() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = getSheet();
  const n = HEADERS.length;

  // Columnas exactas (agrega las que falten y quita las sobrantes)
  if (sh.getMaxColumns() < n) sh.insertColumnsAfter(sh.getMaxColumns(), n - sh.getMaxColumns());
  if (sh.getMaxColumns() > n) sh.deleteColumns(n + 1, sh.getMaxColumns() - n);

  const maxRows = sh.getMaxRows();
  const bodyRows = maxRows - 1;

  // Encabezado
  sh.getRange(1, 1, 1, n).setValues([HEADERS])
    .setFontFamily('Roboto').setFontSize(11).setFontWeight('bold')
    .setFontColor(BRAND.headerText).setBackground(BRAND.header)
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  sh.setRowHeight(1, 38);
  sh.setFrozenRows(1);

  // Cuerpo
  const body = sh.getRange(2, 1, bodyRows, n);
  body.setFontFamily('Roboto').setFontSize(10).setFontColor('#1f2937')
    .setVerticalAlignment('middle').setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
  sh.getRange(2, COL.MENSAJE, bodyRows, 1).setWrap(true);
  sh.getRange(2, COL.NOTAS, bodyRows, 1).setWrap(true);
  sh.getRange(2, COL.FECHA, bodyRows, 1).setNumberFormat('dd/mm/yyyy hh:mm');
  sh.getRange(2, COL.ACTUALIZADO, bodyRows, 1).setNumberFormat('dd/mm/yyyy hh:mm')
    .setFontColor('#6b7280');
  sh.getRange(2, COL.ESTADO, bodyRows, 1).setHorizontalAlignment('center').setFontWeight('bold');
  WIDTHS.forEach((w, i) => sh.setColumnWidth(i + 1, w));

  // Filas alternadas
  sh.getBandings().forEach(b => b.remove());
  sh.getRange(1, 1, maxRows, n)
    .applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, true, false)
    .setHeaderRowColor(BRAND.header)
    .setFirstRowColor('#ffffff')
    .setSecondRowColor(BRAND.stripe);

  // Desplegable de Estado
  const estadoRange = sh.getRange(2, COL.ESTADO, bodyRows, 1);
  estadoRange.setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(ESTADOS, true)
      .setAllowInvalid(false)
      .setHelpText('Elige: ' + ESTADOS.join(', '))
      .build()
  );

  // Contactos ya existentes sin estado -> "Pendiente de revisar"
  const last = sh.getLastRow();
  if (last >= 2) {
    const r = sh.getRange(2, COL.ESTADO, last - 1, 1);
    r.setValues(r.getValues().map(([v]) => [v || ESTADOS[0]]));
  }

  // Colores por estado
  const rules = ESTADOS.map(est =>
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(est)
      .setBackground(ESTADO_COLORES[est].bg)
      .setFontColor(ESTADO_COLORES[est].fg)
      .setRanges([estadoRange])
      .build()
  );
  sh.setConditionalFormatRules(rules);

  // Filtros en el encabezado
  if (sh.getFilter()) sh.getFilter().remove();
  sh.getRange(1, 1, maxRows, n).createFilter();

  sh.setTabColor(BRAND.accent);

  // Quita la pestaña vacía que trae la hoja por defecto
  ['Sheet1', 'Hoja 1', 'Hoja1'].forEach(name => {
    const s = ss.getSheetByName(name);
    if (s && s.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(s);
  });

  crearResumen();
  ss.setActiveSheet(sh);
}

/* ───────────────────────── Pestaña Resumen ───────────────────────── */

function crearResumen() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SUMMARY_NAME);
  if (!sh) sh = ss.insertSheet(SUMMARY_NAME);
  sh.clear();
  sh.getCharts().forEach(c => sh.removeChart(c));
  sh.setHiddenGridlines(true);
  sh.setTabColor('#ec4899');
  sh.getRange('A:F').setFontFamily('Roboto').setFontSize(10).setVerticalAlignment('middle');

  const C = `'${SHEET_NAME}'`;

  // Título
  sh.getRange('A1').setValue('Nebula Automation IA — Resumen de contactos')
    .setFontSize(18).setFontWeight('bold').setFontColor(BRAND.header);
  sh.getRange('A2').setFormula('="Actualizado: "&TEXT(NOW(),"dd/mm/yyyy hh:mm")')
    .setFontColor('#6b7280');
  sh.setRowHeight(1, 40);

  // Tarjetas de totales
  const kpis = [
    ['Total de contactos', `=COUNTA(${C}!B2:B)`],
    ['Últimos 7 días', `=COUNTIF(${C}!A2:A,">="&(TODAY()-7))`],
    ['Pendientes', `=COUNTIF(${C}!H2:H,"${ESTADOS[0]}")`],
  ];
  kpis.forEach(([label, f], i) => {
    const col = [1, 2, 4][i];
    sh.getRange(4, col).setValue(label).setFontColor('#6b7280').setFontWeight('bold');
    sh.getRange(5, col).setFormula(f).setFontSize(26).setFontWeight('bold')
      .setFontColor(BRAND.accent).setHorizontalAlignment('left');
  });
  sh.setRowHeight(5, 46);

  // Por estado
  sh.getRange('A8:B8').setValues([['Estado', 'Cantidad']]);
  ESTADOS.forEach((est, i) => {
    const row = 9 + i;
    sh.getRange(row, 1).setValue(est)
      .setBackground(ESTADO_COLORES[est].bg).setFontColor(ESTADO_COLORES[est].fg).setFontWeight('bold');
    sh.getRange(row, 2).setFormula(`=COUNTIF(${C}!H2:H,A${row})`).setHorizontalAlignment('center');
  });

  // Por servicio
  sh.getRange('D8:E8').setValues([['Servicio', 'Cantidad']]);
  sh.getRange('D9').setFormula(
    `=IFERROR(QUERY(${C}!E2:E,"select E, count(E) where E is not null group by E order by count(E) desc label count(E) ''",0),"Sin datos")`
  );

  [sh.getRange('A8:B8'), sh.getRange('D8:E8')].forEach(r =>
    r.setBackground(BRAND.header).setFontColor('#ffffff').setFontWeight('bold')
  );
  sh.getRange('E9:E30').setHorizontalAlignment('center');

  [240, 140, 30, 240, 120, 30].forEach((w, i) => sh.setColumnWidth(i + 1, w));

  // Gráfico de estados
  const chart = sh.newChart()
    .asPieChart()
    .addRange(sh.getRange('A9:B11'))
    .setTitle('Contactos por estado')
    .set3D()
    .setColors(['#f59e0b', '#3b82f6', '#22c55e'])
    .setPosition(14, 1, 0, 0)
    .setOption('width', 420)
    .setOption('height', 280)
    .build();
  sh.insertChart(chart);
}

/* ───────────────────────── Utilidades ───────────────────────── */

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
