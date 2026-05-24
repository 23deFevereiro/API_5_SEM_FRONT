<template>
  <div class="main-card">
    <ProgramaSelector />

    <div class="charts-row">
      <BurnupHorasChart />
      <CustoTempoChart />
    </div>

    <div class="main-card__inner">
      <ProjetoSelector />
      <CustoCard />
    </div>

    <div class="filtros-secundarios">
      <FiltroPeriodoBotao :disabled="!projetoSelecionado" />
      <FuncionarioFilterSelector :disabled="!projetoSelecionado" />
      <MaterialFilterSelector :disabled="!projetoSelecionado" />

      <span v-if="!projetoSelecionado" class="filtros-hint">
        Selecione um projeto para habilitar os filtros
      </span>
    </div>

    <MateriaisTable />
    <HorasFuncionarioChart />
    <FuncionariosTable />
  </div>
</template>

<script lang="ts" setup>
  import { storeToRefs } from 'pinia'
  import { onMounted } from 'vue'
  import BurnupHorasChart from '@/components/BurnupHorasChart.vue'
  import CustoCard from '@/components/CustoCard.vue'
  import CustoTempoChart from '@/components/CustoTempoChart.vue'
  import FiltroPeriodoBotao from '@/components/FiltroPeriodoBotao.vue'
  import FuncionarioFilterSelector from '@/components/FuncionarioFilterSelector.vue'
  import FuncionariosTable from '@/components/FuncionariosTable.vue'
  import HorasFuncionarioChart from '@/components/HorasFuncionarioChart.vue'
  import MateriaisTable from '@/components/MateriaisTable.vue'
  import MaterialFilterSelector from '@/components/MaterialFilterSelector.vue'
  import ProgramaSelector from '@/components/ProgramaSelector.vue'
  import ProjetoSelector from '@/components/ProjetoSelector.vue'
  import { useProjetoStore } from '@/stores/projeto'

  const store = useProjetoStore()
  const { projetoSelecionado } = storeToRefs(store)

  onMounted(() => {
    store.init()
  })
</script>

<style scoped>
.main-card {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.main-card__inner {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.filtros-secundarios {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: #F9FAFB;
  border-radius: 10px;
}

.filtros-hint {
  font-size: 13px;
  color: #6B7280;
}

@media (max-width: 768px) {
  .charts-row {
    flex-direction: column;
  }

  .main-card__inner {
    flex-direction: column;
  }

  .filtros-secundarios {
    flex-direction: column;
    align-items: stretch;
  }
}
.charts-row {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

@media (max-width: 768px) {
  .main-card__inner {
    flex-direction: column;
  }

  .filtros-secundarios {
    flex-direction: column;
    align-items: stretch;
  }
}

</style>
