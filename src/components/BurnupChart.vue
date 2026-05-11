<template>
  <div class="burnup-section">
    <div class="header">
      <div class="card-icon" :style="{ background: bgHeader }">
        <v-icon :color="corHeader" size="16">{{ iconeHeader }}</v-icon>
      </div>
      <span class="section-title">{{ titulo }}</span>
    </div>

    <div v-if="carregando || dados === null" class="empty-state">
      <v-progress-circular :color="corLoading" indeterminate size="26" width="2" />
      <span>Carregando burnup...</span>
    </div>

    <div v-else-if="dados.length === 0" class="empty-state">
      <v-icon color="#9CA3AF" size="36">{{ iconeVazio }}</v-icon>
      <span>{{ textoVazio }}</span>
    </div>

    <div v-else class="chart-wrapper">
      <div ref="legendRef" class="chart-legend" />
      <canvas ref="canvasRef" />
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
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
  import { nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'

  Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend)

  type Grupo = { date_str: string, values: T[] }

  const props = defineProps<{
    dados: Grupo[] | null
    codigosSelecionados: string[] | null
    extratorChave: (ponto: T) => string
    carregando: boolean
    titulo: string
    iconeHeader: string
    corHeader: string
    bgHeader: string
    corLoading: string
    iconeVazio: string
    textoVazio: string
    tituloEixoY: string
    extratorValor: (ponto: T) => number
    formatarValor: (valor: number) => string
    aoMontar?: () => Promise<void>
  }>()

  const COR_NEUTRA = '#9CA3AF'
  const COR_REALCE = '#2563EB'
  const COR_REALCE_HOVER = '#1D4ED8'

  const canvasRef = ref<HTMLCanvasElement | null>(null)
  const legendRef = ref<HTMLDivElement | null>(null)
  const chartInstance = shallowRef<Chart | null>(null)

  function destruirGrafico () {
    if (chartInstance.value) {
      chartInstance.value.destroy()
      chartInstance.value = null
    }
    if (legendRef.value) legendRef.value.innerHTML = ''
  }

  function buildLegend () {
    if (!legendRef.value || !chartInstance.value) return
    legendRef.value.innerHTML = ''
    legendRef.value.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px 16px;padding:8px 0 4px;'

    for (const ds of chartInstance.value.data.datasets) {
      const item = document.createElement('div')
      item.style.cssText = 'display:flex;align-items:center;gap:6px;font-size:12px;color:#374151;font-family:inherit;'

      const box = document.createElement('span')
      box.style.cssText = `display:inline-block;width:20px;height:8px;border-radius:2px;flex-shrink:0;background:${ds.borderColor as string};`

      const label = document.createElement('span')
      label.textContent = ds.label ?? ''

      item.append(box)
      item.append(label)
      legendRef.value.append(item)
    }
  }

  function buildChart (raw: Grupo[]) {
    if (!canvasRef.value) return
    destruirGrafico()

    const labels = raw.map(item => item.date_str)
    const programas: Record<string, { label: string, data: (number | null)[], spanGaps: boolean }> = {}

    for (const [monthIndex, month] of raw.entries()) {
      for (const v of month.values) {
        const chave = props.extratorChave(v)
        if (!programas[chave]) {
          programas[chave] = {
            label: chave,
            data: Array.from({ length: raw.length }).fill(null) as (number | null)[],
            spanGaps: true,
          }
        }
        programas[chave].data[monthIndex] = props.extratorValor(v)
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
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.dataset.label}: ${props.formatarValor(Number(ctx.parsed.y ?? 0))}`,
            },
          },
        },
        scales: {
          x: { title: { display: true, text: 'Mês' } },
          y: {
            beginAtZero: true,
            title: { display: true, text: props.tituloEixoY },
            ticks: { callback: val => props.formatarValor(Number(val)) },
          },
        },
      },
    })

    aplicarRealce()
    buildLegend()
  }

  function aplicarRealce () {
    if (!chartInstance.value) return
    const selecionados = props.codigosSelecionados
    const temSelecao = !!selecionados && selecionados.length > 0
    for (const dataset of chartInstance.value.data.datasets) {
      const realcado = temSelecao && selecionados!.includes(dataset.label as string)
      dataset.borderColor = realcado ? COR_REALCE : COR_NEUTRA
      dataset.backgroundColor = realcado ? COR_REALCE : COR_NEUTRA
      dataset.borderWidth = realcado ? 3 : 1
      ;(dataset as { hoverBackgroundColor?: string }).hoverBackgroundColor = realcado ? COR_REALCE_HOVER : COR_NEUTRA
    }
    chartInstance.value.update()
    buildLegend()
  }

  watch(() => props.dados, async novo => {
    if (!novo || novo.length === 0) {
      destruirGrafico()
      return
    }
    await nextTick()
    buildChart(novo)
  })

  watch(() => props.codigosSelecionados, () => {
    aplicarRealce()
  })

  onMounted(async () => {
    if (props.dados === null) {
      if (props.aoMontar) await props.aoMontar()
      return
    }
    if (props.dados.length > 0) {
      await nextTick()
      buildChart(props.dados)
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

.header {
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
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chart-wrapper canvas {
  display: block;
  height: 300px !important;
  width: 100%;
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin: 0 24px;
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
  background: none;
  border: none;
  border-radius: 0;
}
</style>
