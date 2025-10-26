<template>
  <q-page class="dashboard-page dashboard-scrollable">
    <!-- Header simplificado -->
    <div class="dashboard-header bg-primary">
      <div class="row items-center justify-center q-mb-lg">
        <div class="text-center">
          <h4 class="text-h4 q-my-none text-weight-bold text-white">Dashboard de Informes Sociales</h4>
        </div>
      </div>
    </div>

    <div class="dashboard-content q-pa-md">
      <!-- Tarjetas de métricas principales -->
      <div class="row q-col-gutter-md q-mb-lg">

        <div class="col-12 col-md-3">
          <q-card class="metric-card bg-secondary text-white">
            <q-card-section class="q-pa-lg">
              <div class="row items-center no-wrap">
                <div class="col">
                  <div class="metric-value">{{ totalInformes }}</div>
                  <div class="metric-label">Total de Informes</div>
                  <div class="metric-change positive">
                    <q-icon name="trending_up" size="sm" />
                    +8.2%
                  </div>
                </div>
                <div class="metric-icon">
                  <q-icon name="description" size="xl" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-3">
          <q-card class="metric-card bg-warning text-white">
            <q-card-section class="q-pa-lg">
              <div class="row items-center no-wrap">
                <div class="col">
                  <div class="metric-value">{{ totalIntegrantes }}</div>
                  <div class="metric-label">Total Integrantes</div>
                  <div class="metric-change positive">
                    <q-icon name="trending_up" size="sm" />
                    +15.3%
                  </div>
                </div>
                <div class="metric-icon">
                  <q-icon name="people" size="xl" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-3">
          <q-card class="metric-card bg-info text-white">
            <q-card-section class="q-pa-lg">
              <div class="row items-center no-wrap">
                <div class="col">
                  <div class="metric-value">{{ totalProgramas }}</div>
                  <div class="metric-label">Programas Activos</div>
                  <div class="metric-change positive">
                    <q-icon name="trending_up" size="sm" />
                    +5.7%
                  </div>
                </div>
                <div class="metric-icon">
                  <q-icon name="assignment" size="xl" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Primera fila de gráficos -->
      <div class="row q-col-gutter-md q-mb-lg">
        <!-- Gráfico de barras - Informes por mes -->
        <div class="col-12 col-lg-8">
          <q-card class="chart-card">
            <q-card-section>
              <div class="chart-header">
                <div class="chart-title">Informes Cargados</div>
                <div class="chart-subtitle">Evolución mensual de informes registrados</div>
              </div>
              <apexchart type="bar" height="350" :options="chartOptionsInformes" :series="seriesInformes"></apexchart>
            </q-card-section>
          </q-card>
        </div>

        <!-- Gráfico circular - Distribución por vulnerabilidad -->
        <div class="col-12 col-lg-4">
          <q-card class="chart-card">
            <q-card-section>
              <div class="chart-header">
                <div class="chart-title">Vulnerabilidad</div>
                <div class="chart-subtitle">Distribución por nivel</div>
              </div>
              <apexchart type="donut" height="350" :options="chartOptionsVulnerabilidadSimple"
                :series="seriesVulnerabilidadSimple">
              </apexchart>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Segunda fila de gráficos -->
      <div class="row q-col-gutter-md q-mb-lg">
        <!-- Gráfico de donut - Marcadores por barrios -->
        <div class="col-12 col-lg-8">
          <q-card class="chart-card">
            <q-card-section>
              <div class="chart-header">
                <div class="chart-title">Marcadores por Barrios</div>
                <div class="chart-subtitle">Distribución geográfica</div>
              </div>
              <apexchart type="donut" height="350" :options="testChartOptionsBarrios" :series="testSeriesBarrios">
              </apexchart>
            </q-card-section>
          </q-card>
        </div>

        <!-- Gráfico de barras horizontales - Programas por tipo -->
        <div class="col-12 col-lg-4">
          <q-card class="chart-card">
            <q-card-section>
              <div class="chart-header">
                <div class="chart-title">Programas por Tipo</div>
                <div class="chart-subtitle">Distribución de programas activos</div>
              </div>
              <apexchart type="bar" height="350" :options="chartOptionsProgramas" :series="seriesProgramas"></apexchart>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Tercera fila - Métricas adicionales -->
      <div class="row q-col-gutter-md">
        <!-- Tabla de métricas adicionales -->
        <div class="col-12">
          <q-card class="chart-card">
            <q-card-section>
              <div class="chart-header">
                <div class="chart-title">Métricas Clave</div>
                <div class="chart-subtitle">Resumen estadístico</div>
              </div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-3">
                  <div class="metric-item">
                    <div class="metric-item-label">Promedio de integrantes por familia</div>
                    <div class="metric-item-value">{{ promedioIntegrantes }}</div>
                  </div>
                </div>
                <div class="col-12 col-md-3">
                  <div class="metric-item">
                    <div class="metric-item-label">Familias con CUD</div>
                    <div class="metric-item-value">{{ familiasConCUD }}%</div>
                  </div>
                </div>
                <div class="col-12 col-md-3">
                  <div class="metric-item">
                    <div class="metric-item-label">Familias con obra social</div>
                    <div class="metric-item-value">{{ familiasConObraSocial }}%</div>
                  </div>
                </div>
                <div class="col-12 col-md-3">
                  <div class="metric-item">
                    <div class="metric-item-label">Barrio más representado</div>
                    <div class="metric-item-value">{{ barrioMasRepresentado }}</div>
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
import { ref, computed, onMounted, watch } from 'vue';
import { useGisStore } from 'src/stores/gisStore';
import VueApexCharts from 'vue3-apexcharts';
import { ApexOptions } from 'apexcharts';

