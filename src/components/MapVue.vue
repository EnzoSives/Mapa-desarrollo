<template>
  <q-page class="full-height no-scroll">
    <div ref="mapContainer" class="mapa"></div>

    <!-- Tooltip para mostrar el nombre del marcador -->
    <div v-if="tooltipVisible" class="tooltip-marcador" :style="{
      left: tooltipPosition.x + 'px',
      top: tooltipPosition.y + 'px',
    }">
      {{ tooltipContent }}
    </div>

    <!-- Panel Info del marcador (izquierda arriba) -->
    <div id="area-imprimir">
      <q-card v-if="gisStore.marcadorSeleccionado" class="info-panel q-mx-auto"
        style="min-width: 400px; max-width: 500px; border-radius: 12px; max-height: 85vh; overflow-y: auto; display: flex; flex-direction: column;">

        <!-- Contenido con scroll -->
        <div style="flex: 1; overflow-y: auto; scrollbar-width: none; scrollbar-color: #888 #f0f0f0;">
          <!-- Encabezado simple -->
          <q-card-section class="q-pa-md relative-position">
            <!-- Botón cerrar en esquina superior derecha -->
            <q-btn icon="close" flat round dense class="absolute-top-right q-ma-sm" style="z-index: 2;"
              @click="gisStore.cerrarInfo" />

            <div class="row items-center no-wrap">
              <q-avatar v-if="gisStore.marcadorSeleccionado.icono" size="44px" class="q-mr-md">
                <img :src="gisStore.marcadorSeleccionado.icono" alt="Ícono" />
              </q-avatar>
              <div class="col">
                <div class="text-h6 text-weight-medium">
                  {{ gisStore.marcadorSeleccionado.nombre }} {{ gisStore.marcadorSeleccionado.apellido }}
                </div>
                <div class="text-caption text-grey">
                  {{ gisStore.marcadorSeleccionado.direccion }}
                </div>
                <div class="text-caption text-grey">
                  Creado: {{ new Date(gisStore.marcadorSeleccionado.fechaCreacion).toLocaleDateString() }}
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
                <div class="text-body2">{{ gisStore.marcadorSeleccionado.telefono || 'N/A' }}</div>
              </div>
              <div class="col-6">
                <div class="text-caption text-grey">DNI</div>
                <div class="text-body2">{{ gisStore.marcadorSeleccionado.dni }}</div>
              </div>
            </div>

            <!-- Integrantes compactos -->
            <div class="q-mb-md">
              <div class="text-subtitle2 q-mb-sm flex items-center">
                <q-icon name="people" class="q-mr-xs" />
                Integrantes
                <q-chip v-if="gisStore.marcadorSeleccionado.integrantes?.length"
                  :label="gisStore.marcadorSeleccionado.integrantes.length" color="blue" text-color="white" size="sm"
                  class="q-ml-sm" />
              </div>
              <div v-if="gisStore.marcadorSeleccionado.integrantes?.length">
                <div v-for="(integrante, index) in gisStore.marcadorSeleccionado.integrantes" :key="index"
                  class="row items-center q-py-xs q-mb-xs rounded-borders q-pa-sm"
                  :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-1'">
                  <q-avatar size="28px" class="q-mr-sm" color="blue-5" text-color="white">
                    {{ integrante.nombre.charAt(0) }}
                  </q-avatar>
                  <div class="col">
                    <div class="text-body2 text-weight-medium">{{ integrante.nombre }} {{ integrante.apellido }}</div>
                    <div class="text-caption text-grey">
                      {{ integrante.edad }} años • {{ integrante.vinculo }} • DNI: {{ integrante.dni }}
                    </div>
                    <!-- Salud del integrante -->
                    <div v-if="integrante.salud?.length" class="q-mt-xs">
                      <div v-for="(saludItem, sIndex) in integrante.salud" :key="sIndex" class="text-caption">
                        <q-badge v-if="saludItem.cud" color="purple" text-color="white" class="q-mr-xs">CUD</q-badge>
                        <q-badge v-if="saludItem.obra_social" color="green" text-color="white" class="q-mr-xs">Obra
                          Social</q-badge>
                        <span v-if="saludItem.problema_salud" class="text-red">{{ saludItem.problema_salud }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-caption text-grey">Sin integrantes</div>
            </div>

            <!-- Programas activos + botón historial -->
            <div class="q-mb-md">
              <div class="text-subtitle2 q-mb-sm flex items-center">
                <q-icon name="assignment" class="q-mr-xs" />
                Programas Activos
                <q-chip v-if="programasActivos.length" :label="programasActivos.length" color="primary"
                  text-color="white" size="sm" class="q-ml-sm" />
              </div>

              <div v-if="programasActivos.length">
                <div v-for="(programa, index) in programasActivos" :key="index"
                  class="text-body2 q-mb-xs q-pa-sm rounded-borders"
                  :class="$q.dark.isActive ? 'bg-green-9' : 'bg-green-1'">
                  <div class="text-weight-medium">{{ programa.tipo }}</div>
                  <div class="text-caption">{{ programa.ayuda }}</div>
                  <q-badge v-if="programa.fechaInicio" color="green" class="q-mt-xs" text-color="white">
                    Desde: {{ new Date(programa.fechaInicio).toLocaleDateString() }}
                  </q-badge>
                </div>
              </div>
              <div v-else class="text-caption text-grey">Ninguno</div>

              <div class="q-mt-sm">
                <q-btn label="Historial de Programas" color="primary" flat @click="mostrarModalHistorial = true"
                  :badge="programasInactivos.length || undefined" />
              </div>
            </div>

            <!-- Estudios -->
            <div v-if="gisStore.marcadorSeleccionado.estudios?.length" class="q-mb-md">
              <div class="text-subtitle2 q-mb-sm flex items-center">
                <q-icon name="school" class="q-mr-xs" />
                Educación
              </div>
              <div v-for="(estudio, index) in gisStore.marcadorSeleccionado.estudios" :key="index"
                class="text-body2 q-mb-xs q-pa-sm rounded-borders"
                :class="$q.dark.isActive ? 'bg-blue-9' : 'bg-blue-1'">
                {{ estudio.nivel }}
              </div>
            </div>

            <!-- Ocupaciones -->
            <div v-if="gisStore.marcadorSeleccionado.ocupaciones?.length" class="q-mb-md">
              <div class="text-subtitle2 q-mb-sm flex items-center">
                <q-icon name="work" class="q-mr-xs" />
                Ocupaciones
              </div>
              <div v-for="(ocupacion, index) in gisStore.marcadorSeleccionado.ocupaciones" :key="index"
                class="q-mb-xs q-pa-sm rounded-borders" :class="$q.dark.isActive ? 'bg-orange-9' : 'bg-orange-1'">
                <div class="text-body2 text-weight-medium">{{ ocupacion.nombre }}</div>
                <div class="text-caption text-grey">
                  {{ ocupacion.tipo_1 }} • {{ ocupacion.tipo_2 }}
                </div>
                <div v-if="ocupacion.ingresos" class="text-caption text-green text-weight-medium">
                  Ingresos: ${{ ocupacion.ingresos.toLocaleString() }}
                </div>
              </div>
            </div>

            <!-- Vivienda -->
            <div v-if="gisStore.marcadorSeleccionado.viviendas?.length" class="q-mb-md">
              <div class="text-subtitle2 q-mb-sm flex items-center">
                <q-icon name="home" class="q-mr-xs" />
                Vivienda
              </div>
              <div v-for="(vivienda, index) in gisStore.marcadorSeleccionado.viviendas" :key="index"
                class="q-mb-xs q-pa-sm rounded-borders" :class="$q.dark.isActive ? 'bg-teal-9' : 'bg-teal-1'">
                <div class="text-body2">
                  <strong>{{ vivienda.tipo }}</strong> • {{ vivienda.dominio }}
                </div>
                <div class="text-caption text-grey">
                  {{ vivienda.ambientes }} ambientes • Baño {{ vivienda.baño }}
                  <span v-if="vivienda.baño_opcion"> ({{ vivienda.baño_opcion }})</span>
                </div>
              </div>
            </div>

            <!-- Servicios -->
            <div v-if="gisStore.marcadorSeleccionado.servicios?.length" class="q-mb-md">
              <div class="text-subtitle2 q-mb-sm flex items-center">
                <q-icon name="electrical_services" class="q-mr-xs" />
                Servicios
                <q-chip :label="gisStore.marcadorSeleccionado.servicios.length" color="indigo" text-color="white"
                  size="sm" class="q-ml-sm" />
              </div>
              <div class="row q-col-gutter-sm">
                <div v-for="(servicio, index) in gisStore.marcadorSeleccionado.servicios" :key="index" class="col-6">
                  <q-chip :color="servicio.opcion_servicio === 'Conectado' ? 'green' : 'red'" text-color="white"
                    size="sm" class="full-width">
                    <q-icon :name="servicio.opcion_servicio === 'Conectado' ? 'check_circle' : 'cancel'"
                      class="q-mr-xs" />
                    {{ servicio.nombre }}
                  </q-chip>
                </div>
              </div>
            </div>

            <!-- Salud general -->
            <div v-if="gisStore.marcadorSeleccionado.salud?.length" class="q-mb-md">
              <div class="text-subtitle2 q-mb-sm flex items-center">
                <q-icon name="medical_services" class="q-mr-xs" />
                Salud General
              </div>
              <div v-for="(saludItem, index) in gisStore.marcadorSeleccionado.salud" :key="index"
                class="q-mb-xs q-pa-sm rounded-borders" :class="$q.dark.isActive ? 'bg-red-9' : 'bg-red-1'">
                <div class="row items-center">
                  <div class="col">
                    <div v-if="saludItem.problema_salud" class="text-body2">{{ saludItem.problema_salud }}</div>
                    <div class="q-mt-xs">
                      <q-badge v-if="saludItem.cud" color="purple" text-color="white" class="q-mr-xs">CUD</q-badge>
                      <q-badge v-if="saludItem.obra_social" color="green" text-color="white">Obra Social</q-badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Notas simples -->
            <div v-if="gisStore.marcadorSeleccionado.notas" class="q-mb-md">
              <div class="text-subtitle2 q-mb-sm flex items-center">
                <q-icon name="note" class="q-mr-xs" />
                Notas
              </div>
              <div class="text-body2 q-pa-sm rounded-borders" :class="$q.dark.isActive ? 'bg-grey-8' : 'bg-grey-2'">
                {{ gisStore.marcadorSeleccionado.notas }}
              </div>
            </div>

            <!-- Coordenadas (opcional, para debugging)
        <div v-if="gisStore.marcadorSeleccionado.latitud && gisStore.marcadorSeleccionado.longitud" class="q-mb-md">
          <div class="text-subtitle2 q-mb-sm flex items-center">
            <q-icon name="place" class="q-mr-xs" />
            Coordenadas
          </div>
          <div class="text-caption text-grey">
            Lat: {{ gisStore.marcadorSeleccionado.latitud.toFixed(6) }} •
            Lng: {{ gisStore.marcadorSeleccionado.longitud.toFixed(6) }}
          </div>
        </div> -->
          </q-card-section>
        </div>

        <!-- Acciones fijas en la parte inferior -->
        <div style="flex-shrink: 0;">
          <q-separator />
          <q-card-actions class="q-pa-sm justify-end">
            <q-btn flat round icon="print" @click="generarPDF" size="md">
              <q-tooltip>Imprimir</q-tooltip>
            </q-btn>

            <q-btn flat v-if="permisos.puedeEditar" label="Editar" @click="editarMarcadorSeleccionado" color="orange-8"
              size="md" />

            <q-btn flat v-if="permisos.puedeEliminar" label="Eliminar" @click="eliminarMarcadorSeleccionado" color="red"
              size="md" />
          </q-card-actions>
        </div>
      </q-card>
    </div>

    <q-dialog v-model="mostrarModalHistorial">
      <q-card style="min-width: 350px; max-width: 550px;">
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
                    Inicio: {{ programa.fechaInicio ? new Date(programa.fechaInicio).toLocaleDateString() : 'N/A' }}<br>
                    Fin: {{ programa.fechaFin ? new Date(programa.fechaFin).toLocaleDateString() : 'N/A' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-caption text-grey">No hay programas inactivos.</div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>


    <!-- Panel de Referencias (derecha arriba) -->
    <q-card v-if="mostrarReferencias" class="referencias-panel">
      <q-card-section>
        <div class="row justify-between items-center">
          <div class="text-subtitle1">Referencias</div>
          <q-btn dense flat icon="chevron_right" @click="mostrarReferencias = false" />
        </div>
        <div class="row q-mt-sm">
          <div v-for="icono in iconosDisponibles" :key="icono.value" class="column items-center q-mr-md">
            <img :src="icono.value" width="24" height="24" />
            <div class="text-caption">{{ icono.label }}</div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-btn v-if="!mostrarReferencias" icon="pin_drop" class="fixed-top-right q-mt-sm q-mr-sm" style="top: 50px"
      color="primary" @click="mostrarReferencias = true"><q-tooltip> Ver referencias </q-tooltip>
    </q-btn>

    <q-card v-if="mostrarDatosActuales" class="datos-actuales-panel">
      <q-card-section>
        <div class="row justify-between items-center">
          <div class="text-subtitle1">Datos cargados</div>
          <q-btn dense flat icon="chevron_right" @click="mostrarDatosActuales = false" />
        </div>

        <q-input dense outlined debounce="300" v-model="searchTerm" placeholder="Buscar por nombre o dirección"
          class="q-mt-sm q-mb-sm" clearable prepend-inner-icon="search" />

        <div class="scroll-contenido">
          <div v-for="(marcador, index) in marcadoresFiltrados" :key="marcador.id" class="q-mb-sm cursor-pointer"
            @click="verInfoMarcador(marcador)">
            <div>
              <strong>{{ index + 1 }}.</strong> {{ marcador.nombre }} {{ marcador.apellido }}
            </div>
            <div class="text-caption ellipsis">{{ marcador.direccion }}</div>
            <q-separator spaced />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-btn v-if="!mostrarDatosActuales" icon="view_list" class="fixed-bottom-right q-mb-sm q-mr-sm" color="primary"
      @click="mostrarDatosActuales = true"><q-tooltip> Datos guardados </q-tooltip>
    </q-btn>

    <!-- Modal -->
    <q-drawer v-model="modalVisible" side="right" :width="900" overlay bordered behavior="desktop"
      v-if="!permisos.soloLectura">
      <q-card class="q-pa-md q-gutter-md">
        <div class="text-h6 q-mb-md text-center">
          {{ editando ? 'Editar marcador' : 'Nuevo marcador' }}
        </div>

        <q-card-section class="scroll" style="max-height: 80vh;">
          <q-form ref="formulario" @submit="guardarMarcador">

            <!-- Información básica -->
            <q-card-section>
              <div class="text-h6 q-mb-md">Información Básica</div>

              <q-input v-model="nuevoMarcador.nombre" label="Nombre" dense outlined class="q-mb-md" :rules="[
                val => !!val || 'El nombre y apellido es obligatorio',
                val => val.length >= 3 || 'Debe tener al menos 3 caracteres',
                val => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val) || 'Solo se permiten letras y espacios'
              ]" />
              <q-input v-model="nuevoMarcador.apellido" label="Apellido" dense outlined class="q-mb-md" :rules="[
                val => !!val || 'El nombre y apellido es obligatorio',
                val => val.length >= 3 || 'Debe tener al menos 3 caracteres',
                val => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val) || 'Solo se permiten letras y espacios'
              ]" />

              <q-input v-model="nuevoMarcador.direccion" label="Dirección" dense outlined class="q-mb-md" :rules="[
                val => !!val || 'La dirección es obligatoria',
                val => val.length >= 5 || 'Debe tener al menos 5 caracteres'
              ]" />

              <div class="row q-col-gutter-md">
                <div class="col-6">
                  <q-input v-model="nuevoMarcador.telefono" label="Teléfono" type="number" dense outlined
                    class="q-mb-md" :min="0"
                    @update:model-value="val => { if (val !== null && Number(val) < 0) nuevoMarcador.telefono = 0 }"
                    :rules="[
                      val => !!val || 'El teléfono es obligatorio',
                      val => /^\d{8,12}$/.test(val) || 'Debe tener entre 8 y 12 dígitos'
                    ]" />
                </div>
                <div class="col-6">
                  <q-input v-model="nuevoMarcador.dni" label="DNI" type="number" dense outlined class="q-mb-md" :min="0"
                    @update:model-value="val => { if (val !== null && Number(val) < 0) nuevoMarcador.dni = 0 }" :rules="[
                      val => !!val || 'El DNI es obligatorio',
                      val => /^\d{7,8}$/.test(val) || 'El DNI debe tener 7 u 8 dígitos'
                    ]" />
                </div>
              </div>

              <!-- <div class="row q-col-gutter-md">
                <div class="col-6">
                  <q-input v-model.number="nuevoMarcador.latitud" label="Latitud" type="number" dense outlined
                    class="q-mb-md" step="any" :rules="[
                      val => val === null || val === '' || (val >= -90 && val <= 90) || 'Debe estar entre -90 y 90'
                    ]" />
                </div>
                <div class="col-6">
                  <q-input v-model.number="nuevoMarcador.longitud" label="Longitud" type="number" dense outlined
                    class="q-mb-md" step="any" :rules="[
                      val => val === null || val === '' || (val >= -180 && val <= 180) || 'Debe estar entre -180 y 180'
                    ]" />
                </div>
              </div> -->

              <q-input v-model="nuevoMarcador.notas" label="Notas" type="textarea" dense outlined class="q-mb-md"
                :rules="[
                  val => !val || val.length <= 500 || 'Las notas no pueden exceder 500 caracteres'
                ]" />
            </q-card-section>

            <!-- Sección de Programas -->
            <q-separator />
            <q-card-section>
              <div class="text-h6 q-mb-md">Programas *</div>

              <div v-for="(programa, index) in nuevoMarcador.programas" :key="index"
                class="row q-gutter-sm items-center q-mb-sm q-pa-sm border rounded">

                <!-- Selector de Tipo -->
                <q-select v-model="programa.tipo" label="Tipo" :options="tiposPrograma" dense outlined class="col"
                  @update:model-value="resetearAyuda(index)" :rules="[val => !!val || 'Debe seleccionar un tipo']" />

                <!-- Selector de Ayuda (dependiente del tipo) -->
                <q-select v-model="programa.ayuda" label="Ayuda" :options="getOpcionesAyuda(programa.tipo)" dense
                  outlined class="col" :disable="!programa.tipo || programa.tipo === 'SUBSIDIOS'"
                  :rules="[val => programa.tipo === 'SUBSIDIOS' || !!val || 'Debe seleccionar una ayuda']" />

                <q-btn icon="remove_circle" color="negative" flat dense @click="eliminarPrograma(index)">
                  <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 10]">
                    Finalizar programa
                  </q-tooltip>
                </q-btn>
              </div>
              <q-btn icon="add_circle" label="Agregar programa" color="primary" flat @click="agregarPrograma" />
            </q-card-section>

            <!-- Sección de Integrantes -->
            <q-separator />
            <q-card-section>
              <div class="text-h6 q-mb-md">Integrantes *</div>

              <div v-for="(integrante, index) in nuevoMarcador.integrantes" :key="index"
                class="q-pa-md q-mb-md border rounded">

                <div class="row q-col-gutter-md q-mb-md">
                  <div class="col-12 col-md-4">
                    <q-input v-model="integrante.nombre" label="Nombre" dense outlined :rules="[
                      val => !!val || 'El nombre es obligatorio',
                      val => val.length >= 2 || 'Debe tener al menos 2 caracteres',
                      val => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val) || 'Solo se permiten letras y espacios'
                    ]" />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input v-model="integrante.apellido" label="Apellido" dense outlined :rules="[
                      val => !!val || 'El apellido es obligatorio',
                      val => val.length >= 2 || 'Debe tener al menos 2 caracteres',
                      val => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val) || 'Solo se permiten letras y espacios'
                    ]" />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-select v-model="integrante.vinculo" label="Vínculo" :options="opcionesVinculo" dense outlined
                      :rules="[val => !!val || 'Debe seleccionar un vínculo']" />
                  </div>
                </div>

                <div class="row q-col-gutter-md q-mb-md">
                  <div class="col-12 col-md-6">
                    <q-input v-model.number="integrante.edad" label="Edad" type="number" dense outlined :rules="[
                      val => !!val || 'La edad es obligatoria',
                      val => val >= 0 && val <= 120 || 'La edad debe estar entre 0 y 120 años'
                    ]" />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input v-model="integrante.dni" label="DNI" type="number" dense outlined :rules="[
                      val => !!val || 'El DNI es obligatorio',
                      val => /^\d{7,8}$/.test(val) || 'El DNI debe tener 7 u 8 dígitos'
                    ]" />
                  </div>
                </div>

                <!-- Salud del integrante -->
                <div class="text-subtitle2 q-mb-sm">Información de Salud</div>
                <div v-for="(saludItem, saludIndex) in integrante.salud" :key="saludIndex"
                  class="q-mb-md q-pa-sm bg-grey-1 rounded">
                  <div class="row q-col-gutter-md items-center">
                    <div class="col-12 col-md-3">
                      <q-checkbox v-model="saludItem.cud" label="CUD" />
                    </div>
                    <div class="col-12 col-md-3">
                      <q-checkbox v-model="saludItem.obra_social" label="Obra Social" />
                    </div>
                    <div class="col-12 col-md-5">
                      <q-input v-model="saludItem.problema_salud" label="Problema de salud" dense outlined />
                    </div>
                    <div class="col-1">
                      <q-btn icon="remove_circle" color="negative" flat dense
                        @click="eliminarSaludIntegrante(index, saludIndex)" />
                    </div>
                  </div>
                </div>
                <q-btn icon="add" label="Agregar info salud" color="primary" flat size="sm"
                  @click="agregarSaludIntegrante(index)" />

                <div class="row justify-end q-mt-md">
                  <q-btn icon="remove_circle" color="negative" flat @click="eliminarIntegrante(index)">
                    Eliminar integrante
                  </q-btn>
                </div>
              </div>
              <q-btn icon="add_circle" label="Agregar integrante" color="primary" flat @click="agregarIntegrante" />
            </q-card-section>

            <!-- Sección de Estudios -->
            <q-separator />
            <q-card-section>
              <div class="text-h6 q-mb-md">Estudios</div>

              <div v-for="(estudio, index) in nuevoMarcador.estudios" :key="index"
                class="row q-gutter-sm items-center q-mb-sm">
                <q-select v-model="estudio.nivel" label="Nivel de estudios" :options="opcionesEstudios" dense outlined
                  class="col" :rules="[val => !!val || 'Debe seleccionar un nivel']" />
                <q-btn icon="remove_circle" color="negative" flat dense @click="eliminarEstudio(index)" />
              </div>
              <q-btn icon="add_circle" label="Agregar estudio" color="primary" flat @click="agregarEstudio" />
            </q-card-section>

            <!-- Sección de Ocupaciones -->
            <q-separator />
            <q-card-section>
              <div class="text-h6 q-mb-md">Ocupaciones</div>

              <div v-for="(ocupacion, index) in nuevoMarcador.ocupaciones" :key="index"
                class="q-mb-md q-pa-sm border rounded">
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                    <q-input v-model="ocupacion.nombre" label="Nombre de la ocupación" dense outlined
                      :rules="[val => !!val || 'El nombre es obligatorio']" />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input v-model.number="ocupacion.ingresos" label="Ingresos" type="number" dense outlined
                      :min="0" />
                  </div>
                </div>
                <div class="row q-col-gutter-md q-mt-sm">
                  <div class="col-12 col-md-5">
                    <q-select v-model="ocupacion.tipo_1" label="Tipo 1" :options="opcionesTipoOcupacion1" dense outlined
                      :rules="[val => !!val || 'Debe seleccionar un tipo']" />
                  </div>
                  <div class="col-12 col-md-5">
                    <q-select v-model="ocupacion.tipo_2" label="Tipo 2" :options="opcionesTipoOcupacion2" dense outlined
                      :rules="[val => !!val || 'Debe seleccionar un tipo']" />
                  </div>
                  <div class="col-12 col-md-2 flex items-center">
                    <q-btn icon="remove_circle" color="negative" flat dense @click="eliminarOcupacion(index)" />
                  </div>
                </div>
              </div>
              <q-btn icon="add_circle" label="Agregar ocupación" color="primary" flat @click="agregarOcupacion" />
            </q-card-section>

            <!-- Sección de Viviendas -->
            <q-separator />
            <q-card-section>
              <div class="text-h6 q-mb-md">Viviendas</div>

              <div v-for="(vivienda, index) in nuevoMarcador.viviendas" :key="index"
                class="q-mb-md q-pa-sm border rounded">
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-3">
                    <q-select v-model="vivienda.tipo" label="Tipo de vivienda" :options="opcionesTipoVivienda" dense
                      outlined :rules="[val => !!val || 'Debe seleccionar un tipo']" />
                  </div>
                  <div class="col-12 col-md-3">
                    <q-select v-model="vivienda.dominio" label="Dominio" :options="opcionesDominioVivienda" dense
                      outlined :rules="[val => !!val || 'Debe seleccionar el dominio']" />
                  </div>
                  <div class="col-12 col-md-3">
                    <q-input v-model="vivienda.ambientes" label="Ambientes" dense outlined />
                  </div>
                  <div class="col-12 col-md-3">
                    <q-select v-model="vivienda.baño" label="Baño" :options="opcionesBaño" dense outlined />
                  </div>
                </div>
                <div class="row q-col-gutter-md q-mt-sm">
                  <div class="col-12 col-md-10">
                    <q-select v-model="vivienda.baño_opcion" label="Conexión del baño" :options="opcionesBañoConexion"
                      dense outlined />
                  </div>
                  <div class="col-12 col-md-2 flex items-center">
                    <q-btn icon="remove_circle" color="negative" flat dense @click="eliminarVivienda(index)" />
                  </div>
                </div>
              </div>
              <q-btn icon="add_circle" label="Agregar vivienda" color="primary" flat @click="agregarVivienda" />
            </q-card-section>

            <!-- Sección de Servicios -->
            <q-separator />
            <q-card-section>
              <div class="text-h6 q-mb-md">Servicios</div>

              <div v-for="(servicio, index) in nuevoMarcador.servicios" :key="index"
                class="row q-gutter-sm items-center q-mb-sm">
                <q-select v-model="servicio.nombre" label="Servicio" :options="opcionesServicios" dense outlined
                  class="col-5" :rules="[val => !!val || 'Debe seleccionar un servicio']" />
                <q-select v-model="servicio.opcion_servicio" label="Estado" :options="opcionesEstadoServicio" dense
                  outlined class="col-5" :rules="[val => !!val || 'Debe seleccionar el estado']" />
                <q-btn icon="remove_circle" color="negative" flat dense @click="eliminarServicio(index)" />
              </div>
              <q-btn icon="add_circle" label="Agregar servicio" color="primary" flat @click="agregarServicio" />
            </q-card-section>

            <!-- Sección de Salud General -->
            <q-separator />
            <q-card-section>
              <div class="text-h6 q-mb-md">Información de Salud General</div>

              <div v-for="(saludItem, index) in nuevoMarcador.salud" :key="index"
                class="q-mb-md q-pa-sm border rounded">
                <div class="row q-col-gutter-md items-center">
                  <div class="col-12 col-md-2">
                    <q-checkbox v-model="saludItem.cud" label="CUD" />
                  </div>
                  <div class="col-12 col-md-2">
                    <q-checkbox v-model="saludItem.obra_social" label="Obra Social" />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input v-model="saludItem.problema_salud" label="Problema de salud" dense outlined />
                  </div>
                  <div class="col-12 col-md-2">
                    <q-btn icon="remove_circle" color="negative" flat dense @click="eliminarSalud(index)" />
                  </div>
                </div>
              </div>
              <q-btn icon="add_circle" label="Agregar info salud" color="primary" flat @click="agregarSalud" />
            </q-card-section>

            <!-- Sección de Ícono -->
            <q-separator />
            <q-card-section>
              <div class="text-h6 q-mb-md">Ícono del Marcador</div>

              <q-select v-model="nuevoMarcador.icono" label="Ícono del marcador" :options="iconosDisponibles"
                option-value="value" option-label="label" emit-value map-options outlined dense class="q-mb-md"
                :rules="[val => !!val || 'Debe seleccionar un ícono']">
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
            </q-card-section>

          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" @click="cerrarModal" color="negative" :disable="guardando" />
          <q-btn flat :label="editando ? 'Guardar cambios' : 'Guardar'" @click="validarYGuardar" color="positive"
            :loading="guardando" :disable="guardando" />
        </q-card-actions>
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

