<template>
  <div class="estoque-section">
    <div class="section-header">
      <div class="section-title">
        <v-icon color="#6366F1" size="16">mdi-table-eye</v-icon>
        <span>Estoque de Materiais</span>
      </div>

      <span v-if="store.tabelaEstoque.count > 0" class="section-count">
        {{ store.tabelaEstoque.count }} {{ store.tabelaEstoque.count === 1 ? 'item' : 'itens' }}
      </span>
    </div>

    <div class="content-area">
      <div v-if="isInitialLoad" class="empty-state">
        <v-progress-circular color="#6366F1" indeterminate size="26" width="2" />
        <span>Carregando...</span>
      </div>

      <div v-else-if="showEmpty" class="empty-state">
        <v-icon color="#9CA3AF" size="36">mdi-package-variant-closed</v-icon>
        <span>Nenhum material com dados de consumo</span>
      </div>

      <div v-else class="table-wrapper" :class="{ 'table-wrapper--loading': store.carregandoTabela }">
        <div class="table-scroll">
          <table class="estoque-table">
            <thead>
              <tr>
                <th class="col-material col-sortable" @click="toggleSort('material')">
                  Material <span class="sort-icon">{{ sortIcon('material') }}</span>
                </th>

                <th class="col-projeto col-sortable" @click="toggleSort('projeto')">
                  Projeto <span class="sort-icon">{{ sortIcon('projeto') }}</span>
                </th>

                <th class="col-estoque">Estoque atual</th>
                <th class="col-consumo">Consumo previsto</th>

                <th class="col-dias col-sortable" @click="toggleSort('dias_ate_acabar')">
                  Dias até acabar <span class="sort-icon">{{ sortIcon('dias_ate_acabar') }}</span>
                </th>

                <th class="col-status col-sortable" @click="toggleSort('status')">
                  Status <span class="sort-icon">{{ sortIcon('status') }}</span>
                </th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(item, i) in sortedResults"
                :key="i"
                class="table-row"
              >
                <td class="col-material">{{ item.material }}</td>
                <td class="col-projeto">{{ item.projeto }}</td>
                <td class="col-estoque">{{ item.estoque_atual }}</td>
                <td class="col-consumo">{{ item.consumo_previsto }}/dia</td>
                <td class="col-dias">{{ item.dias_ate_acabar }}</td>

                <td class="col-status">
                  <span :class="['status-badge', `status-badge--${statusClass(item.status)}`]">
                    {{ item.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="table-footer">
          <span class="pagination-summary">
            Mostrando {{ primeiroItem }}-{{ ultimoItem }} de {{ store.tabelaEstoque.count }}
          </span>

          <div class="pagination-controls">
            <button
              class="pagination-button"
              :disabled="store.tabelaEstoque.page <= 1 || store.carregandoTabela"
              type="button"
              @click="store.buscarTabelaEstoque(store.tabelaEstoque.page - 1)"
            >
              Anterior
            </button>

            <span class="pagination-page">
              Página {{ store.tabelaEstoque.page }} de {{ store.tabelaEstoque.total_pages }}
            </span>

            <button
              class="pagination-button"
              :disabled="store.tabelaEstoque.page >= store.tabelaEstoque.total_pages || store.carregandoTabela"
              type="button"
              @click="store.buscarTabelaEstoque(store.tabelaEstoque.page + 1)"
            >
              Próxima
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { EstoqueItem } from '@/stores/planejamento'
  import { computed, onMounted, watch } from 'vue'
  import { usePlanejamentoStore } from '@/stores/planejamento'

  const store = usePlanejamentoStore()

  function toggleSort (key: string) {
    if (store.tabelaSortBy === key) {
      store.tabelaSortDir = store.tabelaSortDir === 'asc' ? 'desc' : 'asc'
    } else {
      store.tabelaSortBy = key
      store.tabelaSortDir = 'asc'
    }
    store.buscarTabelaEstoque(1)
  }

  function sortIcon (key: string): string {
    if (store.tabelaSortBy !== key) return '⇅'
    return store.tabelaSortDir === 'asc' ? '↑' : '↓'
  }

  const sortedResults = computed<EstoqueItem[]>(() => store.tabelaEstoque.results)

  const isInitialLoad = computed(() => store.carregandoTabela && store.tabelaEstoque.count === 0)
  const showEmpty = computed(() => !store.carregandoTabela && store.tabelaEstoque.results.length === 0)

  const primeiroItem = computed(() => {
    const t = store.tabelaEstoque
    if (t.count === 0) return 0
    return (t.page - 1) * t.page_size + 1
  })

  const ultimoItem = computed(() => {
    const t = store.tabelaEstoque
    return Math.min(t.page * t.page_size, t.count)
  })

  function statusClass (status: string): string {
    if (status === 'Urgente') return 'urgente'
    if (status === 'Atenção') return 'atencao'
    return 'ok'
  }

  watch(() => store.materialSelecionado, () => {
    store.buscarTabelaEstoque(1)
  })

  onMounted(() => {
    store.buscarTabelaEstoque(1)
  })
</script>

<style scoped>
.estoque-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.table-wrapper {
  flex: 1;
}

.estoque-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.estoque-table thead tr {
  background: #F9FAFB;
}

.estoque-table th {
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

.estoque-table td {
  padding: 10px 12px;
  font-size: 13px;
  color: #374151;
}

.col-material {
  min-width: 160px;
  font-weight: 500;
  color: #111827;
}

.col-projeto {
  min-width: 140px;
}

.col-estoque,
.col-consumo,
.col-dias {
  min-width: 110px;
}

.col-status {
  min-width: 90px;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge--urgente {
  background: #FEF2F2;
  color: #B91C1C;
}

.status-badge--atencao {
  background: #FFFBEB;
  color: #B45309;
}

.status-badge--ok {
  background: #ECFDF5;
  color: #047857;
}

</style>
