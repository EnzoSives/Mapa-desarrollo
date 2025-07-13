import { defineStore } from 'pinia';
import axios from 'axios';

export interface Programa {
  id: number;
  tipo: string;
  ayuda: string;
  detalle: string; // ⬅️ nuevo campo
  mes: string; // ⬅️ nuevo campo 
  cantidad: number;
  notas?: string; // ⬅️ nuevo campo opcional
  estado: string;
  fechaInicio: string;
  fechaUltimaModificacion: string;
  fechaFin?: string | null;
}

export interface Marcador {
  id: number;
  nombre: string;
  apellido: string; // ⬅️ nuevo campo
  direccion: string;
  telefono: string;
  dni: string;
  barrio: string;
  tiempo_residencia: string;
  ayudas?: string[];
  latitud: number;
  longitud: number;
  icono: string;
  integrantes?: string[];
  programas?: Programa[];
}

export const useGisStore = defineStore('gis', {
  state: () => ({
    marcadores: [] as Marcador[],
    marcadorSeleccionado: null as Marcador | null,
    marcadorSeleccionadoProgramasCompletos: [] as Programa[], // ⬅️ nueva propiedad
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

    async agregarMarcador(marcador: Omit<Marcador, 'id'>) {
      try {
        const response = await axios.post(
          'http://179.43.127.133:3006/marcador',
          marcador
        );
        const nuevoMarcador: Marcador = response.data;
        this.marcadores.push(nuevoMarcador);
        this.marcadorSeleccionado = nuevoMarcador;
      } catch (error) {
        console.error('Error al agregar marcador:', error);
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

    cerrarInfo() {
      this.marcadorSeleccionado = null;
    },
  },
});
