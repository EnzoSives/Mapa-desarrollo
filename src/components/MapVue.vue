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

    <!-- Modal para ingresar información del marcador -->
    <q-dialog v-model="modalVisible">
      <q-card class="q-pa-md">
        <q-card-section>
          <div class="text-h6">Nuevo marcador</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="nuevoMarcador.nombre" label="Nombre" />
          <q-input
            v-model="nuevoMarcador.descripcion"
            label="Descripción"
            type="textarea"
          />
          <!-- Selector de color -->
          <q-input
            v-model="nuevoMarcador.color"
            label="Color del marcador"
            type="color"
            :value="nuevoMarcador.color"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="cerrarModal" color="negative" />
          <q-btn
            flat
            label="Guardar"
            @click="guardarMarcador"
            color="positive"
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
import { getWidth, getHeight } from 'ol/extent';

export interface Marcador {
  id: number;
  nombre: string;
  descripcion: string;
  latitud: number;
  longitud: number;
  color: string; // Agregar propiedad color
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
  color: '#FF0000', // Color por defecto
});
let map: Map;
let vectorSource = new VectorSource();

onMounted(() => {
  vectorSource = new VectorSource();

  // Agregar marcadores almacenados en el store
  gisStore.marcadores.forEach(agregarMarcadorAlMapa);

  const vectorLayer = new VectorLayer({ source: vectorSource });

  const extent = [
    fromLonLat([-57.3, -37.2]), // Esquina inferior izquierda (menos lejos)
    fromLonLat([-56.95, -36.85]), // Esquina superior derecha (menos lejos)
  ];

  map = new Map({
    target: mapContainer.value as HTMLElement,
    layers: [new TileLayer({ source: new OSM() }), vectorLayer],
    view: new View({
      center: fromLonLat([-57.1339, -37.0017]), // Centro de la localidad
      zoom: 15, // Un poco más de zoom para ver menos área
      minZoom: 5, // Evitamos alejar demasiado
      maxZoom: 18,
      extent: [
        extent[0][0],
        extent[0][1], // Min X, Min Y
        extent[1][0],
        extent[1][1], // Max X, Max Y
      ],
    }),
    controls: [], // Eliminamos controles del mapa
  });

  // Unificar evento de click en el mapa
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

  // Detectar hover sobre los marcadores
  map.on('pointermove', (event) => {
    let isOverMarker = false;

    map.forEachFeatureAtPixel(event.pixel, (feature) => {
      isOverMarker = true;
      feature.setStyle(
        new Style({
          image: new Icon({
            src: '/marker-icon.png',
            scale: 0.3, // Aumentamos el tamaño en hover
          }),
        })
      );
    });

    if (!isOverMarker) {
      vectorSource.getFeatures().forEach((feature) => {
        feature.setStyle(
          new Style({
            image: new Icon({
              src: '/marker-icon.png',
              scale: 0.2, // Tamaño por defecto
            }),
          })
        );
      });
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
    color: '#FF0000', // Color por defecto
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
        src: '/marker-icon.png',
        scale: 0.2, // Tamaño por defecto
        color: marcador.color, // Usar el color seleccionado
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
</style>
