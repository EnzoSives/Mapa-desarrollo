<template>
  <q-page class="full-height no-scroll">
    <div ref="mapContainer" class="mapa"></div>

    <!-- Tooltip para mostrar el nombre del marcador -->
    <div v-if="tooltipVisible" class="tooltip-marcador" :style="{
      left: tooltipPosition.x + 'px',
      top: tooltipPosition.y + 'px',
    }">
      {{ tooltipContent }}
    </div>

    <!-- Panel Info del marcador (izquierda arriba) -->
    <div id="area-imprimir">
      <q-card v-if="gisStore.marcadorSeleccionado" class="info-panel q-mx-auto"
        style="min-width: 350px; max-width: 500px; border-radius: 12px; max-height: 85vh; overflow-y: auto; display: flex; flex-direction: column;">



        <!-- Contenido con scroll -->
        <div style="flex: 1; overflow-y: auto;">
          <!-- Encabezado simple -->
          <q-card-section class="q-pa-md relative-position">
            <!-- Botón cerrar en esquina superior derecha -->
            <q-btn icon="close" flat round dense class="absolute-top-right q-ma-sm" style="z-index: 2;"
              @click="gisStore.cerrarInfo" />

            <div class="row items-center no-wrap">
              <q-avatar v-if="gisStore.marcadorSeleccionado.icono" size="44px" class="q-mr-md">
                <img :src="gisStore.marcadorSeleccionado.icono" alt="Ícono" />
              </q-avatar>
              <div class="col">
                <div class="text-h6 text-weight-medium">
                  {{ gisStore.marcadorSeleccionado.nombreApellido }}
                </div>
                <div class="text-caption text-grey">
                  {{ gisStore.marcadorSeleccionado.direccion }}
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
                <div class="text-body2">{{ gisStore.marcadorSeleccionado.telefono || 'N/A' }}</div>
              </div>
              <div class="col-6">
                <div class="text-caption text-grey">DNI</div>
                <div class="text-body2">{{ gisStore.marcadorSeleccionado.dni }}</div>
              </div>
            </div>

            <!-- Integrantes compactos -->
            <div class="q-mb-md">
              <div class="text-subtitle2 q-mb-sm">Integrantes</div>
              <div v-if="gisStore.marcadorSeleccionado.integrantes?.length">
                <div v-for="(integrante, index) in gisStore.marcadorSeleccionado.integrantes" :key="index"
                  class="row items-center q-py-xs">
                  <q-avatar size="28px" class="q-mr-sm" color="grey-5" text-color="white">
                    {{ integrante.nombre.charAt(0) }}
                  </q-avatar>
                  <div class="col">
                    <div class="text-body2">{{ integrante.nombre }} {{ integrante.apellido }}</div>
                    <div class="text-caption text-grey">{{ integrante.edad }} años • {{ integrante.dni }}</div>
                  </div>
                </div>
              </div>
              <div v-else class="text-caption text-grey">Sin integrantes</div>
            </div>

            <!-- Programas activos + botón historial -->
            <div class="q-mb-md">
              <div class="text-subtitle2 q-mb-sm">
                Programas Activos
                <q-chip v-if="programasActivos.length" :label="programasActivos.length" color="primary"
                  text-color="white" size="sm" class="q-ml-sm" />
              </div>

              <div v-if="programasActivos.length">
                <div v-for="(programa, index) in programasActivos" :key="index" class="text-body2 q-mb-xs">
                  • {{ programa.tipo }}: {{ programa.ayuda }}
                  <q-badge v-if="programa.fechaInicio" color="green" class="q-ml-sm" text-color="white">
                    {{ new Date(programa.fechaInicio).toLocaleDateString() }}
                  </q-badge>
                </div>
              </div>
              <div v-else class="text-caption text-grey">Ninguno</div>

              <div class="q-mt-sm">
                <q-btn label="Historial de Programas" color="primary" flat @click="mostrarModalHistorial = true"
                  :badge="programasInactivos.length || undefined" />
              </div>
            </div>

            <!-- Notas simples -->
            <div v-if="gisStore.marcadorSeleccionado.notas">
              <div class="text-subtitle2 q-mb-sm">Notas</div>
              <div class="text-body2">{{ gisStore.marcadorSeleccionado.notas }}</div>
            </div>
          </q-card-section>
        </div>

        <!-- Acciones fijas en la parte inferior -->
        <div style="flex-shrink: 0;">
          <q-separator />
          <q-card-actions class="q-pa-sm justify-end">
            <q-btn flat round icon="print" @click="generarPDF" size="md">
              <q-tooltip>Imprimir</q-tooltip>
            </q-btn>

            <q-btn flat v-if="permisos.puedeEditar" label="Editar" @click="editarMarcadorSeleccionado" color="orange-8"
              size="md" />

            <q-btn flat v-if="permisos.puedeEliminar" label="Eliminar" @click="eliminarMarcadorSeleccionado" color="red"
              size="md" />

            <!-- <q-btns label="Cerrar" @click="gisStore.cerrarInfo" color="primary" size="md" /> -->
          </q-card-actions>
        </div>
      </q-card>
    </div>

    <q-dialog v-model="mostrarModalHistorial">
      <q-card style="min-width: 350px; max-width: 550px;">
        <q-card-section>
          <div class="text-h6">
            Historial de Programas
            <q-chip v-if="programasInactivos.length" :label="programasInactivos.length" color="grey" text-color="white"
              size="sm" class="q-ml-sm" />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div v-if="programasInactivos.length">
            <div v-for="(programa, index) in programasInactivos" :key="index" class="q-mb-sm">
              <div class="row items-center q-gutter-sm">
                <q-badge :color="colorPorEstado(programa.estado)" class="q-mr-sm">
                  {{ programa.estado.toUpperCase() }}
                </q-badge>
                <div class="col text-body2">
                  <div>• {{ programa.tipo }}: {{ programa.ayuda }}</div>
                  <div class="text-caption text-grey">
                    Inicio: {{ programa.fechaInicio ? new Date(programa.fechaInicio).toLocaleDateString() : 'N/A' }}<br>
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


    <!-- Panel de Referencias (derecha arriba) -->
    <q-card v-if="mostrarReferencias" class="referencias-panel">
      <q-card-section>
        <div class="row justify-between items-center">
          <div class="text-subtitle1">Referencias</div>
          <q-btn dense flat icon="chevron_right" @click="mostrarReferencias = false" />
        </div>
        <div class="row q-mt-sm">
          <div v-for="icono in iconosDisponibles" :key="icono.value" class="column items-center q-mr-md">
            <img :src="icono.value" width="24" height="24" />
            <div class="text-caption">{{ icono.label }}</div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-btn v-if="!mostrarReferencias" icon="pin_drop" class="fixed-top-right q-mt-sm q-mr-sm" style="top: 50px"
      color="primary" @click="mostrarReferencias = true"><q-tooltip> Ver referencias </q-tooltip>
    </q-btn>

    <q-card v-if="mostrarDatosActuales" class="datos-actuales-panel">
      <q-card-section>
        <div class="row justify-between items-center">
          <div class="text-subtitle1">Datos cargados</div>
          <q-btn dense flat icon="chevron_right" @click="mostrarDatosActuales = false" />
        </div>

        <q-input dense outlined debounce="300" v-model="searchTerm" placeholder="Buscar por nombre o dirección"
          class="q-mt-sm q-mb-sm" clearable prepend-inner-icon="search" />

        <div class="scroll-contenido">
          <div v-for="(marcador, index) in marcadoresFiltrados" :key="marcador.id" class="q-mb-sm cursor-pointer"
            @click="verInfoMarcador(marcador)">
            <div>
              <strong>{{ index + 1 }}.</strong> {{ marcador.nombreApellido }}
            </div>
            <div class="text-caption ellipsis">{{ marcador.direccion }}</div>
            <q-separator spaced />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-btn v-if="!mostrarDatosActuales" icon="view_list" class="fixed-bottom-right q-mb-sm q-mr-sm" color="primary"
      @click="mostrarDatosActuales = true"><q-tooltip> Datos guardados </q-tooltip>
    </q-btn>

    <!-- Modal -->
    <q-drawer v-model="modalVisible" side="right" :width="750" overlay bordered behavior="desktop"
      v-if="!permisos.soloLectura">
      <q-card class="q-pa-md q-gutter-md">
        <div class="text-h6 q-mb-md text-center">
          {{ editando ? 'Editar marcador' : 'Nuevo marcador' }}
        </div>

        <q-card-section class="scroll">
          <q-form ref="formulario" @submit="guardarMarcador">
            <q-card-section>
              <q-input v-model="nuevoMarcador.nombreApellido" label="Nombre y Apellido" dense outlined class="q-mb-md"
                :rules="[
                  val => !!val || 'El nombre y apellido es obligatorio',
                  val => val.length >= 3 || 'Debe tener al menos 3 caracteres',
                  val => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val) || 'Solo se permiten letras y espacios'
                ]" />

              <q-input v-model="nuevoMarcador.direccion" label="Dirección" dense outlined class="q-mb-md" :rules="[
                val => !!val || 'La dirección es obligatoria',
                val => val.length >= 5 || 'Debe tener al menos 5 caracteres'
              ]" />

              <q-input v-model="nuevoMarcador.telefono" label="Teléfono" type="number" dense outlined class="q-mb-md"
                :min="0"
                @update:model-value="val => { if (val !== null && Number(val) < 0) nuevoMarcador.telefono = 0 }" :rules="[
                  val => !!val || 'El teléfono es obligatorio',
                  val => /^\d{8,12}$/.test(val) || 'Debe tener entre 8 y 12 dígitos'
                ]" />

              <q-input v-model="nuevoMarcador.dni" label="DNI" type="number" dense outlined class="q-mb-md" :min="0"
                @update:model-value="val => { if (val !== null && Number(val) < 0) nuevoMarcador.dni = 0 }" :rules="[
                  val => !!val || 'El DNI es obligatorio',
                  val => /^\d{7,8}$/.test(val) || 'El DNI debe tener 7 u 8 dígitos'
                ]" />

              <!-- Sección de Programas -->
              <div class="q-mb-md">
                <div class="text-subtitle2 q-mb-sm">
                  Programas *
                </div>
                <div v-for="(programa, index) in nuevoMarcador.programas" :key="index"
                  class="row q-gutter-sm items-center q-mb-sm q-pa-sm">

                  <!-- Selector de Tipo -->
                  <q-select v-model="programa.tipo" label="Tipo" :options="tiposPrograma" dense outlined class="col"
                    @update:model-value="resetearAyuda(index)" :rules="[val => !!val || 'Debe seleccionar un tipo']" />

                  <!-- Selector de Ayuda (dependiente del tipo) -->
                  <q-select v-model="programa.ayuda" label="Ayuda" :options="getOpcionesAyuda(programa.tipo)" dense
                    outlined class="col" :disable="!programa.tipo || programa.tipo === 'SUBSIDIOS'"
                    :rules="[val => programa.tipo === 'SUBSIDIOS' || !!val || 'Debe seleccionar una ayuda']" />

                  <q-btn icon="remove_circle" color="negative" flat dense @click="eliminarPrograma(index)">
                    <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 10]">
                      Finalizar programa
                    </q-tooltip>
                  </q-btn>
                </div>
                <q-btn icon="add_circle" label="Agregar programa" color="primary" flat @click="agregarPrograma" />

                <div class="q-mb-md" style="padding-top: 10px; padding-bottom: 10px;">
                  <q-input v-model="nuevoMarcador.notas" label="Notas" type="textarea" dense outlined class="q-mb-md"
                    :rules="[
                      val => !val || val.length <= 500 || 'Las notas no pueden exceder 500 caracteres'
                    ]" />
                </div>
              </div>

              <div class="q-mb-md">
                <div class="text-subtitle2 q-mb-sm" style="padding-top: 10px">
                  Integrantes *
                </div>
                <div v-for="(integrante, index) in nuevoMarcador.integrantes" :key="index"
                  class="row q-col-gutter-sm q-mb-sm">
                  <div class="col-12 col-md-6">
                    <q-input v-model="integrante.nombre" label="Nombre" dense outlined class="q-mb-xs" :rules="[
                      val => !!val || 'El nombre es obligatorio',
                      val => val.length >= 2 || 'Debe tener al menos 2 caracteres',
                      val => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val) || 'Solo se permiten letras y espacios'
                    ]" />
                    <q-input v-model="integrante.apellido" label="Apellido" dense outlined class="q-mb-xs" :rules="[
                      val => !!val || 'El apellido es obligatorio',
                      val => val.length >= 2 || 'Debe tener al menos 2 caracteres',
                      val => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val) || 'Solo se permiten letras y espacios'
                    ]" />
                  </div>
                  <div class="col-12 col-md-6 row items-center">
                    <div class="col">
                      <q-input v-model.number="integrante.edad" label="Edad" type="number" dense outlined
                        class="q-mb-xs" :rules="[
                          val => !!val || 'La edad es obligatoria',
                          val => val >= 0 && val <= 120 || 'La edad debe estar entre 0 y 120 años'
                        ]" />
                      <q-input v-model="integrante.dni" label="DNI" type="number" dense outlined class="q-mb-xs" :rules="[
                        val => !!val || 'El DNI es obligatorio',
                        val => /^\d{7,8}$/.test(val) || 'El DNI debe tener 7 u 8 dígitos'
                      ]" />
                    </div>
                    <q-btn icon="remove_circle" color="negative" flat dense @click="eliminarIntegrante(index)"
                      class="q-ml-sm" />
                  </div>
                </div>
                <q-btn icon="add_circle" label="Agregar integrante" color="primary" flat @click="agregarIntegrante" />
              </div>

              <q-select v-model="nuevoMarcador.icono" label="Ícono del marcador" :options="iconosDisponibles"
                option-value="value" option-label="label" emit-value map-options outlined dense class="q-mb-md"
                :rules="[val => !!val || 'Debe seleccionar un ícono']">
                <!-- Slot para opciones con imágenes -->
                <template v-slot:option="scope">
                  <q-item clickable v-bind="scope.itemProps">
                    <q-item-section avatar>
                      <q-img :src="scope.opt.value" :alt="scope.opt.label" style="width: 32px; height: 32px" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ scope.opt.label }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>

                <!-- Slot para mostrar la imagen seleccionada -->
                <template v-slot:selected-item="scope">
                  <q-chip dense square class="q-ma-none">
                    <q-img :src="scope.opt.value" style="width: 20px; height: 20px" class="q-mr-sm" />
                    {{ scope.opt.label }}
                  </q-chip>
                </template>
              </q-select>
            </q-card-section>
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="cerrarModal" color="negative" :disable="guardando" />
          <q-btn flat :label="editando ? 'Guardar cambios' : 'Guardar'" @click="validarYGuardar" color="positive"
            :loading="guardando" :disable="guardando" />
        </q-card-actions>
      </q-card>
    </q-drawer>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useGisStore, Marcador } from 'src/stores/gisStore';
