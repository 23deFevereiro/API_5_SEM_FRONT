<template>
  <BurnupChart
    bg-header="#EEF2FF"
    :carregando="store.carregandoBurnup"
    :codigos-selecionados="codigosSelecionados"
    cor-header="#6366F1"
    cor-loading="#6366F1"
    :dados="pivotado"
    :extrator-chave="extratorChave"
    :extrator-valor="extratorValor"
    :formatar-valor="formatarHoras"
    icone-header="mdi-chart-line"
    icone-vazio="mdi-chart-line"
    texto-vazio="Nenhum registro de horas encontrado"
    titulo="Burnup de Horas por Projeto"
    titulo-eixo-y="Horas acumuladas"
  />
</template>

<script setup lang="ts">
  import { storeToRefs } from 'pinia'
  import { computed } from 'vue'
  import { useProgramaStore } from '@/stores/programa'
  import { useProjetoStore } from '@/stores/projeto'
  import BurnupChart from './BurnupChart.vue'

  const store = useProjetoStore()
  const { programaSelecionado } = storeToRefs(useProgramaStore())

  const codigosSelecionados = computed(() =>
    programaSelecionado.value
      ? store.projetos.map(p => p.codigo_projeto)
      : null,
  )

  type PivotPonto = { codigo_projeto: string, horas_acumuladas: number }

  const pivotado = computed(() => {
    if (store.burnupHoras.length === 0) return []
    const mesesSet = new Set(store.burnupHoras.flatMap(p => p.serie.map(pt => pt.mes)))
    // eslint-disable-next-line unicorn/no-array-sort
    const meses = [...mesesSet].sort((a: string, b: string) => {
      const [ma, ya] = a.split('/').map(Number)
      const [mb, yb] = b.split('/').map(Number)
      return ya === yb ? ma - mb : ya - yb
    })
    return meses.map((mes: string) => ({
      date_str: mes,
      values: store.burnupHoras
        .map(p => {
          const ponto = p.serie.find(pt => pt.mes === mes)
          return ponto ? { codigo_projeto: p.projeto, horas_acumuladas: ponto.horas_acumuladas } : null
        })
        .filter(Boolean) as PivotPonto[],
    }))
  })

  const extratorChave = (p: PivotPonto) => p.codigo_projeto
  const extratorValor = (p: PivotPonto) => p.horas_acumuladas
  const formatarHoras = (v: number) => `${v.toFixed(1)}h`
</script>
