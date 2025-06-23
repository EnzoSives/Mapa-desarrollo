<template>
  <q-page class="q-pa-md">
    <!-- Título, filtro programa y buscador -->
    <div class="q-mb-md">
      <div class="row items-end q-col-gutter-md">
        <div class="col-12 col-md-4">
          <h4 class="text-h5 q-mb-sm">Lista de Marcadores</h4>
        </div>
        <div class="col-12 col-md-4">
          <q-select v-model="filtroPrograma" :options="opcionesProgramasActivos" outlined dense clearable
            label="Filtrar por programa activo" placeholder="Programa activo" emit-value map-options class="full-width">
            <template v-slot:prepend>
              <q-icon name="filter_list" />
            </template>
          </q-select>
        </div>
        <div class="col-12 col-md-4">
          <div class="row items-center q-gutter-sm">
            <q-input v-model="filtro" outlined dense debounce="300" clearable
              placeholder="Buscar por nombre, dirección, teléfono..." class="col">
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
            <q-btn color="primary" icon="print" @click="generarPDF" :disable="marcadoresFiltrados.length === 0" dense
              round>
              <q-tooltip>Imprimir resultados filtrados</q-tooltip>
            </q-btn>
            <!-- Botón para refrescar manualmente -->
            <q-btn color="secondary" icon="refresh" @click="refrescarDatos" :loading="refreshing" dense round>
              <q-tooltip>Refrescar datos</q-tooltip>
            </q-btn>
          </div>
        </div>
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
      <template #body-cell-acciones="props">
        <q-td :props="props">
          <q-btn flat dense icon="info" @click.stop="abrirModalInfo(null, props.row)" color="primary" size="sm">
            <q-tooltip>Ver información</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- Modal de información - COMPLETAMENTE REACTIVO -->
    <q-dialog v-model="mostrarModal" persistent>
      <q-card v-if="marcadorActualEnTiempoReal" class="info-panel q-mx-auto"
        style="min-width: 500px; max-width: 500px; border-radius: 12px; max-height: 85vh; overflow-y: auto; display: flex; flex-direction: column;">

        <!-- Contenido con scroll -->
        <div style="flex: 1; overflow-y: auto; scrollbar-width: none; scrollbar-color: #888 #f0f0f0;">
          <!-- Encabezado con botón cerrar -->
          <q-card-section class="q-pa-md relative-position">
            <q-btn icon="close" flat round dense class="absolute-top-right q-ma-sm" style="z-index: 2;"
              @click="cerrarModal" />

            <div class="row items-center no-wrap">
              <q-avatar v-if="marcadorActualEnTiempoReal.icono" size="44px" class="q-mr-md">
                <img :src="marcadorActualEnTiempoReal.icono" alt="Ícono" />
              </q-avatar>
              <div class="col">
                <div class="text-h6 text-weight-medium">
                  {{ marcadorActualEnTiempoReal.nombreApellido }}
                </div>
                <div class="text-caption text-grey">
                  {{ marcadorActualEnTiempoReal.direccion }}
                </div>
                <div class="text-caption text-grey">
                  Creado: {{ new Date(marcadorActualEnTiempoReal.fechaCreacion).toLocaleDateString() }}
                </div>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <!-- Información compacta -->
          <q-card-section class="q-pa-md">

            <!-- Contacto en una línea -->
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-6">
                <div class="text-caption text-grey">Teléfono</div>
                <div class="text-body2">{{ marcadorActualEnTiempoReal.telefono || 'N/A' }}</div>
              </div>
              <div class="col-6">
                <div class="text-caption text-grey">DNI</div>
                <div class="text-body2">{{ marcadorActualEnTiempoReal.dni }}</div>
              </div>
            </div>

            <!-- Integrantes compactos -->
            <div class="q-mb-md">
              <div class="text-subtitle2 q-mb-sm flex items-center">
                <q-icon name="people" class="q-mr-xs" />
                Integrantes
                <q-chip v-if="marcadorActualEnTiempoReal.integrantes?.length"
                  :label="marcadorActualEnTiempoReal.integrantes.length" color="blue" text-color="white" size="sm"
                  class="q-ml-sm" />
              </div>
              <div v-if="marcadorActualEnTiempoReal.integrantes?.length">
                <div v-for="(integrante, index) in marcadorActualEnTiempoReal.integrantes" :key="index"
                  class="row items-center q-py-xs q-mb-xs bg-grey-1 rounded-borders q-pa-sm">
                  <q-avatar size="28px" class="q-mr-sm" color="blue-5" text-color="white">
                    {{ integrante.nombre.charAt(0) }}
                  </q-avatar>
                  <div class="col">
                    <div class="text-body2 text-weight-medium">{{ integrante.nombre }} {{ integrante.apellido }}</div>
                    <div class="text-caption text-grey">
                      {{ integrante.edad }} años • {{ integrante.vinculo }} • DNI: {{ integrante.dni }}
                    </div>
                    <!-- Salud del integrante -->
                    <div v-if="integrante.salud?.length" class="q-mt-xs">
                      <div v-for="(saludItem, sIndex) in integrante.salud" :key="sIndex" class="text-caption">
                        <q-badge v-if="saludItem.cud" color="purple" text-color="white" class="q-mr-xs">CUD</q-badge>
                        <q-badge v-if="saludItem.obra_social" color="green" text-color="white" class="q-mr-xs">Obra
                          Social</q-badge>
                        <span v-if="saludItem.problema_salud" class="text-red">{{ saludItem.problema_salud }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-caption text-grey">Sin integrantes</div>
            </div>

            <!-- Programas activos + botón historial -->
            <div class="q-mb-md" :key="`programas-${dniMarcadorSeleccionado}-${lastUpdateTimestamp}`">
              <div class="text-subtitle2 q-mb-sm flex items-center">
                <q-icon name="assignment" class="q-mr-xs" />
                Programas Activos
                <q-chip v-if="programasActivosDirectos.length" :label="programasActivosDirectos.length" color="primary"
                  text-color="white" size="sm" class="q-ml-sm" />
              </div>

              <div v-if="programasActivosDirectos.length">
                <div v-for="(programa, index) in programasActivosDirectos" :key="index"
                  class="text-body2 q-mb-xs q-pa-sm bg-green-1 rounded-borders">
                  <div class="text-weight-medium">{{ programa.tipo }}</div>
                  <div class="text-caption">{{ programa.ayuda }}</div>
                  <q-badge v-if="programa.fechaInicio" color="green" class="q-mt-xs" text-color="white">
                    Desde: {{ new Date(programa.fechaInicio).toLocaleDateString() }}
                  </q-badge>
                </div>
              </div>
              <div v-else class="text-caption text-grey">Ninguno</div>

              <div class="q-mt-sm">
                <q-btn label="Historial de Programas" color="primary" flat @click="abrirHistorialProgramas"
                  :badge="programasInactivosDirectos.length || undefined" />
              </div>
            </div>

            <!-- Estudios -->
            <div v-if="marcadorActualEnTiempoReal.estudios?.length" class="q-mb-md">
              <div class="text-subtitle2 q-mb-sm flex items-center">
                <q-icon name="school" class="q-mr-xs" />
                Educación
              </div>
              <div v-for="(estudio, index) in marcadorActualEnTiempoReal.estudios" :key="index"
                class="text-body2 q-mb-xs q-pa-sm bg-blue-1 rounded-borders">
                {{ estudio.nivel }}
              </div>
            </div>

            <!-- Ocupaciones -->
            <div v-if="marcadorActualEnTiempoReal.ocupaciones?.length" class="q-mb-md">
              <div class="text-subtitle2 q-mb-sm flex items-center">
                <q-icon name="work" class="q-mr-xs" />
                Ocupaciones
              </div>
              <div v-for="(ocupacion, index) in marcadorActualEnTiempoReal.ocupaciones" :key="index"
                class="q-mb-xs q-pa-sm bg-orange-1 rounded-borders">
                <div class="text-body2 text-weight-medium">{{ ocupacion.nombre }}</div>
                <div class="text-caption text-grey">
                  {{ ocupacion.tipo_1 }} • {{ ocupacion.tipo_2 }}
                </div>
                <div v-if="ocupacion.ingresos" class="text-caption text-green text-weight-medium">
                  Ingresos: ${{ ocupacion.ingresos.toLocaleString() }}
                </div>
              </div>
            </div>

            <!-- Vivienda -->
            <div v-if="marcadorActualEnTiempoReal.viviendas?.length" class="q-mb-md">
              <div class="text-subtitle2 q-mb-sm flex items-center">
                <q-icon name="home" class="q-mr-xs" />
                Vivienda
              </div>
              <div v-for="(vivienda, index) in marcadorActualEnTiempoReal.viviendas" :key="index"
                class="q-mb-xs q-pa-sm bg-teal-1 rounded-borders">
                <div class="text-body2">
                  <strong>{{ vivienda.tipo }}</strong> • {{ vivienda.dominio }}
                </div>
                <div class="text-caption text-grey">
                  {{ vivienda.ambientes }} ambientes • Baño {{ vivienda.baño }}
                  <span v-if="vivienda.baño_opcion"> ({{ vivienda.baño_opcion }})</span>
                </div>
              </div>
            </div>

            <!-- Servicios -->
            <div v-if="marcadorActualEnTiempoReal.servicios?.length" class="q-mb-md">
              <div class="text-subtitle2 q-mb-sm flex items-center">
                <q-icon name="electrical_services" class="q-mr-xs" />
                Servicios
                <q-chip :label="marcadorActualEnTiempoReal.servicios.length" color="indigo" text-color="white" size="sm"
                  class="q-ml-sm" />
              </div>
              <div class="row q-col-gutter-sm">
                <div v-for="(servicio, index) in marcadorActualEnTiempoReal.servicios" :key="index" class="col-6">
                  <q-chip :color="servicio.opcion_servicio === 'Conectado' ? 'green' : 'red'" text-color="white"
                    size="sm" class="full-width">
                    <q-icon :name="servicio.opcion_servicio === 'Conectado' ? 'check_circle' : 'cancel'"
                      class="q-mr-xs" />
                    {{ servicio.nombre }}
                  </q-chip>
                </div>
              </div>
            </div>

            <!-- Salud general -->
            <div v-if="marcadorActualEnTiempoReal.salud?.length" class="q-mb-md">
              <div class="text-subtitle2 q-mb-sm flex items-center">
                <q-icon name="medical_services" class="q-mr-xs" />
                Salud General
              </div>
              <div v-for="(saludItem, index) in marcadorActualEnTiempoReal.salud" :key="index"
                class="q-mb-xs q-pa-sm bg-red-1 rounded-borders">
                <div class="row items-center">
                  <div class="col">
                    <div v-if="saludItem.problema_salud" class="text-body2">{{ saludItem.problema_salud }}</div>
                    <div class="q-mt-xs">
                      <q-badge v-if="saludItem.cud" color="purple" text-color="white" class="q-mr-xs">CUD</q-badge>
                      <q-badge v-if="saludItem.obra_social" color="green" text-color="white">Obra Social</q-badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Notas simples -->
            <div v-if="marcadorActualEnTiempoReal.notas" class="q-mb-md">
              <div class="text-subtitle2 q-mb-sm flex items-center">
                <q-icon name="note" class="q-mr-xs" />
                Notas
              </div>
              <div class="text-body2 q-pa-sm bg-grey-2 rounded-borders">{{ marcadorActualEnTiempoReal.notas }}</div>
            </div>

            <!-- Coordenadas (opcional, para debugging) -->
            <!-- <div v-if="marcadorActualEnTiempoReal.latitud && marcadorActualEnTiempoReal.longitud" class="q-mb-md">
              <div class="text-subtitle2 q-mb-sm flex items-center">
                <q-icon name="place" class="q-mr-xs" />
                Coordenadas
              </div>
              <div class="text-caption text-grey">
                Lat: {{ marcadorActualEnTiempoReal.latitud.toFixed(6) }} •
                Lng: {{ marcadorActualEnTiempoReal.longitud.toFixed(6) }}
              </div>
            </div> -->
          </q-card-section>
        </div>

        <!-- Acciones fijas en la parte inferior (opcional) -->
        <div style="flex-shrink: 0;" v-if="mostrarAcciones">
          <q-separator />
          <q-card-actions class="q-pa-sm justify-end">
            <q-btn flat round icon="print" @click="generarPDF" size="md">
              <q-tooltip>Imprimir</q-tooltip>
            </q-btn>

            <q-btn flat v-if="permisos.puedeEditar" label="Editar" @click="editarMarcador" color="orange-8" size="md" />

            <q-btn flat v-if="permisos.puedeEliminar" label="Eliminar" @click="eliminarMarcador" color="red"
              size="md" />
          </q-card-actions>
        </div>
      </q-card>
    </q-dialog>

    <!-- Modal historial - DIRECTAMENTE DEL STORE -->
    <q-dialog v-model="mostrarModalHistorial">
      <q-card style="min-width: 350px; max-width: 550px;">
        <q-card-section>
          <div class="text-h6">
            Historial de Programas
            <q-chip v-if="programasInactivosDirectos.length" :label="programasInactivosDirectos.length" color="grey"
              text-color="white" size="sm" class="q-ml-sm" />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section :key="`historial-${dniMarcadorSeleccionado}-${lastUpdateTimestamp}`">
          <div v-if="programasInactivosDirectos.length">
            <div v-for="(programa, index) in programasInactivosDirectos"
              :key="`inactivo-${programa.tipo}-${programa.estado}-${index}-${lastUpdateTimestamp}`" class="q-mb-sm">
              <div class="row items-center q-gutter-sm">
                <q-badge :color="colorPorEstado(programa.estado)" class="q-mr-sm">
                  {{ programa.estado.toUpperCase() }}
                </q-badge>
                <div class="col text-body2">
                  <div>• {{ programa.tipo }}: {{ programa.ayuda }}</div>
                  <div class="text-caption text-grey">
                    Inicio: {{ programa.fechaInicio ? new Date(programa.fechaInicio).toLocaleDateString() : 'N/A' }}
                    <br>
                    Fin: {{ programa.fechaFin ? new Date(programa.fechaFin).toLocaleDateString() : 'N/A' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-caption text-grey">No hay programas inactivos.</div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { useGisStore } from 'src/stores/gisStore';
import { onMounted, computed, ref, watch, nextTick, onBeforeUnmount } from 'vue';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const gisStore = useGisStore();
const loading = ref(false);
const refreshing = ref(false);
const filtro = ref('');
const filtroPrograma = ref('');
const mostrarModal = ref(false);
const mostrarModalHistorial = ref(false);

// SOLO guardamos el DNI del marcador seleccionado
const dniMarcadorSeleccionado = ref<string>('');

// Timestamp para forzar actualizaciones
const lastUpdateTimestamp = ref(Date.now());

// Intervalo para refrescar automáticamente
let refreshInterval: NodeJS.Timeout | null = null;

interface Integrante {
  nombre: string;
  apellido: string;
  edad: number;
  dni: string;
}

interface Programa {
  tipo: string;
  ayuda: string;
  estado: string;
  fechaInicio?: string;
  fechaFin?: string;
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

const rol = ref(localStorage.getItem('rol') || 'visor');

// COMPUTED QUE SIEMPRE BUSCA EN EL STORE EN TIEMPO REAL
const marcadorActualEnTiempoReal = computed(() => {
  if (!dniMarcadorSeleccionado.value) return null;

  // Agregamos esto para forzar la reactividad:
  lastUpdateTimestamp.value;

  const marcadorEncontrado = gisStore.marcadores.find(
    marcador => marcador.dni === dniMarcadorSeleccionado.value
  );

  if (!marcadorEncontrado) return null;

  const marcadorLimpio = limpiarObjeto(marcadorEncontrado);
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
    programas: marcadorLimpio.programas || [],
    ...marcadorLimpio,
  };
});

// COMPUTED PARA PROGRAMAS QUE SE ACTUALIZAN EN TIEMPO REAL
const programasActivosDirectos = computed(() => {
  if (!marcadorActualEnTiempoReal.value?.programas) return [];
  return marcadorActualEnTiempoReal.value.programas.filter((p: Programa) => p.estado === 'activo');
});

const programasInactivosDirectos = computed(() => {
  if (!marcadorActualEnTiempoReal.value?.programas) return [];
  return marcadorActualEnTiempoReal.value.programas
    .filter((p: Programa) => p.estado !== 'activo')
    .sort((a, b) => {
      const fechaA = a.fechaInicio ? new Date(a.fechaInicio).getTime() : 0;
      const fechaB = b.fechaInicio ? new Date(b.fechaInicio).getTime() : 0;
      return fechaB - fechaA;
    });
});

const permisos = computed(() => {
  return {
    puedeCrear: rol.value === 'superadmin' || rol.value === 'admin' || rol.value === 'user',
    puedeEditar: rol.value === 'superadmin' || rol.value === 'admin',
    puedeEliminar: rol.value === 'superadmin' || rol.value === 'admin',
    soloLectura: rol.value === 'visor',
  };
});

// Watcher para detectar cambios en el store y actualizar timestamp
watch(
  () => gisStore.marcadores,
  () => {
    lastUpdateTimestamp.value = Date.now();
  },
  { deep: true, flush: 'sync' }
);

// Watcher específico para cuando se abre el modal
watch(mostrarModal, (newVal) => {
  if (newVal && dniMarcadorSeleccionado.value) {
    // Forzar actualización cuando se abre el modal
    nextTick(() => {
      lastUpdateTimestamp.value = Date.now();
    });
  }
});

function colorPorEstado(estado: string): string {
  switch (estado) {
    case 'finalizado':
      return 'red';
    case 'inactivo':
      return 'grey';
    case 'suspendido':
      return 'orange';
    default:
      return 'blue';
  }
}

function abrirHistorialProgramas() {
  mostrarModalHistorial.value = true;
}

// Función para refrescar datos manualmente
async function refrescarDatos() {
  try {
    refreshing.value = true;
    await gisStore.cargarMarcadoresDesdeAPI();
    lastUpdateTimestamp.value = Date.now();
    console.log('Datos refrescados correctamente');
  } catch (error) {
    console.error('Error refrescando datos:', error);
  } finally {
    refreshing.value = false;
  }
}

// Función para refrescar automáticamente en segundo plano
async function refrescarAutomatico() {
  try {
    await gisStore.cargarMarcadoresDesdeAPI();
    lastUpdateTimestamp.value = Date.now();
  } catch (error) {
    console.error('Error en refresco automático:', error);
  }
}

// NUEVO: Computed para opciones de programas activos únicamente
const opcionesProgramasActivos = computed(() => {
  const tiposActivos = new Set<string>();
  marcadoresLimpios.value.forEach(marcador => {
    if (marcador.programas && Array.isArray(marcador.programas)) {
      marcador.programas
        .filter((programa: Programa) => programa.estado === 'activo') // Solo programas activos
        .forEach((programa: Programa) => {
          if (programa.tipo) {
            tiposActivos.add(programa.tipo);
          }
        });
    }
  });
  return Array.from(tiposActivos).sort().map(tipo => ({
    label: tipo,
    value: tipo
  }));
});

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

// MODIFICADO: Filtro para buscar solo en programas activos
const marcadoresFiltrados = computed(() => {
  let marcadores = marcadoresLimpios.value;
  if (filtro.value?.trim()) {
    const busqueda = filtro.value.toLowerCase().trim();
    marcadores = marcadores.filter((marcador) => {
      const campos = [
        marcador.nombreApellido,
        marcador.direccion,
        marcador.telefono,
        marcador.dni,
        marcador.notas,
        marcador.ayudas,
      ];
      return campos.some((campo) => {
        if (campo === null || campo === undefined) return false;
        return String(campo).toLowerCase().includes(busqueda);
      });
    });
  }

  // MODIFICADO: Filtrar solo por programas activos
  if (filtroPrograma.value) {
    marcadores = marcadores.filter((marcador) => {
      if (!marcador.programas || !Array.isArray(marcador.programas)) {
        return false;
      }
      return marcador.programas.some((programa: Programa) =>
        programa.tipo === filtroPrograma.value && programa.estado === 'activo' // Solo activos
      );
    });
  }
  return marcadores;
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
      programas: marcadorLimpio.programas || [],
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
  { name: 'icono', label: 'Ícono', field: 'icono', align: 'center' as const },
];

// SIMPLIFICAMOS: solo guardamos el DNI
function abrirModalInfo(evt: any, row: any) {
  const marcador = row || evt?.row;
  if (marcador && marcador.dni) {
    dniMarcadorSeleccionado.value = marcador.dni;
    mostrarModal.value = true;
    // Forzar actualización inmediata
    nextTick(() => {
      lastUpdateTimestamp.value = Date.now();
    });
  }
}

function cerrarModal() {
  mostrarModal.value = false;
  dniMarcadorSeleccionado.value = '';
}

function generarPDF() {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Lista de Marcadores', 14, 22);

  let yPosition = 32;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  if (filtro.value) {
    doc.text(`Filtro de búsqueda: ${filtro.value}`, 14, yPosition);
    yPosition += 6;
  }
  if (filtroPrograma.value) {
    doc.text(`Programa activo: ${filtroPrograma.value}`, 14, yPosition); // Actualizado el texto
    yPosition += 6;
  }

  doc.text(`Total de registros: ${marcadoresFiltrados.value.length}`, 14, yPosition);
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 14, yPosition + 6);

  const headers = ['Nombre', 'Dirección', 'Teléfono', 'DNI', 'Programas Activos', 'Notas']; // Actualizado header
  const data = marcadoresFiltrados.value.map(marcador => [
    marcador.nombreApellido || '',
    marcador.direccion || '',
    marcador.telefono || '',
    marcador.dni || '',
    // MODIFICADO: Solo mostrar programas activos en el PDF
    marcador.programas?.filter((p: Programa) => p.estado === 'activo').map((p: Programa) => `${p.tipo}: ${p.ayuda}`).join(', ') || 'Ninguno',
    marcador.notas || ''
  ]);

  autoTable(doc, {
    head: [headers],
    body: data,
    startY: yPosition + 16,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [63, 81, 181], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 35 },
      2: { cellWidth: 25 },
      3: { cellWidth: 20 },
      4: { cellWidth: 45 },
      5: { cellWidth: 35 }
    },
    margin: { left: 14, right: 14 },
    pageBreak: 'auto',
    showHead: 'everyPage'
  });

  const pdfBlob = doc.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);
  const printWindow = window.open(blobUrl);
  if (printWindow) {
    printWindow.onload = function () {
      printWindow.focus();
      printWindow.print();
    };
  } else {
    alert('No se pudo abrir la ventana de impresión. Verifica que no haya bloqueadores de pop-ups.');
  }
}

onMounted(async () => {
  try {
    loading.value = true;
    if (gisStore.marcadores.length === 0) {
      await gisStore.cargarMarcadoresDesdeAPI();
    }

    // Configurar refresco automático cada 30 segundos
    refrescarAutomatico();
  } catch (error) {
    console.error('Error cargando marcadores:', error);
  } finally {
    loading.value = false;
  }
});

onBeforeUnmount(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
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

.q-badge {
  font-weight: bold;
  text-transform: uppercase;
}
</style>