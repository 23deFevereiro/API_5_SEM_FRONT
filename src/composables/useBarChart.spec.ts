import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { ChartCtor, chartInstances } = vi.hoisted(() => {
  const chartInstances: Array<{ destroy: ReturnType<typeof vi.fn>, config: any }> = []
  const ChartCtor = vi.fn((_canvas: unknown, config: unknown) => {
    const instance = { destroy: vi.fn(), config }
    chartInstances.push(instance)
    return instance
  })
  return { ChartCtor, chartInstances }
})

vi.mock('chart.js', () => ({
  BarController: {},
  BarElement: {},
  CategoryScale: {},
  Chart: Object.assign(ChartCtor, { register: vi.fn() }),
  Legend: {},
  LinearScale: {},
  Tooltip: {},
}))

import { useBarChart } from '@/composables/useBarChart'

type Entry = { label: string, value: number }

function makeComp (sourceRef: ReturnType<typeof ref<Entry[]>>) {
  return defineComponent({
    setup () {
      const { canvasRef } = useBarChart(
        () => sourceRef.value,
        () => sourceRef.value.map(d => d.label),
        () => sourceRef.value.map(d => d.value),
      )
      return { canvasRef }
    },
    template: '<canvas ref="canvasRef" />',
  })
}

beforeEach(() => {
  chartInstances.length = 0
  vi.clearAllMocks()
})

describe('useBarChart — instância e lifecycle', () => {
  it('não cria chart quando source está vazio no mount', () => {
    const source = ref<Entry[]>([])
    mount(makeComp(source))
    expect(ChartCtor).not.toHaveBeenCalled()
  })

  it('cria chart quando source tem dados no mount', async () => {
    const source = ref<Entry[]>([{ label: 'A', value: 5 }])
    mount(makeComp(source))
    await nextTick()
    expect(ChartCtor).toHaveBeenCalledTimes(1)
  })

  it('recria chart quando source muda de vazio para não-vazio', async () => {
    const source = ref<Entry[]>([])
    mount(makeComp(source))
    expect(ChartCtor).not.toHaveBeenCalled()
    source.value = [{ label: 'B', value: 3 }]
    await nextTick()
    await nextTick()
    expect(ChartCtor).toHaveBeenCalledTimes(1)
  })

  it('destrói chart quando source fica vazio', async () => {
    const source = ref<Entry[]>([{ label: 'A', value: 5 }])
    mount(makeComp(source))
    await nextTick()
    const instance = chartInstances[0]
    source.value = []
    await nextTick()
    await nextTick()
    expect(instance.destroy).toHaveBeenCalled()
  })

  it('destrói chart ao desmontar o componente', async () => {
    const source = ref<Entry[]>([{ label: 'A', value: 5 }])
    const wrapper = mount(makeComp(source))
    await nextTick()
    const instance = chartInstances[0]
    wrapper.unmount()
    expect(instance.destroy).toHaveBeenCalled()
  })

  it('destrói instância anterior ao recriar o chart', async () => {
    const source = ref<Entry[]>([{ label: 'A', value: 5 }])
    mount(makeComp(source))
    await nextTick()
    const first = chartInstances[0]
    source.value = [{ label: 'B', value: 8 }]
    await nextTick()
    await nextTick()
    expect(first.destroy).toHaveBeenCalled()
    expect(ChartCtor).toHaveBeenCalledTimes(2)
  })
})

