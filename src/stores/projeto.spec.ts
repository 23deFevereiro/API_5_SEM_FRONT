import axios from 'axios'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useProjetoStore } from './projeto'

vi.mock('axios')

const projetoMock = {
  id: 1,
  codigo_projeto: 'P001',
  nome_projeto: 'Conversor DC-DC',
}

const resumoMock = {
  custo_total: 700,
  tempo_total: 12.5,
}

const materiaisMock = {
  count: 1,
  page: 1,
  page_size: 10,
  total_pages: 1,
  results: [{ nome_material: 'Capacitor', custo_total_estimado: 50, quantidade: 5 }],
}

const funcionariosMock = {
  count: 1,
  page: 1,
  page_size: 10,
  total_pages: 1,
  results: [{ usuario: 'Alberto', total_horas: 8, projetos: ['P001'] }],
}

const horasMock = [
  { funcionario: 'Alberto', total_horas: 8 },
]

const overviewMock = [
  { date_str: '01/2025', values: [{ codigo_projeto: 'P001', nome_projeto: 'Conversor DC-DC', cost: 500 }] },
]

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

// ─── UNITÁRIOS ───────────────────────────────────────────────────────────────

describe('Unitário: limpar', () => {
  it('limpa o projeto selecionado', () => {
    const store = useProjetoStore()
    store.projetoSelecionado = projetoMock
    store.limpar()
    expect(store.projetoSelecionado).toBeNull()
  })

  it('limpa o resumo', () => {
    const store = useProjetoStore()
    store.resumo = resumoMock
    store.limpar()
    expect(store.resumo).toBeNull()
  })

  it('limpa os materiais', () => {
    const store = useProjetoStore()
    store.materiais = materiaisMock
    store.limpar()
    expect(store.materiais).toBeNull()
  })

  it('limpa os funcionarios', () => {
    const store = useProjetoStore()
    store.funcionarios = funcionariosMock
    store.limpar()
    expect(store.funcionarios).toBeNull()
  })
})

describe('Unitário: estado inicial', () => {
  it('inicia com projetos vazios', () => {
    const store = useProjetoStore()
    expect(store.projetos).toEqual([])
  })

  it('inicia sem projeto selecionado', () => {
    const store = useProjetoStore()
    expect(store.projetoSelecionado).toBeNull()
  })

  it('inicia com carregando false', () => {
    const store = useProjetoStore()
    expect(store.carregando).toBe(false)
  })

  it('inicia com horasPorFuncionario vazio', () => {
    const store = useProjetoStore()
    expect(store.horasPorFuncionario).toEqual([])
  })
})

// ─── INTEGRAÇÃO ──────────────────────────────────────────────────────────────

describe('Integração: buscarProjetos', () => {
  it('popula o estado com projetos retornados pela API', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: [projetoMock] })
    const store = useProjetoStore()
    await store.buscarProjetos()
    expect(store.projetos).toEqual([projetoMock])
  })

  it('filtra por search passando o parametro na URL', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: [projetoMock] })
    const store = useProjetoStore()
    await store.buscarProjetos('Conversor')
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('search=Conversor'))
  })

  it('retorna lista vazia quando API retorna vazio', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: [] })
    const store = useProjetoStore()
    await store.buscarProjetos()
    expect(store.projetos).toEqual([])
  })

  it('passa programa_id na URL quando informado', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: [projetoMock] })
    const store = useProjetoStore()
    await store.buscarProjetos('', 7)
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('programa_id=7'))
  })

  it('nao inclui programa_id na URL quando null', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: [projetoMock] })
    const store = useProjetoStore()
    await store.buscarProjetos('', null)
    expect(axios.get).toHaveBeenCalledWith(expect.not.stringContaining('programa_id'))
  })

  it('combina search e programa_id na URL', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: [projetoMock] })
    const store = useProjetoStore()
    await store.buscarProjetos('Conversor', 3)
    const chamada = vi.mocked(axios.get).mock.calls[0][0]
    expect(chamada).toContain('search=Conversor')
    expect(chamada).toContain('programa_id=3')
  })
})

function mockarRespostasDoFiltro (
  projetos: unknown[] = [projetoMock],
  overview: unknown[] = overviewMock,
  burnup: unknown[] = [],
) {
  vi.mocked(axios.get)
    .mockResolvedValueOnce({ data: projetos })
    .mockResolvedValueOnce({ data: overview })
    .mockResolvedValueOnce({ data: burnup })
}

