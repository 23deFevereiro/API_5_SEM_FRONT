<template>
  <BurnupChart
    bg-header="#D1FAE5"
    :carregando="!overviewData"
    :codigos-selecionados="codigosSelecionados"
    cor-header="#10B981"
    cor-loading="#10B981"
    :dados="overviewData"
    :extrator-chave="extratorChave"
    :extrator-valor="extratorValor"
    :formatar-valor="formatarMoeda"
    icone-header="mdi-currency-usd"
    icone-vazio="mdi-currency-usd-off"
    texto-vazio="Nenhum registro de custo encontrado"
    titulo="Burnup de Custo por Projeto"
    titulo-eixo-y="Custo (R$)"
  />
</template>

<script setup lang="ts">
  import { storeToRefs } from 'pinia'
  import { computed } from 'vue'
  import { useProgramaStore } from '@/stores/programa'
  import { useProjetoStore } from '@/stores/projeto'
  import BurnupChart from './BurnupChart.vue'

  const store = useProjetoStore()
  const { overviewData } = storeToRefs(store)
  const { programaSelecionado } = storeToRefs(useProgramaStore())

  const codigosSelecionados = computed(() =>
    programaSelecionado.value
      ? store.projetos.map(p => p.codigo_projeto)
      : null,
  )

  type CustoItem = { codigo_projeto: string, cost: number }

  const extratorChave = (v: CustoItem) => v.codigo_projeto
  const extratorValor = (v: CustoItem) => v.cost
  const formatarMoeda = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
</script>
