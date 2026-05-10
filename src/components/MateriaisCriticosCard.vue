<template>
  <div class="alerta-card alerta-card--critico">
    <div class="alerta-card__header">
      <v-icon color="#DC2626" size="16">mdi-alert-circle</v-icon>
      <span class="alerta-card__title">Materiais Críticos</span>
      <span class="alerta-card__badge alerta-card__badge--critico">0–30 dias</span>
    </div>

    <div v-if="store.carregandoAlertas" class="alerta-card__empty">
      <v-progress-circular color="#DC2626" indeterminate size="24" width="2" />
      <span>Carregando...</span>
    </div>

    <div v-else-if="store.alertas.criticos.length === 0" class="alerta-card__empty">
      <v-icon color="#9CA3AF" size="32">mdi-check-circle-outline</v-icon>
      <span>Nenhum material crítico</span>
    </div>

    <ul v-else class="alerta-card__list">
      <li
        v-for="item in store.alertas.criticos"
        :key="item.material"
        class="alerta-card__item"
      >
        <v-icon color="#DC2626" size="14">mdi-circle-small</v-icon>
        <span class="alerta-card__item-text">
          <strong>{{ item.material }}</strong>
          —
          <span v-if="item.dias_para_pedir <= 0" class="alerta-card__urgente">
            Pedido urgente
          </span>
          <span v-else>
            {{ item.dias_para_pedir }} {{ item.dias_para_pedir === 1 ? 'dia' : 'dias' }} para pedir
          </span>
          com {{ item.fornecedor }}
        </span>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted } from 'vue'
  import { usePlanejamentoStore } from '@/stores/planejamento'

  const store = usePlanejamentoStore()

  onMounted(() => {
    store.buscarAlertas()
  })
</script>

<style scoped>
.alerta-card {
  flex: 1;
  min-width: 0;
  border-radius: 12px;
  border: 1px solid #FEE2E2;
  background: #FFF9F9;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alerta-card__header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.alerta-card__title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  flex: 1;
}

.alerta-card__badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 99px;
}

.alerta-card__badge--critico {
  background: #FEE2E2;
  color: #DC2626;
}

.alerta-card__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px 0;
  color: #9CA3AF;
  font-size: 13px;
}

.alerta-card__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.alerta-card__item {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  font-size: 13px;
  color: #374151;
  line-height: 1.4;
}

.alerta-card__item-text {
  flex: 1;
}

.alerta-card__urgente {
  color: #DC2626;
  font-weight: 700;
}
</style>