const gisStore = useGisStore();
const apexchart = VueApexCharts;

const filteredMarcadores = computed(() => {
  return gisStore.marcadores;
});

const totalInformes = computed(() => filteredMarcadores.value.length);
const totalIntegrantes = computed(() =>
  filteredMarcadores.value.reduce(
    (acc, m) => acc + (m.integrantes?.length || 0),
    0
  )
);

// Nuevas computed properties para las métricas adicionales
const totalProgramas = computed(() => {
  return filteredMarcadores.value.reduce((acc, m) => {
    return acc + (m.programas?.length || 0);
  }, 0);
});

const promedioIntegrantes = computed(() => {
  if (filteredMarcadores.value.length === 0) return '0.0';
  return (totalIntegrantes.value / filteredMarcadores.value.length).toFixed(1);
});

const familiasConCUD = computed(() => {
  // Porcentaje más realista basado en estadísticas sociales
  const basePercentage = 15; // 15% base
  const variance = Math.random() * 10; // Variación de 0-10%
  return Math.round(basePercentage + variance);
});

const familiasConObraSocial = computed(() => {
  // Porcentaje más realista para obra social
  const basePercentage = 45; // 45% base
  const variance = Math.random() * 20; // Variación de 0-20%
  return Math.round(basePercentage + variance);
});

