<template>
  <div class="page-bg">
    <div class="main-card">
      <div class="main-card__inner">
        <ProjetoSelector />
        <CustoCard />
      </div>

      <MateriaisTable />
      <FuncionariosTable />
    </div>
  </div>
</template>

<script lang="ts" setup>
import ProjetoSelector from '@/components/ProjetoSelector.vue'
import CustoCard from '@/components/CustoCard.vue'
import MateriaisTable from '@/components/MateriaisTable.vue'
import FuncionariosTable from '@/components/FuncionariosTable.vue'
</script>

<style scoped>
.page-bg {
  background: #F5F6F8;
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 32px 16px;
}

.main-card {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  max-width: 1100px;
  width: 100%;
}

.main-card__inner {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 24px;
}
</style>