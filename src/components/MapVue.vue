<template>
  <q-page class="full-height no-scroll">
    <div ref="mapContainer" class="mapa"></div>

    <!-- Panel Info del marcador (izquierda arriba) -->
   <q-card v-if="gisStore.marcadorSeleccionado" class="info-panel">
  <q-card-section>
    <div class="text-h6">Información del marcador</div>
  </q-card-section>

  <q-card-section>
    <p><strong>Nombre:</strong> {{ gisStore.marcadorSeleccionado.nombreApellido }}</p>
    <p><strong>Dirección:</strong> {{ gisStore.marcadorSeleccionado.direccion }}</p>
    <p><strong>Teléfono:</strong> {{ gisStore.marcadorSeleccionado.telefono }}</p>
    <p><strong>DNI:</strong> {{ gisStore.marcadorSeleccionado.dni }}</p>
    <p><strong>Notas:</strong> {{ gisStore.marcadorSeleccionado.notas || 'N/A' }}</p>

    <p><strong>Ayudas:</strong>
      <span v-if="gisStore.marcadorSeleccionado.ayudas && gisStore.marcadorSeleccionado.ayudas.length > 0">
        {{ gisStore.marcadorSeleccionado.ayudas.join(', ') }}
      </span>
      <span v-else>Ninguna</span>
    </p>

    <!-- <p><strong>Latitud:</strong> {{ gisStore.marcadorSeleccionado.latitud }}</p>
    <p><strong>Longitud:</strong> {{ gisStore.marcadorSeleccionado.longitud }}</p>
    <p><strong>Ícono:</strong> {{ gisStore.marcadorSeleccionado.icono }}</p> -->

    <div>
      <strong>Integrantes:</strong>
      <div v-if="gisStore.marcadorSeleccionado.integrantes && gisStore.marcadorSeleccionado.integrantes.length > 0">
        <ul>
          <li v-for="(integrante, index) in gisStore.marcadorSeleccionado.integrantes" :key="index">
            {{ integrante.nombre }} {{ integrante.apellido }}, Edad: {{ integrante.edad }}, DNI: {{ integrante.dni }}
          </li>
        </ul>
      </div>
      <div v-else>
        No hay integrantes.
      </div>
    </div>
  </q-card-section>

  <q-card-actions>
    <q-btn flat label="Cerrar" @click="gisStore.cerrarInfo" color="primary" />
    <q-btn flat label="Editar" @click="editarMarcadorSeleccionado" color="warning" />
    <q-btn flat label="Eliminar" @click="eliminarMarcadorSeleccionado" color="negative" />
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

    <!-- Panel Datos Actuales (derecha abajo) -->
    <q-card v-if="mostrarDatosActuales" class="datos-actuales-panel">
      <q-card-section>
        <div class="row justify-between items-center">
          <div class="text-subtitle1">Datos cargados</div>
          <q-btn dense flat icon="chevron_right" @click="mostrarDatosActuales = false" />
        </div>
        <div class="scroll-contenido">
          <div v-for="(marcador, index) in gisStore.marcadores.slice().reverse()" :key="marcador.id"
            class="q-mb-sm cursor-pointer" @click="verInfoMarcador(marcador)">
            <div>
              <strong>{{ index + 1 }}.</strong> {{ marcador.nombre }}
            </div>
            <div class="text-caption ellipsis">{{ marcador.descripcion }}</div>
            <q-separator spaced />
          </div>
        </div>
      </q-card-section>
    </q-card>


    <q-btn v-if="!mostrarDatosActuales" icon="view_list" class="fixed-bottom-right q-mb-sm q-mr-sm" color="primary"
      @click="mostrarDatosActuales = true"><q-tooltip> Datos guardados </q-tooltip>
    </q-btn>

    <!-- Modal -->
  <q-dialog v-model="modalVisible" persistent>
  <q-card class="q-pa-md q-gutter-md q-mx-auto" style="width: 500px; max-height: 90vh; overflow-y: auto;">
    <q-card-section class="text-center">
      <div class="text-h6 q-mb-md">
        {{ editando ? 'Editar marcador' : 'Nuevo marcador' }}
      </div>
    </q-card-section>

    <q-card-section>
      <q-input v-model="nuevoMarcador.nombreApellido" label="Nombre y Apellido" dense outlined class="q-mb-md" />
      <q-input v-model="nuevoMarcador.direccion" label="Dirección" dense outlined class="q-mb-md" />
      <q-input v-model="nuevoMarcador.telefono" label="Teléfono" dense outlined class="q-mb-md" />
      <q-input v-model="nuevoMarcador.dni" label="DNI" dense outlined class="q-mb-md" />
      <q-input v-model="nuevoMarcador.notas" label="Notas" type="textarea" dense outlined class="q-mb-md" />

      <q-input
        v-model="ayudasTexto"
        label="Ayudas (separadas por comas)"
        dense
        outlined
        class="q-mb-md"
        @blur="actualizarAyudas"
      />

      <div class="q-mb-md">
        <div class="text-subtitle2 q-mb-sm">Integrantes</div>
        <div v-for="(integrante, index) in nuevoMarcador.integrantes" :key="index" class="row q-gutter-sm items-center q-mb-sm">
          <q-input v-model="integrante.nombre" label="Nombre" dense outlined class="col" />
          <q-input v-model="integrante.apellido" label="Apellido" dense outlined class="col" />
          <q-input v-model.number="integrante.edad" label="Edad" type="number" dense outlined class="col" />
          <q-input v-model="integrante.dni" label="DNI" dense outlined class="col" />
          <q-btn icon="remove_circle" color="negative" flat dense @click="eliminarIntegrante(index)" />
        </div>
        <q-btn icon="add_circle" label="Agregar integrante" color="primary" flat @click="agregarIntegrante" />
      </div>

      <q-input
        v-model.number="nuevoMarcador.latitud"
        label="Latitud"
        dense
        outlined
        class="q-mb-md"
        type="number"
      />
      <q-input
        v-model.number="nuevoMarcador.longitud"
        label="Longitud"
        dense
        outlined
        class="q-mb-md"
        type="number"
      />

      <q-select
        v-model="nuevoMarcador.icono"
        label="Ícono del marcador"
        :options="iconosDisponibles"
        option-value="value"
        option-label="label"
        emit-value
        map-options
        type="radio"
        inline
        outlined
        dense
        class="q-mb-md"
      />
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat label="Cancelar" @click="cerrarModal" color="negative" />
      <q-btn flat :label="editando ? 'Guardar cambios' : 'Guardar'" @click="guardarMarcador" color="positive" />
    </q-card-actions>
  </q-card>
