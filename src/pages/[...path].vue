<template>
  <div class="not-found">
    <v-icon color="#9CA3AF" size="80">mdi-alert-circle-outline</v-icon>
    <h2 class="not-found__code">404</h2>
    <p class="not-found__text">Página não encontrada</p>
    <v-btn
      class="mt-4"
      color="primary"
      prepend-icon="mdi-arrow-left"
      to="/programas"
      variant="flat"
    >
      Voltar ao início
    </v-btn>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 8px;
}

.not-found__code {
  font-size: 3rem;
  font-weight: 800;
  color: #374151;
  margin-top: 8px;
}

.not-found__text {
  color: #9CA3AF;
  font-size: 1.1rem;
}
</style>
