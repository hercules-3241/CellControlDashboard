import axios from 'axios';
import { API_HOST } from './config';
import { installAuth, setCredentials, clearAuth as clearStoredAuth } from './auth';

const apiClient = axios.create({
  baseURL: API_HOST,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

installAuth(apiClient);

export default {
  /**
   * Obtener todos los usuarios con sus líneas
   */
  obtenerUsuarios() {
    return apiClient.get('/api/usuarios');
  },

  /**
   * Obtener todos los movimientos
   */
  obtenerMovimientos() {
    return apiClient.get('/api/movimientos');
  },

  /**
   * Obtener todas las solicitudes
   */
  obtenerSolicitudes() {
    return apiClient.get('/api/solicitudes');
  },

  /**
   * Configurar autenticación Basic
   */
  setBasicAuth(username, password) {
    setCredentials(username, password);
  },
};
