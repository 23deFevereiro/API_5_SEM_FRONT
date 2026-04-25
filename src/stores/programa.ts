import axios from 'axios'
import { defineStore } from 'pinia'
import { apiUrl } from '@/utils/api'

export type Programa = {
  id: number
  codigo_programa: string
  nome_programa: string
}

type ResumoProjeto = {
  total_projetos: number
  horas_estimadas: number
  horas_realizadas: number
  custo_estimado: number
  custo_real: number
}

export const useProgramaStore = defineStore('programa', {
  state: () => ({
    programas: [] as Programa[],
    programaSelecionado: null as Programa | null,
    resumo: null as ResumoProjeto | null,
    carregando: false,
  }),

  actions: {
    async buscarProgramas (search = '') {
      const response = await axios.get(
        apiUrl(`/api/programas/${search ? `?search=${search}` : ''}`),
      )
      this.programas = response.data
    },

    async selecionarPrograma (programa: Programa) {
      this.programaSelecionado = programa
      this.carregando = true
      this.resumo = null

      try {
        const response = await axios.get(
          apiUrl(`/api/programas/${programa.id}/resumo/`),
        )
        this.resumo = {
          total_projetos: Number(response.data.total_projetos),
          horas_estimadas: Number(response.data.horas_estimadas),
          horas_realizadas: Number(response.data.horas_realizadas),
          custo_estimado: Number(response.data.custo_estimado),
          custo_real: Number(response.data.custo_real),
        }
      } finally {
        this.carregando = false
      }
    },

    limpar () {
      this.programaSelecionado = null
      this.resumo = null
    },
  },
})
