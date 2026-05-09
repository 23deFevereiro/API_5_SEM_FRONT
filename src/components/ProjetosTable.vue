<template>
  <div class="projetos-section">
    <div class="section-header">
      <div class="section-title">
        <v-icon color="#6366F1" size="16">mdi-table-large</v-icon>
        <span>Projetos do Programa</span>
      </div>
      <span v-if="totalProjetos > 0" class="section-count">
        {{ totalProjetos }} {{ totalProjetos === 1 ? 'projeto' : 'projetos' }}
      </span>
    </div>

    <div v-if="!store.programaSelecionado" class="empty-state">
      <v-icon color="#9CA3AF" size="36">mdi-folder-off-outline</v-icon>
      <span>Selecione um programa para ver os projetos</span>
    </div>

    <div v-else-if="store.carregandoTabela && projetos.length === 0" class="empty-state">
      <v-progress-circular color="#6366F1" indeterminate size="26" width="2" />
      <span>Carregando projetos...</span>
    </div>

    <div v-else-if="projetos.length === 0" class="empty-state">
      <v-icon color="#9CA3AF" size="36">mdi-folder-alert-outline</v-icon>
      <span>Nenhum projeto encontrado para este programa</span>
    </div>

    <div v-else class="table-wrapper" :class="{ 'table-wrapper--loading': store.carregandoTabela }">
      <div class="table-scroll">
        <table class="projetos-table">
          <thead>
            <tr>
              <th class="col-nome">Nome do Projeto</th>
              <th class="col-responsavel">Responsável</th>
              <th class="col-status">Status</th>
              <th class="col-horas">Horas Est.</th>
              <th class="col-horas">Horas Real.</th>
              <th class="col-tarefas">Tarefas Conc. (%)</th>
              <th class="col-desvio">Desvio (h)</th>
              <th class="col-data">Data Última Atividade</th>
              <th class="col-dias">Dias desde Última Atividade</th>
              <th class="col-acao">Ação</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(projeto, i) in projetos"
              :key="i"
              class="table-row"
            >
              <td class="col-nome">
                <div class="projeto-nome">
                  <span class="projeto-dot" />
                  {{ projeto.nome_projeto }}
                </div>
              </td>
              <td class="col-responsavel">{{ projeto.responsavel || '—' }}</td>
              <td class="col-status">
                <span class="status-badge" :class="statusClass(projeto.status)">
                  {{ projeto.status || '—' }}
                </span>
              </td>
              <td class="col-horas">{{ projeto.horas_estimadas.toFixed(1) }}h</td>
              <td class="col-horas">{{ projeto.horas_realizadas.toFixed(1) }}h</td>
              <td class="col-tarefas">
                <div class="tarefas-progress">
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      :style="{ width: projeto.percentual_tarefas_concluidas + '%' }"
                    />
                  </div>
                  <span class="progress-label">{{ projeto.percentual_tarefas_concluidas }}%</span>
                </div>
              </td>
              <td class="col-desvio">
                {{ projeto.desvio_horas > 0 ? '+' : '' }}{{ projeto.desvio_horas.toFixed(1) }}h
              </td>
              <td class="col-data">{{ projeto.data_ultima_atividade ? formatarData(projeto.data_ultima_atividade) : '—' }}</td>
              <td class="col-dias">{{ projeto.dias_desde_ultima_atividade !== null ? projeto.dias_desde_ultima_atividade + 'd' : '—' }}</td>
              <td class="col-acao">
                <div
                  v-if="acaoLabel(projeto.total_tarefas, projeto.tarefas_concluidas, projeto.dentro_do_prazo) === null"
                  class="acao-badge"
                  :class="acaoClass(projeto.total_tarefas, projeto.tarefas_concluidas, projeto.dentro_do_prazo)"
                >
                  <v-icon size="16">mdi-check-circle</v-icon>
                </div>
                <div
                  v-else
                  class="acao-badge"
                  :class="acaoClass(projeto.total_tarefas, projeto.tarefas_concluidas, projeto.dentro_do_prazo)"
                >
                  <span class="acao-dot" />
                  <span>{{ acaoLabel(projeto.total_tarefas, projeto.tarefas_concluidas, projeto.dentro_do_prazo) }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <span class="pagination-summary">
          Mostrando {{ primeiroItem }}-{{ ultimoItem }} de {{ totalProjetos }}
        </span>

        <div class="pagination-controls">
          <button
            class="pagination-button"
            :disabled="store.carregandoTabela || paginaAtual <= 1"
            type="button"
            @click="trocarPagina(paginaAtual - 1)"
          >
            Anterior
          </button>
          <span class="pagination-page">Página {{ paginaAtual }} de {{ totalPaginas }}</span>
          <button
            class="pagination-button"
            :disabled="store.carregandoTabela || paginaAtual >= totalPaginas"
            type="button"
            @click="trocarPagina(paginaAtual + 1)"
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { useProgramaStore } from '@/stores/programa'

  const store = useProgramaStore()
  const projetos = computed(() => store.tabelaProjetosItens)
  const totalProjetos = computed(() => store.tabelaProjetos?.count ?? 0)
  const paginaAtual = computed(() => store.tabelaProjetos?.page ?? 1)
  const totalPaginas = computed(() => store.tabelaProjetos?.total_pages ?? 1)
  const pageSize = computed(() => store.tabelaProjetos?.page_size ?? projetos.value.length)
  const primeiroItem = computed(() => {
    if (totalProjetos.value === 0) {
      return 0
    }
    return (paginaAtual.value - 1) * pageSize.value + 1
  })
  const ultimoItem = computed(() => {
    if (totalProjetos.value === 0) {
      return 0
    }
    return Math.min(paginaAtual.value * pageSize.value, totalProjetos.value)
  })

  async function trocarPagina (page: number) {
    if (!store.programaSelecionado || page < 1 || page > totalPaginas.value || page === paginaAtual.value) {
      return
    }

    await store.buscarTabelaProjetos(store.programaSelecionado.id, page)
  }

  function statusClass (status: string): string {
    const map: Record<string, string> = {
      'Planejamento': 'status-planejamento',
      'Em andamento': 'status-desenvolvimento',
      'Suspenso': 'status-suspenso',
      'Concluído': 'status-concluido',
    }
    return map[status] ?? 'status-default'
  }

  function formatarData (iso: string): string {
    const [year, month, day] = iso.split('-')
    return `${day}/${month}/${year}`
  }

  function acaoClass (totalTarefas: number, tarefasConcluidas: number, dentroDoPrazo: boolean): string {
    const todasConcluidas = totalTarefas > 0 && tarefasConcluidas === totalTarefas
    const nenhumaConcluida = tarefasConcluidas === 0

    if (todasConcluidas) {
      return dentroDoPrazo ? 'acao-verde' : 'acao-vermelho'
    }
    if (nenhumaConcluida) {
      return dentroDoPrazo ? 'acao-laranja' : 'acao-vermelho'
    }
    // parcialmente concluídas
    return dentroDoPrazo ? 'acao-amarelo' : 'acao-amarelo'
  }

  // returns null when there's nothing to do (show icon only)
  function acaoLabel (totalTarefas: number, tarefasConcluidas: number, dentroDoPrazo: boolean): string | null {
    const todasConcluidas = totalTarefas > 0 && tarefasConcluidas === totalTarefas

    if (todasConcluidas) {
      return null
    }
    const nenhumaConcluida = tarefasConcluidas === 0
    if (nenhumaConcluida) {
      return 'Priorizar'
    }
    // parcialmente concluídas
    return dentroDoPrazo ? 'Atenção' : 'Priorizar'
  }
</script>

<style scoped>
.projetos-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.projetos-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.projetos-table thead tr {
  background: #F9FAFB;
}

.projetos-table th {
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

.projetos-table td {
  padding: 10px 12px;
  color: #374151;
  vertical-align: middle;
}

.projeto-nome {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.projeto-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #6366F1;
  flex-shrink: 0;
}

/* Status badges */
.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.status-planejamento {
  background: #EEF2FF;
  color: #4338CA;
}

.status-desenvolvimento {
  background: #EFF6FF;
  color: #1D4ED8;
}

.status-concluido {
  background: #ECFDF5;
  color: #047857;
}

.status-atrasado {
  background: #FEF2F2;
  color: #B91C1C;
}

.status-suspenso {
  background: #FFF7ED;
  color: #C2410C;
}

.status-default {
  background: #F3F4F6;
  color: #4B5563;
}

/* Progress bar */
.tarefas-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 100px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #E5E7EB;
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #6366F1;
  border-radius: 999px;
  transition: width 0.3s ease;
}

.progress-label {
  font-size: 12px;
  color: #6B7280;
  min-width: 32px;
  text-align: right;
}

.table-wrapper--loading {
  opacity: 0.5;
  pointer-events: none;
}

.table-scroll {
  overflow-x: auto;
}

.acao-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.acao-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.acao-verde {
  background: #ECFDF5;
  color: #15803D;
}

.acao-verde .acao-dot {
  background: #22C55E;
}

.acao-amarelo {
  background: #FFFBEB;
  color: #B45309;
}

.acao-amarelo .acao-dot {
  background: #F59E0B;
}

.acao-laranja {
  background: #FFF7ED;
  color: #C2410C;
}

.acao-laranja .acao-dot {
  background: #F97316;
}

.acao-vermelho {
  background: #FEF2F2;
  color: #B91C1C;
}

.acao-vermelho .acao-dot {
  background: #EF4444;
}

.col-nome { min-width: 160px; }
.col-responsavel { min-width: 120px; }
.col-status { min-width: 140px; }
.col-horas { min-width: 90px }
.col-tarefas { min-width: 140px; }
.col-desvio { min-width: 90px; font-weight: 600; }
.col-data { min-width: 130px; }
.col-dias { min-width: 130px; }
.col-acao { min-width: 160px; }
</style>
