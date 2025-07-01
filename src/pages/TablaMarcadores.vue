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
            <q-btn color="primary" icon="print" @click="generarPDFFiltro" :disable="marcadoresFiltrados.length === 0"
              dense round>
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
      <q-card v-if="marcadorActualEnTiempoReal" class="info-panel q-mx-auto" style="
          min-width: 500px;
          max-width: 500px;
          border-radius: 12px;
          max-height: 85vh;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        ">
        <!-- Contenido con scroll -->
        <div style="
            flex: 1;
            overflow-y: auto;
            scrollbar-width: none;
            scrollbar-color: #888 #f0f0f0;
          ">
          <!-- Encabezado con botón cerrar -->
          <q-card-section class="q-pa-md relative-position">
            <q-btn icon="close" flat round dense class="absolute-top-right q-ma-sm" style="z-index: 2"
              @click="cerrarModal" />

            <div class="row items-center no-wrap">
              <q-avatar v-if="marcadorActualEnTiempoReal.icono" size="44px" class="q-mr-md">
                <img :src="marcadorActualEnTiempoReal.icono" alt="Ícono" />
              </q-avatar>
              <div class="col">
                <div class="text-h6 text-weight-medium">
                  {{ marcadorActualEnTiempoReal.nombre }}
                  {{ marcadorActualEnTiempoReal.apellido }}
                </div>
                <div class="text-caption text-grey">
                  Creado:
                  {{
                    new Date(
                      marcadorActualEnTiempoReal.fechaCreacion
                    ).toLocaleDateString()
                  }}
                </div>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <!-- 1. INFORMACIÓN BÁSICA -->
          <q-card-section class="q-pa-md">
            <div class="text-subtitle1 text-weight-medium q-mb-md flex items-center">
              <q-icon name="person" class="q-mr-xs" />
              Información Básica
            </div>

            <!-- Nombre y Apellido en la misma fila -->
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-6">
                <div class="text-caption text-grey">Nombre</div>
                <div class="text-body2">
                  {{ marcadorActualEnTiempoReal.nombre || 'N/A' }}
                </div>
              </div>
              <div class="col-6">
                <div class="text-caption text-grey">Apellido</div>
                <div class="text-body2">
                  {{ marcadorActualEnTiempoReal.apellido || 'N/A' }}
                </div>
              </div>
            </div>

            <!-- DNI campo completo -->
            <div class="q-mb-md">
              <div class="text-caption text-grey">DNI</div>
              <div class="text-body2">
                {{ marcadorActualEnTiempoReal.dni || 'N/A' }}
              </div>
            </div>

            <!-- Domicilio campo completo -->
            <div class="q-mb-md">
              <div class="text-caption text-grey">Domicilio</div>
              <div class="text-body2">
                {{ marcadorActualEnTiempoReal.direccion || 'N/A' }}
              </div>
            </div>

            <!-- Teléfono campo completo -->
            <div class="q-mb-md">
              <div class="text-caption text-grey">Teléfono</div>
              <div class="text-body2">
                {{ marcadorActualEnTiempoReal.telefono || 'N/A' }}
              </div>
            </div>

            <!-- Barrio y Tiempo de residencia en la misma fila -->
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-6">
                <div class="text-caption text-grey">Barrio</div>
                <div class="text-body2">
                  {{ marcadorActualEnTiempoReal.barrio || 'N/A' }}
                </div>
              </div>
              <div class="col-6">
                <div class="text-caption text-grey">Tiempo de Residencia</div>
                <div class="text-body2">
                  {{ marcadorActualEnTiempoReal.tiempo_residencia || 'N/A' }}
                </div>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <!-- 2. NIVEL DE ESTUDIOS -->
          <q-card-section v-if="marcadorActualEnTiempoReal.estudios?.length" class="q-pa-md">
            <div class="text-subtitle1 text-weight-medium q-mb-md flex items-center">
              <q-icon name="school" class="q-mr-xs" />
              Nivel de Estudios
              <q-chip :label="marcadorActualEnTiempoReal.estudios.length" color="blue" text-color="white" size="sm"
                class="q-ml-sm" />
            </div>
            <div v-for="(estudio, index) in marcadorActualEnTiempoReal.estudios" :key="index"
              class="text-body2 q-mb-xs q-pa-sm rounded-borders" :class="$q.dark.isActive ? 'bg-blue-9' : 'bg-blue-1'">
              {{ estudio.nivel }}
            </div>
          </q-card-section>

          <q-separator v-if="marcadorActualEnTiempoReal.estudios?.length" />

          <!-- 3. INFORMACIÓN DE SALUD -->
          <q-card-section v-if="marcadorActualEnTiempoReal.salud?.length" class="q-pa-md">
            <div class="text-subtitle1 text-weight-medium q-mb-md flex items-center">
              <q-icon name="medical_services" class="q-mr-xs" />
              Información de Salud
              <q-chip :label="marcadorActualEnTiempoReal.salud.length" color="red" text-color="white" size="sm"
                class="q-ml-sm" />
            </div>
            <div v-for="(saludItem, index) in marcadorActualEnTiempoReal.salud" :key="index"
              class="q-mb-xs q-pa-sm rounded-borders" :class="$q.dark.isActive ? 'bg-red-9' : 'bg-red-1'">
              <div class="row items-center">
                <div class="col">
                  <div v-if="saludItem.problema_salud" class="text-body2">
                    {{ saludItem.problema_salud }}
                  </div>
                  <div class="q-mt-xs">
                    <q-badge v-if="saludItem.cud" color="purple" text-color="white" class="q-mr-xs">CUD</q-badge>
                    <q-badge v-if="saludItem.obra_social" color="green" text-color="white">Obra Social</q-badge>
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-separator v-if="marcadorActualEnTiempoReal.salud?.length" />

          <!-- 4. VIVIENDA -->
          <q-card-section v-if="marcadorActualEnTiempoReal.viviendas?.length" class="q-pa-md">
            <div class="text-subtitle1 text-weight-medium q-mb-md flex items-center">
              <q-icon name="home" class="q-mr-xs" />
              Vivienda
              <q-chip :label="marcadorActualEnTiempoReal.viviendas.length" color="teal" text-color="white" size="sm"
                class="q-ml-sm" />
            </div>
            <div v-for="(vivienda, index) in marcadorActualEnTiempoReal.viviendas" :key="index"
              class="q-mb-xs q-pa-sm rounded-borders" :class="$q.dark.isActive ? 'bg-teal-9' : 'bg-teal-1'">
              <div class="text-body2">
                <strong>{{ vivienda.tipo }}</strong> • {{ vivienda.dominio }}
              </div>
              <div class="text-caption text-grey">
                <span v-if="vivienda.ambientes">{{ vivienda.ambientes }} ambientes</span>
                <span v-if="vivienda.ambientes && vivienda.baño"> • </span>
                <span v-if="vivienda.baño">Baño {{ vivienda.baño }}</span>
                <span v-if="vivienda.baño_opcion">
                  ({{ vivienda.baño_opcion }})</span>
              </div>
            </div>
          </q-card-section>

          <q-separator v-if="marcadorActualEnTiempoReal.viviendas?.length" />

          <!-- 5. OCUPACIÓN -->
          <q-card-section v-if="marcadorActualEnTiempoReal.ocupaciones?.length" class="q-pa-md">
            <div class="text-subtitle1 text-weight-medium q-mb-md flex items-center">
              <q-icon name="work" class="q-mr-xs" />
              Ocupación
              <q-chip :label="marcadorActualEnTiempoReal.ocupaciones.length" color="orange" text-color="white" size="sm"
                class="q-ml-sm" />
            </div>
            <div v-for="(