import 'ol/ol.css';
import { Map, View } from 'ol';
import { Tile as TileLayer } from 'ol/layer';
import { OSM } from 'ol/source';
import { fromLonLat, toLonLat, transformExtent } from 'ol/proj';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Icon } from 'ol/style';
import { Geometry } from 'ol/geom';
import Modify from 'ol/interaction/Modify';
import { jsPDF } from 'jspdf';
import { useQuasar } from 'quasar';

let modifyInteraction: Modify | null = null;
let marcadorTemporal: Feature<Point> | null = null;

const $q = useQuasar();
const gisStore = useGisStore();
const mapContainer = ref<HTMLElement | null>(null);
const modalVisible = ref(false);
const editando = ref(false);
const mostrarReferencias = ref(false);
const mostrarDatosActuales = ref(false);
const searchTerm = ref('');
const guardando = ref(false); // ✅ NUEVO: Variable para el loading

// Ref para el formulario
const formulario = ref();

// Variables para el tooltip
const tooltipVisible = ref(false);
const tooltipContent = ref('');
const tooltipPosition = ref({ x: 0, y: 0 });

const rol = ref(localStorage.getItem('rol') || 'Visor');

const mostrarModalHistorial = ref(false)

const programasActivos = computed(() =>
  gisStore.marcadorSeleccionado?.programas?.filter(p => p.estado === 'activo') || []
)
const programasInactivos = computed(() =>
  gisStore.marcadorSeleccionadoProgramasCompletos?.filter(p => p.estado !== 'activo') || []
);

