// src/stores/gisStore.ts
import { defineStore } from 'pinia';

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
    marcadores: JSON.parse(localStorage.getItem('marcadores') || '[]') as Marcador[],
    marcadorSeleccionado: null as Marcador | null,
  }),

  actions: {
    agregarMarcador(marcador: Marcador) {
      this.marcadores.push(marcador);
      this.guardarLocalStorage();
    },

    editarMarcador(marcadorEditado: Marcador) {
      const index = this.marcadores.findIndex(m => m.id === marcadorEditado.id);
      if (index !== -1) {
        this.marcadores[index] = marcadorEditado;
        this.guardarLocalStorage();
        this.marcadorSeleccionado = null;
      }
    },

    eliminarMarcador(id: number) {
      this.marcadores = this.marcadores.filter(m => m.id !== id);
      this.guardarLocalStorage();
      if (this.marcadorSeleccionado?.id === id) {
        this.marcadorSeleccionado = null;
      }
    },

    seleccionarMarcador(id: number) {
      this.marcadorSeleccionado = this.marcadores.find(m => m.id === id) || null;
    },

    cerrarInfo() {
      this.marcadorSeleccionado = null;
    },

    guardarLocalStorage() {
      localStorage.setItem('marcadores', JSON.stringify(this.marcadores));
    }
  }
});
