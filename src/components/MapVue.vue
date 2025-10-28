<template>
  <q-page class="full-height no-scroll">
    <div ref="mapContainer" class="mapa">
      <InfoCard />
    </div>

    <InfoCard />

    <div
      v-if="tooltipVisible"
      class="tooltip-marcador"
      :style="{
        left: tooltipPosition.x + 'px',
        top: tooltipPosition.y + 'px',
      }"
    >
      {{ tooltipContent }}
    </div>

    <div id="area-imprimir">
      <q-card
        v-if="gisStore.marcadorSeleccionado"
        class="info-panel q-mx-auto"
        style="
          min-width: 400px;
          max-width: 500px;
          border-radius: 12px;
          max-height: 85vh;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        "
      >
        <div
          style="
            flex: 1;
            overflow-y: auto;
            scrollbar-width: none;
            scrollbar-color: #888 #f0f0f0;
          "
        >
          <q-card-section class="q-pa-md relative-position">
            <q-btn
              icon="close"
              flat
              round
              dense
              class="absolute-top-right q-ma-sm"
              style="z-index: 2"
              @click="gisStore.cerrarInfo"
            />

            <div class="row items-center no-wrap">
              <q-avatar
                v-if="gisStore.marcadorSeleccionado.icono"
                size="44px"
                class="q-mr-md"
              >
                <img :src="gisStore.marcadorSeleccionado.icono" alt="Ícono" />
              </q-avatar>
              <div class="col">
                <div class="text-h6 text-weight-medium">
                  {{ gisStore.marcadorSeleccionado.nombre }}
                  {{ gisStore.marcadorSeleccionado.apellido }}
                </div>
                <div class="text-caption text-grey">
                  Creado:
                  {{
                    new Date(
                      gisStore.marcadorSeleccionado.fechaCreacion
                    ).toLocaleDateString()
                  }}
                </div>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section class="q-pa-md">
            <div
              class="text-subtitle1 text-weight-medium q-mb-md flex items-center"
            >
              <q-icon name="person" class="q-mr-xs" />
              Información Básica
            </div>

            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-6">
                <div class="text-caption text-grey">Nombre</div>
                <div class="text-body2">
                  {{ gisStore.marcadorSeleccionado.nombre || 'N/A' }}
                </div>
              </div>
              <div class="col-6">
                <div class="text-caption text-grey">Apellido</div>
                <div class="text-body2">
                  {{ gisStore.marcadorSeleccionado.apellido || 'N/A' }}
                </div>
              </div>
            </div>

            <div class="q-mb-md">
              <div class="text-caption text-grey">DNI</div>
              <div class="text-body2">
                {{ gisStore.marcadorSeleccionado.dni || 'N/A' }}
              </div>
            </div>

            <div class="q-mb-md">
              <div class="text-caption text-grey">Domicilio</div>
              <div class="text-body2">
                {{ gisStore.marcadorSeleccionado.direccion || 'N/A' }}
              </div>
            </div>

            <div class="q-mb-md">
              <div class="text-caption text-grey">Teléfono</div>
              <div class="text-body2">
                {{ gisStore.marcadorSeleccionado.telefono || 'N/A' }}
              </div>
            </div>

            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-6">
                <div class="text-caption text-grey">Barrio</div>
                <div class="text-body2">
                  {{ gisStore.marcadorSeleccionado.barrio || 'N/A' }}
                </div>
              </div>
              <div class="col-6">
                <div class="text-caption text-grey">Tiempo de Residencia</div>
                <div class="text-body2">
                  {{ gisStore.marcadorSeleccionado.tiempo_residencia || 'N/A' }}
                </div>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section
            v-if="gisStore.marcadorSeleccionado.estudios?.length"
            class="q-pa-md"
          >
            <div
              class="text-subtitle1 text-weight-medium q-mb-md flex items-center"
            >
              <q-icon name="school" class="q-mr-xs" />
              Nivel de Estudios
              <q-chip
                :label="gisStore.marcadorSeleccionado.estudios.length"
                color="blue"
                text-color="white"
                size="sm"
                class="q-ml-sm"
              />
            </div>
            <div
              v-for="(estudio, index) in gisStore.marcadorSeleccionado.estudios"
              :key="index"
              class="text-body2 q-mb-xs q-pa-sm rounded-borders"
              :class="$q.dark.isActive ? 'bg-blue-9' : 'bg-blue-1'"
            >
              {{ estudio.nivel }}
            </div>
          </q-card-section>

          <q-separator v-if="gisStore.marcadorSeleccionado.estudios?.length" />

          <q-card-section
            v-if="gisStore.marcadorSeleccionado.salud?.length"
            class="q-pa-md"
          >
            <div
              class="text-subtitle1 text-weight-medium q-mb-md flex items-center"
            >
              <q-icon name="medical_services" class="q-mr-xs" />
              Información de Salud
              <q-chip
                :label="gisStore.marcadorSeleccionado.salud.length"
                color="red"
                text-color="white"
                size="sm"
                class="q-ml-sm"
              />
            </div>
            <div
              v-for="(saludItem, index) in gisStore.marcadorSeleccionado.salud"
              :key="index"
              class="q-mb-xs q-pa-sm rounded-borders"
              :class="$q.dark.isActive ? 'bg-red-9' : 'bg-red-1'"
            >
              <div class="row items-center">
                <div class="col">
                  <div
                    v-if="saludItem.problema_salud"
                    class="text-body2"
                    style="
                      word-break: break-word;
                      white-space: pre-line;
                      max-width: 100%;
                    "
                  >
                    {{ saludItem.problema_salud }}
                  </div>
                  <div class="q-mt-xs">
                    <q-badge
                      v-if="saludItem.cud"
                      color="purple"
                      text-color="white"
                      class="q-mr-xs"
                      >CUD</q-badge
                    >
                    <q-badge
                      v-if="saludItem.obra_social"
                      color="green"
                      text-color="white"
                      >Obra Social</q-badge
                    >
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-separator v-if="gisStore.marcadorSeleccionado.salud?.length" />

          <q-card-section
            v-if="gisStore.marcadorSeleccionado.viviendas?.length"
            class="q-pa-md"
          >
            <div
              class="text-subtitle1 text-weight-medium q-mb-md flex items-center"
            >
              <q-icon name="home" class="q-mr-xs" />
              Vivienda
              <q-chip
                :label="gisStore.marcadorSeleccionado.viviendas.length"
                color="teal"
                text-color="white"
                size="sm"
                class="q-ml-sm"
              />
            </div>
            <div
              v-for="(vivienda, index) in gisStore.marcadorSeleccionado
                .viviendas"
              :key="index"
              class="q-mb-xs q-pa-sm rounded-borders"
              :class="$q.dark.isActive ? 'bg-teal-9' : 'bg-teal-1'"
            >
              <div class="text-body2">
                <strong>{{ vivienda.tipo }}</strong> • {{ vivienda.dominio }}
              </div>
              <div class="text-caption text-grey">
                <span v-if="vivienda.ambientes"
                  >{{ vivienda.ambientes }} ambientes</span
                >
                <span v-if="vivienda.ambientes && vivienda.baño"> • </span>
                <span v-if="vivienda.baño">Baño {{ vivienda.baño }}</span>
                <span v-if="vivienda.baño_opcion">
                  ({{ vivienda.baño_opcion }})
                </span>
              </div>
            </div>
          </q-card-section>

          <q-separator v-if="gisStore.marcadorSeleccionado.viviendas?.length" />

          <q-card-section
            v-if="gisStore.marcadorSeleccionado.ocupaciones?.length"
            class="q-pa-md"
          >
            <div
              class="text-subtitle1 text-weight-medium q-mb-md flex items-center"
            >
              <q-icon name="work" class="q-mr-xs" />
              Ocupación
              <q-chip
                :label="gisStore.marcadorSeleccionado.ocupaciones.length"
                color="orange"
                text-color="white"
                size="sm"
                class="q-ml-sm"
              />
            </div>
            <div
              v-for="(ocupacion, index) in gisStore.marcadorSeleccionado
                .ocupaciones"
              :key="index"
              class="q-mb-xs q-pa-sm rounded-borders"
              :class="$q.dark.isActive ? 'bg-orange-9' : 'bg-orange-1'"
            >
              <div class="text-body2 text-weight-medium">
                {{ ocupacion.nombre || ocupacion.tipo_principal }}
              </div>
              <div class="text-caption text-grey">
                <span v-if="ocupacion.tipo_1">{{ ocupacion.tipo_1 }}</span>
                <span v-if="ocupacion.tipo_1 && ocupacion.tipo_2"> • </span>
                <span v-if="ocupacion.tipo_2">{{ ocupacion.tipo_2 }}</span>
              </div>
              <div
                v-if="ocupacion.ingresos"
                class="text-caption text-green text-weight-medium"
              >
                Ingresos: ${{ ocupacion.ingresos.toLocaleString() }}
              </div>
            </div>
          </q-card-section>

          <q-separator
            v-if="gisStore.marcadorSeleccionado.ocupaciones?.length"
          />

          <q-card-section class="q-pa-md">
            <div
              class="text-subtitle1 text-weight-medium q-mb-md flex items-center"
            >
              <q-icon name="people" class="q-mr-xs" />
              Integrantes
              <q-chip
                v-if="gisStore.marcadorSeleccionado.integrantes?.length"
                :label="gisStore.marcadorSeleccionado.integrantes.length"
                color="blue"
                text-color="white"
                size="sm"
                class="q-ml-sm"
              />
            </div>
            <div v-if="gisStore.marcadorSeleccionado.integrantes?.length">
              <div
                v-for="(integrante, index) in gisStore.marcadorSeleccionado
                  .integrantes"
                :key="index"
                class="row items-center q-py-xs q-mb-xs rounded-borders q-pa-sm"
                :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-1'"
              >
                <q-avatar
                  size="28px"
                  class="q-mr-sm"
                  color="blue-5"
                  text-color="white"
                >
                  {{ integrante.nombre.charAt(0) }}
                </q-avatar>
                <div class="col">
                  <div class="text-body2 text-weight-medium">
                    {{ integrante.nombre }} {{ integrante.apellido }}
                  </div>
                  <div class="text-caption text-grey">
                    {{ integrante.edad }} años • {{ integrante.vinculo }} • DNI:
                    {{ integrante.dni }}
                  </div>
                  <div v-if="integrante.salud?.length" class="q-mt-xs">
                    <div
                      v-for="(saludItem, sIndex) in integrante.salud"
                      :key="sIndex"
                      class="text-caption"
                    >
                      <q-badge
                        v-if="saludItem.cud"
                        color="purple"
                        text-color="white"
                        class="q-mr-xs"
                        >CUD</q-badge
                      >
                      <q-badge
                        v-if="saludItem.obra_social"
                        color="green"
                        text-color="white"
                        class="q-mr-xs"
                        >Obra Social</q-badge
                      >
                      <span v-if="saludItem.problema_salud" class="text-red">{{
                        saludItem.problema_salud
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-caption text-grey">Sin integrantes</div>
          </q-card-section>

          <q-separator />

          <q-card-section
            v-if="gisStore.marcadorSeleccionado.servicios?.length"
            class="q-pa-md"
          >
            <div
              class="text-subtitle1 text-weight-medium q-mb-md flex items-center"
            >
              <q-icon name="electrical_services" class="q-mr-xs" />
              Servicios
              <q-chip
                :label="gisStore.marcadorSeleccionado.servicios.length"
                color="indigo"
                text-color="white"
                size="sm"
                class="q-ml-sm"
              />
            </div>
            <div class="row q-col-gutter-sm">
              <div
                v-for="(servicio, index) in gisStore.marcadorSeleccionado
                  .servicios"
                :key="index"
                class="col-6"
              >
                <q-chip
                  color="primary"
                  text-color="white"
                  size="sm"
                  class="full-width"
                >
                  <q-icon
                    :name="
                      servicio.opcion_servicio === 'Conectado'
                        ? 'check_circle'
                        : 'cancel'
                    "
                    class="q-mr-xs"
                  />
                  {{ servicio.nombre }}
                </q-chip>
              </div>
            </div>
          </q-card-section>

          <q-separator v-if="gisStore.marcadorSeleccionado.servicios?.length" />

          <q-card-section class="q-pa-md">
            <div
              class="text-subtitle1 text-weight-medium q-mb-md flex items-center"
            >
              <q-icon name="assignment" class="q-mr-xs" />
              Programas
              <q-chip
                v-if="programasFiltradosPorMes.length"
                :label="programasFiltradosPorMes.length"
                color="primary"
                text-color="white"
                size="sm"
                class="q-ml-sm"
              />
            </div>

            <div class="q-mb-md">
              <q-select
                v-model="filtroMes"
                :options="opcionesMeses"
                label="Filtrar por Mes"
                clearable
                dense
                outlined
              />
            </div>

            <div v-if="programasFiltradosPorMes.length">
              <div
                v-for="(programa, index) in programasFiltradosPorMes"
                :key="index"
                class="text-body2 q-mb-xs q-pa-sm rounded-borders"
                :class="$q.dark.isActive ? 'bg-green-9' : 'bg-green-1'"
              >
                <div class="row items-center">
                  <div class="col">
                    <div class="text-weight-medium">
                      {{ programa.tipo }}
                    </div>
                    <div class="text-caption">
                      {{ programa.ayuda }}
                    </div>
                    <div
                      v-if="programa.detalle"
                      class="text-caption text-grey q-mt-xs"
                    >
                      Detalle: {{ programa.detalle }}
                    </div>
                    <div class="text-caption q-mt-xs">
                      <span v-if="programa.mes" class="q-mr-md">
                        <q-icon name="event" size="xs" />
                        Mes: {{ programa.mes }}
                      </span>
                      <span v-if="programa.cantidad">
                        <q-icon name="format_list_numbered" size="xs" />
                        Cantidad: {{ programa.cantidad }}
                      </span>
                    </div>
                    <div
                      v-if="programa.notas"
                      class="text-caption text-grey q-mt-xs"
                    >
                      <q-icon name="note" size="xs" class="q-mr-xs" />
                      {{ programa.notas }}
                    </div>
                    <q-badge
                      v-if="programa.fechaInicio"
                      color="green"
                      class="q-mt-xs"
                      text-color="white"
                    >
                      Desde:
                      {{ new Date(programa.fechaInicio).toLocaleDateString() }}
                    </q-badge>
                  </div>
                </div>
              </div>
              <q-separator class="q-my-md" />
              <div class="text-subtitle1 text-weight-bold text-right">
                Total de Cantidad: {{ totalCantidadPorMes }}
              </div>
            </div>
            <div v-else class="text-caption text-grey">Ninguno</div>

            <div class="q-mt-sm">
              <q-btn
                label="Historial de Programas"
                color="primary"
                flat
                @click="mostrarModalHistorial = true"
                :badge="programasInactivos.length || undefined"
              />
            </div>
          </q-card-section>

          <div v-if="gisStore.marcadorSeleccionado.notas">
            <q-separator />
            <q-card-section class="q-pa-md">
              <div
                class="text-subtitle1 text-weight-medium q-mb-md flex items-center"
              >
                <q-icon name="note" class="q-mr-xs" />
                Observaciones
              </div>
              <div
                class="text-body2 q-pa-sm rounded-borders"
                :class="$q.dark.isActive ? 'bg-grey-8' : 'bg-grey-2'"
              >
                {{ gisStore.marcadorSeleccionado.notas }}
              </div>
            </q-card-section>
          </div>
        </div>

        <div style="flex-shrink: 0">
          <q-separator />
          <q-card-actions class="q-pa-sm justify-end">
            <q-btn flat round icon="print" @click="generarPDF" size="md">
              <q-tooltip>Imprimir</q-tooltip>
            </q-btn>

            <HistorialMarcador
              :idMarcador="gisStore.marcadorSeleccionado.id"
              :marcador="gisStore.marcadorSeleccionado"
            />

            <q-btn
              flat
              v-if="permisos.puedeEditar"
              label="Editar"
              @click="editarMarcadorSeleccionado"
              color="orange-8"
              size="md"
            />

            <q-btn
              flat
              v-if="permisos.puedeEliminar"
              label="Eliminar"
              @click="eliminarMarcadorSeleccionado"
              color="red"
              size="md"
            />
          </q-card-actions>
        </div>
      </q-card>
    </div>

    <q-dialog v-model="mostrarModalHistorial">
      <q-card style="min-width: 350px; max-width: 550px">
        <q-card-section>
          <div class="text-h6">
            Historial de Programas
            <q-chip
              v-if="programasInactivos.length"
              :label="programasInactivos.length"
              color="grey"
              text-color="white"
              size="sm"
              class="q-ml-sm"
            />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div v-if="programasInactivos.length">
            <div
              v-for="(programa, index) in programasInactivos"
              :key="index"
              class="q-mb-sm"
            >
              <div class="row items-center q-gutter-sm">
                <q-badge
                  :color="colorPorEstado(programa.estado)"
                  class="q-mr-sm"
                >
                  {{ programa.estado.toUpperCase() }}
                </q-badge>
                <div class="col text-body2">
                  <div>• {{ programa.tipo }}: {{ programa.ayuda }}</div>
                  <div class="text-caption text-grey">
                    Inicio:
                    {{
                      programa.fechaInicio
                        ? new Date(programa.fechaInicio).toLocaleDateString()
                        : 'N/A'
                    }}<br />
                    Fin:
                    {{
                      programa.fechaFin
                        ? new Date(programa.fechaFin).toLocaleDateString()
                        : 'N/A'
                    }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-caption text-grey">
            No hay programas inactivos.
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-drawer
      v-model="drawerVisible"
      side="right"
      :width="500"
      overlay
      behavior="desktop"
      bordered
    >
      <div class="drawer-header bg-blue-5 text-white">
        <div class="row items-center justify-between q-pa-md">
          <div class="text-h6">Panel de Control</div>
          <q-btn
            icon="close"
            flat
            round
            color="white"
            @click="drawerVisible = false"
            class="close-btn"
          />
        </div>
      </div>

      <q-scroll-area class="drawer-content">
        <q-card flat class="no-shadow">
          <q-card-section class="q-pa-md">
            <div class="section-title">
              <q-icon name="bookmark" class="q-mr-sm" color="primary" />
              Filtrar por Vulnerabilidad
            </div>
            <q-btn-group unelevated class="q-mt-md">
              <q-btn
                v-for="icono in iconosDisponibles"
                :key="icono.value"
                :class="{
                  'bg-blue-2': filtrosVulnerabilidad.includes(icono.value),
                }"
                @click="toggleFiltroVulnerabilidad(icono.value)"
                padding="sm md"
              >
                <img
                  :src="icono.value"
                  width="24"
                  height="24"
                  class="q-mr-sm"
                />
                {{ icono.label }}
              </q-btn>
            </q-btn-group>
            <q-btn
              v-if="filtrosVulnerabilidad.length > 0"
              @click="limpiarFiltros"
              label="Limpiar filtros"
              color="grey"
              flat
              dense
              class="q-mt-sm"
            />
          </q-card-section>

          <q-separator />

          <q-card-section class="q-pa-md">
            <div class="section-title">
              <q-icon name="database" class="q-mr-sm" color="primary" />
              Datos cargados
            </div>

            <q-input
              dense
              outlined
              debounce="300"
              v-model="unifiedSearchTerm"
              placeholder="Buscar titular o integrante"
              class="q-mt-md search-input"
              clearable
              prepend-inner-icon="search"
            />

            <div class="marcadores-lista q-mt-md">
              <div
                v-for="(marcador, index) in marcadoresFiltrados"
                :key="marcador.id"
                class="marcador-item"
                @click="verInfoMarcador(marcador)"
              >
                <div class="marcador-content">
                  <div class="marcador-numero">{{ index + 1 }}</div>
                  <div class="marcador-info">
                    <div class="marcador-nombre">
                      {{ marcador.nombre }} {{ marcador.apellido }}
                    </div>
                    <div class="marcador-direccion">
                      {{ marcador.direccion }}
                    </div>
                    <div
                      v-if="
                        marcador.integrantes && marcador.integrantes.length > 0
                      "
                      class="marcador-integrantes"
                    >
                      <span class="text-caption text-grey-7"
                        >Integrantes:
                      </span>
                      <q-chip
                        v-for="integrante in marcador.integrantes.slice(0, 2)"
                        :key="integrante.dni"
                        color="blue-1"
                        text-color="blue-9"
                        size="sm"
                        class="q-ma-none q-mr-xs"
                        :title="`${integrante.nombre} ${integrante.apellido} - DNI: ${integrante.dni}`"
                      >
                        {{ integrante.nombre.split(' ')[0] }}
                      </q-chip>
                      <q-chip
                        v-if="marcador.integrantes.length > 2"
                        color="grey-3"
                        text-color="grey-7"
                        size="sm"
                        class="q-ma-none"
                        :title="`Y ${marcador.integrantes.length - 2} más`"
                      >
                        +{{ marcador.integrantes.length - 2 }}
                      </q-chip>
                    </div>
                  </div>
                  <q-icon name="chevron_right" class="marcador-arrow" />
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-scroll-area>
    </q-drawer>

    <div
      class="fixed-bottom-right q-mb-md q-mr-md"
      style="display: flex; flex-direction: column; gap: 12px"
    >
      <q-btn
        v-if="!drawerVisible"
        icon="menu"
        round
        size="lg"
        color="primary"
        @click="drawerVisible = true"
      >
        <q-tooltip> Ver referencias y datos </q-tooltip>
      </q-btn>

      <q-btn
        icon="map"
        round
        size="lg"
        color="primary"
        @click="cambiarMapaBase"
      >
        <q-tooltip
          anchor="center right"
          self="center left"
          :offset="[10, 10]"
          max-width="200px"
        >
          {{
            capaBase === 'osm' ? 'Cambiar a Secundario' : 'Cambiar a Principal'
          }}
        </q-tooltip>
      </q-btn>
    </div>

    <q-drawer
      v-model="modalVisible"
      side="right"
      :width="800"
      overlay
      bordered
      behavior="desktop"
      v-if="!permisos.soloLectura"
    >
      <q-card class="full-height column no-wrap">
        <q-card-section class="bg-blue-5 text-white q-pa-md">
          <div class="row items-center no-wrap">
            <div class="col">
              <div class="text-h6">
                {{ editando ? 'Editar Informe' : 'Nuevo Informe Social' }}
              </div>
              <div class="text-caption opacity-70">
                Complete la información del beneficiario
              </div>
            </div>
            <div class="col-auto">
              <q-btn
                icon="close"
                flat
                round
                dense
                color="white"
                @click="cerrarModal"
                :disable="guardando"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-section
          class="scroll-y q-pa-sm"
          style="max-height: calc(100vh - 150px)"
        >
          <q-form ref="formulario" @submit="guardarMarcador">
            <q-banner dense class="bg-grey-3 text-dark q-pa-sm q-mb-sm">
              <q-icon name="person" class="q-mr-sm" />
              Información Básica del Beneficiario
            </q-banner>
            <q-card class="q-mb-md q-pa-md bg-grey-1 rounded-borders shadow-1">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="nuevoMarcador.nombre"
                    label="Nombre *"
                    dense
                    outlined
                    :rules="[(val) => !!val || 'Requerido']"
                  />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="nuevoMarcador.apellido"
                    label="Apellido *"
                    dense
                    outlined
                    :rules="[(val) => !!val || 'Requerido']"
                  />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="nuevoMarcador.dni"
                    label="DNI *"
                    type="number"
                    dense
                    outlined
                    :rules="[(val) => !!val || 'Requerido']"
                  />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="nuevoMarcador.telefono"
                    label="Teléfono"
                    type="number"
                    dense
                    outlined
                  />
                </div>
                <div class="col-12">
                  <q-input
                    v-model="nuevoMarcador.direccion"
                    label="Domicilio *"
                    dense
                    outlined
                    :rules="[(val) => !!val || 'Requerido']"
                  />
                </div>
                <div class="col-12 col-sm-6">
                  <q-select
                    v-model="nuevoMarcador.barrio"
                    label="Barrio *"
                    :options="opcionesBarrios"
                    dense
                    outlined
                    :rules="[(val) => !!val || 'Seleccione un barrio']"
                  />
                </div>
                <div class="col-12 col-sm-6">
                  <q-select
                    v-model="nuevoMarcador.tiempo_residencia"
                    label="Tiempo de residencia"
                    :options="opcionesResidencia"
                    dense
                    outlined
                  />
                </div>
              </div>
            </q-card>

            <q-banner dense class="bg-grey-3 text-dark q-pa-sm q-mb-sm">
              <q-icon name="school" class="q-mr-sm" />
              Nivel de Estudios
            </q-banner>
            <q-card class="q-mb-md q-pa-md bg-grey-1 rounded-borders shadow-1">
              <div
                v-for="(estudio, index) in nuevoMarcador.estudios"
                :key="index"
                class="q-mb-md relative-position"
              >
                <q-btn
                  icon="close"
                  color="negative"
                  dense
                  round
                  size="sm"
                  class="absolute-top-right q-ma-xs"
                  @click="eliminarEstudio(index)"
                />
                <q-select
                  v-model="estudio.nivel"
                  label="Nivel de estudios"
                  :options="opcionesEstudios"
                  dense
                  outlined
                  style="width: 50%"
                />
              </div>

              <q-btn
                icon="add_circle"
                label="Agregar estudio"
                color="primary"
                flat
                @click="agregarEstudio"
              />
            </q-card>

            <q-banner dense class="bg-grey-3 text-dark q-pa-sm q-mb-sm">
              <q-icon name="health_and_safety" class="q-mr-sm" />
              Información de Salud
            </q-banner>
            <q-card class="q-mb-md q-pa-md bg-grey-1 rounded-borders shadow-1">
              <div
                v-for="(saludItem, index) in nuevoMarcador.salud"
                :key="index"
                class="q-mb-md relative-position"
              >
                <q-btn
                  icon="close"
                  color="negative"
                  dense
                  round
                  size="sm"
                  class="absolute-top-right q-ma-xs"
                  @click="eliminarSalud(index)"
                />
                <div class="row q-col-gutter-md q-pr-lg">
                  <div class="row q-col-gutter-md items-center q-pr-lg">
                    <div class="col-12 col-md-6">
                      <q-select
                        v-model="saludItem.cud"
                        label="CUD"
                        :options="[
                          { label: 'Sí', value: true },
                          { label: 'No', value: false },
                        ]"
                        map-options
                        emit-value
                        dense
                        outlined
                      />
                    </div>

                    <div class="col-12 col-md-6">
                      <q-select
                        v-model="saludItem.obra_social"
                        label="Obra Social"
                        :options="[
                          { label: 'Sí', value: true },
                          { label: 'No', value: false },
                        ]"
                        map-options
                        emit-value
                        dense
                        outlined
                      />
                    </div>

                    <div class="col-12 col-md-12">
                      <q-input
                        v-model="saludItem.problema_salud"
                        label="Problema de salud"
                        dense
                        outlined
                      />
                    </div>
                  </div>
                </div>
              </div>
              <q-btn
                icon="add_circle"
                label="Agregar info salud"
                color="primary"
                flat
                @click="agregarSalud"
              />
            </q-card>

            <q-banner dense class="bg-grey-3 text-dark q-pa-sm q-mb-sm">
              <q-icon name="home" class="q-mr-sm" />
              Vivienda
            </q-banner>
            <q-card class="q-mb-md q-pa-md bg-grey-1 rounded-borders shadow-1">
              <div
                v-for="(vivienda, index) in nuevoMarcador.viviendas"
                :key="index"
                class="q-mb-md relative-position"
              >
                <q-btn
                  icon="close"
                  color="negative"
                  dense
                  round
                  size="sm"
                  class="absolute-top-right q-ma-xs"
                  @click="eliminarVivienda(index)"
                />
                <div class="row q-col-gutter-md q-pr-lg">
                  <div class="col-12 col-md-3">
                    <q-select
                      v-model="vivienda.tipo"
                      label="Tipo de vivienda"
                      :options="opcionesTipoVivienda"
                      dense
                      outlined
                    />
                  </div>
                  <div class="col-12 col-md-3">
                    <q-select
                      v-model="vivienda.dominio"
                      label="Dominio"
                      :options="opcionesDominioVivienda"
                      dense
                      outlined
                    />
                  </div>
                  <div class="col-12 col-md-3">
                    <q-select
                      v-model="vivienda.ambientes"
                      label="Ambientes"
                      :options="opcionesAmbientes"
                      dense
                      outlined
                    />
                  </div>
                  <div class="col-12 col-md-3">
                    <q-select
                      v-model="vivienda.baño"
                      label="Baño"
                      :options="opcionesBaño"
                      dense
                      outlined
                    />
                  </div>
                </div>
              </div>
              <q-btn
                icon="add_circle"
                label="Agregar vivienda"
                color="primary"
                flat
                @click="agregarVivienda"
              />
            </q-card>

            <q-banner dense class="bg-grey-3 text-dark q-pa-sm q-mb-sm">
              <q-icon name="work" class="q-mr-sm" />
              Ocupación
            </q-banner>
            <q-card class="q-mb-md q-pa-md bg-grey-1 rounded-borders shadow-1">
              <div
                v-for="(ocupacion, index) in nuevoMarcador.ocupaciones"
                :key="index"
                class="q-mb-md relative-position"
              >
                <q-btn
                  icon="close"
                  color="negative"
                  dense
                  round
                  size="sm"
                  class="absolute-top-right q-ma-xs"
                  @click="eliminarOcupacion(index)"
                />
                <div class="row q-col-gutter-md q-pr-lg">
                  <div class="col-12 col-md-4">
                    <q-select
                      v-model="ocupacion.tipo_principal"
                      label="Tipo de ocupación"
                      :options="opcionesOcupacion"
                      dense
                      outlined
                      @update:model-value="resetearTiposOcupacion(index)"
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-select
                      v-model="ocupacion.tipo_1"
                      label="Tipo 1"
                      :options="getTipoOcupacion1(ocupacion.tipo_principal)"
                      dense
                      outlined
                      :disable="
                        !ocupacion.tipo_principal ||
                        ![
                          'Trabajo reproductivo',
                          'Trabajo productivo',
                          'Estudiante',
                          'AUH/SUAF',
                        ].includes(ocupacion.tipo_principal)
                      "
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-select
                      v-model="ocupacion.tipo_2"
                      label="Tipo 2"
                      :options="getTipoOcupacion2(ocupacion.tipo_principal)"
                      dense
                      outlined
                      :disable="
                        !ocupacion.tipo_principal ||
                        (ocupacion.tipo_principal !== 'Trabajo reproductivo' &&
                          ocupacion.tipo_principal !== 'Estudiante' &&
                          ocupacion.tipo_principal !== 'AUH/SUAF')
                      "
                    />
                  </div>
                  <div class="col-12">
                    <q-input
                      v-model.number="ocupacion.ingresos"
                      label="Ingresos"
                      type="number"
                      dense
                      outlined
                      :min="0"
                    />
                  </div>
                </div>
              </div>
              <q-btn
                icon="add_circle"
                label="Agregar ocupación"
                color="primary"
                flat
                @click="agregarOcupacion"
              />
            </q-card>

            <q-banner dense class="bg-grey-3 text-dark q-pa-sm q-mb-sm">
              <q-icon name="people" class="q-mr-sm" />
              Integrantes
            </q-banner>
            <q-card class="q-mb-md q-pa-md bg-grey-1 rounded-borders shadow-1">
              <div
                v-for="(integrante, index) in nuevoMarcador.integrantes"
                :key="index"
                class="q-mb-md relative-position"
              >
                <q-btn
                  icon="close"
                  color="negative"
                  dense
                  round
                  size="sm"
                  class="absolute-top-right q-ma-xs"
                  @click="eliminarIntegrante(index)"
                />

                <div class="row q-col-gutter-md q-mb-md q-pr-lg">
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model="integrante.nombre"
                      label="Nombre *"
                      dense
                      outlined
                      :rules="[(val) => !!val || 'El nombre es obligatorio']"
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model="integrante.apellido"
                      label="Apellido *"
                      dense
                      outlined
                      :rules="[(val) => !!val || 'El apellido es obligatorio']"
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-select
                      v-model="integrante.vinculo"
                      label="Vínculo *"
                      :options="opcionesVinculo"
                      dense
                      outlined
                      :rules="[(val) => !!val || 'Debe seleccionar un vínculo']"
                    />
                  </div>
                </div>

                <div class="row q-col-gutter-md q-mb-md q-pr-lg">
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model.number="integrante.edad"
                      label="Edad"
                      type="number"
                      dense
                      outlined
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="integrante.dni"
                      label="DNI"
                      type="number"
                      dense
                      outlined
                    />
                  </div>
                </div>

                <div class="text-subtitle2 q-mb-sm q-mt-md">
                  Información de Salud
                </div>
                <div
                  v-for="(saludItem, saludIndex) in integrante.salud"
                  :key="saludIndex"
                  class="q-mb-md q-pa-sm bg-white rounded relative-position"
                >
                  <q-btn
                    icon="close"
                    color="negative"
                    flat
                    dense
                    round
                    size="sm"
                    class="absolute-top-right q-ma-xs"
                    @click="eliminarSaludIntegrante(index, saludIndex)"
                  />

                  <div class="row q-col-gutter-md items-center q-pr-lg">
                    <div class="col-12 col-md-3">
                      <q-select
                        v-model="saludItem.cud"
                        label="CUD"
                        :options="[
                          { label: 'Sí', value: true },
                          { label: 'No', value: false },
                        ]"
                        map-options
                        emit-value
                        dense
                        outlined
                      />
                    </div>

                    <div class="col-12 col-md-3">
                      <q-select
                        v-model="saludItem.obra_social"
                        label="Obra Social"
                        :options="[
                          { label: 'Sí', value: true },
                          { label: 'No', value: false },
                        ]"
                        map-options
                        emit-value
                        dense
                        outlined
                      />
                    </div>

                    <div class="col-12 col-md-6">
                      <q-input
                        v-model="saludItem.problema_salud"
                        label="Problema de salud"
                        dense
                        outlined
                      />
                    </div>
                  </div>
                </div>

                <q-btn
                  icon="add"
                  label="Agregar info salud"
                  color="primary"
                  flat
                  size="sm"
                  @click="agregarSaludIntegrante(index)"
                />

                <div class="text-subtitle2 q-mb-sm q-mt-md">Ocupación</div>
                <div
                  v-for="(ocupacion, ocupacionIndex) in integrante.ocupaciones"
                  :key="ocupacionIndex"
                  class="q-mb-md q-pa-sm bg-white rounded relative-position"
                >
                  <q-btn
                    icon="close"
                    color="negative"
                    flat
                    dense
                    round
                    size="sm"
                    class="absolute-top-right q-ma-xs"
                    @click="eliminarOcupacionIntegrante(index, ocupacionIndex)"
                  />
                  <div class="row q-col-gutter-md q-pr-lg">
                    <div class="col-12 col-md-4">
                      <q-select
                        v-model="ocupacion.tipo_principal"
                        label="Tipo de ocupación"
                        :options="opcionesOcupacion"
                        dense
                        outlined
                        @update:model-value="
                          resetearTiposOcupacionIntegrante(
                            index,
                            ocupacionIndex
                          )
                        "
                      />
                    </div>
                    <div class="col-12 col-md-4">
                      <q-select
                        v-model="ocupacion.tipo_1"
                        label="Tipo 1"
                        :options="getTipoOcupacion1(ocupacion.tipo_principal)"
                        dense
                        outlined
                        :disable="
                          !ocupacion.tipo_principal ||
                          ![
                            'Trabajo reproductivo',
                            'Trabajo productivo',
                            'Estudiante',
                            'AUH/SUAF',
                          ].includes(ocupacion.tipo_principal)
                        "
                      />
                    </div>
                    <div class="col-12 col-md-4">
                      <q-select
                        v-model="ocupacion.tipo_2"
                        label="Tipo 2"
                        :options="getTipoOcupacion2(ocupacion.tipo_principal)"
                        dense
                        outlined
                        :disable="
                          !ocupacion.tipo_principal ||
                          (ocupacion.tipo_principal !==
                            'Trabajo reproductivo' &&
                            ocupacion.tipo_principal !== 'Estudiante' &&
                            ocupacion.tipo_principal !== 'AUH/SUAF')
                        "
                      />
                    </div>
                    <div class="col-12">
                      <q-input
                        v-model.number="ocupacion.ingresos"
                        label="Ingresos"
                        type="number"
                        dense
                        outlined
                        :min="0"
                      />
                    </div>
                  </div>
                </div>
                <q-btn
                  icon="add"
                  label="Agregar ocupación"
                  color="primary"
                  flat
                  size="sm"
                  @click="agregarOcupacionIntegrante(index)"
                />
              </div>
              <q-btn
                icon="add_circle"
                label="Agregar integrante"
                color="primary"
                flat
                @click="agregarIntegrante"
              />
            </q-card>

            <q-banner dense class="bg-grey-3 text-dark q-pa-sm q-mb-sm">
              <q-icon name="miscellaneous_services" class="q-mr-sm" />
              Servicios
            </q-banner>
            <q-card class="q-mb-md q-pa-md bg-grey-1 rounded-borders shadow-1">
              <div
                v-for="(servicio, index) in nuevoMarcador.servicios"
                :key="index"
                class="q-mb-md relative-position"
              >
                <q-btn
                  icon="close"
                  color="negative"
                  dense
                  round
                  size="sm"
                  class="absolute-top-right q-ma-xs"
                  @click="eliminarServicio(index)"
                />
                <div class="row q-col-gutter-md q-pr-lg">
                  <div class="col-12 col-md-6">
                    <q-select
                      v-model="servicio.nombre"
                      label="Servicio"
                      :options="opcionesServicios"
                      dense
                      outlined
                      @update:model-value="resetearOpcionServicio(index)"
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-select
                      v-model="servicio.opcion_servicio"
                      label="Opción"
                      :options="getOpcionesxServicios(servicio.nombre)"
                      dense
                      outlined
                      :disable="!servicio.nombre"
                    />
                  </div>
                </div>
              </div>
              <q-btn
                icon="add_circle"
                label="Agregar servicio"
                color="primary"
                flat
                @click="agregarServicio"
              />
            </q-card>

            <q-banner dense class="bg-grey-3 text-dark q-pa-sm q-mb-sm">
              <q-icon name="library_books" class="q-mr-sm" />
              Programas
            </q-banner>
            <q-card class="q-mb-md q-pa-md bg-grey-1 rounded-borders shadow-1">
              <div
                v-for="(programa, index) in nuevoMarcador.programas"
                :key="index"
                class="q-mb-md relative-position"
              >
                <q-btn
                  icon="close"
                  color="negative"
                  dense
                  round
                  size="sm"
                  class="absolute-top-right q-ma-xs"
                  @click="eliminarPrograma(index)"
                >
                  <q-tooltip
                    anchor="top middle"
                    self="bottom middle"
                    :offset="[0, 10]"
                  >
                    Finalizar programa
                  </q-tooltip>
                </q-btn>

                <div class="row q-col-gutter-md q-pr-lg">
                  <q-select
                    v-model="programa.tipo"
                    label="Tipo *"
                    :options="tiposPrograma"
                    dense
                    outlined
                    class="col"
                    @update:model-value="resetearAyuda(index)"
                    :rules="[(val) => !!val || 'Debe seleccionar un tipo']"
                  />

                  <q-select
                    v-model="programa.ayuda"
                    label="Ayuda"
                    :options="getOpcionesAyuda(programa.tipo)"
                    dense
                    outlined
                    class="col"
                    :disable="
                      !programa.tipo ||
                      (programa.tipo !== 'CONTRAPRESTACIÓN' &&
                        programa.tipo !== 'PROGRAMAS ALIMENTARIOS' &&
                        programa.tipo !== 'AYUDA SOCIAL SIN CONTRAPRESTACIÓN')
                    "
                  />

                  <q-select
                    v-model="programa.detalle"
                    label="Detalle"
                    :options="detallesAyuda[programa.ayuda] || []"
                    dense
                    outlined
                    class="col"
                    :disable="
                      !programa.ayuda || programa.ayuda !== 'Banco Materiales'
                    "
                  />
                </div>

                <div class="row q-col-gutter-md q-pr-lg q-mt-sm">
                  <q-select
                    v-model="programa.mes"
                    label="Mes"
                    :options="opcionesMeses"
                    dense
                    outlined
                    class="col"
                  />
                  <q-input
                    v-model.number="programa.cantidad"
                    label="Cantidad"
                    type="number"
                    dense
                    outlined
                    class="col"
                    :min="0"
                  />
                </div>

                <div class="row q-pr-lg q-mt-sm">
                  <div class="col-12">
                    <q-input
                      v-model="programa.notas"
                      label="Notas"
                      type="textarea"
                      dense
                      outlined
                    />
                  </div>
                </div>
              </div>
              <q-btn
                icon="add_circle"
                label="Agregar programa"
                color="primary"
                flat
                @click="agregarPrograma"
              />
            </q-card>

            <q-banner dense class="bg-grey-3 text-dark q-pa-sm q-mb-sm">
              <q-icon name="notes" class="q-mr-sm" />
              Observaciones
            </q-banner>
            <q-card class="q-mb-md q-pa-md bg-grey-1 rounded-borders shadow-1">
              <q-input
                v-model="nuevoMarcador.notas"
                label="Observaciones"
                type="textarea"
                dense
                outlined
              />
            </q-card>

            <q-banner dense class="bg-grey-3 text-dark q-pa-sm q-mb-sm">
              <q-icon name="place" class="q-mr-sm" />
              Ícono del Marcador
            </q-banner>
            <q-card class="q-mb-md q-pa-md bg-grey-1 rounded-borders shadow-1">
              <q-select
                v-model="nuevoMarcador.icono"
                label="Ícono del marcador *"
                :options="iconosDisponibles"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                outlined
                dense
                :rules="[(val) => !!val || 'Debe seleccionar un ícono']"
              >
                <template v-slot:option="scope">
                  <q-item clickable v-bind="scope.itemProps">
                    <q-item-section avatar>
                      <q-img
                        :src="scope.opt.value"
                        :alt="scope.opt.label"
                        style="width: 32px; height: 32px"
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ scope.opt.label }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>

                <template v-slot:selected-item="scope">
                  <q-chip dense square class="q-ma-none">
                    <q-img
                      :src="scope.opt.value"
                      style="width: 20px; height: 20px"
                      class="q-mr-sm"
                    />
                    {{ scope.opt.label }}
                  </q-chip>
                </template>
              </q-select>
            </q-card>

            <q-card-actions align="right" class="q-pa-md">
              <q-btn
                flat
                label="Cancelar"
                @click="cerrarModal"
                color="negative"
                :disable="guardando"
              />
              <q-btn
                flat
                :label="editando ? 'Guardar cambios' : 'Guardar'"
                @click="validarYGuardar"
                color="positive"
                :loading="guardando"
                :disable="guardando"
              />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-drawer>
  </q-page>
