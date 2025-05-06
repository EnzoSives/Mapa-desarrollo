import { defineStore } from 'pinia';
import axios from 'axios';

export interface Marcador {
  id: number;
  nombre: string;
  descripcion: string;
  latitud: number;
  longitud: number;
  icono: string;
}

export const useGisStore = defineStore('gis', {
  state: () => ({
    marcadores: [] as Marcador[],
    marcadorSeleccionado: null as Marcador | null,
  }),

  actions: {
    async cargarMarcadoresDesdeAPI() {
      try {
        const response = await axios.get('http://localhost:3000/marcador');
        this.marcadores = response.data;
        this.guardarLocalStorage();
      } catch (error) {
        console.error('Error al cargar marcadores desde la API:', error);
      }
    },

    async agregarMarcador(marcador: Omit<Marcador, 'id'>) {
      try {
        const response = await axios.post(
          'http://localhost:3000/marcador',
          marcador
        );
        const nuevoMarcador: Marcador = response.data;

        this.marcadores.push(nuevoMarcador);
        this.marcadorSeleccionado = nuevoMarcador;
        this.guardarLocalStorage();

        return nuevoMarcador; // <-- Esto es clave
      } catch (error) {
        console.error('Error al agregar marcador:', error);
      }
    },

    async editarMarcador(marcadorEditado: Marcador) {
      try {
        await axios.put(
          `http://localhost:3000/marcador/${marcadorEditado.id}`,
          marcadorEditado
        );
        const index = this.marcadores.findIndex(
          (m) => m.id === marcadorEditado.id
        );
        if (index !== -1) {
          this.marcadores[index] = marcadorEditado;
          this.guardarLocalStorage();
          this.marcadorSeleccionado = null;
        }
      } catch (error) {
        console.error('Error al editar marcador:', error);
      }
    },

    async eliminarMarcador(id: number) {
      try {
        await axios.delete(`http://localhost:3000/marcador/${id}`);
        this.marcadores = this.marcadores.filter((m) => m.id !== id);
        this.guardarLocalStorage();
        if (this.marcadorSeleccionado?.id === id) {
          this.marcadorSeleccionado = null;
        }
      } catch (error) {
        console.error('Error al eliminar marcador:', error);
      }
    },

    seleccionarMarcador(id: number) {
      this.marcadorSeleccionado =
        this.marcadores.find((m) => m.id === id) || null;
    },

    cerrarInfo() {
      this.marcadorSeleccionado = null;
    },

    guardarLocalStorage() {
      localStorage.setItem('marcadores', JSON.stringify(this.marcadores));
    },

    cargarDesdeLocalStorage() {
      const data = localStorage.getItem('marcadores');
      if (data) {
        this.marcadores = JSON.parse(data);
      }
    },
  },
});
