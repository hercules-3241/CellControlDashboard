import axios from 'axios';
import { API_HOST } from './config';
import { installAuth, setCredentials, clearAuth as clearStoredAuth } from './auth';

// Configuración de la API base
const API_BASE_URL = `${API_HOST}/api/reparaciones/estadisticas`;

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

installAuth(apiClient);

// Interceptor para manejo de errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(`Error ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      console.error('No se recibió respuesta del servidor:', error.message);
    } else {
      console.error('Error en la configuración:', error.message);
    }
    return Promise.reject(error);
  }
);

export default {
  /**
   * Obtener datos generales del dashboard
   */
  obtenerDashboard() {
    return apiClient.get('/dashboard');
  },

  /**
   * Obtener estadísticas de proveedores
   */
  obtenerEstadisticasProveedores() {
    return apiClient.get('/proveedores');
  },

  /**
   * Obtener estadísticas de órdenes de reparación
   */
  obtenerEstadisticasOrdenes() {
    return apiClient.get('/ordenes');
  },

  /**
   * Obtener estadísticas de items de reparación
   */
  obtenerEstadisticasItems() {
    return apiClient.get('/items');
  },

  /**
   * Obtener rendimiento de proveedores
   */
  obtenerRendimientoProveedores() {
    return apiClient.get('/rendimiento-proveedores');
  },

  /**
   * Obtener reparaciones más comunes
   */
  obtenerReparacionesComunes() {
    return apiClient.get('/reparaciones-comunes');
  },

  /**
   * Obtener alertas de órdenes vencidas
   */
  obtenerAlertas() {
    return apiClient.get('/alertas');
  },

  /**
   * Cambiar la URL base de la API
   */
  setBaseURL(baseUrl) {
    apiClient.defaults.baseURL = baseUrl;
  },

  /**
   * Configurar autenticación con token Bearer
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
};
