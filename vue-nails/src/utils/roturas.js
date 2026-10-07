import { separarMotivo } from './solicitudes.js';

const DIA_MS = 864e5;
const VENTANA_RIESGO_DIAS = 90;
const DIAS_POSIBLE_DUPLICADO = 2;
const SIN_CATEGORIA = 'SIN CATEGORÍA';
const ORDEN_NIVEL = { alto: 0, medio: 1, bajo: 2 };

// Dates arrive as 'YYYY-MM-DD'; compare them as UTC days so timezones never shift a day.
const diaDe = (fecha) => Date.parse(`${fecha}T00:00:00Z`) / DIA_MS;
const diaHoy = (hoy) => Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()) / DIA_MS;
const diasEntre = (desde, hasta) => Math.round(diaDe(hasta) - diaDe(desde));

const mediana = (valores) => {
  if (valores.length === 0) return null;
  const ordenados = [...valores].sort((a, b) => a - b);
  const medio = ordenados.length >> 1;
  return ordenados.length % 2 ? ordenados[medio] : Math.round((ordenados[medio - 1] + ordenados[medio]) / 2);
};

/**
 * El reparto se carga como texto libre ("46ayu", "Ayu 46", "Rto 100", "100"): llevarlo a una forma única.
 */
export function normalizarReparto(texto) {
  const limpio = (texto || '').toLowerCase().trim().replace(/\s+/g, ' ');
  const numero = /\d+/.exec(limpio)?.[0];
  if (!numero) return limpio;
  return /ayu/.test(limpio) ? `ayu ${numero}` : `rto ${numero}`;
}

const claveReparto = (region, reparto) => `${region || ''}|${normalizarReparto(reparto)}`;

export function categoriaDe(solicitud) {
  const { motivo } = separarMotivo(solicitud);
  return /^[A-ZÁÉÍÓÚÑ ]+$/.test(motivo) ? motivo : SIN_CATEGORIA;
}

export function filtrarRoturas(solicitudes) {
  return solicitudes.filter(s => s.tipoSolicitud === 'CAMBIO_POR_ROTURA' && s.usuarioCreador !== 'prueba' && s.fecha);
}

function agruparPorReparto(roturas) {
  const grupos = new Map();
  for (const s of roturas) {
    const clave = claveReparto(s.region, s.usuario);
    if (!grupos.has(clave)) grupos.set(clave, []);
    grupos.get(clave).push(s);
  }
  for (const lista of grupos.values()) lista.sort((a, b) => a.fecha.localeCompare(b.fecha));
  return grupos;
}

/**
 * Repartos con más de una rotura, ordenados por riesgo.
 * alto: 2+ roturas en los últimos 90 días · medio: 3+ roturas en total · bajo: el resto.
 */
export function rankingReincidentes(roturas, usuarios, hoy) {
  const usuariosPorClave = new Map(usuarios.map(u => [claveReparto(u.region, u.numReparto), u]));
  const hoyDia = diaHoy(hoy);

  const ranking = [];
  for (const [clave, lista] of agruparPorReparto(roturas)) {
    if (lista.length < 2) continue;

    const gaps = lista.slice(1).map((s, i) => diasEntre(lista[i].fecha, s.fecha));
    const ultimos90 = lista.filter(s => hoyDia - diaDe(s.fecha) < VENTANA_RIESGO_DIAS).length;
    const usuario = usuariosPorClave.get(clave);
    const nivel = ultimos90 >= 2 ? 'alto' : lista.length >= 3 ? 'medio' : 'bajo';

    ranking.push({
      clave,
      region: lista[0].region,
      reparto: normalizarReparto(lista[0].usuario),
      cargo: usuario?.cargo ?? null,
      zona: usuario?.zona ?? null,
      cantidad: lista.length,
      diasEntre: gaps,
      minDias: Math.min(...gaps),
      promedioDias: Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length),
      ultimaFecha: lista.at(-1).fecha,
      ultimos90,
      nivel,
      roturas: lista.map((s, i) => ({
        ...separarMotivo(s),
        fecha: s.fecha,
        estado: s.estado,
        solicitante: s.nomSolicitante,
        posibleDuplicado: i > 0 && gaps[i - 1] <= DIAS_POSIBLE_DUPLICADO,
      })),
    });
  }

  return ranking.sort((a, b) =>
    ORDEN_NIVEL[a.nivel] - ORDEN_NIVEL[b.nivel]
    || b.cantidad - a.cantidad
    || b.ultimaFecha.localeCompare(a.ultimaFecha));
}

