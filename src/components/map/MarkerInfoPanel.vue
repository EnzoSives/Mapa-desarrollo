<template>
  <div v-if="selectedMarker" class="info-panel q-pa-md">
    <q-card>
      <q-card-section class="row items-center">
        <div class="text-h6">{{ selectedMarker.nombreApellido }}</div>
        <q-space />
        <q-btn icon="close" flat round dense @click="emit('close-panel')" />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <p><strong>Dirección:</strong> {{ selectedMarker.direccion || 'No disponible' }}</p>
        <p><strong>Teléfono:</strong> {{ selectedMarker.telefono || 'No disponible' }}</p>
        <p><strong>DNI:</strong> {{ selectedMarker.dni || 'No disponible' }}</p>

        <div v-if="selectedMarker.programas && selectedMarker.programas.length">
          <p class="q-mt-md"><strong>Programas y Ayudas:</strong></p>
          <ul>
            <li v-for="(programa, index) in selectedMarker.programas" :key="`prog-${index}`">
              {{ programa }}{{ selectedMarker.ayudas?.[index] ? `: ${selectedMarker.ayudas[index]}` : '' }}
            </li>
          </ul>
        </div>
        <p v-else><strong>Programas y Ayudas:</strong> No disponibles</p>

        <div v-if="selectedMarker.integrantes && selectedMarker.integrantes.length">
          <p class="q-mt-md"><strong>Integrantes:</strong></p>
          <ul>
            <li v-for="(integrante, index) in selectedMarker.integrantes" :key="`int-${index}`">
              {{ integrante }}
            </li>
          </ul>
        </div>
        <p v-else><strong>Integrantes:</strong> No disponibles</p>

        <p v-if="selectedMarker.notas" class="q-mt-md"><strong>Notas:</strong> {{ selectedMarker.notas }}</p>
        <p v-else class="q-mt-md"><strong>Notas:</strong> No disponibles</p>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn flat label="Imprimir" color="primary" @click="imprimir" />
        <q-btn flat label="Generar PDF" color="primary" @click="generarPDF" />
        <q-btn
          v-if="permissions.puedeEditar"
          flat
          label="Editar"
          color="secondary"
          @click="emit('edit-marker', selectedMarker.id.toString())"
        />
        <q-btn
          v-if="permissions.puedeEliminar"
          flat
          label="Eliminar"
          color="negative"
          @click="emit('delete-marker', selectedMarker.id.toString())"
        />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import jsPDF from 'jspdf';
import { useQuasar } from 'quasar';
import { Marcador as StoreMarcador } from 'src/stores/gisStore';

const props = defineProps<{
  selectedMarker: StoreMarcador | null;
  permissions: {
    puedeEditar: boolean;
    puedeEliminar: boolean;
  };
}>();

const emit = defineEmits<{
  (e: 'close-panel'): void;
  (e: 'edit-marker', markerId: string): void;
  (e: 'delete-marker', markerId: string): void;
}>();

const $q = useQuasar();