function colorPorEstado(estado: any) {
  switch (estado) {
    case 'finalizado':
      return 'red';
    case 'cancelado':
      return 'grey';
    default:
      return 'primary';
  }
}

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

const nuevoMarcador = ref({
  nombreApellido: '',
  direccion: '',
  telefono: '',
  dni: '',
  notas: '',
  programas: [] as Array<{
    tipo: string;
    ayuda: string;
  }>,
  integrantes: [] as Array<{
    nombre: string;
    apellido: string;
    edad: number | null;
    dni: string;
  }>,
  latitud: null as number | null,
  longitud: null as number | null,
  icono: '',
});

const iconosDisponibles = [
  { label: 'Ícono 1', value: '/marker-icon.png' },
  { label: 'Ícono 2', value: '/marker-icon-2.png' },
  { label: 'Ícono 3', value: '/marker-icon-3.png' },
];

// Opciones para los selectores de programas
const tiposPrograma = [
  'PROGRAMAS ALIMENTARIOS',
  'CONTRAPRESTACIÓN',
  'SUBSIDIOS' // ✅ CORREGIDO: Cambié de 'SUBSIDIOS' a 'SUBSIDIOS'
];

const opcionesAyuda = {
  'PROGRAMAS ALIMENTARIOS': [
    'AM - Ayuda Mensual',
    'DBT - Diabéticos',
    'ES - Esp. Solidario',
    'AU - Ayuda Urgente',
    'DE - Dietas Especiales'
  ],
  'CONTRAPRESTACIÓN': [
    'Gas',
    'Luz',
    'Banco Materiales'
  ],
  'SUBSIDIOS': [] // ✅ CORREGIDO: Cambié de 'SUBSIDIOS' a 'SUBSIDIOS'
};

