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
  }),

  actions: {
    async buscarProgramas (search = '') {
      const params = new URLSearchParams()
      if (search) {
        params.set('search', search)
      }
      const query = params.toString() ? `?${params.toString()}` : ''
      const route = apiUrl(`/api/programas${query}`)
      const response = await axios.get(route)
      this.programas = response.data
    },

    selecionarPrograma (programa: Programa | null) {
      this.programaSelecionado = programa
    },
  },
})
