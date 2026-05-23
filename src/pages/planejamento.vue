<template>
  <div class="main-card">
    <div class="main-card__alertas">
      <MateriaisCriticosCard />
      <MateriaisAtencaoCard />
      <ProximaCompraCard />
    </div>

    <div class="main-card__inner">
      <MaterialSelector />
    </div>

    <EstoqueMaterialTable />

    <div class="main-card__charts">
      <LeadTimeChart />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import EstoqueMaterialTable from '@/components/EstoqueMaterialTable.vue'
  import LeadTimeChart from '@/components/LeadTimeChart.vue'
  import MateriaisAtencaoCard from '@/components/MateriaisAtencaoCard.vue'
  import MateriaisCriticosCard from '@/components/MateriaisCriticosCard.vue'
  import MaterialSelector from '@/components/MaterialSelector.vue'
  import ProximaCompraCard from '@/components/ProximaCompraCard.vue'
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

.main-card__alertas {
  display: flex;
  gap: 16px;
  align-items: stretch;
}

.main-card__inner {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.main-card__charts {
  display: flex;
  gap: 24px;
}

@media (max-width: 768px) {
  .main-card__alertas {
    flex-direction: column;
  }

  .main-card__inner {
    flex-direction: column;
  }

  .main-card__charts {
    flex-direction: column;
  }
}
</style>
