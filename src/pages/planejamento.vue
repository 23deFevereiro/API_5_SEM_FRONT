<template>
  <div class="page-placeholder">
    <v-icon size="64" color="#9CA3AF">mdi-calendar-check-outline</v-icon>
    <p class="page-placeholder__text">Em breve</p>
  </div>
</template>

<style scoped>
.page-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
}

.page-placeholder__text {
  color: #9CA3AF;
  font-size: 1.1rem;
}
</style>
