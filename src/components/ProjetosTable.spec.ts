import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProjetosTable from './ProjetosTable.vue'
import { useProgramaStore } from '@/stores/programa'

const globalStubs = {
  'v-icon': { template: '<i class="v-icon-stub"><slot /></i>' },
  'v-progress-circular': { template: '<span class="v-progress-circular-stub" />' },
}

const tabelaProjetosMock = {
  count: 12,
  page: 2,
  page_size: 10,
  total_pages: 2,
  results: [
    {
      nome_projeto: 'Projeto K',
      responsavel: 'Maria',
      status: 'Planejamento',
      horas_estimadas: 10,
      horas_realizadas: 8,
      percentual_tarefas_concluidas: 40,
      desvio_horas: -2,
      percentual_desvio: 20,
    },
    {
      nome_projeto: 'Projeto L',
      responsavel: 'João',
      status: 'Concluído',
      horas_estimadas: 12,
      horas_realizadas: 12,
      percentual_tarefas_concluidas: 100,
      desvio_horas: 0,
      percentual_desvio: 0,
    },
  ],
}

let pinia: ReturnType<typeof createPinia>

function montar () {
  return mount(ProjetosTable, {
    global: {
      plugins: [pinia],
      stubs: globalStubs,
    },
  })
}

beforeEach(() => {
  pinia = createPinia()
  setActivePinia(pinia)
})

describe('ProjetosTable', () => {
  it('exibe o total de projetos e o resumo da paginação', async () => {
    const store = useProgramaStore()
    store.programaSelecionado = { id: 1, codigo_programa: 'P-1', nome_programa: 'Programa Alpha' }
    store.tabelaProjetos = tabelaProjetosMock

    const wrapper = montar()

    expect(wrapper.text()).toContain('12 projetos')
    expect(wrapper.text()).toContain('Mostrando 11-12 de 12')
    expect(wrapper.text()).toContain('Página 2 de 2')
  })

  it('busca a página anterior ao clicar em Anterior', async () => {
    const store = useProgramaStore()
    store.programaSelecionado = { id: 1, codigo_programa: 'P-1', nome_programa: 'Programa Alpha' }
    store.tabelaProjetos = tabelaProjetosMock
    store.buscarTabelaProjetos = vi.fn().mockResolvedValue(undefined)

    const wrapper = montar()
    await wrapper.get('button').trigger('click')

    expect(store.buscarTabelaProjetos).toHaveBeenCalledWith(1, 1)
  })

  it('exibe acao-amarelo e "Monitorar" quando desvioHoras > 0 e percentualDesvio em 1-14', async () => {
    const store = useProgramaStore()
    store.programaSelecionado = { id: 1, codigo_programa: 'P-1', nome_programa: 'Programa Alpha' }
    store.tabelaProjetos = {
      ...tabelaProjetosMock,
      results: [
        {
          nome_projeto: 'Projeto M',
          responsavel: 'Carlos',
          status: 'Em desenvolvimento',
          horas_estimadas: 10,
          horas_realizadas: 11,
          percentual_tarefas_concluidas: 50,
          desvio_horas: 1,
          percentual_desvio: 10,
        },
      ],
    }

    const wrapper = montar()
    expect(wrapper.html()).toContain('acao-amarelo')
    expect(wrapper.text()).toContain('Monitorar')
  })

  it('exibe acao-vermelho e "Revisar urgente" quando percentualDesvio >= 15', async () => {
    const store = useProgramaStore()
    store.programaSelecionado = { id: 1, codigo_programa: 'P-1', nome_programa: 'Programa Alpha' }
    store.tabelaProjetos = {
      ...tabelaProjetosMock,
      results: [
        {
          nome_projeto: 'Projeto N',
          responsavel: 'Bia',
          status: 'Em testes',
          horas_estimadas: 10,
          horas_realizadas: 12,
          percentual_tarefas_concluidas: 60,
          desvio_horas: 2,
          percentual_desvio: 20,
        },
      ],
    }

    const wrapper = montar()
    expect(wrapper.html()).toContain('acao-vermelho')
    expect(wrapper.text()).toContain('Revisar urgente')
  })

  it('exibe status-default para status desconhecido', async () => {
    const store = useProgramaStore()
    store.programaSelecionado = { id: 1, codigo_programa: 'P-1', nome_programa: 'Programa Alpha' }
    store.tabelaProjetos = {
      ...tabelaProjetosMock,
      results: [
        {
          nome_projeto: 'Projeto X',
          responsavel: 'Ze',
          status: 'Desconhecido',
          horas_estimadas: 5,
          horas_realizadas: 5,
          percentual_tarefas_concluidas: 100,
          desvio_horas: 0,
          percentual_desvio: 0,
        },
      ],
    }

    const wrapper = montar()
    expect(wrapper.html()).toContain('status-default')
  })

  it('não chama buscarTabelaProjetos quando a página pedida está fora do intervalo', async () => {
    const store = useProgramaStore()
    store.programaSelecionado = { id: 1, codigo_programa: 'P-1', nome_programa: 'Programa Alpha' }
    // page=1, total_pages=1 → Anterior pediria page 0 (< 1); Próxima pediria page 2 (> 1)
    store.tabelaProjetos = { ...tabelaProjetosMock, page: 1, total_pages: 1 }
    store.buscarTabelaProjetos = vi.fn().mockResolvedValue(undefined)

    const wrapper = montar()
    const [anterior, proxima] = wrapper.findAll('button')

    await anterior.trigger('click')
    await proxima.trigger('click')

    expect(store.buscarTabelaProjetos).not.toHaveBeenCalled()
  })
})