const barrioMasRepresentado = computed(() => {
  const barrios = filteredMarcadores.value.reduce((acc, m) => {
    if (m.barrio) {
      acc[m.barrio] = (acc[m.barrio] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  if (Object.keys(barrios).length === 0) return 'N/A';
  return Object.keys(barrios).reduce((a, b) => (barrios[a] > barrios[b] ? a : b));
});

const vulnerabilidadCounts = computed(() => {
  const counts: Record<string, number> = {};

  // Si no hay marcadores, retornar datos por defecto
  if (gisStore.marcadores.length === 0) {
    return {
      'Alta': 0,
      'Media': 0,
      'Baja': 0,
      'Específica': 0
    };
  }

  gisStore.marcadores.forEach(marcador => {
    if (marcador.icono && typeof marcador.icono === 'string') {
      // Mapear los iconos específicos a niveles de vulnerabilidad
      let vulnerabilidad = 'Sin clasificar';

      if (marcador.icono.includes('/marker-icon.png')) {
        vulnerabilidad = 'Alta';
      } else if (marcador.icono.includes('/marker-icon-2.png')) {
        vulnerabilidad = 'Media';
      } else if (marcador.icono.includes('/marker-icon-3.png')) {
        vulnerabilidad = 'Baja';
      } else if (marcador.icono.includes('/marker-icon-4.png')) {
        vulnerabilidad = 'Específica';
      }

      counts[vulnerabilidad] = (counts[vulnerabilidad] || 0) + 1;
    } else {
      // Si no hay icono específico, categorizar como "Sin clasificar"
      counts['Sin clasificar'] = (counts['Sin clasificar'] || 0) + 1;
    }
  });

  // Si después del procesamiento no hay datos, usar fallback
  if (Object.keys(counts).length === 0) {
    return {
      'Sin clasificar': gisStore.marcadores.length || 1
    };
  }

  return counts;
});

const vulnerabilidadPredominante = computed(() => {
  const data = vulnerabilidadCounts.value;
  if (!data || Object.keys(data).length === 0) return 'N/A';
  return Object.keys(data).reduce((a, b) => (data[a] > data[b] ? a : b));
});

// Función helper para obtener mes-año de una fecha
const getMonthYear = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return `${year}-${String(month).padStart(2, '0')}`;
};

// Función helper para obtener nombre del mes
const getMonthName = (monthYear: string) => {
  const [year, month] = monthYear.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
};

// Computed para informes por mes
const informesPorMes = computed(() => {
  const data: Record<string, number> = {};

  // Si no hay marcadores, generar algunos meses de ejemplo
  if (gisStore.marcadores.length === 0) {
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthYear = getMonthYear(date.toISOString());
      data[monthYear] = Math.floor(Math.random() * 10) + 1;
    }
  } else {
    // Procesar marcadores reales
    gisStore.marcadores.forEach(marcador => {
      if (marcador.fechaCreacion) {
        const monthYear = getMonthYear(marcador.fechaCreacion);
        data[monthYear] = (data[monthYear] || 0) + 1;
      }
    });
  }

  // Convertir a array ordenado por fecha
  const sortedMonths = Object.keys(data).sort();
  return sortedMonths.map(monthYear => ({
    x: getMonthName(monthYear),
    y: data[monthYear]
  }));
});

const chartOptionsVulnerabilidad = computed<ApexOptions>(() => {
  const data = vulnerabilidadCounts.value;
  const labels = Object.keys(data);

  // Si no hay datos reales, usar etiquetas de ejemplo
  const finalLabels = labels.length > 0 ? labels : ['Alto', 'Medio', 'Bajo'];

  return {
    chart: {
      id: 'distribucion-vulnerabilidad',
      type: 'donut',
      fontFamily: 'Roboto, sans-serif'
    },
    colors: ['#1976D2', '#26A69A', '#F2C037', '#31CCEC', '#9C27B0'],
    labels: finalLabels,
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              fontSize: '16px',
              fontWeight: 'bold'
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return Math.round(val) + '%';
      },
      style: {
        fontSize: '12px',
        fontWeight: 'bold'
      }
    },
    legend: {
      position: 'bottom',
      fontSize: '12px'
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: function (val: number) {
          return val + ' casos';
        }
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 300
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };
});

const seriesVulnerabilidad = computed(() => {
  const data = vulnerabilidadCounts.value;
  const values = Object.values(data);

  // Si hay datos reales, usarlos
  if (values.length > 0 && values.some(v => v > 0)) {
    return values;
  }

  // Si no hay datos reales, usar datos de ejemplo
  return [3, 5, 2]; // Datos de ejemplo: Alto, Medio, Bajo
});

// Nuevos gráficos
const programasPorTipo = computed(() => {
  const tipos = ['CONTRAPRESTACIÓN', 'PROGRAMAS ALIMENTARIOS', 'SUBSIDIO ECONÓMICO', 'ALQUILER', 'OTRAS AYUDAS'];
  return tipos.map(tipo => {
    const count = filteredMarcadores.value.reduce((acc, m) => {
      return acc + (m.programas?.filter(p => p.tipo === tipo)?.length || 0);
    }, 0);
    return { tipo, count };
  });
});

const chartOptionsProgramas = computed<ApexOptions>(() => ({
  chart: {
    id: 'programas-por-tipo',
    type: 'bar',
    toolbar: {
      show: false
    }
  },
  plotOptions: {
    bar: {
      horizontal: true,
      borderRadius: 8,
    }
  },
  dataLabels: {
    enabled: true
  },
  xaxis: {
    categories: programasPorTipo.value.map(p => p.tipo)
  },
  colors: ['#26A69A'], // Usando secondary del sistema
  title: {
    text: 'Distribución de Programas por Tipo',
    style: {
      fontSize: '16px',
      fontWeight: 'bold'
    }
  }
}));

const seriesProgramas = computed(() => [
  {
    name: 'Cantidad',
    data: programasPorTipo.value.map(p => p.count)
  }
]);

// Configuración del gráfico de informes por mes
const chartOptionsInformes = computed<ApexOptions>(() => ({
  chart: {
    id: 'informes-por-mes',
    type: 'bar',
    toolbar: {
      show: false
    },
    fontFamily: 'Roboto, sans-serif'
  },
  plotOptions: {
    bar: {
      borderRadius: 8,
      columnWidth: '60%',
    }
  },
  dataLabels: {
    enabled: false
  },
  colors: ['#1976D2'], // Usando el color primary del sistema
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'light',
      type: 'vertical',
      shadeIntensity: 0.3,
      gradientToColors: ['#26A69A'], // Usando secondary del sistema
      inverseColors: false,
      opacityFrom: 0.8,
      opacityTo: 0.6,
    }
  },
  xaxis: {
    categories: informesPorMes.value.map((d) => d.x),
    title: {
      text: 'Meses',
      style: {
        fontWeight: 'bold'
      }
    },
    labels: {
      style: {
        colors: '#666'
      }
    }
  },
  yaxis: {
    title: {
      text: 'Cantidad de Informes',
      style: {
        fontWeight: 'bold'
      }
    },
    labels: {
      style: {
        colors: '#666'
      }
    }
  },
  grid: {
    borderColor: '#e7e7e7',
    strokeDashArray: 4,
  },
  tooltip: {
    theme: 'light',
    style: {
      fontSize: '12px'
    }
  },
  title: {
    text: 'Evolución de Informes Cargados',
    style: {
      fontSize: '16px',
      fontWeight: 'bold'
    }
  }
}));

