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
  async obtenerMovimientos() {
    // The endpoint returns a Spring page (20 items by default): walk every page so views see the full history.
    const size = 500;
    const primera = await apiClient.get('/api/movimientos', { params: { page: 0, size } });
    const pagina = primera.data;
    if (!Array.isArray(pagina?.content)) return primera;

    const content = [...pagina.content];
    for (let page = 1; page < pagina.totalPages; page++) {
      const { data } = await apiClient.get('/api/movimientos', { params: { page, size } });
      content.push(...data.content);
    }
    return { ...primera, data: { ...pagina, content } };
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
