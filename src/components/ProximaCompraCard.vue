<template>
  <div class="proxima-compra-card">
    <div class="proxima-compra-card__header">
      <div>
        <span class="proxima-compra-card__label">Próxima compra recomendada</span>
        <h3 class="proxima-compra-card__date">
          {{ dataExibida }}
        </h3>
      </div>

      <v-btn
        v-if="materiais.length > 0"
        class="proxima-compra-card__button"
        density="comfortable"
        icon
        variant="text"
        @click="aberto = !aberto"
      >
        <v-icon>{{ aberto ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
      </v-btn>
    </div>

    <div v-if="store.carregandoSugestaoCompra" class="proxima-compra-card__empty">
      <v-progress-circular color="#2563EB" indeterminate size="24" width="2" />
      <span>Carregando sugestão...</span>
    </div>

    <div v-else-if="materiais.length === 0" class="proxima-compra-card__empty">
      <v-icon color="#9CA3AF" size="28">mdi-check-circle-outline</v-icon>
      <span>{{ store.sugestaoProximaCompra?.mensagem || 'Nenhum material precisa de compra no momento' }}</span>
    </div>

    <ul v-else-if="aberto" class="proxima-compra-card__list">
      <li
        v-for="item in materiais"
        :key="item.material_id"
        class="proxima-compra-card__item"
      >
        <strong>{{ item.material }}</strong>
        <span>{{ item.fornecedor_sugerido }}</span>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
  import { computed, onMounted, ref } from 'vue'
  import { usePlanejamentoStore } from '@/stores/planejamento'

  const store = usePlanejamentoStore()
  const aberto = ref(false)

  const materiais = computed(() => store.sugestaoProximaCompra?.materiais || [])

  const dataExibida = computed(() => {
    const sugestao = store.sugestaoProximaCompra

    if (store.carregandoSugestaoCompra) return '--/--'
    if (!sugestao || materiais.value.length === 0) return 'Sem compra necessária'
    if (sugestao.comprar_imediatamente) return 'Imediatamente'
    if (!sugestao.data_sugerida) return 'Sem compra necessária'

    const [ano, mes, dia] = sugestao.data_sugerida.split('-')
    return `${dia}/${mes}/${ano}`
  })

  onMounted(() => {
    store.buscarSugestaoProximaCompra()
  })
</script>

<style scoped>
.proxima-compra-card {
  width: 340px;
  min-height: 150px;
  border-radius: 12px;
  border: 1px solid #BFDBFE;
  background: #EFF6FF;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.proxima-compra-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.proxima-compra-card__label {
  font-size: 13px;
  color: #374151;
  font-weight: 600;
}

.proxima-compra-card__date {
  margin: 6px 0 0;
  font-size: 26px;
  color: #111827;
  font-weight: 700;
}

.proxima-compra-card__button {
  color: #1D4ED8;
}

.proxima-compra-card__empty {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6B7280;
  font-size: 13px;
  min-height: 48px;
}

.proxima-compra-card__list {
  list-style: none;
  margin: 0;
  padding: 0;
  background: #FFFFFF;
  border-radius: 8px;
  border: 1px solid #DBEAFE;
  overflow: hidden;
}

.proxima-compra-card__item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 12px;
  font-size: 13px;
  color: #374151;
  border-bottom: 1px solid #E5E7EB;
}

.proxima-compra-card__item:last-child {
  border-bottom: none;
}

.proxima-compra-card__item span {
  color: #6B7280;
  font-size: 12px;
}

@media (max-width: 768px) {
  .proxima-compra-card {
    width: 100%;
  }
}
</style>
