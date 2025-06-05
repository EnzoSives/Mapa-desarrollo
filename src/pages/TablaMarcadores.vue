<template>
  <q-page class="q-pa-md">
    <!-- Título y buscador -->
    <div class="row items-center q-mb-md">
      <div class="col-12 col-md-6">
        <h4 class="text-h5 q-my-sm">Lista de Marcadores</h4>
      </div>
      <div class="col-12 col-md-6">
        <q-input v-model="filtro" outlined dense placeholder="Buscar por nombre, dirección, teléfono..." debounce="300"
          clearable>
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>

    <q-table :rows="marcadoresFiltrados" :columns="columnsQuasar" :loading="loading" row-key="dni"
      class="full-width custom-table cursor-pointer" bordered :rows-per-page-options="[10, 25, 50, 100]"
      :pagination="{ rowsPerPage: 10 }" @row-click="abrirModalInfo" virtual-scroll color="primary">
      <template #body-cell-icono="props">
        <q-td :props="props">
          <img v-if="props.value" :src="props.value" width="24" height="24" alt="icono" style="object-fit: contain" />
        </q-td>
      </template>

      <template #body-cell-mapa="props">
        <q-td :props="props">
          <q-btn flat dense icon="place" @click.stop="centrarEnMapa(props.row.latitud, props.row.longitud)"
            :disable="!props.row.latitud || !props.row.longitud" />
        </q-td>
      </template>

      <template #body-cell-acciones="props">
        <q-td :props="props">
          <q-btn flat dense icon="info" @click.stop="abrirModalInfo(null, props.row)" color="primary" size="sm">
            <q-tooltip>Ver información</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- Modal de información mejorado visualmente -->
    <q-dialog v-model="mostrarModal" persistent>
      <q-card v-if="marcadorSeleccionado" class="info-panel" style="min-width: 400px; max-width: 700px">

        <!-- Encabezado -->
        <q-card-section class="bg-primary text-white row items-center q-pa-sm">
          <q-avatar v-if="marcadorSeleccionado.icono" size="48px" class="q-mr-md">
            <img :src="marcadorSeleccionado.icono" alt="Ícono" />
          </q-avatar>
          <div>
            <div class="text-h6">{{ marcadorSeleccionado.nombreApellido }}</div>
            <div class="text-caption">{{ marcadorSeleccionado.direccion }}</div>
          </div>
        </q-card-section>

        <q-separator spaced />

        <!-- Información principal -->
        <q-card-section>
          <div class="row q-col-gutter-md">

            <!-- Columna 1 -->
            <div class="col-12 col-md-6">
              <q-item dense>
                <q-item-section avatar>
                  <q-icon name="phone" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label><strong>Teléfono:</strong> {{ marcadorSeleccionado.telefono || 'N/A'
                  }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item dense>
                <q-item-section avatar>
                  <q-icon name="badge" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label><strong>DNI:</strong> {{ marcadorSeleccionado.dni }}</q-item-label>
                </q-item-section>
              </q-item>

            </div>
          </div>

          <!-- Integrantes -->
          <div>
            <strong>Integrantes:</strong>
            <div v-if="marcadorSeleccionado.integrantes?.length" class="q-mt-sm">
              <q-list dense bordered>
                <q-item v-for="(integrante, index) in marcadorSeleccionado.integrantes" :key="index">
                  <q-item-section avatar>
                    <q-icon name="person" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>
                      <strong>{{ integrante.nombre }} {{ integrante.apellido }}</strong>
                    </q-item-label>
                    <q-item-label caption>
                      Edad: {{ integrante.edad }} &nbsp;|&nbsp; DNI: {{ integrante.dni }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
            <div v-else class="text-grey-7 q-mt-sm">No hay integrantes.</div>
          </div>
        </q-card-section>

        <q-separator spaced class="q-mt-md" />

        <q-item dense>
          <q-item-section avatar>
            <q-icon name="assignment" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>
              <strong>Programas:</strong>
              <div v-if="marcadorSeleccionado.programas?.length" class="q-mt-xs">
                <q-chip v-for="(programa, index) in marcadorSeleccionado.programas" :key="index" dense color="primary"
                  text-color="white" size="sm" class="q-mr-xs q-mb-xs">
                  <span style="min-width: max-content; display: inline-block;">
                    {{ programa.tipo }}: {{ programa.ayuda }}
                  </span>
                </q-chip>
              </div>
              <div v-else class="text-grey-7 q-mt-xs">Ninguno</div>
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item dense>
          <q-item-section avatar>
            <q-icon name="notes" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label><strong>Notas:</strong> {{ marcadorSeleccionado.notas || 'N/A' }}</q-item-label>
          </q-item-section>
        </q-item>

        <!-- Acciones -->
        <q-card-actions align="right">
          <q-btn flat label="Cerrar" @click="cerrarModal" color="primary" />
          <!-- <q-btn flat label="Editar" @click="editarMarcadorSeleccionado" color="warning" v-if="permisos.puedeEditar" />
        <q-btn flat label="Eliminar" @click="eliminarMarcadorSeleccionado" color="negative"
          v-if="permisos.puedeEliminar" /> -->
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { useGisStore } from 'src/stores/gisStore';
import { onMounted, computed, ref } from 'vue';

const gisStore = useGisStore();
const loading = ref(false);
const filtro = ref('');
const mostrarModal = ref(false);
interface Integrante {
  nombre: string;
  apellido: string;
  edad: number;
  dni: string;
}
interface Programa {
  tipo: string;
  ayuda: string;
}

interface Marcador {
  nombreApellido: string;
  direccion: string;
  telefono: string;
  dni: string;
  notas?: string;
  ayudas?: string[] | string;
  icono?: string;
  latitud?: number;
  longitud?: number;
  integrantes?: Integrante[];
  programas?: Programa[];
  [key: string]: any;
}

const marcadorSeleccionado = ref<Marcador | null>(null);
const rol = ref(localStorage.getItem('rol') || 'visor');

const permisos = computed(() => {
  return {
    puedeCrear:
      rol.value === 'superadmin' ||
      rol.value === 'admin' ||
      rol.value === 'user',
    puedeEditar: rol.value === 'superadmin' || rol.value === 'admin',
    puedeEliminar: rol.value === 'superadmin' || rol.value === 'admin',
    soloLectura: rol.value === 'visor',
  };
});

// Función para limpiar objetos
function limpiarObjeto(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => limpiarObjeto(item));
  }

  const objetoLimpio: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof key === 'symbol' || key.startsWith('_')) {
      continue;
    }

    if (typeof value === 'object' && value !== null) {
      if (value.constructor === Object || Array.isArray(value)) {
        objetoLimpio[key] = limpiarObjeto(value);
      } else {
        objetoLimpio[key] = String(value);
      }
    } else {
      objetoLimpio[key] = value;
    }
  }

  return objetoLimpio;
}

