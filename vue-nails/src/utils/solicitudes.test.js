import { test } from 'node:test';
import assert from 'node:assert/strict';
import { separarMotivo } from './solicitudes.js';

test('splits a legacy "CATEGORY - text" motivo', () => {
  assert.deepEqual(
    separarMotivo({ motivo: 'MODULO ROTO - lo choco una moto y se rompio la pantalla' }),
    { motivo: 'MODULO ROTO', observacion: 'lo choco una moto y se rompio la pantalla' },
  );
});

test('splits only on the first separator and keeps multiline text', () => {
  assert.deepEqual(
    separarMotivo({ motivo: 'BATERIA - no carga - urgente\nReponer chip' }),
    { motivo: 'BATERIA', observacion: 'no carga - urgente\nReponer chip' },
  );
});

test('uses the observacion field when motivo is only the category', () => {
  assert.deepEqual(
    separarMotivo({ motivo: 'OTRO', observacion: 'Llovio' }),
    { motivo: 'OTRO', observacion: 'Llovio' },
  );
});

test('joins both texts when the motivo embeds one and observacion has another', () => {
  assert.deepEqual(
    separarMotivo({ motivo: 'BATERIA - no carga', observacion: 'Se le mojó' }),
    { motivo: 'BATERIA', observacion: 'no carga / Se le mojó' },
  );
});

test('keeps free text without a category as the motivo', () => {
  assert.deepEqual(
    separarMotivo({ motivo: 'le robaron el celular del camion - en la ruta' }),
    { motivo: 'le robaron el celular del camion - en la ruta', observacion: '' },
  );
});

test('trims whitespace and handles missing values', () => {
  assert.deepEqual(separarMotivo({ motivo: 'MODULO ROTO - Pantalla rota  ' }), { motivo: 'MODULO ROTO', observacion: 'Pantalla rota' });
  assert.deepEqual(separarMotivo({}), { motivo: '', observacion: '' });
});