// Ref para el formulario
const formulario = ref();

// Variables para el tooltip
const tooltipVisible = ref(false);
const tooltipContent = ref('');
const tooltipPosition = ref({ x: 0, y: 0 });

const rol = ref(localStorage.getItem('rol') || 'Visor');

const mostrarModalHistorial = ref(false)

const programasActivos = computed(() =>
  gisStore.marcadorSeleccionado?.programas?.filter(p => p.estado === 'activo') || []
)
const programasInactivos = computed(() =>
  gisStore.marcadorSeleccionadoProgramasCompletos?.filter(p => p.estado !== 'activo') || []
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
    puedeEditar: rol.value === 'superadmin' || rol.value === 'admin',
    puedeEliminar: rol.value === 'superadmin' || rol.value === 'admin',
    soloLectura: rol.value === 'visor',
  };
});
const iconosDisponibles = [
  { label: 'Ícono 1', value: '/marker-icon.png' },
  { label: 'Ícono 2', value: '/marker-icon-2.png' },
  { label: 'Ícono 3', value: '/marker-icon-3.png' },
];

// Opciones para los selectores de programas
const tiposPrograma = [
  'PROGRAMAS ALIMENTARIOS',
  'CONTRAPRESTACIÓN',
  'SUBSIDIOS' // ✅ CORREGIDO: Cambié de 'SUBSIDIOS' a 'SUBSIDIOS'
];

