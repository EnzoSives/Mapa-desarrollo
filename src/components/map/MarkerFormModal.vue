<template>
  <q-dialog :model-value="modelValue" @update:model-value="cerrarModal" persistent>
    <q-card style="width: 700px; max-width: 80vw;">
      <q-card-section>
        <div class="text-h6">{{ isEditing ? 'Editar Marcador' : 'Nuevo Marcador' }}</div>
      </q-card-section>

      <q-separator />

      <q-card-section style="max-height: 70vh" class="scroll">
        <q-form ref="formulario" @submit.prevent="validarYGuardar">
          <q-input
            v-model="formData.nombreApellido"
            label="Nombre y Apellido"
            filled
            lazy-rules
            :rules="[val => !!val || 'El nombre es obligatorio']"
          />
          <q-input
            v-model="formData.direccion"
            label="Dirección"
            filled
            lazy-rules
            :rules="[val => !!val || 'La dirección es obligatoria']"
          />
          <q-input
            v-model="formData.telefono"
            label="Teléfono"
            filled
            type="tel"
            :rules="[
              val => !val || /^\d{8,12}$/.test(val) || 'Debe tener entre 8 y 12 dígitos (opcional)'
            ]"
          />
          <q-input
            v-model="formData.dni"
            label="DNI"
            filled
            lazy-rules
            :rules="[
              val => !!val || 'El DNI es obligatorio',
              val => /^\d{7,8}$/.test(val) || 'DNI inválido (debe tener 7 u 8 dígitos)'
            ]"
          />

          <!-- Programas -->
          <div class="q-mt-md">
            <div class="text-subtitle1">Programas</div>
            <div v-for="(programa, index) in formData.programasForm" :key="index" class="row items-center q-mb-sm q-col-gutter-sm">
              <q-select
                v-model="programa.tipo"
                :options="tiposProgramaOptions"
                label="Tipo de Programa"
                filled
                class="col-sm-5 col-xs-12"
                lazy-rules
                :rules="[val => !!val || 'Seleccione un tipo']"
                @update:model-value="programa.detalle = ''" /* Reset detail when type changes */
              />
              <q-select
                v-model="programa.detalle"
                :options="getDetallesProgramaOptions(programa.tipo)"
                label="Detalle Específico"
                filled
                class="col-sm-5 col-xs-12"
                :disable="!programa.tipo || getDetallesProgramaOptions(programa.tipo).length === 0"
                lazy-rules
                :rules="[val => !!val || (getDetallesProgramaOptions(programa.tipo).length > 0 ? 'Seleccione un detalle' : true)]"
              />
              <q-btn flat round icon="delete" @click="eliminarPrograma(index)" class="col-sm-1 col-xs-12 self-center" />
            </div>
            <q-btn label="Agregar Programa" @click="agregarPrograma" color="primary" class="q-mt-sm" />
          </div>

          <!-- Integrantes -->
          <div class="q-mt-md">
            <div class="text-subtitle1">Integrantes del Grupo Familiar</div>
            <div v-for="(integrante, index) in formData.integrantesForm" :key="index" class="row items-center q-mb-sm q-col-gutter-sm">
              <q-input v-model="integrante.nombre" label="Nombre del Integrante" filled class="col-sm-4 col-xs-12" :rules="[val => !!val || 'Nombre obligatorio']"/>
              <q-input v-model="integrante.dni" label="DNI del Integrante" filled class="col-sm-3 col-xs-12" :rules="[val => !!val && /^\d{7,8}$/.test(val) || 'DNI inválido']"/>
              <q-input v-model="integrante.rol" label="Rol/Parentesco" filled class="col-sm-3 col-xs-10" :rules="[val => !!val || 'Rol obligatorio']"/>
              <q-btn flat round icon="delete" @click="eliminarIntegrante(index)" class="col-sm-1 col-xs-2 self-center" />
            </div>
            <q-btn label="Agregar Integrante" @click="agregarIntegrante" color="primary" class="q-mt-sm" />
          </div>

          <q-select
            v-model="formData.icono"
            :options="props.iconsAvailable"
            label="Ícono del Marcador"
            filled
            emit-value
            map-options
            class="q-mt-md"
            lazy-rules
            :rules="[val => !!val || 'Seleccione un ícono']"
          />

          <q-input
            v-model="formData.notas"
            label="Notas Adicionales"
            type="textarea"
            filled
            autogrow
            class="q-mt-md"
          />
        </q-form>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="q-pa-md">
        <q-btn label="Cancelar" color="grey" @click="cerrarModal" />
        <q-btn :label="isEditing ? 'Guardar Cambios' : 'Crear Marcador'" color="primary" @click="validarYGuardar" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, nextTick } from 'vue';