let map: Map;
let hoveredFeature: Feature | null = null;
let vectorSource = new VectorSource();

const marcadoresFiltrados = computed(() => {
  const term = searchTerm.value.toLowerCase();
  return gisStore.marcadores
    .filter((m) => {
      return (
        m.nombreApellido.toLowerCase().includes(term) ||
        m.direccion.toLowerCase().includes(term)
      );
    })
    .slice()
    .reverse();
});

onMounted(() => {
  gisStore.cargarMarcadoresDesdeAPI();

  const vectorLayer = new VectorLayer({ source: vectorSource });
  // Definir los límites del área permitida
  const extent = transformExtent(
    [-57.1939, -37.0417, -57.0739, -36.9617], // [minLon, minLat, maxLon, maxLat]
    'EPSG:4326',
    'EPSG:3857'
  );
  map = new Map({
    target: mapContainer.value as HTMLElement,
    layers: [new TileLayer({ source: new OSM() }), vectorLayer],
    view: new View({
      center: fromLonLat([-57.1339, -37.0017]),
      zoom: 15,
      minZoom: 14,        // Zoom mínimo permitido
      maxZoom: 18,        // Zoom máximo permitido
      extent: extent,     // Límites del área visible
      constrainOnlyCenter: false  // Restringe toda la vista, no solo el centro
    }),
    controls: [],
  });

  // Agregar los marcadores cuando estén disponibles
  watch(
    () => gisStore.marcadores,
    (marcadores) => {
      vectorSource.clear();
      marcadores.forEach(agregarMarcadorAlMapa);
    },
    { immediate: true }
  );

  map.on('pointermove', (event) => {
    const pixel = event.pixel;
    let featureFound = false;

    map.forEachFeatureAtPixel(pixel, (feature) => {
      const actualFeature = feature as Feature<Geometry>;

      // Mostrar tooltip con el nombre del marcador
      const nombreApellido = actualFeature.get('nombreApellido');
      if (nombreApellido) {
        tooltipContent.value = nombreApellido;
        tooltipPosition.value = { x: pixel[0] + 10, y: pixel[1] - 10 };
        tooltipVisible.value = true;
      }

      if (hoveredFeature !== actualFeature) {
        if (hoveredFeature) {
          hoveredFeature.setStyle(
            new Style({
              image: new Icon({
                src: hoveredFeature.get('icono'),
                scale: 0.2,
              }),
            })
          );
        }

        hoveredFeature = actualFeature;

        hoveredFeature.setStyle(
          new Style({
            image: new Icon({
              src: hoveredFeature.get('icono'),
              scale: 0.3,
            }),
          })
        );
      }

      featureFound = true;
    });

    if (!featureFound) {
      // Ocultar tooltip cuando no hay marcador
      tooltipVisible.value = false;

      if (hoveredFeature) {
        hoveredFeature.setStyle(
          new Style({
            image: new Icon({
              src: hoveredFeature.get('icono'),
              scale: 0.2,
            }),
          })
        );
        hoveredFeature = null;
      }
    }
  });

  map.on('singleclick', (event) => {
    let marcadorSeleccionado = false;

    map.forEachFeatureAtPixel(event.pixel, (feature) => {
      const id = feature.get('id');
      if (id) {
        gisStore.seleccionarMarcador(id);
        marcadorSeleccionado = true;
      }
    });

    if (!marcadorSeleccionado) {
      const coords = toLonLat(event.coordinate) as [number, number];
      abrirModal(coords);
    }
  });
});

