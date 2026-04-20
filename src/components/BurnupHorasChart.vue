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

  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  const labels = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4']

  const datasets = store.burnupHoras.map((projeto, index) => {
    const colors = [
      '#2563EB',
      '#10B981',
      '#F59E0B',
      '#EF4444',
      '#8B5CF6',
      '#06B6D4',
    ]

    const color = colors[index % colors.length]

    return {
      label: projeto.projeto,
      data: [],
      borderColor: color,
      backgroundColor: color,
      borderWidth: 2,
      tension: 0.3,
      pointRadius: 4,
      pointHoverRadius: 6,
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
      plugins: {
        legend: {
          display: datasets.length > 0,
          position: 'right',
          labels: {
            color: '#374151',
            font: { size: 12 },
            usePointStyle: true,
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
  height: 380px;
  width: 100%;
}
</style>