describe('Integração: aplicarFiltroPorPrograma', () => {
  // aplicarFiltroPorPrograma dispara 2 GETs em paralelo via Promise.all (projetos e overview, nessa ordem).
  // Este helper centraliza o setup dos dois mocks pra evitar duplicação entre os testes.

  it('busca projetos passando o programa_id recebido', async () => {
    mockarRespostasDoFiltro()
    const store = useProjetoStore()
    await store.aplicarFiltroPorPrograma(5)
    const urls = vi.mocked(axios.get).mock.calls.map(c => c[0])
    expect(urls.some(u => u.includes('/api/projetos/') && u.includes('programa_id=5'))).toBe(true)
  })

  it('busca overview sem programa_id (exibe todos os projetos no grafico)', async () => {
    mockarRespostasDoFiltro()
    const store = useProjetoStore()
    await store.aplicarFiltroPorPrograma(5)
    const urls = vi.mocked(axios.get).mock.calls.map(c => c[0])
    expect(urls.some(u => u.includes('/api/projetos-overview') && !u.includes('programa_id'))).toBe(true)
  })

  it('atualiza overviewData com o retorno filtrado', async () => {
    mockarRespostasDoFiltro()
    const store = useProjetoStore()
    await store.aplicarFiltroPorPrograma(5)
    expect(store.overviewData).toEqual(overviewMock)
  })

  it('atualiza a lista de projetos com o retorno filtrado', async () => {
    mockarRespostasDoFiltro()
    const store = useProjetoStore()
    await store.aplicarFiltroPorPrograma(5)
    expect(store.projetos).toEqual([projetoMock])
  })

  it('mantem projeto selecionado quando ele continua na lista filtrada', async () => {
    mockarRespostasDoFiltro()
    const store = useProjetoStore()
    store.projetoSelecionado = projetoMock
    store.resumo = resumoMock
    await store.aplicarFiltroPorPrograma(5)
    expect(store.projetoSelecionado).toEqual(projetoMock)
    expect(store.resumo).toEqual(resumoMock)
  })

  it('limpa projeto selecionado quando ele nao esta mais na lista filtrada', async () => {
    mockarRespostasDoFiltro([], [])
    const store = useProjetoStore()
    store.projetoSelecionado = projetoMock
    store.resumo = resumoMock
    await store.aplicarFiltroPorPrograma(99)
    expect(store.projetoSelecionado).toBeNull()
    expect(store.resumo).toBeNull()
  })

  it('nao limpa quando nao ha projeto selecionado', async () => {
    mockarRespostasDoFiltro([], [])
    const store = useProjetoStore()
    store.projetoSelecionado = null
    await store.aplicarFiltroPorPrograma(null)
    expect(store.projetoSelecionado).toBeNull()
  })
})

describe('Integração: buscarMateriais', () => {
  it('popula o estado com materiais retornados pela API', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: materiaisMock })
    const store = useProjetoStore()
    await store.buscarMateriais(1)
    expect(store.materiais).toEqual(materiaisMock)
  })

  it('carregandoMateriais volta para false apos carregar', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: materiaisMock })
    const store = useProjetoStore()
    await store.buscarMateriais(1)
    expect(store.carregandoMateriais).toBe(false)
  })
})

describe('Integração: buscarHorasPorFuncionario', () => {
  it('popula o estado com horas retornadas pela API', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: horasMock })
    const store = useProjetoStore()
    await store.buscarHorasPorFuncionario(1)
    expect(store.horasPorFuncionario).toEqual(horasMock)
  })

  it('carregandoHoras volta para false apos carregar', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: horasMock })
    const store = useProjetoStore()
    await store.buscarHorasPorFuncionario(1)
    expect(store.carregandoHoras).toBe(false)
  })
})

describe('Integração: buscarFuncionarios', () => {
  it('popula o estado com funcionarios retornados pela API', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: funcionariosMock })
    const store = useProjetoStore()
    await store.buscarFuncionarios(1)
    expect(store.funcionarios).toEqual(funcionariosMock)
  })

  it('carregandoFuncionarios volta para false apos carregar', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: funcionariosMock })
    const store = useProjetoStore()
    await store.buscarFuncionarios(1)
    expect(store.carregandoFuncionarios).toBe(false)
  })
})

describe('Integração: buscarOverview', () => {
  it('popula o estado com dados de overview', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: overviewMock })
    const store = useProjetoStore()
    await store.buscarOverview()
    expect(store.overviewData).toEqual(overviewMock)
  })

  it('chama URL sem programa_id quando nao informado', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: overviewMock })
    const store = useProjetoStore()
    await store.buscarOverview()
    expect(axios.get).toHaveBeenCalledWith(expect.not.stringContaining('programa_id'))
  })

  it('passa programa_id na URL quando informado', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: overviewMock })
    const store = useProjetoStore()
    await store.buscarOverview(9)
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('programa_id=9'))
  })
})