ocupacion, index
              ) in marcadorActualEnTiempoReal.ocupaciones" :key="index" class="q-mb-xs q-pa-sm rounded-borders"
              :class="$q.dark.isActive ? 'bg-orange-9' : 'bg-orange-1'">
              <div class="text-body2 text-weight-medium">
                {{ ocupacion.nombre || ocupacion.tipo_principal }}
              </div>
              <div class="text-caption text-grey">
                <span v-if="ocupacion.tipo_1">{{ ocupacion.tipo_1 }}</span>
                <span v-if="ocupacion.tipo_1 && ocupacion.tipo_2"> • </span>
                <span v-if="ocupacion.tipo_2">{{ ocupacion.tipo_2 }}</span>
              </div>
              <div v-if="ocupacion.ingresos" class="text-caption text-green text-weight-medium">
                Ingresos: ${{ ocupacion.ingresos.toLocaleString() }}
              </div>
            </div>
          </q-card-section>

          <q-separator v-if="marcadorActualEnTiempoReal.ocupaciones?.length" />

          <!-- 6. INTEGRANTES -->
          <q-card-section class="q-pa-md">
            <div class="text-subtitle1 text-weight-medium q-mb-md flex items-center">
              <q-icon name="people" class="q-mr-xs" />
              Integrantes
              <q-chip v-if="marcadorActualEnTiempoReal.integrantes?.length"
                :label="marcadorActualEnTiempoReal.integrantes.length" color="blue" text-color="white" size="sm"
                class="q-ml-sm" />
            </div>
            <div v-if="marcadorActualEnTiempoReal.integrantes?.length">
              <div v-for="(
