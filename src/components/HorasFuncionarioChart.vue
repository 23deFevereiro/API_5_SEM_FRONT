<template>
  <div class="horas-section">
    <div class="section-header">
      <div class="section-title">
        <v-icon color="#2563EB" size="16">mdi-chart-bar</v-icon>
        <span>Horas por Funcionário</span>
      </div>
    </div>

    <div v-if="!store.projetoSelecionado" class="empty-state">
      <v-icon color="#9CA3AF" size="36">mdi-account-clock-outline</v-icon>
      <span>Selecione um projeto para ver as horas por funcionário</span>
    </div>

    <div v-else-if="store.carregandoHoras" class="empty-state">
      <v-progress-circular color="#2563EB" indeterminate size="26" width="2" />
      <span>Carregando horas...</span>
    </div>

    <div v-else-if="store.horasPorFuncionario.length === 0" class="empty-state">
      <v-icon color="#9CA3AF" size="36">mdi-chart-bar-stacked</v-icon>
      <span>Nenhum registro de horas encontrado para este projeto</span>
    </div>

    <div v-else class="chart-wrapper">
      <canvas ref="canvasRef" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import {
    BarController,
    BarElement,
    CategoryScale,
    Chart,
    Legend,
    LinearScale,
    Tooltip,
  } from 'chart.js'
  import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
  import { useProjetoStore } from '@/stores/projeto'

  Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

  const store = useProjetoStore()
  const canvasRef = ref<HTMLCanvasElement | null>(null)
  let chartInstance: Chart | null = null

  function buildChart () {
    if (!canvasRef.value) return

    if (chartInstance) {
      chartInstance.destroy()
      chartInstance = null
    }

    const labels = store.horasPorFuncionario.map(d => d.funcionario)
    const data = store.horasPorFuncionario.map(d => d.total_horas)

    chartInstance = new Chart(canvasRef.value, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Horas dedicadas',
            data,
            backgroundColor: '#2563EB',
            borderRadius: 6,
            borderSkipped: false,
            hoverBackgroundColor: '#1D4ED8',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.parsed.y?.toFixed(1)}h`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: '#6B7280',
              font: { size: 12 },
            },
          },
          y: {
            beginAtZero: true,
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
    () => store.horasPorFuncionario,
    async novoValor => {
      if (novoValor.length > 0) {
        await nextTick()
        buildChart()
      } else if (chartInstance) {
        chartInstance.destroy()
        chartInstance = null
      }
    },
  )

  onMounted(() => {
    if (store.horasPorFuncionario.length > 0) {
      buildChart()
    }
  })

  onBeforeUnmount(() => {
    if (chartInstance) {
      chartInstance.destroy()
    }
  })
</script>

<style scoped>
.horas-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.chart-wrapper {
  border-radius: 8px;
  border: 1px solid #E5E7EB;
  background: #F9FAFB;
  padding: 8px 16px 20px;
  height: 280px;
}
</style>
