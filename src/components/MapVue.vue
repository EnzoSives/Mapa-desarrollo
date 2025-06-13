<template>
  <q-page class="full-height no-scroll">
    <map-display
      ref="mapDisplayComponent"
      :markers="gisStore.marcadores"
      @map-click="handleMapClick"
      @marker-select="handleMarkerSelect"
      class="mapa"
    />

    <marker-info-panel
      v-if="gisStore.marcadorSeleccionado"
      :selected-marker="gisStore.marcadorSeleccionado"
      :permissions="permisos"
      @close-panel="handleCloseInfoPanel"
      @edit-marker="handleEditMarker"
      @delete-marker="handleDeleteMarker"
    />

    <references-panel :icons="iconosDisponibles" />

    <current-data-panel
      :markers="gisStore.marcadores"
      @select-marker="handleMarkerSelectFromPanel"
    />

    <marker-form-modal
      v-model="modalVisible"
      :is-editing="editando"
      :initial-marker-data="markerToEdit"
      :new-marker-coords="newMarkerInitialCoords"
      :icons-available="iconosDisponibles"
      @submit-marker="handleSubmitMarker"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useGisStore, Marcador } from 'src/stores/gisStore';
import { useQuasar } from 'quasar';
import type { Coordinate } from 'ol/coordinate'; // For handleMapClick payload

// Import child components
import MapDisplay from './map/MapDisplay.vue';
import MarkerInfoPanel from './map/MarkerInfoPanel.vue';
import ReferencesPanel from './map/ReferencesPanel.vue';
import CurrentDataPanel from './map/CurrentDataPanel.vue';
import MarkerFormModal from './map/MarkerFormModal.vue';

const $q = useQuasar();
const gisStore = useGisStore();

// Refs for child components
const mapDisplayComponent = ref<InstanceType<typeof MapDisplay> | null>(null);

// Modal state
const modalVisible = ref(false);
const editando = ref(false);
const markerToEdit = ref<Marcador | null>(null);
const newMarkerInitialCoords = ref<{ lat: number; lon: number } | null>(null);


const rol = ref(localStorage.getItem('rol') || 'Visor'); // Default to 'Visor'

const permisos = computed(() => {
  return {
    puedeCrear: ['superadmin', 'admin', 'user'].includes(rol.value),
    puedeEditar: ['superadmin', 'admin'].includes(rol.value),
    puedeEliminar: ['superadmin', 'admin'].includes(rol.value),
    soloLectura: rol.value === 'visor',
  };
});

const iconosDisponibles = ref([
  { label: 'Ícono Domicilio', value: '/marker-icon.png' },
  { label: 'Ícono Evento', value: '/marker-icon-2.png' },
  { label: 'Ícono Organización', value: '/marker-icon-3.png' },
  // Add more icons as needed, ensure paths are correct in /public
]);


onMounted(() => {
  gisStore.cargarMarcadoresDesdeAPI();
  // console.log('Permisos:', permisos.value); // For debugging
});

// Event Handlers for Child Components

// From MapDisplay: User clicked on the map to potentially create a new marker
const handleMapClick = (coords: Coordinate) => { // coords is [lon, lat] from OpenLayers
  if (permisos.value.soloLectura || !permisos.value.puedeCrear) {
     $q.notify({ type: 'warning', message: 'No tiene permisos para crear marcadores.' });
    return;
  }
  editando.value = false;
  markerToEdit.value = null;
  newMarkerInitialCoords.value = { lon: coords[0], lat: coords[1] };
  modalVisible.value = true;
};

// From MapDisplay (clicked on existing marker icon) or CurrentDataPanel (selected from list)
const handleMarkerSelect = (markerId: string | number) => {
  gisStore.seleccionarMarcador(Number(markerId));
  // Optionally, pan/zoom map to selected marker if mapDisplayComponent is available
  const selected = gisStore.marcadores.find(m => m.id === Number(markerId));
  if (selected && mapDisplayComponent.value?.panToCoordinates) {
     mapDisplayComponent.value.panToCoordinates([selected.longitud, selected.latitud]);
  }
};

const handleMarkerSelectFromPanel = (marker: Marcador) => {
  gisStore.seleccionarMarcador(marker.id);
  if (mapDisplayComponent.value?.panToCoordinates) {
     mapDisplayComponent.value.panToCoordinates([marker.longitud, marker.latitud]);
  }
};


