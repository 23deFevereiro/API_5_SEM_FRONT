import { mount, shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import CustoCard from './CustoCard.vue'
import FiltroPeriodoBotao from './FiltroPeriodoBotao.vue'
import FuncionarioFilterSelector from './FuncionarioFilterSelector.vue'
import FuncionariosTable from './FuncionariosTable.vue'
import MateriaisTable from './MateriaisTable.vue'
import MaterialFilterSelector from './MaterialFilterSelector.vue'
import ProgramaCards from './ProgramaCards.vue'
import ProgramaSelector from './ProgramaSelector.vue'
import ProjetoSelector from './ProjetoSelector.vue'
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
      page: 1,
      page_size: 10,
      total_pages: 2,
      results: [{ usuario: 'Ana', total_horas: 6.5, projetos: ['P001'] }],
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

    expect(store.buscarFuncionarios).toHaveBeenCalledWith(1, 2)
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
})
