<template>
  <div class="alerta-card alerta-card--atencao">
    <div class="alerta-card__header">
      <v-icon color="#D97706" size="16">mdi-alert</v-icon>
      <span class="alerta-card__title">Materiais em Atenção</span>
      <span class="alerta-card__badge alerta-card__badge--atencao">{{ store.criticoMax + 1 }}–{{ store.atencaoMax }} dias</span>
      <input
        class="alerta-card__input"
        :min="store.criticoMax + 2"
        title="Máximo de dias para atenção"
        type="number"
        :value="store.atencaoMax"
        @change="store.setAtencaoMax(Number(($event.target as HTMLInputElement).value))"
      >
    </div>

    <div v-if="store.carregandoAlertas" class="alerta-card__empty">
      <v-progress-circular color="#D97706" indeterminate size="24" width="2" />
      <span>Carregando...</span>
    </div>

    <div v-else-if="displayItems.length === 0" class="alerta-card__empty">
      <v-icon color="#9CA3AF" size="32">mdi-check-circle-outline</v-icon>
      <span>Nenhum material em atenção</span>
    </div>

    <ul v-else class="alerta-card__list">
      <li
        v-for="item in displayItems"
        :key="item.material"
        class="alerta-card__item"
      >
        <v-icon
          :color="item.dias_para_pedir <= store.criticoMax ? '#DC2626' : '#D97706'"
          size="14"
        >mdi-circle-small</v-icon>
        <span class="alerta-card__item-text">
          <strong>{{ item.material }}</strong>
          <span v-if="item.dias_para_pedir <= store.criticoMax" class="alerta-card__overflow-badge">Crítico</span>
          <br>
          <span class="alerta-card__cobertura">
            Estoque para {{ item.dias_cobertura }} {{ item.dias_cobertura === 1 ? 'dia' : 'dias' }}
          </span>
          · pedir em
          {{ item.dias_para_pedir }} {{ item.dias_para_pedir === 1 ? 'dia' : 'dias' }}
          com
          <span v-if="item.fornecedor === '-'" class="alerta-card__sem-historico">
            <v-icon color="#9CA3AF" size="12">mdi-help-circle-outline</v-icon>
            fornecedor desconhecido
          </span>
          <span v-else>{{ item.fornecedor }}</span>
        </span>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { usePlanejamentoStore } from '@/stores/planejamento'

  const store = usePlanejamentoStore()

  const displayItems = computed(() =>
    [...store.alertas.criticos.slice(5), ...store.alertas.atencao].slice(0, 5),
  )
</script>

<style scoped>
.alerta-card {
  flex: 1;
  min-width: 0;
  border-radius: 12px;
  border: 1px solid #FDE68A;
  background: #FFFDF0;
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

.alerta-card__badge--atencao {
  background: #FDE68A;
  color: #92400E;
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

.alerta-card__cobertura {
  color: #6B7280;
  font-size: 12px;
}

.alerta-card__sem-historico {
  color: #9CA3AF;
  font-style: italic;
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.alerta-card__overflow-badge {
  margin-left: 6px;
  font-size: 10px;
  font-weight: 700;
  color: #991B1B;
  background: #FEE2E2;
  padding: 1px 5px;
  border-radius: 99px;
  vertical-align: middle;
}

.alerta-card__input {
  width: 52px;
  border: 1px solid #FDE68A;
  border-radius: 6px;
  padding: 2px 4px;
  font-size: 12px;
  font-weight: 600;
  color: #92400E;
  text-align: center;
  background: transparent;
  outline: none;
}

.alerta-card__input:focus {
  border-color: #D97706;
}
</style>
