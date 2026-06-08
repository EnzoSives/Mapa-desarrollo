<template>
  <div class="historial-anual">
    <!-- Botón para abrir el modal -->
    <q-btn @click="abrirModal" flat round icon="calendar_month" color="deep-purple" size="md">
      <q-tooltip>Historial Anual</q-tooltip>
    </q-btn>

    <!-- Modal principal del historial anual -->
    <q-dialog v-model="modalAbierto" persistent maximized>
      <q-card>
        <!-- Header -->
        <q-card-section class="row items-center q-pb-none bg-deep-purple text-white">
          <div class="text-h6">
            <q-icon name="calendar_month" class="q-mr-sm" />
            Historial Anual - {{ marcador.nombre }} {{ marcador.apellido }}
          </div>
          <q-space />
          <q-btn icon="close" flat round v-close-popup />
        </q-card-section>

        <!-- Contenido -->
        <q-card-section class="q-pa-md">
          <!-- Selector de año y acciones -->
          <div class="row q-gutter-md q-mb-md items-end">
            <div class="col-12 col-md-3">
              <q-select
                v-model="anioSeleccionado"
                :options="aniosOpciones"
                option-label="label"
                option-value="value"
                emit-value
                map-options
                label="Seleccionar año"
                outlined
                dense
                :loading="cargandoAnios"
                @update:model-value="cargarDatosAnio"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-btn
                label="Comparar años"
                color="info"
                icon="compare_arrows"
                outline
                :disable="aniosDisponibles.length < 2"
                @click="mostrarComparacion = true"
              />
            </div>
            <div class="col-12 col-md-3" v-if="puedeAdministrar">
              <q-btn
                label="Cerrar año"
                color="warning"
                icon="lock"
                outline
                @click="confirmarCerrarAnio"
              />
            </div>
          </div>

          <!-- Loading -->
          <div v-if="cargandoDatos" class="text-center q-pa-xl">
            <q-spinner-dots size="40px" color="deep-purple" />
            <p class="q-mt-md">Cargando datos del año...</p>
          </div>

          <!-- Error -->
          <div v-else-if="errorMsg" class="q-pa-md">
            <q-banner class="bg-negative text-white">
              <template v-slot:avatar>
                <q-icon name="error" />
              </template>
              {{ errorMsg }}
            </q-banner>
          </div>

          <!-- Datos del año seleccionado -->
          <div v-else-if="datosAnio">
            <!-- Badge de estado -->
            <q-banner
              :class="datosAnio.esDatoVivo ? 'bg-green-1' : 'bg-orange-1'"
              class="q-mb-md"
              rounded
            >
              <template v-slot:avatar>
                <q-icon
                  :name="datosAnio.esDatoVivo ? 'edit' : 'lock'"
                  :color="datosAnio.esDatoVivo ? 'green' : 'orange'"
                />
              </template>
              <span v-if="datosAnio.esDatoVivo" class="text-green-8">
                <strong>Datos actuales (editables)</strong> - Año en curso
              </span>
              <span v-else class="text-orange-8">
                <strong>Datos congelados (solo lectura)</strong> - Cerrado el
                {{ formatearFecha(datosAnio.fechaCierre) }}
              </span>
            </q-banner>

            <!-- Información del marcador -->
            <div class="row q-col-gutter-md">
              <!-- Info básica -->
              <div class="col-12 col-md-6">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-subtitle1 text-weight-bold text-primary q-mb-md">
                      <q-icon name="person" class="q-mr-sm" />
                      Información Básica
                    </div>
                    <div class="info-grid">
                      <div><strong>Nombre:</strong> {{ datosAnio.marcador.nombre }} {{ datosAnio.marcador.apellido }}</div>
                      <div><strong>DNI:</strong> {{ datosAnio.marcador.dni }}</div>
                      <div><strong>Teléfono:</strong> {{ datosAnio.marcador.telefono || 'N/A' }}</div>
                      <div><strong>Dirección:</strong> {{ datosAnio.marcador.direccion }}</div>
                      <div><strong>Barrio:</strong> {{ datosAnio.marcador.barrio }}</div>
                      <div><strong>Tiempo residencia:</strong> {{ datosAnio.marcador.tiempo_residencia || 'N/A' }}</div>
                      <div v-if="datosAnio.marcador.notas"><strong>Notas:</strong> {{ datosAnio.marcador.notas }}</div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Programas -->
              <div class="col-12 col-md-6">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-subtitle1 text-weight-bold text-primary q-mb-md">
                      <q-icon name="assignment" class="q-mr-sm" />
                      Programas ({{ datosAnio.marcador.programas?.length || 0 }})
                    </div>
                    <div v-if="datosAnio.marcador.programas?.length">
                      <q-list separator dense>
                        <q-item v-for="(programa, idx) in datosAnio.marcador.programas" :key="idx">
                          <q-item-section>
                            <q-item-label>{{ programa.ayuda || programa.tipo }}</q-item-label>
                            <q-item-label caption>
                              Tipo: {{ programa.tipo }}
                              <span v-if="programa.mes"> | Mes: {{ programa.mes }}</span>
                              <span v-if="programa.cantidad"> | Cant: {{ programa.cantidad }}</span>
                            </q-item-label>
                          </q-item-section>
                          <q-item-section side>
                            <q-badge :color="programa.estado === 'activo' ? 'green' : 'grey'">
                              {{ programa.estado }}
                            </q-badge>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </div>
                    <div v-else class="text-grey">Sin programas</div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Integrantes -->
              <div class="col-12 col-md-6">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-subtitle1 text-weight-bold text-primary q-mb-md">
                      <q-icon name="group" class="q-mr-sm" />
                      Integrantes ({{ datosAnio.marcador.integrantes?.length || 0 }})
                    </div>
                    <div v-if="datosAnio.marcador.integrantes?.length">
                      <q-list separator dense>
                        <q-item v-for="(integrante, idx) in datosAnio.marcador.integrantes" :key="idx">
                          <q-item-section>
                            <q-item-label>{{ integrante.nombre }} {{ integrante.apellido }}</q-item-label>
                            <q-item-label caption>
                              DNI: {{ integrante.dni }} | Edad: {{ integrante.edad }} | {{ integrante.vinculo }}
                            </q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </div>
                    <div v-else class="text-grey">Sin integrantes</div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Servicios -->
              <div class="col-12 col-md-6">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-subtitle1 text-weight-bold text-primary q-mb-md">
                      <q-icon name="electrical_services" class="q-mr-sm" />
                      Servicios ({{ datosAnio.marcador.servicios?.length || 0 }})
                    </div>
                    <div v-if="datosAnio.marcador.servicios?.length">
                      <q-list separator dense>
                        <q-item v-for="(servicio, idx) in datosAnio.marcador.servicios" :key="idx">
                          <q-item-section>
                            <q-item-label>{{ servicio.nombre }}</q-item-label>
                          </q-item-section>
                          <q-item-section side>
                            <q-badge color="primary">{{ servicio.opcion_servicio }}</q-badge>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </div>
                    <div v-else class="text-grey">Sin servicios</div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Vivienda -->
              <div class="col-12 col-md-6" v-if="datosAnio.marcador.viviendas?.length">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-subtitle1 text-weight-bold text-primary q-mb-md">
                      <q-icon name="home" class="q-mr-sm" />
                      Vivienda
                    </div>
                    <div v-for="(vivienda, idx) in datosAnio.marcador.viviendas" :key="idx" class="q-mb-sm">
                      <div><strong>{{ vivienda.tipo }}</strong> • {{ vivienda.dominio }}</div>
                      <div class="text-caption text-grey">
                        {{ vivienda.ambientes }} | Baño: {{ vivienda.baño }}
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Ocupaciones -->
              <div class="col-12 col-md-6" v-if="datosAnio.marcador.ocupaciones?.length">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-subtitle1 text-weight-bold text-primary q-mb-md">
                      <q-icon name="work" class="q-mr-sm" />
                      Ocupaciones
                    </div>
                    <div v-for="(ocupacion, idx) in datosAnio.marcador.ocupaciones" :key="idx" class="q-mb-sm">
                      <div><strong>{{ ocupacion.tipo_principal }}</strong></div>
                      <div class="text-caption text-grey">
                        {{ ocupacion.tipo_1 }} {{ ocupacion.tipo_2 ? '• ' + ocupacion.tipo_2 : '' }}
                        <span v-if="ocupacion.ingresos"> | ${{ ocupacion.ingresos.toLocaleString() }}</span>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Salud -->
              <div class="col-12 col-md-6" v-if="datosAnio.marcador.salud?.length">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-subtitle1 text-weight-bold text-primary q-mb-md">
                      <q-icon name="medical_services" class="q-mr-sm" />
                      Salud
                    </div>
                    <div v-for="(saludItem, idx) in datosAnio.marcador.salud" :key="idx" class="q-mb-sm">
                      <div v-if="saludItem.problema_salud">{{ saludItem.problema_salud }}</div>
                      <div>
                        <q-badge v-if="saludItem.cud" color="purple" class="q-mr-xs">CUD</q-badge>
                        <q-badge v-if="saludItem.obra_social" color="green">Obra Social</q-badge>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Estudios -->
              <div class="col-12 col-md-6" v-if="datosAnio.marcador.estudios?.length">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-subtitle1 text-weight-bold text-primary q-mb-md">
                      <q-icon name="school" class="q-mr-sm" />
                      Estudios
                    </div>
                    <div v-for="(estudio, idx) in datosAnio.marcador.estudios" :key="idx" class="q-mb-xs">
                      {{ estudio.nivel }}
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </div>

          <!-- Sin datos -->
          <div v-else class="text-center q-pa-xl text-grey">
            <q-icon name="calendar_today" size="48px" class="q-mb-md" />
            <p>Seleccione un año para ver los datos del marcador en ese período.</p>
          </div>
        </q-card-section>

        <!-- Footer -->
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog de comparación -->
    <q-dialog v-model="mostrarComparacion" persistent>
      <q-card style="min-width: 90vw; max-width: 1200px; max-height: 90vh; overflow-y: auto;">
        <q-card-section class="row items-center q-pb-none bg-info text-white">
          <div class="text-h6">
            <q-icon name="compare_arrows" class="q-mr-sm" />
            Comparar años
          </div>
          <q-space />
          <q-btn icon="close" flat round v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <!-- Selectores de año para comparar -->
          <div class="row q-gutter-md q-mb-lg items-end">
            <div class="col-12 col-md-3">
              <q-select
                v-model="anioComparar1"
                :options="aniosDisponibles"
                label="Año 1"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-md-3">
              <q-select
                v-model="anioComparar2"
                :options="aniosDisponibles"
                label="Año 2"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-md-3">
              <q-btn
                label="Comparar"
                color="info"
                icon="compare_arrows"
                :disable="!anioComparar1 || !anioComparar2 || anioComparar1 === anioComparar2"
                :loading="cargandoComparacion"
                @click="ejecutarComparacion"
              />
            </div>
          </div>

          <!-- Loading comparación -->
          <div v-if="cargandoComparacion" class="text-center q-pa-xl">
            <q-spinner-dots size="40px" color="info" />
            <p class="q-mt-md">Comparando datos...</p>
          </div>

          <!-- Resultado de comparación -->
          <div v-else-if="comparacion">
            <!-- Sin diferencias -->
            <q-banner v-if="!Object.keys(comparacion.diferencias).length" class="bg-green-1 q-mb-md" rounded>
              <template v-slot:avatar>
                <q-icon name="check_circle" color="green" />
              </template>
              <span class="text-green-8">No hay diferencias entre {{ anioComparar1 }} y {{ anioComparar2 }}.</span>
            </q-banner>

            <!-- Con diferencias -->
            <div v-else>
              <q-banner class="bg-orange-1 q-mb-md" rounded>
                <template v-slot:avatar>
                  <q-icon name="difference" color="orange" />
                </template>
                <span class="text-orange-8">
                  Se encontraron <strong>{{ Object.keys(comparacion.diferencias).length }}</strong> diferencias
                  entre {{ anioComparar1 }} y {{ anioComparar2 }}.
                </span>
              </q-banner>

              <q-table
                :rows="diferenciasTabla"
                :columns="columnasComparacion"
                row-key="campo"
                flat
                bordered
                :pagination="{ rowsPerPage: 20 }"
              >
                <template v-slot:body-cell-campo="props">
                  <q-td :props="props">
                    <strong>{{ formatearNombreCampo(props.value) }}</strong>
                  </q-td>
                </template>
                <template v-slot:body-cell-valor1="props">
                  <q-td :props="props">
                    <span class="text-red-6">{{ props.value || 'N/A' }}</span>
                  </q-td>
                </template>
                <template v-slot:body-cell-valor2="props">
                  <q-td :props="props">
                    <span class="text-green-8">{{ props.value || 'N/A' }}</span>
                  </q-td>
                </template>
              </q-table>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog de cerrar año -->
    <q-dialog v-model="mostrarCerrarAnio">
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center bg-warning text-white">
          <q-icon name="warning" size="md" class="q-mr-sm" />
          <div class="text-h6">Confirmar cierre de año</div>
        </q-card-section>

        <q-card-section class="q-pa-md">
          <p class="text-body1">
            ¿Está seguro que desea cerrar el año <strong>{{ anioCerrar }}</strong>
            para este marcador?
          </p>
          <p class="text-caption text-grey">
            Esto creará un snapshot de los datos actuales. Si ya existe un snapshot
            para este año, se actualizará.
          </p>

          <q-separator class="q-my-md" />

          <div class="row q-gutter-md items-end">
            <div class="col">
              <q-input
                v-model.number="anioCerrar"
                label="Año a cerrar"
                type="number"
                outlined
                dense
              />
            </div>
          </div>

          <q-checkbox
            v-model="cerrarMasivo"
            label="Cerrar para TODOS los marcadores (masivo)"
            class="q-mt-md"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn
            label="Confirmar cierre"
            color="warning"
            text-color="white"
            icon="lock"
            :loading="cargandoCierre"
            @click="ejecutarCerrarAnio"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useGisStore } from 'src/stores/gisStore';
