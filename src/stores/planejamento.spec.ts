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
    valor_total: 105,
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

const alertasMock = {
  criticos: [
    { material: 'Sensor', dias_para_pedir: 3, lead_time_min: 2, fornecedor: 'F1', dias_cobertura: 5 },
  ],
  atencao: [
    { material: 'Resistor', dias_para_pedir: 40, lead_time_min: 10, fornecedor: 'F2', dias_cobertura: 50 },
  ],
}

describe('Unitário: estado inicial — alertas', () => {
  it('inicia com alertas vazios', () => {
    const store = usePlanejamentoStore()
    expect(store.alertas).toEqual({ criticos: [], atencao: [] })
  })

  it('inicia com carregandoAlertas false', () => {
    const store = usePlanejamentoStore()
    expect(store.carregandoAlertas).toBe(false)
  })

  it('inicia com criticoMax 30', () => {
    const store = usePlanejamentoStore()
    expect(store.criticoMax).toBe(30)
  })

  it('inicia com atencaoMax 60', () => {
    const store = usePlanejamentoStore()
    expect(store.atencaoMax).toBe(60)
  })
})

describe('Integração: buscarAlertas', () => {
  it('busca alertas da API e armazena no state', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: alertasMock })
    const store = usePlanejamentoStore()
    await store.buscarAlertas()
    expect(store.alertas).toEqual(alertasMock)
  })

  it('chama a url correta', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: alertasMock })
    const store = usePlanejamentoStore()
    await store.buscarAlertas()
    expect(vi.mocked(axios.get).mock.calls[0][0]).toContain('/api/compras/alertas/')
  })

  it('envia critico_max e atencao_max como params', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: alertasMock })
    const store = usePlanejamentoStore()
    store.criticoMax = 90
    store.atencaoMax = 180
    await store.buscarAlertas()
    const callArgs = vi.mocked(axios.get).mock.calls[0]
    expect(callArgs[1]).toEqual({ params: { critico_max: 90, atencao_max: 180 } })
  })

  it('setCriticoMax atualiza criticoMax e chama buscarAlertas', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: alertasMock })
    const store = usePlanejamentoStore()
    store.setCriticoMax(90)
    expect(store.criticoMax).toBe(90)
    expect(vi.mocked(axios.get)).toHaveBeenCalled()
  })

  it('setCriticoMax ajusta atencaoMax para criticoMax + 30', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: alertasMock })
    const store = usePlanejamentoStore()
    store.setCriticoMax(50)
    expect(store.criticoMax).toBe(50)
    expect(store.atencaoMax).toBe(80)
  })

  it('setAtencaoMax atualiza atencaoMax e chama buscarAlertas', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: alertasMock })
    const store = usePlanejamentoStore()
    store.setAtencaoMax(120)
    expect(store.atencaoMax).toBe(120)
    expect(vi.mocked(axios.get)).toHaveBeenCalled()
  })

  it('setAtencaoMax não permite valor menor ou igual a criticoMax', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: alertasMock })
    const store = usePlanejamentoStore()
    store.criticoMax = 30
    store.setAtencaoMax(10)
    expect(store.atencaoMax).toBe(31)
  })

  it('desliga carregandoAlertas após sucesso', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: alertasMock })
    const store = usePlanejamentoStore()
    await store.buscarAlertas()
    expect(store.carregandoAlertas).toBe(false)
  })

  it('desliga carregandoAlertas após erro', async () => {
    vi.mocked(axios.get).mockRejectedValueOnce(new Error('fail'))
    const store = usePlanejamentoStore()
    await store.buscarAlertas().catch(() => {})
    expect(store.carregandoAlertas).toBe(false)
  })
})

const tabelaMock = {
  count: 2,
  page: 1,
  page_size: 5,
  total_pages: 1,
  results: [
    { material: 'Sensor', projeto: 'Projeto A', estoque_atual: 5, consumo_previsto: 1, dias_ate_acabar: 5, status: 'Urgente' },
    { material: 'Resistor', projeto: 'Projeto B', estoque_atual: 50, consumo_previsto: 0.5, dias_ate_acabar: 100, status: 'Ok' },
  ],
}

describe('Unitário: estado inicial — tabelaEstoque', () => {
  it('inicia com tabelaEstoque vazia', () => {
    const store = usePlanejamentoStore()
    expect(store.tabelaEstoque.count).toBe(0)
    expect(store.tabelaEstoque.results).toEqual([])
  })

  it('inicia com carregandoTabela false', () => {
    const store = usePlanejamentoStore()
    expect(store.carregandoTabela).toBe(false)
  })
})