// ====== MÉTODOS DE VALIDACIÓN ======

// ✅ MÉTODO ACTUALIZADO: Validar y guardar con loading
async function validarYGuardar() {
  guardando.value = true; // ✅ NUEVO: Activar loading
  try {
    // Validar el formulario principal
    const esValido = await formulario.value?.validate();

    if (!esValido) {
      $q.notify({
        type: 'negative',
        message: 'Por favor corrige los errores en el formulario',
        position: 'top'
      });
      return;
    }

    // Validaciones adicionales
    if (!validarProgramas()) {
      $q.notify({
        type: 'negative',
        message: 'Debe agregar al menos un programa',
        position: 'top'
      });
      return;
    }

    if (!validarIntegrantes()) {
      $q.notify({
        type: 'negative',
        message: 'Debe agregar al menos un integrante',
        position: 'top'
      });
      return;
    }

    // Si todo está válido, proceder a guardar
    await guardarMarcador();

  } catch (error) {
    console.error('Error en validación:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al validar el formulario',
      position: 'top'
    });
  } finally {
    guardando.value = false; // ✅ NUEVO: Desactivar loading
  }
}

// Validar que haya al menos un programa
function validarProgramas(): boolean {
  return nuevoMarcador.value.programas && nuevoMarcador.value.programas.length > 0;
}

// Validar que haya al menos un integrante
function validarIntegrantes(): boolean {
  return nuevoMarcador.value.integrantes && nuevoMarcador.value.integrantes.length > 0;
}

// ====== MÉTODOS EXISTENTES MODIFICADOS ======

function cerrarModal() {
  modalVisible.value = false;
  desactivarEdicionTemporal();

  // Limpiar validaciones del formulario
  if (formulario.value) {
    formulario.value.resetValidation();
  }

  if (marcadorTemporal) {
    vectorSource.removeFeature(marcadorTemporal);
    marcadorTemporal = null;
  }
}

