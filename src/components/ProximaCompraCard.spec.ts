import axios from 'axios'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createVuetify } from 'vuetify'
import ProximaCompraCard from './ProximaCompraCard.vue'
import { usePlanejamentoStore } from '@/stores/planejamento'

vi.mock('axios')

const vuetify = createVuetify()

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

function mountCard () {
  return mount(ProximaCompraCard, {
    global: {
      plugins: [vuetify],
    },
  })
}

describe('ProximaCompraCard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    vi.mocked(axios.get).mockResolvedValue({
      data: sugestaoMock,
    })
  })

  it('renderiza estado de carregamento', () => {
    const store = usePlanejamentoStore()
    store.carregandoSugestaoCompra = true

    const wrapper = mountCard()

    expect(wrapper.text()).toContain('Próxima compra')
  })

  it('renderiza mensagem de compra imediata', () => {
  const store = usePlanejamentoStore()

  store.sugestaoProximaCompra = {
    data_sugerida: null,
    comprar_imediatamente: true,
    materiais: [
      {
        material_id: 1,
        material: 'Capacitor',
        fornecedor_sugerido: 'Fornecedor Alpha',
        dias_cobertura: 20,
        lead_time: 5,
        data_limite_compra: '2025-05-28',
        comprar_imediatamente: true,
      },
    ],
  }

  const wrapper = mountCard()

  expect(wrapper.text()).toContain('Imediatamente')
})

it('renderiza data sugerida', () => {
  const store = usePlanejamentoStore()

  store.sugestaoProximaCompra = {
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

  const wrapper = mountCard()

  expect(wrapper.text()).toContain('01/06/2025')
})

it('renderiza materiais da sugestão', async () => {
  const store = usePlanejamentoStore()
  store.sugestaoProximaCompra = sugestaoMock

  const wrapper = mountCard()

  const button = wrapper.find('button')
  await button.trigger('click')

  expect(wrapper.text()).toContain('Capacitor')
})
})