// Computed property para datos filtrados - VERSIÓN CORREGIDA
const marcadoresFiltrados = computed(() => {
  const marcadores = marcadoresLimpios.value;

  if (!filtro.value?.trim()) {
    return marcadores;
  }

  const busqueda = filtro.value.toLowerCase().trim();

  return marcadores.filter((marcador) => {
    // Campos a buscar
    const campos = [
      marcador.nombreApellido,
      marcador.direccion,
      marcador.telefono,
      marcador.dni,
      marcador.notas,
      marcador.ayudas,
    ];

    // Verificar si algún campo contiene el texto buscado
    return campos.some((campo) => {
      if (campo === null || campo === undefined) return false;
      return String(campo).toLowerCase().includes(busqueda);
    });
  });
});

const marcadoresLimpios = computed(() => {
  if (!gisStore.marcadores || gisStore.marcadores.length === 0) {
    return [];
  }

  return gisStore.marcadores.map((marcador) => {
    const marcadorLimpio = limpiarObjeto(marcador);

    return {
      nombreApellido: marcadorLimpio.nombreApellido || '',
      direccion: marcadorLimpio.direccion || '',
      telefono: marcadorLimpio.telefono || '',
      dni: marcadorLimpio.dni || '',
      notas: marcadorLimpio.notas || '',
      ayudas: marcadorLimpio.ayudas || '',
      icono: marcadorLimpio.icono || '',
      latitud: marcadorLimpio.latitud || 0,
      longitud: marcadorLimpio.longitud || 0,
      integrantes: marcadorLimpio.integrantes || [],
      ...marcadorLimpio,
    };
  });
});