async function guardarMarcador() {
  const marcador = { ...nuevoMarcador.value };

  if (!marcador.icono) {
    marcador.icono = iconosDisponibles[0].value;
  }

  if (marcadorTemporal) {
    desactivarEdicionTemporal();
    vectorSource.removeFeature(marcadorTemporal);
    marcadorTemporal = null;
  }

  try {
    if (editando.value) {
      await gisStore.editarMarcador(marcador);
      // Para edición, recargamos todos los marcadores
      await gisStore.cargarMarcadoresDesdeAPI();
      $q.notify({
        type: 'positive',
        message: 'Marcador actualizado correctamente',
        position: 'top'
      });
    } else {
      // Para creación, esperamos la respuesta del servidor
      const nuevoMarcadorCreado = await gisStore.agregarMarcador(marcador);

      if (nuevoMarcadorCreado?.id) {
        // Agregamos el marcador al mapa inmediatamente
        agregarMarcadorAlMapa(nuevoMarcadorCreado);

        // También actualizamos la lista local del store si es necesario
        // (esto depende de cómo esté implementado tu store)
        if (!gisStore.marcadores.find(m => m.id === nuevoMarcadorCreado.id)) {
          gisStore.marcadores.push(nuevoMarcadorCreado);
        }

        $q.notify({
          type: 'positive',
          message: 'Marcador creado correctamente',
          position: 'top'
        });
      } else {
        throw new Error('No se recibió el marcador creado del servidor');
      }
    }

    cerrarModal();
  } catch (error) {
    console.error('Error al guardar marcador:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al guardar el marcador',
      position: 'top'
    });
  }
}

function agregarPrograma() {
  if (!nuevoMarcador.value.programas) {
    nuevoMarcador.value.programas = [];
  }
  nuevoMarcador.value.programas.push({
    tipo: '',
    ayuda: '',
  });
}

function eliminarPrograma(index: number) {
  nuevoMarcador.value.programas.splice(index, 1);
}

function agregarIntegrante() {
  if (!nuevoMarcador.value.integrantes) {
    nuevoMarcador.value.integrantes = [];
  }
  nuevoMarcador.value.integrantes.push({
    nombre: '',
    apellido: '',
    edad: null,
    dni: '',
  });
}

function eliminarIntegrante(index: number) {
  nuevoMarcador.value.integrantes.splice(index, 1);
}

// Función para obtener las opciones de ayuda según el tipo
function getOpcionesAyuda(tipo: string) {
  return opcionesAyuda[tipo as keyof typeof opcionesAyuda] || [];
}

// ✅ FUNCIÓN ACTUALIZADA: Resetear ayuda cuando cambia el tipo
function resetearAyuda(index: number) {
  // Si cambias a SUBSIDIOS, limpia la ayuda
  if (nuevoMarcador.value.programas[index].tipo === 'SUBSIDIOS') {
    nuevoMarcador.value.programas[index].ayuda = '';
  } else {
    nuevoMarcador.value.programas[index].ayuda = '';
  }
}

function activarEdicionTemporal() {
  desactivarEdicionTemporal();

  if (marcadorTemporal) {
    modifyInteraction = new Modify({
      source: vectorSource,
      filter: (feature) => feature === marcadorTemporal,
    });

    map.addInteraction(modifyInteraction);

    modifyInteraction.on('modifyend', () => {
      if (marcadorTemporal) {
        const coords = toLonLat(
          (marcadorTemporal.getGeometry() as Point).getCoordinates()
        );
        nuevoMarcador.value.longitud = coords[0];
        nuevoMarcador.value.latitud = coords[1];
      }
    });
  }
}

function desactivarEdicionTemporal() {
  if (modifyInteraction) {
    map.removeInteraction(modifyInteraction);
    modifyInteraction = null;
  }
}

