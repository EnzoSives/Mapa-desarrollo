import { defineStore } from 'pinia';
import axios from 'axios';

export interface Programa {
  id: number;
  tipo: string;
  ayuda: string;
  detalle: string; // ⬅️ nuevo campo
  mes?: string; // ⬅️ nuevo campo 
  cantidad?: number;
  notas?: string; // ⬅️ nuevo campo opcional
  estado: string;
  fechaInicio: string;
  fechaUltimaModificacion: string;
  fechaFin?: string | null;
}

export interface Estudio {
  nivel: string;
}

export interface Salud {
  cud: boolean;
  obra_social: boolean;
  problema_salud: string;
}

export interface Ocupacion {
  nombre?: string;
  tipo_principal: string;
  tipo_1: string;
  tipo_2: string;
  ingresos: number | null;
}

export interface Vivienda {
  tipo: string;
  dominio: string;
  ambientes: string;
  baño: string;
  baño_opcion: string;
}

export interface Servicio {
  nombre: string;
  opcion_servicio: string;
}

export interface Integrante {
  nombre: string;
  apellido: string;
  edad: number | null;
  dni: string;
  vinculo: string;
  salud: Salud[];
  ocupaciones: Ocupacion[];
}

export interface Marcador {
  id: number;
  nombre: string;
  apellido: string;
  direccion: string;
  telefono: string;
  dni: string;
  barrio: string;
  tiempo_residencia: string;
  ayudas?: string[];
  latitud: number;
  longitud: number;
  icono: string;
  integrantes?: Integrante[];
  programas?: Programa[];
  estudios?: Estudio[];
  salud?: Salud[];
  ocupaciones?: Ocupacion[];
  viviendas?: Vivienda[];
  servicios?: Servicio[];
  notas?: string;
  fechaCreacion: string;
  // Campos del endpoint por-anio
  esDatoVivo?: boolean;
  anio_dato?: number;
}

export interface DatosAnuales {
  anio: number;
  esDatoVivo: boolean;
  marcador: Marcador;
  fechaCierre?: string;
}

export interface DiferenciaAnual {
  marcadorId: number;
  anio1: number;
  anio2: number;
  diferencias: Record<string, { [key: string]: string }>;
  datos_anio1: Marcador;
  datos_anio2: Marcador;
}

