<template>
  <q-page class="dashboard-page dashboard-scrollable">
    <!-- Header -->
    <div class="dashboard-header bg-primary">
      <div class="row items-center q-mb-sm">
        <div class="col">
          <div class="text-white text-h6" style="opacity: 0.8">
            Resumen estadístico del sistema
          </div>
        </div>
        <div class="col-auto">
          <q-select v-model="selectedYear" :options="yearOptions" emit-value map-options dense outlined dark
            label="Filtrar por año" style="min-width: 180px" class="year-filter-select">
            <template #prepend>
              <q-icon name="calendar_today" />
            </template>
          </q-select>
        </div>
      </div>
      <div v-if="selectedYear !== null" class="text-white text-caption" style="opacity: 0.7">
        <q-icon name="filter_list" size="xs" class="q-mr-xs" />
        Mostrando datos del año {{ selectedYear }} — {{ filteredMarcadores.length }} informes
      </div>
    </div>

    <div class="dashboard-content q-pa-md">
      <!-- Tarjetas de métricas principales -->
      <div class="row q-col-gutter-md q-mb-lg">

        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="metric-card bg-secondary text-white">
            <q-card-section class="q-pa-lg">
              <div class="row items-center no-wrap">
                <div class="col">
                  <div class="metric-value">{{ totalInformes }}</div>
                  <div class="metric-label">Total de Informes</div>
                </div>
                <div class="metric-icon">
                  <q-icon name="description" size="xl" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="metric-card bg-warning text-white">
            <q-card-section class="q-pa-lg">
              <div class="row items-center no-wrap">
                <div class="col">
                  <div class="metric-value">{{ totalIntegrantes }}</div>
                  <div class="metric-label">Total Integrantes</div>
                </div>
                <div class="metric-icon">
                  <q-icon name="people" size="xl" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="metric-card bg-info text-white">
            <q-card-section class="q-pa-lg">
              <div class="row items-center no-wrap">
                <div class="col">
                  <div class="metric-value">{{ totalProgramas }}</div>
                  <div class="metric-label">Programas Activos</div>
                </div>
                <div class="metric-icon">
                  <q-icon name="assignment" size="xl" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="metric-card metric-card-barrios text-white">
            <q-card-section class="q-pa-lg">
              <div class="row items-center no-wrap">
                <div class="col">
                  <div class="metric-value">{{ barriosActivos }}</div>
                  <div class="metric-label">Barrios Activos</div>
                </div>
                <div class="metric-icon">
                  <q-icon name="location_city" size="xl" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Primera fila de gráficos -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-lg-8">
          <q-card class="chart-card">
            <q-card-section>
              <div class="chart-header">
                <div class="chart-title">Informes Cargados</div>
                <div class="chart-subtitle">
                  Evolución mensual de informes registrados
                  <span v-if="selectedYear !== null" class="q-ml-xs">
                    — {{ selectedYear }}
                  </span>
                </div>
              </div>
              <apexchart type="bar" height="350" :options="chartOptionsInformes" :series="seriesInformes" />
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-lg-4">
          <q-card class="chart-card">
            <q-card-section>
              <div class="chart-header">
                <div class="chart-title">Vulnerabilidad</div>
                <div class="chart-subtitle">Distribución por nivel</div>
              </div>
              <apexchart type="donut" height="350" :options="chartOptionsVulnerabilidad"
                :series="seriesVulnerabilidad" />
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Segunda fila de gráficos -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-lg-8">
          <q-card class="chart-card">
            <q-card-section>
              <div class="chart-header">
                <div class="chart-title">Marcadores por Barrios</div>
                <div class="chart-subtitle">Distribución geográfica</div>
              </div>
              <apexchart type="donut" height="350" :options="chartOptionsBarrios" :series="seriesBarrios" />
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-lg-4">
          <q-card class="chart-card">
            <q-card-section>
              <div class="chart-header">
                <div class="chart-title">Programas por Tipo</div>
                <div class="chart-subtitle">Distribución de programas activos</div>
              </div>
              <apexchart type="bar" height="350" :options="chartOptionsProgramas" :series="seriesProgramas" />
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Métricas clave -->
      <div class="row q-col-gutter-md">
        <div class="col-12">
          <q-card class="chart-card">
            <q-card-section>
              <div class="chart-header">
                <div class="chart-title">Métricas Clave</div>
                <div class="chart-subtitle">Resumen estadístico</div>
              </div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-6 col-md-3">
                  <div class="metric-item">
                    <q-icon name="group" size="md" color="primary" class="q-mb-sm" />
                    <div class="metric-item-label">Promedio de integrantes por familia</div>
                    <div class="metric-item-value">{{ promedioIntegrantes }}</div>
                  </div>
                </div>
                <div class="col-12 col-sm-6 col-md-3">
                  <div class="metric-item">
                    <q-icon name="accessibility_new" size="md" color="negative" class="q-mb-sm" />
                    <div class="metric-item-label">Familias con CUD</div>
                    <div class="metric-item-value">{{ familiasConCUD }}%</div>
                  </div>
                </div>
                <div class="col-12 col-sm-6 col-md-3">
                  <div class="metric-item">
                    <q-icon name="health_and_safety" size="md" color="positive" class="q-mb-sm" />
                    <div class="metric-item-label">Familias con obra social</div>
                    <div class="metric-item-value">{{ familiasConObraSocial }}%</div>
                  </div>
                </div>
                <div class="col-12 col-sm-6 col-md-3">
                  <div class="metric-item">
                    <q-icon name="place" size="md" color="warning" class="q-mb-sm" />
                    <div class="metric-item-label">Barrio más representado</div>
                    <div class="metric-item-value text-ellipsis">{{ barrioMasRepresentado }}</div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, shallowRef } from 'vue';
