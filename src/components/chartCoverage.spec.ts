import { mount, shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import BurnupHorasChart from './BurnupHorasChart.vue'
import CustoTempoChart from './CustoTempoChart.vue'
import HorasFuncionarioChart from './HorasFuncionarioChart.vue'
import ProgramaBurnupHorasChart from './ProgramaBurnupHorasChart.vue'
import ProgramaDonutChart from './ProgramaDonutChart.vue'
import { useProgramaStore } from '@/stores/programa'
import { useProjetoStore } from '@/stores/projeto'

const { ChartCtor, chartInstances } = vi.hoisted(() => {
  const chartInstances: Array<{
    data: { labels: unknown[], datasets: any[] }
    destroy: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
  }> = []

  const ChartCtor = vi.fn(() => {
    const instance = {
      data: { labels: [], datasets: [] as any[] },
      destroy: vi.fn(),
      update: vi.fn(),
    }
    chartInstances.push(instance)
    return instance
  })

  return { ChartCtor, chartInstances }
})

vi.mock('chart.js', () => ({
  ArcElement: {},
  BarController: {},
  BarElement: {},
  CategoryScale: {},
  Chart: Object.assign(ChartCtor, { register: vi.fn() }),
  DoughnutController: {},
  Legend: {},
  LinearScale: {},
  LineController: {},
  LineElement: {},
  PointElement: {},
  Tooltip: {},
}))

const vuetifyStubs = {
  'v-icon': { template: '<i class="v-icon-stub"><slot /></i>' },
  'v-progress-circular': { template: '<span class="v-progress-circular-stub" />' },
}

const globalStubs = {
  BurnupChart: {
    props: ['aoMontar', 'bgHeader', 'carregando', 'corHeader', 'corLoading', 'dados', 'extratorValor', 'formatarValor', 'iconeHeader', 'iconeVazio', 'programaSelecionado', 'textoVazio', 'titulo', 'tituloEixoY'],
    template: '<div class="burnup-chart-stub" />',
  },
  'v-icon': { template: '<i class="v-icon-stub"><slot /></i>' },
  'v-progress-circular': { template: '<span class="v-progress-circular-stub" />' },
}

beforeEach(() => {
  setActivePinia(createPinia())
  chartInstances.length = 0
  vi.clearAllMocks()
})

describe('chart coverage', () => {
  it('renderiza o CustoTempoChart e atualiza o destaque dos projetos do programa selecionado', async () => {
    const store = useProjetoStore()
    const programaStore = useProgramaStore()
    mount(CustoTempoChart, { global: { stubs: vuetifyStubs } })
    await nextTick()

    store.overviewData = [
      {
        date_str: '01/2025',
        values: [
          { codigo_projeto: 'P001', nome_projeto: 'Conversor', cost: 100 },
          { codigo_projeto: 'P002', nome_projeto: 'Fonte', cost: 50 },
        ],
      },
      {
        date_str: '02/2025',
        values: [{ codigo_projeto: 'P001', nome_projeto: 'Conversor', cost: 180 }],
      },
    ]
    await nextTick()
    await nextTick()

    const instance = chartInstances.at(-1)

    expect(ChartCtor).toHaveBeenCalledTimes(1)

    instance!.data.datasets = [{ label: 'P001' }, { label: 'P002' }]
    programaStore.programaSelecionado = { id: 1, codigo_programa: 'PG1', nome_programa: 'Programa 1' }
    store.projetos = [{ id: 1, codigo_projeto: 'P001', nome_projeto: 'Conversor' }]
    await nextTick()

    expect(instance?.update).toHaveBeenCalled()
    expect(instance?.data.datasets[0]).toMatchObject({
      backgroundColor: '#2563EB',
      borderColor: '#2563EB',
      hoverBackgroundColor: '#1D4ED8',
    })
  })

  it('renderiza o BurnupHorasChart e destrói o gráfico quando os dados ficam vazios', async () => {
    const store = useProjetoStore()
    mount(BurnupHorasChart, { global: { stubs: vuetifyStubs } })
    await nextTick()

    store.burnupHoras = [
      {
        projeto_id: 1,
        projeto: 'P001',
        serie: [
          { mes: '02/2025', horas: 5, horas_acumuladas: 5 },
          { mes: '03/2025', horas: 4, horas_acumuladas: 9 },
        ],
      },
      {
        projeto_id: 2,
        projeto: 'P002',
        serie: [{ mes: '01/2025', horas: 3, horas_acumuladas: 3 }],
      },
    ]
    await nextTick()
    await nextTick()

    const instance = chartInstances.at(-1)

    expect(ChartCtor).toHaveBeenCalledTimes(1)

    store.burnupHoras = []
    await nextTick()

    expect(instance?.destroy).toHaveBeenCalled()
  })

  it('renderiza o HorasFuncionarioChart com dados e destrói o gráfico ao esvaziar', async () => {
    const store = useProjetoStore()
    store.projetoSelecionado = { id: 1, codigo_projeto: 'P001', nome_projeto: 'Conversor' }
    store.horasPorFuncionario = [{ funcionario: 'Ana', total_horas: 8 }]

    const wrapper = mount(HorasFuncionarioChart, {
      global: {
        stubs: globalStubs,
      },
    })

    await nextTick()
    await nextTick()

    const instance = chartInstances.at(-1)

    expect(wrapper.find('canvas').exists()).toBe(true)
    expect(ChartCtor).toHaveBeenCalledTimes(1)

    store.horasPorFuncionario = []
    await nextTick()
    await nextTick()

    expect(instance?.destroy).toHaveBeenCalled()
  })

  it('mostra estados e renderiza legenda no ProgramaDonutChart', async () => {
    const store = useProgramaStore()
    store.carregandoDistribuicao = true

    const wrapper = mount(ProgramaDonutChart, {
      global: {
        stubs: globalStubs,
      },
    })

    expect(wrapper.text()).toContain('Carregando...')

    store.carregandoDistribuicao = false
    store.programaSelecionado = { id: 1, codigo_programa: 'PG1', nome_programa: 'Programa 1' }
    store.distribuicaoStatus = {
      total: 2,
      status: [
        { status: 'Planejamento', quantidade: 1, percentual: 50, cor: '#2563EB' },
        { status: 'Concluído', quantidade: 1, percentual: 50, cor: '#10B981' },
      ],
    }
    await nextTick()
    await nextTick()

    expect(wrapper.text()).toContain('Planejamento')
    expect(wrapper.text()).toContain('Concluído')
    expect(wrapper.text()).toContain('2')

    wrapper.unmount()

    const instance = chartInstances.at(-1)
    expect(instance?.destroy).toHaveBeenCalled()
  })

  it('destrói o gráfico HorasFuncionarioChart no unmount quando chartInstance existe', async () => {
    const store = useProjetoStore()
    store.projetoSelecionado = { id: 1, codigo_projeto: 'P001', nome_projeto: 'Conversor' }
    store.horasPorFuncionario = [{ funcionario: 'Ana', total_horas: 8 }]

    const wrapper = mount(HorasFuncionarioChart, {
      global: { stubs: globalStubs },
    })

    await nextTick()
    await nextTick()

    const instance = chartInstances.at(-1)
    wrapper.unmount()

    expect(instance?.destroy).toHaveBeenCalled()
  })

  it('reconstrói o BurnupHorasChart destruindo a instância anterior', async () => {
    const store = useProjetoStore()
    mount(BurnupHorasChart, { global: { stubs: vuetifyStubs } })
    await nextTick()

    store.burnupHoras = [
      {
        projeto_id: 1,
        projeto: 'P001',
        serie: [{ mes: '01/2025', horas: 5, horas_acumuladas: 5 }],
      },
    ]
    await nextTick()
    await nextTick()

    const firstInstance = chartInstances.at(-1)

    store.burnupHoras = [
      {
        projeto_id: 2,
        projeto: 'P002',
        serie: [{ mes: '02/2025', horas: 3, horas_acumuladas: 3 }],
      },
    ]
    await nextTick()
    await nextTick()

    expect(firstInstance?.destroy).toHaveBeenCalled()
    expect(ChartCtor).toHaveBeenCalledTimes(2)
  })

  it('mostra estado "sem programa" e estado vazio no ProgramaDonutChart', async () => {
    const store = useProgramaStore()
    store.carregandoDistribuicao = false
    store.programaSelecionado = null

    const wrapper = mount(ProgramaDonutChart, {
      global: { stubs: globalStubs },
    })

    expect(wrapper.text()).toContain('Selecione um programa para visualizar')

    store.programaSelecionado = { id: 1, codigo_programa: 'PG1', nome_programa: 'Programa 1' }
    store.distribuicaoStatus = { total: 0, status: [] }
    await nextTick()

    expect(wrapper.text()).toContain('Nenhum projeto encontrado')
  })

  it('expõe as props corretas no wrapper ProgramaBurnupHorasChart', () => {
    const store = useProgramaStore()
    const wrapper = shallowMount(ProgramaBurnupHorasChart, {
      global: {
        stubs: globalStubs,
      },
    })

    const burnupChart = wrapper.get('.burnup-chart-stub')

    expect(burnupChart.exists()).toBe(true)
    expect(store.buscarBurnupHoras).toBeTypeOf('function')
    expect(wrapper.text()).not.toContain('Nenhum registro de horas encontrado')
  })
})
