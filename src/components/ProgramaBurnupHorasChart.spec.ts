import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { useProgramaStore } from '@/stores/programa'
import ProgramaBurnupHorasChart from './ProgramaBurnupHorasChart.vue'

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

describe('ProgramaBurnupHorasChart — integração com o store', () => {
  it('exibe título de horas', () => {
    const store = useProgramaStore()
    store.buscarBurnupHoras = vi.fn().mockResolvedValue(undefined)
    const wrapper = mount(ProgramaBurnupHorasChart, { global: { stubs: globalStubs } })
    expect(wrapper.text()).toContain('Burnup de Horas por Programa')
  })

  it('chama buscarBurnupHoras no mount quando burnupHoras é null', async () => {
    const store = useProgramaStore()
    const spy = vi.spyOn(store, 'buscarBurnupHoras').mockResolvedValue(undefined)
    mount(ProgramaBurnupHorasChart, { global: { stubs: globalStubs } })
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('exibe estado vazio quando burnupHoras é uma lista vazia', async () => {
    const store = useProgramaStore()
    store.burnupHoras = []
    const wrapper = mount(ProgramaBurnupHorasChart, { global: { stubs: globalStubs } })
    await nextTick()
    expect(wrapper.text()).toContain('Nenhum registro de horas encontrado')
  })

  it('renderiza o canvas quando há dados em cache', async () => {
    const store = useProgramaStore()
    store.burnupHoras = [
      {
        date_str: '01/2025',
        values: [{ codigo_programa: 'PROG-1', nome_programa: 'Alpha', horas: 10 }],
      },
    ]
    const wrapper = mount(ProgramaBurnupHorasChart, { global: { stubs: globalStubs } })
    await nextTick()
    expect(wrapper.find('canvas').exists()).toBe(true)
  })

  it('destaca o programa selecionado passando codigosSelecionados não-nulo', async () => {
    const store = useProgramaStore()
    store.burnupHoras = [
      {
        date_str: '01/2025',
        values: [
          { codigo_programa: 'PROG-1', nome_programa: 'Alpha', horas: 10 },
          { codigo_programa: 'PROG-2', nome_programa: 'Beta', horas: 5 },
        ],
      },
    ]
    store.programaSelecionado = { id: 1, codigo_programa: 'PROG-1', nome_programa: 'Alpha' }
    const wrapper = mount(ProgramaBurnupHorasChart, { global: { stubs: globalStubs } })
    await nextTick()
    await nextTick()
    expect(wrapper.find('canvas').exists()).toBe(true)
  })
})
