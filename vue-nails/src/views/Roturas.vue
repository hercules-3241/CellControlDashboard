<template>
  <div class="min-h-screen bg-gray-50/50 dark:bg-gray-950">
    <!-- Header -->
    <header class="page-header">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Roturas</h1>
            <p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Celulares reportados rotos, reincidencia y tendencias</p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <label class="sr-only" for="filtro-region">Región</label>
            <select id="filtro-region" v-model="region" class="input-select">
              <option value="">Todas las regiones</option>
              <option v-for="r in regiones" :key="r" :value="r">{{ formatearRegion(r) }}</option>
            </select>
            <button @click="cargar" :disabled="loading" class="btn-primary">
              <svg class="w-4 h-4" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {{ loading ? 'Cargando...' : 'Actualizar' }}
            </button>
            <button @click="exportarExcel" :disabled="ranking.length === 0" class="btn-success">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M7 10l5 5m0 0l5-5m-5 5V4" />
              </svg>
              Exportar reincidentes
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <!-- Error -->
      <div v-if="error" class="card border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/20 p-4">
        <p class="text-sm font-medium text-red-700 dark:text-red-300">{{ error }}</p>
      </div>

      <LoadingSpinner v-if="loading && roturas.length === 0" />

      <div v-else-if="!error && roturas.length === 0" class="card p-12 text-center">
        <p class="text-sm font-medium text-gray-900 dark:text-gray-100">No hay roturas registradas</p>
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Probá con otra región o actualizá los datos.</p>
      </div>

      <template v-else-if="roturas.length > 0">
        <!-- KPIs -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="kpi-card bg-gradient-to-br from-red-500 to-red-600">
            <p class="text-sm opacity-90 font-medium">Roturas últimos 30 días</p>
            <p class="text-3xl font-bold mt-1 tabular-nums">{{ kpis.ultimos30 }}</p>
            <p class="text-xs opacity-90 mt-1">{{ variacion30 }}</p>
          </div>
          <div class="kpi-card bg-gradient-to-br from-orange-500 to-orange-600">
            <p class="text-sm opacity-90 font-medium">Roturas totales</p>
            <p class="text-3xl font-bold mt-1 tabular-nums">{{ kpis.total }}</p>
            <p class="text-xs opacity-90 mt-1">en {{ kpis.repartosAfectados }} repartos</p>
          </div>
          <div class="kpi-card bg-gradient-to-br from-purple-500 to-purple-600">
            <p class="text-sm opacity-90 font-medium">Roturas de reincidentes</p>
            <p class="text-3xl font-bold mt-1 tabular-nums">{{ kpis.porcentajeReincidencia }}%</p>
            <p class="text-xs opacity-90 mt-1">{{ kpis.repartosReincidentes }} repartos rompieron más de una vez</p>
          </div>
          <div class="kpi-card bg-gradient-to-br from-sky-500 to-sky-600">
            <p class="text-sm opacity-90 font-medium">Días entre roturas</p>
            <p class="text-3xl font-bold mt-1 tabular-nums">{{ kpis.medianaDiasEntre ?? '—' }}</p>
            <p class="text-xs opacity-90 mt-1">mediana del mismo reparto</p>
          </div>
        </div>

        <!-- Alerta de riesgo -->
        <div v-if="enRiesgo.length > 0" class="card border-red-200 dark:border-red-800/50 bg-red-50/70 dark:bg-red-900/10 p-5">
          <h2 class="text-sm font-bold text-red-800 dark:text-red-300">
            {{ enRiesgo.length }} {{ enRiesgo.length === 1 ? 'reparto rompió' : 'repartos rompieron' }} 2 o más veces en los últimos 90 días
          </h2>
          <div class="mt-3 flex flex-wrap gap-2">
            <button
              v-for="r in enRiesgo"
              :key="r.clave"
              @click="abrirDetalle(r.clave)"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800/60 text-xs font-semibold text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              {{ formatearRegion(r.region) }} · {{ formatearReparto(r.reparto) }}
              <span class="px-1.5 rounded bg-red-600 text-white">{{ r.ultimos90 }}</span>
            </button>
          </div>
        </div>

        <!-- Tendencia mensual -->
        <section class="card p-6">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h2 class="text-base font-bold text-gray-900 dark:text-gray-100">Roturas por mes</h2>
              <p class="text-xs text-gray-500 dark:text-gray-400">Últimos 12 meses</p>
            </div>
            <div class="inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1" role="group" aria-label="Desglose">
              <button
                v-for="op in opcionesDesglose"
                :key="op.valor"
                @click="desglose = op.valor"
                :aria-pressed="desglose === op.valor"
                class="px-3 py-1 text-xs font-semibold rounded-md transition-colors"
                :class="desglose === op.valor ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'"
              >{{ op.label }}</button>
            </div>
          </div>

          <div class="flex items-end gap-1.5 sm:gap-3 h-56">
            <div v-for="m in tendencia" :key="m.mes" class="flex-1 h-full flex flex-col justify-end items-center min-w-0">
              <span class="text-xs font-semibold text-gray-700 dark:text-gray-300 tabular-nums mb-1">{{ m.total || '' }}</span>
              <div
                class="w-full max-w-[44px] flex flex-col-reverse rounded-t-md overflow-hidden"
                :style="{ height: `${(m.total / maxMensual) * 100}%` }"
              >
                <div
                  v-for="serie in series"
                  v-show="m.partes[serie]"
                  :key="serie"
                  :class="colorSerie(serie)"
                  :style="{ height: `${((m.partes[serie] || 0) / (m.total || 1)) * 100}%` }"
                  :title="`${formatearMes(m.mes)} · ${formatearSerie(serie)}: ${m.partes[serie] || 0}`"
                ></div>
              </div>
              <span class="mt-2 text-[11px] text-gray-500 dark:text-gray-400 truncate">{{ formatearMes(m.mes) }}</span>
            </div>
          </div>

          <div class="mt-5 flex flex-wrap gap-x-4 gap-y-2">
            <span v-for="serie in series" :key="serie" class="inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <span class="w-2.5 h-2.5 rounded-sm" :class="colorSerie(serie)"></span>
              {{ formatearSerie(serie) }}
            </span>
          </div>
        </section>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Tasa por región -->
          <section class="card p-6">
            <h2 class="text-base font-bold text-gray-900 dark:text-gray-100">Roturas cada 100 usuarios</h2>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-5">Por región, para comparar regiones de distinto tamaño</p>
            <ul class="space-y-3">
              <li v-for="t in tasas" :key="t.region">
                <div class="flex justify-between text-xs mb-1">
                  <span class="font-semibold text-gray-700 dark:text-gray-300">{{ formatearRegion(t.region) }}</span>
                  <span class="text-gray-500 dark:text-gray-400 tabular-nums">
                    <strong class="text-gray-900 dark:text-gray-100">{{ t.cada100 }}</strong> · {{ t.roturas }} roturas / {{ t.usuarios }} usuarios
                  </span>
                </div>
                <div class="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div
                    class="h-full rounded-full"
                    :class="t.region === region ? 'bg-red-500' : 'bg-orange-400'"
                    :style="{ width: `${(t.cada100 / maxTasa) * 100}%` }"
                  ></div>
                </div>
              </li>
            </ul>
          </section>

          <!-- Por modelo -->
          <section class="card p-6">
            <h2 class="text-base font-bold text-gray-900 dark:text-gray-100">Roturas por equipo según modelo</h2>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-5">Todas las regiones · modelos con 5 o más equipos. Los modelos nuevos llevan menos tiempo en uso.</p>
            <ul class="space-y-3">
              <li v-for="m in modelos" :key="m.modelo">
                <div class="flex justify-between text-xs mb-1">
                  <span class="font-semibold text-gray-700 dark:text-gray-300">{{ m.modelo }}</span>
                  <span class="text-gray-500 dark:text-gray-400 tabular-nums">
                    <strong class="text-gray-900 dark:text-gray-100">{{ m.porEquipo.toFixed(2) }}</strong> · {{ m.roturas }} roturas / {{ m.equipos }} equipos
                  </span>
                </div>
                <div class="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div class="h-full rounded-full bg-sky-500" :style="{ width: `${(m.porEquipo / maxModelo) * 100}%` }"></div>
                </div>
              </li>
            </ul>
          </section>
        </div>

        <!-- Ranking de reincidentes -->
        <section class="card overflow-hidden">
          <div class="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 class="text-base font-bold text-gray-900 dark:text-gray-100">Repartos reincidentes ({{ rankingFiltrado.length }})</h2>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                <span class="font-semibold text-red-600 dark:text-red-400">Alto</span>: 2+ roturas en los últimos 90 días ·
                <span class="font-semibold text-amber-600 dark:text-amber-400">Medio</span>: 3+ roturas en total.
                Hacé click en una fila para ver el historial.
              </p>
            </div>
            <div class="flex gap-2">
              <label class="sr-only" for="buscar-reparto">Buscar reparto</label>
              <input id="buscar-reparto" v-model="busqueda" type="search" placeholder="Buscar reparto..." class="input-select w-40" />
              <label class="sr-only" for="filtro-nivel">Nivel</label>
              <select id="filtro-nivel" v-model="filtroNivel" class="input-select">
                <option value="">Todos los niveles</option>
                <option value="alto">Alto</option>
                <option value="medio">Medio</option>
                <option value="bajo">Bajo</option>
              </select>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead class="bg-gray-50 dark:bg-gray-800/50 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                <tr>
                  <th scope="col" class="px-4 py-3 text-left">Nivel</th>
                  <th scope="col" class="px-4 py-3 text-left">Región</th>
                  <th scope="col" class="px-4 py-3 text-left">Reparto</th>
                  <th scope="col" class="px-4 py-3 text-left">Cargo / Zona</th>
                  <th scope="col" class="px-4 py-3 text-center">Roturas</th>
                  <th scope="col" class="px-4 py-3 text-left">Última</th>
                  <th scope="col" class="px-4 py-3 text-left">Días entre roturas</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                <template v-for="r in rankingFiltrado" :key="r.clave">
                  <tr
                    :id="`reparto-${r.clave}`"
                    class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                    :class="{ 'bg-gray-50 dark:bg-gray-800/40': abierto === r.clave }"
                    tabindex="0"
                    :aria-expanded="abierto === r.clave"
                    @click="alternar(r.clave)"
                    @keydown.enter.prevent="alternar(r.clave)"
                  >
                    <td class="px-4 py-3">
                      <span class="px-2 py-0.5 rounded-full text-xs font-bold" :class="claseNivel[r.nivel]">{{ etiquetaNivel[r.nivel] }}</span>
                    </td>
                    <td class="px-4 py-3 text-gray-700 dark:text-gray-300">{{ formatearRegion(r.region) }}</td>
                    <td class="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">{{ formatearReparto(r.reparto) }}</td>
                    <td class="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                      {{ [formatearCargo(r.cargo), r.zona && formatearRegion(r.zona)].filter(Boolean).join(' · ') || '—' }}
                    </td>
                    <td class="px-4 py-3 text-center font-bold tabular-nums text-gray-900 dark:text-gray-100">{{ r.cantidad }}</td>
                    <td class="px-4 py-3 text-gray-700 dark:text-gray-300 tabular-nums">{{ formatearFecha(r.ultimaFecha) }}</td>
                    <td class="px-4 py-3">
                      <div class="flex flex-wrap gap-1">
                        <span
                          v-for="(d, i) in r.diasEntre"
                          :key="i"
                          class="px-1.5 py-0.5 rounded text-xs font-semibold tabular-nums"
                          :class="d < 60 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'"
                        >{{ d }}d</span>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="abierto === r.clave" class="bg-gray-50/60 dark:bg-gray-900/60">
                    <td colspan="7" class="px-6 py-4">
                      <ol class="relative border-l-2 border-gray-200 dark:border-gray-700 ml-2 space-y-4">
                        <li v-for="(x, i) in r.roturas" :key="i" class="ml-5">
                          <span class="absolute -left-[7px] mt-1.5 w-3 h-3 rounded-full bg-red-500 ring-4 ring-white dark:ring-gray-900"></span>
                          <div class="flex flex-wrap items-center gap-2 text-xs">
                            <span class="font-bold text-gray-900 dark:text-gray-100 tabular-nums">{{ formatearFecha(x.fecha) }}</span>
                            <span v-if="i > 0" class="text-gray-500 dark:text-gray-400">{{ r.diasEntre[i - 1] }} días después</span>
                            <span class="px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-800 font-semibold text-gray-700 dark:text-gray-300">{{ x.motivo || 'Sin motivo' }}</span>
                            <span v-if="x.posibleDuplicado" class="px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 font-semibold">Posible duplicado</span>
                            <span v-if="x.solicitante" class="text-gray-500 dark:text-gray-400">Pidió: {{ x.solicitante }}</span>
                          </div>
                          <p v-if="x.observacion" class="mt-1 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">{{ x.observacion }}</p>
                        </li>
                      </ol>
                    </td>
                  </tr>
                </template>
                <tr v-if="rankingFiltrado.length === 0">
                  <td colspan="7" class="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No hay repartos que coincidan con el filtro</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <p class="text-xs text-gray-400 dark:text-gray-500">
          Las roturas se agrupan por región y número de reparto tal como se cargan en la solicitud: si un reparto lo usan varias personas
          (suplentes, ayudantes), las roturas se suman al mismo reparto. Se excluyen las solicitudes de prueba.
        </p>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import { useRoturas } from '../composables/useRoturas';
