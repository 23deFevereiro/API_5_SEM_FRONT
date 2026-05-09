<template>
  <v-autocomplete
    v-model="selecionado"
    class="filtro-autocomplete"
    clearable
    density="comfortable"
    :disabled="disabled"
    hide-details
    :items="store.nomesFuncionarios"
    label="Funcionário"
    placeholder="Filtrar por funcionário"
    variant="outlined"
    @update:model-value="aoSelecionar"
  />
</template>

<script lang="ts" setup>
  import { ref, watch } from 'vue'
  import { useProjetoStore } from '@/stores/projeto'

  defineProps<{ disabled?: boolean }>()

  const store = useProjetoStore()
  const selecionado = ref<string | null>(store.filtroFuncionario)

  watch(() => store.filtroFuncionario, v => {
    selecionado.value = v
  })

  async function aoSelecionar (valor: string | null) {
    await store.aplicarFiltroFuncionario(valor ?? null)
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
