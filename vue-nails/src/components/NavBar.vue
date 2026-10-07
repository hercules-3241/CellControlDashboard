<template>
  <nav class="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-2xl border-b border-gray-200/40 dark:border-gray-800/40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <!-- Brand -->
        <router-link to="/" class="flex items-center gap-3 group">
          <div class="relative flex-shrink-0">
            <div class="absolute -inset-1 bg-gradient-to-r from-brand-500 to-indigo-500 rounded-xl blur opacity-0 group-hover:opacity-25 transition-opacity duration-500"></div>
            <div class="relative p-1.5 bg-white dark:bg-gray-900 rounded-xl ring-1 ring-gray-200/50 dark:ring-gray-700/50 shadow-sm">
              <img :src="logoUrl" alt="CellControl" class="h-7 w-auto" />
            </div>
          </div>
          <div class="hidden sm:block">
            <div class="text-base font-bold text-gray-900 dark:text-white tracking-tight">CellControl</div>
            <div class="text-[11px] text-gray-400 dark:text-gray-500 font-medium -mt-0.5">Control de Gestión</div>
          </div>
        </router-link>

        <!-- Desktop nav -->
        <div class="hidden lg:flex items-center gap-1">
          <router-link
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="relative px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200"
            :class="isActive(link.to)
              ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-gray-800/60'"
          >
            <span class="relative z-10 flex items-center gap-2">
              <component :is="link.icon" class="w-4 h-4" />
              {{ link.label }}
            </span>
            <span
              v-if="isActive(link.to)"
              class="absolute bottom-0 left-3 right-3 h-0.5 bg-brand-500 rounded-full"
            ></span>
          </router-link>

          <!-- Separator -->
          <div class="h-5 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>

          <!-- Dark mode -->
          <button
            @click="toggleDark()"
            class="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            :title="isDark ? 'Modo claro' : 'Modo oscuro'"
          >
            <svg v-if="!isDark" class="w-[18px] h-[18px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else class="w-[18px] h-[18px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
        </div>

        <!-- Mobile menu button -->
        <button
          @click="mobileOpen = !mobileOpen"
          class="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path v-if="!mobileOpen" stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="mobileOpen" class="lg:hidden border-t border-gray-200/50 dark:border-gray-800/50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl">
        <div class="px-4 py-3 space-y-1">
          <router-link
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            :class="isActive(link.to)
              ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'"
            @click="mobileOpen = false"
          >
            <component :is="link.icon" class="w-5 h-5" />
            <span>{{ link.label }}</span>
          </router-link>

          <div class="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800">
            <button
              @click="toggleDark()"
              class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
            >
              <span>{{ isDark ? 'Modo Claro' : 'Modo Oscuro' }}</span>
              <svg v-if="!isDark" class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg v-else class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { h, ref, onMounted } from 'vue';
import logoUrl from '../assets/LogoCellControl.png';

const route = useRoute();
const mobileOpen = ref(false);

const isActive = (path) => route.path === path;

// Icon components as render functions
const IconPhone = (props, { attrs }) => h('svg', { ...attrs, fill: 'none', stroke: 'currentColor', 'stroke-width': '2', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z' })
]);
const IconUsers = (props, { attrs }) => h('svg', { ...attrs, fill: 'none', stroke: 'currentColor', 'stroke-width': '2', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' })
]);
const IconReturn = (props, { attrs }) => h('svg', { ...attrs, fill: 'none', stroke: 'currentColor', 'stroke-width': '2', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6' })
]);
const IconClipboard = (props, { attrs }) => h('svg', { ...attrs, fill: 'none', stroke: 'currentColor', 'stroke-width': '2', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' })
]);
const IconTelephone = (props, { attrs }) => h('svg', { ...attrs, fill: 'none', stroke: 'currentColor', 'stroke-width': '2', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' })
]);
const IconAlert = (props, { attrs }) => h('svg', { ...attrs, fill: 'none', stroke: 'currentColor', 'stroke-width': '2', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' })
]);

const navLinks = [
  { to: '/celulares', label: 'Celulares', icon: IconPhone },
  { to: '/usuarios', label: 'Usuarios', icon: IconUsers },
  { to: '/reparaciones', label: 'Devoluciones', icon: IconReturn },
  { to: '/roturas', label: 'Roturas', icon: IconAlert },
  { to: '/reportes-rotura', label: 'Solicitudes', icon: IconClipboard },
  { to: '/lineas', label: 'Líneas', icon: IconTelephone },
];

// Dark mode support
const isDark = ref(false);
const applyDark = (val) => {
  const root = document.documentElement;
  if (val) root.classList.add('dark');
  else root.classList.remove('dark');
};
const toggleDark = () => {
  isDark.value = !isDark.value;
  localStorage.setItem('prefers_dark', isDark.value ? '1' : '0');
  applyDark(isDark.value);
};
onMounted(() => {
  const stored = localStorage.getItem('prefers_dark');
  if (stored === '1') isDark.value = true;
  if (stored === null && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    isDark.value = true;
  }
  applyDark(isDark.value);
});
</script>
