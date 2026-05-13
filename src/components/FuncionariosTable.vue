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

      <div v-if="store.funcionarios.total_pages > 1" class="table-footer">
        <span class="pagination-summary">
          Mostrando {{ primeiroItem }}-{{ ultimoItem }} de {{ store.funcionarios.count }}
        </span>
        <div class="pagination-controls">
          <button
            class="pagination-button"
            :disabled="store.funcionarios.page <= 1"
            type="button"
            @click="mudarPagina(store.funcionarios.page - 1)"
          >
            Anterior
          </button>
          <span class="pagination-page">Página {{ store.funcionarios.page }} de {{ store.funcionarios.total_pages }}</span>
          <button
            class="pagination-button"
            :disabled="store.funcionarios.page >= store.funcionarios.total_pages"
            type="button"
            @click="mudarPagina(store.funcionarios.page + 1)"
          >
            Próxima
          </button>
        </div>
      </div>
    </template>

    <div v-else class="empty-state">
      <v-icon color="#9CA3AF" size="36">mdi-account-off-outline</v-icon>
      <span>Nenhum funcionário encontrado para este projeto</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { useProjetoStore } from '@/stores/projeto'

  const store = useProjetoStore()

  const primeiroItem = computed(() => {
    if (!store.funcionarios || store.funcionarios.count === 0) return 0
    return (store.funcionarios.page - 1) * store.funcionarios.page_size + 1
  })

  const ultimoItem = computed(() => {
    if (!store.funcionarios) return 0
    return Math.min(store.funcionarios.page * store.funcionarios.page_size, store.funcionarios.count)
  })

  async function mudarPagina (page: number) {
    if (!store.projetoSelecionado) return
    await store.buscarFuncionarios(store.projetoSelecionado.id, page)
  }
</script>

<style scoped>
.funcionarios-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.funcionarios-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.funcionarios-table thead tr {
  background: #F9FAFB;
}

.funcionarios-table th {
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

.funcionarios-table td {
  padding: 10px 12px;
  font-size: 13px;
  color: #374151;
  vertical-align: middle;
}

.col-nome     { min-width: 160px; }
.col-horas    { min-width: 90px; }
.col-projetos { min-width: 200px; }

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
</style>
