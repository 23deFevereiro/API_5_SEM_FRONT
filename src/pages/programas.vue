<template>
  <div class="main-card">
    <ProgramaBurnupChart />
    <div class="main-card__inner">
      <ProgramaSelector />
      <ProgramaCards />
    </div>
    <div class="main-card__charts">
      <ProgramaDonutChart />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import ProgramaBurnupChart from '@/components/ProgramaBurnupChart.vue'
  import ProgramaCards from '@/components/ProgramaCards.vue'
  import ProgramaDonutChart from '@/components/ProgramaDonutChart.vue'
  import ProgramaSelector from '@/components/ProgramaSelector.vue'
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

.main-card__charts {
  display: flex;
  flex-direction: row;
  gap: 24px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .main-card__inner {
    flex-direction: column;
  }

  .main-card__charts {
    flex-direction: column;
  }
}
</style>
