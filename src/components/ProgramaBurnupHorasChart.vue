<template>
  <BurnupChart
    :ao-montar="store.buscarBurnupHoras"
    bg-header="#DBEAFE"
    :carregando="carregandoBurnup"
    cor-header="#2563EB"
    cor-loading="#2563EB"
    :dados="burnupHoras"
    :extrator-valor="extratorHoras"
    :formatar-valor="formatarHoras"
    icone-header="mdi-chart-line"
    icone-vazio="mdi-chart-line"
    :programa-selecionado="programaSelecionado"
    texto-vazio="Nenhum registro de horas encontrado"
    titulo="Burnup de Horas por Programa"
    titulo-eixo-y="Horas acumuladas"
  />
</template>

<script setup lang="ts">
  import { storeToRefs } from 'pinia'
  import { type BurnupHorasPonto, useProgramaStore } from '@/stores/programa'
  import BurnupChart from './BurnupChart.vue'

  const store = useProgramaStore()
  const { burnupHoras, programaSelecionado, carregandoBurnup } = storeToRefs(store)

  const extratorHoras = (p: BurnupHorasPonto) => p.horas
  const formatarHoras = (v: number) => `${v.toFixed(1)}h`
</script>
