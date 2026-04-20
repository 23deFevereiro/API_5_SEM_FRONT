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
  let chartInstance: Chart | null = null

  function buildChart () {
  if (!canvasRef.value) return
  if (!store.burnupHoras.length) return

  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  const labels = Array.from(
    new Set(
      store.burnupHoras.flatMap(projeto =>
        projeto.serie.map(ponto => ponto.data),
      ),
    ),
  ).sort((a, b) => a.localeCompare(b))

  const datasets = store.burnupHoras.map((projeto, index) => {
    const grays = [
      '#111111',
      '#333333',
      '#555555',
      '#777777',
      '#999999',
      '#BBBBBB',
    ]

    const color = grays[index % grays.length]

    let ultimoAcumulado = 0

    const data = labels.map(dataLabel => {
      const ponto = projeto.serie.find(ponto => ponto.data === dataLabel)

      if (ponto) {
        ultimoAcumulado = ponto.horas_acumuladas
      }

      return ultimoAcumulado
    })

    return {
      label: projeto.projeto,
      data,
      borderColor: color,
      backgroundColor: color,
      borderWidth: 2,
      tension: 0.3,
      pointRadius: 0,
      pointHoverRadius: 0,
      fill: false,
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
        intersect: false,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true,
          callbacks: {
            title: items => items[0]?.label || '',
            label: ctx => `${ctx.dataset.label}: ${Number(ctx.parsed.y).toFixed(1)}h`,
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Tempo',
            color: '#6B7280',
            font: { size: 12 },
          },
          grid: { color: '#F3F4F6' },
          ticks: {
            color: '#6B7280',
            font: { size: 12 },
          },
        },
        y: {
          beginAtZero: true,
          max: 8,
          ticks: {
            stepSize: 1,
            callback: value => `${value}h`,
          },
          title: {
            display: true,
            text: 'Horas Investidas',
            color: '#6B7280',
            font: { size: 12 },
          },
          grid: { color: '#F3F4F6' },
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
  height: 280px;
  width: 100%;
}
</style>