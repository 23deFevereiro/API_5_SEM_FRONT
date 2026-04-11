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

      <div v-if="store.materiais.total_pages > 1" class="pagination">
        <button
          class="page-btn"
          :disabled="store.materiais.page <= 1"
          @click="mudarPagina(store.materiais.page - 1)"
        >
          <v-icon size="16">mdi-chevron-left</v-icon>
        </button>
        <div class="page-info">
          <span class="page-current">{{ store.materiais.page }}</span>
          <span class="page-sep">/</span>
          <span class="page-total">{{ store.materiais.total_pages }}</span>
        </div>
        <button
          class="page-btn"
          :disabled="store.materiais.page >= store.materiais.total_pages"
          @click="mudarPagina(store.materiais.page + 1)"
        >
          <v-icon size="16">mdi-chevron-right</v-icon>
        </button>
      </div>
    </template>

    <div v-else class="empty-state">
      <v-icon color="#9CA3AF" size="36">mdi-package-variant-remove</v-icon>
      <span>Nenhum material encontrado para este projeto</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useProjetoStore } from '@/stores/projeto'

  const store = useProjetoStore()

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
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  margin-top: 24px;
  overflow: hidden;
  transition: box-shadow 0.2s ease;
}

.materiais-section:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 12px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.section-count {
  font-size: 13px;
  color: #9CA3AF;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 40px 16px;
  font-size: 13px;
  color: #9CA3AF;
}

.table-wrapper {
  overflow-x: auto;
}

.materiais-table {
  width: 100%;
  border-collapse: collapse;
}

.materiais-table thead tr {
  background: #F9FAFB;
  border-top: 1px solid #E5E7EB;
  border-bottom: 1px solid #E5E7EB;
}

.materiais-table th {
  font-size: 13px;
  font-weight: 500;
  color: #6B7280;
  padding: 10px 16px;
  text-align: left;
  white-space: nowrap;
}

.table-row:not(:last-child) td {
  border-bottom: 1px solid #E5E7EB;
}

.materiais-table td {
  padding: 12px 16px;
  font-size: 14px;
  color: #374151;
}

.col-nome  { width: 50%; }
.col-custo { width: 30%; }
.col-qtd   { width: 20%; text-align: center; }
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

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px 16px;
  border-top: 1px solid #E5E7EB;
  background: #F9FAFB;
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
  background: #FFFFFF;
  color: #374151;
  cursor: pointer;
  transition: box-shadow 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}

.page-current {
  font-weight: 500;
  color: #111827;
}

.page-sep,
.page-total {
  color: #9CA3AF;
}
</style>
