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
    
  let chartInstance: Chart<'line', (number | null)[], string> | null = null

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
  
  const labels = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4']

    const datasets = store.burnupHoras.map((projeto, index) => {
      const color = grays[index % grays.length]

      const serieOrdenada = [...(projeto.serie || [])]
        .filter(ponto => ponto.semana && ponto.horas_acumuladas !== undefined)
        .sort((a, b) => a.data.localeCompare(b.data))

      const data: (number | null)[] = [null, null, null, null]

      serieOrdenada.forEach(ponto => {
        const match = ponto.semana.match(/\d+/)
        if (!match) return

        const numeroSemana = Number(match[0])

        if (numeroSemana >= 1 && numeroSemana <= 4) {
          data[numeroSemana - 1] = Number(ponto.horas_acumuladas ?? 0)
        }
      })

    return {
      label: projeto.projeto,
      data,
      borderColor: color,
      backgroundColor: color,
      borderWidth: 2,
      tension: 0,
      pointRadius: 3,
      pointHoverRadius: 5,
      fill: false,
      spanGaps: false,
    }
  })

  chartInstance = new Chart(canvasRef.value, {
    type: 'line',
    data: {
      labels,
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
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
              return items[0]?.label || ''
            },
            label(ctx) {
              const projeto = ctx.dataset.label || ''
              const valor = Number(ctx.parsed.y ?? 0).toFixed(1)
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