import { exportToExcel } from '../utils/exportExcel';

const {
  loading, error, region, regiones, roturas, kpis, ranking, enRiesgo,
  tendenciaPorMotivo, tendenciaPorRegion, tasas, modelos, cargar,
} = useRoturas();

const PALETA = ['bg-red-500', 'bg-orange-400', 'bg-amber-400', 'bg-sky-500', 'bg-violet-500', 'bg-emerald-500', 'bg-pink-500', 'bg-teal-500', 'bg-gray-400'];
const opcionesDesglose = [
  { valor: 'motivo', label: 'Por motivo' },
  { valor: 'region', label: 'Por región' },
];
const etiquetaNivel = { alto: 'Alto', medio: 'Medio', bajo: 'Bajo' };
const claseNivel = {
  alto: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  medio: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  bajo: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const desglose = ref('motivo');
const busqueda = ref('');
const filtroNivel = ref('');
const abierto = ref(null);

const tendencia = computed(() => (desglose.value === 'motivo' ? tendenciaPorMotivo.value : tendenciaPorRegion.value));
const maxMensual = computed(() => Math.max(1, ...tendencia.value.map(m => m.total)));
const maxTasa = computed(() => Math.max(1, ...tasas.value.map(t => t.cada100)));
const maxModelo = computed(() => Math.max(0.01, ...modelos.value.map(m => m.porEquipo)));

// Series ordered by volume so the biggest one sits at the bottom of each bar and gets the strongest color.
const series = computed(() => {
  const totales = {};
  tendencia.value.forEach(m => Object.entries(m.partes).forEach(([k, n]) => { totales[k] = (totales[k] || 0) + n; }));
  return Object.keys(totales).sort((a, b) => totales[b] - totales[a]);
});
const colorSerie = (serie) => PALETA[Math.min(series.value.indexOf(serie), PALETA.length - 1)];

const variacion30 = computed(() => {
  const { ultimos30, previos30 } = kpis.value;
  if (previos30 === 0) return `${previos30} en los 30 días previos`;
  const pct = Math.round(((ultimos30 - previos30) / previos30) * 100);
  return `${pct > 0 ? '+' : ''}${pct}% vs 30 días previos (${previos30})`;
});

const rankingFiltrado = computed(() => {
  const q = busqueda.value.trim().toLowerCase();
  return ranking.value.filter(r =>
    (!filtroNivel.value || r.nivel === filtroNivel.value)
    && (!q || r.reparto.includes(q) || formatearReparto(r.reparto).toLowerCase().includes(q)));
});

const alternar = (clave) => {
  abierto.value = abierto.value === clave ? null : clave;
};

const abrirDetalle = async (clave) => {
  busqueda.value = '';
  filtroNivel.value = '';
  abierto.value = clave;
  await nextTick();
  document.getElementById(`reparto-${clave}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const formatearMes = (mes) => {
  const [anio, m] = mes.split('-');
  return `${MESES[Number(m) - 1]} ${anio.slice(2)}`;
};
const formatearFecha = (fecha) => (fecha ? fecha.split('-').reverse().join('/') : '—');
const capitalizar = (texto) => texto.toLowerCase().replace(/(^|\s)\p{L}/gu, l => l.toUpperCase());
const formatearRegion = (r) => (r ? capitalizar(r.replace(/_/g, ' ')) : '—');
const formatearCargo = (c) => (c ? capitalizar(c.replace(/_/g, ' ')) : '');
const formatearReparto = (r) => capitalizar(r);
const formatearSerie = (s) => (desglose.value === 'region' ? formatearRegion(s) : capitalizar(s));

const exportarExcel = () => {
  const datos = rankingFiltrado.value.map(r => ({
    'Nivel': etiquetaNivel[r.nivel],
    'Región': formatearRegion(r.region),
    'Reparto': formatearReparto(r.reparto),
    'Cargo': formatearCargo(r.cargo),
    'Zona': r.zona ? formatearRegion(r.zona) : '',
    'Roturas': r.cantidad,
    'Roturas últimos 90 días': r.ultimos90,
    'Primera rotura': formatearFecha(r.roturas[0].fecha),
    'Última rotura': formatearFecha(r.ultimaFecha),
    'Días entre roturas': r.diasEntre.join(', '),
    'Mínimo de días': r.minDias,
    'Promedio de días': r.promedioDias,
    'Motivos': r.roturas.map(x => x.motivo).join(', '),
  }));
  exportToExcel({
    filename: 'roturas-reincidentes.xlsx',
    sheets: [{ name: 'Reincidentes', data: datos }],
  });
};

onMounted(cargar);
</script>

<style scoped>
.input-select {
  @apply px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500;
}
</style>
