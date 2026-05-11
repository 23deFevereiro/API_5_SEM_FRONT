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

export const usePlanejamentoStore = defineStore('planejamento', {
  state: () => ({
    materiais: [] as MaterialCompra[],
    materialSelecionado: null as MaterialCompra | null,
    leadTimeData: [] as LeadTimePonto[],
    alertas: { criticos: [], atencao: [] } as AlertasMateriais,
    criticoMax: 30,
    atencaoMax: 60,
    carregandoMateriais: false,
    carregandoLeadTime: false,
    carregandoAlertas: false,
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

    setCriticoMax (valor: number) {
      this.criticoMax = Math.max(1, valor)
      this.atencaoMax = this.criticoMax + 30
      this.buscarAlertas()
    },

    setAtencaoMax (valor: number) {
      this.atencaoMax = Math.max(this.criticoMax + 1, valor)
      this.buscarAlertas()
    },
  },
})
