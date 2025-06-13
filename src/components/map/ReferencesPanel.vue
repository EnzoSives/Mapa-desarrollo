<template>
  <div>
    <q-btn
      fab
      icon="info_outline"
      color="primary"
      @click="toggleReferences"
      class="references-toggle-btn"
      aria-label="Toggle References Panel"
    />

    <q-card v-if="mostrarReferencias" class="references-panel q-pa-md" bordered>
      <q-card-section>
        <div class="text-h6">Referencias de Íconos</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-list dense>
          <q-item v-for="icon in icons" :key="icon.value">
            <q-item-section avatar>
              <!-- Assuming icon.value is a URL or path to the image -->
              <q-avatar square>
                <img :src="icon.value" :alt="icon.label" style="width: 24px; height: 24px;" />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              {{ icon.label }}
            </q-item-section>
          </q-item>
          <q-item v-if="!icons || icons.length === 0">
            <q-item-section>
              No hay referencias de íconos disponibles.
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue';
import { QBtn, QCard, QCardSection, QSeparator, QList, QItem, QItemSection, QAvatar } from 'quasar'; // Explicitly import Quasar components

// Define the structure for an icon reference
interface IconReference {
  label: string;
  value: string; // URL or path to the icon image, or a name if icons are handled differently
  // Add other properties if needed, e.g., color, category
}

const props = defineProps<{
  icons: IconReference[];
}>();

const mostrarReferencias = ref(false);

const toggleReferences = () => {
  mostrarReferencias.value = !mostrarReferencias.value;
};
</script>

<style scoped>
.references-toggle-btn {
  position: absolute;
  top: 10px; /* Adjust as needed */
  right: 10px; /* Adjust as needed */
  z-index: 1000; /* Ensure it's above the map */
}

.references-panel {
  position: absolute;
  top: 60px; /* Adjust as needed, below the toggle button */
  right: 10px; /* Adjust as needed */
  width: 250px; /* Adjust as needed */
  max-height: 70vh;
  overflow-y: auto;
  z-index: 999; /* Ensure it's above the map but below elements like modals if any */
  background-color: white;
}

/* Optional: Style for the avatar images if they need specific sizing or adjustments */
.q-avatar img {
  object-fit: contain; /* Ensures the whole icon is visible */
}
</style>
