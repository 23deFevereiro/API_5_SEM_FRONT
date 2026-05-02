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
    tabelaProjetos: [] as TabelaProjeto[],
    carregandoTabela: false,
  }),

  actions: {
    async buscarProgramas (search = '') {
      if (search && this.programaSelecionado?.nome_programa === search) {
        return
      }
      const response = await axios.get(
        apiUrl(`/api/programas/${search ? `?search=${search}` : ''}`),
      )
      this.programas = response.data
    },

    async selecionarPrograma (programa: Programa | null) {
      this.programaSelecionado = programa
      this.resumo = null
      this.distribuicaoStatus = null

      if (!programa) {
        return
      }

      this.carregando = true
      this.carregandoDistribuicao = true
      this.carregandoTabela = true

      try {
        const [resumoRes, distribuicaoRes, tabelaRes] = await Promise.all([
          axios.get(apiUrl(`/api/programas/${programa.id}/resumo/`)),
          axios.get(apiUrl(`/api/programas/${programa.id}/distribuicao-status/`)),
          axios.get(apiUrl(`/api/programas/${programa.id}/tabela-projetos/`)),
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

        this.tabelaProjetos = tabelaRes.data
      } finally {
        this.carregando = false
        this.carregandoDistribuicao = false
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
      this.tabelaProjetos = []
    },
  },
})
