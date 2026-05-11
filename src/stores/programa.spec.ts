import axios from 'axios'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useProgramaStore } from './programa'

vi.mock('axios')

const programaMock = {
  id: 1,
  codigo_programa: 'P-1',
  nome_programa: 'Programa Alpha',
}

const tabelaProjetosMock = {
  count: 1,
  page: 1,
  page_size: 10,
  total_pages: 1,
  results: [
    {
      nome_projeto: 'Projeto A',
      responsavel: 'Maria',
      status: 'Planejamento',
      horas_estimadas: 12,
      horas_realizadas: 8,
      percentual_tarefas_concluidas: 50,
      desvio_horas: -4,
      percentual_desvio: 33.3,
    },
  ],
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

describe('Unitário: estado inicial', () => {
  it('inicia com programas vazios', () => {
    const store = useProgramaStore()
    expect(store.programas).toEqual([])
  })

  it('inicia sem programa selecionado', () => {
    const store = useProgramaStore()
    expect(store.programaSelecionado).toBeNull()
  })

  it('inicia com carregando false', () => {
    const store = useProgramaStore()
    expect(store.carregando).toBe(false)
  })

  it('inicia com burnupHoras null', () => {
    const store = useProgramaStore()
    expect(store.burnupHoras).toBeNull()
  })

  it('inicia com carregandoBurnup false', () => {
    const store = useProgramaStore()
    expect(store.carregandoBurnup).toBe(false)
  })

  it('inicia com burnupCusto null', () => {
    const store = useProgramaStore()
    expect(store.burnupCusto).toBeNull()
  })

  it('inicia com carregandoBurnupCusto false', () => {
    const store = useProgramaStore()
    expect(store.carregandoBurnupCusto).toBe(false)
  })

  it('inicia com horasPorProjeto vazio', () => {
    const store = useProgramaStore()
    expect(store.horasPorProjeto).toEqual([])
  })

  it('inicia com carregandoHorasProjeto false', () => {
    const store = useProgramaStore()
    expect(store.carregandoHorasProjeto).toBe(false)
  })
})

describe('Unitário: selecionarPrograma', () => {
  it('define o programa selecionado', async () => {
    vi.mocked(axios.get)
      .mockResolvedValueOnce({ data: {
        total_projetos: 0, horas_estimadas: 0, horas_realizadas: 0,
        custo_estimado: 0, custo_real: 0,
      }})
      .mockResolvedValueOnce({ data: { total: 0, status: [] } })
      .mockResolvedValueOnce({ data: tabelaProjetosMock })
      .mockResolvedValueOnce({ data: [] })
    const store = useProgramaStore()
    await store.selecionarPrograma(programaMock)
    expect(store.programaSelecionado).toEqual(programaMock)
  })

  it('aceita null para limpar a selecao', async () => {
    const store = useProgramaStore()
    store.programaSelecionado = programaMock
    await store.selecionarPrograma(null)
    expect(store.programaSelecionado).toBeNull()
  })
})

describe('Integração: buscarProgramas', () => {
  it('popula o estado com programas retornados pela API', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: [programaMock] })
    const store = useProgramaStore()
    await store.buscarProgramas()
    expect(store.programas).toEqual([programaMock])
  })

  it('chama a URL sem query string quando search vazio', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: [] })
    const store = useProgramaStore()
    await store.buscarProgramas('')
    expect(axios.get).toHaveBeenCalledWith(expect.not.stringContaining('search='))
  })

  it('inclui search na query string quando informado', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: [programaMock] })
    const store = useProgramaStore()
    await store.buscarProgramas('Alpha')
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('search=Alpha'))
  })

  it('retorna lista vazia quando API retorna vazio', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: [] })
    const store = useProgramaStore()
    await store.buscarProgramas()
    expect(store.programas).toEqual([])
  })

  it('ignora busca quando search coincide com o nome do programa selecionado', async () => {
    const store = useProgramaStore()
    store.programas = [{ id: 1, codigo_programa: 'P-1', nome_programa: 'Alpha' }]
    store.programaSelecionado = { id: 1, codigo_programa: 'P-1', nome_programa: 'Alpha' }
    await store.buscarProgramas('Alpha')
    expect(axios.get).not.toHaveBeenCalled()
    expect(store.programas).toEqual([{ id: 1, codigo_programa: 'P-1', nome_programa: 'Alpha' }])
  })

  it('faz busca normalmente quando search difere do nome do programa selecionado', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: [programaMock] })
    const store = useProgramaStore()
    store.programaSelecionado = { id: 1, codigo_programa: 'P-1', nome_programa: 'Alpha' }
    await store.buscarProgramas('Beta')
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('search=Beta'))
  })
})