</q-dialog>


  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
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

const gisStore = useGisStore();
const mapContainer = ref<HTMLElement | null>(null);
const modalVisible = ref(false);
const editando = ref(false);
const mostrarReferencias = ref(false);
const mostrarDatosActuales = ref(false);

const nuevoMarcador = ref({
  nombreApellido: '',
  direccion: '',
  telefono: '',
  dni: '',
  notas: '',
  ayudas: [] as string[],
  integrantes: [] as Array<{ nombre: string; apellido: string; edad: number | null; dni: string }>,
  latitud: null as number | null,
  longitud: null as number | null,
  icono: '',
});

const iconosDisponibles = [
  { label: 'Ícono 1', value: '/marker-icon.png' },
  { label: 'Ícono 2', value: '/marker-icon-2.png' },
  { label: 'Ícono 3', value: '/marker-icon-3.png' },
];

let map: Map;
let hoveredFeature: Feature | null = null;
let vectorSource = new VectorSource();

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
      const actualFeature = feature as Feature<Geometry>; // Aseguramos el tipo
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

    if (!featureFound && hoveredFeature) {
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

function abrirModal(coords: [number, number]) {
  nuevoMarcador.value = {
    id: 0, // Agregar un valor predeterminado para id
    nombre: '',
    descripcion: '',
    latitud: coords[1],
    longitud: coords[0],
    icono: '',
  };
  editando.value = false;
  modalVisible.value = true;
}

function cerrarModal() {
  modalVisible.value = false;
}

async function guardarMarcador() {
  const marcador = { ...nuevoMarcador.value };

  if (!marcador.icono) {
    marcador.icono = iconosDisponibles[0].value;
  }

  if (editando.value) {
    await gisStore.editarMarcador(marcador);
    recargarMarcadores(); // puede quedarse como está
  } else {
    const nuevo = await gisStore.agregarMarcador(marcador);
    if (nuevo?.id) {
      agregarMarcadorAlMapa(nuevo); // Usamos el que viene del backend
    }
  }

  cerrarModal();
}

function agregarMarcadorAlMapa(marcador: Marcador) {
  const feature = new Feature({
    geometry: new Point(fromLonLat([marcador.longitud, marcador.latitud])),
    id: marcador.id,
  });
  console.log('Marcador agregado:', marcador);

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

  // Centrar el mapa en el marcador seleccionado
  const coordenadas = fromLonLat([marcador.longitud, marcador.latitud]);
  map.getView().animate({
    center: coordenadas,
    duration: 500, // animación suave en milisegundos
    zoom: 17       // puedes ajustar el nivel de zoom si lo deseas
  });
}
// Variables auxiliares para manejar los inputs de texto separados por comas
const ayudasTexto = ref('');
const integrantesTexto = ref('');

// Al cargar un marcador para editar, debes sincronizar estas variables:
function cargarMarcador(marcador) {
  Object.assign(nuevoMarcador.value, marcador);
  ayudasTexto.value = marcador.ayudas?.join(', ') || '';
  if (!nuevoMarcador.value.integrantes) {
    nuevoMarcador.value.integrantes = [];
  }
}


// Funciones para actualizar los arrays a partir del texto
function actualizarAyudas() {
  nuevoMarcador.value.ayudas = ayudasTexto.value
    .split(',')
    .map((a) => a.trim())
    .filter((a) => a.length > 0);
}

function actualizarIntegrantes() {
  nuevoMarcador.value.integrantes = integrantesTexto.value
    .split(',')
    .map((i) => i.trim())
    .filter((i) => i.length > 0);
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

</script>

<style scoped>
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
  background: white;
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
  width: 280px;
  max-height: 40vh;
  overflow-y: auto;
}

.datos-actuales-panel {
  position: absolute;
  right: 1rem;
  top: calc(1rem + 20vh + 0.5rem);
  /* fija desde arriba */
  max-height: calc(100vh - (1rem + 13vh + 8rem));
  bottom: 1rem;
  /* se adapta hasta el borde inferior */
  width: 280px;
  z-index: 9;
  overflow-y: auto;
  /* scroll solo si el contenido es mayor */
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