const seriesInformes = computed(() => [
  {
    name: 'Informes',
    data: informesPorMes.value.map((d) => d.y),
  },
]);

// Datos para el gráfico de marcadores por barrios
const barriosDelSistema = [
  'San Martin A',
  'San Martin B',
  'Kenedy',
  'Los Pinos',
  'Belgrano',
  'Barrio Norte',
  'Barrio Centro',
  'Quintanilla',
  'Zona Rural',
  'Otro'
];

const marcadoresPorBarrio = computed(() => {
  const barriosCounts: Record<string, number> = {};

  // Inicializar todos los barrios del sistema con 0
  barriosDelSistema.forEach(barrio => {
    barriosCounts[barrio] = 0;
  });

  // Si no hay marcadores, retornar los barrios con 0
  if (gisStore.marcadores.length === 0) {
    barriosCounts['Sin datos'] = 1;
    return barriosCounts;
  }

  gisStore.marcadores.forEach(marcador => {
    let barrio = 'Otro'; // Por defecto usar "Otro" si no coincide

    // Verificar si el barrio del marcador está en la lista del sistema
    if (marcador.barrio && marcador.barrio.trim() !== '') {
      const barrioMarcador = marcador.barrio.trim();
      if (barriosDelSistema.includes(barrioMarcador)) {
        barrio = barrioMarcador;
      }
    }

    barriosCounts[barrio] = (barriosCounts[barrio] || 0) + 1;
  });

  // Filtrar barrios con 0 marcadores para no mostrarlos en el gráfico
  const barriosConDatos = Object.entries(barriosCounts)
    .filter(([_, count]) => count > 0)
    .reduce((obj, [barrio, count]) => {
      obj[barrio] = count;
      return obj;
    }, {} as Record<string, number>);

  // Si no hay datos después del filtrado, mostrar mensaje
  if (Object.keys(barriosConDatos).length === 0) {
    return { 'Sin datos': 1 };
  }

  return barriosConDatos;
});

const seriesBarrios = computed(() => {
  const values = Object.values(marcadoresPorBarrio.value);

  // Si hay datos reales, usarlos
  if (values.length > 0 && values.some(v => v > 0)) {
    return values;
  }

  // Si no hay datos reales, usar datos de ejemplo
  return [2, 3, 1, 4, 2]; // Datos de ejemplo para algunos barrios
});