import { useGisStore } from 'src/stores/gisStore';
import { ApexOptions } from 'apexcharts';

const gisStore = useGisStore();

// --- Filtro de año ---
const selectedYear = ref<number | null>(null);

const availableYears = computed(() => {
  const years = new Set<number>();
  gisStore.marcadores.forEach(m => {
    if (m.fechaCreacion) {
      years.add(new Date(m.fechaCreacion).getFullYear());
    }
  });
  return Array.from(years).sort((a, b) => b - a);
});

const yearOptions = computed(() => [
  { label: 'Todos los años', value: null },
  ...availableYears.value.map(y => ({ label: String(y), value: y }))
]);

const filteredMarcadores = computed(() => {
  if (selectedYear.value === null) return gisStore.marcadores;
  return gisStore.marcadores.filter(m => {
    if (!m.fechaCreacion) return false;
    return new Date(m.fechaCreacion).getFullYear() === selectedYear.value;
  });
});

// --- Métricas principales ---
const totalInformes = computed(() => filteredMarcadores.value.length);

const totalIntegrantes = computed(() =>
  filteredMarcadores.value.reduce((acc, m) => acc + (m.integrantes?.length || 0), 0)
);

const totalProgramas = computed(() =>
  filteredMarcadores.value.reduce((acc, m) => acc + (m.programas?.length || 0), 0)
);

const barriosActivos = computed(() => {
  const barrios = new Set<string>();
  filteredMarcadores.value.forEach(m => { if (m.barrio) barrios.add(m.barrio); });
  return barrios.size;
});

const promedioIntegrantes = computed(() => {
  if (filteredMarcadores.value.length === 0) return '0.0';
  return (totalIntegrantes.value / filteredMarcadores.value.length).toFixed(1);
});

const familiasConCUD = computed(() => {
  if (filteredMarcadores.value.length === 0) return 0;
  const conCUD = filteredMarcadores.value.filter(m =>
    m.integrantes?.some(i => i.salud?.some(s => s.cud))
  ).length;
  return Math.round((conCUD / filteredMarcadores.value.length) * 100);
});

const familiasConObraSocial = computed(() => {
  if (filteredMarcadores.value.length === 0) return 0;
  const conOS = filteredMarcadores.value.filter(m =>
    m.integrantes?.some(i => i.salud?.some(s => s.obra_social))
  ).length;
  return Math.round((conOS / filteredMarcadores.value.length) * 100);
});

