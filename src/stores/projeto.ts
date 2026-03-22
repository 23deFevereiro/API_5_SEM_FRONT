import { defineStore } from 'pinia'
import axios from 'axios'
import { apiUrl } from '@/utils/api'

type Projeto = {
  id: number
  codigo_projeto: string
  nome_projeto: string
}

type ResumoProjet = {
  custo_materiais: number
  custo_compras: number
  tempo_total: number
}

export const useProjetoStore = defineStore('projeto', {
  state: () => ({
    projetos: [] as Projeto[],
    projetoSelecionado: null as Projeto | null,
    resumo: null as ResumoProjet | null,
    carregando: false,
  }),

  actions: {
    async buscarProjetos(search: string = '') {
      const response = await axios.get(apiUrl(`/projetos/?search=${search}`))
      this.projetos = response.data
    },

    async selecionarProjeto(projeto: Projeto) {
      this.projetoSelecionado = projeto
      this.carregando = true
      try {
        const response = await axios.get(apiUrl(`/projetos/${projeto.id}/resumo/`))
        this.resumo = response.data
      } finally {
        this.carregando = false
      }
    },
  },
})