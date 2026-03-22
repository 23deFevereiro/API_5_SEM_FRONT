<template>
  <div class="projeto-selector">
    <div class="selector-label">Seletor de Projeto</div>
    <v-autocomplete
      v-model="projetoSelecionado"
      :items="store.projetos"
      :loading="carregando"
      item-title="nome_projeto"
      item-value="id"
      placeholder="Selecione um projeto"
      return-object
      clearable
      hide-details
      variant="outlined"
      density="comfortable"
      class="projeto-autocomplete"
      @update:search="buscarProjetos"
      @update:model-value="selecionarProjeto"
    />
    <div class="selector-hint">
      <v-icon size="14" color="#6B7280">mdi-information-outline</v-icon>
      Selecione um projeto para visualizar os custos e tempo total
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { useProjetoStore } from '@/stores/projeto'
const store = useProjetoStore()
const projetoSelecionado = ref(null)
const carregando = ref(false)
async function buscarProjetos(search: string) {
  if (!search) return
  carregando.value = true
  try {
    await store.buscarProjetos(search)
  } finally {
    carregando.value = false
  }
}
async function selecionarProjeto(projeto: any) {
  if (!projeto) return
  await store.selecionarProjeto(projeto)
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
