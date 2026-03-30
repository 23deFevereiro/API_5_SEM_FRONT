import { defineStore } from 'pinia'
import axios from 'axios'
import { apiUrl } from '@/utils/api'

type Projeto = {
  id: number
  codigo_projeto: string
  nome_projeto: string
}

type ResumoProjeto = {
  custo_materiais: number
  custo_compras: number
  tempo_total: number
}

type Material = {
  nome_material: string
  custo_total_estimado: number
  quantidade: number
}

type MateriaisPaginados = {
  count: number
  page: number
  page_size: number
  total_pages: number
  results: Material[]
}

export const useProjetoStore = defineStore('projeto', {
  state: () => ({
    projetos: [] as Projeto[],
    projetoSelecionado: null as Projeto | null,
    resumo: null as ResumoProjeto | null,
    materiais: null as MateriaisPaginados | null,
    carregando: false,
    carregandoMateriais: false,
  }),

  actions: {
    async buscarProjetos(search: string = '') {
      const response = await axios.get(apiUrl(`/projetos/?search=${search}`))
      this.projetos = response.data
    },

    async selecionarProjeto(projeto: Projeto) {
      this.projetoSelecionado = projeto
      this.carregando = true
      this.resumo = null
      this.materiais = null

      try {
        const [resumoRes] = await Promise.all([
          axios.get(apiUrl(`/projetos/${projeto.id}/resumo/`)),
          this.buscarMateriais(projeto.id, 1),
        ])
        this.resumo = resumoRes.data
      } finally {
        this.carregando = false
      }
    },

    async buscarMateriais(projetoId: number, page: number = 1) {
      this.carregandoMateriais = true
      try {
        const response = await axios.get(
          apiUrl(`/projetos/${projetoId}/materiais/?page=${page}`)
        )
        this.materiais = response.data
      } finally {
        this.carregandoMateriais = false
      }
    },

    limpar() {
      this.projetoSelecionado = null
      this.resumo = null
      this.materiais = null
    },
  },
})