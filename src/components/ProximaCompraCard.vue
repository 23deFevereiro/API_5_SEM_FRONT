<template>
  <div class="proxima-compra-card">
    <div class="proxima-compra-card__header">
      <div>
        <span class="proxima-compra-card__label">Próxima compra recomendada</span>
        <h3 class="proxima-compra-card__date">
          {{ dataExibida }}
        </h3>
      </div>

    </div>

    <div v-if="store.carregandoSugestaoCompra" class="proxima-compra-card__empty">
      <v-progress-circular color="#2563EB" indeterminate size="24" width="2" />
      <span>Carregando sugestão...</span>
    </div>

    <div v-else-if="materiais.length === 0" class="proxima-compra-card__empty">
      <v-icon color="#9CA3AF" size="28">mdi-check-circle-outline</v-icon>
      <span>{{ store.sugestaoProximaCompra?.mensagem || 'Nenhum material precisa de compra no momento' }}</span>
    </div>

    <ul v-else class="proxima-compra-card__list">
      <li
        v-for="item in materiais.slice(0, 5)"
        :key="item.material_id"
        class="proxima-compra-card__item"
      >
        <v-icon color="#2563EB" size="14">mdi-circle-small</v-icon>

        <span class="proxima-compra-card__item-text">
          <strong>{{ item.material }}</strong>
          <br>

          <span class="proxima-compra-card__cobertura">
            Estoque para {{ item.dias_cobertura }}
            {{ item.dias_cobertura === 1 ? 'dia' : 'dias' }}
          </span>

          ·

          <span
            v-if="item.comprar_imediatamente"
            class="proxima-compra-card__urgente"
          >
            comprar imediatamente
          </span>

          <span v-else>
            comprar até {{ formatarData(item.data_limite_compra) }}
          </span>

          com

          <span
            v-if="item.fornecedor_sugerido === 'Fornecedor não definido' || item.fornecedor_sugerido === '-'"
            class="proxima-compra-card__sem-historico"
          >
            <v-icon color="#9CA3AF" size="12">
              mdi-help-circle-outline
            </v-icon>

            fornecedor desconhecido
          </span>

          <span v-else>{{ item.fornecedor_sugerido }}</span>
        </span>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
  import { computed, onMounted } from 'vue'
  import { usePlanejamentoStore } from '@/stores/planejamento'

  const store = usePlanejamentoStore()

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

  function formatarData (data: string) {
    const [ano, mes, dia] = data.split('-')
    return `${dia}/${mes}/${ano}`
  }

  onMounted(() => {
    store.buscarSugestaoProximaCompra()
  })
</script>

<style scoped>
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

.proxima-compra-card__empty {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6B7280;
  font-size: 13px;
  min-height: 48px;
}
.proxima-compra-card {
  position: relative;
  overflow: visible;
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

.proxima-compra-card__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.proxima-compra-card__item {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  font-size: 13px;
  color: #374151;
  line-height: 1.4;
}

.proxima-compra-card__item-text {
  flex: 1;
}

.proxima-compra-card__urgente {
  color: #2563EB;
  font-weight: 700;
}

.proxima-compra-card__sem-historico {
  color: #9CA3AF;
  font-style: italic;
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.proxima-compra-card__cobertura {
  color: #6B7280;
  font-size: 12px;
}

</style>