import type { DatosAnuales, DiferenciaAnual } from 'src/stores/gisStore';

const props = defineProps<{
  idMarcador: number;
  marcador: { nombre: string; apellido: string };
}>();

const $q = useQuasar();
const gisStore = useGisStore();

// Estado
const modalAbierto = ref(false);
const anioSeleccionado = ref<number | null>(null);
const cargandoAnios = ref(false);
const cargandoDatos = ref(false);
const errorMsg = ref<string | null>(null);
const datosAnio = ref<DatosAnuales | null>(null);

// Comparación
const mostrarComparacion = ref(false);
const anioComparar1 = ref<number | null>(null);
const anioComparar2 = ref<number | null>(null);
const cargandoComparacion = ref(false);
const comparacion = ref<DiferenciaAnual | null>(null);

// Cerrar año
const mostrarCerrarAnio = ref(false);
const anioCerrar = ref<number>(new Date().getFullYear() - 1);
const cerrarMasivo = ref(false);
const cargandoCierre = ref(false);

// Permisos
const rol = ref(localStorage.getItem('rol') || 'Visor');
const puedeAdministrar = computed(() => {
  return rol.value === 'superadmin' || rol.value === 'admin';
});

// Años disponibles
const aniosDisponibles = computed(() => gisStore.aniosDisponibles);
const aniosOpciones = computed(() => {
  return aniosDisponibles.value.map((anio) => ({
    label: anio === new Date().getFullYear() ? `${anio} (actual)` : `${anio}`,
    value: anio,
  }));
});

