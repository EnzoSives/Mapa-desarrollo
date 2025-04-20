<template>
  <q-page class="full-height no-scroll">
    <div ref="mapContainer" class="mapa"></div>

    <!-- Panel Info del marcador (izquierda arriba) -->
    <q-card v-if="gisStore.marcadorSeleccionado" class="info-panel">
      <q-card-section>
        <div class="text-h6">Información del marcador</div>
      </q-card-section>
      <q-card-section>
        <p>
          <strong>Nombre:</strong> {{ gisStore.marcadorSeleccionado.nombre }}
        </p>
        <p>
          <strong>Descripción:</strong>
          {{ gisStore.marcadorSeleccionado.descripcion }}
        </p>
        <p>
          <strong>Latitud:</strong> {{ gisStore.marcadorSeleccionado.latitud }}
        </p>
        <p>
          <strong>Longitud:</strong>
          {{ gisStore.marcadorSeleccionado.longitud }}
        </p>
      </q-card-section>
      <q-card-actions>
        <q-btn
          flat
          label="Cerrar"
          @click="gisStore.cerrarInfo"
          color="primary"
        />
        <q-btn
          flat
          label="Editar"
          @click="editarMarcadorSeleccionado"
          color="warning"
        />
        <q-btn
          flat
          label="Eliminar"
          @click="eliminarMarcadorSeleccionado"
          color="negative"
        />
      </q-card-actions>
    </q-card>

    <!-- Panel de Referencias (derecha arriba) -->
    <q-card class="referencias-panel">
      <q-card-section>
        <div class="text-subtitle1">Referencias</div>
        <div class="row q-mt-sm">
          <div
            v-for="icono in iconosDisponibles"
            :key="icono.value"
            class="column items-center q-mr-md"
          >
            <img :src="icono.value" width="24" height="24" />
            <div class="text-caption">{{ icono.label }}</div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Panel Datos Actuales (derecha abajo) -->
    <q-card class="datos-actuales-panel">
      <q-card-section>
        <div class="text-subtitle1">Datos cargados</div>
        <div class="scroll-contenido">
          <div
            v-for="(marcador, index) in gisStore.marcadores.slice().reverse()"
            :key="marcador.id"
            class="q-mb-sm"
          >
            <div>
              <strong>{{ index + 1 }}.</strong> {{ marcador.nombre }}
            </div>
            <div class="text-caption ellipsis">{{ marcador.descripcion }}</div>
            <q-separator spaced />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Modal -->
    <q-dialog v-model="modalVisible" persistent>
      <q-card class="q-pa-md q-gutter-md q-mx-auto" style="width: 400px">
        <q-card-section class="text-center">
          <div class="text-h6 q-mb-md">
            {{ editando ? 'Editar marcador' : 'Nuevo marcador' }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="nuevoMarcador.nombre"
            label="Nombre"
            dense
            outlined
            class="q-mb-md"
          />
          <q-input
            v-model="nuevoMarcador.descripcion"
            label="Descripción"
            type="textarea"
            dense
            outlined
            class="q-mb-md"
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
          <q-btn
            flat
            :label="editando ? 'Guardar cambios' : 'Guardar'"
            @click="guardarMarcador"
            color="positive"
          />
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

const gisStore = useGisStore();
const mapContainer = ref<HTMLElement | null>(null);
const modalVisible = ref(false);
const editando = ref(false);

const nuevoMarcador = ref<Marcador>({
  id: 0,
  nombre: '',
  descripcion: '',
  latitud: 0,
  longitud: 0,
  icono: '',
});

const iconosDisponibles = [
  { label: 'Ícono 1', value: '/marker-icon.png' },
  { label: 'Ícono 2', value: '/marker-icon-2.png' },
  { label: 'Ícono 3', value: '/marker-icon-3.png' },
];

let map: Map;
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
      const coords = toLonLat(event.coordinate);
      abrirModal(coords);
    }
  });
});

function abrirModal(coords: [number, number]) {
  nuevoMarcador.value = {
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

function guardarMarcador() {
  const marcador = { ...nuevoMarcador.value };

  if (!marcador.icono) {
    marcador.icono = iconosDisponibles[0].value;
  }

  if (editando.value) {
    gisStore.editarMarcador(marcador);
    recargarMarcadores();
  } else {
    gisStore.agregarMarcador(marcador);
    agregarMarcadorAlMapa(marcador);
  }

  cerrarModal();
}

function agregarMarcadorAlMapa(marcador: Marcador) {
  const feature = new Feature({
    geometry: new Point(fromLonLat([marcador.longitud, marcador.latitud])),
    id: marcador.id,
  });

  feature.setStyle(
    new Style({
      image: new Icon({
        src: marcador.icono,
        scale: 0.2,
      }),
    })
  );

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
</script>

<style scoped>
.mapa {
  width: 100%;
  height: 100%;
  position: absolute;
}

.info-panel {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
  width: 300px;
}

.referencias-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
  width: 300px;
}

.datos-actuales-panel {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 10;
  width: 300px;
  height: 450px;
  overflow: hidden;
}

.scroll-contenido {
  overflow-y: auto;
  max-height: 420px;
}
</style>
