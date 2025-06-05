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
    <q-card v-if="gisStore.marcadorSeleccionado" class="info-panel q-mx-auto"
      style="min-width: 400px; max-width: 700px">
      <!-- Encabezado -->
      <q-card-section class="bg-primary text-white row items-center q-pa-sm">
        <q-avatar v-if="gisStore.marcadorSeleccionado.icono" size="48px" class="q-mr-md">
          <img :src="gisStore.marcadorSeleccionado.icono" alt="Ícono" />
        </q-avatar>
        <div>
          <div class="text-h6">{{ gisStore.marcadorSeleccionado.nombreApellido }}</div>
          <div class="text-caption">{{ gisStore.marcadorSeleccionado.direccion }}</div>
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
                <q-item-label><strong>Teléfono:</strong> {{ gisStore.marcadorSeleccionado.telefono || 'N/A'
                }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item dense>
              <q-item-section avatar>
                <q-icon name="badge" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label><strong>DNI:</strong> {{ gisStore.marcadorSeleccionado.dni }}</q-item-label>
              </q-item-section>
            </q-item>

          </div>
        </div>

        <!-- Integrantes -->
        <div>
          <strong>Integrantes:</strong>
          <div v-if="gisStore.marcadorSeleccionado.integrantes?.length" class="q-mt-sm">
            <q-list dense bordered>
              <q-item v-for="(integrante, index) in gisStore.marcadorSeleccionado.integrantes" :key="index">
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
            <div v-if="gisStore.marcadorSeleccionado.programas?.length" class="q-mt-xs">
              <q-chip v-for="(programa, index) in gisStore.marcadorSeleccionado.programas" :key="index" dense
                color="primary" text-color="white" size="sm" class="q-mr-xs q-mb-xs">
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
          <q-item-label><strong>Notas:</strong> {{ gisStore.marcadorSeleccionado.notas || 'N/A' }}</q-item-label>
        </q-item-section>
      </q-item>

      <!-- Acciones -->
      <q-card-actions align="right">
        <q-btn flat label="Cerrar" @click="gisStore.cerrarInfo" color="primary" />
        <q-btn flat label="Editar" @click="editarMarcadorSeleccionado" color="warning" v-if="permisos.puedeEditar" />
        <q-btn flat label="Eliminar" @click="eliminarMarcadorSeleccionado" color="negative"
          v-if="permisos.puedeEliminar" />
      </q-card-actions>
    </q-card>


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
    <q-drawer v-model="modalVisible" side="right" :width="450" overlay bordered behavior="desktop"
      v-if="!permisos.soloLectura">
      <q-card class="q-pa-md q-gutter-md">
        <div class="text-h6 q-mb-md text-center">
          {{ editando ? 'Editar marcador' : 'Nuevo marcador' }}
        </div>

        <q-card-section class="scroll">
          <q-card-section>
            <q-input v-model="nuevoMarcador.nombreApellido" label="Nombre y Apellido" dense outlined class="q-mb-md" />
            <q-input v-model="nuevoMarcador.direccion" label="Dirección" dense outlined class="q-mb-md" />
            <q-input v-model="nuevoMarcador.telefono" label="Teléfono" type="number" dense outlined class="q-mb-md"
              :min="0"
              @update:model-value="val => { if (val !== null && Number(val) < 0) nuevoMarcador.telefono = 0 }" />
            <q-input v-model="nuevoMarcador.dni" label="DNI" type="number" dense outlined class="q-mb-md" :min="0"
              @update:model-value="val => { if (val !== null && Number(val) < 0) nuevoMarcador.dni = 0 }" />


            <!-- Sección de Programas -->
            <div class="q-mb-md">
              <div class="text-subtitle2 q-mb-sm">
                Programas
              </div>
              <div v-for="(programa, index) in nuevoMarcador.programas" :key="index"
                class="row q-gutter-sm items-center q-mb-sm q-pa-sm">

                <!-- Selector de Tipo -->
                <q-select v-model="programa.tipo" label="Tipo" :options="tiposPrograma" dense outlined class="col"
                  @update:model-value="resetearAyuda(index)" />

                <!-- Selector de Ayuda (dependiente del tipo) -->
                <q-select v-model="programa.ayuda" label="Ayuda" :options="getOpcionesAyuda(programa.tipo)" dense
                  outlined class="col" :disable="!programa.tipo" />

                <q-btn icon="remove_circle" color="negative" flat dense @click="eliminarPrograma(index)" />
              </div>
              <q-btn icon="add_circle" label="Agregar programa" color="primary" flat @click="agregarPrograma" />
              <div class="q-mb-md" style="padding-top: 10px; padding-bottom: 10px;">
                <q-input v-model="nuevoMarcador.notas" label="Notas" type="textarea" dense outlined class="q-mb-md" />
              </div>
            </div>


            <div class="q-mb-md">
              <div class="text-subtitle2 q-mb-sm" style="padding-top: 10px">
                Integrantes
              </div>
              <div v-for="(integrante, index) in nuevoMarcador.integrantes" :key="index"
                class="row q-col-gutter-sm q-mb-sm">
                <div class="col-12 col-md-6">
                  <q-input v-model="integrante.nombre" label="Nombre" dense outlined class="q-mb-xs" />
                  <q-input v-model="integrante.apellido" label="Apellido" dense outlined class="q-mb-xs" />
                </div>
                <div class="col-12 col-md-6 row items-center">
                  <div class="col">
                    <q-input v-model.number="integrante.edad" label="Edad" type="number" dense outlined
                      class="q-mb-xs" />
                    <q-input v-model="integrante.dni" label="DNI" type="number" dense outlined class="q-mb-xs" />
                  </div>
                  <q-btn icon="remove_circle" color="negative" flat dense @click="eliminarIntegrante(index)"
                    class="q-ml-sm" />
                </div>
              </div>
              <q-btn icon="add_circle" label="Agregar integrante" color="primary" flat @click="agregarIntegrante" />
            </div>
            <q-select v-model="nuevoMarcador.icono" label="Ícono del marcador" :options="iconosDisponibles"
              option-value="value" option-label="label" emit-value map-options outlined dense class="q-mb-md">
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
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="cerrarModal" color="negative" />
          <q-btn flat :label="editando ? 'Guardar cambios' : 'Guardar'" @click="guardarMarcador" color="positive" />
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
import { fromLonLat, toLonLat } from 'ol/proj';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Icon } from 'ol/style';
import { Geometry } from 'ol/geom';
import Modify from 'ol/interaction/Modify';

