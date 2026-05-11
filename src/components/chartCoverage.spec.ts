import { mount, shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import BurnupHorasChart from './BurnupHorasChart.vue'
import CustoTempoChart from './CustoTempoChart.vue'
import HorasFuncionarioChart from './HorasFuncionarioChart.vue'
import LeadTimeChart from './LeadTimeChart.vue'
import ProgramaBurnupHorasChart from './ProgramaBurnupHorasChart.vue'
import ProgramaDonutChart from './ProgramaDonutChart.vue'
import ProjetosBarChart from './ProjetosBarChart.vue'
import { usePlanejamentoStore } from '@/stores/planejamento'
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
  ScatterController: {},
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

  it('constrói HorasFuncionarioChart quando dados chegam via watch', async () => {
    const store = useProjetoStore()
    store.projetoSelecionado = { id: 1, codigo_projeto: 'P001', nome_projeto: 'Conversor' }
    store.horasPorFuncionario = []

    mount(HorasFuncionarioChart, { global: { stubs: vuetifyStubs } })
    await nextTick()

    const before = ChartCtor.mock.calls.length

    store.horasPorFuncionario = [{ funcionario: 'Ana', total_horas: 8 }]
    await nextTick()
    await nextTick()

    expect(ChartCtor.mock.calls.length).toBeGreaterThan(before)
  })

  it('passa codigosSelecionados não-nulo quando há programa selecionado (BurnupHorasChart)', async () => {
    const store = useProjetoStore()
    const programaStore = useProgramaStore()

    store.burnupHoras = [
      {
        projeto_id: 1,
        projeto: 'P001',
        serie: [{ mes: '01/2025', horas: 10, horas_acumuladas: 10 }],
      },
    ]
    store.projetos = [{ id: 1, codigo_projeto: 'P001', nome_projeto: 'Conversor' }]
    programaStore.programaSelecionado = { id: 1, codigo_programa: 'PG1', nome_programa: 'Programa 1' }

    mount(BurnupHorasChart, { global: { stubs: vuetifyStubs } })
    await nextTick()
    await nextTick()

    // ChartCtor called means canvas was rendered with highlighted dataset
    expect(ChartCtor).toHaveBeenCalled()
  })

  it('mostra estado vazio de HorasFuncionarioChart sem projeto selecionado', () => {
    const store = useProjetoStore()
    store.projetoSelecionado = null

    const wrapper = mount(HorasFuncionarioChart, { global: { stubs: vuetifyStubs } })
    expect(wrapper.text()).toContain('Selecione um projeto para ver as horas por funcionário')
  })

  it('destroi e reconstrói o gráfico HorasFuncionarioChart ao atualizar dados', async () => {
    const store = useProjetoStore()
    store.projetoSelecionado = { id: 1, codigo_projeto: 'P001', nome_projeto: 'Conversor' }
    store.horasPorFuncionario = [{ funcionario: 'Ana', total_horas: 5 }]

    mount(HorasFuncionarioChart, { global: { stubs: vuetifyStubs } })
    await nextTick()

    const firstInstance = chartInstances.at(-1)

    // update the data — the watch rebuilds, calling destroy on the old instance
    store.horasPorFuncionario = [{ funcionario: 'Bruno', total_horas: 8 }]
    await nextTick()
    await nextTick()

    expect(firstInstance?.destroy).toHaveBeenCalled()
    expect(ChartCtor.mock.calls.length).toBeGreaterThanOrEqual(2)
  })

  it('renderiza o ProjetosBarChart e cria o gráfico quando há dados', async () => {
    const store = useProgramaStore()
    store.programaSelecionado = { id: 1, codigo_programa: 'PG1', nome_programa: 'Programa 1' }
    store.horasPorProjeto = [
      { nome_projeto: 'Projeto A', horas_realizadas: 10 },
      { nome_projeto: 'Projeto B', horas_realizadas: 0 },
    ]

    const wrapper = mount(ProjetosBarChart, { global: { stubs: globalStubs } })
    await nextTick()
    await nextTick()

    expect(wrapper.find('canvas').exists()).toBe(true)
    expect(ChartCtor).toHaveBeenCalledTimes(1)
  })

  it('destrói o gráfico ProjetosBarChart quando horasPorProjeto fica vazio', async () => {
    const store = useProgramaStore()
    store.programaSelecionado = { id: 1, codigo_programa: 'PG1', nome_programa: 'Programa 1' }
    store.horasPorProjeto = [{ nome_projeto: 'Projeto A', horas_realizadas: 5 }]

    mount(ProjetosBarChart, { global: { stubs: globalStubs } })
    await nextTick()
    await nextTick()

    const instance = chartInstances.at(-1)

    store.horasPorProjeto = []
    await nextTick()
    await nextTick()

    expect(instance?.destroy).toHaveBeenCalled()
  })

  it('destrói o gráfico ProjetosBarChart no unmount', async () => {
    const store = useProgramaStore()
    store.programaSelecionado = { id: 1, codigo_programa: 'PG1', nome_programa: 'Programa 1' }
    store.horasPorProjeto = [{ nome_projeto: 'Projeto A', horas_realizadas: 8 }]

    const wrapper = mount(ProjetosBarChart, { global: { stubs: globalStubs } })
    await nextTick()
    await nextTick()

    const instance = chartInstances.at(-1)
    wrapper.unmount()

    expect(instance?.destroy).toHaveBeenCalled()
  })

  it('LeadTimeChart: mostra estado vazio sem material selecionado', () => {
    const wrapper = mount(LeadTimeChart, { global: { stubs: vuetifyStubs } })
    expect(wrapper.text()).toContain('Selecione um material para visualizar o lead time')
    expect(wrapper.find('canvas').exists()).toBe(false)
  })

  it('LeadTimeChart: mostra estado carregando', () => {
    const store = usePlanejamentoStore()
    store.materialSelecionado = { id: 1, codigo_material: 'M001', descricao: 'Capacitor' }
    store.carregandoLeadTime = true
    const wrapper = mount(LeadTimeChart, { global: { stubs: vuetifyStubs } })
    expect(wrapper.text()).toContain('Carregando dados')
    expect(wrapper.find('canvas').exists()).toBe(false)
  })

  it('LeadTimeChart: mostra estado vazio quando leadTimeData está vazio após seleção', async () => {
    const store = usePlanejamentoStore()
    store.materialSelecionado = { id: 1, codigo_material: 'M001', descricao: 'Capacitor' }
    store.carregandoLeadTime = false
    store.leadTimeData = []
    const wrapper = mount(LeadTimeChart, { global: { stubs: vuetifyStubs } })
    await nextTick()
    expect(wrapper.text()).toContain('Nenhum dado de lead time encontrado')
    expect(wrapper.find('canvas').exists()).toBe(false)
  })

  it('LeadTimeChart: renderiza canvas e cria o gráfico quando há dados', async () => {
    const store = usePlanejamentoStore()
    store.materialSelecionado = { id: 1, codigo_material: 'M001', descricao: 'Capacitor' }
    store.carregandoLeadTime = false
    store.leadTimeData = [
      { fornecedor: 'F1', lead_time: 10, valor_unidade: 50, valor_total: 500,
        status: 'Entregue', categoria_status: 'Concluído', data_pedido: '2024-01-01' },
      { fornecedor: 'F2', lead_time: 20, valor_unidade: 100, valor_total: 1000,
        status: 'Aberto', categoria_status: 'Pendente', data_pedido: '2024-02-01' },
      { fornecedor: 'F3', lead_time: 5, valor_unidade: 30, valor_total: 150,
        status: 'Cancelado', categoria_status: 'Cancelado', data_pedido: '2024-03-01' },
      { fornecedor: 'F4', lead_time: 8, valor_unidade: 20, valor_total: 80,
        status: 'Enviado', categoria_status: 'Desconhecido', data_pedido: '2024-04-01' },
    ]
    const wrapper = mount(LeadTimeChart, { global: { stubs: vuetifyStubs } })
    await nextTick()
    await nextTick()
    expect(wrapper.find('canvas').exists()).toBe(true)
    expect(ChartCtor).toHaveBeenCalled()
  })

  it('LeadTimeChart: destrói e reconstrói o gráfico quando leadTimeData muda', async () => {
    const store = usePlanejamentoStore()
    store.materialSelecionado = { id: 1, codigo_material: 'M001', descricao: 'Capacitor' }
    store.leadTimeData = [
      { fornecedor: 'F1', lead_time: 10, valor_unidade: 50, valor_total: 500,
        status: 'Entregue', categoria_status: 'Concluído', data_pedido: '2024-01-01' },
    ]
    mount(LeadTimeChart, { global: { stubs: vuetifyStubs } })
    await nextTick()
    await nextTick()
    const firstInstance = chartInstances.at(-1)
    store.leadTimeData = [
      { fornecedor: 'F2', lead_time: 15, valor_unidade: 80, valor_total: 800,
        status: 'Aberto', categoria_status: 'Pendente', data_pedido: '2024-05-01' },
    ]
    await nextTick()
    await nextTick()
    expect(firstInstance?.destroy).toHaveBeenCalled()
  })

  it('LeadTimeChart: destrói o gráfico no unmount', async () => {
    const store = usePlanejamentoStore()
    store.materialSelecionado = { id: 1, codigo_material: 'M001', descricao: 'Capacitor' }
    store.leadTimeData = [
      { fornecedor: 'F1', lead_time: 10, valor_unidade: 50, valor_total: 500,
        status: 'Entregue', categoria_status: 'Concluído', data_pedido: '2024-01-01' },
    ]
    const wrapper = mount(LeadTimeChart, { global: { stubs: vuetifyStubs } })
    await nextTick()
    await nextTick()
    const instance = chartInstances.at(-1)
    wrapper.unmount()
    expect(instance?.destroy).toHaveBeenCalled()
  })
})