const columnsQuasar = [
  {
    name: 'nombreApellido',
    label: 'Nombre',
    field: 'nombreApellido',
    align: 'left' as const,
    sortable: true
  },
  { name: 'direccion', label: 'Dirección', field: 'direccion', align: 'left' as const, sortable: true },
  { name: 'telefono', label: 'Teléfono', field: 'telefono', align: 'left' as const, sortable: true },
  { name: 'dni', label: 'DNI', field: 'dni', align: 'left' as const, sortable: true },
  { name: 'notas', label: 'Notas', field: 'notas', align: 'left' as const, sortable: true },
  // { name: 'ayudas', label: 'Ayudas', field: 'ayudas', align: 'left' as const },
  { name: 'icono', label: 'Ícono', field: 'icono', align: 'center' as const },
  // { name: 'mapa', label: 'Ver en mapa', field: '', align: 'center' as const },
  // { name: 'acciones', label: 'Acciones', field: '', align: 'center' as const },
];

// Función para abrir el modal con la información
function abrirModalInfo(evt: any, row: any) {
  // Si se pasa el row directamente (desde el botón), usarlo
  // Si viene del evento de click en la fila, usar evt.row
  const marcador = row || evt?.row;

  if (marcador) {
    marcadorSeleccionado.value = marcador;
    mostrarModal.value = true;
  }
}

// Función para cerrar el modal
function cerrarModal() {
  mostrarModal.value = false;
  marcadorSeleccionado.value = null;
}

// Función para ver en mapa
function verEnMapa() {
  if (
    marcadorSeleccionado.value?.latitud &&
    marcadorSeleccionado.value?.longitud
  ) {
    centrarEnMapa(
      marcadorSeleccionado.value.latitud,
      marcadorSeleccionado.value.longitud
    );
    cerrarModal();
  }
}

function centrarEnMapa(lat: number, lon: number) {
  console.log('Centrando en:', lat, lon);
  if (lat && lon) {
    gisStore.coordenadasSeleccionadas = [lon, lat];
    gisStore.panelActivo = 'mapa';
  }
}

// Funciones para editar y eliminar (debes implementar según tu lógica)
function editarMarcadorSeleccionado() {
  console.log('Editar marcador:', marcadorSeleccionado.value);
  // Implementa tu lógica de edición aquí
  // Por ejemplo: abrir otro modal de edición o navegar a otra página
  cerrarModal();
}

function eliminarMarcadorSeleccionado() {
  console.log('Eliminar marcador:', marcadorSeleccionado.value);
  // Implementa tu lógica de eliminación aquí
  // Por ejemplo: mostrar confirmación y luego eliminar
  cerrarModal();
}

onMounted(async () => {
  try {
    loading.value = true;
    if (gisStore.marcadores.length === 0) {
      await gisStore.cargarMarcadoresDesdeAPI();
    }
  } catch (error) {
    console.error('Error cargando marcadores:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.custom-table {
  max-height: calc(100vh - 200px);
  overflow-y: hidden;
}

.cursor-pointer tbody tr {
  cursor: pointer;
}

.cursor-pointer tbody tr:hover {
  background-color: rgba(141, 141, 141, 0.936);
}

.info-panel {
  max-height: 80vh;
  overflow-y: auto;
}
</style>
