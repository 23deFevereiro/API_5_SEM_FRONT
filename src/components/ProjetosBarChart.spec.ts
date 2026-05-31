import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useProgramaStore } from '@/stores/programa'
import ProjetosBarChart from './ProjetosBarChart.vue'

vi.mock('chart.js', () => ({
  BarController: {},
  BarElement: {},
  CategoryScale: {},
  Chart: Object.assign(vi.fn(() => ({
    destroy: vi.fn(),
    getDatasetMeta: vi.fn(() => ({ data: [] })),
  })), { register: vi.fn() }),
  Legend: {},
  LinearScale: {},
  Tooltip: {},
}))

const globalStubs = {
  'v-icon': { template: '<i class="v-icon-stub"><slot /></i>' },
  'v-progress-circular': { template: '<span class="v-progress-circular-stub" />' },
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

describe('ProjetosBarChart — título', () => {
  it('exibe o título "Horas por Projeto"', () => {
    const wrapper = mount(ProjetosBarChart, { global: { stubs: globalStubs } })
    expect(wrapper.text()).toContain('Horas por Projeto')
  })
})

describe('ProjetosBarChart — empty state sem programa', () => {
  it('exibe mensagem de seleção quando nenhum programa está selecionado', () => {
    const wrapper = mount(ProjetosBarChart, { global: { stubs: globalStubs } })
    expect(wrapper.text()).toContain('Selecione um programa para ver as horas por projeto')
  })

  it('não exibe canvas quando nenhum programa está selecionado', () => {
    const wrapper = mount(ProjetosBarChart, { global: { stubs: globalStubs } })
    expect(wrapper.find('canvas').exists()).toBe(false)
  })
})

describe('ProjetosBarChart — estado de carregamento', () => {
  it('exibe spinner quando carregandoHorasProjeto é true', () => {
    const store = useProgramaStore()
    store.programaSelecionado = { id: 1, codigo_programa: 'P-1', nome_programa: 'Alpha' }
    store.carregandoHorasProjeto = true
    const wrapper = mount(ProjetosBarChart, { global: { stubs: globalStubs } })
    expect(wrapper.find('.v-progress-circular-stub').exists()).toBe(true)
  })

  it('exibe texto de carregamento quando carregandoHorasProjeto é true', () => {
    const store = useProgramaStore()
    store.programaSelecionado = { id: 1, codigo_programa: 'P-1', nome_programa: 'Alpha' }
    store.carregandoHorasProjeto = true
    const wrapper = mount(ProjetosBarChart, { global: { stubs: globalStubs } })
    expect(wrapper.text()).toContain('Carregando projetos...')
  })
})

describe('ProjetosBarChart — empty state após carregamento', () => {
  it('exibe mensagem de vazio quando horasPorProjeto está vazio e programa está selecionado', () => {
    const store = useProgramaStore()
    store.programaSelecionado = { id: 1, codigo_programa: 'P-1', nome_programa: 'Alpha' }
    store.carregandoHorasProjeto = false
    store.horasPorProjeto = []
    const wrapper = mount(ProjetosBarChart, { global: { stubs: globalStubs } })
    expect(wrapper.text()).toContain('Nenhum projeto encontrado para este programa')
  })

  it('não exibe canvas quando horasPorProjeto está vazio', () => {
    const store = useProgramaStore()
    store.programaSelecionado = { id: 1, codigo_programa: 'P-1', nome_programa: 'Alpha' }
    store.carregandoHorasProjeto = false
    store.horasPorProjeto = []
    const wrapper = mount(ProjetosBarChart, { global: { stubs: globalStubs } })
    expect(wrapper.find('canvas').exists()).toBe(false)
  })
})

describe('ProjetosBarChart — gráfico com dados', () => {
  it('exibe canvas quando há dados disponíveis', () => {
    const store = useProgramaStore()
    store.programaSelecionado = { id: 1, codigo_programa: 'P-1', nome_programa: 'Alpha' }
    store.carregandoHorasProjeto = false
    store.horasPorProjeto = [{ nome_projeto: 'Projeto A', horas_realizadas: 10 }]
    const wrapper = mount(ProjetosBarChart, { global: { stubs: globalStubs } })
    expect(wrapper.find('canvas').exists()).toBe(true)
  })

  it('não exibe mensagem de empty state quando há dados', () => {
    const store = useProgramaStore()
    store.programaSelecionado = { id: 1, codigo_programa: 'P-1', nome_programa: 'Alpha' }
    store.carregandoHorasProjeto = false
    store.horasPorProjeto = [{ nome_projeto: 'Projeto A', horas_realizadas: 10 }]
    const wrapper = mount(ProjetosBarChart, { global: { stubs: globalStubs } })
    expect(wrapper.text()).not.toContain('Selecione um programa')
    expect(wrapper.text()).not.toContain('Nenhum projeto encontrado')
  })
})
