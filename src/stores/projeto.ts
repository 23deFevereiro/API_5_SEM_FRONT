import axios from 'axios'
import { defineStore } from 'pinia'
import { apiUrl } from '@/utils/api'

type Projeto = {
  id: number
  codigo_projeto: string
  nome_projeto: string
}

type ResumoProjeto = {
  custo_total: number
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

type CustoTempoChartData = {
  codigo_projeto: string
  nome_projeto: string
  cost: number
}

type CustoTempoChartResponse = { date_str: string, values: CustoTempoChartData[] }[]

export const useProjetoStore = defineStore('projeto', {
  state: () => ({
    overviewData: null as CustoTempoChartResponse | null,
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

  getters: {
    isLoading (): boolean {
      return this.carregando || this.carregandoMateriais || this.carregandoHoras || this.carregandoFuncionarios
    },
  },

  actions: {
    init () {
      this.buscarOverview()
    },

    async buscarOverview () {
      const response = await axios.get(apiUrl(`/api/projetos-overview`))
      this.overviewData = response.data
    },
    async buscarProjetos (search = '') {
      const route: string = apiUrl(`/api/projetos`
        + (search ? `?search=${search}` : ''))

      const response = await axios.get(route)
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
          axios.get(apiUrl(`/api/projetos/${projeto.id}/resumo/`)),
          this.buscarMateriais(projeto.id, 1),
          this.buscarHorasPorFuncionario(projeto.id),
          this.buscarFuncionarios(projeto.id, 1),
        ])
        this.resumo = {
          custo_total: Number(resumoRes.data.custo_total),
        }
      } finally {
        this.carregando = false
      }
    },

    async buscarMateriais (projetoId: number, page = 1) {
      this.carregandoMateriais = true
      try {
        const response = await axios.get(
          apiUrl(`/api/projetos/${projetoId}/materiais?page=${page}`),
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
          apiUrl(`/api/projetos/${projetoId}/horas-por-funcionario/`),
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
          apiUrl(`/api/projetos/${projetoId}/funcionarios/?page=${page}`),
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