const opcionesAyuda = {
  'PROGRAMAS ALIMENTARIOS': [
    'AM - Ayuda Mensual',
    'DBT - Diabéticos',
    'ES - Esp. Solidario',
    'AU - Ayuda Urgente',
    'DE - Dietas Especiales'
  ],
  'CONTRAPRESTACIÓN': [
    'Gas',
    'Luz',
    'Banco Materiales'
  ],
  'SUBSIDIOS': [] // ✅ CORREGIDO: Cambié de 'SUBSIDIOS' a 'SUBSIDIOS'
};


// Agregar estas opciones después de las existentes
const opcionesVinculo = [
  'Pareja', 'Hijo/a', 'Padre/Madre', 'Otro'
];

const opcionesEstudios = [
  'Analfabeto', 'Primario incompleto', 'Primario completo',
  'Secundario incompleto', 'Secundario completo',
  'Terciario incompleto', 'Terciario completo',
  'Universitario incompleto', 'Universitario completo'
];

const opcionesTipoOcupacion1 = [
  'Dependiente', 'Independiente', 'Cooperativa'
];

const opcionesTipoOcupacion2 = [
  'Permanente', 'Temporal', 'Estacional'
];

const opcionesTipoVivienda = [
  'Casa', 'Departamento', 'Rancho', 'Casilla', 'Pieza'
];

