<template>
  <div class="programa-selector">
    <div class="selector-label">Programa</div>
    <v-autocomplete
      v-model="programaSelecionado"
      class="programa-autocomplete"
      clearable
      density="comfortable"
      hide-details
      item-title="nome"
      item-value="id"
      :items="store.programas"
      :loading="carregando"
      placeholder="Selecione um programa"
      return-object
      variant="outlined"
      @click="carregarTodos"
      @update:model-value="selecionarPrograma"
      @update:search="buscarProgramas"
    />
    <div class="selector-hint">
      <v-icon color="#6B7280" size="14">mdi-information-outline</v-icon>
      Filtra os projetos pelo programa selecionado
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { storeToRefs } from 'pinia'
  import { onMounted, ref } from 'vue'
  import { type Programa, useProgramaStore } from '@/stores/programa'
  import { useProjetoStore } from '@/stores/projeto'

  const store = useProgramaStore()
  const projetoStore = useProjetoStore()
  const { programaSelecionado } = storeToRefs(store)
  const carregando = ref(false)

  onMounted(async () => {
    await carregarTodos()
  })

  async function carregarTodos () {
    if (store.programas.length > 0) return
    carregando.value = true
    try {
      await store.buscarProgramas('')
    } finally {
      carregando.value = false
    }
  }

  async function buscarProgramas (search: string) {
    carregando.value = true
    try {
      await store.buscarProgramas(search ?? '')
    } finally {
      carregando.value = false
    }
  }

  async function selecionarPrograma (programa: Programa | null) {
    store.selecionarPrograma(programa)
    await projetoStore.aplicarFiltroPorPrograma(programa?.id ?? null)
  }
</script>

<style scoped>
.programa-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 280px;
  margin-bottom: 16px;
}

.selector-label {
  font-size: 14px;
  font-weight: 500;
  color: #6B7280;
}

.programa-autocomplete :deep(.v-field) {
  background: #F9FAFB;
  border-radius: 10px;
  font-size: 16px;
  color: #111827;
}

.programa-autocomplete :deep(.v-field__outline) {
  border-color: #E5E7EB;
}

.programa-autocomplete :deep(.v-field--focused .v-field__outline) {
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
