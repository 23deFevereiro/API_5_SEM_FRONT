<template>
  <div class="main-card">
    <ProgramaSelector />
    <CustoTempoChart />
    <div class="main-card__inner">
      <ProjetoSelector />
      <CustoCard />
    </div>
    <MateriaisTable />
    <HorasFuncionarioChart />
    <FuncionariosTable />
  </div>
</template>

<script lang="ts" setup>
  import { onMounted } from 'vue'
  import CustoCard from '@/components/CustoCard.vue'
  import CustoTempoChart from '@/components/CustoTempoChart.vue'
  import FuncionariosTable from '@/components/FuncionariosTable.vue'
  import HorasFuncionarioChart from '@/components/HorasFuncionarioChart.vue'
  import MateriaisTable from '@/components/MateriaisTable.vue'
  import ProgramaSelector from '@/components/ProgramaSelector.vue'
  import ProjetoSelector from '@/components/ProjetoSelector.vue'
  import { useProjetoStore } from '@/stores/projeto'

  onMounted(() => {
    useProjetoStore().init()
  })
</script>

<style scoped>
.main-card {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  width: 100%;
}

.main-card__inner {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .main-card__inner {
    flex-direction: column;
  }
}
</style>
