import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizarReparto,
  filtrarRoturas,
  rankingReincidentes,
  kpisRoturas,
  tendenciaMensual,
  tasaPorRegion,
  roturasPorModelo,
  categoriaDe,
} from './roturas.js';

const HOY = new Date(2026, 9, 7); // 2026-10-07

const rotura = (usuario, fecha, extra = {}) => ({
  tipoSolicitud: 'CAMBIO_POR_ROTURA',
  region: 'SUR',
  usuarioCreador: 'Sur',
  usuario,
  fecha,
  motivo: 'MODULO ROTO',
  ...extra,
});

test('normalizarReparto unifies the free-text reparto formats', () => {
  assert.equal(normalizarReparto('100'), 'rto 100');
  assert.equal(normalizarReparto('Rto 100'), 'rto 100');
  assert.equal(normalizarReparto('46ayu'), 'ayu 46');
  assert.equal(normalizarReparto('Ayu 46'), 'ayu 46');
  assert.equal(normalizarReparto('46 Ayu'), 'ayu 46');
  assert.equal(normalizarReparto('  Suplente Nahuel Gomez '), 'suplente nahuel gomez');
  assert.equal(normalizarReparto(null), '');
});

test('filtrarRoturas keeps only breakage requests and drops test data', () => {
  const sol = [
    rotura('1', '2026-01-01'),
    rotura('2', '2026-01-01', { tipoSolicitud: 'ROBO' }),
    rotura('3', '2026-01-01', { usuarioCreador: 'prueba' }),
  ];
  assert.deepEqual(filtrarRoturas(sol).map(s => s.usuario), ['1']);
});

test('rankingReincidentes groups by region + reparto and computes gaps', () => {
  const roturas = [
    rotura('100', '2026-01-10'),
    rotura('Rto 100', '2026-03-11', { motivo: 'BATERIA - no carga' }),
    rotura('100', '2026-09-20'),
    rotura('100', '2026-05-01', { region: 'ESTE' }),
    rotura('7', '2026-02-01'),
  ];
  const usuarios = [{ numReparto: '100', region: 'SUR', cargo: 'REPARTIDOR', zona: 'LANUS' }];

  const ranking = rankingReincidentes(roturas, usuarios, HOY);

  assert.equal(ranking.length, 1, 'only repartos with more than one breakage');
  const [r] = ranking;
  assert.equal(r.region, 'SUR');
  assert.equal(r.reparto, 'rto 100');
  assert.equal(r.cargo, 'REPARTIDOR');
  assert.equal(r.zona, 'LANUS');
  assert.equal(r.cantidad, 3);
  assert.deepEqual(r.diasEntre, [60, 193]);
  assert.equal(r.minDias, 60);
  assert.equal(r.promedioDias, 127);
  assert.equal(r.ultimaFecha, '2026-09-20');
  assert.equal(r.ultimos90, 1);
  assert.deepEqual(r.roturas.map(x => x.motivo), ['MODULO ROTO', 'BATERIA', 'MODULO ROTO']);
  assert.equal(r.roturas[1].observacion, 'no carga');
  assert.equal(r.nivel, 'medio');
});

test('rankingReincidentes flags high risk and probable duplicates, sorted by risk', () => {
  const roturas = [
    rotura('5', '2026-01-01'), rotura('5', '2026-02-01'), rotura('5', '2026-03-01'), rotura('5', '2026-04-01'),
    rotura('9', '2026-08-01'), rotura('9', '2026-08-02'),
  ];
  const ranking = rankingReincidentes(roturas, [], HOY);

  assert.deepEqual(ranking.map(r => [r.reparto, r.nivel]), [['rto 9', 'alto'], ['rto 5', 'medio']]);
  assert.equal(ranking[0].roturas[1].posibleDuplicado, true);
  assert.equal(ranking[0].roturas[0].posibleDuplicado, false);
  assert.equal(ranking[0].cargo, null);
});

test('kpisRoturas compares the last 30 days with the previous 30 and measures recurrence', () => {
  const roturas = [
    rotura('1', '2026-10-01'), rotura('1', '2026-09-20'),
    rotura('2', '2026-09-01'),
    rotura('3', '2026-06-01'),
  ];
  const k = kpisRoturas(roturas, HOY);
  assert.equal(k.total, 4);
  assert.equal(k.ultimos30, 2);
  assert.equal(k.previos30, 1);
  assert.equal(k.repartosAfectados, 3);
  assert.equal(k.repartosReincidentes, 1);
  assert.equal(k.porcentajeReincidencia, 50);
  assert.equal(k.medianaDiasEntre, 11);
});

test('kpisRoturas handles no data', () => {
  const k = kpisRoturas([], HOY);
  assert.equal(k.total, 0);
  assert.equal(k.porcentajeReincidencia, 0);
  assert.equal(k.medianaDiasEntre, null);
});

test('tendenciaMensual returns the last N months, including empty ones, split by a key', () => {
  const roturas = [
    rotura('1', '2026-10-02', { motivo: 'BATERIA - x' }),
    rotura('2', '2026-08-15'),
    rotura('3', '2026-08-20'),
    rotura('4', '2025-01-01'),
  ];
  const t = tendenciaMensual(roturas, HOY, 3, categoriaDe);
  assert.deepEqual(t.map(m => [m.mes, m.total]), [['2026-08', 2], ['2026-09', 0], ['2026-10', 1]]);
  assert.deepEqual(t[0].partes, { 'MODULO ROTO': 2 });
  assert.deepEqual(t[2].partes, { BATERIA: 1 });
});

test('tasaPorRegion normalizes by users in the region and sorts by rate', () => {
  const roturas = [rotura('1', '2026-01-01'), rotura('2', '2026-01-01'), rotura('3', '2026-01-01', { region: 'ESTE' })];
  const usuarios = [
    ...Array(4).fill({ region: 'SUR' }),
    ...Array(1).fill({ region: 'ESTE' }),
    { region: 'NORTE' },
  ];
  assert.deepEqual(tasaPorRegion(roturas, usuarios), [
    { region: 'ESTE', roturas: 1, usuarios: 1, cada100: 100 },
    { region: 'SUR', roturas: 2, usuarios: 4, cada100: 50 },
    { region: 'NORTE', roturas: 0, usuarios: 1, cada100: 0 },
  ]);
});

test('roturasPorModelo merges model spellings and computes breakages per device', () => {
  const celulares = [
    { marca: 'Samsung', modelo: 'A01 Core', cantRoturas: 2 },
    { marca: 'Samsung ', modelo: 'A01  core', cantRoturas: 0 },
    { marca: 'Samsung', modelo: 'A06', cantRoturas: 1 },
  ];
  assert.deepEqual(roturasPorModelo(celulares), [
    { modelo: 'Samsung A01 Core', equipos: 2, roturas: 2, porEquipo: 1 },
    { modelo: 'Samsung A06', equipos: 1, roturas: 1, porEquipo: 1 },
  ]);
});

test('categoriaDe returns the motivo category or a fallback for free text', () => {
  assert.equal(categoriaDe({ motivo: 'MODULO ROTO - pantalla' }), 'MODULO ROTO');
  assert.equal(categoriaDe({ motivo: 'NO PRENDE' }), 'NO PRENDE');
  assert.equal(categoriaDe({ motivo: 'se le cayo al piso' }), 'SIN CATEGORÍA');
});
