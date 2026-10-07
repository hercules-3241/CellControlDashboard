import { ref, computed } from 'vue';
import lineasService from '../services/lineasService';
import estadisticasService from '../services/estadisticasService';
import {
  filtrarRoturas,
  rankingReincidentes,
  kpisRoturas,
  tendenciaMensual,
  tasaPorRegion,
  roturasPorModelo,
  categoriaDe,
} from '../utils/roturas';

const MESES_TENDENCIA = 12;

const comoLista = (raw) => (Array.isArray(raw) ? raw : (Array.isArray(raw?.content) ? raw.content : []));

/**
 * Datos y métricas de la pantalla de roturas. `ahora` se inyecta para poder fijar la fecha.
 */
export function useRoturas(ahora = () => new Date()) {
  const loading = ref(false);
  const error = ref(null);
  const solicitudes = ref([]);
  const usuarios = ref([]);
  const celulares = ref([]);
  const region = ref('');
  const hoy = ref(ahora());

  const cargar = async () => {
    loading.value = true;
    error.value = null;
    try {
      const [sol, usu, cel] = await Promise.all([
        lineasService.obtenerSolicitudes(),
        lineasService.obtenerUsuarios(),
        estadisticasService.obtenerTodosCelulares(),
      ]);
      solicitudes.value = comoLista(sol.data);
      usuarios.value = comoLista(usu.data);
      celulares.value = comoLista(cel.data);
      hoy.value = ahora();
    } catch (err) {
      console.error('Error al cargar datos de roturas:', err);
      if (err.response?.status === 401) {
        error.value = 'Error de autenticación. Verifica tus credenciales.';
      } else if (err.code === 'ERR_NETWORK') {
        error.value = 'No se puede conectar con el servidor. Verifica que esté activo.';
      } else {
        error.value = `Error al cargar datos: ${err.message}`;
      }
    } finally {
      loading.value = false;
    }
  };

  const todasLasRoturas = computed(() => filtrarRoturas(solicitudes.value));
  const regiones = computed(() => [...new Set(todasLasRoturas.value.map(s => s.region).filter(Boolean))].sort());
  const roturas = computed(() =>
    region.value ? todasLasRoturas.value.filter(s => s.region === region.value) : todasLasRoturas.value);

  const kpis = computed(() => kpisRoturas(roturas.value, hoy.value));
  const ranking = computed(() => rankingReincidentes(roturas.value, usuarios.value, hoy.value));
  const enRiesgo = computed(() => ranking.value.filter(r => r.nivel === 'alto'));
  const tendenciaPorMotivo = computed(() => tendenciaMensual(roturas.value, hoy.value, MESES_TENDENCIA, categoriaDe));
  const tendenciaPorRegion = computed(() => tendenciaMensual(roturas.value, hoy.value, MESES_TENDENCIA, s => s.region));
  // Always across every region: the point is to compare them.
  const tasas = computed(() => tasaPorRegion(todasLasRoturas.value, usuarios.value).filter(t => t.usuarios > 0 && t.roturas > 0));
  const modelos = computed(() => roturasPorModelo(celulares.value).filter(m => m.equipos >= 5));

  return {
    loading,
    error,
    region,
    regiones,
    roturas,
    kpis,
    ranking,
    enRiesgo,
    tendenciaPorMotivo,
    tendenciaPorRegion,
    tasas,
    modelos,
    cargar,
  };
}
