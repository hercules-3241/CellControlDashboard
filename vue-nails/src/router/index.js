import { createRouter, createWebHistory } from 'vue-router';
import DashboardReparaciones from '../views/DashboardReparaciones.vue';
import Usuarios from '../views/Usuarios.vue';
import Celulares from '../views/Celulares.vue';
import Regiones from '../views/Regiones.vue';
import ReportesRotura from '../views/ReportesRotura.vue';
import Lineas from '../views/Lineas.vue';
import Roturas from '../views/Roturas.vue';

const routes = [
  {
    path: '/',
    redirect: '/celulares'
  },
  {
    path: '/reparaciones',
    name: 'DashboardReparaciones',
    component: DashboardReparaciones
  },
  {
    path: '/usuarios',
    name: 'Usuarios',
    component: Usuarios
  },
  {
    path: '/celulares',
    name: 'Celulares',
    component: Celulares
  },
  {
    path: '/regiones',
    name: 'Regiones',
    component: Regiones
  },
  {
    path: '/roturas',
    name: 'Roturas',
    component: Roturas
  },
  {
    path: '/reportes-rotura',
    name: 'ReportesRotura',
    component: ReportesRotura
  },
  {
    path: '/lineas',
    name: 'Lineas',
    component: Lineas
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
