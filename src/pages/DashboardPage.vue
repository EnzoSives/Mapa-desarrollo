<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <h4 class="text-h4 q-my-none">Dashboard</h4>
      <div class="row q-gutter-md">
        <q-input
          filled
          v-model="startDate"
          mask="date"
          :rules="['date']"
          label="Fecha de inicio"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date v-model="startDate">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Cerrar" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        <q-input
          filled
          v-model="endDate"
          mask="date"
          :rules="['date']"
          label="Fecha de fin"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date v-model="endDate">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Cerrar" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section>
            <div class="text-h6">Total de Informes</div>
            <div class="text-h4">{{ totalInformes }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section>
            <div class="text-h6">Total de Integrantes</div>
            <div class="text-h4">{{ totalIntegrantes }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section>
            <div class="text-h6">Vulnerabilidad Predominante</div>
            <div class="text-h4">{{ vulnerabilidadPredominante }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-lg-6">
        <q-card>
          <q-card-section>
            <apexchart
              type="bar"
              height="350"
              :options="chartOptionsInformes"
              :series="seriesInformes"
            ></apexchart>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-lg-6">
        <q-card>
          <q-card-section>
            <apexchart
              type="line"
              height="350"
              :options="chartOptionsIntegrantes"
              :series="seriesIntegrantes"
            ></apexchart>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12">
        <q-card>
          <q-card-section>
            <apexchart
              v-if="seriesVulnerabilidad.length > 0"
              type="pie"
              height="350"
              :options="chartOptionsVulnerabilidad"
              :series="seriesVulnerabilidad"
            ></apexchart>
            <div v-else class="text-center text-grey-7 q-pa-xl">
              Cargando datos de vulnerabilidad...
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useGisStore } from 'src/stores/gisStore';
import VueApexCharts from 'vue3-apexcharts';
import { ApexOptions } from 'apexcharts';

const gisStore = useGisStore();
const apexchart = VueApexCharts;

const startDate = ref(null);
const endDate = ref(null);

const filteredMarcadores = computed(() => {
  if (!startDate.value || !endDate.value) {
    return gisStore.marcadores;
  }
  const start = new Date(startDate.value);
  const end = new Date(endDate.value);
  // Aseguramos que la fecha de fin incluya todo el día
  end.setHours(23, 59, 59, 999);

  return gisStore.marcadores.filter((m) => {
    if (!m.fechaCreacion) return false;
    const fechaCreacion = new Date(m.fechaCreacion);
    return fechaCreacion >= start && fechaCreacion <= end;
  });
});

const totalInformes = computed(() => filteredMarcadores.value.length);
const totalIntegrantes = computed(() =>
  filteredMarcadores.value.reduce(
    (acc, m) => acc + (m.integrantes?.length || 0),
    0
  )
);

const getMonthYear = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0'
  )}`;
};

const informesPorMes = computed(() => {
  const data = filteredMarcadores.value.reduce((acc, m) => {
    if (m.fechaCreacion) {
      const monthYear = getMonthYear(m.fechaCreacion);
      acc[monthYear] = (acc[monthYear] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const sortedMonths = Object.keys(data).sort();
  return sortedMonths.map((month) => ({
    x: month,
    y: data[month] || 0,
  }));
});

const integrantesPorMes = computed(() => {
  const data = filteredMarcadores.value.reduce((acc, m) => {
    if (m.fechaCreacion) {
      const monthYear = getMonthYear(m.fechaCreacion);
      acc[monthYear] = (acc[monthYear] || 0) + (m.integrantes?.length || 0);
    }
    return acc;
  }, {} as Record<string, number>);

  const sortedMonths = Object.keys(data).sort();
  return sortedMonths.map((month) => ({
    x: month,
    y: data[month] || 0,
  }));
});

const vulnerabilidadCounts = computed(() => {
  return filteredMarcadores.value.reduce((acc, m) => {
    if (m.icono && typeof m.icono === 'string') {
      // Extrae la etiqueta de vulnerabilidad del nombre del ícono.
      const match = m.icono.match(/marker-icon-(\w+)\.png/);
      if (match && match[1]) {
        const vulnerabilidad = match[1];
        const label = `Nivel ${vulnerabilidad}`;
        acc[label] = (acc[label] || 0) + 1;
      }
    }
    return acc;
  }, {} as Record<string, number>);
});

const vulnerabilidadPredominante = computed(() => {
  const data = vulnerabilidadCounts.value;
  if (!data || Object.keys(data).length === 0) return 'N/A';
  return Object.keys(data).reduce((a, b) => (data[a] > data[b] ? a : b));
});

const chartOptionsInformes = computed<ApexOptions>(() => ({
  chart: {
    id: 'informes-por-mes',
    type: 'bar',
  },
  xaxis: {
    categories: informesPorMes.value.map((d) => d.x),
    title: {
      text: 'Meses',
    },
  },
  title: {
    text: 'Informes Cargados por Mes',
  },
}));

const seriesInformes = computed(() => [
  {
    name: 'Informes',
    data: informesPorMes.value.map((d) => d.y),
  },
]);

const chartOptionsIntegrantes = computed<ApexOptions>(() => ({
  chart: {
    id: 'integrantes-por-mes',
    type: 'line',
  },
  xaxis: {
    categories: integrantesPorMes.value.map((d) => d.x),
    title: {
      text: 'Meses',
    },
  },
  title: {
    text: 'Integrantes Registrados por Mes',
  },
}));

const seriesIntegrantes = computed(() => [
  {
    name: 'Integrantes',
    data: integrantesPorMes.value.map((d) => d.y),
  },
]);

const chartOptionsVulnerabilidad = computed<ApexOptions>(() => ({
  chart: {
    id: 'distribucion-vulnerabilidad',
    type: 'pie',
  },
  labels: Object.keys(vulnerabilidadCounts.value),
  title: {
    text: 'Distribución por Nivel de Vulnerabilidad',
  },
}));

const seriesVulnerabilidad = computed(() => {
  const data = vulnerabilidadCounts.value;
  return data ? Object.values(data) : [];
});

onMounted(() => {
  if (gisStore.marcadores.length === 0) {
    gisStore.cargarMarcadoresDesdeAPI();
  }
});
</script>