const generarPDF = () => {
  if (!props.selectedMarker) return;
  const marker = props.selectedMarker;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(marker.nombreApellido, 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);

  let yPos = 30;
  const addText = (label: string, value?: string | string[] | null) => {
    if (value && value.length > 0) {
      doc.text(`${label}: ${Array.isArray(value) ? value.join(', ') : value}`, 14, yPos);
      yPos += 7;
    }
  };

  const addList = (label: string, list?: string[] | null, itemPrefix = '  - ') => {
    if (list && list.length > 0) {
      doc.text(label, 14, yPos);
      yPos += 7;
      list.forEach(item => {
        if (yPos > 280) { doc.addPage(); yPos = 20; }
        doc.text(itemPrefix + item, 14, yPos);
        yPos += 7;
      });
    } else {
      doc.text(`${label}: No disponibles`, 14, yPos);
      yPos +=7;
    }
  };


  addText('Dirección', marker.direccion);
  addText('Teléfono', marker.telefono);
  addText('DNI', marker.dni);

  if (marker.programas && marker.programas.length > 0) {
    yPos += 3;
    doc.text('Programas y Ayudas:', 14, yPos);
    yPos += 7;
    marker.programas.forEach((programa, index) => {
      const ayudaText = marker.ayudas?.[index] ? `: ${marker.ayudas[index]}` : '';
      if (yPos > 280) { doc.addPage(); yPos = 20; }
      doc.text(`  - ${programa}${ayudaText}`, 14, yPos);
      yPos += 7;
    });
  } else {
    addText('Programas y Ayudas', 'No disponibles');
  }

  addList('Integrantes', marker.integrantes);
  addText('Notas', marker.notas);

  doc.save(`${marker.nombreApellido.replace(/\s+/g, '_')}_info.pdf`);
  $q.notify({
    type: 'positive',
    message: 'PDF generado con éxito.',
  });
};

const imprimir = () => {
  if (!props.selectedMarker) return;
  const marker = props.selectedMarker;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    let content = `<html><head><title>Imprimir Marcador: ${marker.nombreApellido}</title>`;
    content += `<style>
      body { font-family: sans-serif; margin: 20px; }
      h1 { font-size: 18px; }
      p { font-size: 12px; margin-bottom: 5px; }
      ul { font-size: 12px; padding-left: 20px; margin-top: 0px; }
      li { margin-bottom: 3px; }
      strong { font-weight: bold; }
    </style></head><body>`;
    content += `<h1>${marker.nombreApellido}</h1>`;
    if (marker.direccion) content += `<p><strong>Dirección:</strong> ${marker.direccion}</p>`;
    if (marker.telefono) content += `<p><strong>Teléfono:</strong> ${marker.telefono}</p>`;
    if (marker.dni) content += `<p><strong>DNI:</strong> ${marker.dni}</p>`;

    if (marker.programas && marker.programas.length > 0) {
      content += `<p><strong>Programas y Ayudas:</strong></p><ul>`;
      marker.programas.forEach((programa, index) => {
        const ayudaText = marker.ayudas?.[index] ? `: ${marker.ayudas[index]}` : '';
        content += `<li>${programa}${ayudaText}</li>`;
      });
      content += `</ul>`;
    } else {
      content += `<p><strong>Programas y Ayudas:</strong> No disponibles</p>`;
    }

    if (marker.integrantes && marker.integrantes.length > 0) {
      content += `<p><strong>Integrantes:</strong></p><ul>`;
      marker.integrantes.forEach(integrante => {
        content += `<li>${integrante}</li>`;
      });
      content += `</ul>`;
    } else {
      content += `<p><strong>Integrantes:</strong> No disponibles</p>`;
    }

    if (marker.notas) content += `<p><strong>Notas:</strong> ${marker.notas}</p>`;
     else {
      content += `<p><strong>Notas:</strong> No disponibles</p>`;
    }

    content += `<script>setTimeout(() => { window.print(); window.close(); }, 500);</script>`;
    content += `</body></html>`;

    printWindow.document.write(content);
    printWindow.document.close();
  } else {
    $q.notify({
      type: 'negative',
      message: 'No se pudo abrir la ventana de impresión. Verifique la configuración de su navegador.',
    });
  }
};

</script>

<style scoped>
.info-panel {
  position: absolute; /* Or fixed, depending on desired behavior */
  top: 10px;
  left: 10px;
  width: 350px;
  max-height: calc(100vh - 20px); /* Example max height */
  overflow-y: auto;
  background-color: white;
  border: 1px solid #ddd;
  z-index: 1010; /* Ensure it's above map but below modals if any */
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
.q-card-section p strong {
  font-weight: 600;
}
.q-card-section ul {
  padding-left: 20px;
  list-style-type: disc;
}
</style>
