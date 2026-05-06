<template>
  <div class="materiais-section">
    <div class="section-header">
      <div class="section-title">
        <v-icon color="#F59E0B" size="16">mdi-package-variant-closed</v-icon>
        <span>Materiais</span>
      </div>
      <span v-if="store.materiais" class="section-count">
        {{ store.materiais.count }} {{ store.materiais.count === 1 ? 'item' : 'itens' }}
      </span>
    </div>

    <div v-if="!store.projetoSelecionado" class="empty-state">
      <v-icon color="#9CA3AF" size="36">mdi-folder-open-outline</v-icon>
      <span>Selecione um projeto para ver os materiais</span>
    </div>

    <div v-else-if="store.carregandoMateriais" class="empty-state">
      <v-progress-circular color="#F59E0B" indeterminate size="26" width="2" />
      <span>Carregando materiais...</span>
    </div>

    <template v-else-if="store.materiais && store.materiais.results.length > 0">
      <div class="table-wrapper">
        <table class="materiais-table">
          <thead>
            <tr>
              <th class="col-nome">Nome</th>
              <th class="col-custo">Custo Total (R$)</th>
              <th class="col-qtd">Quantidade</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(material, i) in store.materiais.results"
              :key="i"
              class="table-row"
            >
              <td class="col-nome">
                <div class="material-nome">
                  <span class="material-dot" />
                  {{ material.nome_material }}
                </div>
              </td>
              <td class="col-custo">{{ formatarMoeda(material.custo_total_estimado) }}</td>
              <td class="col-qtd">
                <span class="qtd-badge">{{ material.quantidade }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="store.materiais.total_pages > 1" class="table-footer">
        <span class="pagination-summary">
          Mostrando {{ primeiroItem }}-{{ ultimoItem }} de {{ store.materiais.count }}
        </span>
        <div class="pagination-controls">
          <button
            class="pagination-button"
            :disabled="store.materiais.page <= 1"
            type="button"
            @click="mudarPagina(store.materiais.page - 1)"
          >
            Anterior
          </button>
          <span class="pagination-page">Página {{ store.materiais.page }} de {{ store.materiais.total_pages }}</span>
          <button
            class="pagination-button"
            :disabled="store.materiais.page >= store.materiais.total_pages"
            type="button"
            @click="mudarPagina(store.materiais.page + 1)"
          >
            Próxima
          </button>
        </div>
      </div>
    </template>

    <div v-else class="empty-state">
      <v-icon color="#9CA3AF" size="36">mdi-package-variant-remove</v-icon>
      <span>Nenhum material encontrado para este projeto</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { useProjetoStore } from '@/stores/projeto'

  const store = useProjetoStore()

  const primeiroItem = computed(() => {
    if (!store.materiais || store.materiais.count === 0) return 0
    return (store.materiais.page - 1) * store.materiais.page_size + 1
  })

  const ultimoItem = computed(() => {
    if (!store.materiais) return 0
    return Math.min(store.materiais.page * store.materiais.page_size, store.materiais.count)
  })

  function formatarMoeda (valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  async function mudarPagina (page: number) {
    if (!store.projetoSelecionado) return
    await store.buscarMateriais(store.projetoSelecionado.id, page)
  }
</script>

<style scoped>

.materiais-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.section-count {
  font-size: 12px;
  color: #4B5563;
  background: #F3F4F6;
  padding: 2px 8px;
  border-radius: 999px;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
}

.materiais-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.materiais-table thead tr {
  background: #F9FAFB;
}

.materiais-table th {
  padding: 10px 12px;
  text-align: left;
  font-weight: 600;
  color: #6B7280;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
  border-bottom: 1px solid #E5E7EB;
}

.table-row {
  border-bottom: 1px solid #F3F4F6;
  transition: background 0.15s;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background: #F9FAFB;
}

.materiais-table td {
  padding: 10px 12px;
  font-size: 13px;
  color: #374151;
  vertical-align: middle;
}

.col-nome  { min-width: 160px; }
.col-custo { min-width: 140px; }
.col-qtd   { min-width: 80px; text-align: center; }
.materiais-table th.col-qtd { text-align: center; }

.material-nome {
  display: flex;
  align-items: center;
  gap: 8px;
}

.material-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #F59E0B;
  flex-shrink: 0;
}

.qtd-badge {
  display: inline-block;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  color: #374151;
  font-size: 13px;
  font-weight: 500;
  padding: 2px 10px;
  border-radius: 12px;
}

.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border-top: 1px solid #E5E7EB;
  background: #F9FAFB;
}

.pagination-summary,
.pagination-page {
  font-size: 12px;
  color: #6B7280;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pagination-button {
  border: 1px solid #D1D5DB;
  background: #FFFFFF;
  color: #374151;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.pagination-button:hover:not(:disabled) {
  background: #EEF2FF;
  border-color: #C7D2FE;
  color: #4338CA;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .table-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .pagination-controls {
    justify-content: space-between;
  }
}
</style>
