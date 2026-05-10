import axios from 'axios'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePlanejamentoStore } from './planejamento'

vi.mock('axios')

const materialMock = {
  id: 1,
  codigo_material: 'M001',
  descricao: 'Capacitor 100nF',
}

const leadTimeMock = [
  {
    fornecedor: 'Fornecedor Alpha',
    lead_time: 15,
    valor_unidade: 10.5,
    valor_total: 105.0,
    status: 'Entregue',
    categoria_status: 'Concluído',
    data_pedido: '2024-01-15',
  },
]

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

describe('Unitário: estado inicial', () => {
  it('inicia com materiais vazios', () => {
    const store = usePlanejamentoStore()
    expect(store.materiais).toEqual([])
  })

  it('inicia sem material selecionado', () => {
    const store = usePlanejamentoStore()
    expect(store.materialSelecionado).toBeNull()
  })

  it('inicia com leadTimeData vazio', () => {
    const store = usePlanejamentoStore()
    expect(store.leadTimeData).toEqual([])
  })

  it('inicia com carregandoMateriais false', () => {
    const store = usePlanejamentoStore()
    expect(store.carregandoMateriais).toBe(false)
  })

  it('inicia com carregandoLeadTime false', () => {
    const store = usePlanejamentoStore()
    expect(store.carregandoLeadTime).toBe(false)
  })
})

describe('Unitário: limpar', () => {
  it('limpa o material selecionado', () => {
    const store = usePlanejamentoStore()
    store.materialSelecionado = materialMock
    store.limpar()
    expect(store.materialSelecionado).toBeNull()
  })

  it('limpa o leadTimeData', () => {
    const store = usePlanejamentoStore()
    store.leadTimeData = leadTimeMock
    store.limpar()
    expect(store.leadTimeData).toEqual([])
  })
})

describe('Integração: buscarMateriais', () => {
  it('busca materiais da API e armazena no state', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: [materialMock] })
    const store = usePlanejamentoStore()
    await store.buscarMateriais()
    expect(store.materiais).toEqual([materialMock])
  })

  it('não faz chamada se materiais já estão carregados', async () => {
    const store = usePlanejamentoStore()
    store.materiais = [materialMock]
    await store.buscarMateriais()
    expect(axios.get).not.toHaveBeenCalled()
  })

  it('desliga carregandoMateriais após sucesso', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: [] })
    const store = usePlanejamentoStore()
    await store.buscarMateriais()
    expect(store.carregandoMateriais).toBe(false)
  })

  it('desliga carregandoMateriais após erro', async () => {
    vi.mocked(axios.get).mockRejectedValueOnce(new Error('fail'))
    const store = usePlanejamentoStore()
    await store.buscarMateriais().catch(() => {})
    expect(store.carregandoMateriais).toBe(false)
  })
})

describe('Integração: selecionarMaterial', () => {
  it('armazena o material selecionado', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: leadTimeMock })
    const store = usePlanejamentoStore()
    await store.selecionarMaterial(materialMock)
    expect(store.materialSelecionado).toEqual(materialMock)
  })

  it('busca lead time ao selecionar material', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: leadTimeMock })
    const store = usePlanejamentoStore()
    await store.selecionarMaterial(materialMock)
    expect(store.leadTimeData).toEqual(leadTimeMock)
  })

  it('chama a url correta com o material_id', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: [] })
    const store = usePlanejamentoStore()
    await store.selecionarMaterial(materialMock)
    expect(vi.mocked(axios.get).mock.calls[0][0]).toContain('material_id=1')
  })

  it('limpa leadTimeData ao selecionar null', async () => {
    const store = usePlanejamentoStore()
    store.leadTimeData = leadTimeMock
    await store.selecionarMaterial(null)
    expect(store.leadTimeData).toEqual([])
  })

  it('limpa materialSelecionado ao selecionar null', async () => {
    const store = usePlanejamentoStore()
    store.materialSelecionado = materialMock
    await store.selecionarMaterial(null)
    expect(store.materialSelecionado).toBeNull()
  })

  it('não chama a API ao selecionar null', async () => {
    const store = usePlanejamentoStore()
    await store.selecionarMaterial(null)
    expect(axios.get).not.toHaveBeenCalled()
  })

  it('desliga carregandoLeadTime após sucesso', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: [] })
    const store = usePlanejamentoStore()
    await store.selecionarMaterial(materialMock)
    expect(store.carregandoLeadTime).toBe(false)
  })

  it('desliga carregandoLeadTime após erro', async () => {
    vi.mocked(axios.get).mockRejectedValueOnce(new Error('fail'))
    const store = usePlanejamentoStore()
    await store.selecionarMaterial(materialMock).catch(() => {})
    expect(store.carregandoLeadTime).toBe(false)
  })

  it('reseta leadTimeData antes de buscar novo material', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: leadTimeMock })
    const store = usePlanejamentoStore()
    store.leadTimeData = [{ ...leadTimeMock[0], fornecedor: 'Antigo' }]
    await store.selecionarMaterial(materialMock)
    expect(store.leadTimeData).toEqual(leadTimeMock)
  })
})
