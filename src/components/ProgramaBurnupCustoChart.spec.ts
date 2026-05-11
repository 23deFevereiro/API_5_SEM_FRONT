import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import ProgramaBurnupCustoChart from './ProgramaBurnupCustoChart.vue'
import { useProgramaStore } from '@/stores/programa'

vi.mock('chart.js', () => {
  const chartInstanceMock = {
    destroy: vi.fn(),
    update: vi.fn(),
    data: { datasets: [] as Array<{ label: string }> },
  }
  return {
    Chart: Object.assign(vi.fn(() => chartInstanceMock), { register: vi.fn() }),
    CategoryScale: {},
    Legend: {},
    LinearScale: {},
    LineController: {},
    LineElement: {},
    PointElement: {},
    Tooltip: {},
  }
})

const globalStubs = {
  'v-icon': { template: '<i class="v-icon-stub"><slot /></i>' },
  'v-progress-circular': { template: '<span class="v-progress-circular-stub" />' },
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

describe('ProgramaBurnupCustoChart — integração com o store', () => {
  it('exibe título de custo', () => {
    const store = useProgramaStore()
    store.buscarBurnupCusto = vi.fn().mockResolvedValue(undefined)
    const wrapper = mount(ProgramaBurnupCustoChart, { global: { stubs: globalStubs } })
    expect(wrapper.text()).toContain('Burnup de Custo por Programa')
  })

  it('chama buscarBurnupCusto no mount quando burnupCusto é null', async () => {
    const store = useProgramaStore()
    const spy = vi.spyOn(store, 'buscarBurnupCusto').mockResolvedValue(undefined)
    mount(ProgramaBurnupCustoChart, { global: { stubs: globalStubs } })
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('exibe estado vazio quando burnupCusto é uma lista vazia', async () => {
    const store = useProgramaStore()
    store.burnupCusto = []
    const wrapper = mount(ProgramaBurnupCustoChart, { global: { stubs: globalStubs } })
    await nextTick()
    expect(wrapper.text()).toContain('Nenhum registro de custo encontrado')
  })

  it('renderiza o canvas quando há dados em cache', async () => {
    const store = useProgramaStore()
    store.burnupCusto = [
      {
        date_str: '01/2025',
        values: [{ codigo_programa: 'PROG-1', nome_programa: 'Alpha', custo: 100 }],
      },
    ]
    const wrapper = mount(ProgramaBurnupCustoChart, { global: { stubs: globalStubs } })
    await nextTick()
    expect(wrapper.find('canvas').exists()).toBe(true)
  })

  it('destaca o programa selecionado passando codigosSelecionados não-nulo', async () => {
    const store = useProgramaStore()
    store.burnupCusto = [
      {
        date_str: '01/2025',
        values: [
          { codigo_programa: 'PROG-1', nome_programa: 'Alpha', custo: 100 },
          { codigo_programa: 'PROG-2', nome_programa: 'Beta', custo: 50 },
        ],
      },
    ]
    store.programaSelecionado = { id: 1, codigo_programa: 'PROG-1', nome_programa: 'Alpha' }
    const wrapper = mount(ProgramaBurnupCustoChart, { global: { stubs: globalStubs } })
    await nextTick()
    await nextTick()
    expect(wrapper.find('canvas').exists()).toBe(true)
  })
})
