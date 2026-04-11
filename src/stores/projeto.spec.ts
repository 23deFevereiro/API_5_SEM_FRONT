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
  custo_materiais: 500,
  custo_compras: 200,
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
    expect(store.resumo).toEqual(resumoMock)
  })
})