let modifyInteraction: Modify | null = null;
let marcadorTemporal: Feature<Point> | null = null;

const gisStore = useGisStore();
const mapContainer = ref<HTMLElement | null>(null);
const modalVisible = ref(false);
const editando = ref(false);
const mostrarReferencias = ref(false);
const mostrarDatosActuales = ref(false);
const searchTerm = ref('');

// Variables para el tooltip
const tooltipVisible = ref(false);
const tooltipContent = ref('');
const tooltipPosition = ref({ x: 0, y: 0 });

const rol = ref(localStorage.getItem('rol') || 'Visor');

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
  'SUBSIDIOS'
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
  'SUBSIDIOS': []
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
  map = new Map({
    target: mapContainer.value as HTMLElement,
    layers: [new TileLayer({ source: new OSM() }), vectorLayer],
    view: new View({
      center: fromLonLat([-57.1339, -37.0017]),
      zoom: 15,
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

function cerrarModal() {
  modalVisible.value = false;
  desactivarEdicionTemporal();
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

  if (editando.value) {
    await gisStore.editarMarcador(marcador);
    recargarMarcadores();
  } else {
    const nuevo = await gisStore.agregarMarcador(marcador);
    if (nuevo?.id) {
      agregarMarcadorAlMapa(nuevo);
    }
  }

  cerrarModal();
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
  nuevoMarcador.value = { ...gisStore.marcadorSeleccionado };
  editando.value = true;
  modalVisible.value = true;
}

function eliminarMarcadorSeleccionado() {
  if (!gisStore.marcadorSeleccionado) return;

  const id = gisStore.marcadorSeleccionado.id;
  gisStore.eliminarMarcador(id);

  vectorSource.getFeatures().forEach((feature) => {
    if (feature.get('id') === id) {
      vectorSource.removeFeature(feature);
    }
  });

  gisStore.cerrarInfo();
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

// Función para resetear la ayuda cuando cambia el tipo
function resetearAyuda(index: number) {
  nuevoMarcador.value.programas[index].ayuda = '';
}
</script>
<style scoped>
.tooltip-marcador {
  position: absolute;
  background: linear-gradient(135deg, #667eea 0%, rgb(230, 20, 20) 100%);
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