</template>
<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useGisStore, Marcador } from 'src/stores/gisStore';
import 'ol/ol.css';
import { Map, View } from 'ol';
import { Tile as TileLayer } from 'ol/layer';
import { OSM, XYZ } from 'ol/source';
import { fromLonLat, toLonLat, transformExtent } from 'ol/proj';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Icon } from 'ol/style';
import { Geometry } from 'ol/geom';
import Modify from 'ol/interaction/Modify';
import { jsPDF } from 'jspdf';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import HistorialMarcador from 'src/components/HistorialMarcador.vue';
import InfoCard from 'src/components/InfoCard.vue';

const router = useRouter();

let modifyInteraction: Modify | null = null;
let marcadorTemporal: Feature<Point> | null = null;

const $q = useQuasar();
const gisStore = useGisStore();
const mapContainer = ref<HTMLElement | null>(null);
const modalVisible = ref(false);
const editando = ref(false);
const mostrarReferencias = ref(false);
const mostrarDatosActuales = ref(false);
const unifiedSearchTerm = ref('');
const guardando = ref(false);
const drawerVisible = ref(false);

const formulario = ref();

const tooltipVisible = ref(false);
const tooltipContent = ref('');
const tooltipPosition = ref({ x: 0, y: 0 });

const rol = ref(localStorage.getItem('rol') || 'Visor');

