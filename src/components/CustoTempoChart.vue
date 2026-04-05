<template>
  <div class="chart-wrapper">
    <canvas ref="canvasRef" />
  </div>
</template>

<script setup lang="ts">
  import { Chart } from 'chart.js'
  import { storeToRefs } from 'pinia'
  import { ref, shallowRef, watch } from 'vue'
  import { useProjetoStore } from '@/stores/projeto'

  const store = useProjetoStore()
  const { overviewData, projetoSelecionado } = storeToRefs(store)
  const canvasRef = ref<HTMLCanvasElement | null>(null)

  const chartInstance = shallowRef<null | Chart>(null)

  function buildChart (raw: any) {
    if (!canvasRef.value || !overviewData.value) return
    // get all months
    const labels = raw.map((item: any) => item.date_str)

    // get unique projects
    const projects: any = {}

    for (const [monthIndex, month] of raw.entries()) {
      for (const v of month.values) {
        if (!projects[v.codigo_projeto]) {
          projects[v.codigo_projeto] = {
            label: v.codigo_projeto,
            data: Array.from({ length: raw.length }).fill(null),
            spanGaps: true,
          }
        }

        projects[v.codigo_projeto].data[monthIndex] = v.cost
      }
    }

    const datasets = Object.values(projects)

    const chartData = {
      labels,
      datasets,
    }

    chartInstance.value = new Chart(canvasRef.value, {
      type: 'line',
      data: chartData,
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
                return `${context.dataset.label}: R$ ${context.parsed.y.toLocaleString()}`
              },
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Month',
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Cost (R$)',
            },
          },
        },
      },
    })
  }

  function updateChart () {
    if (!chartInstance.value) return
    for (const dataset of chartInstance.value.data.datasets) {
      const selected = projetoSelecionado.value?.codigo_projeto === dataset.label
      dataset.borderColor = selected ? '#2563EB' : undefined
      dataset.backgroundColor = selected ? '#2563EB' : undefined
      dataset.hoverBackgroundColor = selected ? '1D4ED8' : undefined
    }
    chartInstance.value.update()
  }

  watch([overviewData], () => {
    if (!overviewData.value) return
    buildChart(overviewData.value)
  })

  watch([projetoSelecionado], () => {
    if (!chartInstance.value) return
    updateChart()
  })

</script>

<style lang="scss" scoped>
.chart-wrapper {
  padding: 8px 16px 20px;
  height: 380px;
}
</style>
