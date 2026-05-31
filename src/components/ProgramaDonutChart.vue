<template>
  <div class="donut-section">
    <div class="section-header">
      <div class="section-title">
        <v-icon color="#EAB308" size="16">mdi-chart-donut</v-icon>
        <span>Status dos Projetos</span>
      </div>
    </div>

    <div class="donut-card">
      <div class="donut-card__body">
        <div v-if="store.carregandoDistribuicao" class="donut-card__state">
          <v-progress-circular color="#3B82F6" indeterminate size="40" />
          <span class="donut-card__state-text">Carregando...</span>
        </div>

        <div v-else-if="!store.programaSelecionado" class="donut-card__state">
          <v-icon color="#9CA3AF" size="40">mdi-chart-donut</v-icon>
          <span class="donut-card__state-text">Selecione um programa para visualizar</span>
        </div>

        <div v-else-if="!store.distribuicaoStatus || store.distribuicaoStatus.total === 0" class="donut-card__state">
          <v-icon color="#9CA3AF" size="40">mdi-folder-off-outline</v-icon>
          <span class="donut-card__state-text">Nenhum projeto encontrado para este programa</span>
        </div>

        <div v-else class="donut-card__content">
          <div class="donut-card__chart-wrapper">
            <canvas ref="canvasRef" />

            <div class="donut-card__center">
              <span class="donut-card__total-number">{{ store.distribuicaoStatus.total }}</span>
              <span class="donut-card__total-label">projetos</span>
            </div>
          </div>

          <div class="donut-card__legend">
            <div
              v-for="item in store.distribuicaoStatus.status"
              :key="item.status"
              class="legend-item"
            >
              <span class="legend-dot" :style="{ background: item.cor }" />
              <span class="legend-status">{{ item.status }}</span>

              <span class="legend-values">
                {{ item.quantidade }} <span class="legend-percent">({{ item.percentual }}%)</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div></template>

<script lang="ts" setup>
  import { ArcElement, Chart, DoughnutController, Legend, Tooltip } from 'chart.js'
  import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
  import { useProgramaStore } from '@/stores/programa'

  Chart.register(ArcElement, Tooltip, Legend, DoughnutController)

  const store = useProgramaStore()
  const canvasRef = ref<HTMLCanvasElement | null>(null)
  let chartInstance: Chart | null = null

  function destruirGrafico () {
    if (chartInstance) {
      chartInstance.destroy()
      chartInstance = null
    }
  }

  function renderizarGrafico () {
    destruirGrafico()

    if (!canvasRef.value || !store.distribuicaoStatus || store.distribuicaoStatus.total === 0) return

    const dados = store.distribuicaoStatus.status

    chartInstance = new Chart(canvasRef.value, {
      type: 'doughnut',
      data: {
        labels: dados.map(d => d.status),
        datasets: [
          {
            data: dados.map(d => d.quantidade),
            backgroundColor: dados.map(d => d.cor),
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '65%',
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label (context) {
                const item = dados[context.dataIndex]
                return ` ${item.status}: ${item.quantidade} projeto(s) — ${item.percentual}%`
              },
            },
          },
        },
      },
    })
  }

  onMounted(async () => {
    await nextTick()
    renderizarGrafico()
  })

  watch(
    () => store.distribuicaoStatus,
    async () => {
      await nextTick()
      renderizarGrafico()
    },
    { deep: true },
  )

  onBeforeUnmount(() => {
    destruirGrafico()
  })
</script>

<style scoped>
.donut-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
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

.donut-card {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.2s ease;
  min-width: 250px;
}

.donut-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.donut-card__body {
  flex: 1;
  min-height: 280px;
  display: flex;
  flex-direction: column;
}

.donut-card__state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.donut-card__state-text {
  font-size: 13px;
  color: #9CA3AF;
  text-align: center;
}

.donut-card__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.donut-card__chart-wrapper {
  position: relative;
  width: 160px;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.donut-card__center {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}

.donut-card__total-number {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  line-height: 1;
}

.donut-card__total-label {
  font-size: 11px;
  color: #6B7280;
  margin-top: 2px;
}

.donut-card__legend {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-status {
  flex: 1;
  color: #374151;
}

.legend-values {
  font-weight: 500;
  color: #111827;
}

.legend-percent {
  color: #6B7280;
  font-weight: 400;
}
</style>
