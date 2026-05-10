import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.vue'
import { useProjetoStore } from '@/stores/projeto'

const { appState } = vi.hoisted(() => ({
  appState: {
    mobile: false,
    path: '/programas',
  },
}))

vi.mock('chart.js', () => ({
  BarController: {},
  BarElement: {},
  CategoryScale: {},
  Chart: { register: vi.fn() },
  Legend: {},
  LinearScale: {},
  LineController: {},
  LineElement: {},
  PointElement: {},
  Tooltip: {},
}))

vi.mock('vue-router', () => ({
  useRoute: () => ({ path: appState.path }),
}))

vi.mock('vuetify', () => ({
  useDisplay: () => ({ mobile: appState.mobile }),
}))

const globalStubs = {
  'router-view': { template: '<div class="router-view-stub" />' },
  'v-app': { template: '<div class="v-app-stub"><slot /></div>' },
  'v-app-bar': { template: '<header class="v-app-bar-stub"><slot /></header>' },
  'v-app-bar-nav-icon': { template: '<button class="v-app-bar-nav-icon-stub" @click="$emit(\'click\')" />' },
  'v-app-bar-title': { template: '<div class="v-app-bar-title-stub"><slot /></div>' },
  'v-btn': { props: ['icon'], template: '<button class="v-btn-stub"><slot />{{ icon }}</button>' },
  'v-divider': { template: '<hr class="v-divider-stub">' },
  'v-list': { template: '<div class="v-list-stub"><slot /></div>' },
  'v-list-item': { props: ['title'], template: '<div class="v-list-item-stub">{{ title }}</div>' },
  'v-main': { template: '<main class="v-main-stub"><slot /></main>' },
  'v-navigation-drawer': { template: '<aside class="v-navigation-drawer-stub"><slot /></aside>' },
  'v-progress-linear': { template: '<div class="v-progress-linear-stub" />' },
  'v-icon': { template: '<i class="v-icon-stub"><slot /></i>' },
}

beforeEach(() => {
  setActivePinia(createPinia())
  appState.mobile = false
  appState.path = '/programas'
})

describe('App', () => {
  it('renderiza o título e o menu no desktop', () => {
    const wrapper = mount(App, {
      global: {
        stubs: globalStubs,
      },
    })

    expect(wrapper.text()).toContain('Programas')
    expect(wrapper.text()).toContain('Projetos')
    expect(wrapper.text()).toContain('Planejamento')
    expect(wrapper.find('.page-title').text()).toBe('Programas')
  })

  it('renderiza a app bar mobile e o loader global quando a store está carregando', () => {
    const store = useProjetoStore()
    store.carregando = true
    appState.mobile = true
    appState.path = '/projetos'

    const wrapper = mount(App, {
      global: {
        stubs: globalStubs,
      },
    })

    expect(wrapper.find('.v-app-bar-stub').exists()).toBe(true)
    expect(wrapper.find('.v-progress-linear-stub').exists()).toBe(true)
    expect(wrapper.text()).toContain('Projetos')
  })

  it('alterna o drawer ao clicar no nav icon mobile', async () => {
    appState.mobile = true

    const wrapper = mount(App, {
      global: {
        stubs: globalStubs,
      },
    })

    const navIcon = wrapper.find('.v-app-bar-nav-icon-stub')
    expect(navIcon.exists()).toBe(true)
    await navIcon.trigger('click')
    expect(wrapper.find('.v-navigation-drawer-stub').exists()).toBe(true)
  })

  it('alterna o rail ao clicar no botão do desktop', async () => {
    appState.mobile = false

    const wrapper = mount(App, {
      global: {
        stubs: globalStubs,
      },
    })

    const btns = wrapper.findAll('.v-btn-stub')
    const railBtn = btns.find(b => b.text().includes('mdi-chevron-left') || b.text().includes('mdi-chevron-right'))
    expect(railBtn).toBeTruthy()
    await railBtn!.trigger('click')
    expect(wrapper.find('.v-navigation-drawer-stub').exists()).toBe(true)
  })

  it('fecha o drawer ao clicar num item do menu no mobile', async () => {
    appState.mobile = true

    const wrapper = mount(App, {
      global: {
        stubs: globalStubs,
      },
    })

    const menuItem = wrapper.find('.v-list-item-stub')
    await menuItem.trigger('click')
    expect(wrapper.find('.v-navigation-drawer-stub').exists()).toBe(true)
  })
})
