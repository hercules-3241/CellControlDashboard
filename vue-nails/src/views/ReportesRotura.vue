<template>
  <div class="min-h-screen bg-gray-50/50 dark:bg-gray-950">
    <!-- Header -->
    <header class="page-header">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Solicitudes</h1>
            <p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Historial de solicitudes de celulares</p>
          </div>
          <div class="flex items-center gap-2">
            <button 
              @click="cargarDatos"
              :disabled="loading"
              class="btn-primary"
            >
              <svg 
                class="w-4 h-4" 
                :class="{ 'animate-spin': loading }"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {{ loading ? 'Cargando...' : 'Actualizar' }}
            </button>
            <button 
              @click="exportarExcel"
              :disabled="solicitudesFiltradas.length === 0"
              class="btn-success"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M7 10l5 5m0 0l5-5m-5 5V4" />
              </svg>
              Exportar
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Error Message -->
      <div v-if="error" class="mb-6 card border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/20 p-4">
        <div class="flex items-center gap-3">
          <div class="flex-shrink-0 w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
            <svg class="h-4 w-4 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
          </div>
          <p class="text-sm font-medium text-red-700 dark:text-red-300">{{ error }}</p>
        </div>
      </div>

      <!-- KPIs -->
      <div v-if="solicitudes.length > 0" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="kpi-card bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm opacity-90 font-medium">Total Solicitudes</p>
              <p class="text-3xl font-bold mt-1">{{ solicitudes.length }}</p>
            </div>
            <svg class="w-10 h-10 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>

        <div class="kpi-card bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm opacity-90 font-medium">Resueltas</p>
              <p class="text-3xl font-bold mt-1">{{ estadisticas.resueltas }}</p>
              <p class="text-xs opacity-80 mt-1">{{ solicitudes.length > 0 ? ((estadisticas.resueltas / solicitudes.length) * 100).toFixed(0) : 0 }}%</p>
            </div>
            <svg class="w-10 h-10 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div class="kpi-card bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm opacity-90 font-medium">Regiones</p>
              <p class="text-3xl font-bold mt-1">{{ estadisticas.regiones.size }}</p>
              <p class="text-xs opacity-80 mt-1">involucradas</p>
            </div>
            <svg class="w-10 h-10 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
        </div>

        <div class="kpi-card bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm opacity-90 font-medium">Tipos</p>
              <p class="text-3xl font-bold mt-1">{{ estadisticas.tipos.size }}</p>
              <p class="text-xs opacity-80 mt-1">de solicitud</p>
            </div>
            <svg class="w-10 h-10 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div v-if="solicitudes.length > 0" class="mb-6 flex flex-col sm:flex-row gap-3">
        <div class="flex-1">
          <input 
            type="text"
            v-model="busqueda"
            placeholder="Buscar por solicitante, motivo o usuario..."
            class="input-pro"
          />
        </div>
        <div>
          <select
            v-model="filtroTipo"
            class="select-pro"
          >
            <option value="">Todos los tipos</option>
            <option v-for="tipo in tiposUnicos" :key="tipo" :value="tipo">{{ formatearTipo(tipo) }}</option>
          </select>
        </div>
        <div>
          <select
            v-model="filtroEstado"
            class="select-pro"
          >
            <option value="">Todos los estados</option>
            <option v-for="estado in estadosUnicos" :key="estado" :value="estado">{{ estado }}</option>
          </select>
        </div>
        <div>
          <select
            v-model="filtroRegion"
            class="select-pro"
          >
            <option value="">Todas las regiones</option>
            <option v-for="region in regionesUnicas" :key="region" :value="region">{{ formatearRegion(region) }}</option>
          </select>
        </div>
      </div>

      <!-- Tabla -->
      <div v-if="solicitudesFiltradas.length > 0" class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead class="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 sticky top-0 z-10">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">#</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Fecha</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Solicitante</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Tipo</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Región</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Motivo</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
              <tr 
                v-for="(sol, index) in solicitudesPaginadas"
                :key="sol.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ (paginaActual - 1) * itemsPorPagina + index + 1 }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ formatearFecha(sol.fecha) }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm">
                    <div class="font-medium text-gray-900 dark:text-gray-100">{{ sol.nomSolicitante }}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">{{ sol.usuario }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="px-3 py-1 text-xs font-semibold rounded-full"
                    :class="getTipoClass(sol.tipoSolicitud)"
                  >
                    {{ formatearTipo(sol.tipoSolicitud) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                    :class="getRegionClass(sol.region)">
                    {{ formatearRegion(sol.region) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-md">
                  {{ sol.motivo }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="px-3 py-1 text-xs font-semibold rounded-full"
                    :class="getEstadoClass(sol.estado)"
                  >
                    {{ sol.estado }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginación -->
        <div v-if="totalPaginas > 1" class="bg-gray-50 dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
          <div class="flex-1 flex justify-between sm:hidden">
            <button @click="paginaActual--" :disabled="paginaActual === 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed">
              Anterior
            </button>
            <button @click="paginaActual++" :disabled="paginaActual === totalPaginas"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed">
              Siguiente
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <p class="text-sm text-gray-700 dark:text-gray-300">
              Mostrando
              <span class="font-medium">{{ (paginaActual - 1) * itemsPorPagina + 1 }}</span>
              a
              <span class="font-medium">{{ Math.min(paginaActual * itemsPorPagina, solicitudesFiltradas.length) }}</span>
              de
              <span class="font-medium">{{ solicitudesFiltradas.length }}</span>
              solicitudes
            </p>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button @click="paginaActual--" :disabled="paginaActual === 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
              <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200">
                Página {{ paginaActual }} de {{ totalPaginas }}
              </span>
              <button @click="paginaActual++" :disabled="paginaActual === totalPaginas"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading && solicitudes.length === 0" class="flex items-center justify-center py-12">
        <div class="text-center">
          <svg class="animate-spin h-12 w-12 text-red-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-gray-600 dark:text-gray-400">Cargando solicitudes...</p>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && solicitudes.length === 0 && !error" class="text-center py-12">
        <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">Sin solicitudes</h3>
        <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">No se encontraron solicitudes.</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import lineasService from '../services/lineasService';
import { exportToExcel } from '../utils/exportExcel';
import { separarMotivo } from '../utils/solicitudes';

const loading = ref(false);
const error = ref(null);
const solicitudes = ref([]);
const busqueda = ref('');
const filtroTipo = ref('');
const filtroEstado = ref('');
const filtroRegion = ref('');
const paginaActual = ref(1);
const itemsPorPagina = 20;

watch([busqueda, filtroTipo, filtroEstado, filtroRegion], () => {
  paginaActual.value = 1;
});

// Estadísticas
const estadisticas = computed(() => {
  if (solicitudes.value.length === 0) {
    return { resueltas: 0, regiones: new Set(), tipos: new Set() };
  }
  return {
    resueltas: solicitudes.value.filter(s => s.estado === 'RESUELTA').length,
    regiones: new Set(solicitudes.value.map(s => s.region).filter(Boolean)),
    tipos: new Set(solicitudes.value.map(s => s.tipoSolicitud).filter(Boolean))
  };
});

// Opciones de filtro
const tiposUnicos = computed(() => 
  [...new Set(solicitudes.value.map(s => s.tipoSolicitud).filter(Boolean))].sort()
);
const estadosUnicos = computed(() => 
  [...new Set(solicitudes.value.map(s => s.estado).filter(Boolean))].sort()
);
const regionesUnicas = computed(() => 
  [...new Set(solicitudes.value.map(s => s.region).filter(Boolean))].sort()
);

// Filtrado
const solicitudesFiltradas = computed(() => {
  let filtradas = [...solicitudes.value];

  if (filtroTipo.value) {
    filtradas = filtradas.filter(s => s.tipoSolicitud === filtroTipo.value);
  }
  if (filtroEstado.value) {
    filtradas = filtradas.filter(s => s.estado === filtroEstado.value);
  }
  if (filtroRegion.value) {
    filtradas = filtradas.filter(s => s.region === filtroRegion.value);
  }
  if (busqueda.value.trim()) {
    const q = busqueda.value.toLowerCase().trim();
    filtradas = filtradas.filter(s =>
      (s.nomSolicitante || '').toLowerCase().includes(q) ||
      (s.motivo || '').toLowerCase().includes(q) ||
      (s.usuario || '').toLowerCase().includes(q)
    );
  }

  return filtradas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
});

// Paginación
const totalPaginas = computed(() => 
  Math.ceil(solicitudesFiltradas.value.length / itemsPorPagina)
);
const solicitudesPaginadas = computed(() => {
  const inicio = (paginaActual.value - 1) * itemsPorPagina;
  return solicitudesFiltradas.value.slice(inicio, inicio + itemsPorPagina);
});

// Formatear
const formatearFecha = (fecha) => {
  if (!fecha) return 'N/A';
  const date = new Date(fecha + 'T00:00:00');
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatearRegion = (region) => {
  if (!region) return 'N/A';
  return region.replace(/_/g, ' ').toLowerCase()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

const formatearTipo = (tipo) => {
  if (!tipo) return 'N/A';
  return tipo.replace(/_/g, ' ').toLowerCase()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

// Clases
const getRegionClass = (region) => {
  const clases = {
    'NORTE': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    'SUR': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    'ESTE': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    'OESTE': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    'LA_PLATA': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  };
  return clases[region] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
};

const getTipoClass = (tipo) => {
  const clases = {
    'ROBO': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    'CAMBIO_POR_ROTURA': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    'NUEVO': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  };
  return clases[tipo] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
};

const getEstadoClass = (estado) => {
  const clases = {
    'RESUELTA': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    'PENDIENTE': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    'RECHAZADA': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  return clases[estado] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
};

// Cargar datos
const cargarDatos = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await lineasService.obtenerSolicitudes();
    const raw = response.data;
    solicitudes.value = Array.isArray(raw) ? raw : (Array.isArray(raw?.content) ? raw.content : []);
  } catch (err) {
    console.error('Error al cargar solicitudes:', err);
    if (err.response?.status === 401) {
      error.value = 'Error de autenticación. Verifica tus credenciales.';
    } else {
      error.value = err.response?.data?.message || err.message || 'Error al cargar las solicitudes';
    }
  } finally {
    loading.value = false;
  }
};

// Exportar
const exportarExcel = () => {
  if (solicitudesFiltradas.value.length === 0) return;

  const datos = solicitudesFiltradas.value.map(s => {
    const { motivo, observacion } = separarMotivo(s);
    return {
      'Fecha': formatearFecha(s.fecha),
      'Solicitante': s.nomSolicitante,
      'Usuario': s.usuario,
      'Tipo': formatearTipo(s.tipoSolicitud),
      'Motivo': motivo,
      'Observación': observacion,
      'Región': formatearRegion(s.region),
      'Estado': s.estado,
      'Necesita Línea': s.necesitaLinea ? 'Sí' : 'No'
    };
  });

  exportToExcel({
    filename: 'solicitudes.xlsx',
    sheets: [{ name: 'Solicitudes', data: datos }]
  });
};

onMounted(() => {
  cargarDatos();
});
</script>
