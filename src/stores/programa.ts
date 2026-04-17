import axios from 'axios'
import { defineStore } from 'pinia'
import { apiUrl } from '@/utils/api'

export type Programa = {
  id: number
  nome: string
}

export const useProgramaStore = defineStore('programa', {
  state: () => ({
    programas: [] as Programa[],
    programaSelecionado: null as Programa | null,
    carregando: false,
  }),

  actions: {
    async buscarProgramas (search = '') {
      const route = apiUrl(`/api/programas`
        + (search ? `?search=${search}` : ''))
      const response = await axios.get(route)
      this.programas = response.data
    },

    selecionarPrograma (programa: Programa | null) {
      this.programaSelecionado = programa
    },
  },
})
