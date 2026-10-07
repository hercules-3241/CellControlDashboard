import axios from 'axios';
import { API_HOST } from './config';
import { installAuth, setCredentials, clearAuth as clearStoredAuth } from './auth';

// Configuración de la API base
const API_BASE_URL = `${API_HOST}/api/estadisticas`;

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos de timeout
});

installAuth(apiClient);

// Interceptor para manejo de errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // El servidor respondió con un código de error
      console.error(`Error ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      // La petición fue hecha pero no hubo respuesta
      console.error('No se recibió respuesta del servidor:', error.message);
    } else {
      // Error al configurar la petición
      console.error('Error en la configuración:', error.message);
    }
    return Promise.reject(error);
  }
);

export default {
  /**
   * Obtener estadísticas de mi región con filtros opcionales
   * @param {string} region - Nombre de la región (opcional)
   * @param {string} fechaDesde - Fecha desde en formato YYYY-MM-DD (opcional)
   * @param {string} fechaHasta - Fecha hasta en formato YYYY-MM-DD (opcional)
   */
  obtenerEstadisticasMiRegion(region = null, fechaDesde = null, fechaHasta = null) {
    const params = {};
    if (region) params.region = region;
    if (fechaDesde) params.fechaDesde = fechaDesde;
    if (fechaHasta) params.fechaHasta = fechaHasta;

    return apiClient.get('/mi-region', { params });
  },

  /**
   * Obtener estadísticas de todas las regiones
   */
  obtenerEstadisticasTodasRegiones() {
    return apiClient.get('/todas-regiones');
  },

  /**
   * Obtener estadísticas de una región específica
   * @param {string} region - Nombre de la región
   * @param {string} fechaDesde - Fecha desde en formato YYYY-MM-DD (opcional)
   * @param {string} fechaHasta - Fecha hasta en formato YYYY-MM-DD (opcional)
   */
  obtenerEstadisticasRegion(region, fechaDesde = null, fechaHasta = null) {
    const params = {};
    if (fechaDesde) params.fechaDesde = fechaDesde;
    if (fechaHasta) params.fechaHasta = fechaHasta;

    return apiClient.get(`/region/${region}`, { params });
  },

  /**
   * Obtener reporte mensual
   * @param {string} mes - Mes en formato YYYY-MM-DD
   * @param {string} region - Nombre de la región (opcional)
   */
  obtenerReporteMensual(mes, region = null) {
    const params = { mes };
    if (region) params.region = region;

    return apiClient.get('/reportes/mensual', { params });
  },

  /**
   * Obtener estadísticas generales (dispositivos, usuarios, asignados)
   */
  obtenerEstadisticasGenerales() {
    return apiClient.get('/generales');
  },

  /**
   * Obtener estadísticas totales generales
   */
  obtenerEstadisticasTotales() {
    return apiClient.get('/totales');
  },

  /**
   * Obtener todos los celulares
   */
  obtenerTodosCelulares() {
    // Reutiliza el mismo host/origin configurado en apiClient para evitar inconsistencias de puerto
    const origin = (() => {
      try {
        return new URL(apiClient.defaults.baseURL).origin;
      } catch {
        return API_HOST;
      }
    })();

    return apiClient.get('/api/celulares', { baseURL: origin });
  },

  /**
   * Cambiar la URL base de la API (útil para cambiar entre puertos)
   * @param {string} baseUrl - Nueva URL base
   */
  setBaseURL(baseUrl) {
    apiClient.defaults.baseURL = baseUrl;
  },

  /**
   * Configurar autenticación con token Bearer
   * @param {string} token - Token de autenticación
   */
  setAuthToken(token) {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  },

  /**
   * Configurar autenticación Basic
   * @param {string} username - Nombre de usuario
   * @param {string} password - Contraseña
   */
  setBasicAuth(username, password) {
    setCredentials(username, password);
  },

  /**
   * Limpiar autenticación
   */
  clearAuth() {
    clearStoredAuth();
  },

  /**
   * Verificar si hay credenciales guardadas
   */
  hasAuth() {
    return !!(localStorage.getItem('auth_token') || 
              (localStorage.getItem('auth_username') && localStorage.getItem('auth_password')));
  },
};
