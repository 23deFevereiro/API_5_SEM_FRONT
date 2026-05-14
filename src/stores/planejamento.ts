import axios from 'axios'
import { defineStore } from 'pinia'
import { apiUrl } from '@/utils/api'

export type MaterialCompra = {
  id: number
  codigo_material: string
  descricao: string
}

export type LeadTimePonto = {
  fornecedor: string
  lead_time: number
  valor_unidade: number
  valor_total: number
  status: string
  categoria_status: string
  data_pedido: string
}

export type EstoqueItem = {
  material: string
  projeto: string
  estoque_atual: number
  consumo_previsto: number
  dias_ate_acabar: number
  status: 'Urgente' | 'Atenção' | 'Ok'
}

export type TabelaEstoque = {
  count: number
  page: number
  page_size: number
  total_pages: number
  results: EstoqueItem[]
}

export type AlertaMaterial = {
  material: string
  dias_para_pedir: number
  lead_time_min: number
  fornecedor: string
  dias_cobertura: number
}

export type AlertasMateriais = {
  criticos: AlertaMaterial[]
  atencao: AlertaMaterial[]
}

interface PlanejamentoState {
  materiais: MaterialCompra[]
  materialSelecionado: MaterialCompra | null
  leadTimeData: LeadTimePonto[]
  alertas: AlertasMateriais
  tabelaEstoque: TabelaEstoque
  tabelaSortBy: string
  tabelaSortDir: 'asc' | 'desc'
  criticoMax: number
  atencaoMax: number
  carregandoMateriais: boolean
  carregandoLeadTime: boolean
  carregandoAlertas: boolean
  carregandoTabela: boolean
}

export const usePlanejamentoStore = defineStore('planejamento', {
  state: (): PlanejamentoState => ({
    materiais: [],
    materialSelecionado: null,
    leadTimeData: [],
    alertas: { criticos: [], atencao: [] },
    tabelaEstoque: { count: 0, page: 1, page_size: 5, total_pages: 0, results: [] },
    tabelaSortBy: 'status',
    tabelaSortDir: 'asc',
    criticoMax: 30,
    atencaoMax: 60,
    carregandoMateriais: false,
    carregandoLeadTime: false,
    carregandoAlertas: false,
    carregandoTabela: false,
  }),

  actions: {
    async buscarMateriais () {
      if (this.materiais.length > 0) return
      this.carregandoMateriais = true
      try {
        const response = await axios.get(apiUrl('/api/compras/materiais/'))
        this.materiais = response.data
      } finally {
        this.carregandoMateriais = false
      }
    },

    async selecionarMaterial (material: MaterialCompra | null) {
      this.materialSelecionado = material
      this.leadTimeData = []
      if (!material) return
      this.carregandoLeadTime = true
      try {
        const response = await axios.get(apiUrl(`/api/compras/lead-time/?material_id=${material.id}`))
        this.leadTimeData = response.data
      } finally {
        this.carregandoLeadTime = false
      }
    },

    limpar () {
      this.materialSelecionado = null
      this.leadTimeData = []
    },

    async buscarAlertas () {
      this.carregandoAlertas = true
      try {
        const response = await axios.get(apiUrl('/api/compras/alertas/'), {
          params: { critico_max: this.criticoMax, atencao_max: this.atencaoMax },
        })
        this.alertas = response.data
      } finally {
        this.carregandoAlertas = false
      }
    },

    async buscarTabelaEstoque (page: number = 1) {
      this.carregandoTabela = true
      try {
        const params: Record<string, string | number> = {
          critico_max: this.criticoMax,
          atencao_max: this.atencaoMax,
          page,
          sort_by: this.tabelaSortBy,
          sort_dir: this.tabelaSortDir,
        }
        if (this.materialSelecionado) {
          params.material_id = this.materialSelecionado.id
        }
        const response = await axios.get(apiUrl('/api/compras/estoque-tabela/'), { params })
        this.tabelaEstoque = response.data
      } finally {
        this.carregandoTabela = false
      }
    },

    setCriticoMax (valor: number) {
      this.criticoMax = Math.max(1, valor)
      this.atencaoMax = this.criticoMax + 30
      this.buscarAlertas()
      this.buscarTabelaEstoque(1)
    },

    setAtencaoMax (valor: number) {
      this.atencaoMax = Math.max(this.criticoMax + 1, valor)
      this.buscarAlertas()
      this.buscarTabelaEstoque(1)
    },
  },
})
