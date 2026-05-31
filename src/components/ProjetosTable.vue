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

    <div class="content-area">
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
                <th class="col-nome col-sortable" @click="ordenar('nome_projeto')">
                  Nome do Projeto <span class="sort-icon">{{ sortIcon('nome_projeto') }}</span>
                </th>

                <th class="col-responsavel col-sortable" @click="ordenar('responsavel')">
                  Responsável <span class="sort-icon">{{ sortIcon('responsavel') }}</span>
                </th>

                <th class="col-status col-sortable" @click="ordenar('status')">
                  Status <span class="sort-icon">{{ sortIcon('status') }}</span>
                </th>

                <th class="col-horas">Horas Est.</th>
                <th class="col-horas">Horas Real.</th>
                <th class="col-tarefas">Tarefas Conc. (%)</th>
                <th class="col-desvio">Desvio (h)</th>
                <th class="col-data">Última Atividade</th>
                <th class="col-dias">Dias Inativo</th>

                <th class="col-situacao col-sortable" @click="ordenar('situacao')">
                  Situação <span class="sort-icon">{{ sortIcon('situacao') }}</span>
                </th>
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

                    <v-tooltip v-if="projeto.sem_horas_registradas" content-class="tooltip-sem-horas" location="top">
                      <template #activator="{ props: tooltipProps }">
                        <v-icon v-bind="tooltipProps" color="#F59E0B" size="14">mdi-alert-circle-outline</v-icon>
                      </template>
                      Existem tarefas, mas as horas não foram registradas
                    </v-tooltip>
                  </div>
                </td>

                <td class="col-desvio">
                  {{ projeto.desvio_horas > 0 ? '+' : '' }}{{ projeto.desvio_horas.toFixed(1) }}h
                </td>

                <td class="col-data">{{ projeto.data_ultima_atividade ? formatarData(projeto.data_ultima_atividade) : '—' }}</td>
                <td class="col-dias">{{ projeto.dias_desde_ultima_atividade !== null ? projeto.dias_desde_ultima_atividade + 'd' : '—' }}</td>

                <td class="col-situacao">
                  <v-tooltip content-class="tooltip-sem-horas" location="top">
                    <template #activator="{ props: tooltipProps }">
                      <span v-bind="tooltipProps" class="situacao-badge" :class="situacaoBadgeClass(projeto.situacao)">
                        <v-icon :color="situacaoColor(projeto.situacao)" size="20">{{ situacaoIcon(projeto.situacao) }}</v-icon>
                      </span>
                    </template>
                    {{ situacaoLabel(projeto.situacao) }}
                  </v-tooltip>
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

        <div class="situacao-legenda">
          <span class="legenda-titulo">Legenda — Situação:</span>

          <span v-for="item in legendaSituacao" :key="item.situacao" class="legenda-item">
            <v-icon :color="item.color" size="14">{{ item.icon }}</v-icon>
            <span>{{ item.label }}</span>
          </span>
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

  async function ordenar (campo: string) {
    if (!store.programaSelecionado) return
    const novaDir = store.tabelaSortBy === campo && store.tabelaSortDir === 'asc' ? 'desc' : 'asc'
    await store.buscarTabelaProjetos(store.programaSelecionado.id, 1, campo, novaDir)
  }

  function sortIcon (campo: string): string {
    if (store.tabelaSortBy !== campo) return '⇅'
    return store.tabelaSortDir === 'asc' ? '↑' : '↓'
  }

  const SITUACAO_CONFIG: Record<string, { icon: string, color: string, bgClass: string, label: string }> = {
    'priorizar-vermelho': { icon: 'mdi-alert-circle', color: '#B91C1C', bgClass: 'situacao-vermelho', label: 'Em andamento, fora do prazo' },
    'priorizar-verde': { icon: 'mdi-clock-outline', color: '#15803D', bgClass: 'situacao-verde', label: 'Em andamento, dentro do prazo' },
    'corrigir-status': { icon: 'mdi-pencil-circle-outline', color: '#C2410C', bgClass: 'situacao-laranja', label: 'Status desatualizado' },
    'check-vermelho': { icon: 'mdi-check-circle', color: '#B91C1C', bgClass: 'situacao-vermelho', label: 'Concluído fora do prazo' },
    'check-amarelo': { icon: 'mdi-check-circle', color: '#B45309', bgClass: 'situacao-amarelo', label: 'Concluído, parte fora do prazo' },
    'check-verde': { icon: 'mdi-check-circle', color: '#15803D', bgClass: 'situacao-verde', label: 'Concluído no prazo' },
    'suspenso': { icon: 'mdi-pause-circle-outline', color: '#6B7280', bgClass: 'situacao-neutro', label: 'Suspenso' },
    'outro': { icon: 'mdi-help-circle-outline', color: '#3730A3', bgClass: 'situacao-azul', label: 'Situação indeterminada' },
  }

  const legendaSituacao = Object.entries(SITUACAO_CONFIG).map(([situacao, cfg]) => ({ situacao, ...cfg }))

  function situacaoIcon (situacao: string): string {
    return SITUACAO_CONFIG[situacao]?.icon ?? 'mdi-help-circle-outline'
  }

  function situacaoColor (situacao: string): string {
    return SITUACAO_CONFIG[situacao]?.color ?? '#3730A3'
  }

  function situacaoBadgeClass (situacao: string): string {
    return SITUACAO_CONFIG[situacao]?.bgClass ?? 'situacao-azul'
  }

  function situacaoLabel (situacao: string): string {
    return SITUACAO_CONFIG[situacao]?.label ?? 'Situação indeterminada'
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
</script>

<style scoped>
.table-wrapper {
  flex: 1;
}

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

.tarefas-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 100px;
}

.progress-bar {
  width: 60px;
  flex-shrink: 0;
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

.situacao-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: default;
}

.situacao-verde    { background: #ECFDF5; }
.situacao-amarelo  { background: #FFFBEB; }
.situacao-laranja  { background: #FFF7ED; }
.situacao-vermelho { background: #FEF2F2; }
.situacao-neutro   { background: #F3F4F6; }
.situacao-azul     { background: #EEF2FF; }

.situacao-legenda {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 16px;
  padding: 10px 12px;
  border-top: 1px solid #E5E7EB;
  background: #F9FAFB;
  border-radius: 0 0 8px 8px;
  font-size: 11px;
  color: #6B7280;
}

.legenda-titulo {
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
}

.legenda-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.col-nome { min-width: 160px; }
.col-responsavel { min-width: 120px; }
.col-status { min-width: 140px; }
.col-horas { min-width: 90px }
.col-tarefas { min-width: 140px; }
.col-desvio { min-width: 90px; font-weight: 600; }
.col-data { min-width: 130px; }
.col-dias { min-width: 130px; }
.col-situacao { min-width: 80px; text-align: center; }

:deep(.tooltip-sem-horas) {
  background: #1F2937 !important;
  color: #F9FAFB !important;
  font-size: 12px;
}
</style>
