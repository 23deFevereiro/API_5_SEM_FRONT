import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import ProgramaBurnupCustoChart from '../components/ProgramaBurnupCustoChart.vue'
import { useProgramaStore } from '../stores/programa'

const { ChartCtor, chartInstanceMock } = vi.hoisted(() => {
  const chartInstanceMock = {
    destroy: vi.fn(),
    update: vi.fn(),
    data: { datasets: [] as Array<{ label: string }> },
  }
  const ChartCtor = vi.fn(() => chartInstanceMock)
  return { ChartCtor, chartInstanceMock }
})

vi.mock('chart.js', () => ({
  Chart: Object.assign(ChartCtor, { register: vi.fn() }),
  CategoryScale: {},
  Legend: {},
  LinearScale: {},
  LineController: {},
  LineElement: {},
  PointElement: {},
  Tooltip: {},
}))

const globalStubs = {
  'v-icon': { template: '<i class="v-icon-stub"><slot /></i>' },
  'v-progress-circular': { template: '<span class="v-progress-circular-stub" />' },
}

const burnupMock = [
  {
    date_str: '01/2025',
    values: [
      { codigo_programa: 'PROG-1', nome_programa: 'Alpha', custo: 500 },
      { codigo_programa: 'PROG-2', nome_programa: 'Beta', custo: 200 },
    ],
  },
  {
    date_str: '02/2025',
    values: [
      { codigo_programa: 'PROG-1', nome_programa: 'Alpha', custo: 800 },
    ],
  },
]

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
  chartInstanceMock.data.datasets = []
})

describe('ProgramaBurnupCustoChart — estados visuais', () => {
  it('mostra estado de carregando quando burnupCusto é null', () => {
    const store = useProgramaStore()
    store.buscarBurnupCusto = vi.fn().mockResolvedValue(undefined)
    const wrapper = mount(ProgramaBurnupCustoChart, { global: { stubs: globalStubs } })
    expect(wrapper.text()).toContain('Carregando burnup')
    expect(wrapper.find('canvas').exists()).toBe(false)
  })

  it('mostra estado de carregando quando carregandoBurnupCusto é true', async () => {
    const store = useProgramaStore()
    store.burnupCusto = []
    store.carregandoBurnupCusto = true
    const wrapper = mount(ProgramaBurnupCustoChart, { global: { stubs: globalStubs } })
    await nextTick()
    expect(wrapper.text()).toContain('Carregando burnup')
  })

  it('mostra estado vazio quando burnupCusto é uma lista vazia', async () => {
    const store = useProgramaStore()
    store.buscarBurnupCusto = vi.fn().mockResolvedValue(undefined)
    store.burnupCusto = []
    const wrapper = mount(ProgramaBurnupCustoChart, { global: { stubs: globalStubs } })
    await nextTick()
    expect(wrapper.text()).toContain('Nenhum registro de custo encontrado')
    expect(wrapper.find('canvas').exists()).toBe(false)
  })

  it('renderiza o canvas quando há dados', async () => {
    const store = useProgramaStore()
    store.buscarBurnupCusto = vi.fn().mockResolvedValue(undefined)
    store.burnupCusto = burnupMock
    const wrapper = mount(ProgramaBurnupCustoChart, { global: { stubs: globalStubs } })
    await nextTick()
    expect(wrapper.find('canvas').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('Carregando burnup')
    expect(wrapper.text()).not.toContain('Nenhum registro')
  })
})

describe('ProgramaBurnupCustoChart — comportamento ao montar', () => {
  it('chama buscarBurnupCusto quando burnupCusto está null no mount', async () => {
    const store = useProgramaStore()
    const spy = vi.spyOn(store, 'buscarBurnupCusto').mockResolvedValue(undefined)
    mount(ProgramaBurnupCustoChart, { global: { stubs: globalStubs } })
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('não chama buscarBurnupCusto se já houver dados em cache', async () => {
    const store = useProgramaStore()
    store.burnupCusto = burnupMock
    const spy = vi.spyOn(store, 'buscarBurnupCusto').mockResolvedValue(undefined)
    mount(ProgramaBurnupCustoChart, { global: { stubs: globalStubs } })
    await nextTick()
    expect(spy).not.toHaveBeenCalled()
  })

  it('não chama buscarBurnupCusto se cache estiver vazio mas não-null', async () => {
    const store = useProgramaStore()
    store.burnupCusto = []
    const spy = vi.spyOn(store, 'buscarBurnupCusto').mockResolvedValue(undefined)
    mount(ProgramaBurnupCustoChart, { global: { stubs: globalStubs } })
    await nextTick()
    expect(spy).not.toHaveBeenCalled()
  })

  it('reconstrói o gráfico imediatamente quando há dados em cache no mount', async () => {
    const store = useProgramaStore()
    store.burnupCusto = burnupMock
    mount(ProgramaBurnupCustoChart, { global: { stubs: globalStubs } })
    await nextTick()
    await nextTick()
    expect(ChartCtor).toHaveBeenCalled()
  })
})

describe('ProgramaBurnupCustoChart — ciclo de vida', () => {
  it('destrói a instância do Chart no unmount', async () => {
    const store = useProgramaStore()
    store.burnupCusto = burnupMock
    const wrapper = mount(ProgramaBurnupCustoChart, { global: { stubs: globalStubs } })
    await nextTick()
    await nextTick()
    wrapper.unmount()
    expect(chartInstanceMock.destroy).toHaveBeenCalled()
  })

  it('reage a mudanças em burnupCusto reconstruindo o gráfico', async () => {
    const store = useProgramaStore()
    store.buscarBurnupCusto = vi.fn().mockResolvedValue(undefined)
    store.burnupCusto = []
    mount(ProgramaBurnupCustoChart, { global: { stubs: globalStubs } })
    await nextTick()
    const chamadasAntes = ChartCtor.mock.calls.length
    store.burnupCusto = burnupMock
    // o watch tem um await nextTick() interno antes de chamar buildChart;
    // por isso precisamos de dois ticks para a chamada do Chart materializar
    await nextTick()
    await nextTick()
    expect(ChartCtor.mock.calls.length).toBeGreaterThan(chamadasAntes)
  })

  it('destrói o gráfico quando burnupCusto vira lista vazia', async () => {
    const store = useProgramaStore()
    store.burnupCusto = burnupMock
    mount(ProgramaBurnupCustoChart, { global: { stubs: globalStubs } })
    await nextTick()
    await nextTick()
    chartInstanceMock.destroy.mockClear()
    store.burnupCusto = []
    await nextTick()
    expect(chartInstanceMock.destroy).toHaveBeenCalled()
  })
})

describe('ProgramaBurnupCustoChart — realce do programa selecionado', () => {
  it('chama update do Chart quando programaSelecionado muda', async () => {
    const store = useProgramaStore()
    store.burnupCusto = burnupMock
    mount(ProgramaBurnupCustoChart, { global: { stubs: globalStubs } })
    await nextTick()
    await nextTick()
    chartInstanceMock.update.mockClear()
    chartInstanceMock.data.datasets = [
      { label: 'PROG-1' } as { label: string },
      { label: 'PROG-2' } as { label: string },
    ]
    store.programaSelecionado = { id: 1, codigo_programa: 'PROG-1', nome_programa: 'Alpha' }
    await nextTick()
    expect(chartInstanceMock.update).toHaveBeenCalled()
  })
})
