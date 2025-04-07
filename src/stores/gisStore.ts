import { defineStore } from 'pinia';

export interface Marcador {
  id: number;
  nombre: string;
  descripcion: string;
  latitud: number;
  longitud: number;
}

export const useGisStore = defineStore('gis', {
  state: () => ({
    marcadores: JSON.parse(localStorage.getItem('marcadores') || '[]') as Marcador[],
    marcadorSeleccionado: null as Marcador | null,
  }),

  actions: {
    agregarMarcador(marcador: Marcador) {
      this.marcadores.push(marcador);
      localStorage.setItem('marcadores', JSON.stringify(this.marcadores));
    },

    seleccionarMarcador(id: number) {
      this.marcadorSeleccionado =
        this.marcadores.find((m: Marcador) => m.id === id) || null;
    },

    cerrarInfo() {
      this.marcadorSeleccionado = null;
    },

    eliminarMarcador(id: number) {
      const index = this.marcadores.findIndex(m => m.id === id);
      if (index !== -1) {
        this.marcadores.splice(index, 1); 
        localStorage.setItem('marcadores', JSON.stringify(this.marcadores));

        if (this.marcadorSeleccionado?.id === id) {
          this.marcadorSeleccionado = null;
        }
      }
    }
  }
});
