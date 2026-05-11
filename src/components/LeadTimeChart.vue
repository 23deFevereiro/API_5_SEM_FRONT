<template>
  <div class="lead-time-section">
    <div class="section-header">
      <div class="section-title">
        <v-icon color="#2563EB" size="16">mdi-chart-scatter-plot</v-icon>
        <span>Lead Time por Fornecedor</span>
      </div>
      <div class="legend">
        <span class="legend-item legend-item--green">Entregue</span>
        <span class="legend-item legend-item--yellow">Aberto</span>
        <span class="legend-item legend-item--red">Cancelado</span>
      </div>
    </div>

    <div v-if="!store.materialSelecionado" class="empty-state">
      <v-icon color="#9CA3AF" size="36">mdi-package-variant-outline</v-icon>
      <span>Selecione um material para visualizar o lead time</span>
    </div>

    <div v-else-if="store.carregandoLeadTime" class="empty-state">
      <v-progress-circular color="#2563EB" indeterminate size="26" width="2" />
      <span>Carregando dados...</span>
    </div>

    <div v-else-if="store.leadTimeData.length === 0" class="empty-state">
      <v-icon color="#9CA3AF" size="36">mdi-chart-scatter-plot-hexbin</v-icon>
      <span>Nenhum dado de lead time encontrado para este material</span>
    </div>

    <div v-else class="chart-wrapper">
      <canvas ref="canvasRef" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import {
    Chart,
    Legend,
    LinearScale,
    PointElement,
    ScatterController,
    Tooltip,
  } from 'chart.js'
  import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
  import { type LeadTimePonto, usePlanejamentoStore } from '@/stores/planejamento'

  Chart.register(ScatterController, PointElement, LinearScale, Tooltip, Legend)

  const store = usePlanejamentoStore()
  const canvasRef = ref<HTMLCanvasElement | null>(null)
  let chartInstance: Chart | null = null

  const STATUS_CORES = {
    Cancelado: { bg: 'rgba(239, 68, 68, 0.75)', border: '#DC2626', label: 'Cancelado' },
    Concluído: { bg: 'rgba(34, 197, 94, 0.75)', border: '#16A34A', label: 'Entregue' },
    Pendente: { bg: 'rgba(234, 179, 8, 0.75)', border: '#CA8A04', label: 'Aberto' },
  }

  type PontoScatter = { x: number, y: number, raw: LeadTimePonto }

  function buildDatasets () {
    const grupos: Record<string, PontoScatter[]> = {
      Cancelado: [],
      Concluído: [],
      Pendente: [],
    }

    for (const p of store.leadTimeData) {
      const chave = p.categoria_status in grupos ? p.categoria_status : 'Pendente'
      grupos[chave].push({ x: p.valor_unidade, y: p.lead_time, raw: p })
    }

    return Object.entries(STATUS_CORES).map(([categoria, cor]) => ({
      label: cor.label,
      data: grupos[categoria],
      backgroundColor: cor.bg,
      borderColor: cor.border,
      borderWidth: 1.5,
      pointRadius: 7,
      pointHoverRadius: 10,
    }))
  }

  function build () {
    if (!canvasRef.value) return
    if (chartInstance) {
      chartInstance.destroy()
      chartInstance = null
    }

    const maxLeadTime = Math.max(0, ...store.leadTimeData.map(p => p.lead_time))

    chartInstance = new Chart(canvasRef.value, {
      type: 'scatter',
      data: { datasets: buildDatasets() },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label (ctx) {
                const p = (ctx.raw as PontoScatter).raw
                const valorUn = p.valor_unidade.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })
                const valorTotal = p.valor_total.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })
                const data = new Date(p.data_pedido + 'T00:00:00').toLocaleDateString('pt-BR')
                return [
                  `Fornecedor: ${p.fornecedor}`,
                  `Lead Time: ${p.lead_time} dias`,
                  `Valor/un: ${valorUn}`,
                  `Valor total: ${valorTotal}`,
                  `Status: ${p.status}`,
                  `Data do pedido: ${data}`,
                ]
              },
            },
          },
        },
        scales: {
          x: {
            title: { display: true, text: 'Valor por Unidade (R$)', color: '#6B7280', font: { size: 12 } },
            ticks: {
              color: '#6B7280',
              callback (val) {
                return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
              },
            },
            grid: { color: '#F3F4F6' },
          },
          y: {
            min: 0,
            max: maxLeadTime + 5,
            title: { display: true, text: 'Lead Time (dias)', color: '#6B7280', font: { size: 12 } },
            ticks: {
              color: '#6B7280',
              callback (val) {
                return `${val}d`
              },
            },
            grid: { color: '#F3F4F6' },
          },
        },
      },
    })
  }

  onMounted(() => build())
  onBeforeUnmount(() => {
    chartInstance?.destroy()
  })
  watch(() => store.leadTimeData, async () => {
    await nextTick()
    build()
  })
</script>

<style scoped>
.lead-time-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.legend {
  display: flex;
  align-items: center;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #374151;
}

.legend-item::before {
  content: '';
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-item--green::before { background: rgba(34, 197, 94, 0.75); border: 1.5px solid #16A34A; }
.legend-item--yellow::before { background: rgba(234, 179, 8, 0.75); border: 1.5px solid #CA8A04; }
.legend-item--red::before { background: rgba(239, 68, 68, 0.75); border: 1.5px solid #DC2626; }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  gap: 12px;
  color: #9CA3AF;
  font-size: 14px;
}

.chart-wrapper {
  border-radius: 8px;
  border: 1px solid #E5E7EB;
  background: #F9FAFB;
  padding: 8px 16px 20px;
  height: 380px;
}
</style>
