<template>
  <div class="projeto-selector">
    <div class="selector-label">Projeto</div>

    <v-autocomplete
      v-model="projetoSelecionado"
      class="projeto-autocomplete"
      clearable
      density="comfortable"
      hide-details
      :item-title="formatarTitulo"
      item-value="id"
      :items="store.projetos"
      :loading="carregando"
      placeholder="Selecione um projeto"
      return-object
      variant="outlined"
      @click="carregarTodos"
      @update:model-value="selecionarProjeto"
      @update:search="buscarProjetos"
    />

    <div class="selector-hint">
      <v-icon color="#6B7280" size="14">mdi-information-outline</v-icon>
      Selecione um projeto para visualizar os dados
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { storeToRefs } from 'pinia'
  import { onMounted, ref } from 'vue'
  import { useProjetoStore } from '@/stores/projeto'

  const store = useProjetoStore()
  const { projetoSelecionado } = storeToRefs(store)
  const carregando = ref(false)

  onMounted(async () => {
    await carregarTodos()
  })

  async function carregarTodos () {
    if (store.projetos.length > 0) return
    carregando.value = true
    try {
      await store.buscarProjetos('')
    } finally {
      carregando.value = false
    }
  }

  async function buscarProjetos (search: string) {
    carregando.value = true
    try {
      await store.buscarProjetos(search ?? '')
    } finally {
      carregando.value = false
    }
  }

  async function selecionarProjeto (projeto: any) {
    if (!projeto) {
      store.limpar()
      return
    }
    await store.selecionarProjeto(projeto)
  }

  function formatarTitulo (projeto: { codigo_projeto: string, nome_projeto: string }) {
    return `${projeto.codigo_projeto}: ${projeto.nome_projeto}`
  }
</script>

<style scoped>
.projeto-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 280px;
}

.selector-label {
  font-size: 14px;
  font-weight: 500;
  color: #6B7280;
}

.projeto-autocomplete :deep(.v-field) {
  background: #F9FAFB;
  border-radius: 10px;
  font-size: 16px;
  color: #111827;
}

.projeto-autocomplete :deep(.v-field__outline) {
  border-color: #E5E7EB;
}

.projeto-autocomplete :deep(.v-field--focused .v-field__outline) {
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
