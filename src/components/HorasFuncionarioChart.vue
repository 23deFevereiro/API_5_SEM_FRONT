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
  import { useBarChart } from '@/composables/useBarChart'
  import { useProjetoStore } from '@/stores/projeto'

  const store = useProjetoStore()

  const { canvasRef } = useBarChart(
    () => store.horasPorFuncionario,
    () => store.horasPorFuncionario.map(d => d.funcionario),
    () => store.horasPorFuncionario.map(d => d.total_horas),
  )
</script>

<style scoped>
.horas-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.chart-wrapper {
  border-radius: 8px;
  border: 1px solid #E5E7EB;
  background: #F9FAFB;
  padding: 8px 16px 20px;
  height: 280px;
}
</style>
