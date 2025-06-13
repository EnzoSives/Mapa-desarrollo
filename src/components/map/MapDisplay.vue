<template>
  <div ref="mapContainer" class="map-container"></div>
  <div ref="tooltip" class="tooltip" :style="{ left: tooltipPosition.x + 'px', top: tooltipPosition.y + 'px', visibility: tooltipVisibility }">
    {{ tooltipText }}
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import { fromLonLat, toLonLat } from 'ol/proj';
import type { Coordinate } from 'ol/coordinate';

// Define Marcador type (adjust as per your actual Marcador definition)
interface Marcador {
  id: string;
  nombre: string;
  coordenadas: {
    lat: number;
    lon: number;
  };
  // Add other properties as needed
}

const props = defineProps<{
  markers: Marcador[];
}>();

const emit = defineEmits<{
  (e: 'map-click', coordinates: Coordinate): void;
  (e: 'marker-select', markerId: string): void;
}>();

const mapContainer = ref<HTMLElement | null>(null);
const map = ref<Map | null>(null);
const vectorSource = new VectorSource();
const tooltip = ref<HTMLElement | null>(null);
const tooltipText = ref('');
const tooltipPosition = ref({ x: 0, y: 0 });
const tooltipVisibility = ref<'visible' | 'hidden'>('hidden');

const markerIcon = new Style({
  image: new Icon({
    anchor: [0.5, 46],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    src: 'https://openlayers.org/en/latest/examples/data/icon.png', // Default icon
  }),
});

onMounted(() => {
  if (mapContainer.value) {
    map.value = new Map({
      target: mapContainer.value,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        new VectorLayer({
          source: vectorSource,
          style: markerIcon,
        }),
      ],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2,
      }),
    });

    // Handle map click for new marker
    map.value.on('singleclick', (event) => {
      const clickedCoord = event.coordinate;
      const lonLat = toLonLat(clickedCoord);
      // Check if a marker was clicked
      const feature = map.value?.forEachFeatureAtPixel(event.pixel, (ft) => ft);
      if (feature) {
        const markerId = feature.get('id');
        if (markerId) {
          emit('marker-select', markerId);
        }
      } else {
        emit('map-click', lonLat);
      }
    });

    // Handle hover tooltips
    map.value.on('pointermove', (event) => {
      if (event.dragging || !tooltip.value) {
        tooltipVisibility.value = 'hidden';
        return;
      }
      const pixel = map.value?.getEventPixel(event.originalEvent);
      if (!pixel) {
        tooltipVisibility.value = 'hidden';
        return;
      }
      const feature = map.value?.forEachFeatureAtPixel(pixel, (ft) => ft);
      if (feature) {
        const markerName = feature.get('name') || 'Unnamed Marker';
        tooltipText.value = markerName;
        tooltipPosition.value = { x: event.originalEvent.offsetX + 10, y: event.originalEvent.offsetY + 10 };
        tooltipVisibility.value = 'visible';
      } else {
        tooltipVisibility.value = 'hidden';
      }
    });
  }
});

watch(() => props.markers, (newMarkers) => {
  vectorSource.clear(); // Clear existing markers
  newMarkers.forEach(marker => {
    const point = new Point(fromLonLat([marker.coordenadas.lon, marker.coordenadas.lat]));
    const feature = new Feature({
      geometry: point,
      name: marker.nombre,
      id: marker.id,
    });
    vectorSource.addFeature(feature);
  });
}, { deep: true });

</script>

<style scoped>
.map-container {
  width: 100%;
  height: 400px; /* Adjust as needed */
}
.tooltip {
  position: absolute;
  background-color: white;
  border: 1px solid black;
  padding: 5px;
  pointer-events: none; /* Important to allow map events to pass through */
  z-index: 100;
}
</style>
