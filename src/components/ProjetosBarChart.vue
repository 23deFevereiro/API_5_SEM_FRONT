<template>
  <div class="projetos-bar-section">
    <div class="section-header">
      <div class="section-title">
        <v-icon color="#2563EB" size="16">mdi-chart-bar</v-icon>
        <span>Horas por Projeto</span>
      </div>
    </div>

    <div v-if="!store.programaSelecionado" class="empty-state">
      <v-icon color="#9CA3AF" size="36">mdi-folder-clock-outline</v-icon>
      <span>Selecione um programa para ver as horas por projeto</span>
    </div>

    <div v-else-if="store.carregandoHorasProjeto" class="empty-state">
      <v-progress-circular color="#2563EB" indeterminate size="26" width="2" />
      <span>Carregando projetos...</span>
    </div>

    <div v-else-if="store.horasPorProjeto.length === 0" class="empty-state">
      <v-icon color="#9CA3AF" size="36">mdi-chart-bar-stacked</v-icon>
      <span>Nenhum projeto encontrado para este programa</span>
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
  import { useProgramaStore } from '@/stores/programa'

  Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

  const store = useProgramaStore()
  const canvasRef = ref<HTMLCanvasElement | null>(null)
  let chartInstance: Chart | null = null

  function buildChart () {
    if (!canvasRef.value) return

    if (chartInstance) {
      chartInstance.destroy()
      chartInstance = null
    }

    const labels = store.horasPorProjeto.map(d => d.nome_projeto)
    const data = store.horasPorProjeto.map(d => d.horas_realizadas)

    chartInstance = new Chart(canvasRef.value, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Horas realizadas',
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
              maxRotation: 30,
              minRotation: 0,
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
    () => store.horasPorProjeto,
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
    if (store.horasPorProjeto.length > 0) {
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
.projetos-bar-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.section-header {
  display: flex;
  align-items: center;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 280px;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
  background: #F9FAFB;
  color: #9CA3AF;
  font-size: 13px;
  text-align: center;
  padding: 16px;
}

.chart-wrapper {
  border-radius: 8px;
  border: 1px solid #E5E7EB;
  background: #F9FAFB;
  padding: 8px 16px 20px;
  height: 280px;
}
</style>
