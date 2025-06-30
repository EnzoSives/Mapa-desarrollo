<template>
  <q-layout view="lHh Lpr lFf" class="no-scroll">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>Mapa Madariaga</q-toolbar-title>

        <!-- Menú de usuario -->
        <q-btn-dropdown
          flat
          dense
          :label="userName"
          icon="account_circle"
          class="q-ml-md"
        >
          <q-list>
            <q-item clickable v-close-popup @click="logout">
              <q-item-section avatar>
                <q-icon name="logout" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Cerrar Sesión</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered>
      <q-list padding>
        <q-item>
          <q-item-section>
            <q-item-label class="text-h6 text-bold"
              >Mapa Madariaga</q-item-label
            >
          </q-item-section>
        </q-item>
        <q-item
          clickable
          @click="$router.push('/home')"
          :active="$route.path === '/home'"
          active-class="bg-primary text-white"
          v-ripple
        >
          <q-tooltip anchor="center right" self="center left" :offset="[10, 0]">
            Mapa Madariaga
          </q-tooltip>

          <q-item-section avatar>
            <q-icon name="table_chart" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Inicio</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          clickable
          @click="$router.push('/tabla')"
          :active="$route.path === '/tabla'"
          active-class="bg-primary text-white"
          v-ripple
        >
          <q-tooltip anchor="center right" self="center left" :offset="[10, 0]">
            Ir a Marcadores
          </q-tooltip>

          <q-item-section avatar>
            <q-icon name="table_chart" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Marcadores</q-item-label>
          </q-item-section>
        </q-item>
        <q-btn
          :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
          class="fixed-top-right q-mt-md q-mr-sm"
          :color="$q.dark.isActive ? 'white' : 'dark'"
          :text-color="$q.dark.isActive ? 'black' : 'white'"
          @click="$q.dark.toggle()"
        >
          <q-tooltip>
            {{ $q.dark.isActive ? 'Modo Claro' : 'Modo Oscuro' }}
          </q-tooltip>
        </q-btn>
      </q-list>
    </q-drawer>

    <q-page-container class="no-scroll full-height">
      <router-view class="no-scroll full-height" />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'MainLayout',

  setup() {
    const leftDrawerOpen = ref(false);
    const router = useRouter();

    // Obtener el nombre del usuario desde localStorage
    const userName = computed(() => {
      const user = localStorage.getItem('user');
      if (user) {
        try {
          // Intentar parsear como JSON
          const userData = JSON.parse(user);
          return (
            userData.name || userData.username || userData.email || 'Usuario'
          );
        } catch (error) {
          // Si no es JSON válido, asumir que es un string simple
          return user || 'Usuario';
        }
      }
      return 'Usuario';
    });

    const logout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('rol');
      router.push('/');
    };

    return {
      userName,
      logout,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
});
</script>

<style>
/* ✨ Estilo global para remover scrolls no deseados */
html,
body,
#q-app {
  height: 100%;
  margin: 0;
  overflow: hidden;
}

.no-scroll {
  overflow: hidden !important;
}
</style>
