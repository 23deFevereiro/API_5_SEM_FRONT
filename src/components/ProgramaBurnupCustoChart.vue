<template>
  <BurnupChart
    :ao-montar="store.buscarBurnupCusto"
    bg-header="#D1FAE5"
    :carregando="carregandoBurnupCusto"
    cor-header="#10B981"
    cor-loading="#10B981"
    :dados="burnupCusto"
    :extrator-valor="extratorCusto"
    :formatar-valor="formatarMoeda"
    icone-header="mdi-currency-usd"
    icone-vazio="mdi-currency-usd-off"
    :programa-selecionado="programaSelecionado"
    texto-vazio="Nenhum registro de custo encontrado"
    titulo="Burnup de Custo por Programa"
    titulo-eixo-y="Custo acumulado (R$)"
  />
</template>

<script setup lang="ts">
  import { storeToRefs } from 'pinia'
  import { type BurnupCustoPonto, useProgramaStore } from '@/stores/programa'
  import BurnupChart from './BurnupChart.vue'

  const store = useProgramaStore()
  const { burnupCusto, programaSelecionado, carregandoBurnupCusto } = storeToRefs(store)

  const extratorCusto = (p: BurnupCustoPonto) => p.custo
  const formatarMoeda = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
</script>