const mostrarModalHistorial = ref(false);

const programasActivos = computed(
  () =>
    gisStore.marcadorSeleccionado?.programas?.filter(
      (p) => p.estado === 'activo'
    ) || []
);
const programasInactivos = computed(
  () =>
    gisStore.marcadorSeleccionadoProgramasCompletos?.filter(
      (p) => p.estado !== 'activo'
    ) || []
);

// ✅ NUEVO: Referencia para el filtro por mes
const filtroMes = ref<string | null>(null);

// ✅ NUEVO: Opciones de meses
const opcionesMeses = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

// ✅ NUEVO: Propiedad computada para filtrar programas por mes y estado
const programasFiltradosPorMes = computed(() => {
  if (!gisStore.marcadorSeleccionado?.programas) {
    return [];
  }
  const programas = gisStore.marcadorSeleccionado.programas.filter(
    (p) => p.estado === 'activo'
  );
  if (filtroMes.value) {
    return programas.filter((p) => p.mes === filtroMes.value);
  }
  return programas;
});

// ✅ NUEVO: Propiedad computada para calcular la cantidad total del mes filtrado
const totalCantidadPorMes = computed(() => {
  if (!programasFiltradosPorMes.value) {
    return 0;
  }
  return programasFiltradosPorMes.value.reduce((total, programa) => {
    return total + (programa.cantidad || 0);
  }, 0);
});