const opcionesDominioVivienda = [
  'Propia', 'Alquilada', 'Prestada', 'Ocupada'
];

const opcionesBaño = [
  'Interior', 'Exterior', 'Sin baño'
];

const opcionesBañoConexion = [
  'Con conexión a red', 'Con pozo ciego', 'Sin conexión'
];

const opcionesServicios = [
  'Agua corriente', 'Electricidad', 'Gas natural', 'Gas envasado',
  'Cloacas', 'Internet', 'Cable/TV', 'Teléfono'
];

const opcionesEstadoServicio = [
  'Conectado', 'No conectado', 'Irregular'
];

// Modificar la inicialización de nuevoMarcador
const nuevoMarcador = ref({
  nombre: '',
  apellido: '',
  direccion: '',
  telefono: '',
  dni: '',
  notas: '',
  programas: [] as Array<{
    tipo: string;
    ayuda: string;
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
  }>,
  estudios: [] as Array<{
    nivel: string;
  }>,
  ocupaciones: [] as Array<{
    nombre: string;
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
      minZoom: 14,        // Zoom mínimo permitido
      maxZoom: 18,        // Zoom máximo permitido
      extent: extent,     // Límites del área visible
      constrainOnlyCenter: false  // Restringe toda la vista, no solo el centro
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
        position: 'top'
      });
      return;
    }

    // Validaciones adicionales
    if (!validarProgramas()) {
      $q.notify({
        type: 'negative',
        message: 'Debe agregar al menos un programa',
        position: 'top'
      });
      return;
    }

    if (!validarIntegrantes()) {
      $q.notify({
        type: 'negative',
        message: 'Debe agregar al menos un integrante',
        position: 'top'
      });
      return;
    }

    // Si todo está válido, proceder a guardar
    await guardarMarcador();

  } catch (error) {
    console.error('Error en validación:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al validar el formulario',
      position: 'top'
    });
  } finally {
    guardando.value = false; // ✅ NUEVO: Desactivar loading
  }
}

