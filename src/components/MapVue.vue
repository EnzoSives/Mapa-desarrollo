<template>
  <q-page class="full-height no-scroll">
    <div ref="mapContainer" class="mapa">
      <InfoCard />
    </div>

    <InfoCard />

    <!-- Tooltip para mostrar el nombre del marcador -->
    <div v-if="tooltipVisible" class="tooltip-marcador" :style="{
      left: tooltipPosition.x + 'px',
      top: tooltipPosition.y + 'px',
    }">
      {{ tooltipContent }}
    </div>

    <!-- Panel Info del marcador (izquierda arriba) -->
    <div id="area-imprimir">
      <q-card v-if="gisStore.marcadorSeleccionado" class="info-panel q-mx-auto" style="
          min-width: 400px;
          max-width: 500px;
          border-radius: 12px;
          max-height: 85vh;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        ">
        <!-- Contenido con scroll -->
        <div style="
            flex: 1;
            overflow-y: auto;
            scrollbar-width: none;
            scrollbar-color: #888 #f0f0f0;
          ">
          <!-- Encabezado simple -->
          <q-card-section class="q-pa-md relative-position">
            <!-- Botón cerrar en esquina superior derecha -->
            <q-btn icon="close" flat round dense class="absolute-top-right q-ma-sm" style="z-index: 2"
              @click="gisStore.cerrarInfo" />

            <div class="row items-center no-wrap">
              <q-avatar v-if="gisStore.marcadorSeleccionado.icono" size="44px" class="q-mr-md">
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

          <!-- 1. INFORMACIÓN BÁSICA -->
          <q-card-section class="q-pa-md">
            <div class="text-subtitle1 text-weight-medium q-mb-md flex items-center">
              <q-icon name="person" class="q-mr-xs" />
              Información Básica
            </div>

            <!-- Nombre y Apellido en la misma fila -->
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

            <!-- DNI campo completo -->
            <div class="q-mb-md">
              <div class="text-caption text-grey">DNI</div>
              <div class="text-body2">
                {{ gisStore.marcadorSeleccionado.dni || 'N/A' }}
              </div>
            </div>

            <!-- Domicilio campo completo -->
            <div class="q-mb-md">
              <div class="text-caption text-grey">Domicilio</div>
              <div class="text-body2">
                {{ gisStore.marcadorSeleccionado.direccion || 'N/A' }}
              </div>
            </div>

            <!-- Teléfono campo completo -->
            <div class="q-mb-md">
              <div class="text-caption text-grey">Teléfono</div>
              <div class="text-body2">
                {{ gisStore.marcadorSeleccionado.telefono || 'N/A' }}
              </div>
            </div>

            <!-- Barrio y Tiempo de residencia en la misma fila -->
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

          <!-- 2. NIVEL DE ESTUDIOS -->
          <q-card-section v-if="gisStore.marcadorSeleccionado.estudios?.length" class="q-pa-md">
            <div class="text-subtitle1 text-weight-medium q-mb-md flex items-center">
              <q-icon name="school" class="q-mr-xs" />
              Nivel de Estudios
              <q-chip :label="gisStore.marcadorSeleccionado.estudios.length" color="blue" text-color="white" size="sm"
                class="q-ml-sm" />
            </div>
            <div v-for="(estudio, index) in gisStore.marcadorSeleccionado.estudios" :key="index"
              class="text-body2 q-mb-xs q-pa-sm rounded-borders" :class="$q.dark.isActive ? 'bg-blue-9' : 'bg-blue-1'">
              {{ estudio.nivel }}
            </div>
          </q-card-section>

          <q-separator v-if="gisStore.marcadorSeleccionado.estudios?.length" />

          <!-- 3. INFORMACIÓN DE SALUD -->
          <q-card-section v-if="gisStore.marcadorSeleccionado.salud?.length" class="q-pa-md">
            <div class="text-subtitle1 text-weight-medium q-mb-md flex items-center">
              <q-icon name="medical_services" class="q-mr-xs" />
              Información de Salud
              <q-chip :label="gisStore.marcadorSeleccionado.salud.length" color="red" text-color="white" size="sm"
                class="q-ml-sm" />
            </div>
            <div v-for="(saludItem, index) in gisStore.marcadorSeleccionado.salud" :key="index"
              class="q-mb-xs q-pa-sm rounded-borders" :class="$q.dark.isActive ? 'bg-red-9' : 'bg-red-1'">
              <div class="row items-center">
                <div class="col">
                  <div v-if="saludItem.problema_salud" class="text-body2">
                    {{ saludItem.problema_salud }}
                  </div>
                  <div class="q-mt-xs">
                    <q-badge v-if="saludItem.cud" color="purple" text-color="white" class="q-mr-xs">CUD</q-badge>
                    <q-badge v-if="saludItem.obra_social" color="green" text-color="white">Obra Social</q-badge>
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-separator v-if="gisStore.marcadorSeleccionado.salud?.length" />

          <!-- 4. VIVIENDA -->
          <q-card-section v-if="gisStore.marcadorSeleccionado.viviendas?.length" class="q-pa-md">
            <div class="text-subtitle1 text-weight-medium q-mb-md flex items-center">
              <q-icon name="home" class="q-mr-xs" />
              Vivienda
              <q-chip :label="gisStore.marcadorSeleccionado.viviendas.length" color="teal" text-color="white" size="sm"
                class="q-ml-sm" />
            </div>
            <div v-for="(vivienda, index) in gisStore.marcadorSeleccionado
              .viviendas" :key="index" class="q-mb-xs q-pa-sm rounded-borders"
              :class="$q.dark.isActive ? 'bg-teal-9' : 'bg-teal-1'">
              <div class="text-body2">
                <strong>{{ vivienda.tipo }}</strong> • {{ vivienda.dominio }}
              </div>
              <div class="text-caption text-grey">
                <span v-if="vivienda.ambientes">{{ vivienda.ambientes }} ambientes</span>
                <span v-if="vivienda.ambientes && vivienda.baño"> • </span>
                <span v-if="vivienda.baño">Baño {{ vivienda.baño }}</span>
                <span v-if="vivienda.baño_opcion">
                  ({{ vivienda.baño_opcion }})
                </span>
              </div>
            </div>
          </q-card-section>

          <q-separator v-if="gisStore.marcadorSeleccionado.viviendas?.length" />

          <!-- 5. OCUPACIÓN -->
          <q-card-section v-if="gisStore.marcadorSeleccionado.ocupaciones?.length" class="q-pa-md">
            <div class="text-subtitle1 text-weight-medium q-mb-md flex items-center">
              <q-icon name="work" class="q-mr-xs" />
              Ocupación
              <q-chip :label="gisStore.marcadorSeleccionado.ocupaciones.length" color="orange" text-color="white"
                size="sm" class="q-ml-sm" />
            </div>
            <div v-for="(ocupacion, index) in gisStore.marcadorSeleccionado
              .ocupaciones" :key="index" class="q-mb-xs q-pa-sm rounded-borders"
              :class="$q.dark.isActive ? 'bg-orange-9' : 'bg-orange-1'">
              <!-- Mostrar nombre si existe, sino el tipo principal -->
              <div class="text-body2 text-weight-medium">
                {{ ocupacion.nombre || ocupacion.tipo_principal }}
              </div>
              <div class="text-caption text-grey">
                <span v-if="ocupacion.tipo_1">{{ ocupacion.tipo_1 }}</span>
                <span v-if="ocupacion.tipo_1 && ocupacion.tipo_2"> • </span>
                <span v-if="ocupacion.tipo_2">{{ ocupacion.tipo_2 }}</span>
              </div>
              <div v-if="ocupacion.ingresos" class="text-caption text-green text-weight-medium">
                Ingresos: ${{ ocupacion.ingresos.toLocaleString() }}
              </div>
            </div>
          </q-card-section>

          <q-separator v-if="gisStore.marcadorSeleccionado.ocupaciones?.length" />

          <!-- 6. INTEGRANTES -->
          <q-card-section class="q-pa-md">
            <div class="text-subtitle1 text-weight-medium q-mb-md flex items-center">
              <q-icon name="people" class="q-mr-xs" />
              Integrantes
              <q-chip v-if="gisStore.marcadorSeleccionado.integrantes?.length"
                :label="gisStore.marcadorSeleccionado.integrantes.length" color="blue" text-color="white" size="sm"
                class="q-ml-sm" />
            </div>
            <div v-if="gisStore.marcadorSeleccionado.integrantes?.length">
              <div v-for="(integrante, index) in gisStore.marcadorSeleccionado
                .integrantes" :key="index" class="row items-center q-py-xs q-mb-xs rounded-borders q-pa-sm"
                :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-1'">
                <q-avatar size="28px" class="q-mr-sm" color="blue-5" text-color="white">
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
                  <!-- Salud del integrante -->
                  <div v-if="integrante.salud?.length" class="q-mt-xs">
                    <div v-for="(saludItem, sIndex) in integrante.salud" :key="sIndex" class="text-caption">
                      <q-badge v-if="saludItem.cud" color="purple" text-color="white" class="q-mr-xs">CUD</q-badge>
                      <q-badge v-if="saludItem.obra_social" color="green" text-color="white" class="q-mr-xs">Obra
                        Social</q-badge>
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

          <!-- 7. SERVICIOS -->
          <q-card-section v-if="gisStore.marcadorSeleccionado.servicios?.length" class="q-pa-md">
            <div class="text-subtitle1 text-weight-medium q-mb-md flex items-center">
              <q-icon name="electrical_services" class="q-mr-xs" />
              Servicios
              <q-chip :label="gisStore.marcadorSeleccionado.servicios.length" color="indigo" text-color="white"
                size="sm" class="q-ml-sm" />
            </div>
            <div class="row q-col-gutter-sm">
              <div v-for="(servicio, index) in gisStore.marcadorSeleccionado
                .servicios" :key="index" class="col-6">
                <q-chip :color="servicio.opcion_servicio === 'Conectado' ? 'green' : 'red'
                  " text-color="white" size="sm" class="full-width">
                  <q-icon :name="servicio.opcion_servicio === 'Conectado'
                    ? 'check_circle'
                    : 'cancel'
                    " class="q-mr-xs" />
                  {{ servicio.nombre }}
                </q-chip>
              </div>
            </div>
          </q-card-section>

          <q-separator v-if="gisStore.marcadorSeleccionado.servicios?.length" />

          <!-- 8. PROGRAMAS -->
          <q-card-section class="q-pa-md">
            <div class="text-subtitle1 text-weight-medium q-mb-md flex items-center">
              <q-icon name="assignment" class="q-mr-xs" />
              Programas Activos
              <q-chip v-if="programasActivos.length" :label="programasActivos.length" color="primary" text-color="white"
                size="sm" class="q-ml-sm" />
            </div>

            <div v-if="programasActivos.length">
              <div v-for="(programa, index) in programasActivos" :key="index"
                class="text-body2 q-mb-xs q-pa-sm rounded-borders"
                :class="$q.dark.isActive ? 'bg-green-9' : 'bg-green-1'">
                <div class="text-weight-medium">{{ programa.tipo }}</div>
                <div class="text-caption">{{ programa.ayuda }}</div>
                <!-- Mostrar notas del programa si existen -->
                <div v-if="programa.notas" class="text-caption text-grey q-mt-xs">
                  <q-icon name="note" size="xs" class="q-mr-xs" />
                  {{ programa.notas }}
                </div>
                <q-badge v-if="programa.fechaInicio" color="green" class="q-mt-xs" text-color="white">
                  Desde:
                  {{ new Date(programa.fechaInicio).toLocaleDateString() }}
                </q-badge>
              </div>
            </div>
            <div v-else class="text-caption text-grey">Ninguno</div>

            <div class="q-mt-sm">
              <q-btn label="Historial de Programas" color="primary" flat @click="mostrarModalHistorial = true"
                :badge="programasInactivos.length || undefined" />
            </div>
          </q-card-section>

          <!-- Notas (al final si existen) -->
          <div v-if="gisStore.marcadorSeleccionado.notas">
            <q-separator />
            <q-card-section class="q-pa-md">
              <div class="text-subtitle1 text-weight-medium q-mb-md flex items-center">
                <q-icon name="note" class="q-mr-xs" />
                Notas
              </div>
              <div class="text-body2 q-pa-sm rounded-borders" :class="$q.dark.isActive ? 'bg-grey-8' : 'bg-grey-2'">
                {{ gisStore.marcadorSeleccionado.notas }}
              </div>
            </q-card-section>
          </div>
        </div>

        <!-- Acciones fijas en la parte inferior -->
        <div style="flex-shrink: 0">
          <q-separator />
          <q-card-actions class="q-pa-sm justify-end">
            <q-btn flat round icon="print" @click="generarPDF" size="md">
              <q-tooltip>Imprimir</q-tooltip>
            </q-btn>

            <HistorialMarcador :idMarcador="gisStore.marcadorSeleccionado.id"
              :marcador="gisStore.marcadorSeleccionado" />

            <q-btn flat v-if="permisos.puedeEditar" label="Editar" @click="editarMarcadorSeleccionado" color="orange-8"
              size="md" />

            <q-btn flat v-if="permisos.puedeEliminar" label="Eliminar" @click="eliminarMarcadorSeleccionado" color="red"
              size="md" />
          </q-card-actions>
        </div>
      </q-card>
    </div>

    <q-dialog v-model="mostrarModalHistorial">
      <q-card style="min-width: 350px; max-width: 550px">
        <q-card-section>
          <div class="text-h6">
            Historial de Programas
            <q-chip v-if="programasInactivos.length" :label="programasInactivos.length" color="grey" text-color="white"
              size="sm" class="q-ml-sm" />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div v-if="programasInactivos.length">
            <div v-for="(programa, index) in programasInactivos" :key="index" class="q-mb-sm">
              <div class="row items-center q-gutter-sm">
                <q-badge :color="colorPorEstado(programa.estado)" class="q-mr-sm">
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

    <!-- Drawer derecho mejorado -->
    <q-drawer v-model="drawerVisible" side="right" :width="500" overlay behavior="desktop" bordered>
      <!-- Header fijo con botón cerrar -->
      <div class="drawer-header bg-blue-5 text-white">
        <div class="row items-center justify-between q-pa-md">
          <div class="text-h6">Panel de Control</div>
          <q-btn icon="close" flat round color="white" @click="drawerVisible = false" class="close-btn" />
        </div>
      </div>

      <!-- Contenido scrolleable -->
      <q-scroll-area class="drawer-content">
        <q-card flat class="no-shadow">
          <!-- Panel de Referencias -->
          <q-card-section class="q-pa-md">
            <div class="section-title">
              <q-icon name="bookmark" class="q-mr-sm" color="primary" />
              Referencias
            </div>
            <div class="referencias-grid q-mt-md">
              <div v-for="icono in iconosDisponibles" :key="icono.value" class="referencia-item">
                <div class="referencia-icon">
                  <img :src="icono.value" width="28" height="28" />
                </div>
                <div class="referencia-label">{{ icono.label }}</div>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <!-- Datos cargados -->
          <q-card-section class="q-pa-md">
            <div class="section-title">
              <q-icon name="database" class="q-mr-sm" color="primary" />
              Datos cargados
            </div>

            <!-- Buscador mejorado -->
            <q-input dense outlined debounce="300" v-model="searchTerm" placeholder="Buscar por nombre o dirección"
              class="q-mt-md search-input" clearable prepend-inner-icon="search" />

            <!-- Lista de marcadores -->
            <div class="marcadores-lista q-mt-md">
              <div v-for="(marcador, index) in marcadoresFiltrados" :key="marcador.id" class="marcador-item"
                @click="verInfoMarcador(marcador)">
                <div class="marcador-content">
                  <div class="marcador-numero">{{ index + 1 }}</div>
                  <div class="marcador-info">
                    <div class="marcador-nombre">
                      {{ marcador.nombre }} {{ marcador.apellido }}
                    </div>
                    <div class="marcador-direccion">
                      {{ marcador.direccion }}
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

    <!-- Botón para abrir el drawer -->
    <q-btn v-if="!drawerVisible" icon="menu" round size="lg" color="primary" class="fixed-bottom-right q-mb-md q-mr-md"
      @click="drawerVisible = true">
      <q-tooltip> Ver referencias y datos </q-tooltip>
    </q-btn>


    <!-- Modal -->
    <q-drawer v-model="modalVisible" side="right" :width="800" overlay bordered behavior="desktop"
      v-if="!permisos.soloLectura">
      <q-card class="full-height column no-wrap">
        <!-- Header fijo -->
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
              <q-btn icon="close" flat round dense color="white" @click="cerrarModal" :disable="guardando" />
            </div>
          </div>
        </q-card-section>

        <!-- Contenido scrollable -->
        <q-card-section class="scroll-y q-pa-sm" style="max-height: calc(100vh - 150px);">
          <q-form ref="formulario" @submit="guardarMarcador">

            <!-- Información Básica -->
            <q-banner dense class="bg-grey-3 text-dark q-pa-sm q-mb-sm">
              <q-icon name="person" class="q-mr-sm" />
              Información Básica del Beneficiario
            </q-banner>
            <q-card class="q-mb-md q-pa-md bg-grey-1 rounded-borders shadow-1">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-6">
                  <q-input v-model="nuevoMarcador.nombre" label="Nombre *" dense outlined
                    :rules="[(val) => !!val || 'Requerido', (val) => val.length >= 3 || 'Min. 3 letras']" />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input v-model="nuevoMarcador.apellido" label="Apellido *" dense outlined
                    :rules="[(val) => !!val || 'Requerido', (val) => val.length >= 3 || 'Min. 3 letras']" />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input v-model="nuevoMarcador.dni" label="DNI *" type="number" dense outlined
                    :rules="[(val) => !!val || 'Requerido', (val) => /^\d{7,8}$/.test(val) || 'Debe tener 7 u 8 dígitos']" />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input v-model="nuevoMarcador.telefono" label="Teléfono *" type="number" dense outlined
                    :rules="[(val) => !!val || 'Requerido', (val) => /^\d{8,12}$/.test(val) || 'Debe tener 8 a 12 dígitos']" />
                </div>
                <div class="col-12">
                  <q-input v-model="nuevoMarcador.direccion" label="Domicilio *" dense outlined
                    :rules="[(val) => !!val || 'Requerido', (val) => val.length >= 5 || 'Min. 5 caracteres']" />
                </div>
                <div class="col-12 col-sm-6">
                  <q-select v-model="nuevoMarcador.barrio" label="Barrio *" :options="opcionesBarrios" dense outlined
                    :rules="[(val) => !!val || 'Seleccione un barrio']" />
                </div>
                <div class="col-12 col-sm-6">
                  <q-select v-model="nuevoMarcador.tiempo_residencia" label="Tiempo de residencia *"
                    :options="opcionesResidencia" dense outlined
                    :rules="[(val) => !!val || 'Seleccione tiempo de residencia']" />
                </div>
              </div>
            </q-card>

            <!-- Estudios -->
            <q-banner dense class="bg-grey-3 text-dark q-pa-sm q-mb-sm">
              <q-icon name="school" class="q-mr-sm" />
              Nivel de Estudios
            </q-banner>
            <q-card class="q-mb-md q-pa-md bg-grey-1 rounded-borders shadow-1">
              <div v-for="(estudio, index) in nuevoMarcador.estudios" :key="index" class="q-mb-md relative-position">
                <q-btn icon="close" color="negative" dense round size="sm" class="absolute-top-right q-ma-xs"
                  @click="eliminarEstudio(index)" />
                <q-select v-model="estudio.nivel" label="Nivel de estudios *" :options="opcionesEstudios" dense outlined
                  style="width: 50%;" :rules="[(val) => !!val || 'Debe seleccionar un nivel']" />
              </div>

              <q-btn icon="add_circle" label="Agregar estudio" color="primary" flat @click="agregarEstudio" />
            </q-card>

            <!-- Salud General -->
            <q-banner dense class="bg-grey-3 text-dark q-pa-sm q-mb-sm">
              <q-icon name="health_and_safety" class="q-mr-sm" />
              Información de Salud
            </q-banner>
            <q-card class="q-mb-md q-pa-md bg-grey-1 rounded-borders shadow-1">
              <div v-for="(saludItem, index) in nuevoMarcador.salud" :key="index" class="q-mb-md relative-position">
                <q-btn icon="close" color="negative" dense round size="sm" class="absolute-top-right q-ma-xs"
                  @click="eliminarSalud(index)" />
                <div class="row q-col-gutter-md q-pr-lg">
                  <div class="col-12 col-md-2">
                    <q-checkbox v-model="saludItem.cud" label="CUD" />
                  </div>
                  <div class="col-12 col-md-2">
                    <q-checkbox v-model="saludItem.obra_social" label="Obra Social" />
                  </div>
                  <div class="col-12 col-md-8">
                    <q-input v-model="saludItem.problema_salud" label="Problema de salud" dense outlined />
                  </div>
                </div>
              </div>
              <q-btn icon="add_circle" label="Agregar info salud" color="primary" flat @click="agregarSalud" />
            </q-card>

            <!-- Viviendas -->
            <q-banner dense class="bg-grey-3 text-dark q-pa-sm q-mb-sm">
              <q-icon name="home" class="q-mr-sm" />
              Vivienda
            </q-banner>
            <q-card class="q-mb-md q-pa-md bg-grey-1 rounded-borders shadow-1">
              <div v-for="(vivienda, index) in nuevoMarcador.viviendas" :key="index" class="q-mb-md relative-position">
                <q-btn icon="close" color="negative" dense round size="sm" class="absolute-top-right q-ma-xs"
                  @click="eliminarVivienda(index)" />
                <div class="row q-col-gutter-md q-pr-lg">
                  <div class="col-12 col-md-3">
                    <q-select v-model="vivienda.tipo" label="Tipo de vivienda" :options="opcionesTipoVivienda" dense
                      outlined :rules="[(val) => !!val || 'Debe seleccionar un tipo']" />
                  </div>
                  <div class="col-12 col-md-3">
                    <q-select v-model="vivienda.dominio" label="Dominio" :options="opcionesDominioVivienda" dense
                      outlined :rules="[(val) => !!val || 'Debe seleccionar el dominio']" />
                  </div>
                  <div class="col-12 col-md-3">
                    <q-select v-model="vivienda.ambientes" label="Ambientes" :options="opcionesAmbientes" dense
                      outlined />
                  </div>
                  <div class="col-12 col-md-3">
                    <q-select v-model="vivienda.baño" label="Baño" :options="opcionesBaño" dense outlined />
                  </div>
                </div>
              </div>
              <q-btn icon="add_circle" label="Agregar vivienda" color="primary" flat @click="agregarVivienda" />
            </q-card>

            <!-- Ocupaciones -->
            <q-banner dense class="bg-grey-3 text-dark q-pa-sm q-mb-sm">
              <q-icon name="work" class="q-mr-sm" />
              Ocupación
            </q-banner>
            <q-card class="q-mb-md q-pa-md bg-grey-1 rounded-borders shadow-1">
              <div v-for="(ocupacion, index) in nuevoMarcador.ocupaciones" :key="index"
                class="q-mb-md relative-position">
                <q-btn icon="close" color="negative" dense round size="sm" class="absolute-top-right q-ma-xs"
                  @click="eliminarOcupacion(index)" />
                <div class="row q-col-gutter-md q-pr-lg">
                  <div class="col-12 col-md-4">
                    <q-select v-model="ocupacion.tipo_principal" label="Tipo de ocupación" :options="opcionesOcupacion"
                      dense outlined @update:model-value="resetearTiposOcupacion(index)"
                      :rules="[(val) => !!val || 'Debe seleccionar un tipo']" />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-select v-model="ocupacion.tipo_1" label="Tipo 1"
                      :options="getTipoOcupacion1(ocupacion.tipo_principal)" dense outlined :disable="!ocupacion.tipo_principal ||
                        ![
                          'Trabajo reproductivo',
                          'Trabajo productivo',
                          'Estudiante',
                          'AUH/SUAF',
                        ].includes(ocupacion.tipo_principal)
                        " :rules="[
                          (val) =>
                            !ocupacion.tipo_principal ||
                            ![
                              'Trabajo reproductivo',
                              'Trabajo productivo',
                              'Estudiante',
                              'AUH/SUAF',
                            ].includes(ocupacion.tipo_principal) ||
                            !!val ||
                            'Debe seleccionar un tipo',
                        ]" />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-select v-model="ocupacion.tipo_2" label="Tipo 2"
                      :options="getTipoOcupacion2(ocupacion.tipo_principal)" dense outlined :disable="!ocupacion.tipo_principal ||
                        (ocupacion.tipo_principal !== 'Trabajo reproductivo' &&
                          ocupacion.tipo_principal !== 'Estudiante' &&
                          ocupacion.tipo_principal !== 'AUH/SUAF')
                        " :rules="[
                          (val) =>
                            ocupacion.tipo_principal !== 'Trabajo reproductivo' ||
                            ocupacion.tipo_principal !== 'Estudiante' ||
                            ocupacion.tipo_principal !== 'AUH/SUAF' ||
                            !!val ||
                            'Debe seleccionar un tipo',
                        ]" />
                  </div>
                  <div class="col-12">
                    <q-input v-model.number="ocupacion.ingresos" label="Ingresos" type="number" dense outlined :min="0"
                      :disable="!ocupacion.tipo_principal ||
                        (ocupacion.tipo_principal !== 'Trabajo reproductivo' &&
                          ocupacion.tipo_principal !== 'Trabajo productivo' &&
                          ocupacion.tipo_principal !== 'AUH/SUAF' &&
                          ocupacion.tipo_principal !== 'Estudiante')
                        " />
                  </div>
                </div>
              </div>
              <q-btn icon="add_circle" label="Agregar ocupación" color="primary" flat @click="agregarOcupacion" />
            </q-card>

            <!-- Integrantes -->
            <q-banner dense class="bg-grey-3 text-dark q-pa-sm q-mb-sm">
              <q-icon name="people" class="q-mr-sm" />
              Integrantes *
            </q-banner>
            <q-card class="q-mb-md q-pa-md bg-grey-1 rounded-borders shadow-1">
              <div v-for="(integrante, index) in nuevoMarcador.integrantes" :key="index"
                class="q-mb-md relative-position">
                <q-btn icon="close" color="negative" dense round size="sm" class="absolute-top-right q-ma-xs"
                  @click="eliminarIntegrante(index)" />

                <!-- Información básica del integrante -->
                <div class="row q-col-gutter-md q-mb-md q-pr-lg">
                  <div class="col-12 col-md-4">
                    <q-input v-model="integrante.nombre" label="Nombre" dense outlined :rules="[
                      (val) => !!val || 'El nombre es obligatorio',
                      (val) =>
                        val.length >= 2 || 'Debe tener al menos 2 caracteres',
                      (val) =>
                        /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val) ||
                        'Solo se permiten letras y espacios',
                    ]" />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input v-model="integrante.apellido" label="Apellido" dense outlined :rules="[
                      (val) => !!val || 'El apellido es obligatorio',
                      (val) =>
                        val.length >= 2 || 'Debe tener al menos 2 caracteres',
                      (val) =>
                        /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val) ||
                        'Solo se permiten letras y espacios',
                    ]" />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-select v-model="integrante.vinculo" label="Vínculo" :options="opcionesVinculo" dense outlined
                      :rules="[(val) => !!val || 'Debe seleccionar un vínculo']" />
                  </div>
                </div>

                <div class="row q-col-gutter-md q-mb-md q-pr-lg">
                  <div class="col-12 col-md-6">
                    <q-input v-model.number="integrante.edad" label="Edad" type="number" dense outlined :rules="[
                      (val) => !!val || 'La edad es obligatoria',
                      (val) =>
                        (val >= 0 && val <= 120) ||
                        'La edad debe estar entre 0 y 120 años',
                    ]" />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input v-model="integrante.dni" label="DNI" type="number" dense outlined :rules="[
                      (val) => !!val || 'El DNI es obligatorio',
                      (val) =>
                        /^\d{7,8}$/.test(val) ||
                        'El DNI debe tener 7 u 8 dígitos',
                    ]" />
                  </div>
                </div>

                <!-- Salud del integrante -->
                <div class="text-subtitle2 q-mb-sm q-mt-md">Información de Salud</div>
                <div v-for="(saludItem, saludIndex) in integrante.salud" :key="saludIndex"
                  class="q-mb-md q-pa-sm bg-white rounded relative-position">
                  <q-btn icon="close" color="negative" flat dense round size="sm" class="absolute-top-right q-ma-xs"
                    @click="eliminarSaludIntegrante(index, saludIndex)" />
                  <div class="row q-col-gutter-md items-center q-pr-lg">
                    <div class="col-12 col-md-3">
                      <q-checkbox v-model="saludItem.cud" label="CUD" />
                    </div>
                    <div class="col-12 col-md-3">
                      <q-checkbox v-model="saludItem.obra_social" label="Obra Social" />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input v-model="saludItem.problema_salud" label="Problema de salud" dense outlined />
                    </div>
                  </div>
                </div>
                <q-btn icon="add" label="Agregar info salud" color="primary" flat size="sm"
                  @click="agregarSaludIntegrante(index)" />

                <!-- Ocupación del integrante -->
                <div class="text-subtitle2 q-mb-sm q-mt-md">Ocupación</div>
                <div v-for="(ocupacion, ocupacionIndex) in integrante.ocupaciones" :key="ocupacionIndex"
                  class="q-mb-md q-pa-sm bg-white rounded relative-position">
                  <q-btn icon="close" color="negative" flat dense round size="sm" class="absolute-top-right q-ma-xs"
                    @click="eliminarOcupacionIntegrante(index, ocupacionIndex)" />
                  <div class="row q-col-gutter-md q-pr-lg">
                    <div class="col-12 col-md-4">
                      <q-select v-model="ocupacion.tipo_principal" label="Tipo de ocupación"
                        :options="opcionesOcupacion" dense outlined @update:model-value="
                          resetearTiposOcupacionIntegrante(
                            index,
                            ocupacionIndex
                          )
                          " :rules="[(val) => !!val || 'Debe seleccionar un tipo']" />
                    </div>
                    <div class="col-12 col-md-4">
                      <q-select v-model="ocupacion.tipo_1" label="Tipo 1"
                        :options="getTipoOcupacion1(ocupacion.tipo_principal)" dense outlined :disable="!ocupacion.tipo_principal ||
                          ![
                            'Trabajo reproductivo',
                            'Trabajo productivo',
                            'Estudiante',
                            'AUH/SUAF',
                          ].includes(ocupacion.tipo_principal)
                          " :rules="[
                            (val) =>
                              !ocupacion.tipo_principal ||
                              ![
                                'Trabajo reproductivo',
                                'Trabajo productivo',
                                'Estudiante',
                                'AUH/SUAF',
                              ].includes(ocupacion.tipo_principal) ||
                              !!val ||
                              'Debe seleccionar un tipo',
                          ]" />
                    </div>
                    <div class="col-12 col-md-4">
                      <q-select v-model="ocupacion.tipo_2" label="Tipo 2"
                        :options="getTipoOcupacion2(ocupacion.tipo_principal)" dense outlined :disable="!ocupacion.tipo_principal ||
                          (ocupacion.tipo_principal !==
                            'Trabajo reproductivo' &&
                            ocupacion.tipo_principal !== 'Estudiante' &&
                            ocupacion.tipo_principal !== 'AUH/SUAF')
                          " :rules="[
                            (val) =>
                              ocupacion.tipo_principal !==
                              'Trabajo reproductivo' ||
                              ocupacion.tipo_principal !== 'Estudiante' ||
                              ocupacion.tipo_principal !== 'AUH/SUAF' ||
                              !!val ||
                              'Debe seleccionar un tipo',
                          ]" />
                    </div>
                    <div class="col-12">
                      <q-input v-model.number="ocupacion.ingresos" label="Ingresos" type="number" dense outlined
                        :min="0" :disable="!ocupacion.tipo_principal ||
                          (ocupacion.tipo_principal !==
                            'Trabajo reproductivo' &&
                            ocupacion.tipo_principal !== 'Trabajo productivo' &&
                            ocupacion.tipo_principal !== 'AUH/SUAF' &&
                            ocupacion.tipo_principal !== 'Estudiante')
                          " />
                    </div>
                  </div>
                </div>
                <q-btn icon="add" label="Agregar ocupación" color="primary" flat size="sm"
                  @click="agregarOcupacionIntegrante(index)" />
              </div>
              <q-btn icon="add_circle" label="Agregar integrante" color="primary" flat @click="agregarIntegrante" />
            </q-card>

            <!-- Servicios -->
            <q-banner dense class="bg-grey-3 text-dark q-pa-sm q-mb-sm">
              <q-icon name="miscellaneous_services" class="q-mr-sm" />
              Servicios
            </q-banner>
            <q-card class="q-mb-md q-pa-md bg-grey-1 rounded-borders shadow-1">
              <div v-for="(servicio, index) in nuevoMarcador.servicios" :key="index" class="q-mb-md relative-position">
                <q-btn icon="close" color="negative" dense round size="sm" class="absolute-top-right q-ma-xs"
                  @click="eliminarServicio(index)" />
                <div class="row q-col-gutter-md q-pr-lg">
                  <div class="col-12 col-md-6">
                    <q-select v-model="servicio.nombre" label="Servicio" :options="opcionesServicios" dense outlined
                      @update:model-value="resetearOpcionServicio(index)"
                      :rules="[(val) => !!val || 'Debe seleccionar un servicio']" />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-select v-model="servicio.opcion_servicio" label="Opción"
                      :options="getOpcionesxServicios(servicio.nombre)" dense outlined :disable="!servicio.nombre"
                      :rules="[
                        (val) =>
                          !servicio.nombre ||
                          !!val ||
                          'Debe seleccionar una opción',
                      ]" />
                  </div>
                </div>
              </div>
              <q-btn icon="add_circle" label="Agregar servicio" color="primary" flat @click="agregarServicio" />
            </q-card>

            <!-- Programas -->
            <q-banner dense class="bg-grey-3 text-dark q-pa-sm q-mb-sm">
              <q-icon name="library_books" class="q-mr-sm" />
              Programas *
            </q-banner>
            <q-card class="q-mb-md q-pa-md bg-grey-1 rounded-borders shadow-1">
              <div v-for="(programa, index) in nuevoMarcador.programas" :key="index" class="q-mb-md relative-position">
                <q-btn icon="close" color="negative" dense round size="sm" class="absolute-top-right q-ma-xs"
                  @click="eliminarPrograma(index)">
                  <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 10]">
                    Finalizar programa
                  </q-tooltip>
                </q-btn>

                <!-- Primera fila: Tipo + Ayuda -->
                <div class="row q-col-gutter-md q-pr-lg q-mb-md">
                  <div class="col-12 col-md-6">
                    <q-select v-model="programa.tipo" label="Tipo" :options="tiposPrograma" dense outlined
                      @update:model-value="resetearAyuda(index)"
                      :rules="[(val) => !!val || 'Debe seleccionar un tipo']" />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-select v-model="programa.ayuda" label="Ayuda" :options="getOpcionesAyuda(programa.tipo)" dense
                      outlined :disable="!programa.tipo || programa.tipo === 'SUBSIDIOS'" :rules="[
                        (val) =>
                          programa.tipo === 'SUBSIDIOS' ||
                          !!val ||
                          'Debe seleccionar una ayuda',
                      ]" />
                  </div>
                </div>

                <!-- Segunda fila: Notas -->
                <div class="row q-pr-lg">
                  <div class="col-12">
                    <q-input v-model="programa.notas" label="Notas" type="textarea" dense outlined :rules="[
                      (val) =>
                        !val ||
                        val.length <= 500 ||
                        'Las notas no pueden exceder 500 caracteres',
                    ]" />
                  </div>
                </div>
              </div>
              <q-btn icon="add_circle" label="Agregar programa" color="primary" flat @click="agregarPrograma" />
            </q-card>

            <!-- Observaciones -->
            <q-banner dense class="bg-grey-3 text-dark q-pa-sm q-mb-sm">
              <q-icon name="notes" class="q-mr-sm" />
              Observaciones
            </q-banner>
            <q-card class="q-mb-md q-pa-md bg-grey-1 rounded-borders shadow-1">
              <q-input v-model="nuevoMarcador.notas" label="Observaciones" type="textarea" dense outlined :rules="[
                (val) =>
                  !val ||
                  val.length <= 500 ||
                  'Las notas no pueden exceder 500 caracteres',
              ]" />
            </q-card>

            <!-- Ícono del Marcador -->
            <q-banner dense class="bg-grey-3 text-dark q-pa-sm q-mb-sm">
              <q-icon name="place" class="q-mr-sm" />
              Ícono del Marcador
            </q-banner>
            <q-card class="q-mb-md q-pa-md bg-grey-1 rounded-borders shadow-1">
              <q-select v-model="nuevoMarcador.icono" label="Ícono del marcador" :options="iconosDisponibles"
                option-value="value" option-label="label" emit-value map-options outlined dense
                :rules="[(val) => !!val || 'Debe seleccionar un ícono']">
                <!-- Slot para opciones con imágenes -->
                <template v-slot:option="scope">
                  <q-item clickable v-bind="scope.itemProps">
                    <q-item-section avatar>
                      <q-img :src="scope.opt.value" :alt="scope.opt.label" style="width: 32px; height: 32px" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ scope.opt.label }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>

                <!-- Slot para mostrar la imagen seleccionada -->
                <template v-slot:selected-item="scope">
                  <q-chip dense square class="q-ma-none">
                    <q-img :src="scope.opt.value" style="width: 20px; height: 20px" class="q-mr-sm" />
                    {{ scope.opt.label }}
                  </q-chip>
                </template>
              </q-select>
            </q-card>

            <!-- Botones de acción -->
            <q-card-actions align="right" class="q-pa-md">
              <q-btn flat label="Cancelar" @click="cerrarModal" color="negative" :disable="guardando" />
              <q-btn flat :label="editando ? 'Guardar cambios' : 'Guardar'" @click="validarYGuardar" color="positive"
                :loading="guardando" :disable="guardando" />
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
import { OSM } from 'ol/source';
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
const searchTerm = ref('');
const guardando = ref(false); // ✅ NUEVO: Variable para el loading
const drawerVisible = ref(false);



