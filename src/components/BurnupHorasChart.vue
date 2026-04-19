<template>
  <div class="horas-section">
    <div class="section-header">
      <div class="section-title">
        <v-icon color="#2563EB" size="16">mdi-chart-line</v-icon>
        <span>Burnup de Horas por Projeto</span>
      </div>
    </div>

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

  const todasDatas = Array.from(
    new Set(
      store.burnupHoras.flatMap(projeto =>
        projeto.serie.map(ponto => ponto.data),
      ),
    ),
  ).sort((a, b) => a.localeCompare(b))

  const labels = todasDatas.length > 0
    ? todasDatas
    : ['']

  const datasets = store.burnupHoras.map((projeto, index) => {
    let ultimoAcumulado = 0

    const data = labels.map(data => {
      const ponto = projeto.serie.find(item => item.data === data)

      if (ponto) {
        ultimoAcumulado = ponto.horas_acumuladas
      }

      return ultimoAcumulado
    })

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
      data,
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
          position: 'bottom',
          labels: {
            color: '#374151',
            font: { size: 12 },
            usePointStyle: true,
          },
        },
        tooltip: {
          callbacks: {
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
          title: {
            display: true,
            text: 'Horas Investidas',
            color: '#6B7280',
            font: { size: 12 },
          },
          grid: { color: '#F3F4F6' },
          ticks: {
            color: '#6B7280',
            font: { size: 12 },
            callback: val => `${val}h`,
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
  transition: none;
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

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 340px;
  font-size: 13px;
  color: #9CA3AF;
}

.chart-wrapper {
  height: 340px;
  width: 100%;
}
</style>