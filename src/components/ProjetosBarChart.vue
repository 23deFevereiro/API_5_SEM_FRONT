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
  import { useBarChart } from '@/composables/useBarChart'
  import { useProgramaStore } from '@/stores/programa'

  const store = useProgramaStore()

  const { canvasRef } = useBarChart(
    () => store.horasPorProjeto,
    () => store.horasPorProjeto.map(d => d.nome_projeto),
    () => store.horasPorProjeto.map(d => d.horas_realizadas),
  )
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
  height: 312px;
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
  height: 312px;
}
</style>
