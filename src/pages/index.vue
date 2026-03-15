<template>
  <div>
    <div v-for="(demo, i) in demoList" :key="i">
      Demo {{ i }}: {{ demo.text }}
    </div>
  </div>
</template>

<script lang="ts" setup>
  import axios from 'axios'
  import { onMounted, ref } from 'vue'
  import { apiUrl } from '@/utils/api'
  type Demo = {
    text: string
  }

  const demoList = ref<Demo[]>([])
  onMounted(async () => {
    console.log(apiUrl('/demo'))
    const response = await axios.get(apiUrl('/demo/'))
    demoList.value = response.data
  })
</script>
