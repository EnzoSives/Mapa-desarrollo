<template>
  <q-page class="q-pa-md">
    <!-- Título, filtro programa y buscador -->
    <div class="q-mb-md">
      <div class="row items-end q-col-gutter-md">
        <!-- Título -->
        <div class="col-12 col-md-4">
          <h4 class="text-h5 q-mb-sm">Lista de Marcadores</h4>
        </div>

        <!-- Filtro por programa -->
        <div class="col-12 col-md-4">
          <q-select v-model="filtroPrograma" :options="opcionesProgramas" outlined dense clearable
            label="Filtrar por tipo de programa" placeholder="Tipo de programa" emit-value map-options
            class="full-width">
            <template v-slot:prepend>
              <q-icon name="filter_list" />
            </template>
          </q-select>
        </div>

        <!-- Buscador y botón imprimir -->
        <div class="col-12 col-md-4">
          <div class="row items-center q-gutter-sm">
            <q-input v-model="filtro" outlined dense debounce="300" clearable
              placeholder="Buscar por nombre, dirección, teléfono..." class="col">
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>

            <q-btn color="primary" icon="print" @click="generarPDF" :disable="marcadoresFiltrados.length === 0" dense
              round>
              <q-tooltip>Imprimir resultados filtrados</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>
    </div>


    <q-table :rows="marcadoresFiltrados" :columns="columnsQuasar" :loading="loading" row-key="dni"
      class="full-width custom-table cursor-pointer" bordered :rows-per-page-options="[10, 25, 50, 100]"
      :pagination="{ rowsPerPage: 10 }" @row-click="abrirModalInfo" virtual-scroll color="primary">
      <template #body-cell-icono="props">
        <q-td :props="props">
          <img v-if="props.value" :src="props.value" width="24" height="24" alt="icono" style="object-fit: contain" />
        </q-td>
      </template>

      <template #body-cell-mapa="props">
        <q-td :props="props">
          <q-btn flat dense icon="place" @click.stop="centrarEnMapa(props.row.latitud, props.row.longitud)"
            :disable="!props.row.latitud || !props.row.longitud" />
        </q-td>
      </template>

      <template #body-cell-acciones="props">
        <q-td :props="props">
          <q-btn flat dense icon="info" @click.stop="abrirModalInfo(null, props.row)" color="primary" size="sm">
            <q-tooltip>Ver información</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- Modal de información mejorado visualmente -->
    <q-dialog v-model="mostrarModal" persistent>
      <q-card v-if="marcadorSeleccionado" class="info-panel q-mx-auto"
        style="min-width: 350px; max-width: 500px; border-radius: 12px;">
        <q-card-section class="row items-center q-pb-none justify-end"
          style="position: absolute; top: 0; right: 0; z-index: 2;">
          <q-btn icon="close" round @click="cerrarModal" />
        </q-card-section>

        <!-- Encabezado simple -->
        <q-card-section class="q-pa-md">
          <div class="row items-center no-wrap">
            <q-avatar v-if="marcadorSeleccionado.icono" size="44px" class="q-mr-md">
              <img :src="marcadorSeleccionado.icono" alt="Ícono" />
            </q-avatar>
            <div class="col">
              <div class="text-h6 text-weight-medium">
                {{ marcadorSeleccionado.nombreApellido }}
              </div>
              <div class="text-caption text-grey">
                {{ marcadorSeleccionado.direccion }}
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
              <div class="text-body2">{{ marcadorSeleccionado.telefono || 'N/A' }}</div>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey">DNI</div>
              <div class="text-body2">{{ marcadorSeleccionado.dni }}</div>
            </div>
          </div>

          <!-- Integrantes compactos -->
          <div class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">Integrantes</div>
            <div v-if="marcadorSeleccionado.integrantes?.length">
              <div v-for="(integrante, index) in marcadorSeleccionado.integrantes" :key="index"
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

          <!-- Programas simples -->
          <div class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">Programas</div>
            <div v-if="marcadorSeleccionado.programas?.length">
              <div v-for="(programa, index) in marcadorSeleccionado.programas" :key="index" class="text-body2 q-mb-xs">
                • {{ programa.tipo }}: {{ programa.ayuda }}
              </div>
            </div>
            <div v-else class="text-caption text-grey">Ninguno</div>
          </div>

          <!-- Notas simples -->
          <div v-if="marcadorSeleccionado.notas">
            <div class="text-subtitle2 q-mb-sm">Notas</div>
            <div class="text-body2">{{ marcadorSeleccionado.notas }}</div>
          </div>
        </q-card-section>

        <!-- Acciones minimalistas -->
        <!-- <q-separator />
        <q-card-actions class="q-pa-sm justify-end">
          <q-btn outline color="primary" label="Cerrar" @click="cerrarModal" size="md" />
        </q-card-actions> -->
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { useGisStore } from 'src/stores/gisStore';
import { onMounted, computed, ref } from 'vue';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const gisStore = useGisStore();
const loading = ref(false);
const filtro = ref('');
const filtroPrograma = ref(''); // Nuevo filtro por tipo de programa
const mostrarModal = ref(false);