function colorPorEstado(estado: any) {
  switch (estado) {
    case 'finalizado':
      return 'red';
    case 'cancelado':
      return 'grey';
    default:
      return 'primary';
  }
}

const permisos = computed(() => {
  return {
    puedeCrear:
      rol.value === 'superadmin' ||
      rol.value === 'admin' ||
      rol.value === 'user',
    puedeEditar:
      rol.value === 'superadmin' ||
      rol.value === 'admin' ||
      rol.value === 'user',
    puedeEliminar: rol.value === 'superadmin' || rol.value === 'admin',
    soloLectura: rol.value === 'visor',
  };
});
// Modificación de los labels de iconosDisponibles para ocupar menos espacio
const iconosDisponibles = [
  { label: 'Alta', value: '/marker-icon.png' },
  { label: 'Media', value: '/marker-icon-2.png' },
  { label: 'Baja', value: '/marker-icon-3.png' },
  { label: 'Específica', value: '/marker-icon-4.png' },
];

const filtrosVulnerabilidad = ref<string[]>([]);

function toggleFiltroVulnerabilidad(icono: string) {
  const index = filtrosVulnerabilidad.value.indexOf(icono);
  if (index === -1) {
    filtrosVulnerabilidad.value.push(icono);
  } else {
    filtrosVulnerabilidad.value.splice(index, 1);
  }
}

function limpiarFiltros() {
  filtrosVulnerabilidad.value = [];
}

// Tipos de programa (primer selector)
const tiposPrograma = [
  'SUBSIDIO ECONÓMICO',
  'ALQUILER',
  'CONTRAPRESTACIÓN',
  'SEPELIO',
  'OTRAS AYUDAS',
  'INF. SOCIALES',
  'AYUDA SOCIAL SIN CONTRAPRESTACIÓN',
  'PROGRAMAS ALIMENTARIOS',
];

// Ayudas disponibles por tipo de programa (segundo selector)
const opcionesAyuda = {
  'PROGRAMAS ALIMENTARIOS': [
    'AM - Ayuda Mensual',
    'DBT - Diabéticos',
    'ES - Esp. Solidario',
    'AU - Ayuda Urgente',
    'DE - Dietas Especiales',
  ],
  'SUBSIDIO ECONÓMICO': [],
  ALQUILER: [],
  CONTRAPRESTACIÓN: [
    'Banco Materiales',
    'Gas',
    'Luz',
    'Desagote pozo',
    'Colchón',
    'Frazadas',
    'Otros',
  ],
  SEPELIO: [],
  'OTRAS AYUDAS': [],
  'INF. SOCIALES': [],
  'AYUDA SOCIAL SIN CONTRAPRESTACIÓN': [
    'Banco Materiales',
    'Gas',
    'Luz',
    'Desagote pozo',
    'Colchón',
    'Frazadas',
    'Otros',
  ],
};

// Detalles por ayuda (tercer selector, opcional según la ayuda)
const detallesAyuda = {
  'Banco Materiales': [
    'Membrana',
    'Chapa',
    'Tirante / Aislajás',
    'Aberturas',
    'Otros materiales',
    'Módulo habitacional',
    'Baño',
    'Otros',
  ],
  // Si en el futuro quisieras agregar detalles para otras ayudas, podés hacerlo acá.
};

// Agregar estas opciones después de las existentes
const opcionesVinculo = ['Pareja', 'Hijo/a', 'Padre/Madre', 'Otro'];

const opcionesEstudios = [
  'Primario incompleto',
  'Primario completo',
  'Secundario incompleto',
  'Secundario completo',
  'Terciario incompleto',
  'Terciario completo',
  'Universitario incompleto',
  'Universitario completo',
  'Analfabeto',
];

const opcionesOcupacion = [
  'Trabajo reproductivo',
  'Trabajo productivo',
  'Jubilado/Pensionado',
  'Estudiante',
  'Desocupado',
  'AUH/SUAF',
];
const opcionesTipoOcupacion1 = {
  'Trabajo reproductivo': ['No asalariado', 'Asalariado'],
  'Trabajo productivo': ['Formal', 'Informal'],
  Estudiante: ['No asalariado', 'Asalariado'],
  'AUH/SUAF': ['No asalariado', 'Asalariado'],
};

const opcionesTipoOcupacion2 = {
  'Trabajo reproductivo': ['Formal', 'Informal'],
  'AUH/SUAF': ['Formal', 'Informal'],
  Estudiante: ['Formal', 'Informal'],
};

const opcionesTipoVivienda = [
  'Casa',
  'Departamento',
  'Rancho',
  'Habitacion/Modulo',
  'Casilla',
  'Sin Vivienda',
  'Otro',
];

const opcionesBarrios = [
  'San Martin A',
  'San Martin B',
  'Kenedy',
  'Los Pinos',
  'Belgrano',
  'Barrio Norte',
  'Barrio Centro',
  'Quintanilla',
  'Zona Rural',
  'Otro',
];

const opcionesResidencia = [
  '- 1 año',
  '1-2 años',
  '2-5 años',
  '5-10 años',
  'Más de 10 años',
];

const opcionesDominioVivienda = [
  'Propia',
  'Alquilada',
  'Prestada',
  'Cedida',
  'Otro',
];

const opcionesAmbientes = ['1 ambiente', '2 ambientes', '3 ambientes o más'];

const opcionesBaño = [
  'Interior',
  'Exterior',
  'Compartido interior',
  'Compartido exterior',
  'Sin baño',
];

const opcionesServicios = [
  'Agua',
  'Luz',
  'Eliminacion de excretas',
  'Gas',
  'Calefaccion',
];

const opcionesxServicios = {
  Agua: [
    'Motor bombeador',
    'Bomba',
    'Corriente',
    'Canilla Publica',
    'Otro',
    'No posee',
  ],
  Luz: ['Si', 'No'],
  'Eliminacion de excretas': ['Pozo ciego', 'Cloaca', 'No posee'],
  Gas: ['Envasado', 'Natural'],
  Calefaccion: [
    'Gas Natural',
    'Salamandra/Hogar',
    'Pantalla eléctrica',
    'Pantalla a gas',
    'Otro',
    'No posee',
  ],
};

// Modificar la inicialización de nuevoMarcador
const nuevoMarcador = ref({
  nombre: '',
  apellido: '',
  direccion: '',
  telefono: '',
  dni: '',
  barrio: '',
  tiempo_residencia: '',
  programas: [] as Array<{
    tipo: string;
    ayuda: string;
    detalle: string;
    notas: string;
    mes?: string;
    cantidad?: number;
  }>,
  integrantes: [] as Array<{
    nombre: string;
    apellido: string;
    edad: number | null;
    dni: string;
    vinculo: string;
    salud: Array<{
      cud: boolean;
      obra_social: boolean;
      problema_salud: string;
    }>;
    ocupaciones: Array<{
      tipo_principal: string;
      tipo_1: string;
      tipo_2: string;
      ingresos: number | null;
    }>;
  }>,
  estudios: [] as Array<{
    nivel: string;
  }>,
  ocupaciones: [] as Array<{
    tipo_principal: string;
    tipo_1: string;
    tipo_2: string;
    ingresos: number | null;
  }>,
  viviendas: [] as Array<{
    tipo: string;
    dominio: string;
    ambientes: string;
    baño: string;
    baño_opcion: string;
  }>,
  servicios: [] as Array<{
    nombre: string;
    opcion_servicio: string;
  }>,
  salud: [] as Array<{
    cud: boolean;
    obra_social: boolean;
    problema_salud: string;
  }>,
  latitud: null as number | null,
  longitud: null as number | null,
  icono: '',
});

let map: Map;
let hoveredFeature: Feature | null = null;
let vectorSource = new VectorSource();

const mapTilerLayer = new TileLayer({
  source: new XYZ({
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attributions: 'Tiles © Esri & contributors',
    maxZoom: 20,
  }),
  visible: false, // inicia visible
});
const osmLayer = new TileLayer({
  source: new OSM(),
  visible: true, // inicia visible
});

const marcadoresFiltrados = computed(() => {
  const term = unifiedSearchTerm.value.toLowerCase();
  const vulnerabilidadFilters = filtrosVulnerabilidad.value;

  return gisStore.marcadores
    .filter((m) => {
      // Filtrado por vulnerabilidad
      const matchesVulnerabilidad =
        vulnerabilidadFilters.length === 0 ||
        vulnerabilidadFilters.includes(m.icono);

      if (!matchesVulnerabilidad) {
        return false;
      }

      // Filtrado por texto (si hay término de búsqueda)
      if (term) {
        const matchesMainSearch =
          m.nombre.toLowerCase().includes(term) ||
          m.apellido.toLowerCase().includes(term) ||
          m.direccion.toLowerCase().includes(term) ||
          m.dni.toLowerCase().includes(term);

        const matchesIntegrantesSearch = m.integrantes?.some(
          (integrante: any) => {
            const nombreCompletoIntegrante = `${integrante.nombre || ''} ${
              integrante.apellido || ''
            }`.toLowerCase();
            return (
              nombreCompletoIntegrante.includes(term) ||
              String(integrante.dni || '')
                .toLowerCase()
                .includes(term)
            );
          }
        );

        return matchesMainSearch || matchesIntegrantesSearch;
      }

      // Si no hay término de búsqueda, y pasó el filtro de vulnerabilidad
      return true;
    })
    .slice()
    .reverse();
});

const marcadoresFiltradosParaMapa = computed(() => {
  const vulnerabilidadFilters = filtrosVulnerabilidad.value;
  if (vulnerabilidadFilters.length === 0) {
    return gisStore.marcadores;
  }
  return gisStore.marcadores.filter((marcador) =>
    vulnerabilidadFilters.includes(marcador.icono)
  );
});

watch(marcadoresFiltradosParaMapa, (nuevosMarcadores) => {
  vectorSource.clear();
  nuevosMarcadores.forEach(agregarMarcadorAlMapa);
});