const barrioMasRepresentado = computed(() => {
  const barrios = filteredMarcadores.value.reduce((acc, m) => {
    if (m.barrio) acc[m.barrio] = (acc[m.barrio] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  if (Object.keys(barrios).length === 0) return 'N/A';
  return Object.keys(barrios).reduce((a, b) => (barrios[a] > barrios[b] ? a : b));
});

// --- Vulnerabilidad ---
const vulnerabilidadCounts = computed(() => {
  if (filteredMarcadores.value.length === 0) {
    return { 'Alta': 0, 'Media': 0, 'Baja': 0, 'Específica': 0 };
  }
  const counts: Record<string, number> = {};
  filteredMarcadores.value.forEach(m => {
    let vulnerabilidad = 'Sin clasificar';
    if (m.icono?.includes('/marker-icon.png')) vulnerabilidad = 'Alta';
    else if (m.icono?.includes('/marker-icon-2.png')) vulnerabilidad = 'Media';
    else if (m.icono?.includes('/marker-icon-3.png')) vulnerabilidad = 'Baja';
    else if (m.icono?.includes('/marker-icon-4.png')) vulnerabilidad = 'Específica';
    counts[vulnerabilidad] = (counts[vulnerabilidad] || 0) + 1;
  });
  return Object.keys(counts).length ? counts : { 'Sin clasificar': filteredMarcadores.value.length || 1 };
});

const chartOptionsVulnerabilidad = shallowRef<ApexOptions>({
  chart: {
    id: 'distribucion-vulnerabilidad',
    type: 'donut',
    fontFamily: 'Roboto, sans-serif',
    animations: { enabled: false },
    redrawOnParentResize: true,
    redrawOnWindowResize: true,
  },
  colors: ['#1976D2', '#26A69A', '#F2C037', '#31CCEC', '#9C27B0'],
  labels: [],
  plotOptions: {
    pie: {
      donut: {
        size: '65%',
        labels: {
          show: true,
          total: { show: true, label: 'Total', fontSize: '16px', fontWeight: 'bold' }
        }
      }
    }
  },
  dataLabels: {
    enabled: true,
    formatter: (val: number) => Math.round(val) + '%',
    style: { fontSize: '12px', fontWeight: 'bold' }
  },
  legend: { position: 'bottom', fontSize: '12px' },
  tooltip: { theme: 'light', y: { formatter: (val: number) => val + ' casos' } }
});

watch(
  () => Object.keys(vulnerabilidadCounts.value),
  (labels) => { chartOptionsVulnerabilidad.value.labels = labels.length > 0 ? labels : ['Alto', 'Medio', 'Bajo']; },
  { immediate: true }
);

const seriesVulnerabilidad = computed(() => {
  const values = Object.values(vulnerabilidadCounts.value);
  if (values.some(v => v > 0)) return values;
  const count = values.length;
  return count > 0 ? Array(count).fill(1) : [1];
});

// --- Programas por tipo ---
const programasPorTipo = computed(() => {
  const tipos = ['CONTRAPRESTACIÓN', 'PROGRAMAS ALIMENTARIOS', 'SUBSIDIO ECONÓMICO', 'ALQUILER', 'OTRAS AYUDAS'];
  return tipos.map(tipo => ({
    tipo,
    count: filteredMarcadores.value.reduce((acc, m) =>
      acc + (m.programas?.filter(p => p.tipo === tipo)?.length || 0), 0)
  }));
});

const chartOptionsProgramas = computed<ApexOptions>(() => ({
  chart: { id: 'programas-por-tipo', type: 'bar', toolbar: { show: false } },
  plotOptions: { bar: { horizontal: true, borderRadius: 6 } },
  dataLabels: { enabled: true },
  xaxis: { categories: programasPorTipo.value.map(p => p.tipo) },
  colors: ['#26A69A'],
}));

const seriesProgramas = computed(() => [
  { name: 'Cantidad', data: programasPorTipo.value.map(p => p.count) }
]);

// --- Informes por mes ---
const getMonthYear = (dateString: string) => {
  const d = new Date(dateString);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const getMonthName = (monthYear: string) => {
  const [year, month] = monthYear.split('-');
  return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
};

const informesPorMes = computed(() => {
  const data: Record<string, number> = {};

  if (filteredMarcadores.value.length === 0) {
    const base = selectedYear.value ?? new Date().getFullYear();
    for (let i = 0; i < 12; i++) {
      const d = new Date(base, i, 1);
      data[getMonthYear(d.toISOString())] = 0;
    }
  } else {
    filteredMarcadores.value.forEach(m => {
      if (m.fechaCreacion) {
        const key = getMonthYear(m.fechaCreacion);
        data[key] = (data[key] || 0) + 1;
      }
    });

    // Si hay año seleccionado, completar los 12 meses
    if (selectedYear.value !== null) {
      for (let i = 0; i < 12; i++) {
        const key = `${selectedYear.value}-${String(i + 1).padStart(2, '0')}`;
        if (!(key in data)) data[key] = 0;
      }
    }
  }

  return Object.keys(data).sort().map(k => ({ x: getMonthName(k), y: data[k] }));
});

const chartOptionsInformes = computed<ApexOptions>(() => ({
  chart: { id: 'informes-por-mes', type: 'bar', toolbar: { show: false }, fontFamily: 'Roboto, sans-serif' },
  plotOptions: { bar: { borderRadius: 8, columnWidth: '60%' } },
  dataLabels: { enabled: false },
  colors: ['#1976D2'],
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'light',
      type: 'vertical',
      shadeIntensity: 0.3,
      gradientToColors: ['#26A69A'],
      inverseColors: false,
      opacityFrom: 0.8,
      opacityTo: 0.6,
    }
  },
  xaxis: {
    categories: informesPorMes.value.map(d => d.x),
    title: { text: 'Meses', style: { fontWeight: 'bold' } },
    labels: { style: { colors: '#666' } }
  },
  yaxis: {
    title: { text: 'Cantidad de Informes', style: { fontWeight: 'bold' } },
    labels: { style: { colors: '#666' } }
  },
  grid: { borderColor: '#e7e7e7', strokeDashArray: 4 },
  tooltip: { theme: 'light' },
}));

const seriesInformes = computed(() => [
  { name: 'Informes', data: informesPorMes.value.map(d => d.y) }
]);

// --- Barrios ---
const barriosDelSistema = [
  'San Martin A', 'San Martin B', 'Kenedy', 'Los Pinos', 'Belgrano',
  'Barrio Norte', 'Barrio Centro', 'Quintanilla', 'Zona Rural', 'Otro'
];

const normalize = (s?: string) =>
  (s || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ');

const barrioCanonicalMap: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  barriosDelSistema.forEach(b => { map[normalize(b)] = b; });
  map[normalize('Kennedy')] = 'Kenedy';
  map[normalize('San Martín A')] = 'San Martin A';
  map[normalize('San Martín B')] = 'San Martin B';
  map[normalize('Centro')] = 'Barrio Centro';
  map[normalize('Norte')] = 'Barrio Norte';
  map[normalize('Pinos')] = 'Los Pinos';
  map[normalize('Rural')] = 'Zona Rural';
  return map;
})();

const marcadoresPorBarrio = computed(() => {
  const counts: Record<string, number> = {};
  barriosDelSistema.forEach(b => { counts[b] = 0; });

  if (filteredMarcadores.value.length === 0) {
    return { 'Sin datos': 1 };
  }

  filteredMarcadores.value.forEach(m => {
    const canonical = barrioCanonicalMap[normalize(m.barrio)] || 'Otro';
    counts[canonical] = (counts[canonical] || 0) + 1;
  });

  const withData = Object.fromEntries(Object.entries(counts).filter(([, v]) => v > 0));
  return Object.keys(withData).length ? withData : { 'Sin datos': 1 };
});

const seriesBarrios = computed(() => {
  const values = Object.values(marcadoresPorBarrio.value);
  if (values.some(v => v > 0)) return values;
  return values.length ? Array(values.length).fill(1) : [1];
});

const chartOptionsBarrios = shallowRef<ApexOptions>({
  chart: {
    id: 'marcadores-por-barrios',
    type: 'donut',
    fontFamily: 'Roboto, sans-serif',
    animations: { enabled: false },
    redrawOnParentResize: true,
    redrawOnWindowResize: true,
  },
  colors: ['#1976D2', '#26A69A', '#F2C037', '#31CCEC', '#21BA45', '#9C27B0', '#FF5722', '#795548', '#607D8B', '#E91E63'],
  labels: [],
  plotOptions: {
    pie: {
      donut: {
        size: '65%',
        labels: {
          show: true,
          total: { show: true, label: 'Total', fontSize: '16px', fontWeight: 'bold', color: '#1976D2' }
        }
      }
    }
  },
  dataLabels: {
    enabled: true,
    formatter: (val: number) => Math.round(val) + '%',
    style: { fontSize: '12px', fontWeight: 'bold' }
  },
  legend: { position: 'bottom', fontSize: '12px', fontWeight: '500' },
  tooltip: { theme: 'light', y: { formatter: (val: number) => val + ' marcadores' } }
});

watch(
  () => Object.keys(marcadoresPorBarrio.value),
  (labels) => { chartOptionsBarrios.value.labels = labels.length > 0 ? labels : ['Sin datos']; },
  { immediate: true }
);

onMounted(() => {
  if (gisStore.marcadores.length === 0) {
    gisStore.cargarMarcadoresDesdeAPI();
  }

  const pageContainer = document.querySelector('.q-page-container') as HTMLElement;
  const layout = document.querySelector('.q-layout') as HTMLElement;
  const page = document.querySelector('.q-page') as HTMLElement;

  if (pageContainer) {
    pageContainer.style.setProperty('overflow-y', 'auto', 'important');
    pageContainer.style.setProperty('height', '100vh', 'important');
  }
  if (layout) layout.style.setProperty('overflow', 'auto', 'important');
  if (page) {
    page.style.setProperty('overflow-y', 'auto', 'important');
    page.style.setProperty('height', 'auto', 'important');
  }
});
</script>

<style scoped>
.dashboard-page {
  background: #f5f7fa;
  min-height: 100vh;
  overflow-y: auto;
  height: auto;
  position: relative;
  padding-bottom: 2rem;
}

:deep(.q-page-container) {
  overflow-y: auto !important;
  height: 100vh !important;
}

.dashboard-scrollable {
  overflow-y: auto !important;
  height: 100vh !important;
  max-height: 100vh !important;
}

:deep(.q-page.dashboard-scrollable) {
  overflow-y: auto !important;
  height: auto !important;
  min-height: 100vh !important;
}

.dashboard-header {
  padding: 1.5rem 2rem;
  margin: -1rem -1rem 0 -1rem;
  position: relative;
  z-index: 1;
}

.dashboard-content {
  margin-top: -1rem;
  background: #f5f7fa;
  border-radius: 20px 20px 0 0;
  padding-bottom: 2rem;
  overflow: visible;
  position: relative;
  z-index: 2;
}

/* Tarjetas de métricas */
.metric-card {
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: none;
  overflow: visible;
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.metric-card-barrios {
  background: linear-gradient(135deg, #7B1FA2, #9C27B0) !important;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.metric-value {
  font-size: 2.5rem;
  font-weight: bold;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.metric-label {
  font-size: 0.9rem;
  opacity: 0.9;
  font-weight: 500;
}

.metric-icon {
  opacity: 0.3;
  font-size: 3rem;
}

/* Tarjetas de gráficos */
.chart-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: none;
  overflow: visible;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.chart-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.chart-header {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.chart-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 0.25rem;
}

.chart-subtitle {
  font-size: 0.9rem;
  color: #666;
}

/* Métricas clave */
.metric-item {
  text-align: center;
  padding: 1.5rem 1rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.metric-item:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.metric-item-label {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.metric-item-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #1976D2;
}

.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 1.2rem;
}

/* Selector de año */
.year-filter-select :deep(.q-field__label) {
  color: rgba(255, 255, 255, 0.7) !important;
}

.year-filter-select :deep(.q-field__native),
.year-filter-select :deep(.q-field__input) {
  color: white !important;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-header {
    padding: 1rem;
  }

  .metric-value {
    font-size: 2rem;
  }

  .chart-title {
    font-size: 1rem;
  }
}

/* Animaciones */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.metric-card,
.chart-card {
  animation: fadeInUp 0.6s ease-out;
}

:deep(.apexcharts-tooltip) {
  border-radius: 8px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
}
</style>