// Función para generar PDF del marcador seleccionado
async function generarPDF() {
  if (!gisStore.marcadorSeleccionado) {
    alert('No hay ningún marcador seleccionado');
    return;
  }

  try {
    // Importar jsPDF dinámicamente
    const marcador = gisStore.marcadorSeleccionado;
    const doc = new jsPDF();

    // Configuración inicial
    let yPos = 20;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Función helper para añadir texto con wrap
    function addTextWithWrap(text, x, y, maxWidth, fontSize = 12) {
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + (lines.length * (fontSize * 0.4));
    }

    // Función helper para dibujar rectángulo con color
    function drawColoredRect(x, y, width, height, color) {
      doc.setFillColor(color);
      doc.rect(x, y, width, height, 'F');
    }

    // ENCABEZADO
    drawColoredRect(margin, yPos - 5, contentWidth, 25, '#1976d2');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('INFORMACIÓN DEL MARCADOR', margin + 5, yPos + 8);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, pageWidth - 60, yPos + 8);

    yPos += 35;

    // INFORMACIÓN PRINCIPAL
    doc.setTextColor(0, 0, 0);
    drawColoredRect(margin, yPos - 3, contentWidth, 2, '#e3f2fd');

    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('DATOS PERSONALES', margin, yPos + 8);
    yPos += 20;

    // Nombre y Apellido
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Nombre:', margin, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(marcador.nombreApellido, margin + 25, yPos);
    yPos += 10;

    // Dirección
    doc.setFont(undefined, 'bold');
    doc.text('Dirección:', margin, yPos);
    doc.setFont(undefined, 'normal');
    yPos = addTextWithWrap(marcador.direccion, margin + 25, yPos, contentWidth - 25);
    yPos += 5;

    // Teléfono
    doc.setFont(undefined, 'bold');
    doc.text('Teléfono:', margin, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(marcador.telefono || 'N/A', margin + 25, yPos);
    yPos += 10;

    // DNI
    doc.setFont(undefined, 'bold');
    doc.text('DNI:', margin, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(marcador.dni.toString(), margin + 25, yPos);
    yPos += 20;

    // INTEGRANTES
    if (marcador.integrantes && marcador.integrantes.length > 0) {
      // Verificar si necesitamos nueva página
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      drawColoredRect(margin, yPos - 3, contentWidth, 2, '#e3f2fd');
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('INTEGRANTES', margin, yPos + 8);
      yPos += 20;

      marcador.integrantes.forEach((integrante, index) => {
        // Verificar si necesitamos nueva página
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }

        // Fondo alternado para cada integrante
        if (index % 2 === 0) {
          drawColoredRect(margin, yPos - 3, contentWidth, 15, '#f8f9fa');
        }

        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`${index + 1}. ${integrante.nombre} ${integrante.apellido}`, margin + 2, yPos + 5);

        doc.setFont(undefined, 'normal');
        doc.text(`Edad: ${integrante.edad || 'N/A'}`, margin + 2, yPos + 12);
        doc.text(`DNI: ${integrante.dni}`, margin + 50, yPos + 12);

        yPos += 20;
      });
    } else {
      drawColoredRect(margin, yPos - 3, contentWidth, 2, '#e3f2fd');
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('INTEGRANTES', margin, yPos + 8);
      yPos += 20;

      doc.setFontSize(12);
      doc.setFont(undefined, 'italic');
      doc.setTextColor(128, 128, 128);
      doc.text('No hay integrantes registrados', margin, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 20;
    }

    // PROGRAMAS
    if (yPos > 230) {
      doc.addPage();
      yPos = 20;
    }

    drawColoredRect(margin, yPos - 3, contentWidth, 2, '#e3f2fd');
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('PROGRAMAS', margin, yPos + 8);
    yPos += 20;

    if (marcador.programas && marcador.programas.length > 0) {
      marcador.programas.forEach((programa, index) => {
        // Verificar si necesitamos nueva página
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }

        // Fondo para cada programa
        drawColoredRect(margin, yPos - 3, contentWidth, 12, '#e8f4fd');

        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`${index + 1}. ${programa.tipo}`, margin + 2, yPos + 5);

        doc.setFont(undefined, 'normal');
        doc.text(`Ayuda: ${programa.ayuda}`, margin + 5, yPos + 10);

        yPos += 18;
      });
    } else {
      doc.setFontSize(12);
      doc.setFont(undefined, 'italic');
      doc.setTextColor(128, 128, 128);
      doc.text('No hay programas asignados', margin, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 20;
    }

    // NOTAS
    if (marcador.notas) {
      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      }

      drawColoredRect(margin, yPos - 3, contentWidth, 2, '#e3f2fd');
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('NOTAS', margin, yPos + 8);
      yPos += 20;

      // Fondo para las notas
      const notasLines = doc.splitTextToSize(marcador.notas, contentWidth - 10);
      const notasHeight = notasLines.length * 5 + 10;
      drawColoredRect(margin, yPos - 5, contentWidth, notasHeight, '#f8f9fa');

      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      yPos = addTextWithWrap(marcador.notas, margin + 5, yPos, contentWidth - 10);
    }

    // FOOTER
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Página ${i} de ${pageCount}`, pageWidth - 30, doc.internal.pageSize.height - 10);
      doc.text(`Sistema GIS - ${new Date().toLocaleDateString('es-ES')}`, margin, doc.internal.pageSize.height - 10);
    }

    // Guardar el PDF
    // const fileName = `marcador_${marcador.nombreApellido.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
    // doc.save(fileName);
    // Abrir en nueva ventana y disparar impresión
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

    // console.log(`PDF generado exitosamente: ${fileName}`);

  } catch (error) {
    console.error('Error al generar el PDF:', error);
    alert('Error al generar el PDF. Verifique la conexión a internet y que jsPDF esté disponible.');
  }
}

function abrirModal(coords: [number, number]) {
  const [lon, lat] = coords;

  nuevoMarcador.value = {
    nombreApellido: '',
    direccion: '',
    telefono: '',
    dni: '',
    notas: '',
    programas: [],
    integrantes: [],
    latitud: lat,
    longitud: lon,
    icono: iconosDisponibles[0].value,
  };

  if (marcadorTemporal) {
    vectorSource.removeFeature(marcadorTemporal);
  }

  const iconoEdicion = '/marker-icon-7.png';

  marcadorTemporal = new Feature({
    geometry: new Point(fromLonLat([lon, lat])),
  });

  marcadorTemporal.set('icono', iconoEdicion);

  marcadorTemporal.setStyle(
    new Style({
      image: new Icon({
        src: iconoEdicion,
        scale: 0.25,
      }),
    })
  );

  vectorSource.addFeature(marcadorTemporal);

  activarEdicionTemporal();
  modalVisible.value = true;
  editando.value = false;
}

