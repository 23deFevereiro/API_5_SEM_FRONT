import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import BurnupChart from './BurnupChart.vue'
import type { Programa } from '@/stores/programa'

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

type Ponto = { codigo_programa: string, nome_programa: string, valor: number }

const dadosMock: { date_str: string, values: Ponto[] }[] = [
  {
    date_str: '01/2025',
    values: [
      { codigo_programa: 'PROG-1', nome_programa: 'Alpha', valor: 500 },
      { codigo_programa: 'PROG-2', nome_programa: 'Beta', valor: 200 },
    ],
  },
  {
    date_str: '02/2025',
    values: [
      { codigo_programa: 'PROG-1', nome_programa: 'Alpha', valor: 800 },
    ],
  },
]

function montar (overrides: Partial<Record<string, unknown>> = {}) {
  return mount(BurnupChart, {
    global: { stubs: globalStubs },
    props: {
      dados: null,
      programaSelecionado: null,
      carregando: false,
      titulo: 'Teste',
      iconeHeader: 'mdi-chart-line',
      corHeader: '#2563EB',
      bgHeader: '#DBEAFE',
      corLoading: '#2563EB',
      iconeVazio: 'mdi-chart-line',
      textoVazio: 'Sem dados',
      tituloEixoY: 'Valor',
      extratorValor: (p: Ponto) => p.valor,
      formatarValor: (v: number) => `${v}`,
      ...overrides,
    },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  chartInstanceMock.data.datasets = []
})

describe('BurnupChart — estados visuais', () => {
  it('mostra estado de carregando quando dados é null', () => {
    const wrapper = montar({ dados: null })
    expect(wrapper.text()).toContain('Carregando burnup')
    expect(wrapper.find('canvas').exists()).toBe(false)
  })

  it('mostra estado de carregando quando carregando é true', async () => {
    const wrapper = montar({ dados: [], carregando: true })
    await nextTick()
    expect(wrapper.text()).toContain('Carregando burnup')
  })

  it('mostra textoVazio quando dados é uma lista vazia', async () => {
    const wrapper = montar({ dados: [], textoVazio: 'Sem registros' })
    await nextTick()
    expect(wrapper.text()).toContain('Sem registros')
    expect(wrapper.find('canvas').exists()).toBe(false)
  })

  it('renderiza o canvas quando há dados', async () => {
    const wrapper = montar({ dados: dadosMock })
    await nextTick()
    expect(wrapper.find('canvas').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('Carregando burnup')
  })

  it('renderiza o título passado via prop', () => {
    const wrapper = montar({ titulo: 'Burnup de Algo', dados: [] })
    expect(wrapper.text()).toContain('Burnup de Algo')
  })
})

describe('BurnupChart — comportamento ao montar', () => {
  it('chama aoMontar quando dados é null no mount', async () => {
    const aoMontar = vi.fn().mockResolvedValue(undefined)
    montar({ dados: null, aoMontar })
    await nextTick()
    expect(aoMontar).toHaveBeenCalledTimes(1)
  })

  it('não chama aoMontar se já houver dados em cache', async () => {
    const aoMontar = vi.fn().mockResolvedValue(undefined)
    montar({ dados: dadosMock, aoMontar })
    await nextTick()
    expect(aoMontar).not.toHaveBeenCalled()
  })

  it('não chama aoMontar se cache estiver vazio mas não-null', async () => {
    const aoMontar = vi.fn().mockResolvedValue(undefined)
    montar({ dados: [], aoMontar })
    await nextTick()
    expect(aoMontar).not.toHaveBeenCalled()
  })

  it('aoMontar é opcional (não explode se ausente)', async () => {
    expect(() => montar({ dados: null })).not.toThrow()
    await nextTick()
  })

  it('reconstrói o gráfico imediatamente quando há dados em cache no mount', async () => {
    montar({ dados: dadosMock })
    await nextTick()
    await nextTick()
    expect(ChartCtor).toHaveBeenCalled()
  })
})

describe('BurnupChart — ciclo de vida', () => {
  it('destrói a instância do Chart no unmount', async () => {
    const wrapper = montar({ dados: dadosMock })
    await nextTick()
    await nextTick()
    wrapper.unmount()
    expect(chartInstanceMock.destroy).toHaveBeenCalled()
  })

  it('reage a mudanças em dados reconstruindo o gráfico', async () => {
    const wrapper = montar({ dados: [] })
    await nextTick()
    const chamadasAntes = ChartCtor.mock.calls.length
    await wrapper.setProps({ dados: dadosMock })
    // o watch tem um await nextTick() interno antes de chamar buildChart;
    // por isso precisamos de dois ticks para a chamada do Chart materializar
    await nextTick()
    await nextTick()
    expect(ChartCtor.mock.calls.length).toBeGreaterThan(chamadasAntes)
  })

  it('destrói o gráfico quando dados vira lista vazia', async () => {
    const wrapper = montar({ dados: dadosMock })
    await nextTick()
    await nextTick()
    chartInstanceMock.destroy.mockClear()
    await wrapper.setProps({ dados: [] })
    await nextTick()
    expect(chartInstanceMock.destroy).toHaveBeenCalled()
  })
})

describe('BurnupChart — realce do programa selecionado', () => {
  it('chama update do Chart quando programaSelecionado muda', async () => {
    const wrapper = montar({ dados: dadosMock })
    await nextTick()
    await nextTick()
    chartInstanceMock.update.mockClear()
    chartInstanceMock.data.datasets = [
      { label: 'PROG-1' } as { label: string },
      { label: 'PROG-2' } as { label: string },
    ]
    const programa: Programa = { id: 1, codigo_programa: 'PROG-1', nome_programa: 'Alpha' }
    await wrapper.setProps({ programaSelecionado: programa })
    await nextTick()
    expect(chartInstanceMock.update).toHaveBeenCalled()
  })
})

describe('BurnupChart — extração e formatação', () => {
  it('usa extratorValor para obter o valor de cada ponto', async () => {
    const extrator = vi.fn((p: Ponto) => p.valor)
    montar({ dados: dadosMock, extratorValor: extrator })
    await nextTick()
    await nextTick()
    // total de pontos no mock é 3 (Alpha jan, Beta jan, Alpha fev)
    expect(extrator).toHaveBeenCalledTimes(3)
  })
})
