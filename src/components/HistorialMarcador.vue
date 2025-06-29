<template>
    <div class="historial-marcador">
        <!-- Botón para abrir el modal -->
        <q-btn @click="abrirModal" label="Ver Historial del Marcador" color="primary" icon="history" class="q-ma-md" />

        <!-- Modal del historial -->
        <q-dialog v-model="modalAbierto" persistent maximized>
            <q-card>
                <!-- Header del modal -->
                <q-card-section class="row items-center q-pb-none bg-primary text-white">
                    <div class="text-h6">
                        <q-icon name="history" class="q-mr-sm" />
                        Historial de Informes de {{ marcador.nombre }} {{ marcador.apellido }}
                    </div>
                    <q-space />
                    <q-btn icon="close" style="bottom: 10px; right: 16px;" flat round v-close-popup />
                </q-card-section>

                <!-- Contenido del modal -->
                <q-card-section class="q-pa-md">
                    <!-- Filtros -->
                    <div class="row q-gutter-md q-mb-md">
                        <div class="col-12 col-md-3">
                            <q-input v-model="filtroFechaInicio" type="date" label="Fecha inicio" outlined dense
                                @update:model-value="filtrarPorFecha" />
                        </div>
                        <div class="col-12 col-md-3">
                            <q-input v-model="filtroFechaFin" type="date" label="Fecha fin" outlined dense
                                @update:model-value="filtrarPorFecha" />
                        </div>
                        <div class="col-12 col-md-3">
                            <!-- <q-select v-model="filtroTipoOperacion" :options="tiposOperacion" label="Tipo de operación"
                                outlined dense clearable @update:model-value="filtrarPorFecha" /> -->
                        </div>
                        <div class="col-12 col-md-3">
                            <q-btn @click="limpiarFiltros" label="Limpiar filtros" color="grey" outline dense
                                class="full-width" />
                        </div>
                    </div>

                    <!-- Loading state -->
                    <div v-if="loading" class="text-center q-pa-xl">
                        <q-spinner-dots size="40px" color="primary" />
                        <p class="q-mt-md">Cargando historial...</p>
                    </div>

                    <!-- Error state -->
                    <div v-else-if="error" class="q-pa-md">
                        <q-banner class="bg-negative text-white">
                            <template v-slot:avatar>
                                <q-icon name="error" />
                            </template>
                            {{ error }}
                            <template v-slot:action>
                                <q-btn flat label="Reintentar" @click="cargarHistorial" />
                            </template>
                        </q-banner>
                    </div>

                    <!-- Data table -->
                    <div v-else>
                        <q-table :rows="historialFiltrado" :columns="columns" row-key="id" :pagination="pagination"
                            :loading="loading" flat bordered class="historial-table">
                            <template v-slot:body-cell-fecha_modificacion="props">
                                <q-td :props="props">
                                    <div>
                                        <div class="text-weight-medium">
                                            {{ formatearFecha(props.value) }}
                                        </div>
                                        <div class="text-grey-6 text-caption">
                                            {{ formatearHora(props.value) }}
                                        </div>
                                    </div>
                                </q-td>
                            </template>

                            <template v-slot:body-cell-tipo_operacion="props">
                                <q-td :props="props">
                                    <q-chip :color="getColorTipoOperacion(props.value)"
                                        :icon="getIconoTipoOperacion(props.value)" text-color="white" dense>
                                        {{ formatearTipoOperacion(props.value) }}
                                    </q-chip>
                                </q-td>
                            </template>

                            <template v-slot:body-cell-resumen_cambios="props">
                                <q-td :props="props">
                                    <div class="cambios-summary">
                                        <div v-if="props.row.programas_snapshot?.length" class="q-mb-xs">
                                            <q-chip size="sm" color="blue-2" text-color="blue-8">
                                                {{ props.row.programas_snapshot.length }} programas
                                            </q-chip>
                                        </div>
                                        <div v-if="props.row.integrantes_snapshot?.length" class="q-mb-xs">
                                            <q-chip size="sm" color="green-2" text-color="green-8">
                                                {{ props.row.integrantes_snapshot.length }} integrantes
                                            </q-chip>
                                        </div>
                                        <div v-if="props.row.servicios_snapshot?.length" class="q-mb-xs">
                                            <q-chip size="sm" color="orange-2" text-color="orange-8">
                                                {{ props.row.servicios_snapshot.length }} servicios
                                            </q-chip>
                                        </div>
                                    </div>
                                </q-td>
                            </template>

                            <template v-slot:body-cell-acciones="props">
                                <q-td :props="props">
                                    <q-btn flat round color="primary" icon="visibility" size="sm"
                                        @click="verDetalle(props.row)">
                                        <q-tooltip>Ver detalle completo</q-tooltip>
                                    </q-btn>
                                    <!-- <q-btn flat round color="info" icon="compare" size="sm"
                                        @click="compararVersiones(props.row)" :disable="!puedeComparar(props.row)">
                                        <q-tooltip>Comparar con versión anterior</q-tooltip>
                                    </q-btn> -->
                                </q-td>
                            </template>

                            <template v-slot:no-data>
                                <div class="full-width row flex-center text-grey q-gutter-sm">
                                    <q-icon size="2em" name="inbox" />
                                    <span>No hay datos de historial disponibles</span>
                                </div>
                            </template>
                        </q-table>
                    </div>
                </q-card-section>

                <!-- Actions del modal principal -->
                <q-card-actions align="right" class="q-pa-md">
                    <q-btn flat label="Cerrar" color="primary" v-close-popup />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <!-- Dialog para mostrar detalles completos -->
        <q-dialog v-model="dialogDetalle" persistent>
            <q-card style="min-width: 90vw; max-width: 1200px; max-height: 90vh; overflow-y: auto;" class="q-pa-md">
                <!-- Encabezado -->
                <q-card-section class="row items-center q-pb-none">
                    <div class="text-h6 text-weight-bold text-primary">
                        Detalle del Registro #{{ registroSeleccionado?.id }}
                    </div>
                    <q-space />
                    <q-btn icon="close" flat round dense v-close-popup />
                </q-card-section>

                <!-- Contenido -->
                <q-card-section v-if="registroSeleccionado" class="q-pt-md">
                    <div class="row q-col-gutter-md">

                        <!-- Información básica -->
                        <div class="col-12 col-md-6 q-mb-md">
                            <q-card flat bordered>
                                <q-card-section>
                                    <div class="text-h6 text-primary text-weight-bold q-mb-md">
                                        <q-icon name="person" class="q-mr-sm text-blue-7" />
                                        Información Básica
                                    </div>
                                    <div class="info-grid">
                                        <div><strong>Nombre:</strong> {{ registroSeleccionado.nombre }} {{
                                            registroSeleccionado.apellido }}</div>
                                        <div><strong>DNI:</strong> {{ registroSeleccionado.dni }}</div>
                                        <div><strong>Teléfono:</strong> {{ registroSeleccionado.telefono }}</div>
                                        <div><strong>Dirección:</strong> {{ registroSeleccionado.direccion }}</div>
                                        <div><strong>Barrio:</strong> {{ registroSeleccionado.barrio }}</div>
                                        <div><strong>Tiempo residencia:</strong> {{
                                            registroSeleccionado.tiempo_residencia }}
                                        </div>
                                        <div><strong>Fecha modificación:</strong> {{
                                            formatearFechaCompleta(registroSeleccionado.fecha_modificacion) }}</div>
                                        <div><strong>Tipo operación:</strong> {{
                                            formatearTipoOperacion(registroSeleccionado.tipo_operacion) }}</div>
                                        <div v-if="registroSeleccionado.notas"><strong>Notas:</strong> {{
                                            registroSeleccionado.notas }}</div>
                                    </div>
                                </q-card-section>
                            </q-card>
                        </div>

                        <!-- Programas -->
                        <div class="col-12 col-md-6 q-mb-md">
                            <q-card flat bordered>
                                <q-card-section>
                                    <div class="text-h6 text-primary text-weight-bold q-mb-md">
                                        <q-icon name="assignment" class="q-mr-sm text-blue-7" />
                                        Programas ({{ registroSeleccionado.programas_snapshot?.length || 0 }})
                                    </div>
                                    <div v-if="registroSeleccionado.programas_snapshot?.length">
                                        <q-list separator>
                                            <q-item v-for="programa in registroSeleccionado.programas_snapshot"
                                                :key="programa.id">
                                                <q-item-section>
                                                    <q-item-label>{{ programa.ayuda }}</q-item-label>
                                                    <q-item-label caption>
                                                        Tipo: {{ programa.tipo }} |
                                                        Estado: {{ programa.estado }} |
                                                        Inicio: {{ formatearFecha(programa.fechaInicio) }}
                                                    </q-item-label>
                                                    <q-item-label caption v-if="programa.notas">
                                                        Notas: {{ programa.notas }}
                                                    </q-item-label>
                                                </q-item-section>
                                                <q-item-section side>
                                                    <q-chip :color="programa.estado === 'activo' ? 'green-6' : 'grey-5'"
                                                        text-color="white" dense class="q-pa-xs" square>
                                                        <q-icon name="check_circle" size="16px" class="q-mr-xs"
                                                            v-if="programa.estado === 'activo'" />
                                                        {{ programa.estado }}
                                                    </q-chip>
                                                </q-item-section>
                                            </q-item>
                                        </q-list>
                                    </div>
                                    <div v-else class="text-grey-6">No hay programas registrados</div>
                                </q-card-section>
                            </q-card>
                        </div>

                        <!-- Integrantes -->
                        <div class="col-12 col-md-6 q-mb-md">
                            <q-card flat bordered>
                                <q-card-section>
                                    <div class="text-h6 text-primary text-weight-bold q-mb-md">
                                        <q-icon name="group" class="q-mr-sm text-blue-7" />
                                        Integrantes ({{ registroSeleccionado.integrantes_snapshot?.length || 0 }})
                                    </div>
                                    <div v-if="registroSeleccionado.integrantes_snapshot?.length">
                                        <q-list separator>
                                            <q-item v-for="integrante in registroSeleccionado.integrantes_snapshot"
                                                :key="integrante.id">
                                                <q-item-section>
                                                    <q-item-label>{{ integrante.nombre }} {{ integrante.apellido
                                                        }}</q-item-label>
                                                    <q-item-label caption>
                                                        DNI: {{ integrante.dni }} |
                                                        Edad: {{ integrante.edad }} |
                                                        Vínculo: {{ integrante.vinculo }}
                                                    </q-item-label>
                                                    <q-item-label caption v-if="integrante.salud?.length">
                                                        Salud: {{integrante.salud.map(s => s.problema_salud).join(', ')
                                                        }}
                                                    </q-item-label>
                                                </q-item-section>
                                            </q-item>
                                        </q-list>
                                    </div>
                                    <div v-else class="text-grey-6">No hay integrantes registrados</div>
                                </q-card-section>
                            </q-card>
                        </div>

                        <!-- Servicios -->
                        <div class="col-12 col-md-6 q-mb-md">
                            <q-card flat bordered>
                                <q-card-section>
                                    <div class="text-h6 text-primary text-weight-bold q-mb-md">
                                        <q-icon name="build" class="q-mr-sm text-blue-7" />
                                        Servicios ({{ registroSeleccionado.servicios_snapshot?.length || 0 }})
                                    </div>
                                    <div v-if="registroSeleccionado.servicios_snapshot?.length">
                                        <q-list>
                                            <q-item v-for="servicio in registroSeleccionado.servicios_snapshot"
                                                :key="servicio.id">
                                                <q-item-section>
                                                    <q-item-label>{{ servicio.nombre }}</q-item-label>
                                                </q-item-section>
                                                <q-item-section side>
                                                    <q-chip
                                                        :color="servicio.opcion_servicio === 'Conectado' ? 'green-6' : 'grey-5'"
                                                        text-color="white" dense square>
                                                        {{ servicio.opcion_servicio }}
                                                    </q-chip>
                                                </q-item-section>
                                            </q-item>
                                        </q-list>
                                    </div>
                                    <div v-else class="text-grey-6">No hay servicios registrados</div>
                                </q-card-section>
                            </q-card>
                        </div>

                        <!-- Vivienda -->
                        <div class="col-12 col-md-6 q-mb-md" v-if="registroSeleccionado.viviendas_snapshot?.length">
                            <q-card flat bordered>
                                <q-card-section>
                                    <div class="text-h6 text-primary text-weight-bold q-mb-md">
                                        <q-icon name="home" class="q-mr-sm text-blue-7" />
                                        Vivienda
                                    </div>
                                    <div v-for="vivienda in registroSeleccionado.viviendas_snapshot" :key="vivienda.id"
                                        class="info-grid">
                                        <div><strong>Tipo:</strong> {{ vivienda.tipo }}</div>
                                        <div><strong>Dominio:</strong> {{ vivienda.dominio }}</div>
                                        <div><strong>Ambientes:</strong> {{ vivienda.ambientes }}</div>
                                        <div><strong>Baño:</strong> {{ vivienda.baño }} ({{ vivienda.baño_opcion }})
                                        </div>
                                    </div>
                                </q-card-section>
                            </q-card>
                        </div>

                        <!-- Ocupaciones -->
                        <div class="col-12 col-md-6 q-mb-md" v-if="registroSeleccionado.ocupaciones_snapshot?.length">
                            <q-card flat bordered>
                                <q-card-section>
                                    <div class="text-h6 text-primary text-weight-bold q-mb-md">
                                        <q-icon name="work" class="q-mr-sm text-blue-7" />
                                        Ocupaciones
                                    </div>
                                    <div v-for="ocupacion in registroSeleccionado.ocupaciones_snapshot"
                                        :key="ocupacion.id" class="info-grid">
                                        <div><strong>Tipo principal:</strong> {{ ocupacion.tipo_principal }}</div>
                                        <div><strong>Tipo 1:</strong> {{ ocupacion.tipo_1 }}</div>
                                        <div><strong>Tipo 2:</strong> {{ ocupacion.tipo_2 }}</div>
                                        <div><strong>Ingresos:</strong> ${{ ocupacion.ingresos?.toLocaleString() ||
                                            'Nos especificado' }}</div>
                                    </div>
                                </q-card-section>
                            </q-card>
                        </div>
                    </div>
                </q-card-section>

                <!-- Acciones -->
                <q-card-actions align="right">
                    <q-btn flat label="Cerrar" color="primary" v-close-popup />
                </q-card-actions>
            </q-card>
        </q-dialog>

    </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import axios from 'axios'

