import axios from 'axios'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useProgramaStore } from './programa'

vi.mock('axios')

const programaMock = {
  id: 1,
  nome: 'Programa Alpha',
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
})

describe('Unitário: selecionarPrograma', () => {
  it('define o programa selecionado', () => {
    const store = useProgramaStore()
    store.selecionarPrograma(programaMock)
    expect(store.programaSelecionado).toEqual(programaMock)
  })

  it('aceita null para limpar a selecao', () => {
    const store = useProgramaStore()
    store.programaSelecionado = programaMock
    store.selecionarPrograma(null)
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
