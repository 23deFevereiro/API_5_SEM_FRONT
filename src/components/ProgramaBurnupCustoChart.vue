<template>
  <div class="burnup-section">
    <div class="section-header">
      <div class="card-icon" style="background: #D1FAE5;">
        <v-icon color="#10B981" size="16">mdi-currency-usd</v-icon>
      </div>
      <span class="section-title">Burnup de Custo por Programa</span>
    </div>

    <div v-if="carregandoBurnupCusto || burnupCusto === null" class="empty-state">
      <v-progress-circular color="#10B981" indeterminate size="26" width="2" />
      <span>Carregando burnup...</span>
    </div>

    <div v-else-if="burnupCusto.length === 0" class="empty-state">
      <v-icon color="#9CA3AF" size="36">mdi-currency-usd-off</v-icon>
      <span>Nenhum registro de custo encontrado</span>
    </div>

    <div v-else class="chart-wrapper">
      <canvas ref="canvasRef" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    CategoryScale,
    Chart,
    Legend,
    LinearScale,
    LineController,
    LineElement,
    PointElement,
    Tooltip,
  } from 'chart.js'
  import { storeToRefs } from 'pinia'
  import { nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
  import { type BurnupCustoResponse, useProgramaStore } from '@/stores/programa'

  Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend)

  const COR_NEUTRA = '#9CA3AF'
  const COR_REALCE = '#2563EB'
  const COR_REALCE_HOVER = '#1D4ED8'

  const store = useProgramaStore()
  const { burnupCusto, programaSelecionado, carregandoBurnupCusto } = storeToRefs(store)

  const canvasRef = ref<HTMLCanvasElement | null>(null)
  const chartInstance = shallowRef<Chart | null>(null)

  function formatarMoeda (valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  function destruirGrafico () {
    if (chartInstance.value) {
      chartInstance.value.destroy()
      chartInstance.value = null
    }
  }

  function buildChart (raw: BurnupCustoResponse) {
    if (!canvasRef.value) return
    destruirGrafico()

    const labels = raw.map(item => item.date_str)
    const programas: Record<string, { label: string, nome: string, data: (number | null)[], spanGaps: boolean }> = {}

    for (const [monthIndex, month] of raw.entries()) {
      for (const v of month.values) {
        if (!programas[v.codigo_programa]) {
          programas[v.codigo_programa] = {
            label: v.codigo_programa,
            nome: v.nome_programa,
            data: Array.from({ length: raw.length }).fill(null) as (number | null)[],
            spanGaps: true,
          }
        }
        programas[v.codigo_programa].data[monthIndex] = v.custo
      }
    }

    const datasets = Object.values(programas).map(p => ({
      label: p.label,
      data: p.data,
      spanGaps: p.spanGaps,
      borderColor: COR_NEUTRA,
      backgroundColor: COR_NEUTRA,
      pointRadius: 3,
      tension: 0.2,
    }))

    chartInstance.value = new Chart(canvasRef.value, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.dataset.label}: ${formatarMoeda(Number(ctx.parsed.y ?? 0))}`,
            },
          },
        },
        scales: {
          x: { title: { display: true, text: 'Mês' } },
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Custo acumulado (R$)' },
            ticks: { callback: val => formatarMoeda(Number(val)) },
          },
        },
      },
    })

    aplicarRealce()
  }

  function aplicarRealce () {
    if (!chartInstance.value) return
    const codigoSelecionado = programaSelecionado.value?.codigo_programa
    for (const dataset of chartInstance.value.data.datasets) {
      const realcado = !!codigoSelecionado && dataset.label === codigoSelecionado
      dataset.borderColor = realcado ? COR_REALCE : COR_NEUTRA
      dataset.backgroundColor = realcado ? COR_REALCE : COR_NEUTRA
      dataset.borderWidth = realcado ? 3 : 1
      ;(dataset as { hoverBackgroundColor?: string }).hoverBackgroundColor = realcado ? COR_REALCE_HOVER : COR_NEUTRA
    }
    chartInstance.value.update()
  }

  watch(burnupCusto, async novo => {
    if (!novo || novo.length === 0) {
      destruirGrafico()
      return
    }
    await nextTick()
    buildChart(novo)
  })

  watch(programaSelecionado, () => {
    aplicarRealce()
  })

  onMounted(async () => {
    if (store.burnupCusto === null) {
      await store.buscarBurnupCusto()
      return
    }
    if (store.burnupCusto.length > 0) {
      await nextTick()
      buildChart(store.burnupCusto)
    }
  })

  onBeforeUnmount(() => {
    destruirGrafico()
  })
</script>

<style scoped>
.burnup-section {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  border-bottom: 1px solid #E5E7EB;
}

.card-icon {
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.chart-wrapper {
  padding: 12px 16px 20px;
  height: 320px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 48px 16px;
  font-size: 13px;
  color: #9CA3AF;
}
</style>