export const useGisStore = defineStore('gis', {
  state: () => ({
    marcadores: [] as Marcador[],
    marcadorSeleccionado: null as Marcador | null,
    marcadorSeleccionadoProgramasCompletos: [] as Programa[], // ⬅️ nueva propiedad
    // Historial anual
    aniosDisponibles: [] as number[],
    datosAnuales: null as DatosAnuales | null,
    comparacionAnual: null as DiferenciaAnual | null,
  }),

  actions: {
    async cargarMarcadoresDesdeAPI() {
      try {
        const response = await axios.get('http://179.43.127.133:3006/marcador');
        this.marcadores = response.data;
      } catch (error) {
        console.error('Error al cargar marcadores desde la API:', error);
      }
    },

    async cargarMarcadoresPorAnio(anio: number) {
      try {
        const response = await axios.get(
          `http://179.43.127.133:3006/marcador/por-anio/${anio}`
        );
        this.marcadores = response.data;
      } catch (error) {
        console.error('Error al cargar marcadores por año:', error);
      }
    },

    async agregarMarcador(marcador: Omit<Marcador, 'id'>): Promise<Marcador> {
      try {
        const response = await axios.post(
          'http://179.43.127.133:3006/marcador',
          marcador
        );
        const nuevoMarcador: Marcador = response.data;
        this.marcadores.push(nuevoMarcador);
        this.marcadorSeleccionado = nuevoMarcador;
        return nuevoMarcador;
      } catch (error) {
        console.error('Error al agregar marcador:', error);
        throw error;
      }
    },

    async editarMarcador(marcadorEditado: Marcador) {
      try {
        console.log('Marcador que se enviará al backend:', marcadorEditado);

        const response = await axios.put(
          `http://179.43.127.133:3006/marcador/${marcadorEditado.id}`,
          {
            ...marcadorEditado,
            programas: marcadorEditado.programas, // 👈 asegurate de que esto esté presente
          }
        );

        const marcadorActualizado: Marcador = response.data;
        console.log('Marcador actualizado desde el backend:', marcadorActualizado);

        const index = this.marcadores.findIndex(
          (m) => m.id === marcadorActualizado.id
        );
        if (index !== -1) {
          this.marcadores[index] = marcadorActualizado;
        }

        this.marcadorSeleccionado = null;
      } catch (error) {
        console.error('Error al editar marcador:', error);
      }
    },

    async eliminarMarcador(id: number) {
      try {
        await axios.delete(`http://179.43.127.133:3006/marcador/${id}`);
        this.marcadores = this.marcadores.filter((m) => m.id !== id);
        if (this.marcadorSeleccionado?.id === id) {
          this.marcadorSeleccionado = null;
        }
      } catch (error) {
        console.error('Error al eliminar marcador:', error);
      }
    },

    async seleccionarMarcador(id: number) {
      try {
        const response = await axios.get(
          `http://179.43.127.133:3006/marcador/${id}`
        );
        const marcadorCompleto: Marcador = response.data;

        if (marcadorCompleto.programas) {
          this.marcadorSeleccionadoProgramasCompletos =
            marcadorCompleto.programas; // guarda todos

          marcadorCompleto.programas = marcadorCompleto.programas.filter(
            (p: Programa) => p.estado === 'activo'
          );

          marcadorCompleto.programas.sort(
            (a: Programa, b: Programa) =>
              new Date(a.fechaInicio).getTime() -
              new Date(b.fechaInicio).getTime()
          );
        }

        this.marcadorSeleccionado = marcadorCompleto;
      } catch (error) {
        console.error('Error al obtener el marcador completo:', error);
      }
    },

    // Seleccionar marcador desde los datos ya cargados (para años históricos)
    seleccionarMarcadorDesdeCache(id: number) {
      const marcador = this.marcadores.find((m) => m.id === id);
      if (marcador) {
        this.marcadorSeleccionadoProgramasCompletos = marcador.programas || [];
        this.marcadorSeleccionado = { ...marcador };
      }
    },

    cerrarInfo() {
      this.marcadorSeleccionado = null;
this.aniosDisponibles = [];
      this.datosAnuales = null;
      this.comparacionAnual = null;
    },

    // ===== HISTORIAL ANUAL =====

    async cargarAniosDisponibles(marcadorId: number) {
      try {
        const response = await axios.get(
          `http://179.43.127.133:3006/marcador/${marcadorId}/anual/anios`
        );
        this.aniosDisponibles = response.data;
        return response.data;
      } catch (error) {
        console.error('Error al cargar años disponibles:', error);
        this.aniosDisponibles = [];
        return [];
      }
    },

    async cargarDatosAnuales(marcadorId: number, anio: number) {
      try {
        const response = await axios.get(
          `http://179.43.127.133:3006/marcador/${marcadorId}/anual/${anio}`
        );
        this.datosAnuales = response.data;
        return response.data;
      } catch (error) {
        console.error('Error al cargar datos anuales:', error);
        this.datosAnuales = null;
        throw error;
      }
    },

    async cerrarAnioMarcador(marcadorId: number, anio: number) {
      try {
        const response = await axios.post(
          `http://179.43.127.133:3006/marcador/${marcadorId}/anual/${anio}/cerrar`
        );
        return response.data;
      } catch (error) {
        console.error('Error al cerrar año del marcador:', error);
        throw error;
      }
    },

    async cerrarAnioMasivo(anio: number) {
      try {
        const response = await axios.post(
          `http://179.43.127.133:3006/marcador/anual/${anio}/cerrar-masivo`
        );
        return response.data;
      } catch (error) {
        console.error('Error al cerrar año masivo:', error);
        throw error;
      }
    },

    async compararAnios(marcadorId: number, anio1: number, anio2: number) {
      try {
        const response = await axios.get(
          `http://179.43.127.133:3006/marcador/${marcadorId}/anual/comparar?anio1=${anio1}&anio2=${anio2}`
        );
        this.comparacionAnual = response.data;
        return response.data;
      } catch (error) {
        console.error('Error al comparar años:', error);
        this.comparacionAnual = null;
        throw error;
      }
    },
  },
});
