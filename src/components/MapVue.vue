<template>
  <q-page class="full-height">
    <div ref="mapContainer" class="mapa"></div>

    <!-- Panel de información del marcador -->
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
      </q-card-actions>
    </q-card>

    <q-card class="reference-card">
      <q-card-section>
        <div class="text-h6">Referencias</div>
      </q-card-section>
      <q-card-section>
        <p class="reference-item">
          <q-img src="public/marker-icon.png" class="reference-img"></q-img>
          Icono 1
        </p>
        <p class="reference-item">
          <q-img src="public/marker-icon-2.png" class="reference-img"></q-img>
          Icono 2
        </p>
        <p class="reference-item">
          <q-img src="public/marker-icon-3.png" class="reference-img"></q-img>
          Icono 3
        </p>
      </q-card-section>
    </q-card>

    <q-dialog v-model="modalVisible" persistent>
      <q-card class="q-pa-md q-gutter-md q-mx-auto" style="width: 400px">
        <!-- Título del modal -->
        <q-card-section class="text-center">
          <div class="text-h6 q-mb-md">Nuevo marcador</div>
        </q-card-section>

        <!-- Sección de entrada de datos -->
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
          <!-- Selector de íconos -->
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

        <!-- Acciones del modal -->
        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancelar"
            @click="cerrarModal"
            color="negative"
            class="q-mr-sm"
            rounded
          />
          <q-btn
            flat
            label="Guardar"
            @click="guardarMarcador"
            color="positive"
            rounded
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useGisStore } from 'src/stores/gisStore';
import 'ol/ol.css';
import { Map, View } from 'ol';
import { Tile as TileLayer } from 'ol/layer';
import { OSM } from 'ol/source';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Icon, Fill, Stroke } from 'ol/style';

export interface Marcador {
  id: number;
  nombre: string;
  descripcion: string;
  latitud: number;
  longitud: number;
  icono: string; // Usamos icono en vez de color
}

const gisStore = useGisStore();
const mapContainer = ref<HTMLElement | null>(null);
const modalVisible = ref(false);
const nuevoMarcador = ref<Marcador>({
  id: 0,
  nombre: '',
  descripcion: '',
  latitud: 0,
  longitud: 0,
  icono: null, // Ícono por defecto
});

const iconosDisponibles = [
  { label: 'Ícono 1', value: '/marker-icon.png' },
  { label: 'Ícono 2', value: '/marker-icon-2.png' },
  { label: 'Ícono 3', value: '/marker-icon-3.png' },
  // Agrega más íconos según sea necesario
];

let map: Map;
let vectorSource = new VectorSource();

onMounted(() => {
  vectorSource = new VectorSource();

  // Agregar marcadores almacenados en el store
  gisStore.marcadores.forEach(agregarMarcadorAlMapa);

  const vectorLayer = new VectorLayer({ source: vectorSource });

  map = new Map({
    target: mapContainer.value as HTMLElement,
    layers: [new TileLayer({ source: new OSM() }), vectorLayer],
    view: new View({
      center: fromLonLat([-57.1339, -37.0017]),
      zoom: 15,
      minZoom: 5,
      maxZoom: 18,
    }),
    controls: [],
  });

  map.on('singleclick', (event) => {
    let marcadorSeleccionado = false;

    map.forEachFeatureAtPixel(event.pixel, (feature) => {
      const id = feature.get('id') as number;
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
    id: Date.now(),
    nombre: '',
    descripcion: '',
    latitud: coords[1],
    longitud: coords[0],
    icono: null, // Ícono por defecto
  };
  modalVisible.value = true;
}

function cerrarModal() {
  modalVisible.value = false;
}

function guardarMarcador() {
  const marcador = { ...nuevoMarcador.value };
  gisStore.agregarMarcador(marcador);
  agregarMarcadorAlMapa(marcador);
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
        src: `${marcador.icono}`, // Usar el ícono seleccionado
        scale: 0.2,
      }),
    })
  );

  vectorSource.addFeature(feature);
}
</script>

<style scoped>
.mapa {
  width: 100%;
  height: 100vh;
}

.info-panel {
  position: absolute;
  top: 20px;
  left: 20px;
  background: white;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
}

.reference-card {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 250px;
  background-color: #fff;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
  padding: 10px;
  border-radius: 5px;
}

.reference-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px; /* Espacio entre los elementos */
}

.reference-img {
  width: 40px; /* Ajusta el tamaño de la imagen */
  height: 40px; /* Mantén la proporción de la imagen */
  margin-right: 8px; /* Espacio entre la imagen y el texto */
}

.q-dialog__backdrop {
  backdrop-filter: blur(5px);
  background-color: rgba(0, 0, 0, 0.3);
}
</style>
