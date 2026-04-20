<template>
  <div class="filtro-periodo">
    <v-btn
      :color="periodoAtivo ? 'primary' : undefined"
      :disabled="disabled"
      prepend-icon="mdi-calendar-range"
      :variant="periodoAtivo ? 'tonal' : 'outlined'"
      @click="abrir"
    >
      {{ periodoAtivo ? labelPeriodo : 'Filtrar período' }}
    </v-btn>

    <v-dialog v-model="aberto" max-width="420">
      <v-card>
        <v-card-title>Filtrar por período</v-card-title>
        <v-card-text>
          <div class="campos">
            <v-text-field
              v-model="inicio"
              density="comfortable"
              hide-details="auto"
              label="Data de início"
              type="date"
              variant="outlined"
            />
            <v-text-field
              v-model="fim"
              density="comfortable"
              hide-details="auto"
              label="Data de fim"
              type="date"
              variant="outlined"
            />
          </div>
          <div v-if="erro" class="erro">{{ erro }}</div>
        </v-card-text>
        <v-card-actions>
          <v-btn :disabled="!periodoAtivo" variant="text" @click="limpar">Limpar</v-btn>
          <v-spacer />
          <v-btn variant="text" @click="aberto = false">Cancelar</v-btn>
          <v-btn color="primary" variant="flat" @click="aplicar">Aplicar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, watch } from 'vue'
  import { useProjetoStore } from '@/stores/projeto'

  defineProps<{ disabled?: boolean }>()

  const store = useProjetoStore()
  const aberto = ref(false)
  const inicio = ref<string | null>(store.filtroDataInicio)
  const fim = ref<string | null>(store.filtroDataFim)
  const erro = ref<string | null>(null)

  const periodoAtivo = computed(() => !!(store.filtroDataInicio || store.filtroDataFim))

  const labelPeriodo = computed(() => {
    const i = store.filtroDataInicio ? formatar(store.filtroDataInicio) : '…'
    const f = store.filtroDataFim ? formatar(store.filtroDataFim) : '…'
    return `${i} → ${f}`
  })

  function formatar (iso: string) {
    const [y, m, d] = iso.split('-')
    return `${d}/${m}/${y}`
  }

  // mant\u00e9m os campos em sincronia quando a store \u00e9 atualizada externamente (ex.: reset)
  watch(() => [store.filtroDataInicio, store.filtroDataFim], ([i, f]) => {
    inicio.value = i
    fim.value = f
  })

  function abrir () {
    erro.value = null
    inicio.value = store.filtroDataInicio
    fim.value = store.filtroDataFim
    aberto.value = true
  }

  async function aplicar () {
    if (inicio.value && fim.value && inicio.value > fim.value) {
      erro.value = 'A data de início deve ser anterior ou igual à data de fim.'
      return
    }
    await store.aplicarPeriodo(inicio.value || null, fim.value || null)
    aberto.value = false
  }

  async function limpar () {
    inicio.value = null
    fim.value = null
    await store.aplicarPeriodo(null, null)
    aberto.value = false
  }
</script>

<style scoped>
.filtro-periodo {
  display: inline-flex;
}

.campos {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.erro {
  color: #DC2626;
  font-size: 13px;
  margin-top: 8px;
}
</style>