describe('Integração: selecionarProjeto', () => {
  it('define o projeto selecionado', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: resumoMock })
    const store = useProjetoStore()
    await store.selecionarProjeto(projetoMock)
    expect(store.projetoSelecionado).toEqual(projetoMock)
  })

  it('carregando volta para false apos selecionar', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: resumoMock })
    const store = useProjetoStore()
    await store.selecionarProjeto(projetoMock)
    expect(store.carregando).toBe(false)
  })

  it('limpa dados anteriores ao selecionar novo projeto', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: resumoMock })
    const store = useProjetoStore()
    store.resumo = null
    await store.selecionarProjeto(projetoMock)
    expect(store.resumo.tempo_total).toEqual(resumoMock.tempo_total)
  })

  it('reseta filtros de funcionario e material mas mantem periodo', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: resumoMock })
    const store = useProjetoStore()
    store.filtroDataInicio = '2025-01-01'
    store.filtroDataFim = '2025-12-31'
    store.filtroFuncionario = 'Ana'
    store.filtroMaterial = { id: 1, descricao: 'Capacitor' }
    await store.selecionarProjeto(projetoMock)
    expect(store.filtroDataInicio).toBe('2025-01-01')
    expect(store.filtroDataFim).toBe('2025-12-31')
    expect(store.filtroFuncionario).toBeNull()
    expect(store.filtroMaterial).toBeNull()
  })
})

// ─── FILTROS SECUNDÁRIOS (período, funcionário, material) ─────────────────

describe('Integração: filtro de período na URL', () => {
  it('buscarMateriais inclui data_inicio e data_fim quando setados', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: materiaisMock })
    const store = useProjetoStore()
    store.filtroDataInicio = '2025-01-01'
    store.filtroDataFim = '2025-06-30'
    await store.buscarMateriais(1, 1)
    const url = vi.mocked(axios.get).mock.calls[0][0]
    expect(url).toContain('data_inicio=2025-01-01')
    expect(url).toContain('data_fim=2025-06-30')
  })

  it('buscarHorasPorFuncionario inclui periodo e funcionario', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: horasMock })
    const store = useProjetoStore()
    store.filtroDataInicio = '2025-02-01'
    store.filtroFuncionario = 'Ana'
    await store.buscarHorasPorFuncionario(1)
    const url = vi.mocked(axios.get).mock.calls[0][0]
    expect(url).toContain('data_inicio=2025-02-01')
    expect(url).toContain('funcionario=Ana')
  })

  it('buscarFuncionarios inclui periodo e funcionario', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: funcionariosMock })
    const store = useProjetoStore()
    store.filtroDataFim = '2025-03-15'
    store.filtroFuncionario = 'Bruno'
    await store.buscarFuncionarios(1, 1)
    const url = vi.mocked(axios.get).mock.calls[0][0]
    expect(url).toContain('data_fim=2025-03-15')
    expect(url).toContain('funcionario=Bruno')
  })

  it('buscarMateriais inclui filtroMaterial.descricao na URL', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: materiaisMock })
    const store = useProjetoStore()
    store.filtroMaterial = { id: 7, descricao: 'Capacitor' }
    await store.buscarMateriais(1, 1)
    const url = vi.mocked(axios.get).mock.calls[0][0]
    expect(url).toContain('material=Capacitor')
  })

  it('buscarResumo nao inclui periodo na URL (agregados absolutos)', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: resumoMock })
    const store = useProjetoStore()
    store.filtroDataInicio = '2025-01-01'
    store.filtroDataFim = '2025-12-31'
    await store.buscarResumo(1)
    const url = vi.mocked(axios.get).mock.calls[0][0]
    expect(url).not.toContain('data_inicio')
    expect(url).not.toContain('data_fim')
  })
})

