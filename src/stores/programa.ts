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

export type StatusDistribuicao = {
  status: string
  quantidade: number
  percentual: number
  cor: string
}

export type DistribuicaoStatus = {
  total: number
  status: StatusDistribuicao[]
}

export type BurnupHorasPonto = {
  codigo_programa: string
  nome_programa: string
  horas: number
}

export type BurnupHorasGrupo = {
  date_str: string
  values: BurnupHorasPonto[]
}

export type BurnupHorasResponse = BurnupHorasGrupo[]

export type BurnupCustoPonto = {
  codigo_programa: string
  nome_programa: string
  custo: number
}

export type BurnupCustoGrupo = {
  date_str: string
  values: BurnupCustoPonto[]
}

export type BurnupCustoResponse = BurnupCustoGrupo[]

export type TabelaProjeto = {
  nome_projeto: string
  responsavel: string
  status: string
  horas_estimadas: number
  horas_realizadas: number
  percentual_tarefas_concluidas: number
  desvio_horas: number
  percentual_desvio: number
  data_ultima_atividade: string | null
  dias_desde_ultima_atividade: number | null
}

export type TabelaProjetosPaginada = {
  count: number
  page: number
  page_size: number
  total_pages: number
  results: TabelaProjeto[]
}

export const useProgramaStore = defineStore('programa', {
  state: () => ({
    programas: [] as Programa[],
    programaSelecionado: null as Programa | null,
    resumo: null as ResumoProjeto | null,
    distribuicaoStatus: null as DistribuicaoStatus | null,
    burnupHoras: null as BurnupHorasResponse | null,
    burnupCusto: null as BurnupCustoResponse | null,
    carregando: false,
    carregandoDistribuicao: false,
    carregandoBurnup: false,
    carregandoBurnupCusto: false,
    tabelaProjetos: null as TabelaProjetosPaginada | null,
    carregandoTabela: false,
  }),

  getters: {
    tabelaProjetosItens (): TabelaProjeto[] {
      return this.tabelaProjetos?.results ?? []
    },
  },

  actions: {
    async buscarProgramas (search = '') {
      if (search && this.programaSelecionado?.nome_programa === search) {
        return
      }
      const searchQuery = search ? `?search=${search}` : ''
      const response = await axios.get(
        apiUrl(`/api/programas/${searchQuery}`),
      )
      this.programas = response.data
    },

    async selecionarPrograma (programa: Programa | null) {
      this.programaSelecionado = programa
      this.resumo = null
      this.distribuicaoStatus = null
      this.tabelaProjetos = null

      if (!programa) {
        return
      }

      this.carregando = true
      this.carregandoDistribuicao = true

      try {
        const [resumoRes, distribuicaoRes, tabelaRes] = await Promise.all([
          axios.get(apiUrl(`/api/programas/${programa.id}/resumo/`)),
          axios.get(apiUrl(`/api/programas/${programa.id}/distribuicao-status/`)),
          this.buscarTabelaProjetos(programa.id),
        ])

        this.resumo = {
          total_projetos: Number(resumoRes.data.total_projetos),
          horas_estimadas: Number(resumoRes.data.horas_estimadas),
          horas_realizadas: Number(resumoRes.data.horas_realizadas),
          custo_estimado: Number(resumoRes.data.custo_estimado),
          custo_real: Number(resumoRes.data.custo_real),
        }

        this.distribuicaoStatus = {
          total: distribuicaoRes.data.total,
          status: distribuicaoRes.data.status,
        }

        this.tabelaProjetos = tabelaRes
      } finally {
        this.carregando = false
        this.carregandoDistribuicao = false
      }
    },

    async buscarTabelaProjetos (programaId: number, page = 1) {
      this.carregandoTabela = true
      try {
        const response = await axios.get(apiUrl(`/api/programas/${programaId}/tabela-projetos/?page=${page}`))
        this.tabelaProjetos = response.data
        return response.data as TabelaProjetosPaginada
      } finally {
        this.carregandoTabela = false
      }
    },

    async buscarBurnupHoras () {
      this.carregandoBurnup = true
      try {
        const response = await axios.get(apiUrl('/api/programas-burnup-horas/'))
        this.burnupHoras = response.data
      } finally {
        this.carregandoBurnup = false
      }
    },

    async buscarBurnupCusto () {
      this.carregandoBurnupCusto = true
      try {
        const response = await axios.get(apiUrl('/api/programas-burnup-custo/'))
        this.burnupCusto = response.data
      } finally {
        this.carregandoBurnupCusto = false
      }
    },

    limpar () {
      this.programaSelecionado = null
      this.resumo = null
      this.distribuicaoStatus = null
      this.tabelaProjetos = null
    },
  },
})
