<template>
  <div class="chart-wrapper">
    <canvas ref="canvasRef" />
  </div>
</template>

<script setup lang="ts">
  import { Chart } from 'chart.js'
  import { ref, shallowRef, watch } from 'vue'
  import { useProjetoStore } from '@/stores/projeto'

  const store = useProjetoStore()
  const canvasRef = ref<HTMLCanvasElement | null>(null)

  const chartInstance = shallowRef<null | Chart>(null)

  function buildChart () {
    if (!canvasRef.value) return
    if (store.burnupHoras.length === 0) {
      if (chartInstance.value) {
        chartInstance.value.data.labels = []
        chartInstance.value.data.datasets = []
        chartInstance.value.update()
      }
      return
    }

    if (chartInstance.value) {
      chartInstance.value.destroy()
      chartInstance.value = null
    }

    const labels = Array.from(
      new Set(
        store.burnupHoras.flatMap(projeto =>
          projeto.serie.map(ponto => ponto.mes),
        ),
      ),
      // eslint-disable-next-line unicorn/no-array-sort
    ).sort((a, b) => {
      const [mesA, anoA] = a.split('/').map(Number)
      const [mesB, anoB] = b.split('/').map(Number)
      return anoA === anoB ? mesA - mesB : anoA - anoB
    })

    const projects: any = {}

    for (const projeto of store.burnupHoras) {
      projects[projeto.projeto] = {
        label: projeto.projeto,
        data: Array.from({ length: labels.length }).fill(null),
        spanGaps: true,
      }

      for (const ponto of projeto.serie) {
        const index = labels.indexOf(ponto.mes)

        if (index !== -1) {
          projects[projeto.projeto].data[index] = Number(ponto.horas_acumuladas)
        }
      }
    }

    const datasets = Object.values(projects) as any[]

    chartInstance.value = new Chart(canvasRef.value, {
      type: 'line',
      data: {
        labels,
        datasets,
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function (context: any) {
                const valor = Number(context.parsed.y ?? 0).toLocaleString('pt-BR', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 1,
                })

                return `${context.dataset.label}: ${valor}h acumuladas`
              },
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Mês',
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Horas investidas',
            },
          },
        },
      },
    })
  }

  watch(
    () => store.burnupHoras,
    () => {
      buildChart()
    },
    { deep: true },
  )
</script>

<style scoped>
.chart-wrapper {
  padding: 8px 16px 20px;
  height: 380px;
  width: 100%;
}
</style>