// Columnas para comparación
const columnasComparacion = computed(() => [
  { name: 'campo', label: 'Campo', align: 'left' as const, field: 'campo' },
  { name: 'valor1', label: `Año ${anioComparar1.value}`, align: 'left' as const, field: 'valor1' },
  { name: 'valor2', label: `Año ${anioComparar2.value}`, align: 'left' as const, field: 'valor2' },
]);

const diferenciasTabla = computed(() => {
  if (!comparacion.value?.diferencias) return [];
  return Object.entries(comparacion.value.diferencias).map(([campo, valores]) => ({
    campo,
    valor1: valores[`anio_${anioComparar1.value}`] || 'N/A',
    valor2: valores[`anio_${anioComparar2.value}`] || 'N/A',
  }));
});

// Métodos
async function abrirModal() {
  modalAbierto.value = true;
  await cargarAnios();
}

async function cargarAnios() {
  cargandoAnios.value = true;
  try {
    await gisStore.cargarAniosDisponibles(props.idMarcador);
    if (aniosDisponibles.value.length > 0 && !anioSeleccionado.value) {
      anioSeleccionado.value = aniosDisponibles.value[0];
      await cargarDatosAnio();
    }
  } catch (e) {
    errorMsg.value = 'Error al cargar los años disponibles';
  } finally {
    cargandoAnios.value = false;
  }
}

