import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('pages/LoginPage.vue'), // Login por defecto
  },
  {
    path: '/home',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true }, // Protege esta ruta
    children: [
      {
        path: '',
        component: () => import('pages/IndexPage.vue'),
        meta: { requiresAuth: true }, // Protege el contenido también
      },
      {
        path: '/tabla',
        component: () => import('pages/TablaMarcadores.vue'),
        meta: { requiresAuth: true }, // Protege el contenido también
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
