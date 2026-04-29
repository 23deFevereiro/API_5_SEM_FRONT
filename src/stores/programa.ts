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

      if (!programa) return

      this.carregando = true
      this.carregandoDistribuicao = true

      try {
        const [resumoRes, distribuicaoRes] = await Promise.all([
          axios.get(apiUrl(`/api/programas/${programa.id}/resumo/`)),
          axios.get(apiUrl(`/api/programas/${programa.id}/distribuicao-status/`)),
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
      } finally {
        this.carregando = false
        this.carregandoDistribuicao = false
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
    },
  },
})