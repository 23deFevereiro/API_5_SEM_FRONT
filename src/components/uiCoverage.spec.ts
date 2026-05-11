import { mount, shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import CustoCard from './CustoCard.vue'
import FiltroPeriodoBotao from './FiltroPeriodoBotao.vue'
import FuncionarioFilterSelector from './FuncionarioFilterSelector.vue'
import FuncionariosTable from './FuncionariosTable.vue'
import MateriaisAtencaoCard from './MateriaisAtencaoCard.vue'
import MateriaisCriticosCard from './MateriaisCriticosCard.vue'
import MateriaisTable from './MateriaisTable.vue'
import MaterialFilterSelector from './MaterialFilterSelector.vue'
import MaterialSelector from './MaterialSelector.vue'
import ProgramaCards from './ProgramaCards.vue'
import ProgramaSelector from './ProgramaSelector.vue'
import ProjetoSelector from './ProjetoSelector.vue'
import { usePlanejamentoStore } from '@/stores/planejamento'
import { useProgramaStore } from '@/stores/programa'
import { useProjetoStore } from '@/stores/projeto'

const VAutocompleteStub = defineComponent({
  name: 'VAutocomplete',
  props: ['disabled', 'items', 'itemTitle', 'itemValue', 'label', 'loading', 'modelValue', 'placeholder', 'returnObject', 'variant'],
  emits: ['click', 'update:modelValue', 'update:search'],
  template: '<div class="v-autocomplete-stub" @click="$emit(\'click\')">{{ label }}</div>',
})

const VBtnStub = defineComponent({
  name: 'VBtn',
  props: ['color', 'disabled', 'prependIcon', 'variant'],
  emits: ['click'],
  template: '<button :disabled="disabled" @click="$emit(\'click\')"><slot />{{ prependIcon }}</button>',
})

const VTextFieldStub = defineComponent({
  name: 'VTextField',
  props: ['label', 'modelValue', 'type', 'variant'],
  emits: ['update:modelValue'],
  template: '<input :value="modelValue" :aria-label="label" @input="$emit(\'update:modelValue\', $event.target.value)">',
})

const globalStubs = {
  'v-autocomplete': VAutocompleteStub,
  'v-btn': VBtnStub,
  'v-card': { template: '<div class="v-card-stub"><slot /></div>' },
  'v-card-actions': { template: '<div class="v-card-actions-stub"><slot /></div>' },
  'v-card-text': { template: '<div class="v-card-text-stub"><slot /></div>' },
  'v-card-title': { template: '<div class="v-card-title-stub"><slot /></div>' },
  'v-dialog': { template: '<div class="v-dialog-stub"><slot /></div>' },
  'v-icon': { template: '<i class="v-icon-stub"><slot /></i>' },
  'v-progress-circular': { template: '<span class="v-progress-circular-stub" />' },
  'v-spacer': { template: '<div class="v-spacer-stub" />' },
  'v-text-field': VTextFieldStub,
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

describe('UI coverage components', () => {
  it('renderiza CustoCard com e sem resumo', async () => {
    const store = useProjetoStore()
    const wrapper = mount(CustoCard, {
      global: {
        stubs: globalStubs,
      },
    })

    expect(wrapper.text()).toContain('--')

    store.resumo = { custo_total: 1234.5, tempo_total: 9.5 }
    await nextTick()

    expect(wrapper.text()).toContain('R$')
    expect(wrapper.text()).toContain('9.5h')
  })

  it('renderiza ProgramaCards com os valores do resumo do programa', () => {
    const store = useProgramaStore()
    store.resumo = {
      custo_estimado: 1000,
      custo_real: 900,
      horas_estimadas: 40,
      horas_realizadas: 35,
      total_projetos: 3,
    }

    const wrapper = mount(ProgramaCards, {
      global: {
        stubs: globalStubs,
      },
    })

    expect(wrapper.text()).toContain('Custos do Programa')
    expect(wrapper.text()).toContain('Horas do Programa')
    expect(wrapper.text()).toContain('Quantidade de Projetos')
    expect(wrapper.text()).toContain('3')
  })

  it('aplica e limpa o filtro de período', async () => {
    const store = useProjetoStore()
    store.filtroDataInicio = '2025-01-10'
    store.filtroDataFim = '2025-02-15'
    store.aplicarPeriodo = vi.fn().mockResolvedValue(undefined)

    const wrapper = mount(FiltroPeriodoBotao, {
      global: {
        stubs: globalStubs,
      },
    })

    expect(wrapper.text()).toContain('10/01/2025 → 15/02/2025')

    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('2025-03-20')
    await inputs[1].setValue('2025-03-10')
    await wrapper.findAll('button')[3].trigger('click')

    expect(wrapper.text()).toContain('A data de início deve ser anterior ou igual à data de fim.')

    await inputs[0].setValue('2025-03-01')
    await inputs[1].setValue('2025-03-10')
    await wrapper.findAll('button')[3].trigger('click')

    expect(store.aplicarPeriodo).toHaveBeenCalledWith('2025-03-01', '2025-03-10')

    await wrapper.findAll('button')[1].trigger('click')
    expect(store.aplicarPeriodo).toHaveBeenCalledWith(null, null)
  })

  it('sincroniza os campos quando a store é atualizada externamente', async () => {
    const store = useProjetoStore()
    store.filtroDataInicio = null
    store.filtroDataFim = null
    store.aplicarPeriodo = vi.fn().mockResolvedValue(undefined)

    const wrapper = mount(FiltroPeriodoBotao, {
      global: {
        stubs: globalStubs,
      },
    })

    store.filtroDataInicio = '2025-05-01'
    store.filtroDataFim = '2025-05-31'
    await nextTick()

    expect(wrapper.text()).not.toContain('Filtrar período')
  })

  it('sincroniza e aplica os filtros de funcionário e material', async () => {
    const projetoStore = useProjetoStore()
    projetoStore.nomesFuncionarios = ['Ana', 'Bruno']
    projetoStore.materiaisDisponiveis = [{ id: 1, descricao: 'Capacitor' }]
    projetoStore.aplicarFiltroFuncionario = vi.fn().mockResolvedValue(undefined)
    projetoStore.aplicarFiltroMaterial = vi.fn().mockResolvedValue(undefined)

    const funcionarioWrapper = mount(FuncionarioFilterSelector, {
      global: {
        stubs: globalStubs,
      },
      props: {
        disabled: true,
      },
    })
    const materialWrapper = mount(MaterialFilterSelector, {
      global: {
        stubs: globalStubs,
      },
    })

    funcionarioWrapper.getComponent(VAutocompleteStub).vm.$emit('update:modelValue', 'Ana')
    materialWrapper.getComponent(VAutocompleteStub).vm.$emit('update:modelValue', { id: 1, descricao: 'Capacitor' })

    expect(projetoStore.aplicarFiltroFuncionario).toHaveBeenCalledWith('Ana')
    expect(projetoStore.aplicarFiltroMaterial).toHaveBeenCalledWith({ id: 1, descricao: 'Capacitor' })

    projetoStore.filtroFuncionario = 'Bruno'
    projetoStore.filtroMaterial = { id: 2, descricao: 'Resistor' }
    await nextTick()

    expect(funcionarioWrapper.getComponent(VAutocompleteStub).props('modelValue')).toBe('Bruno')
    expect(materialWrapper.getComponent(VAutocompleteStub).props('modelValue')).toEqual({ id: 2, descricao: 'Resistor' })
  })

  it('busca programas e aplica o filtro ao selecionar um programa', async () => {
    const programaStore = useProgramaStore()
    const projetoStore = useProjetoStore()
    programaStore.buscarProgramas = vi.fn().mockResolvedValue(undefined)
    programaStore.selecionarPrograma = vi.fn()
    projetoStore.aplicarFiltroPorPrograma = vi.fn().mockResolvedValue(undefined)

    const wrapper = mount(ProgramaSelector, {
      global: {
        stubs: globalStubs,
      },
    })

    await nextTick()

    expect(programaStore.buscarProgramas).toHaveBeenCalledWith('')

    const autocomplete = wrapper.getComponent(VAutocompleteStub)
    autocomplete.vm.$emit('update:search', 'Programa A')
    autocomplete.vm.$emit('update:modelValue', { id: 7, codigo_programa: 'PG7', nome_programa: 'Programa A' })

    expect(programaStore.buscarProgramas).toHaveBeenCalledWith('Programa A')
    expect(programaStore.selecionarPrograma).toHaveBeenCalledWith({ id: 7, codigo_programa: 'PG7', nome_programa: 'Programa A' })
    expect(projetoStore.aplicarFiltroPorPrograma).toHaveBeenCalledWith(7)
  })

  it('busca projetos, limpa quando recebe null e seleciona quando recebe um projeto', async () => {
    const store = useProjetoStore()
    store.buscarProjetos = vi.fn().mockResolvedValue(undefined)
    store.selecionarProjeto = vi.fn().mockResolvedValue(undefined)
    store.limpar = vi.fn()

    const wrapper = mount(ProjetoSelector, {
      global: {
        stubs: globalStubs,
      },
    })

    await nextTick()
    expect(store.buscarProjetos).toHaveBeenCalledWith('')

    const autocomplete = wrapper.getComponent(VAutocompleteStub)
    autocomplete.vm.$emit('update:search', 'Conversor')
    autocomplete.vm.$emit('update:modelValue', null)
    autocomplete.vm.$emit('update:modelValue', { id: 1, codigo_projeto: 'P001', nome_projeto: 'Conversor' })

    expect(store.buscarProjetos).toHaveBeenCalledWith('Conversor')
    expect(store.limpar).toHaveBeenCalled()
    expect(store.selecionarProjeto).toHaveBeenCalledWith({ id: 1, codigo_projeto: 'P001', nome_projeto: 'Conversor' })
  })

  it('renderiza MateriaisTable e pagina quando há projeto selecionado', async () => {
    const store = useProjetoStore()
    store.projetoSelecionado = { id: 1, codigo_projeto: 'P001', nome_projeto: 'Conversor' }
    store.materiais = {
      count: 2,
      page: 1,
      page_size: 10,
      total_pages: 2,
      results: [{ nome_material: 'Capacitor', custo_total_estimado: 50, quantidade: 5 }],
    }
    store.buscarMateriais = vi.fn().mockResolvedValue(undefined)

    const wrapper = mount(MateriaisTable, {
      global: {
        stubs: globalStubs,
      },
    })

    expect(wrapper.text()).toContain('Materiais')
    expect(wrapper.text()).toContain('Capacitor')

    await wrapper.findAll('button')[1].trigger('click')

    expect(store.buscarMateriais).toHaveBeenCalledWith(1, 2)
  })

  it('renderiza FuncionariosTable e pagina quando há projeto selecionado', async () => {
    const store = useProjetoStore()
    store.projetoSelecionado = { id: 1, codigo_projeto: 'P001', nome_projeto: 'Conversor' }
    store.funcionarios = {
      count: 1,
      page: 2,
      page_size: 10,
      total_pages: 3,
      results: [{ funcionario: 'Ana', total_horas: 6.5, projetos: ['P001'] }],
    }
    store.buscarFuncionarios = vi.fn().mockResolvedValue(undefined)

    const wrapper = mount(FuncionariosTable, {
      global: {
        stubs: globalStubs,
      },
    })

    expect(wrapper.text()).toContain('Funcionários')
    expect(wrapper.text()).toContain('Ana')
    expect(wrapper.text()).toContain('6.5h')

    await wrapper.findAll('button')[1].trigger('click')
    expect(store.buscarFuncionarios).toHaveBeenCalledWith(1, 3)

    store.buscarFuncionarios = vi.fn().mockResolvedValue(undefined)
    await wrapper.findAll('button')[0].trigger('click')
    expect(store.buscarFuncionarios).toHaveBeenCalledWith(1, 1)
  })

  it('mostra estado vazio de FuncionariosTable quando funcionarios.results é vazio', () => {
    const store = useProjetoStore()
    store.projetoSelecionado = { id: 1, codigo_projeto: 'P001', nome_projeto: 'Conversor' }
    store.funcionarios = { count: 0, page: 1, page_size: 10, total_pages: 1, results: [] }

    const wrapper = mount(FuncionariosTable, { global: { stubs: globalStubs } })
    expect(wrapper.text()).toContain('Nenhum funcionário encontrado')
  })

  it('renderiza MateriaisTable e pagina com Anterior quando há projeto selecionado', async () => {
    const store = useProjetoStore()
    store.projetoSelecionado = { id: 1, codigo_projeto: 'P001', nome_projeto: 'Conversor' }
    store.materiais = {
      count: 2,
      page: 2,
      page_size: 10,
      total_pages: 3,
      results: [{ nome_material: 'Capacitor', custo_total_estimado: 50, quantidade: 5 }],
    }
    store.buscarMateriais = vi.fn().mockResolvedValue(undefined)

    const wrapper = mount(MateriaisTable, { global: { stubs: globalStubs } })
    await wrapper.findAll('button')[0].trigger('click')
    expect(store.buscarMateriais).toHaveBeenCalledWith(1, 1)
  })

  it('mostra estado vazio de MateriaisTable quando materiais.results é vazio', () => {
    const store = useProjetoStore()
    store.projetoSelecionado = { id: 1, codigo_projeto: 'P001', nome_projeto: 'Conversor' }
    store.materiais = { count: 0, page: 1, page_size: 10, total_pages: 1, results: [] }

    const wrapper = mount(MateriaisTable, { global: { stubs: globalStubs } })
    expect(wrapper.text()).toContain('Nenhum material encontrado')
  })

  it('abre o diálogo de período ao clicar no botão principal', async () => {
    const store = useProjetoStore()
    store.filtroDataInicio = null
    store.filtroDataFim = null
    store.aplicarPeriodo = vi.fn().mockResolvedValue(undefined)

    const wrapper = mount(FiltroPeriodoBotao, { global: { stubs: globalStubs } })

    await wrapper.findAll('button')[0].trigger('click')

    expect(wrapper.text()).not.toContain('data de início deve ser anterior')
  })

  it('mostra estados vazios das tabelas quando não há projeto selecionado', () => {
    const wrapperMateriais = shallowMount(MateriaisTable, {
      global: {
        stubs: globalStubs,
      },
    })
    const wrapperFuncionarios = shallowMount(FuncionariosTable, {
      global: {
        stubs: globalStubs,
      },
    })

    expect(wrapperMateriais.text()).toContain('Selecione um projeto para ver os materiais')
    expect(wrapperFuncionarios.text()).toContain('Selecione um projeto para ver os funcionários')
  })

  it('mostra estado carregando de FuncionariosTable quando carregandoFuncionarios é true', () => {
    const store = useProjetoStore()
    store.projetoSelecionado = { id: 1, codigo_projeto: 'P001', nome_projeto: 'Conversor' }
    store.carregandoFuncionarios = true

    const wrapper = mount(FuncionariosTable, { global: { stubs: globalStubs } })
    expect(wrapper.text()).toContain('Carregando funcionários...')
  })

  it('retorna primeiroItem=0 e ultimoItem=0 quando FuncionariosTable count=0 com resultados', () => {
    const store = useProjetoStore()
    store.projetoSelecionado = { id: 1, codigo_projeto: 'P001', nome_projeto: 'Conversor' }
    store.funcionarios = {
      count: 0,
      page: 1,
      page_size: 10,
      total_pages: 2,
      results: [{ funcionario: 'Ana', total_horas: 6.5, projetos: ['P001'] }],
    }
    const wrapper = mount(FuncionariosTable, { global: { stubs: globalStubs } })
    expect(wrapper.text()).toContain('0-')
  })

  it('mostra estado carregando de MateriaisTable quando carregandoMateriais é true', () => {
    const store = useProjetoStore()
    store.projetoSelecionado = { id: 1, codigo_projeto: 'P001', nome_projeto: 'Conversor' }
    store.carregandoMateriais = true

    const wrapper = mount(MateriaisTable, { global: { stubs: globalStubs } })
    expect(wrapper.text()).toContain('Carregando materiais...')
  })

  it('exibe singular item na MateriaisTable quando count é 1', () => {
    const store = useProjetoStore()
    store.projetoSelecionado = { id: 1, codigo_projeto: 'P001', nome_projeto: 'Conversor' }
    store.materiais = {
      count: 1,
      page: 1,
      page_size: 10,
      total_pages: 1,
      results: [{ nome_material: 'Resistor', custo_total_estimado: 10, quantidade: 1 }],
    }
    const wrapper = mount(MateriaisTable, { global: { stubs: globalStubs } })
    expect(wrapper.text()).toContain('1 item')
  })

  it('retorna primeiroItem=0 e ultimoItem=0 quando MateriaisTable count=0 com resultados', () => {
    const store = useProjetoStore()
    store.projetoSelecionado = { id: 1, codigo_projeto: 'P001', nome_projeto: 'Conversor' }
    store.materiais = {
      count: 0,
      page: 1,
      page_size: 10,
      total_pages: 2,
      results: [{ nome_material: 'Resistor', custo_total_estimado: 10, quantidade: 1 }],
    }
    const wrapper = mount(MateriaisTable, { global: { stubs: globalStubs } })
    expect(wrapper.text()).toContain('0-')
  })

  it('MaterialSelector: chama buscarMateriais no mount', async () => {
    const store = usePlanejamentoStore()
    store.buscarMateriais = vi.fn().mockResolvedValue(undefined)
    mount(MaterialSelector, { global: { stubs: globalStubs } })
    await nextTick()
    expect(store.buscarMateriais).toHaveBeenCalled()
  })

  it('MaterialSelector: seleciona material ao emitir update:modelValue', async () => {
    const store = usePlanejamentoStore()
    store.buscarMateriais = vi.fn().mockResolvedValue(undefined)
    store.selecionarMaterial = vi.fn().mockResolvedValue(undefined)
    const wrapper = mount(MaterialSelector, { global: { stubs: globalStubs } })
    await nextTick()
    const autocomplete = wrapper.getComponent(VAutocompleteStub)
    autocomplete.vm.$emit('update:modelValue', { id: 2, codigo_material: 'M002', descricao: 'Resistor' })
    expect(store.selecionarMaterial).toHaveBeenCalledWith({ id: 2, codigo_material: 'M002', descricao: 'Resistor' })
  })

  it('MaterialSelector: chama selecionarMaterial com null ao limpar', async () => {
    const store = usePlanejamentoStore()
    store.buscarMateriais = vi.fn().mockResolvedValue(undefined)
    store.selecionarMaterial = vi.fn().mockResolvedValue(undefined)
    const wrapper = mount(MaterialSelector, { global: { stubs: globalStubs } })
    await nextTick()
    const autocomplete = wrapper.getComponent(VAutocompleteStub)
    autocomplete.vm.$emit('update:modelValue', null)
    expect(store.selecionarMaterial).toHaveBeenCalledWith(null)
  })

  it('MateriaisCriticosCard: mostra estado carregando', () => {
    const store = usePlanejamentoStore()
    store.buscarAlertas = vi.fn()
    store.carregandoAlertas = true
    const wrapper = mount(MateriaisCriticosCard, { global: { stubs: globalStubs } })
    expect(wrapper.text()).toContain('Carregando')
    expect(wrapper.find('.v-progress-circular-stub').exists()).toBe(true)
  })

  it('MateriaisCriticosCard: mostra estado vazio sem críticos', () => {
    const store = usePlanejamentoStore()
    store.buscarAlertas = vi.fn()
    store.carregandoAlertas = false
    store.alertas = { criticos: [], atencao: [] }
    const wrapper = mount(MateriaisCriticosCard, { global: { stubs: globalStubs } })
    expect(wrapper.text()).toContain('Nenhum material crítico')
  })

  it('MateriaisCriticosCard: exibe materiais críticos com dias e fornecedor', () => {
    const store = usePlanejamentoStore()
    store.buscarAlertas = vi.fn()
    store.carregandoAlertas = false
    store.alertas = {
      criticos: [{ material: 'Sensor', dias_para_pedir: 5, lead_time_min: 2, fornecedor: 'Fornecedor A', dias_cobertura: 7 }],
      atencao: [],
    }
    const wrapper = mount(MateriaisCriticosCard, { global: { stubs: globalStubs } })
    expect(wrapper.text()).toContain('Sensor')
    expect(wrapper.text()).toContain('Estoque para 7 dias')
    expect(wrapper.text()).toContain('pedir em 5 dias')
    expect(wrapper.text()).toContain('Fornecedor A')
  })

  it('MateriaisCriticosCard: exibe "Pedido urgente" para dias_para_pedir <= 0', () => {
    const store = usePlanejamentoStore()
    store.buscarAlertas = vi.fn()
    store.carregandoAlertas = false
    store.alertas = {
      criticos: [{ material: 'LED', dias_para_pedir: -2, lead_time_min: 5, fornecedor: 'F1', dias_cobertura: 0 }],
      atencao: [],
    }
    const wrapper = mount(MateriaisCriticosCard, { global: { stubs: globalStubs } })
    expect(wrapper.text()).toContain('Pedido urgente')
  })

  it('MateriaisCriticosCard: chama buscarAlertas no mount', () => {
    const store = usePlanejamentoStore()
    store.buscarAlertas = vi.fn()
    mount(MateriaisCriticosCard, { global: { stubs: globalStubs } })
    expect(store.buscarAlertas).toHaveBeenCalled()
  })

  it('MateriaisCriticosCard: exibe badge com criticoMax do store', () => {
    const store = usePlanejamentoStore()
    store.buscarAlertas = vi.fn()
    store.carregandoAlertas = false
    store.alertas = { criticos: [], atencao: [] }
    store.criticoMax = 90
    const wrapper = mount(MateriaisCriticosCard, { global: { stubs: globalStubs } })
    expect(wrapper.text()).toContain('0–90 dias')
  })

  it('MateriaisCriticosCard: input chama setCriticoMax ao mudar', async () => {
    const store = usePlanejamentoStore()
    store.buscarAlertas = vi.fn()
    store.setCriticoMax = vi.fn()
    store.carregandoAlertas = false
    store.alertas = { criticos: [], atencao: [] }
    const wrapper = mount(MateriaisCriticosCard, { global: { stubs: globalStubs } })
    const input = wrapper.find('input[type="number"]')
    await input.setValue('90')
    await input.trigger('change')
    expect(store.setCriticoMax).toHaveBeenCalledWith(90)
  })

  it('MateriaisAtencaoCard: mostra estado carregando', () => {
    const store = usePlanejamentoStore()
    store.carregandoAlertas = true
    const wrapper = mount(MateriaisAtencaoCard, { global: { stubs: globalStubs } })
    expect(wrapper.text()).toContain('Carregando')
    expect(wrapper.find('.v-progress-circular-stub').exists()).toBe(true)
  })

  it('MateriaisAtencaoCard: mostra estado vazio sem atenção', () => {
    const store = usePlanejamentoStore()
    store.carregandoAlertas = false
    store.alertas = { criticos: [], atencao: [] }
    const wrapper = mount(MateriaisAtencaoCard, { global: { stubs: globalStubs } })
    expect(wrapper.text()).toContain('Nenhum material em atenção')
  })

  it('MateriaisAtencaoCard: exibe materiais em atenção com dias e fornecedor', () => {
    const store = usePlanejamentoStore()
    store.carregandoAlertas = false
    store.alertas = {
      criticos: [],
      atencao: [{ material: 'Resistor', dias_para_pedir: 40, lead_time_min: 10, fornecedor: 'Fornecedor B', dias_cobertura: 50 }],
    }
    const wrapper = mount(MateriaisAtencaoCard, { global: { stubs: globalStubs } })
    expect(wrapper.text()).toContain('Resistor')
    expect(wrapper.text()).toContain('Estoque para 50 dias')
    expect(wrapper.text()).toContain('pedir em 40 dias')
    expect(wrapper.text()).toContain('Fornecedor B')
  })

  it('MateriaisAtencaoCard: usa "dia" no singular quando dias_para_pedir é 1', () => {
    const store = usePlanejamentoStore()
    store.carregandoAlertas = false
    store.alertas = {
      criticos: [],
      atencao: [{ material: 'X', dias_para_pedir: 1, lead_time_min: 30, fornecedor: 'F', dias_cobertura: 31 }],
    }
    const wrapper = mount(MateriaisAtencaoCard, { global: { stubs: globalStubs } })
    expect(wrapper.text()).toContain('pedir em 1 dia')
    expect(wrapper.text()).toContain('Estoque para 31 dias')
  })

  it('MateriaisAtencaoCard: badge exibe range correto baseado no store', () => {
    const store = usePlanejamentoStore()
    store.carregandoAlertas = false
    store.alertas = { criticos: [], atencao: [] }
    store.criticoMax = 90
    store.atencaoMax = 180
    const wrapper = mount(MateriaisAtencaoCard, { global: { stubs: globalStubs } })
    expect(wrapper.text()).toContain('91–180 dias')
  })

  it('MateriaisAtencaoCard: input chama setAtencaoMax ao mudar', async () => {
    const store = usePlanejamentoStore()
    store.setAtencaoMax = vi.fn()
    store.carregandoAlertas = false
    store.alertas = { criticos: [], atencao: [] }
    const wrapper = mount(MateriaisAtencaoCard, { global: { stubs: globalStubs } })
    const input = wrapper.find('input[type="number"]')
    await input.setValue('120')
    await input.trigger('change')
    expect(store.setAtencaoMax).toHaveBeenCalledWith(120)
  })
})
