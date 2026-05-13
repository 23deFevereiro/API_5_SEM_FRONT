import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

export function useBarChart (
  source: () => unknown[],
  getLabels: () => string[],
  getData: () => number[],
) {
  const canvasRef = ref<HTMLCanvasElement | null>(null)
  let chartInstance: Chart | null = null

  const zeroBarPlugin = {
    id: 'zeroBarIndicator',
    afterDatasetsDraw (chart: Chart) {
      const { ctx, data } = chart
      const dataset = data.datasets[0]
      const meta = chart.getDatasetMeta(0)

      for (const [index, bar] of meta.data.entries()) {
        const value = (dataset.data[index] as number) ?? 0
        const { x, y, width } = bar.getProps(['x', 'y', 'width'], true)

        if (value === 0) {
          const barH = 4
          const bx = x - width / 2
          const by = y - barH / 2

          ctx.save()
          ctx.fillStyle = '#E5E7EB'
          ctx.beginPath()
          ctx.roundRect(bx, by, width, barH, 3)
          ctx.fill()

          ctx.fillStyle = '#9CA3AF'
          ctx.font = '10px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'bottom'
          ctx.fillText('0h', x, by - 2)
          ctx.restore()
        } else {
          ctx.save()
          ctx.fillStyle = '#374151'
          ctx.font = 'bold 11px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'bottom'
          ctx.fillText(`${value.toFixed(1)}h`, x, y - 4)
          ctx.restore()
        }
      }
    },
  }

  function build () {
    if (!canvasRef.value) {
      return
    }

    if (chartInstance) {
      chartInstance.destroy()
      chartInstance = null
    }

    const data = getData()
    const backgroundColor = data.map(v => v === 0 ? '#E5E7EB' : '#2563EB')
    const hoverBackgroundColor = data.map(v => v === 0 ? '#D1D5DB' : '#1D4ED8')

    chartInstance = new Chart(canvasRef.value, {
      type: 'bar',
      data: {
        labels: getLabels(),
        datasets: [
          {
            label: 'Horas',
            data,
            backgroundColor,
            borderRadius: 6,
            borderSkipped: false,
            hoverBackgroundColor,
          },
        ],
      },
      plugins: [zeroBarPlugin],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ctx.parsed.y === 0 ? ' Sem horas registradas' : ` ${ctx.parsed.y?.toFixed(1)}h`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: '#6B7280',
              font: { size: 12 },
              autoSkip: false,
              maxRotation: 45,
              minRotation: 45,
              callback (val) {
                const label = (this as { getLabelForValue: (v: unknown) => string }).getLabelForValue(val)
                return label.length > 14 ? `${label.slice(0, 13)}…` : label
              },
            },
          },
          y: {
            beginAtZero: true,
            grid: { color: '#F3F4F6' },
            ticks: {
              color: '#6B7280',
              font: { size: 12 },
              callback: val => `${val}h`,
            },
          },
        },
        layout: {
          padding: { top: 20 },
        },
      },
    })
  }

  watch(
    source,
    async novoValor => {
      if (novoValor.length > 0) {
        await nextTick()
        build()
      } else if (chartInstance) {
        chartInstance.destroy()
        chartInstance = null
      }
    },
  )

  onMounted(() => {
    if (source().length > 0) {
      build()
    }
  })

  onBeforeUnmount(() => {
    if (chartInstance) {
      chartInstance.destroy()
    }
  })

  return { canvasRef }
}
