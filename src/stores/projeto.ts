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

type CustoTempoChartData = {
  codigo_projeto: string
  nome_projeto: string
  cost: number
}

type CustoTempoChartResponse = { date_str: string, values: CustoTempoChartData[] }[]

export type MaterialDisponivel = {
  id: number
  descricao: string
}

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
    filtroDataInicio: null as string | null,
    filtroDataFim: null as string | null,
    filtroFuncionario: null as string | null,
    filtroMaterial: null as MaterialDisponivel | null,
    nomesFuncionarios: [] as string[],
    materiaisDisponiveis: [] as MaterialDisponivel[],
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

    async buscarOverview (programaId: number | null = null) {
      const qs = programaId ? `?programa_id=${programaId}` : ''
      const response = await axios.get(apiUrl(`/api/projetos-overview${qs}`))
      this.overviewData = response.data
    },
    async buscarProjetos (search = '', programaId: number | null = null) {
      const params = new URLSearchParams()
      if (search) {
        params.set('search', search)
      }
      if (programaId) {
        params.set('programa_id', String(programaId))
      }
      const qs = params.toString()
      const route: string = apiUrl(`/api/projetos/` + (qs ? `?${qs}` : ''))

      const response = await axios.get(route)
      this.projetos = response.data
    },

    async aplicarFiltroPorPrograma (programaId: number | null) {
      await Promise.all([
        this.buscarProjetos('', programaId),
        this.buscarOverview(programaId),
      ])
      if (
        this.projetoSelecionado
        && !this.projetos.some(p => p.id === this.projetoSelecionado!.id)
      ) {
        this.limpar()
      }
    },

    async selecionarProjeto (projeto: Projeto) {
      this.projetoSelecionado = projeto
      // Acordado: per\u00edodo persiste entre projetos; funcion\u00e1rio/material resetam.
      this.filtroFuncionario = null
      this.filtroMaterial = null
      this.carregando = true
      this.resumo = null
      this.materiais = null
      this.horasPorFuncionario = []
      this.funcionarios = null
      this.nomesFuncionarios = []
      this.materiaisDisponiveis = []

      try {
        await Promise.all([
          this.buscarResumo(projeto.id),
          this.buscarMateriais(projeto.id, 1),
          this.buscarHorasPorFuncionario(projeto.id),
          this.buscarFuncionarios(projeto.id, 1),
          this.buscarNomesFuncionarios(projeto.id),
          this.buscarMateriaisDisponiveis(projeto.id),
        ])
      } finally {
        this.carregando = false
      }
    },

    async buscarResumo (projetoId: number) {
      const response = await axios.get(apiUrl(`/api/projetos/${projetoId}/resumo/`))
      this.resumo = {
        custo_total: Number(response.data.custo_total),
        tempo_total: Number(response.data.tempo_total),
      }
    },

    async buscarMateriais (projetoId: number, page = 1) {
      this.carregandoMateriais = true
      try {
        const params = this.paramsComPeriodo()
        params.set('page', String(page))
        if (this.filtroMaterial?.descricao) {
          params.set('material', this.filtroMaterial.descricao)
        }
        const response = await axios.get(
          apiUrl(`/api/projetos/${projetoId}/materiais/?${params.toString()}`),
        )
        this.materiais = response.data
      } finally {
        this.carregandoMateriais = false
      }
    },

    async buscarHorasPorFuncionario (projetoId: number) {
      this.carregandoHoras = true
      try {
        const params = this.paramsComPeriodo()
        if (this.filtroFuncionario) {
          params.set('funcionario', this.filtroFuncionario)
        }
        const qs = params.toString()
        const route = apiUrl(`/api/projetos/${projetoId}/horas-por-funcionario/` + (qs ? '?' + qs : ''))
        const response = await axios.get(route)
        this.horasPorFuncionario = response.data
      } finally {
        this.carregandoHoras = false
      }
    },

    async buscarFuncionarios (projetoId: number, page = 1) {
      this.carregandoFuncionarios = true
      try {
        const params = this.paramsComPeriodo()
        params.set('page', String(page))
        if (this.filtroFuncionario) {
          params.set('funcionario', this.filtroFuncionario)
        }
        const response = await axios.get(
          apiUrl(`/api/projetos/${projetoId}/funcionarios/?${params.toString()}`),
        )
        this.funcionarios = response.data
      } finally {
        this.carregandoFuncionarios = false
      }
    },

    async buscarNomesFuncionarios (projetoId: number) {
      const response = await axios.get(
        apiUrl(`/api/projetos/${projetoId}/nomes-funcionarios/`),
      )
      this.nomesFuncionarios = response.data
    },

    async buscarMateriaisDisponiveis (projetoId: number) {
      const response = await axios.get(
        apiUrl(`/api/projetos/${projetoId}/materiais-disponiveis/`),
      )
      this.materiaisDisponiveis = response.data
    },

    paramsComPeriodo () {
      const params = new URLSearchParams()
      if (this.filtroDataInicio) {
        params.set('data_inicio', this.filtroDataInicio)
      }
      if (this.filtroDataFim) {
        params.set('data_fim', this.filtroDataFim)
      }
      return params
    },

    async aplicarPeriodo (dataInicio: string | null, dataFim: string | null) {
      this.filtroDataInicio = dataInicio
      this.filtroDataFim = dataFim
      const projeto = this.projetoSelecionado
      if (!projeto) {
        return
      }

      await Promise.all([
        this.buscarMateriais(projeto.id, 1),
        this.buscarHorasPorFuncionario(projeto.id),
        this.buscarFuncionarios(projeto.id, 1),
      ])
    },

    async aplicarFiltroFuncionario (funcionario: string | null) {
      this.filtroFuncionario = funcionario
      const projeto = this.projetoSelecionado
      if (!projeto) {
        return
      }

      await Promise.all([
        this.buscarHorasPorFuncionario(projeto.id),
        this.buscarFuncionarios(projeto.id, 1),
      ])
    },

    async aplicarFiltroMaterial (material: MaterialDisponivel | null) {
      this.filtroMaterial = material
      const projeto = this.projetoSelecionado
      if (!projeto) {
        return
      }
      await this.buscarMateriais(projeto.id, 1)
    },

    limpar () {
      this.projetoSelecionado = null
      this.resumo = null
      this.materiais = null
      this.horasPorFuncionario = []
      this.funcionarios = null
      this.filtroFuncionario = null
      this.filtroMaterial = null
      this.nomesFuncionarios = []
      this.materiaisDisponiveis = []
      this.carregandoMateriais = false
      this.carregandoHoras = false
      this.carregandoFuncionarios = false
    },
  },
})