import { QDialog, QCard, QCardSection, QCardActions, QForm, QInput, QSelect, QBtn, QSeparator, useQuasar } from 'quasar';
import type { QForm as QFormType } from 'quasar';
import { Marcador as StoreMarcador } from 'src/stores/gisStore';

// Local form-specific types
interface FormPrograma {
  tipo: string;
  detalle?: string;
}
interface FormIntegrante {
  nombre: string;
  dni: string;
  rol: string;
}
interface IconOption {
  label: string;
  value: string;
}

// This interface represents the shape of formData, aligned with StoreMarcador where possible
interface FormData {
  id?: number; // Store's ID is number. Marcador ID is number.
  nombreApellido: string;
  direccion: string;
  telefono: string; // Store's telefono is string.
  dni: string; // Store's DNI is string.
  latitud: number;
  longitud: number;
  programasForm: FormPrograma[];
  integrantesForm: FormIntegrante[];
  notas?: string;
  icono: string;
}

const props = defineProps<{
  modelValue: boolean; // for v-model
  isEditing: boolean;
  initialMarkerData?: StoreMarcador | null; // Expecting store's Marcador type
  newMarkerCoords?: { lat: number; lon: number } | null; // lon, lat from MapDisplay
  iconsAvailable: IconOption[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'submit-marker', markerData: Partial<StoreMarcador>): void; // Emitting data compatible with store
}>();

const $q = useQuasar();
const formulario = ref<QFormType | null>(null);

const getEmptyFormData = (coords?: { lat: number; lon: number }): FormData => ({
  id: undefined,
  nombreApellido: '',
  direccion: '',
  telefono: '',
  dni: '',
  latitud: coords?.lat ?? 0,
  longitud: coords?.lon ?? 0,
  programasForm: [],
  integrantesForm: [],
  notas: '',
  icono: props.iconsAvailable?.[0]?.value || '',
});

const formData = ref<FormData>(getEmptyFormData(props.newMarkerCoords || undefined));

// Options for Programas select fields, adapted from original MapVue.vue
const tiposProgramaOptions = ref([
  'PROGRAMAS ALIMENTARIOS', 'CONTRAPRESTACIÓN', 'SUBSIDIOS',
  'Asistencia Alimentaria', 'Apoyo Escolar', 'Salud', 'Vivienda', 'Trabajo', 'Otros',
]);

const detallesPorTipoPrograma: Record<string, string[]> = {
  'PROGRAMAS ALIMENTARIOS': ['AM - Ayuda Mensual', 'DBT - Diabéticos', 'ES - Esp. Solidario', 'AU - Ayuda Urgente', 'DE - Dietas Especiales'],
  'CONTRAPRESTACIÓN': ['Gas', 'Luz', 'Banco Materiales'],
  'SUBSIDIOS': ['Subsidio Habitacional', 'Subsidio Desempleo', 'Otro Subsidio'],
  'Asistencia Alimentaria': ['Comedor Comunitario', 'Entrega de Bolsones', 'Tarjeta Alimentar', 'Otra Asistencia Alimentaria'],
  'Apoyo Escolar': ['Becas Estudiantiles', 'Útiles Escolares', 'Clases de Apoyo', 'Otro Apoyo Escolar'],
  'Salud': ['Entrega de Medicamentos', 'Atención Primaria', 'Programas de Vacunación', 'Otra Ayuda Salud'],
  'Vivienda': ['Mejoramiento Habitacional', 'Acceso a Lotes con Servicio', 'Refugios Temporales', 'Otra Ayuda Vivienda'],
  'Trabajo': ['Capacitación Laboral', 'Microemprendimientos', 'Bolsa de Trabajo', 'Otro Apoyo Trabajo'],
  'Otros': ['Asistencia Legal', 'Ayuda por Discapacidad', 'Emergencias Climáticas', 'Otro Tipo de Ayuda'],
};

const getDetallesProgramaOptions = (tipo: string): string[] => {
  return detallesPorTipoPrograma[tipo] || [];
};

