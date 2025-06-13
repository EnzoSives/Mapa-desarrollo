<template>
  <div>
    <q-btn
      fab
      icon="list_alt"
      color="primary"
      @click="togglePanel"
      class="data-panel-toggle-btn"
      aria-label="Toggle Current Data Panel"
    />

    <q-card v-if="mostrarDatosActuales" class="current-data-panel q-pa-md" bordered>
      <q-card-section class="row items-center">
        <div class="text-h6">Datos Actuales</div>
        <q-space />
        <q-btn icon="close" flat round dense @click="mostrarDatosActuales = false" />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-input
          dense
          v-model="searchTerm"
          placeholder="Buscar marcadores..."
          clearable
          class="q-mb-md"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-scroll-area style="height: 300px; max-width: 100%;">
          <q-list bordered separator>
            <q-item
              v-for="marker in marcadoresFiltrados"
              :key="marker.id"
              clickable
              v-ripple
              @click="handleMarkerSelect(marker)"
            >
              <q-item-section>
                <q-item-label>{{ marker.nombreApellido }}</q-item-label>
                <q-item-label caption>{{ marker.direccion || 'Sin dirección' }}</q-item-label>
                 <q-item-label caption v-if="marker.dni">DNI: {{ marker.dni }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="marcadoresFiltrados.length === 0 && markers.length > 0">
              <q-item-section class="text-center text-grey">
                No se encontraron marcadores con ese término de búsqueda.
              </q-item-section>
            </q-item>
            <q-item v-if="markers.length === 0">
              <q-item-section class="text-center text-grey">
                No hay marcadores para mostrar.
              </q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from 'vue';
import { QBtn, QCard, QCardSection, QSeparator, QInput, QIcon, QScrollArea, QList, QItem, QItemSection, QItemLabel, QSpace } from 'quasar';
import { Marcador as StoreMarcador } from 'src/stores/gisStore';

const props = defineProps<{
  markers: StoreMarcador[];
}>();

const emit = defineEmits<{
  (e: 'select-marker', marker: StoreMarcador): void;
}>();

const mostrarDatosActuales = ref(false);
const searchTerm = ref('');

const togglePanel = () => {
  mostrarDatosActuales.value = !mostrarDatosActuales.value;
};

const marcadoresFiltrados = computed(() => {
  if (!searchTerm.value) {
    return props.markers;
  }
  const lowerSearchTerm = searchTerm.value.toLowerCase();
  return props.markers.filter(marker =>
    marker.nombreApellido.toLowerCase().includes(lowerSearchTerm) ||
    (marker.direccion && marker.direccion.toLowerCase().includes(lowerSearchTerm)) ||
    (marker.dni && marker.dni.toLowerCase().includes(lowerSearchTerm)) ||
    (marker.telefono && marker.telefono.toLowerCase().includes(lowerSearchTerm)) ||
    (marker.notas && marker.notas.toLowerCase().includes(lowerSearchTerm)) ||
    (marker.programas && marker.programas.join(' ').toLowerCase().includes(lowerSearchTerm)) ||
    (marker.ayudas && marker.ayudas.join(' ').toLowerCase().includes(lowerSearchTerm)) ||
    (marker.integrantes && marker.integrantes.join(' ').toLowerCase().includes(lowerSearchTerm))
  );
});

const handleMarkerSelect = (marker: StoreMarcador) => {
  emit('select-marker', marker);
  // Optional: close panel on selection or keep it open
  // mostrarDatosActuales.value = false;
};

</script>

<style scoped>
.data-panel-toggle-btn {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1000;
}

.current-data-panel {
  position: absolute;
  top: 60px;
  left: 10px;
  width: 300px;
  max-height: calc(100vh - 70px); /* Adjust based on toggle button size and spacing */
  background-color: white;
  border: 1px solid #ddd;
  z-index: 999;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.q-scroll-area {
  border: 1px solid #eee;
}
</style>
