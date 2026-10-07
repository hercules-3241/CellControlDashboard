import axios from 'axios';
import { API_HOST, joinUrl } from './config';

const TOKEN_KEY = 'auth_token';
const USERNAME_KEY = 'auth_username';
const PASSWORD_KEY = 'auth_password';

let pendingLogin = null;

/**
 * Guardar credenciales. Si cambian, se descarta el token para forzar un nuevo login.
 */
export function setCredentials(username, password) {
  if (!username || !password) {
    clearAuth();
    return;
  }
  const changed = localStorage.getItem(USERNAME_KEY) !== username
    || localStorage.getItem(PASSWORD_KEY) !== password;
  localStorage.setItem(USERNAME_KEY, username);
  localStorage.setItem(PASSWORD_KEY, password);
  if (changed) localStorage.removeItem(TOKEN_KEY);
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
  localStorage.removeItem(PASSWORD_KEY);
}

/**
 * Canjear las credenciales guardadas por un JWT.
 */
export function login() {
  // Several views fire requests in parallel on mount; share a single login request.
  if (!pendingLogin) {
    const username = localStorage.getItem(USERNAME_KEY);
    const password = localStorage.getItem(PASSWORD_KEY);
    if (!username || !password) {
      return Promise.reject(new Error('No hay credenciales configuradas para iniciar sesión'));
    }
    pendingLogin = axios
      .post(joinUrl(API_HOST, '/api/auth/login'), { username, password }, { timeout: 10000 })
      .then(({ data }) => {
        if (!data?.token) throw new Error('La respuesta de /api/auth/login no incluye token');
        localStorage.setItem(TOKEN_KEY, data.token);
        return data.token;
      })
      .finally(() => {
        pendingLogin = null;
      });
  }
  return pendingLogin;
}

/**
 * Agregar autenticación Bearer a una instancia de axios, con re-login ante un 401.
 * Debe instalarse antes que otros interceptores de respuesta.
 */
export function installAuth(client) {
  client.interceptors.request.use(async (config) => {
    const token = localStorage.getItem(TOKEN_KEY) || await login();
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  client.interceptors.response.use(undefined, async (error) => {
    const { config, response } = error;
    if (response?.status !== 401 || !config || config._authRetried) {
      return Promise.reject(error);
    }
    // The stored token may be expired or issued by another server: log in again and retry once.
    localStorage.removeItem(TOKEN_KEY);
    config._authRetried = true;
    return client(config);
  });
}