watch(() => props.modelValue, (newValue) => {
  if (newValue) { // When modal opens
    if (props.isEditing && props.initialMarkerData) {
      const initial = props.initialMarkerData;
      formData.value = {
        id: initial.id,
        nombreApellido: initial.nombreApellido,
        direccion: initial.direccion,
        telefono: initial.telefono || '',
        dni: initial.dni,
        latitud: initial.latitud,
        longitud: initial.longitud,
        programasForm: (initial.programas || []).map((tipo, index) => ({
          tipo: tipo,
          detalle: initial.ayudas?.[index] || '',
        })),
        integrantesForm: (initial.integrantes || []).map(intString => {
          const matchFull = intString.match(/(.*) \(DNI: (.*), Rol: (.*)\)/);
          if (matchFull) return { nombre: matchFull[1].trim(), dni: matchFull[2].trim(), rol: matchFull[3].trim() };
          const matchSimple = intString.match(/(.*) \(DNI: (.*)\)/);
          if (matchSimple) return { nombre: matchSimple[1].trim(), dni: matchSimple[2].trim(), rol: 'No especificado' };
          const matchOnlyName = intString.match(/(.*)/);
          if (matchOnlyName && matchOnlyName[1].trim()) return { nombre: matchOnlyName[1].trim(), dni: 'N/A', rol: 'N/A'};
          return { nombre: 'Error al parsear', dni: 'N/A', rol: 'N/A' }; // Fallback for unparsed
        }),
        notas: initial.notas || '',
        icono: initial.icono || (props.iconsAvailable?.[0]?.value || ''),
      };
      if (!formData.value.programasForm) formData.value.programasForm = [];
      if (!formData.value.integrantesForm) formData.value.integrantesForm = [];

    } else if (!props.isEditing && props.newMarkerCoords) {
      formData.value = getEmptyFormData(props.newMarkerCoords);
    } else if (!props.isEditing) {
      formData.value = getEmptyFormData();
    }
    nextTick(() => {
      formulario.value?.resetValidation();
    });
  }
});

watch(() => props.iconsAvailable, (newIcons) => {
  if (newIcons && newIcons.length > 0 && (!formData.value.icono || !newIcons.some(icon => icon.value === formData.value.icono))) {
    formData.value.icono = newIcons[0].value;
  }
}, { deep: true, immediate: true });


const agregarPrograma = () => {
  formData.value.programasForm.push({ tipo: '', detalle: '' });
};
const eliminarPrograma = (index: number) => {
  formData.value.programasForm.splice(index, 1);
};

const agregarIntegrante = () => {
  formData.value.integrantesForm.push({ nombre: '', dni: '', rol: '' });
};
const eliminarIntegrante = (index: number) => {
  formData.value.integrantesForm.splice(index, 1);
};

const validarYGuardar = async () => {
  const isValid = await formulario.value?.validate();
  if (isValid) {
    const transformedData: Partial<StoreMarcador> = {
      id: props.isEditing ? formData.value.id : undefined,
      nombreApellido: formData.value.nombreApellido,
      direccion: formData.value.direccion,
      telefono: formData.value.telefono,
      dni: formData.value.dni,
      latitud: formData.value.latitud,
      longitud: formData.value.longitud,
      programas: formData.value.programasForm.map(p => p.tipo).filter(t => !!t), // Ensure no empty strings
      ayudas: formData.value.programasForm.map(p => p.detalle || '').filter(d => !!d), // Ensure no empty strings
      integrantes: formData.value.integrantesForm
        .filter(i => !!i.nombre && !!i.dni) // Ensure basic data exists
        .map(i => `${i.nombre.trim()} (DNI: ${i.dni.trim()}, Rol: ${i.rol.trim()})`),
      notas: formData.value.notas,
      icono: formData.value.icono,
    };

    // Ensure programs and ayudas have same length if store expects direct mapping
    // Or adjust store to handle potentially mismatched lengths if that's acceptable
    // For now, assuming store can handle it or this mapping is sufficient.
    // A more robust approach might be to store programs as [{tipo, detalle}] in the store.

    emit('submit-marker', transformedData);
    cerrarModal();
  } else {
    $q.notify({
      type: 'negative',
      message: 'Por favor, corrija los errores en el formulario.',
    });
  }
};

const cerrarModal = () => {
  emit('update:modelValue', false);
};

</script>

<style scoped>
.q-card__section--scroll {
  overflow-y: auto;
}
</style>
