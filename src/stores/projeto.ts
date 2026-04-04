import axios from 'axios'
import { defineStore } from 'pinia'
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

type HorasFuncionario = {
  funcionario: string
  total_horas: number
}

type Funcionario = {
  usuario: string
  total_horas: number
  projetos: string[]
}

type FuncionariosPaginados = {
  count: number
  page: number
  page_size: number
  total_pages: number
  results: Funcionario[]
}

export const useProjetoStore = defineStore('projeto', {
  state: () => ({
    projetos: [] as Projeto[],
    projetoSelecionado: null as Projeto | null,
    resumo: null as ResumoProjeto | null,
    materiais: null as MateriaisPaginados | null,
    horasPorFuncionario: [] as HorasFuncionario[],
    carregando: false,
    carregandoMateriais: false,
    carregandoHoras: false,
    funcionarios: null as FuncionariosPaginados | null,
    carregandoFuncionarios: false,
  }),

  actions: {
    async buscarProjetos (search = '') {
      const response = await axios.get(apiUrl(`/projetos/?search=${search}`))
      this.projetos = response.data
    },

    async selecionarProjeto (projeto: Projeto) {
      this.projetoSelecionado = projeto
      this.carregando = true
      this.resumo = null
      this.materiais = null
      this.horasPorFuncionario = []
      this.funcionarios = null

      try {
        const [resumoRes] = await Promise.all([
          axios.get(apiUrl(`/projetos/${projeto.id}/resumo/`)),
          this.buscarMateriais(projeto.id, 1),
          this.buscarHorasPorFuncionario(projeto.id),
          this.buscarFuncionarios(projeto.id, 1),
        ])
        this.resumo = resumoRes.data
      } finally {
        this.carregando = false
      }
    },

    async buscarMateriais (projetoId: number, page = 1) {
      this.carregandoMateriais = true
      try {
        const response = await axios.get(
          apiUrl(`/projetos/${projetoId}/materiais/?page=${page}`),
        )
        this.materiais = response.data
      } finally {
        this.carregandoMateriais = false
      }
    },

    async buscarHorasPorFuncionario (projetoId: number) {
      this.carregandoHoras = true
      try {
        const response = await axios.get(
          apiUrl(`/projetos/${projetoId}/horas-por-funcionario/`),
        )
        this.horasPorFuncionario = response.data
      } finally {
        this.carregandoHoras = false
      }
    },

    async buscarFuncionarios (projetoId: number, page = 1) {
      this.carregandoFuncionarios = true
      try {
        const response = await axios.get(
          apiUrl(`/projetos/${projetoId}/funcionarios/?page=${page}`),
        )
        this.funcionarios = response.data
      } finally {
        this.carregandoFuncionarios = false
      }
    },

    limpar () {
      this.projetoSelecionado = null
      this.resumo = null
      this.materiais = null
      this.funcionarios = null
    },
  },
})
