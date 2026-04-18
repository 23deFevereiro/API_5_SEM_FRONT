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
})
