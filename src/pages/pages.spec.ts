import { mount, shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import IndexPage from './index.vue'
import NotFoundPage from './[...path].vue'
import PlanejamentoPage from './planejamento.vue'
import ProgramasPage from './programas.vue'
import ProjetosPage from './projetos.vue'
import { useAppStore } from '@/stores/app'
import { useProjetoStore } from '@/stores/projeto'

const { replaceSpy } = vi.hoisted(() => ({
  replaceSpy: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ replace: replaceSpy }),
}))

const globalStubs = {
  BurnupHorasChart: { template: '<div class="burnup-horas-chart-stub" />' },
  CustoCard: { template: '<div class="custo-card-stub" />' },
  CustoTempoChart: { template: '<div class="custo-tempo-chart-stub" />' },
  FiltroPeriodoBotao: { props: ['disabled'], template: '<div class="filtro-periodo-stub" :data-disabled="disabled" />' },
  FuncionarioFilterSelector: { props: ['disabled'], template: '<div class="funcionario-filter-stub" :data-disabled="disabled" />' },
  FuncionariosTable: { template: '<div class="funcionarios-table-stub" />' },
  HorasFuncionarioChart: { template: '<div class="horas-funcionario-chart-stub" />' },
  LeadTimeChart: { template: '<div class="lead-time-chart-stub" />' },
  MateriaisAtencaoCard: { template: '<div class="materiais-atencao-card-stub" />' },
  MateriaisCriticosCard: { template: '<div class="materiais-criticos-card-stub" />' },
  MaterialFilterSelector: { props: ['disabled'], template: '<div class="material-filter-stub" :data-disabled="disabled" />' },
  MaterialSelector: { template: '<div class="material-selector-stub" />' },
  MateriaisTable: { template: '<div class="materiais-table-stub" />' },
  ProgramaBurnupCustoChart: { template: '<div class="programa-burnup-custo-chart-stub" />' },
  ProgramaBurnupHorasChart: { template: '<div class="programa-burnup-horas-chart-stub" />' },
  ProgramaCards: { template: '<div class="programa-cards-stub" />' },
  ProgramaDonutChart: { template: '<div class="programa-donut-chart-stub" />' },
  ProgramaSelector: { template: '<div class="programa-selector-stub" />' },
  ProjetoSelector: { template: '<div class="projeto-selector-stub" />' },
  ProjetosTable: { template: '<div class="projetos-table-stub" />' },
  'v-btn': { props: ['to'], template: '<button class="v-btn-stub">{{ to }}<slot /></button>' },
  'v-icon': { template: '<i class="v-icon-stub"><slot /></i>' },
}

beforeEach(() => {
  setActivePinia(createPinia())
  replaceSpy.mockReset()
})

describe('pages coverage', () => {
  it('redireciona a página inicial para /programas', () => {
    mount(IndexPage)
    expect(replaceSpy).toHaveBeenCalledWith('/programas')
  })

  it('renderiza a página de programas com seus blocos principais', () => {
    const wrapper = shallowMount(ProgramasPage, {
      global: {
        stubs: globalStubs,
      },
    })

    expect(wrapper.find('.programa-burnup-horas-chart-stub').exists()).toBe(true)
    expect(wrapper.find('.programa-burnup-custo-chart-stub').exists()).toBe(true)
    expect(wrapper.find('.programa-selector-stub').exists()).toBe(true)
    expect(wrapper.find('.projetos-table-stub').exists()).toBe(true)
  })

  it('inicializa a página de projetos e mantém filtros desabilitados sem projeto selecionado', () => {
    const store = useProjetoStore()
    store.init = vi.fn()

    const wrapper = shallowMount(ProjetosPage, {
      global: {
        stubs: globalStubs,
      },
    })

    expect(store.init).toHaveBeenCalled()
    expect(wrapper.text()).toContain('Selecione um projeto para habilitar os filtros')
    expect(wrapper.find('.filtro-periodo-stub').attributes('data-disabled')).toBe('true')
    expect(wrapper.find('.funcionario-filter-stub').attributes('data-disabled')).toBe('true')
    expect(wrapper.find('.material-filter-stub').attributes('data-disabled')).toBe('true')
  })

  it('habilita os filtros da página de projetos quando existe projeto selecionado', () => {
    const store = useProjetoStore()
    store.init = vi.fn()
    store.projetoSelecionado = { id: 1, codigo_projeto: 'P001', nome_projeto: 'Conversor' }

    const wrapper = shallowMount(ProjetosPage, {
      global: {
        stubs: globalStubs,
      },
    })

    expect(wrapper.text()).not.toContain('Selecione um projeto para habilitar os filtros')
    expect(wrapper.find('.filtro-periodo-stub').attributes('data-disabled')).toBe('false')
    expect(wrapper.find('.funcionario-filter-stub').attributes('data-disabled')).toBe('false')
    expect(wrapper.find('.material-filter-stub').attributes('data-disabled')).toBe('false')
  })

  it('renderiza as páginas de planejamento e não encontrado', () => {
    const planejamentoWrapper = mount(PlanejamentoPage, {
      global: {
        stubs: globalStubs,
      },
    })
    const notFoundWrapper = mount(NotFoundPage, {
      global: {
        stubs: globalStubs,
      },
    })

    expect(planejamentoWrapper.find('.main-card').exists()).toBe(true)
    expect(notFoundWrapper.text()).toContain('404')
    expect(notFoundWrapper.text()).toContain('Página não encontrada')
    expect(notFoundWrapper.text()).toContain('/programas')
  })

  it('cria a app store', () => {
    const store = useAppStore()
    expect(store.$id).toBe('app')
  })
})