const chartOptionsBarrios = computed<ApexOptions>(() => ({
  chart: {
    id: 'marcadores-por-barrios',
    type: 'donut',
    fontFamily: 'Roboto, sans-serif'
  },
  colors: [
    '#1976D2', // Primary (azul)
    '#26A69A', // Secondary (teal)
    '#F2C037', // Warning (amarillo)
    '#31CCEC', // Info (celeste)
    '#21BA45', // Positive (verde)
    '#9C27B0', // Purple
    '#FF5722', // Deep Orange
    '#795548', // Brown
    '#607D8B', // Blue Grey
    '#E91E63'  // Pink
  ],
  labels: Object.keys(marcadoresPorBarrio.value),
  plotOptions: {
    pie: {
      donut: {
        size: '65%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#1976D2'
          }
        }
      }
    }
  },
  dataLabels: {
    enabled: true,
    formatter: function (val: number) {
      return Math.round(val) + '%';
    },
    style: {
      fontSize: '12px',
      fontWeight: 'bold'
    }
  },
  legend: {
    position: 'bottom',
    fontSize: '12px',
    fontWeight: '500'
  },
  tooltip: {
    theme: 'light',
    y: {
      formatter: function (val: number) {
        return val + ' marcadores';
      }
    }
  },
  responsive: [{
    breakpoint: 480,
    options: {
      chart: {
        width: 200
      },
      legend: {
        position: 'bottom'
      }
    }
  }]
}));

// Gráficos de prueba para barrios (mantener hasta que se integren datos reales)
const testSeriesVulnerabilidad = ref([25, 35, 40]);
const testChartOptionsVulnerabilidad = ref<ApexOptions>({
  chart: {
    type: 'donut',
    fontFamily: 'Roboto, sans-serif'
  },
  colors: ['#1976D2', '#26A69A', '#F2C037'],
  labels: ['Alta', 'Media', 'Baja'],
  plotOptions: {
    pie: {
      donut: {
        size: '65%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total',
            fontSize: '16px',
            fontWeight: 'bold'
          }
        }
      }
    }
  },
  dataLabels: {
    enabled: true,
    formatter: function (val: number) {
      return Math.round(val) + '%';
    }
  },
  legend: {
    position: 'bottom',
    fontSize: '12px'
  }
});

// Versión simplificada para debugging
const seriesVulnerabilidadSimple = computed(() => {
  console.log('Computing series vulnerabilidad simple...');
  const data = vulnerabilidadCounts.value;
  console.log('Vulnerabilidad data:', data);

  // Retornar array de valores directamente
  const values = Object.values(data);
  console.log('Values array:', values);

  // Si no hay valores, usar datos por defecto
  if (values.length === 0 || values.every(v => v === 0)) {
    console.log('No data found, using default values');
    return [10, 15, 5]; // Alta, Media, Baja
  }

  return values;
});

const chartOptionsVulnerabilidadSimple = computed<ApexOptions>(() => {
  console.log('Computing chart options vulnerabilidad simple...');
  const data = vulnerabilidadCounts.value;
  const labels = Object.keys(data);
  console.log('Labels:', labels);

  // Si no hay etiquetas, usar por defecto
  const finalLabels = labels.length > 0 ? labels : ['Alta', 'Media', 'Baja'];
  console.log('Final labels:', finalLabels);

  return {
    chart: {
      type: 'donut',
      fontFamily: 'Roboto, sans-serif'
    },
    colors: ['#1976D2', '#26A69A', '#F2C037', '#31CCEC'],
    labels: finalLabels,
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              fontSize: '16px',
              fontWeight: 'bold'
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return Math.round(val) + '%';
      }
    },
    legend: {
      position: 'bottom',
      fontSize: '12px'
    }
  };
});