async function cargarDatosAnio() {
  if (!anioSeleccionado.value) return;
  cargandoDatos.value = true;
  errorMsg.value = null;
  try {
    const data = await gisStore.cargarDatosAnuales(props.idMarcador, anioSeleccionado.value);
    datosAnio.value = data;
  } catch (e) {
    errorMsg.value = 'No hay datos disponibles para este año';
    datosAnio.value = null;
  } finally {
    cargandoDatos.value = false;
  }
}

async function ejecutarComparacion() {
  if (!anioComparar1.value || !anioComparar2.value) return;
  cargandoComparacion.value = true;
  comparacion.value = null;
  try {
    const data = await gisStore.compararAnios(
      props.idMarcador,
      anioComparar1.value,
      anioComparar2.value
    );
    comparacion.value = data;
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: 'Error al comparar los años',
      position: 'top',
    });
  } finally {
    cargandoComparacion.value = false;
  }
}

function confirmarCerrarAnio() {
  mostrarCerrarAnio.value = true;
}

async function ejecutarCerrarAnio() {
  cargandoCierre.value = true;
  try {
    if (cerrarMasivo.value) {
      const result = await gisStore.cerrarAnioMasivo(anioCerrar.value);
      $q.notify({
        type: 'positive',
        message: `Año ${anioCerrar.value} cerrado para ${result.procesados} de ${result.total} marcadores`,
        position: 'top',
      });
    } else {
      await gisStore.cerrarAnioMarcador(props.idMarcador, anioCerrar.value);
      $q.notify({
        type: 'positive',
        message: `Año ${anioCerrar.value} cerrado correctamente`,
        position: 'top',
      });
    }
    mostrarCerrarAnio.value = false;
    // Recargar años disponibles
    await cargarAnios();
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: 'Error al cerrar el año',
      position: 'top',
    });
  } finally {
    cargandoCierre.value = false;
  }
}

function formatearFecha(fecha: string | undefined) {
  if (!fecha) return 'N/A';
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatearNombreCampo(campo: string) {
  const nombres: Record<string, string> = {
    nombre: 'Nombre',
    apellido: 'Apellido',
    direccion: 'Dirección',
    telefono: 'Teléfono',
    dni: 'DNI',
    barrio: 'Barrio',
    tiempo_residencia: 'Tiempo de residencia',
    notas: 'Notas',
    icono: 'Ícono',
  };
  return nombres[campo] || campo;
}
</script>

<style scoped>
.info-grid {
  display: grid;
  gap: 8px;
}

.info-grid div {
  padding: 4px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
</style>