describe('useBarChart — cores por valor', () => {
  it('usa cor azul para barras com valor não-zero', async () => {
    const source = ref<Entry[]>([{ label: 'A', value: 5 }])
    mount(makeComp(source))
    await nextTick()
    const { config } = chartInstances[0]
    expect(config.data.datasets[0].backgroundColor[0]).toBe('#2563EB')
    expect(config.data.datasets[0].hoverBackgroundColor[0]).toBe('#1D4ED8')
  })

  it('usa cor cinza para barras com valor zero', async () => {
    const source = ref<Entry[]>([{ label: 'Z', value: 0 }])
    mount(makeComp(source))
    await nextTick()
    const { config } = chartInstances[0]
    expect(config.data.datasets[0].backgroundColor[0]).toBe('#E5E7EB')
    expect(config.data.datasets[0].hoverBackgroundColor[0]).toBe('#D1D5DB')
  })

  it('aplica cores distintas para mistura de valores zero e não-zero', async () => {
    const source = ref<Entry[]>([
      { label: 'A', value: 10 },
      { label: 'B', value: 0 },
      { label: 'C', value: 5 },
    ])
    mount(makeComp(source))
    await nextTick()
    const { config } = chartInstances[0]
    expect(config.data.datasets[0].backgroundColor[0]).toBe('#2563EB')
    expect(config.data.datasets[0].backgroundColor[1]).toBe('#E5E7EB')
    expect(config.data.datasets[0].backgroundColor[2]).toBe('#2563EB')
  })
})

describe('useBarChart — tooltip', () => {
  it('exibe "Sem horas registradas" para valor zero', async () => {
    const source = ref<Entry[]>([{ label: 'Z', value: 0 }])
    mount(makeComp(source))
    await nextTick()
    const { config } = chartInstances[0]
    const label = config.options.plugins.tooltip.callbacks.label({ parsed: { y: 0 } })
    expect(label).toBe(' Sem horas registradas')
  })

  it('exibe horas formatadas para valor não-zero', async () => {
    const source = ref<Entry[]>([{ label: 'A', value: 8.5 }])
    mount(makeComp(source))
    await nextTick()
    const { config } = chartInstances[0]
    const label = config.options.plugins.tooltip.callbacks.label({ parsed: { y: 8.5 } })
    expect(label).toBe(' 8.5h')
  })

  it('formata valores inteiros com uma casa decimal', async () => {
    const source = ref<Entry[]>([{ label: 'A', value: 4 }])
    mount(makeComp(source))
    await nextTick()
    const { config } = chartInstances[0]
    const label = config.options.plugins.tooltip.callbacks.label({ parsed: { y: 4 } })
    expect(label).toBe(' 4.0h')
  })
})

describe('useBarChart — eixos', () => {
  it('configura o eixo y para começar em zero', async () => {
    const source = ref<Entry[]>([{ label: 'A', value: 5 }])
    mount(makeComp(source))
    await nextTick()
    const { config } = chartInstances[0]
    expect(config.options.scales.y.beginAtZero).toBe(true)
  })

  it('adiciona sufixo "h" nos ticks do eixo y', async () => {
    const source = ref<Entry[]>([{ label: 'A', value: 5 }])
    mount(makeComp(source))
    await nextTick()
    const { config } = chartInstances[0]
    const tick = config.options.scales.y.ticks.callback(10)
    expect(tick).toBe('10h')
  })

  it('passa os labels corretos para o eixo x', async () => {
    const source = ref<Entry[]>([
      { label: 'Projeto Alpha', value: 3 },
      { label: 'Projeto Beta', value: 7 },
    ])
    mount(makeComp(source))
    await nextTick()
    const { config } = chartInstances[0]
    expect(config.data.labels).toEqual(['Projeto Alpha', 'Projeto Beta'])
  })
})

function makeMockCtx () {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    fill: vi.fn(),
    roundRect: vi.fn(),
    fillText: vi.fn(),
    fillStyle: '' as string,
    font: '' as string,
    textAlign: '' as string,
    textBaseline: '' as string,
  }
}

const DEFAULT_BAR_PROPS = { x: 50, y: 100, width: 30 }

function makeMockChart (values: number[], barProps = DEFAULT_BAR_PROPS) {
  const ctx = makeMockCtx()
  return {
    ctx,
    data: {
      datasets: [{ data: values }],
    },
    getDatasetMeta: vi.fn(() => ({
      data: values.map(() => ({
        getProps: vi.fn(() => barProps),
      })),
    })),
  }
}