export default {
    name: 'HistorialMarcador',
    props: {
        idMarcador: {
            type: Number,
            required: true,
            default: 1 // Valor por defecto para pruebas
        },
        marcador: {
            type: Object,
            required: true
        }
    },
    setup(props) {
        const $q = useQuasar()

        // Estado reactivo
        const historial = ref([])
        const loading = ref(false)
        const error = ref(null)
        const filtroFechaInicio = ref('')
        const filtroFechaFin = ref('')
        const filtroTipoOperacion = ref(null)
        const dialogDetalle = ref(false)
        const registroSeleccionado = ref(null)
        const modalAbierto = ref(false) // Nuevo estado para controlar el modal

        // Opciones para filtros
        const tiposOperacion = ref([
            'UPDATE',
            'BEFORE_RELATIONS_UPDATE',
            'CREATE',
            'DELETE'
        ])

        // Configuración de la tabla
        const columns = [

            {
                name: 'fecha_modificacion',
                required: true,
                label: 'Fecha de Modificación',
                align: 'left',
                field: 'fecha_modificacion',
                sortable: true,
                sort: (a, b) => new Date(b) - new Date(a),
                style: 'width: 150px'
            },
            {
                name: 'tipo_operacion',
                label: 'Tipo de Operación',
                align: 'center',
                field: 'tipo_operacion',
                sortable: true,
                style: 'width: 180px'
            },
            {
                name: 'nombre',
                label: 'Nombre',
                align: 'left',
                field: row => `${row.nombre} ${row.apellido}`,
                sortable: true,
                style: 'width: 200px'
            },
            {
                name: 'resumen_cambios',
                label: 'Resumen de Datos',
                align: 'center',
                style: 'width: 200px'
            },
            {
                name: 'acciones',
                label: 'Acciones',
                align: 'center',
                style: 'width: 120px'
            }
        ]

        const pagination = ref({
            sortBy: 'fecha_modificacion',
            descending: true,
            page: 1,
            rowsPerPage: 10
        })

        // Computed para filtrar datos
        const historialFiltrado = computed(() => {
            let resultado = [...historial.value]

            // Filtro por fechas
            if (filtroFechaInicio.value || filtroFechaFin.value) {
                resultado = resultado.filter(registro => {
                    const fechaRegistro = new Date(registro.fecha_modificacion)
                    const fechaInicio = filtroFechaInicio.value ? new Date(filtroFechaInicio.value) : null
                    const fechaFin = filtroFechaFin.value ? new Date(filtroFechaFin.value + 'T23:59:59') : null

                    if (fechaInicio && fechaRegistro < fechaInicio) return false
                    if (fechaFin && fechaRegistro > fechaFin) return false

                    return true
                })
            }

            // Filtro por tipo de operación
            if (filtroTipoOperacion.value) {
                resultado = resultado.filter(registro =>
                    registro.tipo_operacion === filtroTipoOperacion.value
                )
            }

            return resultado
        })

        // Métodos
        const abrirModal = () => {
            modalAbierto.value = true
            // Siempre cargar el historial al abrir el modal para asegurar datos actualizados
            cargarHistorial()
        }

        const cargarHistorial = async () => {
            loading.value = true
            error.value = null

            try {
                const response = await axios.get(`http://localhost:3006/marcador/${props.idMarcador}/historial`)
                historial.value = response.data || []

                // Extraer tipos de operación únicos para el filtro
                const tiposUnicos = [...new Set(historial.value.map(item => item.tipo_operacion))]
                tiposOperacion.value = tiposUnicos

                $q.notify({
                    type: 'positive',
                    message: 'Historial cargado correctamente',
                    position: 'top-right'
                })
            } catch (err) {
                console.error('Error al cargar historial:', err)
                error.value = 'Error al cargar el historial del marcador'

                $q.notify({
                    type: 'negative',
                    message: 'Error al cargar el historial',
                    position: 'top-right'
                })
            } finally {
                loading.value = false
            }
        }

        const filtrarPorFecha = () => {
            // El computed se encargará del filtrado automáticamente
        }

        const limpiarFiltros = () => {
            filtroFechaInicio.value = ''
            filtroFechaFin.value = ''
            filtroTipoOperacion.value = null
        }

        const verDetalle = (registro) => {
            registroSeleccionado.value = registro
            dialogDetalle.value = true
        }

        const compararVersiones = (registro) => {
            // Implementar comparación entre versiones
            $q.notify({
                type: 'info',
                message: 'Función de comparación en desarrollo',
                position: 'top-right'
            })
        }

        const puedeComparar = (registro) => {
            const index = historial.value.findIndex(item => item.id === registro.id)
            return index < historial.value.length - 1
        }

        const formatearFecha = (fecha) => {
            return new Date(fecha).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            })
        }

        const formatearHora = (fecha) => {
            return new Date(fecha).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            })
        }

        const formatearFechaCompleta = (fecha) => {
            return new Date(fecha).toLocaleString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        }

        const formatearTipoOperacion = (tipo) => {
            const tipos = {
                'UPDATE': 'Actualización',
                'BEFORE_RELATIONS_UPDATE': 'Pre-actualización',
                'CREATE': 'Creación',
                'DELETE': 'Eliminación'
            }
            return tipos[tipo] || tipo
        }

        const getColorTipoOperacion = (tipo) => {
            const colores = {
                'UPDATE': 'blue',
                'BEFORE_RELATIONS_UPDATE': 'orange',
                'CREATE': 'positive',
                'DELETE': 'negative'
            }
            return colores[tipo] || 'grey'
        }

        const getIconoTipoOperacion = (tipo) => {
            const iconos = {
                'UPDATE': 'edit',
                'BEFORE_RELATIONS_UPDATE': 'schedule',
                'CREATE': 'add',
                'DELETE': 'delete'
            }
            return iconos[tipo] || 'help'
        }

        return {
            historial,
            historialFiltrado,
            loading,
            error,
            filtroFechaInicio,
            filtroFechaFin,
            filtroTipoOperacion,
            tiposOperacion,
            dialogDetalle,
            registroSeleccionado,
            modalAbierto,
            columns,
            pagination,
            abrirModal,
            cargarHistorial,
            filtrarPorFecha,
            limpiarFiltros,
            verDetalle,
            compararVersiones,
            puedeComparar,
            formatearFecha,
            formatearHora,
            formatearFechaCompleta,
            formatearTipoOperacion,
            getColorTipoOperacion,
            getIconoTipoOperacion
        }
    }
}
</script>

<style lang="scss" scoped>
.historial-marcador {
    .historial-table {
        .q-td {
            vertical-align: top;
        }
    }

    .info-grid {
        display: grid;
        gap: 8px;

        >div {
            padding: 4px 0;
            border-bottom: 1px solid #f0f0f0;

            &:last-child {
                border-bottom: none;
            }
        }
    }

    .cambios-summary {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
    }

    .info-grid {
        display: grid;
        grid-template-columns: 1fr;
        row-gap: 8px;
    }

    @media (min-width: 600px) {
        .info-grid {
            grid-template-columns: 1fr 1fr;
            column-gap: 16px;
        }
    }
}
</style>