describe('Integração: buscarBurnupHoras', () => {
  const burnupMock = [
    {
      date_str: '01/2025',
      values: [
        { codigo_programa: 'PROG-1', nome_programa: 'Alpha', horas: 10 },
        { codigo_programa: 'PROG-2', nome_programa: 'Beta', horas: 5 },
      ],
    },
    {
      date_str: '02/2025',
      values: [
        { codigo_programa: 'PROG-1', nome_programa: 'Alpha', horas: 18 },
      ],
    },
  ]

  it('popula burnupHoras com a resposta da API', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: burnupMock })
    const store = useProgramaStore()
    await store.buscarBurnupHoras()
    expect(store.burnupHoras).toEqual(burnupMock)
  })

  it('chama o endpoint /api/programas-burnup-horas', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: [] })
    const store = useProgramaStore()
    await store.buscarBurnupHoras()
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/programas-burnup-horas/'))
  })

  it('finaliza com carregandoBurnup false após resposta', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: [] })
    const store = useProgramaStore()
    await store.buscarBurnupHoras()
    expect(store.carregandoBurnup).toBe(false)
  })

  it('mantém carregandoBurnup false e propaga erro em caso de falha', async () => {
    vi.mocked(axios.get).mockRejectedValueOnce(new Error('boom'))
    const store = useProgramaStore()
    await expect(store.buscarBurnupHoras()).rejects.toThrow('boom')
    expect(store.carregandoBurnup).toBe(false)
  })

  it('aceita resposta vazia (sem registros)', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: [] })
    const store = useProgramaStore()
    await store.buscarBurnupHoras()
    expect(store.burnupHoras).toEqual([])
  })
})

describe('Integração: buscarBurnupCusto', () => {
  const burnupCustoMock = [
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

  it('popula burnupCusto com a resposta da API', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: burnupCustoMock })
    const store = useProgramaStore()
    await store.buscarBurnupCusto()
    expect(store.burnupCusto).toEqual(burnupCustoMock)
  })

  it('chama o endpoint /api/programas-burnup-custo/', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: [] })
    const store = useProgramaStore()
    await store.buscarBurnupCusto()
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/programas-burnup-custo/'))
  })

  it('finaliza com carregandoBurnupCusto false após resposta', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: [] })
    const store = useProgramaStore()
    await store.buscarBurnupCusto()
    expect(store.carregandoBurnupCusto).toBe(false)
  })

  it('mantém carregandoBurnupCusto false e propaga erro em caso de falha', async () => {
    vi.mocked(axios.get).mockRejectedValueOnce(new Error('boom'))
    const store = useProgramaStore()
    await expect(store.buscarBurnupCusto()).rejects.toThrow('boom')
    expect(store.carregandoBurnupCusto).toBe(false)
  })

  it('aceita resposta vazia (sem registros)', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: [] })
    const store = useProgramaStore()
    await store.buscarBurnupCusto()
    expect(store.burnupCusto).toEqual([])
  })
})

describe('Integração: tabela de projetos paginada', () => {
  it('popula a tabela de projetos com a resposta paginada da API', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: tabelaProjetosMock })
    const store = useProgramaStore()
    await store.buscarTabelaProjetos(1)
    expect(store.tabelaProjetos).toEqual(tabelaProjetosMock)
    expect(store.tabelaProjetosItens).toEqual(tabelaProjetosMock.results)
  })

  it('inclui a página na query string ao buscar a tabela', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: tabelaProjetosMock })
    const store = useProgramaStore()
    await store.buscarTabelaProjetos(7, 3)
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/programas/7/tabela-projetos/?page=3'))
  })

  it('inclui sort_by e sort_dir padrão na query string', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: tabelaProjetosMock })
    const store = useProgramaStore()
    await store.buscarTabelaProjetos(1)
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('sort_by=nome_projeto'))
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('sort_dir=asc'))
  })

  it('atualiza tabelaSortBy e tabelaSortDir quando passados explicitamente', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: tabelaProjetosMock })
    const store = useProgramaStore()
    await store.buscarTabelaProjetos(1, 1, 'acao', 'desc')
    expect(store.tabelaSortBy).toBe('acao')
    expect(store.tabelaSortDir).toBe('desc')
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('sort_by=acao'))
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('sort_dir=desc'))
  })

  it('não altera tabelaSortBy/Dir quando sortBy/sortDir são undefined', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: tabelaProjetosMock })
    const store = useProgramaStore()
    store.tabelaSortBy = 'status'
    store.tabelaSortDir = 'desc'
    await store.buscarTabelaProjetos(1, 2)
    expect(store.tabelaSortBy).toBe('status')
    expect(store.tabelaSortDir).toBe('desc')
  })

  it('finaliza com carregandoTabela false após resposta', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: tabelaProjetosMock })
    const store = useProgramaStore()
    await store.buscarTabelaProjetos(1)
    expect(store.carregandoTabela).toBe(false)
  })

  it('finaliza com carregandoTabela false mesmo em caso de erro', async () => {
    vi.mocked(axios.get).mockRejectedValueOnce(new Error('erro'))
    const store = useProgramaStore()
    await expect(store.buscarTabelaProjetos(1)).rejects.toThrow('erro')
    expect(store.carregandoTabela).toBe(false)
  })

  it('limpa a tabela ao remover o programa selecionado', async () => {
    const store = useProgramaStore()
    store.tabelaProjetos = tabelaProjetosMock
    await store.selecionarPrograma(null)
    expect(store.tabelaProjetos).toBeNull()
  })
})