interface Integrante {
  nombre: string;
  apellido: string;
  edad: number;
  dni: string;
}
interface Programa {
  tipo: string;
  ayuda: string;
}

interface Marcador {
  nombreApellido: string;
  direccion: string;
  telefono: string;
  dni: string;
  notas?: string;
  ayudas?: string[] | string;
  icono?: string;
  latitud?: number;
  longitud?: number;
  integrantes?: Integrante[];
  programas?: Programa[];
  [key: string]: any;
}

const marcadorSeleccionado = ref<Marcador | null>(null);
const rol = ref(localStorage.getItem('rol') || 'visor');

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

// Computed para obtener todos los tipos de programas únicos
const opcionesProgramas = computed(() => {
  const tipos = new Set<string>();

  marcadoresLimpios.value.forEach(marcador => {
    if (marcador.programas && Array.isArray(marcador.programas)) {
      marcador.programas.forEach((programa: Programa) => {
        if (programa.tipo) {
          tipos.add(programa.tipo);
        }
      });
    }
  });

  return Array.from(tipos).sort().map(tipo => ({
    label: tipo,
    value: tipo
  }));
});

// Función para limpiar objetos
function limpiarObjeto(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => limpiarObjeto(item));
  }

  const objetoLimpio: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof key === 'symbol' || key.startsWith('_')) {
      continue;
    }

    if (typeof value === 'object' && value !== null) {
      if (value.constructor === Object || Array.isArray(value)) {
        objetoLimpio[key] = limpiarObjeto(value);
      } else {
        objetoLimpio[key] = String(value);
      }
    } else {
      objetoLimpio[key] = value;
    }
  }

  return objetoLimpio;
}

// Computed property para datos filtrados - VERSIÓN CON FILTRO DE PROGRAMA
const marcadoresFiltrados = computed(() => {
  let marcadores = marcadoresLimpios.value;

  // Aplicar filtro de texto
  if (filtro.value?.trim()) {
    const busqueda = filtro.value.toLowerCase().trim();

    marcadores = marcadores.filter((marcador) => {
      const campos = [
        marcador.nombreApellido,
        marcador.direccion,
        marcador.telefono,
        marcador.dni,
        marcador.notas,
        marcador.ayudas,
      ];

      return campos.some((campo) => {
        if (campo === null || campo === undefined) return false;
        return String(campo).toLowerCase().includes(busqueda);
      });
    });
  }

  // Aplicar filtro por tipo de programa
  if (filtroPrograma.value) {
    marcadores = marcadores.filter((marcador) => {
      if (!marcador.programas || !Array.isArray(marcador.programas)) {
        return false;
      }

      return marcador.programas.some((programa: Programa) =>
        programa.tipo === filtroPrograma.value
      );
    });
  }

  return marcadores;
});

const marcadoresLimpios = computed(() => {
  if (!gisStore.marcadores || gisStore.marcadores.length === 0) {
    return [];
  }

  return gisStore.marcadores.map((marcador) => {
    const marcadorLimpio = limpiarObjeto(marcador);

    return {
      nombreApellido: marcadorLimpio.nombreApellido || '',
      direccion: marcadorLimpio.direccion || '',
      telefono: marcadorLimpio.telefono || '',
      dni: marcadorLimpio.dni || '',
      notas: marcadorLimpio.notas || '',
      ayudas: marcadorLimpio.ayudas || '',
      icono: marcadorLimpio.icono || '',
      latitud: marcadorLimpio.latitud || 0,
      longitud: marcadorLimpio.longitud || 0,
      integrantes: marcadorLimpio.integrantes || [],
      programas: marcadorLimpio.programas || [],
      ...marcadorLimpio,
    };
  });
});

const columnsQuasar = [
  {
    name: 'nombreApellido',
    label: 'Nombre',
    field: 'nombreApellido',
    align: 'left' as const,
    sortable: true
  },
  { name: 'direccion', label: 'Dirección', field: 'direccion', align: 'left' as const, sortable: true },
  { name: 'telefono', label: 'Teléfono', field: 'telefono', align: 'left' as const, sortable: true },
  { name: 'dni', label: 'DNI', field: 'dni', align: 'left' as const, sortable: true },
  { name: 'notas', label: 'Notas', field: 'notas', align: 'left' as const, sortable: true },
  // { name: 'programas', label: 'Ayudas', field: 'ayudas', align: 'left' as const },
  { name: 'icono', label: 'Ícono', field: 'icono', align: 'center' as const },
  // { name: 'mapa', label: 'Ver en mapa', field: '', align: 'center' as const },
  // { name: 'acciones', label: 'Acciones', field: '', align: 'center' as const },
];