// From MarkerInfoPanel: User wants to close the info panel
const handleCloseInfoPanel = () => {
  gisStore.cerrarInfo();
};

// From MarkerInfoPanel: User wants to edit the selected marker
const handleEditMarker = () => {
  if (permisos.value.soloLectura || !permisos.value.puedeEditar) {
    $q.notify({ type: 'warning', message: 'No tiene permisos para editar marcadores.' });
    return;
  }
  if (gisStore.marcadorSeleccionado) {
    editando.value = true;
    // Deep clone the marker data to avoid direct mutation if MarkerFormModal modifies it before saving
    markerToEdit.value = JSON.parse(JSON.stringify(gisStore.marcadorSeleccionado));
    newMarkerInitialCoords.value = null;
    modalVisible.value = true;
  }
};

// From MarkerInfoPanel: User wants to delete the selected marker
const handleDeleteMarker = async (markerId: string | number) => {
   if (permisos.value.soloLectura || !permisos.value.puedeEliminar) {
    $q.notify({ type: 'warning', message: 'No tiene permisos para eliminar marcadores.' });
    return;
  }
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: '¿Está seguro de que desea eliminar este marcador?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await gisStore.eliminarMarcador(Number(markerId));
    gisStore.cerrarInfo(); // Close info panel if the deleted marker was selected
    $q.notify({ type: 'positive', message: 'Marcador eliminado con éxito.' });
  });
};

// From MarkerFormModal: User submitted the form (create or edit)
const handleSubmitMarker = async (markerDataFromForm: any) => {
  // Adapt markerDataFromForm to the Marcador structure expected by the store if necessary
  // For now, assume MarkerFormModal emits data that is mostly compliant or needs minimal transformation
  // The `id` for new markers might be generated by the backend or MarkerFormModal might send it without id.
  // The store's `agregarMarcador` expects Omit<Marcador, 'id'>.
  // The store's `editarMarcador` expects Marcador (with id).

  // Example adaptation (ensure this matches MarkerFormModal's output and gisStore's Marcador)
  const markerToSubmit: Partial<Marcador> & { coordenadas?: { lat: number, lon: number } } = {
    ...markerDataFromForm,
    // If form uses 'coordenadas', convert to latitud/longitud
    latitud: markerDataFromForm.coordenadas?.lat ?? markerDataFromForm.latitud,
    longitud: markerDataFromForm.coordenadas?.lon ?? markerDataFromForm.longitud,
  };
  delete markerToSubmit.coordenadas; // remove if it was temporary

  // The MarkerFormModal should ideally deal with the 'programas' and 'integrantes' structure
  // to match what gisStore expects (string[]). If not, transform here.
  // For now, assuming they come in the correct format (string[]) or MarkerFormModal handles this.


  try {
    if (editando.value && markerToSubmit.id) {
      await gisStore.editarMarcador(markerToSubmit as Marcador);
      $q.notify({ type: 'positive', message: 'Marcador actualizado con éxito.' });
    } else {
      // Ensure 'id' is not part of the payload for new markers if backend assigns it
      const { id, ...newMarkerPayload } = markerToSubmit;
      await gisStore.agregarMarcador(newMarkerPayload as Omit<Marcador, 'id'>);
      $q.notify({ type: 'positive', message: 'Marcador creado con éxito.' });
    }
    modalVisible.value = false; // Close modal on successful submission
  } catch (error) {
    console.error('Error al guardar marcador:', error);
    $q.notify({ type: 'negative', message: `Error al guardar: ${error}` });
  }
};

// Optional: If MarkerFormModal has a dedicated close/cancel button event
// const handleCloseModal = () => {
//   modalVisible.value = false;
// };

</script>
<style scoped>
.mapa {
  width: 100%;
  height: 100vh; /* Make map take full viewport height */
  position: relative;
}

.no-scroll {
  overflow: hidden; /* Prevent scrolling on the q-page if map handles its own scroll/zoom */
}

/* Styles for positioning child components if needed, though many will use absolute/fixed internally */
/* Example: Ensure panels don't overlap buttons if they are part of MapVue's layout */

</style>