describe('Integração: aplicarPeriodo', () => {
  it('atualiza o estado com as datas informadas', async () => {
    const store = useProjetoStore()
    await store.aplicarPeriodo('2025-01-01', '2025-06-30')
    expect(store.filtroDataInicio).toBe('2025-01-01')
    expect(store.filtroDataFim).toBe('2025-06-30')
  })

  it('nao faz fetch quando nao ha projeto selecionado', async () => {
    const store = useProjetoStore()
    await store.aplicarPeriodo('2025-01-01', '2025-06-30')
    expect(axios.get).not.toHaveBeenCalled()
  })

  it('refaz materiais, horas e funcionarios quando ha projeto selecionado (mas nao resumo)', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: resumoMock })
    const store = useProjetoStore()
    store.projetoSelecionado = projetoMock
    await store.aplicarPeriodo('2025-01-01', null)
    const urls = vi.mocked(axios.get).mock.calls.map(c => c[0])
    expect(urls.some(u => u.includes('/materiais/'))).toBe(true)
    expect(urls.some(u => u.includes('/horas-por-funcionario/'))).toBe(true)
    expect(urls.some(u => u.includes('/funcionarios/'))).toBe(true)
    // resumo \u00e9 agregado absoluto do projeto, n\u00e3o muda com per\u00edodo
    expect(urls.some(u => u.includes('/resumo/'))).toBe(false)
  })
})

describe('Integração: aplicarFiltroFuncionario', () => {
  it('atualiza o estado com o funcionario', async () => {
    const store = useProjetoStore()
    await store.aplicarFiltroFuncionario('Ana')
    expect(store.filtroFuncionario).toBe('Ana')
  })

  it('nao faz fetch quando nao ha projeto selecionado', async () => {
    const store = useProjetoStore()
    await store.aplicarFiltroFuncionario('Ana')
    expect(axios.get).not.toHaveBeenCalled()
  })

  it('refaz apenas horas e funcionarios (nao toca resumo nem materiais)', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: [] })
    const store = useProjetoStore()
    store.projetoSelecionado = projetoMock
    await store.aplicarFiltroFuncionario('Ana')
    const urls = vi.mocked(axios.get).mock.calls.map(c => c[0])
    expect(urls.some(u => u.includes('/horas-por-funcionario/'))).toBe(true)
    expect(urls.some(u => u.includes('/funcionarios/'))).toBe(true)
    expect(urls.some(u => u.includes('/resumo/'))).toBe(false)
    expect(urls.some(u => u.includes('/materiais/'))).toBe(false)
  })
})

describe('Integração: aplicarFiltroMaterial', () => {
  const material = { id: 1, descricao: 'Capacitor' }

  it('atualiza o estado com o material', async () => {
    const store = useProjetoStore()
    await store.aplicarFiltroMaterial(material)
    expect(store.filtroMaterial).toEqual(material)
  })

  it('nao faz fetch quando nao ha projeto selecionado', async () => {
    const store = useProjetoStore()
    await store.aplicarFiltroMaterial(material)
    expect(axios.get).not.toHaveBeenCalled()
  })

  it('refaz apenas materiais (nao toca resumo, horas nem funcionarios)', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: materiaisMock })
    const store = useProjetoStore()
    store.projetoSelecionado = projetoMock
    await store.aplicarFiltroMaterial(material)
    const urls = vi.mocked(axios.get).mock.calls.map(c => c[0])
    expect(urls.some(u => u.includes('/materiais/'))).toBe(true)
    expect(urls.some(u => u.includes('/resumo/'))).toBe(false)
    expect(urls.some(u => u.includes('/horas-por-funcionario/'))).toBe(false)
    expect(urls.some(u => u.includes('/funcionarios/'))).toBe(false)
  })
})

describe('Integração: buscarNomesFuncionarios / buscarMateriaisDisponiveis', () => {
  it('buscarNomesFuncionarios popula state', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: ['Ana', 'Bruno'] })
    const store = useProjetoStore()
    await store.buscarNomesFuncionarios(1)
    expect(store.nomesFuncionarios).toEqual(['Ana', 'Bruno'])
  })

  it('buscarMateriaisDisponiveis popula state', async () => {
    const materiais = [{ id: 1, descricao: 'Capacitor' }]
    vi.mocked(axios.get).mockResolvedValueOnce({ data: materiais })
    const store = useProjetoStore()
    await store.buscarMateriaisDisponiveis(1)
    expect(store.materiaisDisponiveis).toEqual(materiais)
  })
})

describe('init', () => {
  it('chama buscarOverview e buscarBurnupHoras ao inicializar', () => {
    const store = useProjetoStore()
    const spyOverview = vi.spyOn(store, 'buscarOverview').mockResolvedValue(undefined)
    const spyBurnup = vi.spyOn(store, 'buscarBurnupHoras').mockResolvedValue(undefined)
    store.init()
    expect(spyOverview).toHaveBeenCalledTimes(1)
    expect(spyBurnup).toHaveBeenCalledTimes(1)
  })
})
