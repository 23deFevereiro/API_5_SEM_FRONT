<template>
  <div class="programa-cards">
    <div class="programa-card">
      <div class="card-header">
        <div class="card-icon" style="background: #DBEAFE;">
          <v-icon color="#3B82F6" size="16">mdi-currency-usd</v-icon>
        </div>
        <span class="card-label">Custos do Programa</span>
      </div>
      <div class="card-row">
        <span class="card-sublabel">Estimado</span>
        <span class="card-value" :class="{ 'card-value--empty': !store.resumo }">
          {{ store.resumo ? formatarMoeda(store.resumo.custo_estimado) : '--' }}
        </span>
      </div>
      <div class="card-row">
        <span class="card-sublabel">Realizado</span>
        <span class="card-value" :class="{ 'card-value--empty': !store.resumo }">
          {{ store.resumo ? formatarMoeda(store.resumo.custo_real) : '--' }}
        </span>
      </div>
    </div>

    <div class="programa-card">
      <div class="card-header">
        <div class="card-icon" style="background: #D1FAE5;">
          <v-icon color="#10B981" size="16">mdi-clock-outline</v-icon>
        </div>
        <span class="card-label">Horas do Programa</span>
      </div>
      <div class="card-row">
        <span class="card-sublabel">Estimadas</span>
        <span class="card-value" :class="{ 'card-value--empty': !store.resumo }">
          {{ store.resumo ? store.resumo.horas_estimadas.toFixed(1) + 'h' : '--' }}
        </span>
      </div>
      <div class="card-row">
        <span class="card-sublabel">Realizadas</span>
        <span class="card-value" :class="{ 'card-value--empty': !store.resumo }">
          {{ store.resumo ? store.resumo.horas_realizadas.toFixed(1) + 'h' : '--' }}
        </span>
      </div>
    </div>

    <div class="programa-card">
      <div class="card-header">
        <div class="card-icon" style="background: #EDE9FE;">
          <v-icon color="#7C3AED" size="16">mdi-folder-multiple-outline</v-icon>
        </div>
        <span class="card-label">Quantidade de Projetos</span>
      </div>
      <div class="card-value card-value--large" :class="{ 'card-value--empty': !store.resumo }">
        {{ store.resumo ? store.resumo.total_projetos : '--' }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useProgramaStore } from '@/stores/programa'

  const store = useProgramaStore()

  function formatarMoeda (valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }
</script>

<style scoped>
.programa-cards {
  display: flex;
  flex-direction: row;
  gap: 16px;
  flex: 1;
}

.programa-card {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 16px;
  min-width: 180px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: box-shadow 0.2s ease;
}

.programa-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.card-icon {
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  white-space: normal;
  line-height: 1.3;
}

.card-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.card-sublabel {
  font-size: 12px;
  color: #6B7280;
}

.card-value {
  font-size: 15px;
  font-weight: 500;
  color: #111827;
}

.card-value--large {
  font-size: 28px;
  font-weight: 600;
  color: #111827;
  margin-top: 8px;
}

.card-value--empty {
  color: #9CA3AF;
}

.programa-card:last-child {
  align-items: center;
  justify-content: center;
}
</style>