// Función para abrir el modal con la información
function abrirModalInfo(evt: any, row: any) {
  // Si se pasa el row directamente (desde el botón), usarlo
  // Si viene del evento de click en la fila, usar evt.row
  const marcador = row || evt?.row;

  if (marcador) {
    marcadorSeleccionado.value = marcador;
    mostrarModal.value = true;
  }
}

// Función para cerrar el modal
function cerrarModal() {
  mostrarModal.value = false;
  marcadorSeleccionado.value = null;
}

// Función para ver en mapa
function verEnMapa() {
  if (
    marcadorSeleccionado.value?.latitud &&
    marcadorSeleccionado.value?.longitud
  ) {
    centrarEnMapa(
      marcadorSeleccionado.value.latitud,
      marcadorSeleccionado.value.longitud
    );
    cerrarModal();
  }
}

function centrarEnMapa(lat: number, lon: number) {
  console.log('Centrando en:', lat, lon);
  if (lat && lon) {
    gisStore.coordenadasSeleccionadas = [lon, lat];
    gisStore.panelActivo = 'mapa';
  }
}

// Función para generar PDF con los resultados filtrados
function generarPDF() {
  const doc = new jsPDF();

  // Configurar título
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Lista de Marcadores', 14, 22);

  // Agregar información del filtro
  let yPosition = 32;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  if (filtro.value) {
    doc.text(`Filtro de búsqueda: ${filtro.value}`, 14, yPosition);
    yPosition += 6;
  }

  if (filtroPrograma.value) {
    doc.text(`Tipo de programa: ${filtroPrograma.value}`, 14, yPosition);
    yPosition += 6;
  }

  doc.text(`Total de registros: ${marcadoresFiltrados.value.length}`, 14, yPosition);
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 14, yPosition + 6);

  // Preparar datos para la tabla
  const headers = [
    'Nombre',
    'Dirección',
    'Teléfono',
    'DNI',
    'Programas',
    'Notas'
  ];

  const data = marcadoresFiltrados.value.map(marcador => [
    marcador.nombreApellido || '',
    marcador.direccion || '',
    marcador.telefono || '',
    marcador.dni || '',
    marcador.programas?.map((p: Programa) => `${p.tipo}: ${p.ayuda}`).join(', ') || 'Ninguno',
    marcador.notas || ''
  ]);

  // Generar tabla usando autoTable
  autoTable(doc, {
    head: [headers],
    body: data,
    startY: yPosition + 16,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [63, 81, 181],
      textColor: 255,
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 30 }, // Nombre
      1: { cellWidth: 35 }, // Dirección
      2: { cellWidth: 25 }, // Teléfono
      3: { cellWidth: 20 }, // DNI
      4: { cellWidth: 45 }, // Programas
      5: { cellWidth: 35 }  // Notas
    },
    margin: { left: 14, right: 14 },
    pageBreak: 'auto',
    showHead: 'everyPage'
  });

  // Guardar el PDF
  // const fileName = `marcadores_${filtroPrograma.value ? filtroPrograma.value + '_' : ''}${new Date().toISOString().split('T')[0]}.pdf`;
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

}

// Funciones para editar y eliminar (debes implementar según tu lógica)
function editarMarcadorSeleccionado() {
  console.log('Editar marcador:', marcadorSeleccionado.value);
  // Implementa tu lógica de edición aquí
  // Por ejemplo: abrir otro modal de edición o navegar a otra página
  cerrarModal();
}

function eliminarMarcadorSeleccionado() {
  console.log('Eliminar marcador:', marcadorSeleccionado.value);
  // Implementa tu lógica de eliminación aquí
  // Por ejemplo: mostrar confirmación y luego eliminar
  cerrarModal();
}

onMounted(async () => {
  try {
    loading.value = true;
    if (gisStore.marcadores.length === 0) {
      await gisStore.cargarMarcadoresDesdeAPI();
    }
  } catch (error) {
    console.error('Error cargando marcadores:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.custom-table {
  max-height: calc(100vh - 200px);
  overflow-y: hidden;
}

.cursor-pointer tbody tr {
  cursor: pointer;
}

.cursor-pointer tbody tr:hover {
  background-color: rgba(141, 141, 141, 0.936);
}

.info-panel {
  max-height: 80vh;
  overflow-y: auto;
}
</style>