// Validar que haya al menos un programa
function validarProgramas(): boolean {
  return nuevoMarcador.value.programas && nuevoMarcador.value.programas.length > 0;
}

// Validar que haya al menos un integrante
function validarIntegrantes(): boolean {
  return nuevoMarcador.value.integrantes && nuevoMarcador.value.integrantes.length > 0;
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
        position: 'top'
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
        if (!gisStore.marcadores.find(m => m.id === nuevoMarcadorCreado.id)) {
          gisStore.marcadores.push(nuevoMarcadorCreado);
        }

        $q.notify({
          type: 'positive',
          message: 'Marcador creado correctamente',
          position: 'top'
        });
      } else {
        // Si no se puede identificar el marcador creado, recargar desde el servidor
        console.warn('No se pudo identificar el marcador creado, recargando desde servidor...'); // Debug

        await gisStore.cargarMarcadoresDesdeAPI();

        $q.notify({
          type: 'positive',
          message: 'Marcador creado correctamente (recargado desde servidor)',
          position: 'top'
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
      position: 'top'
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
    salud: []
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
    problema_salud: ''
  });
}

function eliminarSaludIntegrante(integranteIndex, saludIndex) {
  nuevoMarcador.value.integrantes[integranteIndex].salud.splice(saludIndex, 1);
}