integrante, index
                ) in marcadorActualEnTiempoReal.integrantes" :key="index"
                class="row items-center q-py-xs q-mb-xs rounded-borders q-pa-sm"
                :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-1'">
                <q-avatar size="28px" class="q-mr-sm" color="blue-5" text-color="white">
                  {{ integrante.nombre.charAt(0) }}
                </q-avatar>
                <div class="col">
                  <div class="text-body2 text-weight-medium">
                    {{ integrante.nombre }} {{ integrante.apellido }}
                  </div>
                  <div class="text-caption text-grey">
                    {{ integrante.edad }} años • {{ integrante.vinculo }} • DNI:
                    {{ integrante.dni }}
                  </div>
                  <!-- Salud del integrante -->
                  <div v-if="integrante.salud?.length" class="q-mt-xs">
                    <div v-for="(saludItem, sIndex) in integrante.salud" :key="sIndex" class="text-caption">
                      <q-badge v-if="saludItem.cud" color="purple" text-color="white" class="q-mr-xs">CUD</q-badge>
                      <q-badge v-if="saludItem.obra_social" color="green" text-color="white" class="q-mr-xs">Obra
                        Social</q-badge>
                      <span v-if="saludItem.problema_salud" class="text-red">{{
                        saludItem.problema_salud
                      }}</span>
                    </div>
                  </div>
                  <!-- Ocupaciones del integrante -->
                  <div v-if="integrante.ocupaciones?.length" class="q-mt-xs">
                    <div class="text-caption text-grey-7 q-mb-xs">
                      <q-icon name="work" size="xs" class="q-mr-xs" />
                      Ocupaciones:
                    </div>
                    <div v-for="(ocupacion, oIndex) in integrante.ocupaciones" :key="oIndex"
                      class="text-caption q-mb-xs">
                      <div class="row items-center q-gutter-xs">
                        <q-badge color="orange" text-color="white" class="q-mr-xs">
                          {{ ocupacion.tipo_principal }}
                        </q-badge>
                        <q-badge v-if="ocupacion.tipo_1" color="orange-3" text-color="dark" class="q-mr-xs">
                          {{ ocupacion.tipo_1 }}
                        </q-badge>
                        <q-badge v-if="ocupacion.tipo_2" color="orange-2" text-color="dark" class="q-mr-xs">
                          {{ ocupacion.tipo_2 }}
                        </q-badge>
                        <span v-if="ocupacion.ingresos" class="text-green text-weight-medium">
                          Ingresos:
                          ${{ ocupacion.ingresos.toLocaleString() }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-caption text-grey">Sin integrantes</div>
          </q-card-section>

          <q-separator />

          <!-- 7. SERVICIOS -->
          <q-card-section v-if="marcadorActualEnTiempoReal.servicios?.length" class="q-pa-md">
            <div class="text-subtitle1 text-weight-medium q-mb-md flex items-center">
              <q-icon name="electrical_services" class="q-mr-xs" />
              Servicios
              <q-chip :label="marcadorActualEnTiempoReal.servicios.length" color="indigo" text-color="white" size="sm"
                class="q-ml-sm" />
            </div>
            <div class="row q-col-gutter-sm">
              <div v-for="(servicio, index) in marcadorActualEnTiempoReal.servicios" :key="index" class="col-6">
                <q-chip :color="'primary'" text-color="white" size="sm" class="full-width">
                  <q-icon :name="'check_circle'" class="q-mr-xs" />
                  {{ servicio.nombre }}
                </q-chip>
                <span v-if="servicio.opcion_servicio" class="q-ml-xs text-caption text-bold">
                  ({{ servicio.opcion_servicio }})
                </span>
              </div>
            </div>
          </q-card-section>

          <q-separator v-if="marcadorActualEnTiempoReal.servicios?.length" />

          <!-- 8. PROGRAMAS -->
          <q-card-section class="q-pa-md" :key="`programas-${dniMarcadorSeleccionado}-${lastUpdateTimestamp}`">
            <div class="text-subtitle1 text-weight-medium q-mb-md flex items-center">
              <q-icon name="assignment" class="q-mr-xs" />
              Programas Activos
              <q-chip v-if="programasActivosDirectos.length" :label="programasActivosDirectos.length" color="primary"
                text-color="white" size="sm" class="q-ml-sm" />
            </div>

            <div v-if="programasActivosDirectos.length">
              <div v-for="(programa, index) in programasActivosDirectos" :key="index"
                class="text-body2 q-mb-xs q-pa-sm rounded-borders"
                :class="$q.dark.isActive ? 'bg-green-9' : 'bg-green-1'">
                <div class="text-weight-medium">{{ programa.tipo }}</div>
                <div class="text-caption">{{ programa.ayuda }}</div>
                <div class="text-caption">{{ programa.detalle }}</div>
                <!-- Mostrar notas del programa si existen -->
                <div v-if="programa.notas" class="text-caption text-grey q-mt-xs">
                  <q-icon name="note" size="xs" class="q-mr-xs" />
                  {{ programa.notas }}
                </div>
                <q-badge v-if="programa.fechaInicio" color="green" class="q-mt-xs" text-color="white">
                  Desde:
                  {{ new Date(programa.fechaInicio).toLocaleDateString() }}
                </q-badge>
              </div>
            </div>
            <div v-else class="text-caption text-grey">Ninguno</div>

            <div class="q-mt-sm">
              <q-btn label="Historial de Programas" color="primary" flat @click="abrirHistorialProgramas"
                :badge="programasInactivosDirectos.length || undefined" />
            </div>
          </q-card-section>

          <!-- Notas (al final si existen) -->
          <div v-if="marcadorActualEnTiempoReal.notas">
            <q-separator />
            <q-card-section class="q-pa-md">
              <div class="text-subtitle1 text-weight-medium q-mb-md flex items-center">
                <q-icon name="note" class="q-mr-xs" />
                Observaciones
              </div>
              <div class="text-body2 q-pa-sm rounded-borders" :class="$q.dark.isActive ? 'bg-grey-8' : 'bg-grey-2'">
                {{ marcadorActualEnTiempoReal.notas }}
              </div>
            </q-card-section>
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
        </div>

        <!-- Acciones fijas en la parte inferior (opcional) -->
        <div style="flex-shrink: 0">
          <q-separator />
          <q-card-actions class="q-pa-sm justify-end">
            <q-btn flat round icon="print" @click="generarPDF" size="md">
              <q-tooltip>Imprimir</q-tooltip>
            </q-btn>
            <!-- 
            <q-btn flat v-if="permisos.puedeEditar" label="Editar" @click="editarMarcador" color="orange-8" size="md" />

            <q-btn flat v-if="permisos.puedeEliminar" label="Eliminar" @click="eliminarMarcador" color="red"
              size="md" /> -->
          </q-card-actions>
        </div>
      </q-card>
    </q-dialog>

    <!-- Modal historial - DIRECTAMENTE DEL STORE -->
    <q-dialog v-model="mostrarModalHistorial">
      <q-card style="min-width: 350px; max-width: 550px">
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
                    Inicio:
                    {{
                      programa.fechaInicio
                        ? new Date(programa.fechaInicio).toLocaleDateString()
                        : 'N/A'
                    }}
                    <br />
                    Fin:
                    {{
                      programa.fechaFin
                        ? new Date(programa.fechaFin).toLocaleDateString()
                        : 'N/A'
                    }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-caption text-grey">
            No hay programas inactivos.
          </div>
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
import {
  onMounted,
  computed,
  ref,
  watch,
  nextTick,
  onBeforeUnmount,
} from 'vue';
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
  nombre: string;
  apellido: string;
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
    (marcador) => marcador.dni === dniMarcadorSeleccionado.value
  );

  if (!marcadorEncontrado) return null;

  const marcadorLimpio = limpiarObjeto(marcadorEncontrado);
  return {
    nombre: marcadorLimpio.nombre || '',
    apellido: marcadorLimpio.apellido || '',
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
  return marcadorActualEnTiempoReal.value.programas.filter(
    (p: Programa) => p.estado === 'activo'
  );
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
    puedeCrear:
      rol.value === 'superadmin' ||
      rol.value === 'admin' ||
      rol.value === 'user',
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
  marcadoresLimpios.value.forEach((marcador) => {
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
  return Array.from(tiposActivos)
    .sort()
    .map((tipo) => ({
      label: tipo,
      value: tipo,
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
        marcador.nombre,
        marcador.apellido,
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
      return marcador.programas.some(
        (programa: Programa) =>
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
      nombre: marcadorLimpio.nombre || '',
      apellido: marcadorLimpio.apellido || '',
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
    name: 'nombre',
    label: 'Nombre',
    field: 'nombre',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'apellido',
    label: 'Apellido',
    field: 'apellido',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'direccion',
    label: 'Dirección',
    field: 'direccion',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'telefono',
    label: 'Teléfono',
    field: 'telefono',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'dni',
    label: 'DNI',
    field: 'dni',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'notas',
    label: 'Notas',
    field: 'notas',
    align: 'left' as const,
    sortable: true,
  },
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

// Función mejorada para generar PDF con diseño de tarjetas/cuadros
async function generarPDF() {
  // CAMBIO PRINCIPAL: Usar marcadorActualEnTiempoReal en lugar de gisStore.marcadorSeleccionado
  if (!marcadorActualEnTiempoReal.value) {
    alert('No hay ningún marcador seleccionado');
    return;
  }

  try {
    // Verificar si jsPDF está disponible
    if (typeof jsPDF === 'undefined') {
      console.error('jsPDF no está disponible');
      alert('Error: La librería jsPDF no está cargada. Verifique la conexión a internet.');
      return;
    }

    // CAMBIO: Usar el marcador del computed que se actualiza en tiempo real
    const marcador = marcadorActualEnTiempoReal.value;
    const doc = new jsPDF('p', 'mm', 'a4');

    // ===== CONFIGURACIÓN OPTIMIZADA =====
    const CONFIG = {
      margins: { top: 12, right: 12, bottom: 15, left: 12 },
      pageWidth: doc.internal.pageSize.width,
      pageHeight: doc.internal.pageSize.height,
      colors: {
        primary: [25, 118, 210],
        success: [76, 175, 80],
        error: [244, 67, 54],
        warning: [255, 152, 0],
        info: [33, 150, 243],
        text: [33, 33, 33],
        textSecondary: [117, 117, 117],
        light: [248, 249, 250],
        cardBg: [250, 250, 250],
        cardBorder: [220, 220, 220]
      },
      fonts: {
        title: { size: 14, style: 'bold' },
        cardTitle: { size: 9, style: 'bold' },
        cardLabel: { size: 7, style: 'bold' },
        cardValue: { size: 7, style: 'normal' },
        small: { size: 6, style: 'normal' },
        tiny: { size: 5, style: 'normal' }
      },
      card: {
        padding: 3,
        margin: 2,
        cornerRadius: 1,
        headerHeight: 8,
        minHeight: 15
      }
    };

    let yPos = CONFIG.margins.top;
    const contentWidth = CONFIG.pageWidth - CONFIG.margins.left - CONFIG.margins.right;

    // ===== FUNCIONES HELPER MEJORADAS =====

    // Función para limpiar caracteres especiales
    function cleanText(text, preserveSpaces = true) {
      if (!text || typeof text !== 'string') return '';

      let cleaned = text
        .replace(/%ª/g, '')
        .replace(/%Ï/g, '')
        .replace(/%[a-zA-Z]/g, '')
        .replace(/[^\w\s\-.,;:()\[\]\/]/g, '')
        .trim();

      if (preserveSpaces) {
        cleaned = cleaned.replace(/\s+/g, ' ');
      }

      return cleaned;
    }

    function getSafeValue(value, defaultValue = 'N/A') {
      if (value === null || value === undefined || value === '') {
        return defaultValue;
      }

      const cleanedValue = cleanText(String(value));
      return cleanedValue || defaultValue;
    }

    function setColor(colorArray) {
      doc.setTextColor(colorArray[0], colorArray[1], colorArray[2]);
    }

    function setFont(fontConfig) {
      doc.setFontSize(fontConfig.size);
      doc.setFont('helvetica', fontConfig.style);
    }

    function checkPageBreak(requiredSpace = 15) {
      if (yPos > CONFIG.pageHeight - CONFIG.margins.bottom - requiredSpace) {
        doc.addPage();
        yPos = CONFIG.margins.top + 5;
        return true;
      }
      return false;
    }

    // ===== FUNCIONES PARA TARJETAS =====

    // Crear tarjeta básica
    function createCard(x, y, width, height, title, color = CONFIG.colors.primary) {
      // Fondo de la tarjeta
      doc.setFillColor(CONFIG.colors.cardBg[0], CONFIG.colors.cardBg[1], CONFIG.colors.cardBg[2]);
      doc.rect(x, y, width, height, 'F');

      // Borde de la tarjeta
      doc.setDrawColor(CONFIG.colors.cardBorder[0], CONFIG.colors.cardBorder[1], CONFIG.colors.cardBorder[2]);
      doc.setLineWidth(0.3);
      doc.rect(x, y, width, height, 'S');

      // Header de la tarjeta
      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(x, y, width, CONFIG.card.headerHeight, 'F');

      // Título de la tarjeta
      setFont(CONFIG.fonts.cardTitle);
      doc.setTextColor(255, 255, 255);
      doc.text(cleanText(title).toUpperCase(), x + CONFIG.card.padding, y + 5);

      return {
        contentX: x + CONFIG.card.padding,
        contentY: y + CONFIG.card.headerHeight + CONFIG.card.padding,
        contentWidth: width - (CONFIG.card.padding * 2),
        contentHeight: height - CONFIG.card.headerHeight - (CONFIG.card.padding * 2)
      };
    }

    // Agregar campo en tarjeta
    function addCardField(label, value, x, y, maxWidth) {
      const cleanLabel = getSafeValue(label);
      const cleanValue = getSafeValue(value);

      if (cleanValue === 'N/A') return y;

      // Label
      setFont(CONFIG.fonts.cardLabel);
      setColor(CONFIG.colors.textSecondary);
      doc.text(`${cleanLabel}:`, x, y);

      // Value
      setFont(CONFIG.fonts.cardValue);
      setColor(CONFIG.colors.text);

      const valueLines = doc.splitTextToSize(cleanValue, maxWidth - 5);
      valueLines.forEach((line, index) => {
        doc.text(line, x, y + 3 + (index * 3));
      });

      return y + 3 + (valueLines.length * 3) + 1;
    }

    // Agregar lista en tarjeta
    function addCardList(items, x, y, maxWidth, columns = 1) {
      const cleanItems = items
        .filter(item => item && item.toString().trim())
        .map(item => getSafeValue(item))
        .filter(item => item !== 'N/A');

      if (cleanItems.length === 0) return y;

      const columnWidth = maxWidth / columns;
      let currentColumn = 0;
      let currentY = y;
      let maxY = y;

      setFont(CONFIG.fonts.cardValue);
      setColor(CONFIG.colors.text);

      cleanItems.forEach((item, index) => {
        const itemX = x + (currentColumn * columnWidth);

        // Bullet
        doc.text('•', itemX, currentY);

        // Texto
        const lines = doc.splitTextToSize(item, columnWidth - 8);
        lines.forEach((line, lineIndex) => {
          doc.text(line, itemX + 4, currentY + (lineIndex * 3));
        });

        const itemHeight = lines.length * 3;
        maxY = Math.max(maxY, currentY + itemHeight);

        currentColumn++;
        if (currentColumn >= columns) {
          currentColumn = 0;
          currentY = maxY + 2;
        }
      });

      return Math.max(maxY, currentY) + 2;
    }

    // Calcular altura necesaria para contenido
    function calculateContentHeight(fields) {
      let height = CONFIG.card.headerHeight + (CONFIG.card.padding * 2);

      fields.forEach(field => {
        if (field.value && getSafeValue(field.value) !== 'N/A') {
          height += 8; // Altura base por campo

          // Calcular líneas adicionales si el texto es largo
          const lines = doc.splitTextToSize(getSafeValue(field.value), 60);
          if (lines.length > 1) {
            height += (lines.length - 1) * 3;
          }
        }
      });

      return Math.max(height, CONFIG.card.minHeight);
    }

    // ===== GENERACIÓN DEL DOCUMENTO CON TARJETAS =====

    // Título principal
    doc.setFillColor(CONFIG.colors.primary[0], CONFIG.colors.primary[1], CONFIG.colors.primary[2]);
    doc.rect(CONFIG.margins.left - 5, yPos - 3, contentWidth + 10, 20, 'F');

    setFont(CONFIG.fonts.title);
    doc.setTextColor(255, 255, 255);
    const titleText = 'REPORTE DE INFORMACIÓN PERSONAL';
    const titleWidth = doc.getTextWidth(titleText);
    const titleX = (CONFIG.pageWidth - titleWidth) / 2;
    doc.text(titleText, titleX, yPos + 8);

    setFont(CONFIG.fonts.small);
    const subtitleText = `Generado: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}`;
    const subtitleWidth = doc.getTextWidth(subtitleText);
    const subtitleX = (CONFIG.pageWidth - subtitleWidth) / 2;
    doc.text(subtitleText, subtitleX, yPos + 14);

    yPos += 25;

    // ===== TARJETAS DE INFORMACIÓN =====

    // 1. INFORMACIÓN BÁSICA
    {
      const baseHeight = CONFIG.card.headerHeight + CONFIG.card.padding * 2;
      const lineHeight = 5;
      const basicHeight = baseHeight + (3 * lineHeight);
      checkPageBreak(basicHeight);
      const basicCard = createCard(CONFIG.margins.left, yPos, contentWidth, basicHeight, 'INFORMACION BASICA', CONFIG.colors.primary);

      let cardY = basicCard.contentY;
      cardY = addCardField('Nombre Completo', `${getSafeValue(marcador.nombre)} ${getSafeValue(marcador.apellido)}`, basicCard.contentX, cardY, basicCard.contentWidth);
      cardY = addCardField('DNI', marcador.dni, basicCard.contentX, cardY, basicCard.contentWidth);
      cardY = addCardField('Domicilio', marcador.direccion, basicCard.contentX, cardY, basicCard.contentWidth);

      const col2X = basicCard.contentX + (basicCard.contentWidth / 2);
      let cardY2 = basicCard.contentY;
      cardY2 = addCardField('Teléfono', marcador.telefono, col2X, cardY2, basicCard.contentWidth / 2);
      cardY2 = addCardField('Barrio', marcador.barrio, col2X, cardY2, basicCard.contentWidth / 2);
      cardY2 = addCardField('Tiempo Residencia', marcador.tiempo_residencia, col2X, cardY2, basicCard.contentWidth / 2);

      yPos += basicHeight + 3;
    }

    // 2. EDUCACION Y SALUD
    {
      const cardWidth = (contentWidth - 5) / 2;

      // Educación
      let estudiosItems = marcador.estudios?.map(e => getSafeValue(e.nivel)).filter(e => e !== 'N/A') || [];
      let alturaEstudios = CONFIG.card.headerHeight + CONFIG.card.padding * 2 + estudiosItems.length * 4;
      if (estudiosItems.length === 0) alturaEstudios += 4;

      checkPageBreak(alturaEstudios);
      const studyCard = createCard(CONFIG.margins.left, yPos, cardWidth, alturaEstudios, 'EDUCACION', CONFIG.colors.info);
      if (estudiosItems.length > 0) {
        addCardList(estudiosItems, studyCard.contentX, studyCard.contentY, studyCard.contentWidth, 1);
      } else {
        setFont(CONFIG.fonts.cardValue);
        setColor(CONFIG.colors.textSecondary);
        doc.text('Sin información', studyCard.contentX, studyCard.contentY);
      }

      // Salud
      let alturaSalud = CONFIG.card.headerHeight + CONFIG.card.padding * 2;
      if (marcador.salud?.length > 0) {
        marcador.salud.forEach(s => {
          if (getSafeValue(s.problema_salud) !== 'N/A') {
            alturaSalud += 4;
            if (s.cud || s.obra_social) alturaSalud += 3;
          }
        });
        if (alturaSalud === CONFIG.card.headerHeight + CONFIG.card.padding * 2) alturaSalud += 4;
      } else {
        alturaSalud += 4;
      }

      const healthCard = createCard(CONFIG.margins.left + cardWidth + 5, yPos, cardWidth, alturaSalud, 'SALUD', CONFIG.colors.error);
      if (marcador.salud?.length > 0) {
        let healthY = healthCard.contentY;
        let hasValidHealth = false;

        marcador.salud.forEach((saludItem) => {
          const problema = getSafeValue(saludItem.problema_salud);
          if (problema !== 'N/A') {
            hasValidHealth = true;
            setFont(CONFIG.fonts.cardValue);
            setColor(CONFIG.colors.text);
            doc.text(`• ${problema}`, healthCard.contentX, healthY);
            healthY += 4;

            let cobertura = [];
            if (saludItem.cud) cobertura.push('CUD');
            if (saludItem.obra_social) cobertura.push('O.S.');

            if (cobertura.length > 0) {
              setFont(CONFIG.fonts.tiny);
              setColor(CONFIG.colors.textSecondary);
              doc.text(`  ${cobertura.join(', ')}`, healthCard.contentX, healthY);
              healthY += 3;
            }
          }
        });

        if (!hasValidHealth) {
          setFont(CONFIG.fonts.cardValue);
          setColor(CONFIG.colors.textSecondary);
          doc.text('Sin información', healthCard.contentX, healthCard.contentY);
        }
      } else {
        setFont(CONFIG.fonts.cardValue);
        setColor(CONFIG.colors.textSecondary);
        doc.text('Sin información', healthCard.contentX, healthCard.contentY);
      }

      yPos += Math.max(alturaEstudios, alturaSalud) + 3;
    }

    {
      let alturaVivienda = CONFIG.card.headerHeight + CONFIG.card.padding * 2;

      if (marcador.viviendas?.length > 0) {
        // Cada vivienda ocupa 2 filas de campos → 2 * altura por vivienda
        alturaVivienda += marcador.viviendas.length * (2 * 6); // 6 es el alto estimado por campo
      } else {
        alturaVivienda += 5;
      }

      checkPageBreak(alturaVivienda);
      const housingCard = createCard(CONFIG.margins.left, yPos, contentWidth, alturaVivienda, 'VIVIENDA', CONFIG.colors.warning);

      if (marcador.viviendas?.length > 0) {
        let housingY = housingCard.contentY;
        const col1X = housingCard.contentX;
        const col2X = housingCard.contentX + (housingCard.contentWidth / 2);
        const colWidth = housingCard.contentWidth / 2;

        marcador.viviendas.forEach((vivienda, index) => {
          // Fila 1
          housingY = addCardField('Tipo', getSafeValue(vivienda.tipo), col1X, housingY, colWidth);
          housingY = addCardField('Dominio', getSafeValue(vivienda.dominio), col2X, housingY - 6, colWidth); // misma fila

          // Fila 2
          housingY = addCardField('Ambientes', getSafeValue(vivienda.ambientes), col1X, housingY, colWidth);

          const bañoInfo = getSafeValue(vivienda.baño) +
            (vivienda.baño_opcion ? ` (${getSafeValue(vivienda.baño_opcion)})` : '');
          housingY = addCardField('Baño', bañoInfo, col2X, housingY - 6, colWidth); // misma fila

          housingY += 2; // espacio entre viviendas
        });
      } else {
        setFont(CONFIG.fonts.cardValue);
        setColor(CONFIG.colors.textSecondary);
        doc.text('Sin información de vivienda', housingCard.contentX, housingCard.contentY);
      }

      yPos += alturaVivienda + 3;
    }

    // 4. OCUPACION
    // 4. TARJETA DE OCUPACIÓN (con altura dinámica)
    if (marcador.ocupaciones && marcador.ocupaciones.length > 0) {
      // Calcular altura necesaria
      const ocupacionesAltura = marcador.ocupaciones.reduce((acc, ocupacion) => {
        let altura = 6; // ocupación + título
        if (ocupacion.tipo_1 || ocupacion.tipo_2) altura += 5;
        if (ocupacion.ingresos) altura += 5;
        return acc + altura + 2; // +2 de espacio extra
      }, CONFIG.card.headerHeight + CONFIG.card.padding * 2);

      checkPageBreak(ocupacionesAltura);
      const jobCard = createCard(CONFIG.margins.left, yPos, contentWidth, ocupacionesAltura, 'OCUPACIÓN', CONFIG.colors.success);

      let jobY = jobCard.contentY;

      marcador.ocupaciones.forEach((ocupacion, index) => {
        const nombreOcupacion = getSafeValue(ocupacion.nombre || ocupacion.tipo_principal);
        if (nombreOcupacion !== 'N/A') {
          jobY = addCardField(`Ocupación ${index + 1}`, nombreOcupacion, jobCard.contentX, jobY, jobCard.contentWidth);

          const tipo1 = getSafeValue(ocupacion.tipo_1);
          const tipo2 = getSafeValue(ocupacion.tipo_2);
          if (tipo1 !== 'N/A' || tipo2 !== 'N/A') {
            jobY = addCardField('Tipo', `${tipo1} - ${tipo2}`, jobCard.contentX + 10, jobY, jobCard.contentWidth - 10);
          }

          if (ocupacion.ingresos && !isNaN(ocupacion.ingresos)) {
            jobY = addCardField('Ingresos', `$${ocupacion.ingresos.toLocaleString('es-ES')}`, jobCard.contentX + 10, jobY, jobCard.contentWidth - 10);
          }

          jobY += 2; // espacio entre ocupaciones
        }
      });

      yPos += ocupacionesAltura + 3;
    } else {
      checkPageBreak(25);
      const jobCard = createCard(CONFIG.margins.left, yPos, contentWidth, 22, 'OCUPACIÓN', CONFIG.colors.success);
      setFont(CONFIG.fonts.cardValue);
      setColor(CONFIG.colors.textSecondary);
      doc.text('Sin ocupaciones registradas', jobCard.contentX, jobCard.contentY);
      yPos += 25;
    }


    // 5. INTEGRANTES
    // 5. INTEGRANTES
    {
      let alturaIntegrantes =
        CONFIG.card.headerHeight + CONFIG.card.padding * 2;
      if (marcador.integrantes?.length > 0)
        alturaIntegrantes += 10 + marcador.integrantes.length * 8; // Aumenta altura para ocupaciones
      else alturaIntegrantes += 4;

      checkPageBreak(alturaIntegrantes);
      const membersCard = createCard(
        CONFIG.margins.left,
        yPos,
        contentWidth,
        alturaIntegrantes,
        'INTEGRANTES DEL HOGAR',
        CONFIG.colors.success
      );

      if (marcador.integrantes?.length > 0) {
        let membersY = membersCard.contentY;

        const totalIntegrantes = marcador.integrantes.length;
        const edadesValidas = marcador.integrantes
          .filter((i) => i.edad && !isNaN(i.edad))
          .map((i) => parseInt(i.edad));
        const edadPromedio =
          edadesValidas.length > 0
            ? Math.round(
              edadesValidas.reduce((sum, edad) => sum + edad, 0) /
              edadesValidas.length
            )
            : 'N/A';

        membersY = addCardField(
          'Total',
          `${totalIntegrantes} integrantes`,
          membersCard.contentX,
          membersY,
          membersCard.contentWidth / 2
        );
        addCardField(
          'Edad Promedio',
          edadPromedio !== 'N/A' ? `${edadPromedio} años` : 'N/A',
          membersCard.contentX + membersCard.contentWidth / 2,
          membersCard.contentY,
          membersCard.contentWidth / 2
        );

        setFont(CONFIG.fonts.cardLabel);
        setColor(CONFIG.colors.textSecondary);
        doc.text('DETALLE:', membersCard.contentX, membersY + 2);
        membersY += 6;

        marcador.integrantes.forEach((i, index) => {
          const nombre = getSafeValue(i.nombre);
          const apellido = getSafeValue(i.apellido);
          const edad = getSafeValue(i.edad);
          const vinculo = getSafeValue(i.vinculo);

          setFont(CONFIG.fonts.cardValue);
          setColor(CONFIG.colors.text);
          doc.text(
            `${index + 1}. ${nombre} ${apellido} (${edad} años) - ${vinculo}`,
            membersCard.contentX,
            membersY
          );
          membersY += 4;

          // Ocupaciones del integrante
          if (i.ocupaciones && i.ocupaciones.length > 0) {
            i.ocupaciones.forEach((ocup, oidx) => {
              const tipoPrincipal = getSafeValue(ocup.tipo_principal);
              const tipo1 = getSafeValue(ocup.tipo_1);
              const tipo2 = getSafeValue(ocup.tipo_2);
              const ingresos =
                ocup.ingresos && !isNaN(ocup.ingresos)
                  ? `$${ocup.ingresos.toLocaleString('es-ES')}`
                  : '';

              let ocupacionLinea = `   - Ocupación: ${tipoPrincipal}`;
              if (tipo1 !== 'N/A' || tipo2 !== 'N/A') {
                ocupacionLinea += ` (${[tipo1, tipo2].filter((t) => t && t !== 'N/A').join(' - ')})`;
              }
              if (ingresos) {
                ocupacionLinea += ` | Ingresos: ${ingresos}`;
              }

              setFont(CONFIG.fonts.small);
              setColor(CONFIG.colors.textSecondary);
              doc.text(ocupacionLinea, membersCard.contentX + 4, membersY);
              membersY += 3;
            });
          }
        });
      } else {
        setFont(CONFIG.fonts.cardValue);
        setColor(CONFIG.colors.textSecondary);
        doc.text(
          'No hay integrantes registrados',
          membersCard.contentX,
          membersCard.contentY
        );
      }

      yPos += alturaIntegrantes + 3;
    }


    {
      const cardWidth = (contentWidth - 5) / 2;

      // ==== Servicios ====
      let conectados = marcador.servicios?.filter(s => s.opcion_servicio === 'Conectado') || [];
      let noConectados = marcador.servicios?.filter(s => s.opcion_servicio !== 'Conectado') || [];
      let serviciosAltura = CONFIG.card.headerHeight + CONFIG.card.padding * 2;

      if (conectados.length > 0) serviciosAltura += 4 + conectados.length * 3;
      if (noConectados.length > 0) serviciosAltura += 4 + noConectados.length * 3;
      if (conectados.length === 0 && noConectados.length === 0) serviciosAltura += 4;

      checkPageBreak(serviciosAltura);
      const servicesCard = createCard(CONFIG.margins.left, yPos, cardWidth, serviciosAltura, 'SERVICIOS', CONFIG.colors.info);

      let servicesY = servicesCard.contentY;

      if (conectados.length > 0) {
        setFont(CONFIG.fonts.cardLabel);
        setColor(CONFIG.colors.success);
        // doc.text('✓ CONECTADOS:', servicesCard.contentX, servicesY);
        servicesY += 4;

        conectados.forEach(s => {
          const nombre = getSafeValue(s.nombre);
          if (nombre !== 'N/A') {
            setFont(CONFIG.fonts.cardValue);
            setColor(CONFIG.colors.text);
            doc.text(`• ${nombre}`, servicesCard.contentX, servicesY);
            servicesY += 3;
          }
        });
      }

      if (noConectados.length > 0) {
        setFont(CONFIG.fonts.cardLabel);
        setColor(CONFIG.colors.error);
        // doc.text('✗ NO CONECTADOS:', servicesCard.contentX, servicesY);
        servicesY += 4;

        noConectados.forEach(s => {
          const nombre = getSafeValue(s.nombre);
          if (nombre !== 'N/A') {
            setFont(CONFIG.fonts.cardValue);
            setColor(CONFIG.colors.text);
            doc.text(`• ${nombre}`, servicesCard.contentX, servicesY);
            servicesY += 3;
          }
        });
      }

      if (conectados.length === 0 && noConectados.length === 0) {
        setFont(CONFIG.fonts.cardValue);
        setColor(CONFIG.colors.textSecondary);
        doc.text('Sin servicios registrados', servicesCard.contentX, servicesY);
      }

      // ==== Programas ====
      let activos = marcador.programas?.filter(p => p.estado === 'activo') || [];
      let inactivos = marcador.programas?.filter(p => p.estado !== 'activo') || [];
      let programasAltura = CONFIG.card.headerHeight + CONFIG.card.padding * 2;

      if (activos.length > 0) programasAltura += 4 + activos.length * 3;
      if (inactivos.length > 0) programasAltura += 4 + inactivos.length * 3;
      if (activos.length === 0 && inactivos.length === 0) programasAltura += 4;

      const programsCard = createCard(CONFIG.margins.left + cardWidth + 5, yPos, cardWidth, programasAltura, 'PROGRAMAS', CONFIG.colors.warning);
      let programsY = programsCard.contentY;

      if (activos.length > 0) {
        setFont(CONFIG.fonts.cardLabel);
        setColor(CONFIG.colors.success);

        programsY += 4;

        activos.forEach((p) => {
          const tipo = getSafeValue(p.tipo);
          const ayuda = getSafeValue(p.ayuda);
          const detalle = getSafeValue(p.detalle);
          if (tipo !== 'N/A' || ayuda !== 'N/A' || detalle !== 'N/A') {
            setFont(CONFIG.fonts.cardValue);
            setColor(CONFIG.colors.text);
            doc.text(`• ${tipo} - ${ayuda}`, programsCard.contentX, programsY);
            if (detalle && detalle !== 'N/A') {
              setFont(CONFIG.fonts.tiny);
              setColor(CONFIG.colors.textSecondary);
              doc.text(`  Detalle: ${detalle}`, programsCard.contentX + 10, programsY + 3);
            }
            programsY += 3;
          }
        });
      }

      if (inactivos.length > 0) {
        setFont(CONFIG.fonts.cardLabel);
        setColor(CONFIG.colors.textSecondary);
        doc.text('FINALIZADOS:', programsCard.contentX, programsY);
        programsY += 4;

        inactivos.forEach(p => {
          const tipo = getSafeValue(p.tipo);
          const ayuda = getSafeValue(p.ayuda);
          if (tipo !== 'N/A' || ayuda !== 'N/A') {
            setFont(CONFIG.fonts.cardValue);
            setColor(CONFIG.colors.textSecondary);
            doc.text(`• ${tipo} - ${ayuda}`, programsCard.contentX, programsY);
            programsY += 3;
          }
        });
      }

      if (activos.length === 0 && inactivos.length === 0) {
        setFont(CONFIG.fonts.cardValue);
        setColor(CONFIG.colors.textSecondary);
        doc.text('Sin programas asignados', programsCard.contentX, programsCard.contentY);
      }

      yPos += Math.max(serviciosAltura, programasAltura) + 3;
    }


    {
      if (marcador.notas && marcador.notas.trim()) {
        const notasLimpias = getSafeValue(marcador.notas.trim());
        if (notasLimpias !== 'N/A') {
          const notasLines = doc.splitTextToSize(notasLimpias, contentWidth);
          const notasAltura = CONFIG.card.headerHeight + CONFIG.card.padding * 2 + (notasLines.length * 4);

          checkPageBreak(notasAltura);
          const notesCard = createCard(CONFIG.margins.left, yPos, contentWidth, notasAltura, 'OBSERVACIONES', [121, 85, 72]);

          setFont(CONFIG.fonts.cardValue);
          setColor(CONFIG.colors.text);

          notasLines.forEach((linea, index) => {
            doc.text(linea, notesCard.contentX, notesCard.contentY + (index * 4));
          });

          yPos += notasAltura + 3;
        }
      }
    }


    // ===== FOOTER =====
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      // Línea decorativa
      doc.setDrawColor(CONFIG.colors.primary[0], CONFIG.colors.primary[1], CONFIG.colors.primary[2]);
      doc.setLineWidth(0.5);
      doc.line(CONFIG.margins.left, CONFIG.pageHeight - 12, CONFIG.pageWidth - CONFIG.margins.right, CONFIG.pageHeight - 12);

      // Información del sistema
      setFont(CONFIG.fonts.tiny);
      setColor(CONFIG.colors.textSecondary);
      doc.text(`Sistema GIS - ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}`,
        CONFIG.margins.left, CONFIG.pageHeight - 6);
      doc.text(`Página ${i} de ${totalPages}`,
        CONFIG.pageWidth - CONFIG.margins.right - 15, CONFIG.pageHeight - 6);
    }

    // ===== GENERAR PDF =====
    const nombreLimpio = getSafeValue(marcador.nombre) || 'Usuario';
    const apellidoLimpio = getSafeValue(marcador.apellido) || 'Desconocido';
    const fileName = `Reporte_${nombreLimpio}_${apellidoLimpio}_${new Date().toISOString().split('T')[0]}.pdf`;

    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);

    // Abrir para imprimir
    const printWindow = window.open(blobUrl, '_blank');
    if (printWindow) {
      printWindow.onload = function () {
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 1000);
      };
    } else {
      // Fallback: descargar
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert('PDF generado y descargado. Verifique su carpeta de descargas.');
    }

    // Limpiar URL después de 10 segundos
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 10000);

  } catch (error) {
    console.error('Error detallado al generar el PDF:', error);
    alert(`Error al generar el PDF: ${error.message}. Verifique que jsPDF esté correctamente cargado.`);
  }
}



function generarPDFFiltro() {
  const doc = new jsPDF();

  // Configuración del encabezado
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Lista de Marcadores', 14, 22);

  let yPosition = 35;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Filtros Aplicados:', 14, yPosition);
  yPosition += 8;

  // Mostrar filtros aplicados
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  if (filtro.value) {
    doc.text(`• Búsqueda por texto: "${filtro.value}"`, 20, yPosition);
    yPosition += 6;
  }

  if (filtroPrograma.value) {
    doc.text(`• Programa activo filtrado: "${filtroPrograma.value}"`, 20, yPosition);
    yPosition += 6;
  }

  if (!filtro.value && !filtroPrograma.value) {
    doc.text('• Sin filtros aplicados (mostrando todos los registros)', 20, yPosition);
    yPosition += 6;
  }

  // Información adicional
  yPosition += 4;
  doc.text(`Total de registros mostrados: ${marcadoresFiltrados.value.length}`, 14, yPosition);
  yPosition += 6;
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`, 14, yPosition);
  yPosition += 10;

  // Preparar datos para la tabla
  const headers = [
    'Nombre',
    'Apellido',
    'Dirección',
    'Teléfono',
    'DNI',
    filtroPrograma.value ? `Programa: ${filtroPrograma.value}` : 'Programas Activos',
    'Notas'
  ];

  const data = marcadoresFiltrados.value.map((marcador) => {
    let programasTexto = '';

    if (filtroPrograma.value) {
      // Si hay un filtro de programa específico, mostrar solo ese programa
      const programasFiltrados = marcador.programas
        ?.filter((p: Programa) => p.estado === 'activo' && p.tipo === filtroPrograma.value)
        .map((p: Programa) => `${p.ayuda}${p.notas ? ` (${p.notas})` : ''}`)
        .join(', ') || 'Sin este programa';
      programasTexto = programasFiltrados;
    } else {
      // Si no hay filtro específico, mostrar todos los programas activos
      const todosLosActivos = marcador.programas
        ?.filter((p: Programa) => p.estado === 'activo')
        .map((p: Programa) => `${p.tipo}: ${p.ayuda}`)
        .join(', ') || 'Ninguno';
      programasTexto = todosLosActivos;
    }

    return [
      marcador.nombre || '',
      marcador.apellido || '',
      marcador.direccion || '',
      marcador.telefono || '',
      marcador.dni || '',
      programasTexto,
      marcador.notas || ''
    ];
  });

  // Generar tabla
  autoTable(doc, {
    head: [headers],
    body: data,
    startY: yPosition,
    styles: {
      fontSize: 8,
      cellPadding: 3,
      overflow: 'linebreak',
      halign: 'left'
    },
    headStyles: {
      fillColor: [63, 81, 181],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9
    },
    columnStyles: {
      0: { cellWidth: 25 }, // Nombre
      1: { cellWidth: 25 }, // Apellido
      2: { cellWidth: 35 }, // Dirección
      3: { cellWidth: 20 }, // Teléfono
      4: { cellWidth: 20 }, // DNI
      5: { cellWidth: 45 }, // Programas (más ancho para el contenido)
      6: { cellWidth: 25 }  // Notas
    },
    margin: { left: 14, right: 14 },
    pageBreak: 'auto',
    showHead: 'everyPage',
    // Agregar pie de página con número de página
    didDrawPage: function (data) {
      const pageNumber = doc.internal.getNumberOfPages();
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Página ${data.pageNumber} de ${pageNumber}`, 14, pageHeight - 10);
      doc.text(`Generado el ${new Date().toLocaleDateString()}`, doc.internal.pageSize.width - 50, pageHeight - 10);
    }
  });

  // Generar y mostrar el PDF
  const nombreArchivo = `marcadores_${filtroPrograma.value ? filtroPrograma.value.replace(/\s+/g, '_') : 'todos'}_${new Date().toISOString().split('T')[0]}.pdf`;

  const pdfBlob = doc.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);

  const printWindow = window.open(blobUrl);
  if (printWindow) {
    printWindow.onload = function () {
      printWindow.focus();
      printWindow.print();
      // Opcional: cerrar la ventana después de imprimir
      // setTimeout(() => printWindow.close(), 1000);
    };
  } else {
    // Fallback: descargar el archivo si no se puede abrir ventana
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert('No se pudo abrir la ventana de impresión. El archivo se ha descargado automáticamente.');
  }

  // Limpiar el URL del blob después de un tiempo
  setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
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
