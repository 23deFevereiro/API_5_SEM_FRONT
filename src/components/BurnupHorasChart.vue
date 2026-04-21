<template>
  <div class="horas-section">
    <div v-if="store.carregandoBurnup" class="empty-state">
      <v-progress-circular color="#2563EB" indeterminate size="26" width="2" />
      <span>Carregando burnup...</span>
    </div>

    <div v-else class="chart-wrapper">
      <canvas ref="canvasRef" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import {
    CategoryScale,
    Chart,
    Legend,
    LineController,
    LineElement,
    LinearScale,
    PointElement,
    Tooltip,
  } from 'chart.js'
  import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
  import { useProjetoStore } from '@/stores/projeto'

  Chart.register(
    LineController,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
  )

  const store = useProjetoStore()
  const canvasRef = ref<HTMLCanvasElement | null>(null)
    type BurnupChartPoint = {
      x: string
      y: number
    }
  let chartInstance: Chart<'line', { x: string; y: number }[]> | null = null

  function buildChart() {
  if (!canvasRef.value) return
  if (!store.burnupHoras.length) return

  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  const grays = [
    '#111111',
    '#333333',
    '#555555',
    '#777777',
    '#999999',
    '#BBBBBB',
  ]
  
  const datasets: {
  label: string
  data: BurnupChartPoint[]
  borderColor: string
  backgroundColor: string
  borderWidth: number
  tension: number
  pointRadius: number
  pointHoverRadius: number
  fill: boolean
  spanGaps: boolean
}[] = store.burnupHoras
    .map((projeto, index) => {
      const color = grays[index % grays.length]

      const serieOrdenada = [...(projeto.serie || [])]
      .filter(ponto => ponto.data && ponto.semana)
      .sort((a, b) => a.data.localeCompare(b.data))
      .map(ponto => ({
        x: ponto.semana,
        y: Number(ponto.horas_acumuladas ?? 0),
      }))

      return {
        label: projeto.projeto,
        data: serieOrdenada,
        borderColor: color,
        backgroundColor: color,
        borderWidth: 2,
        tension: 0,
        pointRadius: 2,
        pointHoverRadius: 4,
        fill: false,
        spanGaps: false,
      }
    })

  chartInstance = new Chart(canvasRef.value, {
    type: 'line',
    data: {
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      parsing: false,
      interaction: {
        mode: 'nearest',
        intersect: true,
      },
      plugins: {
        legend: {
          display: false,
          labels: {
            boxWidth: 18,
            boxHeight: 8,
            padding: 12,
          },
        },
        tooltip: {
          enabled: true,
          mode: 'nearest',
          intersect: true,
          callbacks: {
            title(items) {
              const raw = items[0]?.raw as BurnupChartPoint | undefined
              return raw?.x || ''
            },
            label(ctx) {
              const raw = ctx.raw as BurnupChartPoint
              const projeto = ctx.dataset.label || ''
              const valor = Number(raw?.y ?? 0).toFixed(1)
              return `${projeto}: ${valor}h`
            },
                      },
        },
      },
      scales: {
        x: {
          type: 'category',
          title: {
            display: true,
            text: 'Tempo',
            color: '#6B7280',
            font: { size: 12 },
          },
          grid: {
            color: '#F3F4F6',
          },
          ticks: {
            color: '#6B7280',
            font: { size: 12 },
            maxRotation: 0,
            minRotation: 0,
            autoSkip: true,
          },
        },
        y: {
          beginAtZero: true,
          max: 12,
          title: {
            display: true,
            text: 'Horas Investidas',
            color: '#6B7280',
            font: { size: 12 },
          },
          ticks: {
            stepSize: 1,
            callback(value) {
              return `${value}h`
            },
          },
          grid: {
            color: '#F3F4F6',
          },
        },
      },
    },
  })
}

  watch(
    () => store.burnupHoras,
    async () => {
      await nextTick()
      buildChart()
    },
    { deep: true },
  )

  onMounted(() => {
    buildChart()
  })

  onBeforeUnmount(() => {
    if (chartInstance) {
      chartInstance.destroy()
    }
  })
</script>

<style scoped>
.horas-section {
  background: #FFFFFF;
  border: none;
  border-radius: 0;
  margin-top: 0;
  overflow: hidden;
  width: 100%;
  height: 100%;
}

.horas-section:hover {
  box-shadow: none;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 12px 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 260px;
  font-size: 13px;
  color: #9CA3AF;
}

.chart-wrapper {
  height: 300px;
  width: 100%;
}
</style>