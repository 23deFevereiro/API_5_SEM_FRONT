<template>
  <div class="horas-section">
    <div class="section-header">
      <div class="section-title">
        <v-icon size="16" color="#2563EB">mdi-chart-bar</v-icon>
        <span>Horas por Funcionário</span>
      </div>
    </div>

    <div v-if="!store.projetoSelecionado" class="empty-state">
      <v-icon size="36" color="#9CA3AF">mdi-account-clock-outline</v-icon>
      <span>Selecione um projeto para ver as horas por funcionário</span>
    </div>

    <div v-else-if="store.carregandoHoras" class="empty-state">
      <v-progress-circular indeterminate color="#2563EB" size="26" width="2" />
      <span>Carregando horas...</span>
    </div>

    <div v-else-if="store.horasPorFuncionario.length === 0" class="empty-state">
      <v-icon size="36" color="#9CA3AF">mdi-chart-bar-stacked</v-icon>
      <span>Nenhum registro de horas encontrado para este projeto</span>
    </div>

    <div v-else class="chart-wrapper">
      <canvas ref="canvasRef" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useProjetoStore } from '@/stores/projeto'
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js'

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const store = useProjetoStore()
const canvasRef = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

function buildChart() {
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
            label: ctx => ` ${ctx.parsed.y.toFixed(1)}h`,
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
  async (novoValor) => {
    if (novoValor.length > 0) {
      await nextTick()
      buildChart()
    } else if (chartInstance) {
      chartInstance.destroy()
      chartInstance = null
    }
  }
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
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  margin-top: 24px;
  overflow: hidden;
  transition: box-shadow 0.2s ease;
}

.horas-section:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 12px;
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
  padding: 40px 16px;
  font-size: 13px;
  color: #9CA3AF;
}

.chart-wrapper {
  padding: 8px 16px 20px;
  height: 280px;
}
</style>