export function kpisRoturas(roturas, hoy) {
  const hoyDia = diaHoy(hoy);
  const antiguedad = (s) => hoyDia - diaDe(s.fecha);
  const grupos = [...agruparPorReparto(roturas).values()];
  const reincidentes = grupos.filter(g => g.length > 1);
  const gaps = reincidentes.flatMap(g => g.slice(1).map((s, i) => diasEntre(g[i].fecha, s.fecha)));
  const roturasReincidentes = reincidentes.reduce((n, g) => n + g.length, 0);

  return {
    total: roturas.length,
    ultimos30: roturas.filter(s => antiguedad(s) >= 0 && antiguedad(s) < 30).length,
    previos30: roturas.filter(s => antiguedad(s) >= 30 && antiguedad(s) < 60).length,
    repartosAfectados: grupos.length,
    repartosReincidentes: reincidentes.length,
    porcentajeReincidencia: roturas.length ? Math.round((roturasReincidentes / roturas.length) * 100) : 0,
    medianaDiasEntre: mediana(gaps),
  };
}

/**
 * Roturas por mes de los últimos `meses` meses (incluido el actual), desglosadas por `claveFn`.
 */
export function tendenciaMensual(roturas, hoy, meses, claveFn) {
  const resultado = [];
  const indice = new Map();
  for (let i = meses - 1; i >= 0; i--) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    const mes = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const fila = { mes, total: 0, partes: {} };
    indice.set(mes, fila);
    resultado.push(fila);
  }
  for (const s of roturas) {
    const fila = indice.get(s.fecha.slice(0, 7));
    if (!fila) continue;
    const clave = claveFn(s) || 'SIN DATO';
    fila.total++;
    fila.partes[clave] = (fila.partes[clave] || 0) + 1;
  }
  return resultado;
}

export function tasaPorRegion(roturas, usuarios) {
  const filas = new Map();
  const fila = (region) => {
    if (!filas.has(region)) filas.set(region, { region, roturas: 0, usuarios: 0, cada100: 0 });
    return filas.get(region);
  };
  usuarios.forEach(u => { if (u.region) fila(u.region).usuarios++; });
  roturas.forEach(s => { if (s.region) fila(s.region).roturas++; });

  return [...filas.values()]
    .map(f => ({ ...f, cada100: f.usuarios ? Math.round((f.roturas / f.usuarios) * 100) : 0 }))
    .sort((a, b) => b.cada100 - a.cada100 || b.roturas - a.roturas);
}

const nombreModelo = (c) => `${c.marca || ''} ${c.modelo || ''}`
  .trim()
  .replace(/\s+/g, ' ')
  .replace(/\b\p{Ll}/gu, l => l.toUpperCase());

export function roturasPorModelo(celulares) {
  const filas = new Map();
  for (const c of celulares) {
    const modelo = nombreModelo(c);
    if (!modelo) continue;
    if (!filas.has(modelo)) filas.set(modelo, { modelo, equipos: 0, roturas: 0, porEquipo: 0 });
    const f = filas.get(modelo);
    f.equipos++;
    f.roturas += c.cantRoturas || 0;
  }
  return [...filas.values()]
    .map(f => ({ ...f, porEquipo: Math.round((f.roturas / f.equipos) * 100) / 100 }))
    .sort((a, b) => b.porEquipo - a.porEquipo || b.equipos - a.equipos);
}
