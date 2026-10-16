/**
 * Backend del registro de la rutina — Google Apps Script ligado a una Google Sheet.
 *
 * Instalación (una sola vez):
 *  1. Crea una Google Sheet en tu Drive (p. ej. "Rutina · Registro").
 *  2. Extensiones › Apps Script. Borra lo que haya y pega este archivo.
 *  3. Configuración del proyecto (engrane) › Propiedades de las secuencias de comandos › Agregar propiedad:
 *       TOKEN = una frase secreta larga (la misma que pondrás en la app).
 *  4. Implementar › Nueva implementación › Tipo: Aplicación web.
 *       Ejecutar como: Yo · Quién tiene acceso: Cualquier persona.
 *  5. Autoriza los permisos y copia la URL que termina en /exec.
 *  6. En la app: Ajustes › pega la URL y el TOKEN.
 *
 * Hoja "Registro": cada fila es una serie. Hoja "Comidas": una fila por día con las comidas marcadas.
 * Puedes ver, filtrar o graficar la hoja libremente;
 * no cambies el orden de las columnas.
 */

var SHEET = 'Registro';
var HEADERS = ['sessionId', 'fecha', 'ejercicioId', 'ejercicio', 'unidad', 'fst7', 'serie', 'peso', 'reps', 'rir', 'ts'];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var body = JSON.parse(e.postData.contents);
    var token = PropertiesService.getScriptProperties().getProperty('TOKEN');
    if (!token || body.token !== token) return json({ ok: false, error: 'Token inválido' });

    if (body.action === 'list') return json({ ok: true, sessions: listSessions(), meals: listMeals() });
    if (body.action === 'upsert') {
      var sessions = body.sessions || [];
      var remove = (body.deleted || []).concat(sessions.map(function (s) { return s.id; }));
      deleteRows(remove);
      appendSessions(sessions);
      upsertMeals(body.meals || []);
      return json({ ok: true, saved: sessions.length });
    }
    return json({ ok: false, error: 'Acción desconocida' });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json({ ok: true, info: 'Registro de rutina activo. Usa POST.' });
}

function sheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET);
  if (!sh) {
    sh = ss.insertSheet(SHEET);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange('A:A').setNumberFormat('@');
    sh.getRange('B:B').setNumberFormat('@');
  }
  return sh;
}

function appendSessions(sessions) {
  var rows = [];
  sessions.forEach(function (s) {
    s.sets.forEach(function (set, i) {
      rows.push([s.id, s.date, s.exerciseId, s.exerciseName || s.exerciseId, s.unit, s.fst7 ? 'sí' : '', i + 1,
        set.w, set.reps, set.rir === undefined || set.rir === null ? '' : set.rir, s.ts]);
    });
  });
  if (!rows.length) return;
  var sh = sheet();
  sh.getRange(sh.getLastRow() + 1, 1, rows.length, HEADERS.length).setValues(rows);
}

function deleteRows(ids) {
  if (!ids.length) return;
  var sh = sheet();
  var last = sh.getLastRow();
  if (last < 2) return;
  var col = sh.getRange(2, 1, last - 1, 1).getValues();
  var set = {};
  ids.forEach(function (id) { set[id] = true; });
  // De abajo hacia arriba para que los índices no se muevan.
  for (var i = col.length - 1; i >= 0; i--) {
    if (set[String(col[i][0])]) sh.deleteRow(i + 2);
  }
}

function listSessions() {
  var sh = sheet();
  var last = sh.getLastRow();
  if (last < 2) return [];
  var values = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
  var byId = {};
  var order = [];
  values.forEach(function (r) {
    var id = String(r[0]);
    if (!id) return;
    if (!byId[id]) {
      byId[id] = {
        id: id,
        date: r[1] instanceof Date ? Utilities.formatDate(r[1], Session.getScriptTimeZone(), 'yyyy-MM-dd') : String(r[1]),
        exerciseId: String(r[2]),
        unit: r[4] === 'lb' ? 'lb' : 'kg',
        fst7: r[5] === 'sí',
        sets: [],
        ts: Number(r[10]) || 0,
      };
      order.push(id);
    }
    var set = { w: Number(r[7]), reps: Number(r[8]) };
    if (r[9] !== '' && r[9] !== null) set.rir = Number(r[9]);
    byId[id].sets[Number(r[6]) - 1] = set;
  });
  return order.map(function (id) {
    byId[id].sets = byId[id].sets.filter(Boolean);
    return byId[id];
  });
}

var MEALS = 'Comidas';
var MEAL_HEADERS = ['fecha', 'comidas', 'total'];

function mealsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(MEALS);
  if (!sh) {
    sh = ss.insertSheet(MEALS);
    sh.appendRow(MEAL_HEADERS);
    sh.setFrozenRows(1);
    sh.getRange('A:A').setNumberFormat('@');
  }
  return sh;
}

/** Una fila por fecha: se reemplaza si ya existe. */
function upsertMeals(meals) {
  if (!meals.length) return;
  var sh = mealsSheet();
  var last = sh.getLastRow();
  var dates = last >= 2 ? sh.getRange(2, 1, last - 1, 1).getValues().map(function (r) { return String(r[0]); }) : [];
  meals.forEach(function (m) {
    var row = [m.date, (m.done || []).join(' · '), (m.done || []).length];
    var i = dates.indexOf(m.date);
    if (i >= 0) sh.getRange(i + 2, 1, 1, 3).setValues([row]);
    else {
      sh.appendRow(row);
      dates.push(m.date);
    }
  });
}

function listMeals() {
  var sh = mealsSheet();
  var last = sh.getLastRow();
  var out = {};
  if (last < 2) return out;
  sh.getRange(2, 1, last - 1, 2).getValues().forEach(function (r) {
    var d = r[0] instanceof Date ? Utilities.formatDate(r[0], Session.getScriptTimeZone(), 'yyyy-MM-dd') : String(r[0]);
    out[d] = String(r[1]) ? String(r[1]).split(' · ') : [];
  });
  return out;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
