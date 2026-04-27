<template>
  <v-autocomplete
    v-model="selecionado"
    class="filtro-autocomplete"
    clearable
    density="comfortable"
    :disabled="disabled"
    hide-details
    item-title="descricao"
    item-value="id"
    :items="store.materiaisDisponiveis"
    label="Material"
    placeholder="Filtrar por material"
    return-object
    variant="outlined"
    @update:model-value="aoSelecionar"
  />
</template>

<script lang="ts" setup>
  import { ref, watch } from 'vue'
  import { type MaterialDisponivel, useProjetoStore } from '@/stores/projeto'

  defineProps<{ disabled?: boolean }>()

  const store = useProjetoStore()
  const selecionado = ref<MaterialDisponivel | null>(store.filtroMaterial)

  watch(() => store.filtroMaterial, v => {
    selecionado.value = v
  })

  async function aoSelecionar (valor: MaterialDisponivel | null) {
    await store.aplicarFiltroMaterial(valor ?? null)
  }
</script>

<style scoped>
.filtro-autocomplete {
  min-width: 240px;
}

.filtro-autocomplete :deep(.v-field) {
  background: #F9FAFB;
  border-radius: 10px;
}

.filtro-autocomplete :deep(.v-field__outline) {
  border-color: #E5E7EB;
}

.filtro-autocomplete :deep(.v-field--focused .v-field__outline) {
  border-color: #2563EB;
}
</style>
