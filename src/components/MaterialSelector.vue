<template>
  <div class="material-selector">
    <div class="selector-label">Material</div>

    <v-autocomplete
      v-model="materialSelecionado"
      class="material-autocomplete"
      clearable
      density="comfortable"
      hide-details
      :item-title="formatarTitulo"
      item-value="id"
      :items="store.materiais"
      :loading="store.carregandoMateriais"
      placeholder="Selecione um material"
      return-object
      variant="outlined"
      @click="carregarTodos"
      @update:model-value="selecionarMaterial"
    />

    <div class="selector-hint">
      <v-icon color="#6B7280" size="14">mdi-information-outline</v-icon>
      Selecione um material para visualizar o lead time por fornecedor
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { storeToRefs } from 'pinia'
  import { onMounted } from 'vue'
  import { type MaterialCompra, usePlanejamentoStore } from '@/stores/planejamento'

  const store = usePlanejamentoStore()
  const { materialSelecionado } = storeToRefs(store)

  onMounted(async () => {
    await carregarTodos()
  })

  async function carregarTodos () {
    await store.buscarMateriais()
  }

  async function selecionarMaterial (material: MaterialCompra | null) {
    await store.selecionarMaterial(material ?? null)
  }

  function formatarTitulo (material: MaterialCompra) {
    return `${material.codigo_material}: ${material.descricao}`
  }
</script>

<style scoped>
.material-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 320px;
}

.selector-label {
  font-size: 14px;
  font-weight: 500;
  color: #6B7280;
}

.material-autocomplete :deep(.v-field) {
  background: #F9FAFB;
  border-radius: 10px;
  font-size: 16px;
  color: #111827;
}

.material-autocomplete :deep(.v-field__outline) {
  border-color: #E5E7EB;
}

.material-autocomplete :deep(.v-field--focused .v-field__outline) {
  border-color: #2563EB;
}

.selector-hint {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #6B7280;
}
</style>