// Ref para el formulario
const formulario = ref();

// Variables para el tooltip
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
const iconosDisponibles = [
  { label: 'Vulnerabilidad Alta', value: '/marker-icon.png' },
  { label: 'Vulnerabilidad Media', value: '/marker-icon-2.png' },
  { label: 'Vulnerabilidad Baja', value: '/marker-icon-3.png' },
  { label: 'Intervención Especifica', value: '/marker-icon-4.png' },
];

// Opciones para los selectores de programas
const tiposPrograma = [
  'PROGRAMAS ALIMENTARIOS',
  'CONTRAPRESTACIÓN',
  'SUBSIDIOS', // ✅ CORREGIDO: Cambié de 'SUBSIDIOS' a 'SUBSIDIOS'
];

const opcionesAyuda = {
  'PROGRAMAS ALIMENTARIOS': [
    'AM - Ayuda Mensual',
    'DBT - Diabéticos',
    'ES - Esp. Solidario',
    'AU - Ayuda Urgente',
    'DE - Dietas Especiales',
  ],
  CONTRAPRESTACIÓN: ['Gas', 'Luz', 'Banco Materiales'],
  SUBSIDIOS: [], // ✅ CORREGIDO: Cambié de 'SUBSIDIOS' a 'SUBSIDIOS'
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

const opcionesBaño = ['Interior', 'Exterior', 'Compartido', 'Sin baño'];

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
    notas: string;
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

const marcadoresFiltrados = computed(() => {
  const term = searchTerm.value.toLowerCase();
  return gisStore.marcadores
    .filter((m) => {
      return (
        m.nombre.toLowerCase().includes(term) ||
        m.apellido.toLowerCase().includes(term) ||
        m.direccion.toLowerCase().includes(term)
      );
    })
    .slice()
    .reverse();
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
    layers: [new TileLayer({ source: new OSM() }), vectorLayer],
    view: new View({
      center: fromLonLat([-57.1339, -37.0017]),
      zoom: 15,
      minZoom: 14, // Zoom mínimo permitido
      maxZoom: 18, // Zoom máximo permitido
      extent: extent, // Límites del área visible
      constrainOnlyCenter: false, // Restringe toda la vista, no solo el centro
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
    notas: '',
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

// Función mejorada para generar PDF con diseño de tarjetas/cuadros
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
    const doc = new jsPDF('p', 'mm', 'a4');

    // ===== CONFIGURACIÓN OPTIMIZADA =====
    const CONFIG = {
      margins: { top: 12, right: 12, bottom: 15, left: 12 },
      pageWidth: doc.internal.pageSize.width,
      pageHeight: doc.internal.pageSize.height,
      colors: {
        primary: [25, 118, 210],
        success: [76, 175, 80],
        error: [244, 67, 54],
        warning: [255, 152, 0],
        info: [33, 150, 243],
        text: [33, 33, 33],
        textSecondary: [117, 117, 117],
        light: [248, 249, 250],
        cardBg: [250, 250, 250],
        cardBorder: [220, 220, 220],
      },
      fonts: {
        title: { size: 14, style: 'bold' },
        cardTitle: { size: 9, style: 'bold' },
        cardLabel: { size: 7, style: 'bold' },
        cardValue: { size: 7, style: 'normal' },
        small: { size: 6, style: 'normal' },
        tiny: { size: 5, style: 'normal' },
      },
      card: {
        padding: 3,
        margin: 2,
        cornerRadius: 1,
        headerHeight: 8,
        minHeight: 15,
      },
    };

    let yPos = CONFIG.margins.top;
    const contentWidth =
      CONFIG.pageWidth - CONFIG.margins.left - CONFIG.margins.right;

    // ===== FUNCIONES HELPER MEJORADAS =====

    // Función para limpiar caracteres especiales
    function cleanText(text, preserveSpaces = true) {
      if (!text || typeof text !== 'string') return '';

      let cleaned = text
        .replace(/%ª/g, '')
        .replace(/%Ï/g, '')
        .replace(/%[a-zA-Z]/g, '')
        .replace(/[^\w\s\-.,;:()\[\]\/]/g, '')
        .trim();

      if (preserveSpaces) {
        cleaned = cleaned.replace(/\s+/g, ' ');
      }

      return cleaned;
    }

    function getSafeValue(value, defaultValue = 'N/A') {
      if (value === null || value === undefined || value === '') {
        return defaultValue;
      }

      const cleanedValue = cleanText(String(value));
      return cleanedValue || defaultValue;
    }

    function setColor(colorArray) {
      doc.setTextColor(colorArray[0], colorArray[1], colorArray[2]);
    }

    function setFont(fontConfig) {
      doc.setFontSize(fontConfig.size);
      doc.setFont('helvetica', fontConfig.style);
    }

    function checkPageBreak(requiredSpace = 15) {
      if (yPos > CONFIG.pageHeight - CONFIG.margins.bottom - requiredSpace) {
        doc.addPage();
        yPos = CONFIG.margins.top + 5;
        return true;
      }
      return false;
    }

    // ===== FUNCIONES PARA TARJETAS =====

    // Crear tarjeta básica
    function createCard(
      x,
      y,
      width,
      height,
      title,
      color = CONFIG.colors.primary
    ) {
      // Fondo de la tarjeta
      doc.setFillColor(
        CONFIG.colors.cardBg[0],
        CONFIG.colors.cardBg[1],
        CONFIG.colors.cardBg[2]
      );
      doc.rect(x, y, width, height, 'F');

      // Borde de la tarjeta
      doc.setDrawColor(
        CONFIG.colors.cardBorder[0],
        CONFIG.colors.cardBorder[1],
        CONFIG.colors.cardBorder[2]
      );
      doc.setLineWidth(0.3);
      doc.rect(x, y, width, height, 'S');

      // Header de la tarjeta
      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(x, y, width, CONFIG.card.headerHeight, 'F');

      // Título de la tarjeta
      setFont(CONFIG.fonts.cardTitle);
      doc.setTextColor(255, 255, 255);
      doc.text(cleanText(title).toUpperCase(), x + CONFIG.card.padding, y + 5);

      return {
        contentX: x + CONFIG.card.padding,
        contentY: y + CONFIG.card.headerHeight + CONFIG.card.padding,
        contentWidth: width - CONFIG.card.padding * 2,
        contentHeight:
          height - CONFIG.card.headerHeight - CONFIG.card.padding * 2,
      };
    }

    // Agregar campo en tarjeta
    function addCardField(label, value, x, y, maxWidth) {
      const cleanLabel = getSafeValue(label);
      const cleanValue = getSafeValue(value);

      if (cleanValue === 'N/A') return y;

      // Label
      setFont(CONFIG.fonts.cardLabel);
      setColor(CONFIG.colors.textSecondary);
      doc.text(`${cleanLabel}:`, x, y);

      // Value
      setFont(CONFIG.fonts.cardValue);
      setColor(CONFIG.colors.text);

      const valueLines = doc.splitTextToSize(cleanValue, maxWidth - 5);
      valueLines.forEach((line, index) => {
        doc.text(line, x, y + 3 + index * 3);
      });

      return y + 3 + valueLines.length * 3 + 1;
    }

    // Agregar lista en tarjeta
    function addCardList(items, x, y, maxWidth, columns = 1) {
      const cleanItems = items
        .filter((item) => item && item.toString().trim())
        .map((item) => getSafeValue(item))
        .filter((item) => item !== 'N/A');

      if (cleanItems.length === 0) return y;

      const columnWidth = maxWidth / columns;
      let currentColumn = 0;
      let currentY = y;
      let maxY = y;

      setFont(CONFIG.fonts.cardValue);
      setColor(CONFIG.colors.text);

      cleanItems.forEach((item, index) => {
        const itemX = x + currentColumn * columnWidth;

        // Bullet
        doc.text('•', itemX, currentY);

        // Texto
        const lines = doc.splitTextToSize(item, columnWidth - 8);
        lines.forEach((line, lineIndex) => {
          doc.text(line, itemX + 4, currentY + lineIndex * 3);
        });

        const itemHeight = lines.length * 3;
        maxY = Math.max(maxY, currentY + itemHeight);

        currentColumn++;
        if (currentColumn >= columns) {
          currentColumn = 0;
          currentY = maxY + 2;
        }
      });

      return Math.max(maxY, currentY) + 2;
    }

    // Calcular altura necesaria para contenido
    function calculateContentHeight(fields) {
      let height = CONFIG.card.headerHeight + CONFIG.card.padding * 2;

      fields.forEach((field) => {
        if (field.value && getSafeValue(field.value) !== 'N/A') {
          height += 8; // Altura base por campo

          // Calcular líneas adicionales si el texto es largo
          const lines = doc.splitTextToSize(getSafeValue(field.value), 60);
          if (lines.length > 1) {
            height += (lines.length - 1) * 3;
          }
        }
      });

      return Math.max(height, CONFIG.card.minHeight);
    }

    // ===== GENERACIÓN DEL DOCUMENTO CON TARJETAS =====

    // Título principal
    doc.setFillColor(
      CONFIG.colors.primary[0],
      CONFIG.colors.primary[1],
      CONFIG.colors.primary[2]
    );
    doc.rect(CONFIG.margins.left - 5, yPos - 3, contentWidth + 10, 20, 'F');

    setFont(CONFIG.fonts.title);
    doc.setTextColor(255, 255, 255);
    const titleText = 'REPORTE DE INFORMACIÓN PERSONAL';
    const titleWidth = doc.getTextWidth(titleText);
    const titleX = (CONFIG.pageWidth - titleWidth) / 2;
    doc.text(titleText, titleX, yPos + 8);

    setFont(CONFIG.fonts.small);
    const subtitleText = `Generado: ${new Date().toLocaleDateString(
      'es-ES'
    )} ${new Date().toLocaleTimeString('es-ES')}`;
    const subtitleWidth = doc.getTextWidth(subtitleText);
    const subtitleX = (CONFIG.pageWidth - subtitleWidth) / 2;
    doc.text(subtitleText, subtitleX, yPos + 14);

    yPos += 25;

    // ===== TARJETAS DE INFORMACIÓN =====

    // 1. INFORMACIÓN BÁSICA
    {
      const baseHeight = CONFIG.card.headerHeight + CONFIG.card.padding * 2;
      const lineHeight = 5;
      const basicHeight = baseHeight + 3 * lineHeight;
      checkPageBreak(basicHeight);
      const basicCard = createCard(
        CONFIG.margins.left,
        yPos,
        contentWidth,
        basicHeight,
        'INFORMACION BASICA',
        CONFIG.colors.primary
      );

      let cardY = basicCard.contentY;
      cardY = addCardField(
        'Nombre Completo',
        `${getSafeValue(marcador.nombre)} ${getSafeValue(marcador.apellido)}`,
        basicCard.contentX,
        cardY,
        basicCard.contentWidth
      );
      cardY = addCardField(
        'DNI',
        marcador.dni,
        basicCard.contentX,
        cardY,
        basicCard.contentWidth
      );
      cardY = addCardField(
        'Domicilio',
        marcador.direccion,
        basicCard.contentX,
        cardY,
        basicCard.contentWidth
      );

      const col2X = basicCard.contentX + basicCard.contentWidth / 2;
      let cardY2 = basicCard.contentY;
      cardY2 = addCardField(
        'Teléfono',
        marcador.telefono,
        col2X,
        cardY2,
        basicCard.contentWidth / 2
      );
      cardY2 = addCardField(
        'Barrio',
        marcador.barrio,
        col2X,
        cardY2,
        basicCard.contentWidth / 2
      );
      cardY2 = addCardField(
        'Tiempo Residencia',
        marcador.tiempo_residencia,
        col2X,
        cardY2,
        basicCard.contentWidth / 2
      );

      yPos += basicHeight + 3;
    }

    // 2. EDUCACION Y SALUD
    {
      const cardWidth = (contentWidth - 5) / 2;

      // Educación
      let estudiosItems =
        marcador.estudios
          ?.map((e) => getSafeValue(e.nivel))
          .filter((e) => e !== 'N/A') || [];
      let alturaEstudios =
        CONFIG.card.headerHeight +
        CONFIG.card.padding * 2 +
        estudiosItems.length * 4;
      if (estudiosItems.length === 0) alturaEstudios += 4;

      checkPageBreak(alturaEstudios);
      const studyCard = createCard(
        CONFIG.margins.left,
        yPos,
        cardWidth,
        alturaEstudios,
        'EDUCACION',
        CONFIG.colors.info
      );
      if (estudiosItems.length > 0) {
        addCardList(
          estudiosItems,
          studyCard.contentX,
          studyCard.contentY,
          studyCard.contentWidth,
          1
        );
      } else {
        setFont(CONFIG.fonts.cardValue);
        setColor(CONFIG.colors.textSecondary);
        doc.text('Sin información', studyCard.contentX, studyCard.contentY);
      }

      // Salud
      let alturaSalud = CONFIG.card.headerHeight + CONFIG.card.padding * 2;
      if (marcador.salud?.length > 0) {
        marcador.salud.forEach((s) => {
          if (getSafeValue(s.problema_salud) !== 'N/A') {
            alturaSalud += 4;
            if (s.cud || s.obra_social) alturaSalud += 3;
          }
        });
        if (alturaSalud === CONFIG.card.headerHeight + CONFIG.card.padding * 2)
          alturaSalud += 4;
      } else {
        alturaSalud += 4;
      }

      const healthCard = createCard(
        CONFIG.margins.left + cardWidth + 5,
        yPos,
        cardWidth,
        alturaSalud,
        'SALUD',
        CONFIG.colors.error
      );
      if (marcador.salud?.length > 0) {
        let healthY = healthCard.contentY;
        let hasValidHealth = false;

        marcador.salud.forEach((saludItem) => {
          const problema = getSafeValue(saludItem.problema_salud);
          if (problema !== 'N/A') {
            hasValidHealth = true;
            setFont(CONFIG.fonts.cardValue);
            setColor(CONFIG.colors.text);
            doc.text(`• ${problema}`, healthCard.contentX, healthY);
            healthY += 4;

            let cobertura = [];
            if (saludItem.cud) cobertura.push('CUD');
            if (saludItem.obra_social) cobertura.push('O.S.');

            if (cobertura.length > 0) {
              setFont(CONFIG.fonts.tiny);
              setColor(CONFIG.colors.textSecondary);
              doc.text(
                `  ${cobertura.join(', ')}`,
                healthCard.contentX,
                healthY
              );
              healthY += 3;
            }
          }
        });

        if (!hasValidHealth) {
          setFont(CONFIG.fonts.cardValue);
          setColor(CONFIG.colors.textSecondary);
          doc.text('Sin información', healthCard.contentX, healthCard.contentY);
        }
      } else {
        setFont(CONFIG.fonts.cardValue);
        setColor(CONFIG.colors.textSecondary);
        doc.text('Sin información', healthCard.contentX, healthCard.contentY);
      }

      yPos += Math.max(alturaEstudios, alturaSalud) + 3;
    }

    {
      let alturaVivienda = CONFIG.card.headerHeight + CONFIG.card.padding * 2;

      if (marcador.viviendas?.length > 0) {
        // Cada vivienda ocupa 2 filas de campos → 2 * altura por vivienda
        alturaVivienda += marcador.viviendas.length * (2 * 6); // 6 es el alto estimado por campo
      } else {
        alturaVivienda += 5;
      }

      checkPageBreak(alturaVivienda);
      const housingCard = createCard(
        CONFIG.margins.left,
        yPos,
        contentWidth,
        alturaVivienda,
        'VIVIENDA',
        CONFIG.colors.warning
      );

      if (marcador.viviendas?.length > 0) {
        let housingY = housingCard.contentY;
        const col1X = housingCard.contentX;
        const col2X = housingCard.contentX + housingCard.contentWidth / 2;
        const colWidth = housingCard.contentWidth / 2;

        marcador.viviendas.forEach((vivienda, index) => {
          // Fila 1
          housingY = addCardField(
            'Tipo',
            getSafeValue(vivienda.tipo),
            col1X,
            housingY,
            colWidth
          );
          housingY = addCardField(
            'Dominio',
            getSafeValue(vivienda.dominio),
            col2X,
            housingY - 6,
            colWidth
          ); // misma fila

          // Fila 2
          housingY = addCardField(
            'Ambientes',
            getSafeValue(vivienda.ambientes),
            col1X,
            housingY,
            colWidth
          );

          const bañoInfo =
            getSafeValue(vivienda.baño) +
            (vivienda.baño_opcion
              ? ` (${getSafeValue(vivienda.baño_opcion)})`
              : '');
          housingY = addCardField(
            'Baño',
            bañoInfo,
            col2X,
            housingY - 6,
            colWidth
          ); // misma fila

          housingY += 2; // espacio entre viviendas
        });
      } else {
        setFont(CONFIG.fonts.cardValue);
        setColor(CONFIG.colors.textSecondary);
        doc.text(
          'Sin información de vivienda',
          housingCard.contentX,
          housingCard.contentY
        );
      }

      yPos += alturaVivienda + 3;
    }

    // 4. OCUPACION
    // 4. TARJETA DE OCUPACIÓN (con altura dinámica)
    if (marcador.ocupaciones && marcador.ocupaciones.length > 0) {
      // Calcular altura necesaria
      const ocupacionesAltura = marcador.ocupaciones.reduce(
        (acc, ocupacion) => {
          let altura = 6; // ocupación + título
          if (ocupacion.tipo_1 || ocupacion.tipo_2) altura += 5;
          if (ocupacion.ingresos) altura += 5;
          return acc + altura + 2; // +2 de espacio extra
        },
        CONFIG.card.headerHeight + CONFIG.card.padding * 2
      );

      checkPageBreak(ocupacionesAltura);
      const jobCard = createCard(
        CONFIG.margins.left,
        yPos,
        contentWidth,
        ocupacionesAltura,
        'OCUPACIÓN',
        CONFIG.colors.success
      );

      let jobY = jobCard.contentY;

      marcador.ocupaciones.forEach((ocupacion, index) => {
        const nombreOcupacion = getSafeValue(
          ocupacion.nombre || ocupacion.tipo_principal
        );
        if (nombreOcupacion !== 'N/A') {
          jobY = addCardField(
            `Ocupación ${index + 1}`,
            nombreOcupacion,
            jobCard.contentX,
            jobY,
            jobCard.contentWidth
          );

          const tipo1 = getSafeValue(ocupacion.tipo_1);
          const tipo2 = getSafeValue(ocupacion.tipo_2);
          if (tipo1 !== 'N/A' || tipo2 !== 'N/A') {
            jobY = addCardField(
              'Tipo',
              `${tipo1} - ${tipo2}`,
              jobCard.contentX + 10,
              jobY,
              jobCard.contentWidth - 10
            );
          }

          if (ocupacion.ingresos && !isNaN(ocupacion.ingresos)) {
            jobY = addCardField(
              'Ingresos',
              `$${ocupacion.ingresos.toLocaleString('es-ES')}`,
              jobCard.contentX + 10,
              jobY,
              jobCard.contentWidth - 10
            );
          }

          jobY += 2; // espacio entre ocupaciones
        }
      });

      yPos += ocupacionesAltura + 3;
    } else {
      checkPageBreak(25);
      const jobCard = createCard(
        CONFIG.margins.left,
        yPos,
        contentWidth,
        22,
        'OCUPACIÓN',
        CONFIG.colors.success
      );
      setFont(CONFIG.fonts.cardValue);
      setColor(CONFIG.colors.textSecondary);
      doc.text(
        'Sin ocupaciones registradas',
        jobCard.contentX,
        jobCard.contentY
      );
      yPos += 25;
    }

    // 5. INTEGRANTES
    {
      let alturaIntegrantes =
        CONFIG.card.headerHeight + CONFIG.card.padding * 2;
      if (marcador.integrantes?.length > 0)
        alturaIntegrantes += 10 + marcador.integrantes.length * 4;
      else alturaIntegrantes += 4;

      checkPageBreak(alturaIntegrantes);
      const membersCard = createCard(
        CONFIG.margins.left,
        yPos,
        contentWidth,
        alturaIntegrantes,
        'INTEGRANTES DEL HOGAR',
        CONFIG.colors.success
      );

      if (marcador.integrantes?.length > 0) {
        let membersY = membersCard.contentY;

        const totalIntegrantes = marcador.integrantes.length;
        const edadesValidas = marcador.integrantes
          .filter((i) => i.edad && !isNaN(i.edad))
          .map((i) => parseInt(i.edad));
        const edadPromedio =
          edadesValidas.length > 0
            ? Math.round(
              edadesValidas.reduce((sum, edad) => sum + edad, 0) /
              edadesValidas.length
            )
            : 'N/A';

        membersY = addCardField(
          'Total',
          `${totalIntegrantes} integrantes`,
          membersCard.contentX,
          membersY,
          membersCard.contentWidth / 2
        );
        addCardField(
          'Edad Promedio',
          edadPromedio !== 'N/A' ? `${edadPromedio} años` : 'N/A',
          membersCard.contentX + membersCard.contentWidth / 2,
          membersCard.contentY,
          membersCard.contentWidth / 2
        );

        setFont(CONFIG.fonts.cardLabel);
        setColor(CONFIG.colors.textSecondary);
        doc.text('DETALLE:', membersCard.contentX, membersY + 2);
        membersY += 6;

        marcador.integrantes.forEach((i, index) => {
          const nombre = getSafeValue(i.nombre);
          const apellido = getSafeValue(i.apellido);
          const edad = getSafeValue(i.edad);
          const vinculo = getSafeValue(i.vinculo);

          setFont(CONFIG.fonts.cardValue);
          setColor(CONFIG.colors.text);
          doc.text(
            `${index + 1}. ${nombre} ${apellido} (${edad} años) - ${vinculo}`,
            membersCard.contentX,
            membersY
          );
          membersY += 4;
        });
      } else {
        setFont(CONFIG.fonts.cardValue);
        setColor(CONFIG.colors.textSecondary);
        doc.text(
          'No hay integrantes registrados',
          membersCard.contentX,
          membersCard.contentY
        );
      }

      yPos += alturaIntegrantes + 3;
    }

    {
      const cardWidth = (contentWidth - 5) / 2;

      // ==== Servicios ====
      let conectados =
        marcador.servicios?.filter((s) => s.opcion_servicio === 'Conectado') ||
        [];
      let noConectados =
        marcador.servicios?.filter((s) => s.opcion_servicio !== 'Conectado') ||
        [];
      let serviciosAltura = CONFIG.card.headerHeight + CONFIG.card.padding * 2;

      if (conectados.length > 0) serviciosAltura += 4 + conectados.length * 3;
      if (noConectados.length > 0)
        serviciosAltura += 4 + noConectados.length * 3;
      if (conectados.length === 0 && noConectados.length === 0)
        serviciosAltura += 4;

      checkPageBreak(serviciosAltura);
      const servicesCard = createCard(
        CONFIG.margins.left,
        yPos,
        cardWidth,
        serviciosAltura,
        'SERVICIOS',
        CONFIG.colors.info
      );

      let servicesY = servicesCard.contentY;

      if (conectados.length > 0) {
        setFont(CONFIG.fonts.cardLabel);
        setColor(CONFIG.colors.success);
        // doc.text('✓ CONECTADOS:', servicesCard.contentX, servicesY);
        servicesY += 4;

        conectados.forEach((s) => {
          const nombre = getSafeValue(s.nombre);
          if (nombre !== 'N/A') {
            setFont(CONFIG.fonts.cardValue);
            setColor(CONFIG.colors.text);
            doc.text(`• ${nombre}`, servicesCard.contentX, servicesY);
            servicesY += 3;
          }
        });
      }

      if (noConectados.length > 0) {
        setFont(CONFIG.fonts.cardLabel);
        setColor(CONFIG.colors.error);
        // doc.text('✗ NO CONECTADOS:', servicesCard.contentX, servicesY);
        servicesY += 4;

        noConectados.forEach((s) => {
          const nombre = getSafeValue(s.nombre);
          if (nombre !== 'N/A') {
            setFont(CONFIG.fonts.cardValue);
            setColor(CONFIG.colors.text);
            doc.text(`• ${nombre}`, servicesCard.contentX, servicesY);
            servicesY += 3;
          }
        });
      }

      if (conectados.length === 0 && noConectados.length === 0) {
        setFont(CONFIG.fonts.cardValue);
        setColor(CONFIG.colors.textSecondary);
        doc.text('Sin servicios registrados', servicesCard.contentX, servicesY);
      }

      // ==== Programas ====
      let activos =
        marcador.programas?.filter((p) => p.estado === 'activo') || [];
      let inactivos =
        marcador.programas?.filter((p) => p.estado !== 'activo') || [];
      let programasAltura = CONFIG.card.headerHeight + CONFIG.card.padding * 2;

      if (activos.length > 0) programasAltura += 4 + activos.length * 3;
      if (inactivos.length > 0) programasAltura += 4 + inactivos.length * 3;
      if (activos.length === 0 && inactivos.length === 0) programasAltura += 4;

      const programsCard = createCard(
        CONFIG.margins.left + cardWidth + 5,
        yPos,
        cardWidth,
        programasAltura,
        'PROGRAMAS',
        CONFIG.colors.warning
      );
      let programsY = programsCard.contentY;

      if (activos.length > 0) {
        setFont(CONFIG.fonts.cardLabel);
        setColor(CONFIG.colors.success);
        doc.text('ACTIVOS:', programsCard.contentX, programsY);
        programsY += 4;

        activos.forEach((p) => {
          const tipo = getSafeValue(p.tipo);
          const ayuda = getSafeValue(p.ayuda);
          if (tipo !== 'N/A' || ayuda !== 'N/A') {
            setFont(CONFIG.fonts.cardValue);
            setColor(CONFIG.colors.text);
            doc.text(`• ${tipo} - ${ayuda}`, programsCard.contentX, programsY);
            programsY += 3;
          }
        });
      }

      if (inactivos.length > 0) {
        setFont(CONFIG.fonts.cardLabel);
        setColor(CONFIG.colors.textSecondary);
        doc.text('FINALIZADOS:', programsCard.contentX, programsY);
        programsY += 4;

        inactivos.forEach((p) => {
          const tipo = getSafeValue(p.tipo);
          const ayuda = getSafeValue(p.ayuda);
          if (tipo !== 'N/A' || ayuda !== 'N/A') {
            setFont(CONFIG.fonts.cardValue);
            setColor(CONFIG.colors.textSecondary);
            doc.text(`• ${tipo} - ${ayuda}`, programsCard.contentX, programsY);
            programsY += 3;
          }
        });
      }

      if (activos.length === 0 && inactivos.length === 0) {
        setFont(CONFIG.fonts.cardValue);
        setColor(CONFIG.colors.textSecondary);
        doc.text(
          'Sin programas asignados',
          programsCard.contentX,
          programsCard.contentY
        );
      }

      yPos += Math.max(serviciosAltura, programasAltura) + 3;
    }

    {
      if (marcador.notas && marcador.notas.trim()) {
        const notasLimpias = getSafeValue(marcador.notas.trim());
        if (notasLimpias !== 'N/A') {
          const notasLines = doc.splitTextToSize(notasLimpias, contentWidth);
          const notasAltura =
            CONFIG.card.headerHeight +
            CONFIG.card.padding * 2 +
            notasLines.length * 4;

          checkPageBreak(notasAltura);
          const notesCard = createCard(
            CONFIG.margins.left,
            yPos,
            contentWidth,
            notasAltura,
            'NOTAS ADICIONALES',
            [121, 85, 72]
          );

          setFont(CONFIG.fonts.cardValue);
          setColor(CONFIG.colors.text);

          notasLines.forEach((linea, index) => {
            doc.text(linea, notesCard.contentX, notesCard.contentY + index * 4);
          });

          yPos += notasAltura + 3;
        }
      }
    }

    // ===== FOOTER =====
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      // Línea decorativa
      doc.setDrawColor(
        CONFIG.colors.primary[0],
        CONFIG.colors.primary[1],
        CONFIG.colors.primary[2]
      );
      doc.setLineWidth(0.5);
      doc.line(
        CONFIG.margins.left,
        CONFIG.pageHeight - 12,
        CONFIG.pageWidth - CONFIG.margins.right,
        CONFIG.pageHeight - 12
      );

      // Información del sistema
      setFont(CONFIG.fonts.tiny);
      setColor(CONFIG.colors.textSecondary);
      doc.text(
        `Sistema GIS - ${new Date().toLocaleDateString(
          'es-ES'
        )} ${new Date().toLocaleTimeString('es-ES')}`,
        CONFIG.margins.left,
        CONFIG.pageHeight - 6
      );
      doc.text(
        `Página ${i} de ${totalPages}`,
        CONFIG.pageWidth - CONFIG.margins.right - 15,
        CONFIG.pageHeight - 6
      );
    }

    // ===== GENERAR PDF =====
    const nombreLimpio = getSafeValue(marcador.nombre) || 'Usuario';
    const apellidoLimpio = getSafeValue(marcador.apellido) || 'Desconocido';
    const fileName = `Reporte_${nombreLimpio}_${apellidoLimpio}_${new Date().toISOString().split('T')[0]
      }.pdf`;

    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);

    // Abrir para imprimir
    const printWindow = window.open(blobUrl, '_blank');
    if (printWindow) {
      printWindow.onload = function () {
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 1000);
      };
    } else {
      // Fallback: descargar
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert('PDF generado y descargado. Verifique su carpeta de descargas.');
    }

    // Limpiar URL después de 10 segundos
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 10000);
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
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 16px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
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
  .info-panel {
    min-width: 100% !important;
    margin: 0 !important;
  }

  .header-gradient .absolute-top-right {
    position: relative !important;
    text-align: right;
    padding: 0 !important;
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

@media (max-width: 768px) {

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
</style>
