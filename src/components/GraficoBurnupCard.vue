<template>
  <div class="burnup-card">
    <div class="card-header">
      <div class="card-icon">
        <v-icon size="16" color="#3B82F6">mdi-chart-line</v-icon>
      </div>
      <span class="card-label">Gráfico de Burnup</span>
    </div>
    
    <div class="chart-container" v-if="chartData && !store.carregandoGrafico">
      <Line :data="chartData" :options="chartOptions" />
    </div>
    
    <div class="loading-state" v-else>
      <v-progress-circular indeterminate color="#3B82F6"></v-progress-circular>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useProjetoStore } from '@/stores/projeto'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const store = useProjetoStore()

const coresPaleta = ['#EF4444', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6']

const chartData = computed(() => {
  if (!store.graficoBurnup) return null

  return {
    labels: store.graficoBurnup.labels,
    datasets: store.graficoBurnup.projetos.map((proj, index) => ({
      label: proj.nome,
      data: proj.valores,
      borderColor: coresPaleta[index % coresPaleta.length],
      backgroundColor: coresPaleta[index % coresPaleta.length],
      tension: 0, 
      borderWidth: 2
    }))
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        usePointStyle: true,
        boxWidth: 8
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      title: { display: true, text: 'Horas Investidas' }
    },
    x: {
      title: { display: true, text: 'Tempo' }
    }
  }
}

onMounted(() => {
  if (!store.graficoBurnup) {
    store.buscarDadosGrafico()
  }
})
</script>

<style scoped>
.burnup-card {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 16px;
  margin: 24px 0;
  height: 380px; 
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.2s ease;
}

.burnup-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.card-icon {
  background: #DBEAFE;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-label {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
}

.chart-container {
  position: relative;
  width: 100%;
  flex: 1;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}
</style>