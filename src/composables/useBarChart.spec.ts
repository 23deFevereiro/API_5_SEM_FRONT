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
        () => sourceRef.value as unknown[],
        () => (sourceRef.value as Entry[]).map(d => d.label),
        () => (sourceRef.value as Entry[]).map(d => d.value),
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
