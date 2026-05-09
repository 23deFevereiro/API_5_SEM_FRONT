import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProjetosTable from './ProjetosTable.vue'
import { useProgramaStore } from '@/stores/programa'

const VTooltipStub = {
  props: ['contentClass', 'location'],
  template: '<div class="v-tooltip-stub"><slot name="activator" :props="{}" /><slot /></div>',
}

const globalStubs = {
  'v-icon': { template: '<i class="v-icon-stub"><slot /></i>' },
  'v-progress-circular': { template: '<span class="v-progress-circular-stub" />' },
  'v-tooltip': VTooltipStub,
}

function projetoBase (overrides: Record<string, unknown> = {}) {
  return {
    nome_projeto: 'Projeto A',
    responsavel: 'Maria',
    status: 'Planejamento',
    horas_estimadas: 10,
    horas_realizadas: 8,
    percentual_tarefas_concluidas: 40,
    desvio_horas: -2,
    percentual_desvio: 20,
    data_ultima_atividade: '2025-01-15' as string | null,
    dias_desde_ultima_atividade: 5 as number | null,
    sem_horas_registradas: false,
    acao: 'check-verde',
    ...overrides,
  }
}

const tabelaProjetosMock = {
  count: 12,
  page: 2,
  page_size: 10,
  total_pages: 2,
  results: [
    projetoBase({ nome_projeto: 'Projeto K', responsavel: 'Maria', status: 'Planejamento', acao: 'check-verde' }),
    projetoBase({ nome_projeto: 'Projeto L', responsavel: 'João', status: 'Concluído', acao: 'check-verde' }),
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

describe('ProjetosTable — paginação e layout geral', () => {
  it('exibe o total de projetos e o resumo da paginação', () => {
    const store = useProgramaStore()
    store.programaSelecionado = { id: 1, codigo_programa: 'P-1', nome_programa: 'Programa Alpha' }
    store.tabelaProjetos = tabelaProjetosMock

    const wrapper = montar()

    expect(wrapper.text()).toContain('12 projetos')
    expect(wrapper.text()).toContain('Mostrando 11-12 de 12')
    expect(wrapper.text()).toContain('Página 2 de 2')
  })

  it('exibe singular "1 projeto" quando há exatamente 1 projeto', () => {
    const store = useProgramaStore()
    store.programaSelecionado = { id: 1, codigo_programa: 'P-1', nome_programa: 'Programa Alpha' }
    store.tabelaProjetos = { ...tabelaProjetosMock, count: 1, total_pages: 1, page: 1, results: [projetoBase()] }

    const wrapper = montar()
    expect(wrapper.text()).toContain('1 projeto')
    expect(wrapper.text()).not.toContain('1 projetos')
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

  it('avança para a próxima página ao clicar em Próxima quando está na primeira de duas páginas', async () => {
    const store = useProgramaStore()
    store.programaSelecionado = { id: 1, codigo_programa: 'P-1', nome_programa: 'Programa Alpha' }
    store.tabelaProjetos = { ...tabelaProjetosMock, page: 1, total_pages: 2 }
    store.buscarTabelaProjetos = vi.fn().mockResolvedValue(undefined)

    const wrapper = montar()
    const botoes = wrapper.findAll('button')
    await botoes[1].trigger('click')

    expect(store.buscarTabelaProjetos).toHaveBeenCalledWith(1, 2)
  })

  it('não chama buscarTabelaProjetos quando a página pedida está fora do intervalo', async () => {
    const store = useProgramaStore()
    store.programaSelecionado = { id: 1, codigo_programa: 'P-1', nome_programa: 'Programa Alpha' }
    store.tabelaProjetos = { ...tabelaProjetosMock, page: 1, total_pages: 1 }
    store.buscarTabelaProjetos = vi.fn().mockResolvedValue(undefined)

    const wrapper = montar()
    const [anterior, proxima] = wrapper.findAll('button')

    await anterior.trigger('click')
    await proxima.trigger('click')

    expect(store.buscarTabelaProjetos).not.toHaveBeenCalled()
  })

  it('exibe zero para primeiroItem e ultimoItem quando não há projetos', () => {
    const store = useProgramaStore()
    store.programaSelecionado = { id: 1, codigo_programa: 'P-1', nome_programa: 'Programa Alpha' }
    store.tabelaProjetos = { count: 0, page: 1, page_size: 10, total_pages: 0, results: [] }

    const wrapper = montar()
    expect(wrapper.text()).toContain('Nenhum projeto encontrado')
  })
})

describe('ProjetosTable — estados vazios', () => {
  it('exibe mensagem de seleção quando não há programa selecionado', () => {
    const wrapper = montar()
    expect(wrapper.text()).toContain('Selecione um programa para ver os projetos')
  })

  it('exibe spinner de carregamento quando carregandoTabela=true e sem projetos carregados', () => {
    const store = useProgramaStore()
    store.programaSelecionado = { id: 1, codigo_programa: 'P-1', nome_programa: 'Programa Alpha' }
    store.carregandoTabela = true
    store.tabelaProjetos = null

    const wrapper = montar()
    expect(wrapper.find('.v-progress-circular-stub').exists()).toBe(true)
    expect(wrapper.text()).toContain('Carregando projetos')
  })

  it('exibe mensagem de vazio quando há programa selecionado mas sem projetos', () => {
    const store = useProgramaStore()
    store.programaSelecionado = { id: 1, codigo_programa: 'P-1', nome_programa: 'Programa Alpha' }
    store.tabelaProjetos = { count: 0, page: 1, page_size: 10, total_pages: 0, results: [] }

    const wrapper = montar()
    expect(wrapper.text()).toContain('Nenhum projeto encontrado para este programa')
  })
})

describe('ProjetosTable — badge de status', () => {
  it.each([
    ['Planejamento', 'status-planejamento'],
    ['Em andamento', 'status-desenvolvimento'],
    ['Concluído', 'status-concluido'],
    ['Suspenso', 'status-suspenso'],
    ['Desconhecido', 'status-default'],
  ])('status "%s" aplica classe "%s"', (status, expectedClass) => {
    const store = useProgramaStore()
    store.programaSelecionado = { id: 1, codigo_programa: 'P-1', nome_programa: 'Programa Alpha' }
    store.tabelaProjetos = { ...tabelaProjetosMock, results: [projetoBase({ status })] }

    const wrapper = montar()
    expect(wrapper.html()).toContain(expectedClass)
  })
})

describe('ProjetosTable — badge de ação', () => {
  it.each([
    ['check-verde', 'acao-verde'],
    ['check-amarelo', 'acao-amarelo'],
    ['check-vermelho', 'acao-vermelho'],
    ['priorizar-verde', 'acao-verde'],
    ['priorizar-vermelho', 'acao-vermelho'],
    ['corrigir-status', 'acao-laranja'],
    ['suspenso', 'acao-neutro'],
    ['outro', 'acao-azul'],
  ])('acao="%s" aplica classe "%s"', (acao, expectedClass) => {
    const store = useProgramaStore()
    store.programaSelecionado = { id: 1, codigo_programa: 'P-1', nome_programa: 'Programa Alpha' }
    store.tabelaProjetos = { ...tabelaProjetosMock, results: [projetoBase({ acao })] }

    const wrapper = montar()
    expect(wrapper.html()).toContain(expectedClass)
  })

  it('exibe "Priorizar" para acao priorizar-vermelho', () => {
    const store = useProgramaStore()
    store.programaSelecionado = { id: 1, codigo_programa: 'P-1', nome_programa: 'Programa Alpha' }
    store.tabelaProjetos = { ...tabelaProjetosMock, results: [projetoBase({ acao: 'priorizar-vermelho' })] }

    const wrapper = montar()
    expect(wrapper.text()).toContain('Priorizar')
  })

  it('exibe "Corrigir status" para acao corrigir-status', () => {
    const store = useProgramaStore()
    store.programaSelecionado = { id: 1, codigo_programa: 'P-1', nome_programa: 'Programa Alpha' }
    store.tabelaProjetos = { ...tabelaProjetosMock, results: [projetoBase({ acao: 'corrigir-status' })] }

    const wrapper = montar()
    expect(wrapper.text()).toContain('Corrigir status')
  })

  it('exibe ícone de check para acao check-amarelo', () => {
    const store = useProgramaStore()
    store.programaSelecionado = { id: 1, codigo_programa: 'P-1', nome_programa: 'Programa Alpha' }
    store.tabelaProjetos = { ...tabelaProjetosMock, results: [projetoBase({ acao: 'check-amarelo' })] }

    const wrapper = montar()
    expect(wrapper.html()).toContain('mdi-check-circle')
  })

  it('exibe ícone de interrogação para acao outro', () => {
    const store = useProgramaStore()
    store.programaSelecionado = { id: 1, codigo_programa: 'P-1', nome_programa: 'Programa Alpha' }
    store.tabelaProjetos = { ...tabelaProjetosMock, results: [projetoBase({ acao: 'outro' })] }

    const wrapper = montar()
    expect(wrapper.html()).toContain('mdi-help-circle-outline')
  })
})

describe('ProjetosTable — ordenação', () => {
  it('chama buscarTabelaProjetos com campo e direção asc ao clicar numa coluna diferente da ativa', async () => {
    const store = useProgramaStore()
    store.programaSelecionado = { id: 1, codigo_programa: 'P-1', nome_programa: 'Programa Alpha' }
    store.tabelaProjetos = tabelaProjetosMock
    store.tabelaSortBy = 'nome_projeto'
    store.tabelaSortDir = 'asc'
    store.buscarTabelaProjetos = vi.fn().mockResolvedValue(undefined)

    const wrapper = montar()
    const thResponsavel = wrapper.findAll('th')[1]
    await thResponsavel.trigger('click')

    expect(store.buscarTabelaProjetos).toHaveBeenCalledWith(1, 1, 'responsavel', 'asc')
  })

  it('inverte asc→desc ao clicar na coluna já ordenada em asc', async () => {
    const store = useProgramaStore()
    store.programaSelecionado = { id: 1, codigo_programa: 'P-1', nome_programa: 'Programa Alpha' }
    store.tabelaProjetos = tabelaProjetosMock
    store.tabelaSortBy = 'nome_projeto'
    store.tabelaSortDir = 'asc'
    store.buscarTabelaProjetos = vi.fn().mockResolvedValue(undefined)

    const wrapper = montar()
    const thNome = wrapper.findAll('th')[0]
    await thNome.trigger('click')

    expect(store.buscarTabelaProjetos).toHaveBeenCalledWith(1, 1, 'nome_projeto', 'desc')
  })

  it('inverte desc→asc ao clicar na coluna já ordenada em desc', async () => {
    const store = useProgramaStore()
    store.programaSelecionado = { id: 1, codigo_programa: 'P-1', nome_programa: 'Programa Alpha' }
    store.tabelaProjetos = tabelaProjetosMock
    store.tabelaSortBy = 'status'
    store.tabelaSortDir = 'desc'
    store.buscarTabelaProjetos = vi.fn().mockResolvedValue(undefined)

    const wrapper = montar()
    const thStatus = wrapper.findAll('th')[2]
    await thStatus.trigger('click')

    expect(store.buscarTabelaProjetos).toHaveBeenCalledWith(1, 1, 'status', 'asc')
  })

  it('exibe ↑ para coluna ativa em asc e ⇅ para as demais', () => {
    const store = useProgramaStore()
    store.programaSelecionado = { id: 1, codigo_programa: 'P-1', nome_programa: 'Programa Alpha' }
    store.tabelaProjetos = tabelaProjetosMock
    store.tabelaSortBy = 'nome_projeto'
    store.tabelaSortDir = 'asc'

    const wrapper = montar()
    const headerText = wrapper.find('thead').text()
    expect(headerText).toContain('↑')
    expect(headerText).toContain('⇅')
  })

  it('exibe ↓ quando a coluna ativa está em desc', () => {
    const store = useProgramaStore()
    store.programaSelecionado = { id: 1, codigo_programa: 'P-1', nome_programa: 'Programa Alpha' }
    store.tabelaProjetos = tabelaProjetosMock
    store.tabelaSortBy = 'acao'
    store.tabelaSortDir = 'desc'

    const wrapper = montar()
    expect(wrapper.find('thead').text()).toContain('↓')
  })
})

describe('ProjetosTable — campos adicionais', () => {
  it('formata data_ultima_atividade como dd/mm/aaaa e exibe dias', () => {
    const store = useProgramaStore()
    store.programaSelecionado = { id: 1, codigo_programa: 'P-1', nome_programa: 'Programa Alpha' }
    store.tabelaProjetos = {
      ...tabelaProjetosMock,
      results: [projetoBase({ data_ultima_atividade: '2025-03-07', dias_desde_ultima_atividade: 3 })],
    }

    const wrapper = montar()
    expect(wrapper.text()).toContain('07/03/2025')
    expect(wrapper.text()).toContain('3d')
  })

  it('exibe "—" quando data_ultima_atividade e dias_desde_ultima_atividade são null', () => {
    const store = useProgramaStore()
    store.programaSelecionado = { id: 1, codigo_programa: 'P-1', nome_programa: 'Programa Alpha' }
    store.tabelaProjetos = {
      ...tabelaProjetosMock,
      results: [projetoBase({ data_ultima_atividade: null, dias_desde_ultima_atividade: null })],
    }

    const wrapper = montar()
    expect(wrapper.html()).toContain('—')
  })

  it('exibe tooltip quando sem_horas_registradas é true', () => {
    const store = useProgramaStore()
    store.programaSelecionado = { id: 1, codigo_programa: 'P-1', nome_programa: 'Programa Alpha' }
    store.tabelaProjetos = {
      ...tabelaProjetosMock,
      results: [projetoBase({ sem_horas_registradas: true })],
    }

    const wrapper = montar()
    expect(wrapper.find('.v-tooltip-stub').exists()).toBe(true)
  })

  it('não exibe tooltip quando sem_horas_registradas é false', () => {
    const store = useProgramaStore()
    store.programaSelecionado = { id: 1, codigo_programa: 'P-1', nome_programa: 'Programa Alpha' }
    store.tabelaProjetos = {
      ...tabelaProjetosMock,
      results: [projetoBase({ sem_horas_registradas: false })],
    }

    const wrapper = montar()
    expect(wrapper.find('.v-tooltip-stub').exists()).toBe(false)
  })

  it('exibe "—" para responsável quando é string vazia', () => {
    const store = useProgramaStore()
    store.programaSelecionado = { id: 1, codigo_programa: 'P-1', nome_programa: 'Programa Alpha' }
    store.tabelaProjetos = {
      ...tabelaProjetosMock,
      results: [projetoBase({ responsavel: '' })],
    }

    const wrapper = montar()
    expect(wrapper.text()).toContain('—')
  })
})