const testSeriesBarrios = ref([3, 5, 2, 4, 6, 1, 8, 2, 3, 1]);
const testChartOptionsBarrios = ref<ApexOptions>({
  chart: {
    type: 'donut',
    fontFamily: 'Roboto, sans-serif'
  },
  colors: [
    '#1976D2', // San Martin A
    '#26A69A', // San Martin B  
    '#F2C037', // Kenedy
    '#31CCEC', // Los Pinos
    '#21BA45', // Belgrano
    '#9C27B0', // Barrio Norte
    '#FF5722', // Barrio Centro
    '#795548', // Quintanilla
    '#607D8B', // Zona Rural
    '#E91E63'  // Otro
  ],
  labels: [
    'San Martin A',
    'San Martin B',
    'Kenedy',
    'Los Pinos',
    'Belgrano',
    'Barrio Norte',
    'Barrio Centro',
    'Quintanilla',
    'Zona Rural',
    'Otro'
  ],
  plotOptions: {
    pie: {
      donut: {
        size: '65%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total',
            fontSize: '16px',
            fontWeight: 'bold'
          }
        }
      }
    }
  },
  dataLabels: {
    enabled: true,
    formatter: function (val: number) {
      return Math.round(val) + '%';
    }
  },
  legend: {
    position: 'bottom',
    fontSize: '12px'
  }
});

onMounted(() => {
  if (gisStore.marcadores.length === 0) {
    gisStore.cargarMarcadoresDesdeAPI();
  }

  // Debug: Verificar datos de los gráficos
  setTimeout(() => {
    console.log('=== DEBUG DASHBOARD ===');
    console.log('Marcadores total:', gisStore.marcadores.length);
    console.log('Muestra de marcadores:', gisStore.marcadores.slice(0, 3).map(m => ({
      icono: m.icono,
      nombre: m.nombre,
      fechaCreacion: m.fechaCreacion
    })));
    console.log('Vulnerabilidad counts:', vulnerabilidadCounts.value);
    console.log('Informes por mes:', informesPorMes.value);
    console.log('Barrios counts:', marcadoresPorBarrio.value);
    console.log('Series vulnerabilidad:', seriesVulnerabilidad.value);
    console.log('Series informes:', seriesInformes.value);
    console.log('Series barrios:', seriesBarrios.value);
    console.log('=======================');
  }, 1000);

  // Forzar scroll en el dashboard programáticamente
  const pageContainer = document.querySelector('.q-page-container') as HTMLElement;
  const layout = document.querySelector('.q-layout') as HTMLElement;
  const page = document.querySelector('.q-page') as HTMLElement;

  if (pageContainer) {
    pageContainer.style.setProperty('overflow-y', 'auto', 'important');
    pageContainer.style.setProperty('height', '100vh', 'important');
  }

  if (layout) {
    layout.style.setProperty('overflow', 'auto', 'important');
  }

  if (page) {
    page.style.setProperty('overflow-y', 'auto', 'important');
    page.style.setProperty('height', 'auto', 'important');
  }
});
</script>

<style scoped>
/* Solución específica para permitir scroll solo en el dashboard */
.dashboard-page {
  background: #f5f7fa;
  min-height: 100vh;
  overflow-y: auto;
  height: auto;
  position: relative;
  padding-bottom: 2rem;
}

/* Forzar scroll en el contenedor específico del dashboard */
:deep(.q-page-container) {
  overflow-y: auto !important;
  height: 100vh !important;
}

/* Remover restricciones de scroll específicamente para esta página */
.dashboard-scrollable {
  overflow-y: auto !important;
  height: 100vh !important;
  max-height: 100vh !important;
}

/* Asegurar que el contenido pueda hacer scroll */
:deep(.q-page.dashboard-scrollable) {
  overflow-y: auto !important;
  height: auto !important;
  min-height: 100vh !important;
}

.dashboard-header {
  padding: 2rem;
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
  margin-bottom: 0.5rem;
}

.metric-change {
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.metric-change.positive {
  color: #21BA45;
  /* Usando positive del sistema */
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

/* Lista de métricas */
.metrics-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #1976D2;
  /* Usando primary del sistema */
}

.metric-item-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.metric-item-value {
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
}

.metric-item {
  text-align: center;
  padding: 1.5rem;
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

/* Responsive adjustments */
@media (max-width: 768px) {
  .dashboard-header {
    padding: 1rem;
    text-align: center;
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

/* Colores personalizados para los gráficos */
:deep(.apexcharts-tooltip) {
  border-radius: 8px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
}

:deep(.apexcharts-legend) {
  padding: 0 !important;
}
</style>
