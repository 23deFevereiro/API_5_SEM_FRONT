<template>
  <v-app>
    <!-- Mobile app bar -->
    <v-app-bar v-if="mobile" color="#1E293B" density="compact" flat>
      <v-app-bar-nav-icon color="white" @click="drawer = !drawer" />
      <v-app-bar-title class="text-white">{{ currentPageTitle }}</v-app-bar-title>
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawer"
      color="#1E293B"
      dark
      :rail="!mobile && rail"
      :temporary="mobile"
    >
      <div class="sidebar-header">
        <v-icon v-if="!rail || mobile" class="mr-2" color="white" size="28">mdi-chart-box-outline</v-icon>
        <span v-if="!rail || mobile" class="sidebar-title">Lunae</span>

        <v-btn
          v-if="!mobile"
          color="white"
          :icon="rail ? 'mdi-chevron-right' : 'mdi-chevron-left'"
          size="small"
          variant="text"
          @click="rail = !rail"
        />
      </div>

      <v-divider class="mb-2" color="rgba(255,255,255,0.12)" />

      <v-list density="compact" nav>
        <v-list-item
          v-for="item in menuItems"
          :key="item.route"
          class="sidebar-item"
          color="white"
          :prepend-icon="item.icon"
          rounded="lg"
          :title="item.title"
          :to="item.route"
          @click="mobile && (drawer = false)"
        />
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-progress-linear
        v-if="isLoading"
        class="global-loader"
        color="primary"
        height="3"
        indeterminate
      />

      <div class="page-shell">
        <h1 v-if="!mobile" class="page-title">{{ currentPageTitle }}</h1>
        <router-view />
      </div>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
  import {
    BarController,
    BarElement,
    CategoryScale,
    Chart,
    Legend,
    LinearScale,
    LineController,
    LineElement,
    PointElement,
    Tooltip,
  } from 'chart.js'
  import { computed, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import { useDisplay } from 'vuetify'
  import { useProjetoStore } from '@/stores/projeto'

  Chart.register(LineController, LineElement, PointElement, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

  const { mobile } = useDisplay()
  const projetoStore = useProjetoStore()

  const drawer = ref(true)
  const rail = ref(false)
  const route = useRoute()

  const menuItems = [
    { title: 'Programas', icon: 'mdi-folder-multiple-outline', route: '/programas' },
    { title: 'Projetos', icon: 'mdi-clipboard-text-outline', route: '/projetos' },
    { title: 'Planejamento', icon: 'mdi-calendar-check-outline', route: '/planejamento' },
  ]

  const currentPageTitle = computed(() => {
    const item = menuItems.find(i => route.path.startsWith(i.route))
    return item?.title ?? ''
  })

  const isLoading = computed(() => projetoStore.isLoading)
</script>

<style scoped>
.sidebar-header {
  display: flex;
  align-items: center;
  padding: 16px 12px;
  min-height: 56px;
}

.sidebar-title {
  color: white;
  font-size: 1.15rem;
  font-weight: 600;
  flex: 1;
}

.sidebar-item {
  margin-bottom: 2px;
}

.global-loader {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1100;
}

.page-shell {
  padding: 24px 32px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1E293B;
  margin-bottom: 20px;
}

@media (max-width: 960px) {
  .page-shell {
    padding: 16px;
  }
}
</style>
