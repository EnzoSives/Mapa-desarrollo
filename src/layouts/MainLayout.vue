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
        <!-- <div>Quasar v{{ $q.version }}</div> -->
        <q-btn
          flat
          dense
          icon="logout"
          label="Cerrar Sesión"
          class="q-ml-md"
          @click="logout"
        />
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
        <q-btn icon="dark_mode" class="fixed-top-right q-mt-md q-mr-sm" color="dark" @click="$q.dark.toggle()">
  <q-tooltip>Modo oscuro</q-tooltip>
</q-btn>

      </q-list>
    </q-drawer>

    <q-page-container class="no-scroll full-height">
      <router-view class="no-scroll full-height" />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
// import EssentialLink from 'components/EssentialLink.vue';
import { useRouter } from 'vue-router';

// const linksList = [
//   {
//     title: 'Marcadores',
//     caption: 'quasar.dev',
//     icon: 'LocationOn',
//     link: '/tabla',
//   },
// ];

export default defineComponent({
  name: 'MainLayout',

  // components: {
  //   EssentialLink,
  // },

  setup() {
    const leftDrawerOpen = ref(false);

    const router = useRouter();

    const logout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('rol');
      router.push('/');
    };

    return {
      logout,
      // essentialLinks: linksList
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