function agregarMarcadorAlMapa(marcador: Marcador) {
  const feature = new Feature({
    geometry: new Point(fromLonLat([marcador.longitud, marcador.latitud])),
    id: marcador.id,
  });

  // Agregar el nombreApellido al feature para el tooltip
  feature.set('nombreApellido', marcador.nombreApellido);
  feature.set('icono', marcador.icono);

  const icon = new Icon({
    src: marcador.icono,
    scale: 0.2,
  });

  feature.setStyle(new Style({ image: icon }));
  vectorSource.addFeature(feature);
}

function recargarMarcadores() {
  vectorSource.clear();
  gisStore.marcadores.forEach(agregarMarcadorAlMapa);
}

function editarMarcadorSeleccionado() {
  if (!gisStore.marcadorSeleccionado) return;

  // Hacemos una copia profunda para mantener todos los campos
  nuevoMarcador.value = JSON.parse(JSON.stringify(gisStore.marcadorSeleccionado));

  editando.value = true;
  modalVisible.value = true;
}

function eliminarMarcadorSeleccionado() {
  if (!gisStore.marcadorSeleccionado) return;

  // Usar el diálogo de confirmación de Quasar
  $q.dialog({
    title: 'Confirmar eliminación',
    message: '¿Está seguro que desea eliminar este marcador?',
    cancel: true,
    persistent: true,
    ok: {
      color: 'negative',
      label: 'Eliminar'
    },
    cancel: {
      color: 'primary',
      label: 'Cancelar'
    }
  }).onOk(() => {
    // Si confirma, procedemos con la eliminación
    const id = gisStore.marcadorSeleccionado.id;
    gisStore.eliminarMarcador(id);

    vectorSource.getFeatures().forEach((feature) => {
      if (feature.get('id') === id) {
        vectorSource.removeFeature(feature);
      }
    });

    gisStore.cerrarInfo();

    // Mostrar notificación de éxito
    $q.notify({
      type: 'positive',
      message: 'Marcador eliminado correctamente',
      position: 'top'
    });
  });
}

function verInfoMarcador(marcador: Marcador) {
  gisStore.seleccionarMarcador(marcador.id);

  const coordenadas = fromLonLat([marcador.longitud, marcador.latitud]);
  map.getView().animate({
    center: coordenadas,
    duration: 500,
    zoom: 17,
  });
}

</script>
<style scoped>
.header-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

.bg-white-transparent {
  background-color: rgba(255, 255, 255, 0.2) !important;
}

.info-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.integrante-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
  background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
}

.integrante-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.programa-card {
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  background: linear-gradient(145deg, #f8f9ff 0%, #ffffff 100%);
  transition: all 0.3s ease;
}

.programa-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-title {
  display: flex;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f0f0;
}

.action-btn {
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: scale(1.1);
}

.info-panel {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .info-panel {
    min-width: 100% !important;
    margin: 0 !important;
  }

  .header-gradient .absolute-top-right {
    position: relative !important;
    text-align: right;
    padding: 0 !important;
  }
}


.tooltip-marcador {
  position: absolute;
  background: linear-gradient(135deg, #667eea 0%, rgb(0, 0, 0) 100%);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  pointer-events: none;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  animation: tooltipFadeIn 0.2s ease-out;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.mapa {
  width: 100%;
  height: 100vh;
  position: relative;
}

.no-scroll {
  overflow: hidden;
}

/* Paneles */
.info-panel,
.referencias-panel,
.datos-actuales-panel {
  position: absolute;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
  z-index: 10;
}

.info-panel {
  top: 1rem;
  left: 1rem;
  width: 350px;
}

.referencias-panel {
  top: 1rem;
  right: 1rem;
  width: 300px;
  max-height: 20vh;
}

.datos-actuales-panel {
  position: absolute;
  right: 1rem;
  top: calc(1rem + 20vh + 0.5rem);
  /* fija desde arriba */
  max-height: calc(100vh - (1rem + 13vh + 8rem));
  bottom: 1rem;
  /* se adapta hasta el borde inferior */
  width: 300px;
  z-index: 9;
  overflow-y: auto;
  /* scroll solo si el contenido es mayor */
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE y Edge */
}

.datos-actuales-panel::-webkit-scrollbar {
  display: none;
  /* Chrome, Safari y Opera */
}

@media (max-width: 768px) {

  .info-panel,
  .referencias-panel,
  .datos-actuales-panel {
    width: 90vw;
    left: 50%;
    transform: translateX(-50%);
    right: auto;
  }

  .referencias-panel {
    top: 1rem;
    max-height: 35vh;
  }

  .info-panel {
    top: calc(1rem + 36vh + 1rem);
  }
}
</style>