describe('Integração: buscarHorasPorProjeto', () => {
  const horasMock = [
    { nome_projeto: 'Projeto A', horas_realizadas: 10 },
    { nome_projeto: 'Projeto B', horas_realizadas: 0 },
  ]

  it('popula horasPorProjeto com a resposta da API', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: horasMock })
    const store = useProgramaStore()
    await store.buscarHorasPorProjeto(1)
    expect(store.horasPorProjeto).toEqual(horasMock)
  })

  it('chama o endpoint correto com o programaId', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: [] })
    const store = useProgramaStore()
    await store.buscarHorasPorProjeto(7)
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/programas/7/horas-por-projeto/'))
  })

  it('finaliza com carregandoHorasProjeto false após resposta', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: [] })
    const store = useProgramaStore()
    await store.buscarHorasPorProjeto(1)
    expect(store.carregandoHorasProjeto).toBe(false)
  })

  it('finaliza com carregandoHorasProjeto false mesmo em caso de erro', async () => {
    vi.mocked(axios.get).mockRejectedValueOnce(new Error('erro'))
    const store = useProgramaStore()
    await expect(store.buscarHorasPorProjeto(1)).rejects.toThrow('erro')
    expect(store.carregandoHorasProjeto).toBe(false)
  })

  it('aceita resposta vazia', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: [] })
    const store = useProgramaStore()
    await store.buscarHorasPorProjeto(1)
    expect(store.horasPorProjeto).toEqual([])
  })

  it('limpa horasPorProjeto ao selecionar null', async () => {
    const store = useProgramaStore()
    store.horasPorProjeto = horasMock
    await store.selecionarPrograma(null)
    expect(store.horasPorProjeto).toEqual([])
  })
})

describe('Unitário: tabelaSortBy e tabelaSortDir iniciais', () => {
  it('inicia com tabelaSortBy = "nome_projeto"', () => {
    const store = useProgramaStore()
    expect(store.tabelaSortBy).toBe('nome_projeto')
  })

  it('inicia com tabelaSortDir = "asc"', () => {
    const store = useProgramaStore()
    expect(store.tabelaSortDir).toBe('asc')
  })
})

describe('buscarProgramas: retorno antecipado quando programa já selecionado', () => {
  it('não faz requisição se o search bate com o programa já selecionado', async () => {
    const store = useProgramaStore()
    store.programaSelecionado = { id: 1, codigo_programa: 'P-1', nome_programa: 'Alpha' }
    await store.buscarProgramas('Alpha')
    expect(axios.get).not.toHaveBeenCalled()
  })
})

describe('Unitário: limpar', () => {
  it('limpa programaSelecionado, resumo, distribuicaoStatus e tabelaProjetos', () => {
    const store = useProgramaStore()
    store.programaSelecionado = { id: 1, codigo_programa: 'P-1', nome_programa: 'Alpha' }
    store.resumo = { custo_estimado: 1000, custo_real: 900, horas_estimadas: 40, horas_realizadas: 35, total_projetos: 3 }
    store.distribuicaoStatus = { total: 3, status: [] }
    store.tabelaProjetos = tabelaProjetosMock
    store.limpar()
    expect(store.programaSelecionado).toBeNull()
    expect(store.resumo).toBeNull()
    expect(store.distribuicaoStatus).toBeNull()
    expect(store.tabelaProjetos).toBeNull()
  })
})

describe('Unitário: tabelaProjetosItens getter', () => {
  it('retorna array vazio quando tabelaProjetos é null', () => {
    const store = useProgramaStore()
    expect(store.tabelaProjetosItens).toEqual([])
  })

  it('retorna results quando tabelaProjetos está preenchido', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: tabelaProjetosMock })
    const store = useProgramaStore()
    await store.buscarTabelaProjetos(1)
    expect(store.tabelaProjetosItens).toEqual(tabelaProjetosMock.results)
  })
})
