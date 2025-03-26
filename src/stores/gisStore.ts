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
    marcadores: JSON.parse(localStorage.getItem('marcadores') || '[]'),
    marcadorSeleccionado: null,
  }),
  actions: {
    agregarMarcador(marcador: any) {
      this.marcadores.push(marcador);
      localStorage.setItem('marcadores', JSON.stringify(this.marcadores));
    },
    seleccionarMarcador(id: any) {
      this.marcadorSeleccionado =
        this.marcadores.find((m: Marcador) => m.id === id) || null;
    },
    cerrarInfo() {
      this.marcadorSeleccionado = null;
    },
  },
});