// Funciones para manejar estudios
function agregarEstudio() {
  if (!nuevoMarcador.value.estudios) {
    nuevoMarcador.value.estudios = [];
  }
  nuevoMarcador.value.estudios.push({
    nivel: ''
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
    nombre: '',
    tipo_1: '',
    tipo_2: '',
    ingresos: null
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
    baño_opcion: ''
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
    opcion_servicio: ''
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
    problema_salud: ''
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
    notas: '',
    latitud: null,
    longitud: null,
    icono: '',
    programas: [],
    integrantes: [],
    estudios: [],
    ocupaciones: [],
    viviendas: [],
    servicios: [],
    salud: []
  };
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

// Función para generar PDF del marcador seleccionado
async function generarPDF() {
  if (!gisStore.marcadorSeleccionado) {
    alert('No hay ningún marcador seleccionado');
    return;
  }

  try {
    // Importar jsPDF dinámicamente
    const marcador = gisStore.marcadorSeleccionado;
    const doc = new jsPDF();

    // Configuración inicial
    let yPos = 20;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Función helper para añadir texto con wrap
    function addTextWithWrap(text, x, y, maxWidth, fontSize = 12) {
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + (lines.length * (fontSize * 0.4));
    }

    // Función helper para dibujar rectángulo con color
    function drawColoredRect(x, y, width, height, color) {
      doc.setFillColor(color);
      doc.rect(x, y, width, height, 'F');
    }

    // Función helper para verificar nueva página
    function checkPageBreak(requiredSpace = 30) {
      if (yPos > 280 - requiredSpace) {
        doc.addPage();
        yPos = 20;
        return true;
      }
      return false;
    }

    // Función helper para crear sección
    function createSection(title) {
      checkPageBreak(20);
      drawColoredRect(margin, yPos - 3, contentWidth, 2, '#e3f2fd');
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(title, margin, yPos + 8);
      yPos += 20;
    }

    // ENCABEZADO
    drawColoredRect(margin, yPos - 5, contentWidth, 25, '#1976d2');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('INFORMACIÓN DEL MARCADOR', margin + 5, yPos + 8);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, pageWidth - 60, yPos + 8);

    yPos += 35;

    // INFORMACIÓN PRINCIPAL
    createSection('DATOS PERSONALES');

    // Nombre y Apellido
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Nombre:', margin, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(marcador.nombre || '', margin + 25, yPos);
    yPos += 10;

    doc.setFont(undefined, 'bold');
    doc.text('Apellido:', margin, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(marcador.apellido || '', margin + 25, yPos);
    yPos += 10;

    // Dirección
    doc.setFont(undefined, 'bold');
    doc.text('Dirección:', margin, yPos);
    doc.setFont(undefined, 'normal');
    yPos = addTextWithWrap(marcador.direccion, margin + 25, yPos, contentWidth - 25);
    yPos += 5;

    // Teléfono
    doc.setFont(undefined, 'bold');
    doc.text('Teléfono:', margin, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(marcador.telefono || 'N/A', margin + 25, yPos);
    yPos += 10;

    // DNI
    doc.setFont(undefined, 'bold');
    doc.text('DNI:', margin, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(marcador.dni.toString(), margin + 25, yPos);
    yPos += 10;

    // Fecha de creación
    doc.setFont(undefined, 'bold');
    doc.text('Fecha de Creación:', margin, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(new Date(marcador.fechaCreacion).toLocaleDateString('es-ES'), margin + 45, yPos);
    yPos += 10;

    // Coordenadas
    doc.setFont(undefined, 'bold');
    doc.text('Coordenadas:', margin, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(`Lat: ${marcador.latitud?.toFixed(6) || 'N/A'}, Lng: ${marcador.longitud?.toFixed(6) || 'N/A'}`, margin + 35, yPos);
    yPos += 20;

    // INTEGRANTES
    createSection('INTEGRANTES');

    if (marcador.integrantes && marcador.integrantes.length > 0) {
      marcador.integrantes.forEach((integrante, index) => {
        checkPageBreak(25);

        // Fondo alternado para cada integrante
        if (index % 2 === 0) {
          drawColoredRect(margin, yPos - 3, contentWidth, 20, '#f8f9fa');
        }

        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`${index + 1}. ${integrante.nombre} ${integrante.apellido}`, margin + 2, yPos + 5);

        doc.setFont(undefined, 'normal');
        doc.text(`Edad: ${integrante.edad || 'N/A'}`, margin + 2, yPos + 12);
        doc.text(`DNI: ${integrante.dni}`, margin + 50, yPos + 12);
        doc.text(`Vínculo: ${integrante.vinculo || 'N/A'}`, margin + 100, yPos + 12);

        // Salud del integrante
        if (integrante.salud && integrante.salud.length > 0) {
          yPos += 5;
          integrante.salud.forEach((saludItem) => {
            doc.setFontSize(10);
            doc.setTextColor(150, 0, 0);
            let saludTexto = '  Salud: ';
            if (saludItem.cud) saludTexto += 'CUD ';
            if (saludItem.obra_social) saludTexto += 'Obra Social ';
            if (saludItem.problema_salud) saludTexto += `- ${saludItem.problema_salud}`;
            doc.text(saludTexto, margin + 2, yPos + 12);
            doc.setTextColor(0, 0, 0);
          });
        }

        yPos += 25;
      });
    } else {
      doc.setFontSize(12);
      doc.setFont(undefined, 'italic');
      doc.setTextColor(128, 128, 128);
      doc.text('No hay integrantes registrados', margin, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 20;
    }

    // ESTUDIOS
    createSection('EDUCACIÓN');

    if (marcador.estudios && marcador.estudios.length > 0) {
      marcador.estudios.forEach((estudio, index) => {
        checkPageBreak(15);
        drawColoredRect(margin, yPos - 3, contentWidth, 12, '#e8f4fd');

        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text(`• ${estudio.nivel}`, margin + 2, yPos + 5);
        yPos += 15;
      });
    } else {
      doc.setFontSize(12);
      doc.setFont(undefined, 'italic');
      doc.setTextColor(128, 128, 128);
      doc.text('No hay información educativa registrada', margin, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 20;
    }

    // OCUPACIONES
    createSection('OCUPACIONES');

    if (marcador.ocupaciones && marcador.ocupaciones.length > 0) {
      marcador.ocupaciones.forEach((ocupacion, index) => {
        checkPageBreak(20);
        drawColoredRect(margin, yPos - 3, contentWidth, 18, '#fff3e0');

        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`${index + 1}. ${ocupacion.nombre}`, margin + 2, yPos + 5);

        doc.setFont(undefined, 'normal');
        doc.text(`Tipo: ${ocupacion.tipo_1} - ${ocupacion.tipo_2}`, margin + 2, yPos + 12);

        if (ocupacion.ingresos) {
          doc.setTextColor(0, 100, 0);
          doc.text(`Ingresos: $${ocupacion.ingresos.toLocaleString()}`, margin + 2, yPos + 18);
          doc.setTextColor(0, 0, 0);
        }

        yPos += 25;
      });
    } else {
      doc.setFontSize(12);
      doc.setFont(undefined, 'italic');
      doc.setTextColor(128, 128, 128);
      doc.text('No hay ocupaciones registradas', margin, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 20;
    }

    // VIVIENDA
    createSection('VIVIENDA');

    if (marcador.viviendas && marcador.viviendas.length > 0) {
      marcador.viviendas.forEach((vivienda, index) => {
        checkPageBreak(20);
        drawColoredRect(margin, yPos - 3, contentWidth, 18, '#e0f2f1');

        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`Tipo: ${vivienda.tipo}`, margin + 2, yPos + 5);

        doc.setFont(undefined, 'normal');
        doc.text(`Dominio: ${vivienda.dominio}`, margin + 2, yPos + 12);
        doc.text(`Ambientes: ${vivienda.ambientes}`, margin + 60, yPos + 12);
        doc.text(`Baño: ${vivienda.baño} ${vivienda.baño_opcion ? `(${vivienda.baño_opcion})` : ''}`, margin + 2, yPos + 18);

        yPos += 25;
      });
    } else {
      doc.setFontSize(12);
      doc.setFont(undefined, 'italic');
      doc.setTextColor(128, 128, 128);
      doc.text('No hay información de vivienda registrada', margin, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 20;
    }

    // SERVICIOS
    createSection('SERVICIOS');

    if (marcador.servicios && marcador.servicios.length > 0) {
      // Agrupar servicios por estado
      const serviciosConectados = marcador.servicios.filter(s => s.opcion_servicio === 'Conectado');
      const serviciosDesconectados = marcador.servicios.filter(s => s.opcion_servicio !== 'Conectado');

      if (serviciosConectados.length > 0) {
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 150, 0);
        doc.text('Servicios Conectados:', margin, yPos);
        yPos += 8;

        doc.setFont(undefined, 'normal');
        serviciosConectados.forEach(servicio => {
          doc.text(`• ${servicio.nombre}`, margin + 5, yPos);
          yPos += 8;
        });
        yPos += 5;
      }

      if (serviciosDesconectados.length > 0) {
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(150, 0, 0);
        doc.text('Servicios No Conectados:', margin, yPos);
        yPos += 8;

        doc.setFont(undefined, 'normal');
        serviciosDesconectados.forEach(servicio => {
          doc.text(`• ${servicio.nombre}`, margin + 5, yPos);
          yPos += 8;
        });
      }
      doc.setTextColor(0, 0, 0);
      yPos += 10;
    } else {
      doc.setFontSize(12);
      doc.setFont(undefined, 'italic');
      doc.setTextColor(128, 128, 128);
      doc.text('No hay servicios registrados', margin, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 20;
    }

    // PROGRAMAS
    createSection('PROGRAMAS');

    if (marcador.programas && marcador.programas.length > 0) {
      // Separar programas activos e inactivos
      const programasActivos = marcador.programas.filter(p => p.estado === 'activo');
      const programasInactivos = marcador.programas.filter(p => p.estado !== 'activo');

      if (programasActivos.length > 0) {
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 100, 0);
        doc.text('Programas Activos:', margin, yPos);
        yPos += 12;

        programasActivos.forEach((programa, index) => {
          checkPageBreak(15);
          drawColoredRect(margin, yPos - 3, contentWidth, 12, '#e8f5e8');

          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(0, 0, 0);
          doc.text(`${index + 1}. ${programa.tipo}`, margin + 2, yPos + 5);

          doc.setFont(undefined, 'normal');
          doc.text(`Ayuda: ${programa.ayuda}`, margin + 5, yPos + 10);

          if (programa.fechaInicio) {
            doc.text(`Desde: ${new Date(programa.fechaInicio).toLocaleDateString('es-ES')}`, margin + 100, yPos + 10);
          }

          yPos += 18;
        });
      }

      if (programasInactivos.length > 0) {
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(150, 0, 0);
        doc.text('Programas Finalizados:', margin, yPos);
        yPos += 12;

        programasInactivos.forEach((programa, index) => {
          checkPageBreak(15);
          drawColoredRect(margin, yPos - 3, contentWidth, 12, '#ffeaea');

          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(0, 0, 0);
          doc.text(`${index + 1}. ${programa.tipo}`, margin + 2, yPos + 5);

          doc.setFont(undefined, 'normal');
          doc.text(`Ayuda: ${programa.ayuda}`, margin + 5, yPos + 10);

          if (programa.fechaFin) {
            doc.text(`Finalizado: ${new Date(programa.fechaFin).toLocaleDateString('es-ES')}`, margin + 100, yPos + 10);
          }

          yPos += 18;
        });
      }
    } else {
      doc.setFontSize(12);
      doc.setFont(undefined, 'italic');
      doc.setTextColor(128, 128, 128);
      doc.text('No hay programas asignados', margin, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 20;
    }

    // SALUD GENERAL
    createSection('SALUD GENERAL');

    if (marcador.salud && marcador.salud.length > 0) {
      marcador.salud.forEach((saludItem, index) => {
        checkPageBreak(20);
        drawColoredRect(margin, yPos - 3, contentWidth, 18, '#ffebee');

        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        if (saludItem.problema_salud) {
          doc.text(`Problema de Salud: ${saludItem.problema_salud}`, margin + 2, yPos + 5);
        }

        doc.setFont(undefined, 'normal');
        let saludInfo = '';
        if (saludItem.cud) saludInfo += 'CUD ';
        if (saludItem.obra_social) saludInfo += 'Obra Social ';

        if (saludInfo) {
          doc.text(`Cobertura: ${saludInfo}`, margin + 2, yPos + 12);
        }

        yPos += 25;
      });
    } else {
      doc.setFontSize(12);
      doc.setFont(undefined, 'italic');
      doc.setTextColor(128, 128, 128);
      doc.text('No hay información de salud registrada', margin, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 20;
    }

    // NOTAS
    if (marcador.notas) {
      createSection('NOTAS');

      // Fondo para las notas
      const notasLines = doc.splitTextToSize(marcador.notas, contentWidth - 10);
      const notasHeight = notasLines.length * 5 + 10;
      drawColoredRect(margin, yPos - 5, contentWidth, notasHeight, '#f8f9fa');

      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      yPos = addTextWithWrap(marcador.notas, margin + 5, yPos, contentWidth - 10);
    }

    // FOOTER
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Página ${i} de ${pageCount}`, pageWidth - 30, doc.internal.pageSize.height - 10);
      doc.text(`Sistema GIS - ${new Date().toLocaleDateString('es-ES')}`, margin, doc.internal.pageSize.height - 10);
    }

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

  } catch (error) {
    console.error('Error al generar el PDF:', error);
    alert('Error al generar el PDF. Verifique la conexión a internet y que jsPDF esté disponible.');
  }
}

function abrirModal(coords: [number, number]) {
  const [lon, lat] = coords;

  nuevoMarcador.value = {
    nombre: '',
    apellido: '',
    direccion: '',
    telefono: '',
    dni: '',
    notas: '',
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
  feature.set('nombreApellido', [marcador.nombre, marcador.apellido].filter(Boolean).join(' '));
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
  nuevoMarcador.value = JSON.parse(JSON.stringify(gisStore.marcadorSeleccionado));

  editando.value = true;
  modalVisible.value = true;
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
      label: 'Eliminar'
    },
    cancel: {
      color: 'primary',
      label: 'Cancelar'
    }
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
      position: 'top'
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