async function getPlugin (values: number[]) {
  const source = ref<Entry[]>(values.map((v, i) => ({ label: `L${i}`, value: v })))
  mount(makeComp(source))
  await nextTick()
  return chartInstances.at(-1)?.config.plugins[0]
}

describe('useBarChart — zeroBarPlugin.afterDatasetsDraw', () => {
  it('não desenha nada quando todos os valores são não-zero', async () => {
    const plugin = await getPlugin([5, 10])
    const chart = makeMockChart([5, 10])
    plugin.afterDatasetsDraw(chart)
    expect(chart.ctx.save).not.toHaveBeenCalled()
  })

  it('chama ctx.save e ctx.restore para cada barra com valor zero', async () => {
    const plugin = await getPlugin([0])
    const chart = makeMockChart([0])
    plugin.afterDatasetsDraw(chart)
    expect(chart.ctx.save).toHaveBeenCalledTimes(1)
    expect(chart.ctx.restore).toHaveBeenCalledTimes(1)
  })

  it('desenha o texto "0h" acima da barra zero', async () => {
    const plugin = await getPlugin([0])
    const chart = makeMockChart([0], { x: 50, y: 100, width: 30 })
    plugin.afterDatasetsDraw(chart)
    expect(chart.ctx.fillText).toHaveBeenCalledWith('0h', 50, expect.any(Number))
  })

  it('chama ctx.beginPath e ctx.fill para a faixa da barra zero', async () => {
    const plugin = await getPlugin([0])
    const chart = makeMockChart([0])
    plugin.afterDatasetsDraw(chart)
    expect(chart.ctx.beginPath).toHaveBeenCalled()
    expect(chart.ctx.fill).toHaveBeenCalled()
  })

  it('chama ctx.roundRect com a posição e dimensão corretas', async () => {
    const plugin = await getPlugin([0])
    const chart = makeMockChart([0], { x: 60, y: 200, width: 40 })
    plugin.afterDatasetsDraw(chart)
    expect(chart.ctx.roundRect).toHaveBeenCalledWith(40, 198, 40, 4, 3)
  })

  it('só desenha nas barras zero quando há mistura de valores', async () => {
    const plugin = await getPlugin([5, 0, 3])
    const chart = makeMockChart([5, 0, 3])
    plugin.afterDatasetsDraw(chart)
    expect(chart.ctx.save).toHaveBeenCalledTimes(1)
    expect(chart.ctx.fillText).toHaveBeenCalledTimes(1)
  })

  it('desenha em todas as barras quando todos os valores são zero', async () => {
    const plugin = await getPlugin([0, 0])
    const chart = makeMockChart([0, 0])
    plugin.afterDatasetsDraw(chart)
    expect(chart.ctx.save).toHaveBeenCalledTimes(2)
    expect(chart.ctx.fillText).toHaveBeenCalledTimes(2)
  })

  it('define fillStyle correto para a faixa e para o texto', async () => {
    const plugin = await getPlugin([0])
    const chart = makeMockChart([0])
    const fillStyles: string[] = []
    Object.defineProperty(chart.ctx, 'fillStyle', {
      get: () => fillStyles.at(-1) ?? '',
      set: (v: string) => fillStyles.push(v),
    })
    plugin.afterDatasetsDraw(chart)
    expect(fillStyles[0]).toBe('#E5E7EB')
    expect(fillStyles[1]).toBe('#9CA3AF')
  })

  it('não lança erro quando meta.data está vazio', async () => {
    const plugin = await getPlugin([1])
    const emptyData: number[] = []
    const chart = {
      ctx: makeMockCtx(),
      data: { datasets: [{ data: emptyData }] },
      getDatasetMeta: vi.fn(() => ({ data: [] })),
    }
    expect(() => plugin.afterDatasetsDraw(chart)).not.toThrow()
  })
})
