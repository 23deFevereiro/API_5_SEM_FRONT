<template>
  <div class="custo-cards">
    <div class="custo-card">
      <div class="card-header">
        <div class="card-icon">
          <v-icon color="#F59E0B" size="16">mdi-cash-multiple</v-icon>
        </div>
        <span class="card-label">Custo Total do Projeto</span>
      </div>
      <div class="card-value" :class="{ 'card-value--empty': !store.resumo }">
        {{ store.resumo ? formatarMoeda(store.resumo.custo_total) : '--' }}
      </div>
    </div>

    <div class="custo-card">
      <div class="card-header">
        <div class="card-icon">
          <v-icon color="#6B7280" size="16">mdi-clock-outline</v-icon>
        </div>
        <span class="card-label">Tempo Total do Projeto</span>
      </div>
      <div class="card-value" :class="{ 'card-value--empty': !store.resumo }">
        {{ store.resumo ? store.resumo.tempo_total.toFixed(1) + 'h' : '--' }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useProjetoStore } from '@/stores/projeto'

  const store = useProjetoStore()

  function formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }
</script>
<style scoped>
.custo-cards {
  display: flex;
  flex-direction: row;
  gap: 16px;
  flex: 1;
}

.custo-card {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 16px;
  min-width: 180px;
  flex: 1;
  height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: box-shadow 0.2s ease;
}

.custo-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.card-icon {
  background: #FEF3C7;
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

.card-value {
  font-size: 15px;
  font-weight: 500;
  color: #111827;
}

.card-value--empty {
  color: #9CA3AF;
}
</style>
