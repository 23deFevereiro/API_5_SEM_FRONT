<template>
  <div class="funcionarios-section">
    <div class="section-header">
      <div class="section-title">
        <v-icon color="#F59E0B" size="16">mdi-account-group-outline</v-icon>
        <span>Funcionários</span>
      </div>
      <span v-if="store.funcionarios" class="section-count">
        {{ store.funcionarios.count }} {{ store.funcionarios.count === 1 ? 'pessoa' : 'pessoas' }}
      </span>
    </div>

    <div v-if="!store.projetoSelecionado" class="empty-state">
      <v-icon color="#9CA3AF" size="36">mdi-account-off-outline</v-icon>
      <span>Selecione um projeto para ver os funcionários</span>
    </div>

    <div v-else-if="store.carregandoFuncionarios" class="empty-state">
      <v-progress-circular color="#F59E0B" indeterminate size="26" width="2" />
      <span>Carregando funcionários...</span>
    </div>

    <template v-else-if="store.funcionarios && store.funcionarios.results.length > 0">
      <div class="table-wrapper">
        <table class="funcionarios-table">
          <thead>
            <tr>
              <th class="col-nome">Nome</th>
              <th class="col-horas">Horas</th>
              <th class="col-projetos">Projetos que participa</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(funcionario, i) in store.funcionarios.results"
              :key="i"
              class="table-row"
            >
              <td class="col-nome">
                <div class="funcionario-nome">
                  <span class="funcionario-dot" />
                  {{ funcionario.funcionario }}
                </div>
              </td>
              <td class="col-horas">
                <span class="horas-badge">{{ funcionario.total_horas.toFixed(1) }}h</span>
              </td>
              <td class="col-projetos">
                <div class="projetos-lista">
                  <span
                    v-for="codigo in funcionario.projetos"
                    :key="codigo"
                    class="projeto-tag"
                  >
                    {{ codigo }}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="store.funcionarios.total_pages > 1" class="pagination">
        <button
          class="page-btn"
          :disabled="store.funcionarios.page <= 1"
          @click="mudarPagina(store.funcionarios.page - 1)"
        >
          <v-icon size="16">mdi-chevron-left</v-icon>
        </button>
        <div class="page-info">
          <span class="page-current">{{ store.funcionarios.page }}</span>
          <span class="page-sep">/</span>
          <span class="page-total">{{ store.funcionarios.total_pages }}</span>
        </div>
        <button
          class="page-btn"
          :disabled="store.funcionarios.page >= store.funcionarios.total_pages"
          @click="mudarPagina(store.funcionarios.page + 1)"
        >
          <v-icon size="16">mdi-chevron-right</v-icon>
        </button>
      </div>
    </template>

    <div v-else class="empty-state">
      <v-icon color="#9CA3AF" size="36">mdi-account-off-outline</v-icon>
      <span>Nenhum funcionário encontrado para este projeto</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useProjetoStore } from '@/stores/projeto'

  const store = useProjetoStore()

  async function mudarPagina (page: number) {
    if (!store.projetoSelecionado) return
    await store.buscarFuncionarios(store.projetoSelecionado.id, page)
  }
</script>

<style scoped>
.funcionarios-section {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  margin-top: 16px;
  overflow: hidden;
  transition: box-shadow 0.2s ease;
}

.funcionarios-section:hover {
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

.funcionarios-table {
  width: 100%;
  border-collapse: collapse;
}

.funcionarios-table thead tr {
  background: #F9FAFB;
  border-top: 1px solid #E5E7EB;
  border-bottom: 1px solid #E5E7EB;
}

.funcionarios-table th {
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

.funcionarios-table td {
  padding: 12px 16px;
  font-size: 14px;
  color: #374151;
}

.col-nome     { width: 30%; }
.col-horas    { width: 15%; }
.col-projetos { width: 55%; }

.funcionario-nome {
  display: flex;
  align-items: center;
  gap: 8px;
}

.funcionario-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #F59E0B;
  flex-shrink: 0;
}

.horas-badge {
  display: inline-block;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  color: #374151;
  font-size: 13px;
  font-weight: 500;
  padding: 2px 10px;
  border-radius: 12px;
}

.projetos-lista {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.projeto-tag {
  display: inline-block;
  background: #FEF3C7;
  border: 1px solid #F59E0B;
  color: #92400E;
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
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
