<template>
  <q-page class="q-pa-md">
    <q-table
      title="Listado de marcadores"
      :rows="gisStore.marcadores"
      :columns="columns"
      row-key="id"
      flat
      bordered
    >
      <!-- Ícono personalizado -->
      <template v-slot:body-cell-icono="props">
        <q-td>
          <img :src="props.row.icono" alt="icono" width="24" height="24" />
        </q-td>
      </template>

      <!-- Botón para centrar en el mapa -->
      <template v-slot:body-cell-verMapa="props">
        <q-td align="center">
          <q-btn
            color="primary"
            icon="place"
            size="sm"
            round
            flat
            @click="centrarEnMapa(props.row.latitud, props.row.longitud)"
          >
            <q-tooltip>Ver en el mapa</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { useGisStore } from 'src/stores/gisStore';
import { onMounted } from 'vue';

const gisStore = useGisStore();

onMounted(() => {
  if (gisStore.marcadores.length === 0) {
    gisStore.cargarMarcadoresDesdeAPI();
  }
});

function centrarEnMapa(lat: number, lon: number) {
  console.log('Centrando en:', lat, lon);
  gisStore.coordenadasSeleccionadas = [lon, lat];
  gisStore.panelActivo = 'mapa';
}

const columns = [
  { name: 'id', label: 'ID', align: 'left', field: 'id' },
  { name: 'nombre', label: 'Nombre', align: 'left', field: 'nombre' },
  {
    name: 'descripcion',
    label: 'Descripción',
    align: 'left',
    field: 'descripcion',
  },
  { name: 'icono', label: 'Ícono', align: 'center', field: 'icono' },
  // { name: 'verMapa', label: 'Mapa', align: 'center' },
];
</script>