onMounted(() => {
  gisStore.cargarMarcadoresDesdeAPI();

  const vectorLayer = new VectorLayer({ source: vectorSource });
  // Definir los límites del área permitida
  const extent = transformExtent(
    [-57.2139, -37.0617, -57.0539, -36.9417], // [minLon, minLat, maxLon, maxLat] - extendido
    'EPSG:4326',
    'EPSG:3857'
  );
  map = new Map({
    target: mapContainer.value as HTMLElement,
    layers: [
      mapTilerLayer, // en vez de new OSM()
      osmLayer,
      vectorLayer,
    ],
    view: new View({
      center: fromLonLat([-57.1339, -37.0017]),
      zoom: 14, // más cerca para ver numeración
      minZoom: 14,
      maxZoom: 20,
      extent: extent,
      constrainOnlyCenter: false,
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
      const actualFeature = feature as Feature<Geometry>;

      // Mostrar tooltip con el nombre del marcador
      const nombre = actualFeature.get('nombre');
      const apellido = actualFeature.get('apellido');
      const nombreApellido = [nombre, apellido].filter(Boolean).join(' ');
      if (nombreApellido) {
        tooltipContent.value = nombreApellido;
        tooltipPosition.value = { x: pixel[0] + 10, y: pixel[1] - 10 };
        tooltipVisible.value = true;
      }

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

    if (!featureFound) {
      // Ocultar tooltip cuando no hay marcador
      tooltipVisible.value = false;

      if (hoveredFeature) {
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

const capaBase = ref<'osm' | 'esri'>('osm');

function cambiarMapaBase() {
  if (capaBase.value === 'osm') {
    osmLayer.setVisible(false);
    mapTilerLayer.setVisible(true);
    capaBase.value = 'esri';
  } else {
    osmLayer.setVisible(true);
    mapTilerLayer.setVisible(false);
    capaBase.value = 'osm';
  }
}

// ====== MÉTODOS DE VALIDACIÓN ======

// ✅ MÉTODO ACTUALIZADO: Validar y guardar con loading
async function validarYGuardar() {
  guardando.value = true; // ✅ NUEVO: Activar loading
  try {
    // Validar el formulario principal
    const esValido = await formulario.value?.validate();

    if (!esValido) {
      $q.notify({
        type: 'negative',
        message: 'Por favor corrige los errores en el formulario',
        position: 'top',
      });
      return;
    }

    // // Validaciones adicionales
    // if (!validarProgramas()) {
    //   $q.notify({
    //     type: 'negative',
    //     message: 'Debe agregar al menos un programa',
    //     position: 'top',
    //   });
    //   return;
    // }

    // if (!validarIntegrantes()) {
    //   $q.notify({
    //     type: 'negative',
    //     message: 'Debe agregar al menos un integrante',
    //     position: 'top',
    //   });
    //   return;
    // }

    // Si todo está válido, proceder a guardar
    await guardarMarcador();
  } catch (error) {
    console.error('Error en validación:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al validar el formulario',
      position: 'top',
    });
  } finally {
    guardando.value = false; // ✅ NUEVO: Desactivar loading
  }
}

// Validar que haya al menos un programa
function validarProgramas(): boolean {
  return (
    nuevoMarcador.value.programas && nuevoMarcador.value.programas.length > 0
  );
}

// Validar que haya al menos un integrante
function validarIntegrantes(): boolean {
  return (
    nuevoMarcador.value.integrantes &&
    nuevoMarcador.value.integrantes.length > 0
  );
}

// ====== MÉTODOS EXISTENTES MODIFICADOS ======

function cerrarModal() {
  modalVisible.value = false;
  desactivarEdicionTemporal();

  // Limpiar validaciones del formulario
  if (formulario.value) {
    formulario.value.resetValidation();
  }

  if (marcadorTemporal) {
    vectorSource.removeFeature(marcadorTemporal);
    marcadorTemporal = null;
  }
}

async function guardarMarcador() {
  const marcador = { ...nuevoMarcador.value };

  // Asegurar que tenga un ícono
  if (!marcador.icono) {
    marcador.icono = iconosDisponibles[0].value;
  }

  // Limpiar marcador temporal si existe
  if (marcadorTemporal) {
    desactivarEdicionTemporal();
    vectorSource.removeFeature(marcadorTemporal);
    marcadorTemporal = null;
  }

  console.log('Datos a enviar:', marcador); // Debug: ver qué se está enviando

  try {
    if (editando.value) {
      await gisStore.editarMarcador(marcador);
      // Para edición, recargamos todos los marcadores
      await gisStore.cargarMarcadoresDesdeAPI();
      $q.notify({
        type: 'positive',
        message: 'Marcador actualizado correctamente',
        position: 'top',
      });
    } else {
      // Para creación
      console.log('Creando nuevo marcador...'); // Debug

      const respuestaServidor = await gisStore.agregarMarcador(marcador);
      console.log('Respuesta del servidor:', respuestaServidor); // Debug: ver qué devuelve el servidor

      // Verificar diferentes estructuras de respuesta posibles
      let nuevoMarcadorCreado = null;

      if (respuestaServidor?.id) {
        // Caso 1: El servidor devuelve directamente el marcador
        nuevoMarcadorCreado = respuestaServidor;
      } else if (respuestaServidor?.data?.id) {
        // Caso 2: El servidor devuelve { data: marcador }
        nuevoMarcadorCreado = respuestaServidor.data;
      } else if (respuestaServidor?.marcador?.id) {
        // Caso 3: El servidor devuelve { marcador: marcador }
        nuevoMarcadorCreado = respuestaServidor.marcador;
      } else if (respuestaServidor?.success && respuestaServidor?.result?.id) {
        // Caso 4: El servidor devuelve { success: true, result: marcador }
        nuevoMarcadorCreado = respuestaServidor.result;
      }

      if (nuevoMarcadorCreado?.id) {
        console.log('Marcador creado exitosamente:', nuevoMarcadorCreado); // Debug

        // Agregar al mapa inmediatamente
        agregarMarcadorAlMapa(nuevoMarcadorCreado);

        // Actualizar la lista local del store si no existe
        if (!gisStore.marcadores.find((m) => m.id === nuevoMarcadorCreado.id)) {
          gisStore.marcadores.push(nuevoMarcadorCreado);
        }

        $q.notify({
          type: 'positive',
          message: 'Marcador creado correctamente',
          position: 'top',
        });
      } else {
        // Si no se puede identificar el marcador creado, recargar desde el servidor
        console.warn(
          'No se pudo identificar el marcador creado, recargando desde servidor...'
        ); // Debug

        await gisStore.cargarMarcadoresDesdeAPI();

        $q.notify({
          type: 'positive',
          message: 'Marcador creado correctamente (recargado desde servidor)',
          position: 'top',
        });
      }
    }

    cerrarModal();
  } catch (error) {
    console.error('Error completo al guardar marcador:', error); // Debug mejorado

    // Mostrar más detalles del error
    let mensajeError = 'Error al guardar el marcador';
    if (error.response?.data?.message) {
      mensajeError = error.response.data.message;
    } else if (error.message) {
      mensajeError = error.message;
    }

    $q.notify({
      type: 'negative',
      message: mensajeError,
      position: 'top',
    });
  }
}

function agregarPrograma() {
  if (!nuevoMarcador.value.programas) {
    nuevoMarcador.value.programas = [];
  }
  nuevoMarcador.value.programas.push({
    tipo: '',
    ayuda: '',
    detalle: '',
    notas: '',
    mes: '',
    cantidad: null,
  });
}

function eliminarPrograma(index: number) {
  nuevoMarcador.value.programas.splice(index, 1);
}

// Funciones para manejar integrantes
function agregarIntegrante() {
  nuevoMarcador.value.integrantes.push({
    nombre: '',
    apellido: '',
    edad: null,
    dni: '',
    vinculo: '',
    salud: [],
    ocupaciones: [],
  });
}

function eliminarIntegrante(index) {
  nuevoMarcador.value.integrantes.splice(index, 1);
}

// Funciones para manejar salud de integrantes
function agregarSaludIntegrante(integranteIndex) {
  if (!nuevoMarcador.value.integrantes[integranteIndex].salud) {
    nuevoMarcador.value.integrantes[integranteIndex].salud = [];
  }
  nuevoMarcador.value.integrantes[integranteIndex].salud.push({
    cud: false,
    obra_social: false,
    problema_salud: '',
  });
}

function eliminarSaludIntegrante(integranteIndex, saludIndex) {
  nuevoMarcador.value.integrantes[integranteIndex].salud.splice(saludIndex, 1);
}

// Funciones para manejar ocupaciones de integrantes
function agregarOcupacionIntegrante(integranteIndex) {
  if (!nuevoMarcador.value.integrantes[integranteIndex].ocupaciones) {
    nuevoMarcador.value.integrantes[integranteIndex].ocupaciones = [];
  }
  nuevoMarcador.value.integrantes[integranteIndex].ocupaciones.push({
    tipo_principal: null,
    tipo_1: null,
    tipo_2: null,
    ingresos: null,
  });
}

function eliminarOcupacionIntegrante(integranteIndex, ocupacionIndex) {
  nuevoMarcador.value.integrantes[integranteIndex].ocupaciones.splice(
    ocupacionIndex,
    1
  );
}

function resetearTiposOcupacionIntegrante(integranteIndex, ocupacionIndex) {
  const ocupacion =
    nuevoMarcador.value.integrantes[integranteIndex].ocupaciones[
      ocupacionIndex
    ];
  ocupacion.tipo_1 = null;
  ocupacion.tipo_2 = null;
  ocupacion.ingresos = null;
}

// Funciones para manejar estudios
function agregarEstudio() {
  if (!nuevoMarcador.value.estudios) {
    nuevoMarcador.value.estudios = [];
  }
  nuevoMarcador.value.estudios.push({
    nivel: '',
  });
}

function eliminarEstudio(index: number) {
  if (nuevoMarcador.value.estudios) {
    nuevoMarcador.value.estudios.splice(index, 1);
  }
}

// Funciones para manejar ocupaciones
function agregarOcupacion() {
  if (!nuevoMarcador.value.ocupaciones) {
    nuevoMarcador.value.ocupaciones = [];
  }
  nuevoMarcador.value.ocupaciones.push({
    tipo_principal: '',
    tipo_1: '',
    tipo_2: '',
    ingresos: null,
  });
}

function eliminarOcupacion(index: number) {
  if (nuevoMarcador.value.ocupaciones) {
    nuevoMarcador.value.ocupaciones.splice(index, 1);
  }
}

// Funciones para manejar viviendas
function agregarVivienda() {
  if (!nuevoMarcador.value.viviendas) {
    nuevoMarcador.value.viviendas = [];
  }
  nuevoMarcador.value.viviendas.push({
    tipo: '',
    dominio: '',
    ambientes: '',
    baño: '',
    baño_opcion: '',
  });
}

function eliminarVivienda(index: number) {
  if (nuevoMarcador.value.viviendas) {
    nuevoMarcador.value.viviendas.splice(index, 1);
  }
}

// Funciones para manejar servicios
function agregarServicio() {
  if (!nuevoMarcador.value.servicios) {
    nuevoMarcador.value.servicios = [];
  }
  nuevoMarcador.value.servicios.push({
    nombre: '',
    opcion_servicio: '',
  });
}

function eliminarServicio(index: number) {
  if (nuevoMarcador.value.servicios) {
    nuevoMarcador.value.servicios.splice(index, 1);
  }
}

// Funciones para manejar salud general
function agregarSalud() {
  if (!nuevoMarcador.value.salud) {
    nuevoMarcador.value.salud = [];
  }
  nuevoMarcador.value.salud.push({
    cud: false,
    obra_social: false,
    problema_salud: '',
  });
}

function eliminarSalud(index: number) {
  if (nuevoMarcador.value.salud) {
    nuevoMarcador.value.salud.splice(index, 1);
  }
}

// Función para limpiar el formulario
function limpiarFormulario() {
  nuevoMarcador.value = {
    nombre: '',
    apellido: '',
    direccion: '',
    telefono: '',
    dni: '',
    barrio: '',
    tiempo_residencia: '',
    latitud: null,
    longitud: null,
    icono: '',
    programas: [],
    integrantes: [],
    estudios: [],
    ocupaciones: [],
    viviendas: [],
    servicios: [],
    salud: [],
  };
}

// Nuevos métodos para ocupaciones
function getTipoOcupacion1(tipoOcupacion) {
  return opcionesTipoOcupacion1[tipoOcupacion] || [];
}

function getTipoOcupacion2(tipoOcupacion) {
  return opcionesTipoOcupacion2[tipoOcupacion] || [];
}

function resetearTiposOcupacion(index) {
  nuevoMarcador.value.ocupaciones[index].tipo_1 = '';
  nuevoMarcador.value.ocupaciones[index].tipo_2 = '';
}

// Nuevos métodos para servicios
function getOpcionesxServicios(servicio) {
  return opcionesxServicios[servicio] || [];
}

function resetearOpcionServicio(index) {
  nuevoMarcador.value.servicios[index].opcion_servicio = '';
}

// Función para obtener las opciones de ayuda según el tipo
function getOpcionesAyuda(tipo: string) {
  return opcionesAyuda[tipo as keyof typeof opcionesAyuda] || [];
}

// ✅ FUNCIÓN ACTUALIZADA: Resetear ayuda cuando cambia el tipo
function resetearAyuda(index: number) {
  // Si cambias a SUBSIDIOS, limpia la ayuda
  if (nuevoMarcador.value.programas[index].tipo === 'SUBSIDIOS') {
    nuevoMarcador.value.programas[index].ayuda = '';
  } else {
    nuevoMarcador.value.programas[index].ayuda = '';
  }
}

function activarEdicionTemporal() {
  desactivarEdicionTemporal();

  if (marcadorTemporal) {
    modifyInteraction = new Modify({
      source: vectorSource,
      filter: (feature) => feature === marcadorTemporal,
    });

    map.addInteraction(modifyInteraction);

    modifyInteraction.on('modifyend', () => {
      if (marcadorTemporal) {
        const coords = toLonLat(
          (marcadorTemporal.getGeometry() as Point).getCoordinates()
        );
        nuevoMarcador.value.longitud = coords[0];
        nuevoMarcador.value.latitud = coords[1];
      }
    });
  }
}

function desactivarEdicionTemporal() {
  if (modifyInteraction) {
    map.removeInteraction(modifyInteraction);
    modifyInteraction = null;
  }
}

// Función mejorada para generar PDF con diseño de tarjetas
async function generarPDF() {
  if (!gisStore.marcadorSeleccionado) {
    alert('No hay ningún marcador seleccionado');
    return;
  }

  try {
    // Verificar si jsPDF está disponible
    if (typeof jsPDF === 'undefined') {
      console.error('jsPDF no está disponible');
      alert(
        'Error: La librería jsPDF no está cargada. Verifique la conexión a internet.'
      );
      return;
    }

    const marcador = gisStore.marcadorSeleccionado;

    // --- CONFIGURACIÓN OPTIMIZADA ---
    const CONFIG = {
      margins: { top: 12, right: 12, bottom: 15, left: 12 },
      pageWidth: new jsPDF('p', 'mm', 'a4').internal.pageSize.width,
      pageHeight: new jsPDF('p', 'mm', 'a4').internal.pageSize.height,
      colors: {
        primary: [25, 118, 210],
        success: [76, 175, 80],
        error: [244, 67, 54],
        warning: [255, 152, 0],
        info: [33, 150, 243],
        text: [33, 33, 33],
        textSecondary: [117, 117, 117],
        cardBg: [255, 255, 255],
        cardBorder: [220, 220, 220],
      },
      fonts: {
        title: { size: 16, style: 'bold' },
        cardTitle: { size: 10, style: 'bold' },
        cardLabel: { size: 8, style: 'bold' },
        cardValue: { size: 8, style: 'normal' },
        small: { size: 7, style: 'normal' },
        tiny: { size: 6, style: 'normal' },
      },
      card: {
        padding: 5,
        margin: 5,
        cornerRadius: 1,
        headerHeight: 8,
      },
    };

    // --- CLASE PARA ENCAPSULAR TODA LA LÓGICA DE GENERACIÓN ---
    class PDFGenerator {
      constructor(data) {
        this.doc = new jsPDF('p', 'mm', 'a4');
        this.data = data;
        this.yPos = CONFIG.margins.top;
        this.contentWidth =
          CONFIG.pageWidth - CONFIG.margins.left - CONFIG.margins.right;
      }

      // --- FUNCIONES AUXILIARES ---
      _getSafeValue(value, defaultValue = 'N/A') {
        if (value === null || value === undefined || value === '') {
          return defaultValue;
        }
        const cleaned = String(value)
          .replace(/[^\w\s\-.,;:()\[\]\/áéíóúÁÉÍÓÚñÑüÜ]/g, '')
          .trim()
          .replace(/\s+/g, ' ');
        return cleaned || defaultValue;
      }

      _setColor(colorArray) {
        this.doc.setTextColor(colorArray[0], colorArray[1], colorArray[2]);
      }

      _setFont(fontConfig) {
        this.doc.setFontSize(fontConfig.size);
        this.doc.setFont('helvetica', fontConfig.style);
      }

      _checkPageBreak(requiredSpace = 25) {
        if (
          this.yPos >
          CONFIG.pageHeight - CONFIG.margins.bottom - requiredSpace
        ) {
          this.doc.addPage();
          this.yPos = CONFIG.margins.top + 5;
          return true;
        }
        return false;
      }

      // MEJORA: Función para crear tarjetas con mejor distribución y centrado
      _createCard(title, x, y, width, height, color = CONFIG.colors.primary) {
        // Sombra más sutil
        this.doc.setFillColor(240, 240, 240);
        this.doc.rect(x + 0.5, y + 0.5, width, height, 'F');

        // Fondo y borde de la tarjeta con mejor contraste
        this.doc.setFillColor(...CONFIG.colors.cardBg);
        this.doc.setDrawColor(...CONFIG.colors.cardBorder);
        this.doc.setLineWidth(0.2);
        this.doc.rect(x, y, width, height, 'FD');

        // Header de la tarjeta con gradiente visual
        this.doc.setFillColor(...color);
        this.doc.rect(x, y, width, CONFIG.card.headerHeight, 'F');

        // Título de la tarjeta centrado
        this._setFont(CONFIG.fonts.cardTitle);
        this._setColor([255, 255, 255]);
        const titleText = this._getSafeValue(title).toUpperCase();
        const titleWidth = this.doc.getTextWidth(titleText);
        const titleX = x + (width - titleWidth) / 2; // Centrar el título
        this.doc.text(titleText, titleX, y + 6);

        return {
          contentX: x + CONFIG.card.padding,
          contentY: y + CONFIG.card.headerHeight + CONFIG.card.padding + 1,
          contentWidth: width - CONFIG.card.padding * 2,
        };
      }

      // Función para agregar campos en una o más columnas con mejor distribución
      _addCardFields(card, fields, columns = 1) {
        let currentY = card.contentY;
        let maxY = currentY;
        const columnWidth = card.contentWidth / columns;
        const lineHeight = 4;
        const fieldSpacing = 8; // Espacio entre campos
        const columnPadding = 3; // Padding entre columnas

        // Filtrar campos válidos primero
        const validFields = fields.filter(
          (field) => this._getSafeValue(field.value) !== 'N/A'
        );

        if (validFields.length === 0) {
          this._setFont(CONFIG.fonts.cardValue);
          this._setColor(CONFIG.colors.textSecondary);
          this.doc.text(
            'Sin información disponible',
            card.contentX + 2,
            currentY
          );
          return currentY + lineHeight;
        }

        // Organizar campos en filas para mejor distribución
        const fieldsPerRow = columns;
        const rows = Math.ceil(validFields.length / fieldsPerRow);

        for (let row = 0; row < rows; row++) {
          let rowMaxY = currentY;

          for (let col = 0; col < fieldsPerRow; col++) {
            const fieldIndex = row * fieldsPerRow + col;
            if (fieldIndex >= validFields.length) break;

            const field = validFields[fieldIndex];
            const colX = card.contentX + col * (columnWidth + columnPadding);
            const availableWidth = columnWidth - columnPadding;

            let fieldY = currentY;

            // Etiqueta del campo con mejor posicionamiento
            this._setFont(CONFIG.fonts.cardLabel);
            this._setColor(CONFIG.colors.textSecondary);
            this.doc.text(`${field.label}:`, colX + 1, fieldY);
            fieldY += lineHeight;

            // Valor del campo con texto justificado
            this._setFont(CONFIG.fonts.cardValue);
            this._setColor(CONFIG.colors.text);

            const valueLines = this.doc.splitTextToSize(
              this._getSafeValue(field.value),
              availableWidth - 2
            );

            valueLines.forEach((line, lineIndex) => {
              this.doc.text(line, colX + 1, fieldY + lineIndex * lineHeight);
            });

            fieldY += valueLines.length * lineHeight;
            rowMaxY = Math.max(rowMaxY, fieldY);
          }

          currentY = rowMaxY + fieldSpacing;
          maxY = Math.max(maxY, currentY);
        }

        return maxY;
      }

      // --- FUNCIONES PARA GENERAR CADA SECCIÓN DEL PDF ---

      _addHeader() {
        this.doc.setFillColor(...CONFIG.colors.primary);
        this.doc.rect(
          CONFIG.margins.left - 5,
          this.yPos - 3,
          this.contentWidth + 10,
          20,
          'F'
        );
        this._setFont(CONFIG.fonts.title);
        this._setColor([255, 255, 255]);
        const titleText = 'REPORTE DE INFORMACIÓN PERSONAL';
        const titleX =
          (CONFIG.pageWidth - this.doc.getTextWidth(titleText)) / 2;
        this.doc.text(titleText, titleX, this.yPos + 8);
        this._setFont(CONFIG.fonts.small);
        const subtitleText = `Generado: ${new Date().toLocaleDateString(
          'es-ES'
        )} ${new Date().toLocaleTimeString('es-ES')}`;
        const subtitleX =
          (CONFIG.pageWidth - this.doc.getTextWidth(subtitleText)) / 2;
        this.doc.text(subtitleText, subtitleX, this.yPos + 14);
        this.yPos += 25;
      }

      _addBasicInfoCard() {
        const fields = [
          {
            label: 'Nombre Completo',
            value: `${this._getSafeValue(
              this.data.nombre
            )} ${this._getSafeValue(this.data.apellido)}`,
          },
          { label: 'DNI', value: this.data.dni },
          { label: 'Teléfono', value: this.data.telefono },
          { label: 'Domicilio', value: this.data.direccion },
          { label: 'Barrio', value: this.data.barrio },
          { label: 'Tiempo Residencia', value: this.data.tiempo_residencia },
        ];

        // Calcular altura dinámicamente basada en el contenido
        const validFields = fields.filter(
          (f) => this._getSafeValue(f.value) !== 'N/A'
        );
        const rows = Math.ceil(validFields.length / 2);
        const cardHeight =
          CONFIG.card.headerHeight + CONFIG.card.padding * 3 + rows * 12 + 5;

        this._checkPageBreak(cardHeight);
        const card = this._createCard(
          'INFORMACIÓN BÁSICA',
          CONFIG.margins.left,
          this.yPos,
          this.contentWidth,
          cardHeight,
          CONFIG.colors.primary
        );

        this._addCardFields(card, fields, 2);
        this.yPos += cardHeight + CONFIG.card.margin;
      }

      _addEducationHealthCards() {
        const cardWidth = (this.contentWidth - CONFIG.card.margin) / 2;
        const estudios =
          this.data.estudios
            ?.map((e) => this._getSafeValue(e.nivel))
            .filter((e) => e !== 'N/A') || [];

        const saludItems = this.data.salud || [];

        // Calcular alturas dinámicamente
        const alturaEstudios = Math.max(
          35,
          CONFIG.card.headerHeight +
            CONFIG.card.padding * 2 +
            estudios.length * 5 +
            10
        );
        const alturaSalud = Math.max(
          35,
          CONFIG.card.headerHeight +
            CONFIG.card.padding * 2 +
            saludItems.length * 10 +
            10
        );
        const requiredHeight =
          Math.max(alturaEstudios, alturaSalud) + CONFIG.card.margin;

        this._checkPageBreak(requiredHeight);

        // Tarjeta de Educación con mejor distribución
        const studyCard = this._createCard(
          'EDUCACIÓN',
          CONFIG.margins.left,
          this.yPos,
          cardWidth,
          alturaEstudios,
          CONFIG.colors.info
        );

        let studyY = studyCard.contentY;
        if (estudios.length > 0) {
          estudios.forEach((item, index) => {
            this._setFont(CONFIG.fonts.cardValue);
            this._setColor(CONFIG.colors.text);
            this.doc.text(`• ${item}`, studyCard.contentX + 2, studyY);
            studyY += 5;
          });
        } else {
          this._setFont(CONFIG.fonts.cardValue);
          this._setColor(CONFIG.colors.textSecondary);
          const noInfoText = 'Sin información disponible';
          const textWidth = this.doc.getTextWidth(noInfoText);
          const centeredX =
            studyCard.contentX + (studyCard.contentWidth - textWidth) / 2;
          this.doc.text(noInfoText, centeredX, studyY + 10);
        }

        // Tarjeta de Salud con mejor organización
        const healthCard = this._createCard(
          'SALUD',
          CONFIG.margins.left + cardWidth + CONFIG.card.margin,
          this.yPos,
          cardWidth,
          alturaSalud,
          CONFIG.colors.error
        );

        let healthY = healthCard.contentY;
        if (saludItems.length > 0) {
          saludItems.forEach((item) => {
            const problema = this._getSafeValue(item.problema_salud);
            if (problema !== 'N/A') {
              this._setFont(CONFIG.fonts.cardValue);
              this._setColor(CONFIG.colors.text);

              // Dividir texto largo si es necesario
              const problemLines = this.doc.splitTextToSize(
                `• ${problema}`,
                healthCard.contentWidth - 8
              );

              problemLines.forEach((line, lineIndex) => {
                this.doc.text(
                  line,
                  healthCard.contentX + 2,
                  healthY + lineIndex * 4
                );
              });

              healthY += problemLines.length * 4;

              // Información de cobertura en línea separada
              let cobertura = [];
              if (item.cud) cobertura.push('CUD');
              if (item.obra_social) cobertura.push('Obra Social');

              if (cobertura.length > 0) {
                this._setFont(CONFIG.fonts.tiny);
                this._setColor(CONFIG.colors.textSecondary);
                this.doc.text(
                  `    Cobertura: ${cobertura.join(', ')}`,
                  healthCard.contentX + 4,
                  healthY
                );
                healthY += 4;
              }
              healthY += 2; // Espacio entre items
            }
          });
        } else {
          this._setFont(CONFIG.fonts.cardValue);
          this._setColor(CONFIG.colors.textSecondary);
          const noInfoText = 'Sin información disponible';
          const textWidth = this.doc.getTextWidth(noInfoText);
          const centeredX =
            healthCard.contentX + (healthCard.contentWidth - textWidth) / 2;
          this.doc.text(noInfoText, centeredX, healthY + 10);
        }

        this.yPos += requiredHeight;
      }

      _addHousingCard() {
        const viviendas = this.data.viviendas;
        if (!viviendas || viviendas.length === 0) {
          const cardHeight = 35;
          const card = this._createCard(
            'VIVIENDA',
            CONFIG.margins.left,
            this.yPos,
            this.contentWidth,
            cardHeight,
            CONFIG.colors.warning
          );
          this._setFont(CONFIG.fonts.cardValue);
          this._setColor(CONFIG.colors.textSecondary);
          const noInfoText = 'Sin información de vivienda disponible';
          const textWidth = this.doc.getTextWidth(noInfoText);
          const centeredX = card.contentX + (card.contentWidth - textWidth) / 2;
          this.doc.text(noInfoText, centeredX, card.contentY + 8);
          this.yPos += cardHeight + CONFIG.card.margin;
          return;
        }

        // Calcular altura dinámicamente basada en el número de viviendas
        const alturaVivienda =
          CONFIG.card.headerHeight +
          CONFIG.card.padding * 2 +
          viviendas.length * 25 +
          10;
        this._checkPageBreak(alturaVivienda);

        const card = this._createCard(
          'VIVIENDA',
          CONFIG.margins.left,
          this.yPos,
          this.contentWidth,
          alturaVivienda,
          CONFIG.colors.warning
        );

        let currentY = card.contentY;

        viviendas.forEach((vivienda, index) => {
          // Separador visual entre viviendas
          if (index > 0) {
            this.doc.setDrawColor(230, 230, 230);
            this.doc.setLineWidth(0.1);
            this.doc.line(
              card.contentX,
              currentY - 2,
              card.contentX + card.contentWidth,
              currentY - 2
            );
            currentY += 3;
          }

          // Título de la vivienda si hay más de una
          if (viviendas.length > 1) {
            this._setFont(CONFIG.fonts.cardLabel);
            this._setColor(CONFIG.colors.primary);
            this.doc.text(`VIVIENDA ${index + 1}:`, card.contentX, currentY);
            currentY += 5;
          }

          const fields = [
            { label: 'Tipo', value: vivienda.tipo },
            { label: 'Dominio', value: vivienda.dominio },
            { label: 'Ambientes', value: vivienda.ambientes },
            {
              label: 'Baño',
              value: `${this._getSafeValue(
                vivienda.baño
              )} (${this._getSafeValue(vivienda.baño_opcion)})`,
            },
          ];

          // Usar distribución en 2 columnas para mejor aprovechamiento del espacio
          this._addCardFields({ ...card, contentY: currentY }, fields, 2);
          currentY += 18; // Espacio para la siguiente vivienda
        });

        this.yPos += alturaVivienda + CONFIG.card.margin;
      }

      _addOccupationCard() {
        const ocupaciones = this.data.ocupaciones;
        if (!ocupaciones || ocupaciones.length === 0) {
          const card = this._createCard(
            'OCUPACIÓN',
            CONFIG.margins.left,
            this.yPos,
            this.contentWidth,
            22,
            CONFIG.colors.success
          );
          this._setFont(CONFIG.fonts.cardValue);
          this._setColor(CONFIG.colors.textSecondary);
          this.doc.text(
            'Sin ocupaciones registradas',
            card.contentX,
            card.contentY
          );
          this.yPos += 22 + CONFIG.card.margin;
          return;
        }

        const alturaOcupaciones = 20 + ocupaciones.length * 20;
        this._checkPageBreak(alturaOcupaciones);
        const card = this._createCard(
          'OCUPACIÓN',
          CONFIG.margins.left,
          this.yPos,
          this.contentWidth,
          alturaOcupaciones,
          CONFIG.colors.success
        );
        let currentY = card.contentY;

        ocupaciones.forEach((ocupacion, index) => {
          const fields = [
            {
              label: `Ocupación ${index + 1}`,
              value: ocupacion.nombre || ocupacion.tipo_principal,
            },
            {
              label: 'Tipo',
              value: `${ocupacion.tipo_1} - ${ocupacion.tipo_2}`,
            },
            {
              label: 'Ingresos',
              value: ocupacion.ingresos
                ? `$${ocupacion.ingresos.toLocaleString('es-ES')}`
                : 'N/A',
            },
          ];
          this._addCardFields({ ...card, contentY: currentY }, fields, 1);
          currentY += 20;
        });

        this.yPos += alturaOcupaciones + CONFIG.card.margin;
      }

      _addMembersCard() {
        const integrantes = this.data.integrantes;
        if (!integrantes || integrantes.length === 0) {
          const cardHeight = 35;
          const card = this._createCard(
            'INTEGRANTES DEL HOGAR',
            CONFIG.margins.left,
            this.yPos,
            this.contentWidth,
            cardHeight,
            CONFIG.colors.primary
          );
          this._setFont(CONFIG.fonts.cardValue);
          this._setColor(CONFIG.colors.textSecondary);
          const noInfoText = 'No hay integrantes registrados';
          const textWidth = this.doc.getTextWidth(noInfoText);
          const centeredX = card.contentX + (card.contentWidth - textWidth) / 2;
          this.doc.text(noInfoText, centeredX, card.contentY + 8);
          this.yPos += cardHeight + CONFIG.card.margin;
          return;
        }

        // Calcular altura dinámicamente
        let alturaCalculada =
          CONFIG.card.headerHeight + CONFIG.card.padding * 2 + 25; // Para estadísticas
        integrantes.forEach((integrante) => {
          alturaCalculada += 8; // Línea básica del integrante
          if (integrante.ocupaciones && integrante.ocupaciones.length > 0) {
            alturaCalculada += integrante.ocupaciones.length * 4; // Ocupaciones
          }
        });

        this._checkPageBreak(alturaCalculada);
        const card = this._createCard(
          'INTEGRANTES DEL HOGAR',
          CONFIG.margins.left,
          this.yPos,
          this.contentWidth,
          alturaCalculada,
          CONFIG.colors.primary
        );

        let currentY = card.contentY;

        // Estadísticas del hogar en un área destacada
        const totalIntegrantes = integrantes.length;
        const edadesValidas = integrantes
          .filter((i) => i.edad && !isNaN(i.edad))
          .map((i) => parseInt(i.edad));
        const edadPromedio =
          edadesValidas.length > 0
            ? Math.round(
                edadesValidas.reduce((sum, edad) => sum + edad, 0) /
                  edadesValidas.length
              )
            : 'N/A';

        // Área de estadísticas con fondo sutil
        this.doc.setFillColor(248, 249, 250);
        this.doc.rect(card.contentX, currentY - 1, card.contentWidth, 12, 'F');

        const fields = [
          { label: 'Total Integrantes', value: `${totalIntegrantes} personas` },
          {
            label: 'Edad Promedio',
            value: edadPromedio !== 'N/A' ? `${edadPromedio} años` : 'N/A',
          },
        ];

        currentY = this._addCardFields(
          { ...card, contentY: currentY },
          fields,
          2
        );
        currentY += 5;

        // Separador visual
        this.doc.setDrawColor(...CONFIG.colors.primary);
        this.doc.setLineWidth(0.2);
        this.doc.line(
          card.contentX,
          currentY,
          card.contentX + card.contentWidth,
          currentY
        );
        currentY += 5;

        // Título de la sección de detalle
        this._setFont(CONFIG.fonts.cardLabel);
        this._setColor(CONFIG.colors.primary);
        this.doc.text('DETALLE DE INTEGRANTES:', card.contentX, currentY);
        currentY += 6;

        // Lista de integrantes con mejor formato
        integrantes.forEach((integrante, index) => {
          this._setFont(CONFIG.fonts.cardValue);
          this._setColor(CONFIG.colors.text);

          const nombre = this._getSafeValue(integrante.nombre);
          const apellido = this._getSafeValue(integrante.apellido);
          const edad = this._getSafeValue(integrante.edad);
          const vinculo = this._getSafeValue(integrante.vinculo);

          const integranteText = `${
            index + 1
          }. ${nombre} ${apellido} (${edad} años) - ${vinculo}`;

          // Dividir texto si es muy largo
          const integranteLines = this.doc.splitTextToSize(
            integranteText,
            card.contentWidth - 8
          );

          integranteLines.forEach((line, lineIndex) => {
            this.doc.text(line, card.contentX + 2, currentY + lineIndex * 4);
          });

          currentY += integranteLines.length * 4;

          // Ocupaciones del integrante con indentación
          if (integrante.ocupaciones && integrante.ocupaciones.length > 0) {
            integrante.ocupaciones.forEach((ocupacion) => {
              const tipoPrincipal = this._getSafeValue(
                ocupacion.tipo_principal
              );
              const tipo1 = this._getSafeValue(ocupacion.tipo_1);
              const tipo2 = this._getSafeValue(ocupacion.tipo_2);
              const ingresos =
                ocupacion.ingresos && !isNaN(ocupacion.ingresos)
                  ? `$${ocupacion.ingresos.toLocaleString('es-ES')}`
                  : '';

              let ocupacionText = `    ⚬ Ocupación: ${tipoPrincipal}`;
              if (tipo1 !== 'N/A' || tipo2 !== 'N/A') {
                const tipos = [tipo1, tipo2].filter((t) => t && t !== 'N/A');
                if (tipos.length > 0) {
                  ocupacionText += ` (${tipos.join(' - ')})`;
                }
              }
              if (ingresos) {
                ocupacionText += ` | Ingresos: ${ingresos}`;
              }

              this._setFont(CONFIG.fonts.small);
              this._setColor(CONFIG.colors.textSecondary);

              const ocupacionLines = this.doc.splitTextToSize(
                ocupacionText,
                card.contentWidth - 12
              );

              ocupacionLines.forEach((line, lineIndex) => {
                this.doc.text(
                  line,
                  card.contentX + 6,
                  currentY + lineIndex * 3
                );
              });

              currentY += ocupacionLines.length * 3 + 1;
            });
          }

          currentY += 2; // Espacio entre integrantes
        });

        this.yPos += alturaCalculada + CONFIG.card.margin;
      }

      _addServicesAndProgramsCards() {
        const cardWidth = (this.contentWidth - CONFIG.card.margin) / 2;

        // Procesar servicios
        const conectados =
          this.data.servicios?.filter(
            (s) => s.opcion_servicio === 'Conectado'
          ) || [];
        const noConectados =
          this.data.servicios?.filter(
            (s) => s.opcion_servicio !== 'Conectado'
          ) || [];

        // Calcular altura de servicios dinámicamente
        let alturaServicios =
          CONFIG.card.headerHeight + CONFIG.card.padding * 2 + 5;
        if (conectados.length > 0) alturaServicios += 6 + conectados.length * 5;
        if (noConectados.length > 0)
          alturaServicios += 6 + noConectados.length * 5;
        if (conectados.length === 0 && noConectados.length === 0)
          alturaServicios += 15;

        // Procesar programas
        const activos =
          this.data.programas?.filter((p) => p.estado === 'activo') || [];
        const inactivos =
          this.data.programas?.filter((p) => p.estado !== 'activo') || [];

        // Calcular altura de programas dinámicamente
        let alturaProgramas =
          CONFIG.card.headerHeight + CONFIG.card.padding * 2 + 5;
        if (activos.length > 0) {
          alturaProgramas += 6;
          activos.forEach((p) => {
            alturaProgramas += 5; // Línea principal
            const notas = this._getSafeValue(p.notas);
            if (notas !== 'N/A') {
              const noteLines = this.doc.splitTextToSize(
                `Notas: ${notas}`,
                cardWidth - 15
              );
              alturaProgramas += noteLines.length * 3 + 2;
            }
          });
        }
        if (inactivos.length > 0) alturaProgramas += 6 + inactivos.length * 5;
        if (activos.length === 0 && inactivos.length === 0)
          alturaProgramas += 15;

        const requiredHeight =
          Math.max(alturaServicios, alturaProgramas) + CONFIG.card.margin;
        this._checkPageBreak(requiredHeight);

        // Tarjeta de Servicios con mejor organización
        const servicesCard = this._createCard(
          'SERVICIOS',
          CONFIG.margins.left,
          this.yPos,
          cardWidth,
          alturaServicios,
          CONFIG.colors.info
        );

        let servicesY = servicesCard.contentY;

        if (conectados.length > 0) {
          this._setFont(CONFIG.fonts.cardLabel);
          this._setColor(CONFIG.colors.success);
          this.doc.text('✓ CONECTADOS:', servicesCard.contentX + 2, servicesY);
          servicesY += 6;

          conectados.forEach((servicio) => {
            const nombre = this._getSafeValue(servicio.nombre);
            const opcion = this._getSafeValue(servicio.opcion_servicio);
            if (nombre !== 'N/A') {
              this._setFont(CONFIG.fonts.cardValue);
              this._setColor(CONFIG.colors.text);
              let serviceText = `  • ${nombre}`;
              if (opcion !== 'N/A' && opcion !== 'Conectado') {
                serviceText += ` (${opcion})`;
              }
              // Dividir texto si es muy largo
              const serviceLines = this.doc.splitTextToSize(
                serviceText,
                cardWidth - 10
              );
              serviceLines.forEach((line, lineIndex) => {
                this.doc.text(
                  line,
                  servicesCard.contentX + 2,
                  servicesY + lineIndex * 4
                );
              });
              servicesY += serviceLines.length * 4 + 1;
            }
          });
        }

        if (noConectados.length > 0) {
          this._setFont(CONFIG.fonts.cardLabel);
          this._setColor(CONFIG.colors.error);
          this.doc.text(
            '✗ NO CONECTADOS:',
            servicesCard.contentX + 2,
            servicesY
          );
          servicesY += 6;

          noConectados.forEach((servicio) => {
            const nombre = this._getSafeValue(servicio.nombre);
            const opcion = this._getSafeValue(servicio.opcion_servicio);
            if (nombre !== 'N/A') {
              this._setFont(CONFIG.fonts.cardValue);
              this._setColor(CONFIG.colors.text);
              let serviceText = `  • ${nombre}`;
              if (opcion !== 'N/A' && opcion !== 'No conectado') {
                serviceText += ` (${opcion})`;
              }
              const serviceLines = this.doc.splitTextToSize(
                serviceText,
                cardWidth - 10
              );
              serviceLines.forEach((line, lineIndex) => {
                this.doc.text(
                  line,
                  servicesCard.contentX + 2,
                  servicesY + lineIndex * 4
                );
              });
              servicesY += serviceLines.length * 4 + 1;
            }
          });
        }

        if (conectados.length === 0 && noConectados.length === 0) {
          this._setFont(CONFIG.fonts.cardValue);
          this._setColor(CONFIG.colors.textSecondary);
          const noServicesText = 'Sin servicios registrados';
          const textWidth = this.doc.getTextWidth(noServicesText);
          const centeredX =
            servicesCard.contentX + (servicesCard.contentWidth - textWidth) / 2;
          this.doc.text(noServicesText, centeredX, servicesY + 8);
        }

        // Tarjeta de Programas con mejor distribución
        const programsCard = this._createCard(
          'PROGRAMAS SOCIALES',
          CONFIG.margins.left + cardWidth + CONFIG.card.margin,
          this.yPos,
          cardWidth,
          alturaProgramas,
          CONFIG.colors.warning
        );

        let programsY = programsCard.contentY;

        if (activos.length > 0) {
          this._setFont(CONFIG.fonts.cardLabel);
          this._setColor(CONFIG.colors.success);
          this.doc.text('★ ACTIVOS:', programsCard.contentX + 2, programsY);
          programsY += 6;

          activos.forEach((programa) => {
            const tipo = this._getSafeValue(programa.tipo);
            const ayuda = this._getSafeValue(programa.ayuda);
            const detalle = this._getSafeValue(programa.detalle);
            const notas = this._getSafeValue(programa.notas);

            if (tipo !== 'N/A' || ayuda !== 'N/A') {
              this._setFont(CONFIG.fonts.cardValue);
              this._setColor(CONFIG.colors.text);
              let programText = `  • ${tipo}`;
              if (ayuda !== 'N/A') programText += ` - ${ayuda}`;
              if (detalle !== 'N/A') programText += ` (${detalle})`;

              const programLines = this.doc.splitTextToSize(
                programText,
                cardWidth - 10
              );
              programLines.forEach((line, lineIndex) => {
                this.doc.text(
                  line,
                  programsCard.contentX + 2,
                  programsY + lineIndex * 4
                );
              });
              programsY += programLines.length * 4;

              if (notas !== 'N/A') {
                this._setFont(CONFIG.fonts.tiny);
                this._setColor(CONFIG.colors.textSecondary);
                const noteLines = this.doc.splitTextToSize(
                  `    Notas: ${notas}`,
                  cardWidth - 15
                );
                noteLines.forEach((line) => {
                  this.doc.text(line, programsCard.contentX + 4, programsY);
                  programsY += 3;
                });
                programsY += 2;
              } else {
                programsY += 1;
              }
            }
          });
        }

        if (inactivos.length > 0) {
          this._setFont(CONFIG.fonts.cardLabel);
          this._setColor(CONFIG.colors.textSecondary);
          this.doc.text('◐ FINALIZADOS:', programsCard.contentX + 2, programsY);
          programsY += 6;

          inactivos.forEach((programa) => {
            const tipo = this._getSafeValue(programa.tipo);
            const ayuda = this._getSafeValue(programa.ayuda);
            if (tipo !== 'N/A' || ayuda !== 'N/A') {
              this._setFont(CONFIG.fonts.cardValue);
              this._setColor(CONFIG.colors.textSecondary);
              let programText = `  • ${tipo}`;
              if (ayuda !== 'N/A') programText += ` - ${ayuda}`;

              const programLines = this.doc.splitTextToSize(
                programText,
                cardWidth - 10
              );
              programLines.forEach((line, lineIndex) => {
                this.doc.text(
                  line,
                  programsCard.contentX + 2,
                  programsY + lineIndex * 4
                );
              });
              programsY += programLines.length * 4 + 1;
            }
          });
        }

        if (activos.length === 0 && inactivos.length === 0) {
          this._setFont(CONFIG.fonts.cardValue);
          this._setColor(CONFIG.colors.textSecondary);
          const noProgramsText = 'Sin programas asignados';
          const textWidth = this.doc.getTextWidth(noProgramsText);
          const centeredX =
            programsCard.contentX + (programsCard.contentWidth - textWidth) / 2;
          this.doc.text(noProgramsText, centeredX, programsY + 8);
        }

        this.yPos += requiredHeight;
      }

      _addNotesCard() {
        const notasLimpias = this._getSafeValue(this.data.notas);
        if (notasLimpias !== 'N/A') {
          // Calcular altura dinámicamente con mejor espaciado
          const notasLines = this.doc.splitTextToSize(
            notasLimpias,
            this.contentWidth - CONFIG.card.padding * 2 - 4 // Margen interno adicional
          );
          const notasAltura =
            CONFIG.card.headerHeight +
            CONFIG.card.padding * 2 +
            notasLines.length * 5 +
            8;

          this._checkPageBreak(notasAltura);
          const notesCard = this._createCard(
            'NOTAS ADICIONALES',
            CONFIG.margins.left,
            this.yPos,
            this.contentWidth,
            notasAltura,
            [121, 85, 72] // Color marrón para notas
          );

          let notesY = notesCard.contentY + 2; // Espaciado inicial
          this._setFont(CONFIG.fonts.cardValue);
          this._setColor(CONFIG.colors.text);

          // Agregar las notas con mejor espaciado y alineación
          notasLines.forEach((linea, index) => {
            // Agregar un pequeño margen izquierdo para mejor legibilidad
            this.doc.text(linea.trim(), notesCard.contentX + 2, notesY);
            notesY += 5; // Espaciado entre líneas mejorado
          });

          this.yPos += notasAltura + CONFIG.card.margin;
        }
      }

      _addFooter() {
        const totalPages = this.doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          this.doc.setPage(i);
          this.doc.setDrawColor(...CONFIG.colors.primary);
          this.doc.setLineWidth(0.5);
          this.doc.line(
            CONFIG.margins.left,
            CONFIG.pageHeight - 12,
            CONFIG.pageWidth - CONFIG.margins.right,
            CONFIG.pageHeight - 12
          );
          this._setFont(CONFIG.fonts.tiny);
          this._setColor(CONFIG.colors.textSecondary);
          this.doc.text(
            `Sistema GIS - ${new Date().toLocaleDateString('es-ES')}`,
            CONFIG.margins.left,
            CONFIG.pageHeight - 6
          );
          this.doc.text(
            `Página ${i} de ${totalPages}`,
            CONFIG.pageWidth - CONFIG.margins.right - 15,
            CONFIG.pageHeight - 6
          );
        }
      }

      // --- ORDEN DE GENERACIÓN ---
      generate() {
        this._addHeader();
        this._addBasicInfoCard();
        this._addEducationHealthCards();
        this._addHousingCard();
        this._addOccupationCard();
        this._addMembersCard();
        this._addServicesAndProgramsCards();
        this._addNotesCard();
        this._addFooter();
        return this;
      }

      // --- FUNCIÓN FINAL PARA GUARDAR ---
      save() {
        const nombreLimpio = this._getSafeValue(this.data.nombre) || 'Usuario';
        const apellidoLimpio =
          this._getSafeValue(this.data.apellido) || 'Desconocido';
        const fileName = `Reporte_${nombreLimpio}_${apellidoLimpio}_${
          new Date().toISOString().split('T')[0]
        }.pdf`;
        const pdfBlob = this.doc.output('blob');
        const blobUrl = URL.createObjectURL(pdfBlob);
        const printWindow = window.open(blobUrl, '_blank');
        if (printWindow) {
          printWindow.onload = function () {
            printWindow.focus();
            setTimeout(() => printWindow.print(), 1000);
          };
        } else {
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          alert(
            'PDF generado y descargado. Verifique su carpeta de descargas.'
          );
        }
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      }
    }

    // --- CÓDIGO FINAL SIMPLIFICADO ---
    const generator = new PDFGenerator(marcador);
    generator.generate().save();
  } catch (error) {
    console.error('Error detallado al generar el PDF:', error);
    alert(
      `Error al generar el PDF: ${error.message}. Verifique que jsPDF esté correctamente cargado.`
    );
  }
}

function abrirModal(coords: [number, number]) {
  if (permisos.value.soloLectura) {
    return;
  }
  const [lon, lat] = coords;

  nuevoMarcador.value = {
    nombre: '',
    apellido: '',
    direccion: '',
    telefono: '',
    dni: '',
    barrio: '',
    tiempo_residencia: '',
    estudios: [],
    ocupaciones: [],
    viviendas: [],
    servicios: [],
    salud: [],
    programas: [],
    integrantes: [],
    latitud: lat,
    longitud: lon,
    icono: iconosDisponibles[0].value,
  };

  if (marcadorTemporal) {
    vectorSource.removeFeature(marcadorTemporal);
  }

  const iconoEdicion = '/marker-icon-7.png';

  marcadorTemporal = new Feature({
    geometry: new Point(fromLonLat([lon, lat])),
  });

  marcadorTemporal.set('icono', iconoEdicion);

  marcadorTemporal.setStyle(
    new Style({
      image: new Icon({
        src: iconoEdicion,
        scale: 0.25,
      }),
    })
  );

  vectorSource.addFeature(marcadorTemporal);

  activarEdicionTemporal();
  modalVisible.value = true;
  editando.value = false;
}

function agregarMarcadorAlMapa(marcador: Marcador) {
  const feature = new Feature({
    geometry: new Point(fromLonLat([marcador.longitud, marcador.latitud])),
    id: marcador.id,
  });

  // Agregar el nombreApellido al feature para el tooltip
  feature.set('nombre', marcador.nombre);
  feature.set('apellido', marcador.apellido);
  feature.set(
    'nombreApellido',
    [marcador.nombre, marcador.apellido].filter(Boolean).join(' ')
  );
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

  // Hacemos una copia profunda para mantener todos los campos
  nuevoMarcador.value = JSON.parse(
    JSON.stringify(gisStore.marcadorSeleccionado)
  );

  editando.value = true;
  modalVisible.value = true;

  // Si ya hay un marcador, lo eliminamos
  if (marcadorTemporal) {
    vectorSource.removeFeature(marcadorTemporal);
  }

  // Crear marcador temporal con la posición existente
  const { longitud, latitud } = nuevoMarcador.value;

  marcadorTemporal = new Feature({
    geometry: new Point(fromLonLat([longitud, latitud])),
  });

  const iconoEdicion = '/marker-icon-7.png';

  marcadorTemporal.set('icono', iconoEdicion);

  marcadorTemporal.setStyle(
    new Style({
      image: new Icon({
        src: iconoEdicion,
        scale: 0.25,
      }),
    })
  );

  vectorSource.addFeature(marcadorTemporal);

  // Activar edición
  activarEdicionTemporal();
}

function eliminarMarcadorSeleccionado() {
  if (!gisStore.marcadorSeleccionado) return;

  // Usar el diálogo de confirmación de Quasar
  $q.dialog({
    title: 'Confirmar eliminación',
    message: '¿Está seguro que desea eliminar este marcador?',
    cancel: true,
    persistent: true,
    ok: {
      color: 'negative',
      label: 'Eliminar',
    },
    cancel: {
      color: 'primary',
      label: 'Cancelar',
    },
  }).onOk(() => {
    // Si confirma, procedemos con la eliminación
    const id = gisStore.marcadorSeleccionado.id;
    gisStore.eliminarMarcador(id);

    vectorSource.getFeatures().forEach((feature) => {
      if (feature.get('id') === id) {
        vectorSource.removeFeature(feature);
      }
    });

    gisStore.cerrarInfo();

    // Mostrar notificación de éxito
    $q.notify({
      type: 'positive',
      message: 'Marcador eliminado correctamente',
      position: 'top',
    });
  });
}

function verInfoMarcador(marcador: Marcador) {
  gisStore.seleccionarMarcador(marcador.id);

  const coordenadas = fromLonLat([marcador.longitud, marcador.latitud]);
  map.getView().animate({
    center: coordenadas,
    duration: 500,
    zoom: 17,
  });
}
</script>
<style scoped>
.header-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

.bg-white-transparent {
  background-color: rgba(255, 255, 255, 0.2) !important;
}

.info-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.integrante-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
  background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
}

.integrante-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.programa-card {
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  background: linear-gradient(145deg, #f8f9ff 0%, #ffffff 100%);
  transition: all 0.3s ease;
}

.programa-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-title {
  display: flex;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f0f0;
}

.action-btn {
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: scale(1.1);
}

.info-panel {
  animation: slideIn 0.3s ease-out;
}

.absolute-top-right {
  position: absolute !important;
  top: 10px;
  right: 10px;
  z-index: 2;
  transform: translate(50%, -50%);
  /* lo saca un poco del div visualmente */
  opacity: 0.7;
  transition: opacity 0.2s ease;
  cursor: pointer;
}

.absolute-top-right:hover {
  opacity: 1;
}

.scroll-contenido {
  max-height: 250px;
  overflow-y: auto;
}

.fixed-top-right {
  position: fixed;
  top: 100px;
  right: 6px;
  z-index: 9999;
}

/* Estilos para el drawer mejorado */
.drawer-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.close-btn {
  transition: all 0.3s ease;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.drawer-content {
  height: calc(100vh - 72px);
  /* Ajusta según la altura del header */
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1976d2;
  margin-bottom: 8px;
}

.referencias-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(40px, 1fr));
  gap: 4px;
  padding: 4px;
  background: #f5f5f5;
  border-radius: 6px;
}

.referencia-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.referencia-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.referencia-icon {
  margin-bottom: 8px;
}

.referencia-label {
  font-size: 0.75rem;
  text-align: center;
  color: #666;
  font-weight: 500;
}

.search-input {
  border-radius: 8px;
}

.marcadores-lista {
  max-height: 400px;
  overflow-y: auto;
}

.marcador-item {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.marcador-item:hover {
  border-color: #1976d2;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.15);
  transform: translateX(4px);
}

.marcador-content {
  display: flex;
  align-items: center;
  padding: 12px;
}

.marcador-numero {
  background: #1976d2;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  margin-right: 12px;
  flex-shrink: 0;
}

.marcador-info {
  flex: 1;
  min-width: 0;
}

.marcador-nombre {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.marcador-direccion {
  font-size: 0.85rem;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.marcador-integrantes {
  margin-top: 4px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.marcador-integrantes .q-chip {
  height: 20px;
  /* Ajusta la altura de los chips para hacerlos más pequeños */
  font-size: 0.7rem;
  /* Ajusta el tamaño de la fuente */
}

.marcador-arrow {
  color: #1976d2;
  margin-left: 8px;
  flex-shrink: 0;
}

/* Scrollbar personalizada */
.marcadores-lista::-webkit-scrollbar {
  width: 4px;
}

.marcadores-lista::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.marcadores-lista::-webkit-scrollbar-thumb {
  background: #1976d2;
  border-radius: 4px;
}

.marcadores-lista::-webkit-scrollbar-thumb:hover {
  background: #1565c0;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 600px) {
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

.tooltip-marcador {
  position: absolute;
  background: linear-gradient(135deg, #667eea 0%, rgb(0, 0, 0) 100%);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  pointer-events: none;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  animation: tooltipFadeIn 0.2s ease-out;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

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
  width: 300px;
  max-height: 20vh;
}

.datos-actuales-panel {
  position: absolute;
  right: 1rem;
  top: calc(1rem + 20vh + 0.5rem);
  /* fija desde arriba */
  max-height: calc(100vh - (1rem + 13vh + 8rem));
  bottom: 1rem;
  /* se adapta hasta el borde inferior */
  width: 300px;
  z-index: 9;
  overflow-y: auto;
  /* scroll solo si el contenido es mayor */
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE y Edge */
}

.datos-actuales-panel::-webkit-scrollbar {
  display: none;
  /* Chrome, Safari y Opera */
}
</style>