describe('Integração: buscarTabelaEstoque', () => {
  it('busca tabela da API e armazena no state', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: tabelaMock })
    const store = usePlanejamentoStore()
    await store.buscarTabelaEstoque(1)
    expect(store.tabelaEstoque).toEqual(tabelaMock)
  })

  it('chama a url correta', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: tabelaMock })
    const store = usePlanejamentoStore()
    await store.buscarTabelaEstoque(1)
    expect(vi.mocked(axios.get).mock.calls[0][0]).toContain('/api/compras/estoque-tabela/')
  })

  it('envia critico_max, atencao_max e page como params', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: tabelaMock })
    const store = usePlanejamentoStore()
    store.criticoMax = 45
    store.atencaoMax = 90
    await store.buscarTabelaEstoque(2)
    const callArgs = vi.mocked(axios.get).mock.calls[0]
    expect(callArgs[1]).toEqual({ params: { critico_max: 45, atencao_max: 90, page: 2, sort_by: 'status', sort_dir: 'asc' } })
  })

  it('desliga carregandoTabela após sucesso', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: tabelaMock })
    const store = usePlanejamentoStore()
    await store.buscarTabelaEstoque(1)
    expect(store.carregandoTabela).toBe(false)
  })

  it('desliga carregandoTabela após erro', async () => {
    vi.mocked(axios.get).mockRejectedValueOnce(new Error('fail'))
    const store = usePlanejamentoStore()
    await store.buscarTabelaEstoque(1).catch(() => {})
    expect(store.carregandoTabela).toBe(false)
  })

  it('setCriticoMax também chama buscarTabelaEstoque', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: tabelaMock })
    const store = usePlanejamentoStore()
    store.buscarTabelaEstoque = vi.fn()
    store.buscarAlertas = vi.fn()
    store.setCriticoMax(50)
    expect(store.buscarTabelaEstoque).toHaveBeenCalledWith(1)
  })

  it('setAtencaoMax também chama buscarTabelaEstoque', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: tabelaMock })
    const store = usePlanejamentoStore()
    store.buscarTabelaEstoque = vi.fn()
    store.buscarAlertas = vi.fn()
    store.setAtencaoMax(100)
    expect(store.buscarTabelaEstoque).toHaveBeenCalledWith(1)
  })

  it('envia material_id quando material está selecionado', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: tabelaMock })
    const store = usePlanejamentoStore()
    store.materialSelecionado = { id: 5, codigo_material: 'M005', descricao: 'Sensor' }
    await store.buscarTabelaEstoque(1)
    const callArgs = vi.mocked(axios.get).mock.calls[0]
    expect(callArgs[1]).toEqual({ params: { critico_max: 30, atencao_max: 60, page: 1, material_id: 5, sort_by: 'status', sort_dir: 'asc' } })
  })

  it('não envia material_id quando nenhum material está selecionado', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: tabelaMock })
    const store = usePlanejamentoStore()
    await store.buscarTabelaEstoque(1)
    const callArgs = vi.mocked(axios.get).mock.calls[0]
    expect(callArgs[1]).toEqual({ params: { critico_max: 30, atencao_max: 60, page: 1, sort_by: 'status', sort_dir: 'asc' } })
  })
})

const sugestaoMock = {
  data_sugerida: '2025-06-01',
  comprar_imediatamente: false,
  materiais: [
    {
      material_id: 1,
      material: 'Capacitor',
      fornecedor_sugerido: 'Fornecedor Alpha',
      dias_cobertura: 20,
      lead_time: 5,
      data_limite_compra: '2025-05-28',
      comprar_imediatamente: false,
    },
  ],
}

describe('Integração: buscarSugestaoProximaCompra', () => {
  it('busca sugestão da API e armazena no state', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: sugestaoMock })

    const store = usePlanejamentoStore()

    await store.buscarSugestaoProximaCompra()

    expect(store.sugestaoProximaCompra).toEqual(sugestaoMock)
  })

  it('chama a url correta', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: sugestaoMock })

    const store = usePlanejamentoStore()

    await store.buscarSugestaoProximaCompra()

    expect(vi.mocked(axios.get).mock.calls[0][0])
      .toContain('/api/compras/sugestao-proxima-compra/')
  })

  it('ativa carregandoSugestaoCompra durante a busca', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: sugestaoMock })

    const store = usePlanejamentoStore()

    const promise = store.buscarSugestaoProximaCompra()

    expect(store.carregandoSugestaoCompra).toBe(true)

    await promise
  })

  it('desliga carregandoSugestaoCompra após sucesso', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: sugestaoMock })

    const store = usePlanejamentoStore()

    await store.buscarSugestaoProximaCompra()

    expect(store.carregandoSugestaoCompra).toBe(false)
  })

  it('desliga carregandoSugestaoCompra após erro', async () => {
    vi.mocked(axios.get).mockRejectedValueOnce(new Error('fail'))

    const store = usePlanejamentoStore()

    await store.buscarSugestaoProximaCompra().catch(() => {})

    expect(store.carregandoSugestaoCompra).toBe(false)
  })
})
